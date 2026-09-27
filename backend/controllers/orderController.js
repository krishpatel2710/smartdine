const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const { generateOrderNumber } = require("../utils/orderNumber");

/**
 * Valid state transitions for order flow
 */
const VALID_TRANSITIONS = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["completed"],
  completed: [],
  cancelled: []
};

/**
 * Helper to fetch full order details including items
 */
const fetchOrderWithItems = async (orderIdOrNumber, connection = null) => {
  const conn = connection || pool;
  const isNumeric = /^\d+$/.test(orderIdOrNumber);

  const [orders] = await conn.query(
    `SELECT o.*, 
            u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
            t.table_number, t.status as table_status
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN restaurant_tables t ON o.table_id = t.id
     WHERE ${isNumeric ? "o.id = ?" : "o.order_number = ?"}`,
    [orderIdOrNumber]
  );

  if (orders.length === 0) return null;

  const order = orders[0];

  const [items] = await conn.query(
    `SELECT oi.id, oi.food_id, oi.quantity, oi.price, 
            f.name, f.category, f.image, f.description
     FROM order_items oi
     JOIN foods f ON oi.food_id = f.id
     WHERE oi.order_id = ?`,
    [order.id]
  );

  return {
    ...order,
    delivery_address: order.delivery_address || "",
    customer: {
      name: order.customer_name || "Guest Customer",
      email: order.customer_email || "",
      phone: order.customer_phone || "",
      mobile: order.customer_phone || "",
      address: order.delivery_address || (order.table_number ? `Restaurant Dine-In Table ${order.table_number}` : "")
    },
    items
  };
};

/**
 * Create a new order (Customer or Guest)
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  let connection;
  try {
    const {
      items,
      order_type,
      orderType: clientOrderType,
      table_id,
      table_number,
      tableNumber,
      tableNo,
      delivery_address,
      deliveryAddress,
      address,
      customer_info,
      customer
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, "Order must contain at least one item");
    }

    const clientCustomer = customer_info || customer || {};
    const matchedTableNumber = table_number || tableNumber || tableNo || req.body.tableNo;
    const isDineIn =
      order_type === "dine_in" ||
      clientOrderType === "Dine-In" ||
      clientOrderType === "dine_in" ||
      Boolean(matchedTableNumber);
    const orderType = isDineIn ? "dine_in" : "delivery";

    const finalAddress =
      delivery_address ||
      deliveryAddress ||
      address ||
      clientCustomer.address ||
      (isDineIn ? `Restaurant Dine-In Table ${matchedTableNumber || "QR"}` : "Standard Express Delivery, Amroli, Surat");

    // Resolve or automatically link user ID
    let userId = req.user ? req.user.id : null;
    const custName = clientCustomer.name || req.body.customerName || req.body.name || "Guest Customer";
    const custEmail = clientCustomer.email || req.body.customerEmail || req.body.email || `guest_${Date.now()}@smartdine.local`;
    const custPhone = clientCustomer.mobile || clientCustomer.phone || req.body.customerPhone || req.body.mobile || "9876543210";

    if (!userId) {
      try {
        const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ?", [custEmail]);
        if (existingUsers.length > 0) {
          userId = existingUsers[0].id;
        } else {
          const [newUser] = await pool.query(
            "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
            [custName, custEmail, "guest123", custPhone, "customer"]
          );
          userId = newUser.insertId;
        }
      } catch (uErr) {
        console.warn("Guest user lookup/creation note:", uErr.message);
      }
    }

    // Start transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Resolve Table if dine-in
    let resolvedTableId = null;
    if (orderType === "dine_in") {
      const tableQueryId = table_id || matchedTableNumber;
      if (tableQueryId) {
        const [tables] = await connection.query(
          "SELECT id, table_number, status FROM restaurant_tables WHERE id = ? OR table_number = ? LIMIT 1",
          [tableQueryId, tableQueryId]
        );
        if (tables.length > 0) {
          resolvedTableId = tables[0].id;
        }
      }
    }

    // 2. Validate items and recalculate price using database records (NEVER TRUST CLIENT TOTAL)
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const foodId = item.menu_item_id || item.food_id || item.id;
      const quantity = parseInt(item.quantity, 10);

      if (!foodId || isNaN(quantity) || quantity <= 0) {
        await connection.rollback();
        connection.release();
        return errorResponse(res, 400, "Invalid item ID or quantity");
      }

      // Query database for current accurate price & availability
      const [foodRows] = await connection.query(
        "SELECT id, name, price, is_available FROM foods WHERE id = ?",
        [foodId]
      );

      if (foodRows.length === 0) {
        await connection.rollback();
        connection.release();
        return errorResponse(res, 400, `Food item #${foodId} does not exist`);
      }

      const food = foodRows[0];
      if (!food.is_available) {
        await connection.rollback();
        connection.release();
        return errorResponse(res, 400, `'${food.name}' is currently out of stock`);
      }

      const itemPrice = parseFloat(food.price);
      calculatedTotal += itemPrice * quantity;

      validatedItems.push({
        food_id: food.id,
        quantity,
        price: itemPrice
      });
    }

    // 3. Generate sequential order number
    const orderNumber = await generateOrderNumber(connection);

    // 4. Insert into orders table
    const [orderResult] = await connection.query(
      `INSERT INTO orders (order_number, user_id, table_id, order_type, total_amount, status, delivery_address)
       VALUES (?, ?, ?, ?, ?, 'placed', ?)`,
      [
        orderNumber,
        userId,
        resolvedTableId,
        orderType,
        calculatedTotal.toFixed(2),
        finalAddress
      ]
    );

    const insertedOrderId = orderResult.insertId;

    // 5. Insert order items
    for (const item of validatedItems) {
      await connection.query(
        "INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)",
        [insertedOrderId, item.food_id, item.quantity, item.price]
      );
    }

    // 6. If dine-in, mark restaurant table as occupied
    if (orderType === "dine_in" && resolvedTableId) {
      await connection.query(
        "UPDATE restaurant_tables SET status = 'occupied' WHERE id = ?",
        [resolvedTableId]
      );
    }

    // Commit transaction
    await connection.commit();

    // Fetch the complete created order
    const createdOrder = await fetchOrderWithItems(insertedOrderId, connection);
    connection.release();

    return successResponse(res, 201, "Order placed successfully", createdOrder);
  } catch (err) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Error in createOrder:", err);
    return errorResponse(res, 500, "Failed to create order", err);
  }
};

/**
 * Get all orders (Admin: all orders, Kitchen: active orders)
 * GET /api/orders
 */
