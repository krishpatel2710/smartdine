const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Get dashboard overview metrics
 * GET /api/analytics/dashboard
 */
const getDashboardMetrics = async (req, res) => {
  try {
    // 1. Total Orders
    const [totalRows] = await pool.query(
      "SELECT COUNT(*) AS total_orders FROM orders"
    );
    const total_orders = totalRows[0]?.total_orders || 0;

    // 2. Today's Orders
    const [todayRows] = await pool.query(
      "SELECT COUNT(*) AS today_orders FROM orders WHERE DATE(created_at) = CURDATE()"
    );
    const today_orders = todayRows[0]?.today_orders || 0;

    // 3. Today's Revenue
    const [revRows] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS today_revenue FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'"
    );
    const today_revenue = revRows[0]?.today_revenue || 0;

    // 4. Pending / Active Orders
    const [pendingRows] = await pool.query(
      "SELECT COUNT(*) AS pending_orders FROM orders WHERE status IN ('placed', 'accepted', 'preparing')"
    );
    const pending_orders = pendingRows[0]?.pending_orders || 0;

    // 5. Completed Orders
    const [compRows] = await pool.query(
      "SELECT COUNT(*) AS completed_orders FROM orders WHERE status = 'completed'"
    );
    const completed_orders = compRows[0]?.completed_orders || 0;

    // 6. Cancelled Orders
    const [cancelRows] = await pool.query(
      "SELECT COUNT(*) AS cancelled_orders FROM orders WHERE status = 'cancelled'"
    );
    const cancelled_orders = cancelRows[0]?.cancelled_orders || 0;

    // 7. Total Customers
    const [custRows] = await pool.query(
      "SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'"
    );
    const total_customers = custRows[0]?.total_customers || 0;

    // 8. Overall total revenue
    const [totRevRows] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status != 'cancelled'"
    );
    const total_revenue = totRevRows[0]?.total_revenue || 0;

    return successResponse(res, 200, "Dashboard metrics retrieved successfully", {
      total_orders: Number(total_orders),
      today_orders: Number(today_orders),
      today_revenue: parseFloat(today_revenue),
      pending_orders: Number(pending_orders),
      completed_orders: Number(completed_orders),
      cancelled_orders: Number(cancelled_orders),
      total_customers: Number(total_customers),
      total_revenue: parseFloat(total_revenue)
    });
  } catch (err) {
    console.error("Error in getDashboardMetrics:", err);
    return errorResponse(res, 500, "Failed to retrieve dashboard metrics", err);
  }
};

/**
 * Get top selling foods
 * GET /api/analytics/top-foods
 */
const getTopFoods = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.id, f.name, f.category, f.price, f.image, f.rating,
              COALESCE(SUM(oi.quantity), 0) AS total_sold,
              COALESCE(SUM(oi.quantity * oi.price), 0) AS total_revenue
       FROM foods f
       LEFT JOIN order_items oi ON f.id = oi.food_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
       GROUP BY f.id, f.name, f.category, f.price, f.image, f.rating
       ORDER BY total_sold DESC, total_revenue DESC
       LIMIT 6`
    );

    const formatted = rows.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: parseFloat(item.price),
      image: item.image,
      rating: parseFloat(item.rating),
      sales: Number(item.total_sold),
      revenue: parseFloat(item.total_revenue)
    }));

    return successResponse(res, 200, "Top foods retrieved successfully", formatted);
  } catch (err) {
    console.error("Error in getTopFoods:", err);
    return errorResponse(res, 500, "Failed to retrieve top foods", err);
  }
};

/**
 * Get revenue analytics (daily/weekly)
 * GET /api/analytics/revenue
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    // Last 7 days breakdown
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS order_date,
              DAYNAME(created_at) AS day_name,
              COUNT(*) AS total_orders,
              COALESCE(SUM(total_amount), 0) AS daily_revenue
       FROM orders
       WHERE status != 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at), DAYNAME(created_at)
       ORDER BY DATE(created_at) ASC`
    );

    // Safely format rows with null checks
    const formatted = (rows || []).map((r) => ({
      date: r.order_date || r.date || new Date().toISOString().split("T")[0],
      day: String(r.day_name || r.day || "Mon").slice(0, 3),
      orders: Number(r.total_orders || r.orders || 0),
      revenue: parseFloat(r.daily_revenue || r.revenue || 0)
    }));

    return successResponse(res, 200, "Revenue analytics retrieved successfully", formatted);
  } catch (err) {
    console.error("Error in getRevenueAnalytics:", err);
    return errorResponse(res, 500, "Failed to retrieve revenue analytics", err);
  }
};

module.exports = {
  getDashboardMetrics,
  getTopFoods,
  getRevenueAnalytics
};
