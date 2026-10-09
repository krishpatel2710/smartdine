const { Order, Food, User, Table } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");
const { generateOrderNumber } = require("../utils/orderNumber");

// In-memory fallback for orders
const memoryOrders = [
  {
    id: "1",
    order_number: "SD1021",
    table_number: 3,
    table_no: 3,
    order_type: "dine_in",
    total_amount: 348.00,
    total: 348.00,
    status: "placed",
    payment_method: "upi",
    delivery_address: "Restaurant Dine-In Table 3",
    customer: { name: "Sneha Nair", email: "customer@smartdine.com", phone: "+91 9876543210", mobile: "+91 9876543210", address: "Table 3, SmartDine" },
    items: [
      { id: "1", food_id: 1, name: "Margherita Pizza", price: 149.00, quantity: 1 },
      { id: "2", food_id: 2, name: "Cheese Burst Pizza", price: 199.00, quantity: 1 }
    ],
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    id: "2",
    order_number: "SD1022",
    table_number: null,
    table_no: null,
    order_type: "delivery",
    total_amount: 428.00,
    total: 428.00,
    status: "ready",
    payment_method: "online",
    delivery_address: "Flat 402, Riverview Heights, Amroli, Surat, Gujarat - 394107",
    customer: { name: "Sneha Nair", email: "customer@smartdine.com", phone: "+91 9876543210", mobile: "+91 9876543210", address: "Flat 402, Riverview Heights, Amroli, Surat, Gujarat - 394107" },
    items: [
      { id: "3", food_id: 9, name: "Paneer Butter Masala", price: 219.00, quantity: 1 },
      { id: "4", food_id: 10, name: "Royal Hyderabadi Veg Biryani", price: 149.00, quantity: 1 }
    ],
    createdAt: new Date(Date.now() - 1800000)
  }
];

/**
 * Format order document for API response consistency
 */
const formatOrder = (order) => {
  const o = order.toJSON ? order.toJSON() : { ...order };
  o.id = o.id || (order._id ? order._id.toString() : o.order_number);
  o.total = o.total_amount || o.total;
  o.table_no = o.table_number || o.table_id || null;
  o.delivery_address = o.delivery_address || o.customer?.address || "";
  if (!o.customer) {
    o.customer = {
      name: o.customer_name || "Guest Customer",
      email: o.customer_email || "",
      phone: o.customer_phone || "",
      mobile: o.customer_phone || "",
      address: o.delivery_address || ""
    };
  }
  return o;
};

/**
 * Create a new order (Customer or Guest)
 * POST /api/orders
 */
const createOrder = async (req, res) => {
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
      customer,
      payment_method,
      paymentMethod
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

    const resolvedOrderType = isDineIn ? "dine_in" : "delivery";

    const finalAddress =
      delivery_address ||
      deliveryAddress ||
      address ||
      clientCustomer.address ||
      (isDineIn
        ? `Restaurant Dine-In Table ${matchedTableNumber || "QR"}`
        : "Standard Express Delivery, Amroli, Surat");

    const custName = clientCustomer.name || req.body.customerName || req.body.name || (req.user ? req.user.name : "Guest Customer");
    const custEmail = clientCustomer.email || req.body.customerEmail || req.body.email || (req.user ? req.user.email : "");
    const custPhone = clientCustomer.mobile || clientCustomer.phone || req.body.customerPhone || req.body.mobile || "9876543210";

    const customerObj = {
      name: custName,
      email: custEmail,
      phone: custPhone,
      mobile: custPhone,
      address: finalAddress
    };

    // Calculate items & totals safely
    let totalAmount = 0;
    const formattedItems = [];

    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity || 1));
      let price = Number(item.price || 0);
      const name = item.name || "Special Dish";

      totalAmount += price * qty;
      formattedItems.push({
        name,
        price,
        quantity: qty
      });
    }

    // Add tax and delivery fee
    const tax = Math.round(totalAmount * 0.05);
    const deliveryFee = resolvedOrderType === "delivery" ? 30 : 0;
    const grandTotal = totalAmount + tax + deliveryFee;

    const orderNumber = generateOrderNumber();

    const orderData = {
      order_number: orderNumber,
      order_type: resolvedOrderType,
      table_number: isDineIn ? Number(matchedTableNumber) || 1 : null,
      table_id: isDineIn ? Number(matchedTableNumber) || 1 : null,
      total_amount: grandTotal,
      total: grandTotal,
      status: "placed",
      payment_method: payment_method || paymentMethod || "upi",
      payment_status: "completed",
      delivery_address: finalAddress,
      customer: customerObj,
      customer_name: custName,
      customer_phone: custPhone,
      customer_email: custEmail,
      items: formattedItems
    };

    try {
      const newOrder = await Order.create(orderData);
      return successResponse(res, 201, "Order created successfully", formatOrder(newOrder));
    } catch (dbErr) {
      // Memory fallback if MongoDB offline
      const memOrder = {
        id: `ord-${Date.now()}`,
        ...orderData,
        createdAt: new Date()
      };
      memoryOrders.unshift(memOrder);
      return successResponse(res, 201, "Order created successfully", formatOrder(memOrder));
    }
  } catch (err) {
    console.error("Error in createOrder:", err);
    return errorResponse(res, 500, "Failed to create order", err);
  }
};