const getAllOrders = async (req, res) => {
  try {
    const { status, order_type, search } = req.query;

    let query = `
      SELECT o.*, 
             u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
             t.table_number
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN restaurant_tables t ON o.table_id = t.id
      WHERE 1=1
    `;
    const params = [];

    // Role filtering: kitchen only sees active orders
    if (req.user && req.user.role === "kitchen") {
      query += " AND o.status NOT IN ('completed', 'cancelled')";
    } else if (status && status !== "all") {
      query += " AND o.status = ?";
      params.push(status.toLowerCase());
    }

    if (order_type && order_type !== "all") {
      query += " AND o.order_type = ?";
      params.push(order_type.toLowerCase());
    }

    if (search) {
      query += " AND (o.order_number LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY o.created_at DESC";

    const [orders] = await pool.query(query, params);

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          `SELECT oi.id, oi.food_id, oi.quantity, oi.price, 
                  f.name, f.category, f.image
           FROM order_items oi
           JOIN foods f ON oi.food_id = f.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        return {
          ...order,
          items
        };
      })
    );

    return successResponse(res, 200, "Orders retrieved successfully", ordersWithItems);
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    return errorResponse(res, 500, "Failed to retrieve orders", err);
  }
};

/**
 * Get current customer's order history
 * GET /api/orders/my-orders
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT o.*, t.table_number
       FROM orders o
       LEFT JOIN restaurant_tables t ON o.table_id = t.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          `SELECT oi.id, oi.food_id, oi.quantity, oi.price, 
                  f.name, f.category, f.image
           FROM order_items oi
           JOIN foods f ON oi.food_id = f.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        return {
          ...order,
          items
        };
      })
    );

    return successResponse(res, 200, "Customer orders retrieved successfully", ordersWithItems);
  } catch (err) {
    console.error("Error in getMyOrders:", err);
    return errorResponse(res, 500, "Failed to retrieve your orders", err);
  }
};

