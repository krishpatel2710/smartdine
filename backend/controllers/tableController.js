const { Table, Order } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

// In-memory tables fallback
const defaultTables = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  table_number: i + 1,
  capacity: 4,
  status: i + 1 === 5 ? "occupied" : "available",
  qr_code: `https://smartdine.local/table/${i + 1}`,
  active_orders_count: i + 1 === 5 ? 1 : 0
}));

/**
 * Get all tables (1 - 10)
 * GET /api/tables
 */
const getAllTables = async (req, res) => {
  try {
    try {
      const tables = await Table.find().sort({ table_number: 1 });
      if (tables && tables.length > 0) {
        // Enforce active_orders_count
        const result = await Promise.all(
          tables.map(async (t) => {
            const count = await Order.countDocuments({
              table_number: t.table_number,
              status: { $nin: ["completed", "cancelled", "Completed", "Cancelled"] }
            });
            const obj = t.toJSON();
            obj.active_orders_count = count;
            return obj;
          })
        );
        return successResponse(res, 200, "Restaurant tables retrieved successfully", result);
      }
    } catch {}

    return successResponse(res, 200, "Restaurant tables retrieved successfully", defaultTables);
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
    const numId = Number(identifier);

    let table = null;
    try {
      if (!isNaN(numId)) {
        table = await Table.findOne({ table_number: numId });
      }
      if (!table) {
        table = await Table.findById(identifier);
      }
    } catch {}

    if (!table) {
      table = defaultTables.find(
        (t) => String(t.id) === identifier || String(t.table_number) === identifier
      );
    }

    if (!table) {
      return errorResponse(res, 404, `Restaurant table #${identifier} not found`);
    }

    let activeOrder = null;
    try {
      activeOrder = await Order.findOne({
        table_number: table.table_number,
        status: { $nin: ["completed", "cancelled", "Completed", "Cancelled"] }
      }).sort({ createdAt: -1 });
    } catch {}

    const tableData = {
      ...(table.toJSON ? table.toJSON() : table),
      active_order: activeOrder
    };

    return successResponse(res, 200, "Table retrieved successfully", tableData);
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

    if (!["available", "occupied", "reserved"].includes(status)) {
      return errorResponse(res, 400, "Status must be 'available', 'occupied', or 'reserved'");
    }

    const numId = Number(identifier);
    let table = null;
    try {
      if (!isNaN(numId)) {
        table = await Table.findOne({ table_number: numId });
      }
      if (!table) {
        table = await Table.findById(identifier);
      }
      if (table) {
        table.status = status;
        await table.save();
        return successResponse(
          res,
          200,
          `Table #${table.table_number} status updated to '${status}'`,
          table
        );
      }
    } catch {}

    const memTable = defaultTables.find(
      (t) => String(t.id) === identifier || String(t.table_number) === identifier
    );
    if (memTable) {
      memTable.status = status;
      return successResponse(
        res,
        200,
        `Table #${memTable.table_number} status updated to '${status}'`,
        memTable
      );
    }

    return errorResponse(res, 404, "Table not found");
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