/**
 * Get all orders (Admin / Staff)
 * GET /api/orders
 */
const getAllOrders = async (req, res) => {
  try {
    const { status, order_type } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = new RegExp(`^${status}$`, "i");
    }
    if (order_type && order_type !== "all") {
      filter.order_type = order_type;
    }

    try {
      const orders = await Order.find(filter).sort({ createdAt: -1 });
      if (orders && orders.length > 0) {
        return successResponse(res, 200, "Orders retrieved successfully", orders.map(formatOrder));
      }
    } catch {}

    let list = [...memoryOrders];
    if (status && status !== "all") {
      list = list.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }
    return successResponse(res, 200, "Orders retrieved successfully", list.map(formatOrder));
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    return errorResponse(res, 500, "Failed to retrieve orders", err);
  }
};

/**
 * Get single order by ID or order_number
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const idParam = req.params.id;

    let order = null;
    try {
      order = await Order.findOne({
        $or: [{ order_number: idParam }, { _id: idParam }]
      });
    } catch {
      try {
        order = await Order.findOne({ order_number: idParam });
      } catch {}
    }

    if (!order) {
      order = memoryOrders.find(
        (o) => o.id === idParam || o.order_number === idParam || String(o.id) === String(idParam)
      );
    }

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    return successResponse(res, 200, "Order retrieved successfully", formatOrder(order));
  } catch (err) {
    console.error("Error in getOrderById:", err);
    return errorResponse(res, 500, "Failed to retrieve order", err);
  }
};

/**
 * Update order status
 * PUT /api/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const idParam = req.params.id;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 400, "Status is required");
    }

    try {
      let order = await Order.findOne({
        $or: [{ order_number: idParam }, { _id: idParam }]
      });
      if (order) {
        order.status = status;
        await order.save();
        return successResponse(res, 200, `Order status updated to '${status}'`, formatOrder(order));
      }
    } catch {}

    const memOrder = memoryOrders.find(
      (o) => o.id === idParam || o.order_number === idParam || String(o.id) === String(idParam)
    );
    if (memOrder) {
      memOrder.status = status;
      return successResponse(res, 200, `Order status updated to '${status}'`, formatOrder(memOrder));
    }

    return errorResponse(res, 404, "Order not found");
  } catch (err) {
    console.error("Error in updateOrderStatus:", err);
    return errorResponse(res, 500, "Failed to update order status", err);
  }
};

/**
 * Get current customer's orders
 * GET /api/orders/user/me
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    try {
      const orders = await Order.find({
        $or: [{ user: userId }, { "customer.email": userEmail }]
      }).sort({ createdAt: -1 });

      if (orders && orders.length > 0) {
        return successResponse(res, 200, "User orders retrieved successfully", orders.map(formatOrder));
      }
    } catch {}

    return successResponse(res, 200, "User orders retrieved successfully", memoryOrders.map(formatOrder));
  } catch (err) {
    console.error("Error in getUserOrders:", err);
    return errorResponse(res, 500, "Failed to retrieve user orders", err);
  }
};

/**
 * Kitchen display queue
 * GET /api/kitchen/orders
 */
const getKitchenOrders = async (req, res) => {
  try {
    const kitchenStatuses = [
      "placed", "pending", "accepted", "preparing", "ready",
      "Placed", "Pending", "Accepted", "Preparing", "Ready"
    ];

    try {
      const orders = await Order.find({
        status: { $in: kitchenStatuses }
      }).sort({ createdAt: 1 });

      if (orders && orders.length > 0) {
        return successResponse(res, 200, "Kitchen queue retrieved successfully", orders.map(formatOrder));
      }
    } catch {}

    const memKitchen = memoryOrders.filter((o) =>
      kitchenStatuses.map((s) => s.toLowerCase()).includes(o.status.toLowerCase())
    );
    return successResponse(res, 200, "Kitchen queue retrieved successfully", memKitchen.map(formatOrder));
  } catch (err) {
    console.error("Error in getKitchenOrders:", err);
    return errorResponse(res, 500, "Failed to retrieve kitchen queue", err);
  }
};

const acceptKitchenOrder = async (req, res) => {
  req.body.status = "accepted";
  return updateOrderStatus(req, res);
};

const preparingKitchenOrder = async (req, res) => {
  req.body.status = "preparing";
  return updateOrderStatus(req, res);
};

const readyKitchenOrder = async (req, res) => {
  req.body.status = "ready";
  return updateOrderStatus(req, res);
};

const completeKitchenOrder = async (req, res) => {
  req.body.status = "completed";
  return updateOrderStatus(req, res);
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  getMyOrders: getUserOrders,
  getKitchenOrders,
  acceptKitchenOrder,
  preparingKitchenOrder,
  readyKitchenOrder,
  completeKitchenOrder
};