/**
 * Get single order by ID or order_number
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const orderIdentifier = req.params.id;
    const order = await fetchOrderWithItems(orderIdentifier);

    if (!order) {
      return errorResponse(res, 404, `Order '${orderIdentifier}' not found`);
    }

    // Role check: Customer can only view their own order
    if (req.user && req.user.role === "customer") {
      if (order.user_id && order.user_id !== req.user.id) {
        return errorResponse(res, 403, "Forbidden: You are not authorized to view this order");
      }
    }

    return successResponse(res, 200, "Order retrieved successfully", order);
  } catch (err) {
    console.error("Error in getOrderById:", err);
    return errorResponse(res, 500, "Failed to retrieve order", err);
  }
};

/**
 * Update order status (Admin or Kitchen)
 * PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderIdentifier = req.params.id;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 400, "Please provide new status");
    }

    const targetStatus = status.toLowerCase();
    const validStatuses = ["placed", "accepted", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(targetStatus)) {
      return errorResponse(
        res,
        400,
        `Invalid status. Allowed values: [${validStatuses.join(", ")}]`
      );
    }

    // Get current order
    const isNumeric = /^\d+$/.test(orderIdentifier);
    const [rows] = await pool.query(
      `SELECT * FROM orders WHERE ${isNumeric ? "id = ?" : "order_number = ?"}`,
      [orderIdentifier]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, "Order not found");
    }

    const currentOrder = rows[0];
    const currentStatus = currentOrder.status;

    // Validate status transition
    // Admin can override any status; kitchen must follow valid flow
    const userRole = req.user ? req.user.role : "admin";
    if (userRole !== "admin") {
      const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(targetStatus)) {
        return errorResponse(
          res,
          400,
          `Invalid status transition: Cannot change from '${currentStatus}' to '${targetStatus}'. Allowed: [${allowedNext.join(", ")}]`
        );
      }
    }

    // Update order status
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [targetStatus, currentOrder.id]);

    // If order completed or cancelled and has a table, check if table can be freed
    if ((targetStatus === "completed" || targetStatus === "cancelled") && currentOrder.table_id) {
      // Check if any other active orders exist on this table
      const [otherActive] = await pool.query(
        "SELECT id FROM orders WHERE table_id = ? AND id != ? AND status NOT IN ('completed', 'cancelled')",
        [currentOrder.table_id, currentOrder.id]
      );

      if (otherActive.length === 0) {
        await pool.query(
          "UPDATE restaurant_tables SET status = 'available' WHERE id = ?",
          [currentOrder.table_id]
        );
      }
    }

    const updatedOrder = await fetchOrderWithItems(currentOrder.id);

    return successResponse(
      res,
      200,
      `Order #${currentOrder.order_number} status updated to '${targetStatus}'`,
      updatedOrder
    );
  } catch (err) {
    console.error("Error in updateOrderStatus:", err);
    return errorResponse(res, 500, "Failed to update order status", err);
  }
};

/**
 * Kitchen: Get active orders
 * GET /api/kitchen/orders
 */
const getKitchenOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, 
              u.name as customer_name, u.phone as customer_phone,
              t.table_number
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN restaurant_tables t ON o.table_id = t.id
       WHERE o.status NOT IN ('completed', 'cancelled')
       ORDER BY o.created_at ASC`
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          `SELECT oi.id, oi.food_id, oi.quantity, oi.price, 
                  f.name, f.category, f.image
           FROM order_items oi
           JOIN foods f ON oi.food_id = f.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        return {
          ...order,
          items
        };
      })
    );

    return successResponse(res, 200, "Active kitchen orders retrieved successfully", ordersWithItems);
  } catch (err) {
    console.error("Error in getKitchenOrders:", err);
    return errorResponse(res, 500, "Failed to retrieve kitchen orders", err);
  }
};

/**
 * Kitchen: Accept order
 * PATCH /api/kitchen/orders/:id/accept
 */
const acceptKitchenOrder = async (req, res) => {
  req.body.status = "accepted";
  return updateOrderStatus(req, res);
};

/**
 * Kitchen: Mark order as preparing
 * PATCH /api/kitchen/orders/:id/preparing
 */
const preparingKitchenOrder = async (req, res) => {
  req.body.status = "preparing";
  return updateOrderStatus(req, res);
};

/**
 * Kitchen: Mark order as ready
 * PATCH /api/kitchen/orders/:id/ready
 */
const readyKitchenOrder = async (req, res) => {
  req.body.status = "ready";
  return updateOrderStatus(req, res);
};

/**
 * Kitchen: Mark order as completed
 * PATCH /api/kitchen/orders/:id/complete
 */
const completeKitchenOrder = async (req, res) => {
  req.body.status = "completed";
  return updateOrderStatus(req, res);
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getKitchenOrders,
  acceptKitchenOrder,
  preparingKitchenOrder,
  readyKitchenOrder,
  completeKitchenOrder
};
