const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * GET /api/admin/dashboard
 * Summary stats using real MySQL data
 */
exports.getDashboard = async (req, res) => {
  try {
    // 1. Total Orders
    const [totalOrdersRows] = await pool.query("SELECT COUNT(*) AS count FROM orders");
    const totalOrders = totalOrdersRows[0]?.count || 0;

    // 2. Today's Orders
    const [todayOrdersRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM orders WHERE DATE(created_at) = CURDATE()"
    );
    const todayOrders = todayOrdersRows[0]?.count || 0;

    // 3. Today's & Total Revenue
    const [todayRevRows] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS rev FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'"
    );
    const todayRevenue = parseFloat(todayRevRows[0]?.rev || 0);

    const [totalRevRows] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS rev FROM orders WHERE status != 'cancelled'"
    );
    const totalRevenue = parseFloat(totalRevRows[0]?.rev || 0);

    // 4. Pending Orders
    const [pendingRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM orders WHERE status IN ('placed', 'accepted', 'preparing')"
    );
    const pendingOrders = pendingRows[0]?.count || 0;

    // 5. Completed Orders
    const [compRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM orders WHERE status = 'completed'"
    );
    const completedOrders = compRows[0]?.count || 0;

    // 6. Total Customers
    const [custRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'customer'"
    );
    const totalCustomers = custRows[0]?.count || 0;

    // 7. Available Menu Items
    let availableMenuItems = 0;
    try {
      const [menuRows] = await pool.query(
        "SELECT COUNT(*) AS count FROM menu_items WHERE available = 1"
      );
      availableMenuItems = menuRows[0]?.count || 0;
    } catch {
      const [foodRows] = await pool.query(
        "SELECT COUNT(*) AS count FROM foods WHERE is_available = 1"
      );
      availableMenuItems = foodRows[0]?.count || 0;
    }

    return successResponse(res, 200, "Admin dashboard statistics retrieved successfully", {
      total_orders: Number(totalOrders),
      today_orders: Number(todayOrders),
      today_revenue: todayRevenue,
      total_revenue: totalRevenue,
      pending_orders: Number(pendingOrders),
      completed_orders: Number(completedOrders),
      total_customers: Number(totalCustomers),
      available_menu_items: Number(availableMenuItems)
    });
  } catch (err) {
    console.error("[Admin Dashboard Error]:", err);
    return errorResponse(res, 500, "Failed to retrieve dashboard statistics", err);
  }
};

/**
 * GET /api/admin/orders
 * All orders with customer and item details
 */
exports.getAdminOrders = async (req, res) => {
  try {
    const { status, search } = req.query;

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

    if (status && status !== "all") {
      query += " AND o.status = ?";
      params.push(status.toLowerCase());
    }

    if (search) {
      query += " AND (o.order_number LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY o.created_at DESC";

    const [orders] = await pool.query(query, params);

    return successResponse(res, 200, "Admin orders retrieved successfully", orders);
  } catch (err) {
    console.error("[Admin Orders Error]:", err);
    return errorResponse(res, 500, "Failed to retrieve orders", err);
  }
};

/**
 * GET /api/admin/users
 * Customer and staff user list
 */
exports.getAdminUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
              COUNT(o.id) as total_orders,
              COALESCE(SUM(o.total_amount), 0) as total_spent
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
       GROUP BY u.id, u.name, u.email, u.phone, u.role, u.created_at
       ORDER BY u.created_at DESC`
    );

    return successResponse(res, 200, "Users retrieved successfully", users);
  } catch (err) {
    console.error("[Admin Users Error]:", err);
    return errorResponse(res, 500, "Failed to retrieve users", err);
  }
};
