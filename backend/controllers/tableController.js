const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Get all tables (1 - 10)
 * GET /api/tables
 */
const getAllTables = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, 
              (SELECT COUNT(*) FROM orders o 
               WHERE o.table_id = t.id AND o.status NOT IN ('completed', 'cancelled')) AS active_orders_count
       FROM restaurant_tables t
       ORDER BY t.table_number ASC`
    );

    return successResponse(res, 200, "Restaurant tables retrieved successfully", rows);
  } catch (err) {
    console.error("Error in getAllTables:", err);
    return errorResponse(res, 500, "Failed to retrieve tables", err);
  }
};

/**
 * Get single table by ID or table_number
 * GET /api/tables/:id
 */
const getTableById = async (req, res) => {
  try {
    const identifier = req.params.id;

    // Check by ID or table_number
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_tables WHERE id = ? OR table_number = ? LIMIT 1",
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, `Restaurant table #${identifier} not found`);
    }

    const table = rows[0];

    // Fetch active order on this table if occupied
    const [activeOrders] = await pool.query(
      `SELECT id, order_number, status, total_amount, created_at 
       FROM orders 
       WHERE table_id = ? AND status NOT IN ('completed', 'cancelled')
       ORDER BY id DESC LIMIT 1`,
      [table.id]
    );

    return successResponse(res, 200, "Table retrieved successfully", {
      ...table,
      active_order: activeOrders.length > 0 ? activeOrders[0] : null
    });
  } catch (err) {
    console.error("Error in getTableById:", err);
    return errorResponse(res, 500, "Failed to retrieve table", err);
  }
};

/**
 * Update table status (Admin or Kitchen)
 * PATCH /api/tables/:id/status
 */
const updateTableStatus = async (req, res) => {
  try {
    const identifier = req.params.id;
    const { status } = req.body;

    if (!["available", "occupied"].includes(status)) {
      return errorResponse(res, 400, "Status must be either 'available' or 'occupied'");
    }

    const [rows] = await pool.query(
      "SELECT * FROM restaurant_tables WHERE id = ? OR table_number = ? LIMIT 1",
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, "Table not found");
    }

    const table = rows[0];

    await pool.query("UPDATE restaurant_tables SET status = ? WHERE id = ?", [status, table.id]);

    return successResponse(res, 200, `Table #${table.table_number} status updated to '${status}'`, {
      id: table.id,
      table_number: table.table_number,
      status
    });
  } catch (err) {
    console.error("Error in updateTableStatus:", err);
    return errorResponse(res, 500, "Failed to update table status", err);
  }
};

module.exports = {
  getAllTables,
  getTableById,
  updateTableStatus
};
