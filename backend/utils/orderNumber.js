const pool = require("../config/db");

/**
 * Generate a unique sequential order number like SD1026
 */
const generateOrderNumber = async (connection = null) => {
  const conn = connection || pool;
  try {
    const [rows] = await conn.query(
      "SELECT order_number FROM orders WHERE order_number LIKE 'SD%'"
    );

    if (rows && rows.length > 0) {
      let maxNum = 1025;
      for (const row of rows) {
        const match = (row.order_number || "").match(/SD(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      return `SD${maxNum + 1}`;
    }

    // Default base offset if no orders found
    return "SD1026";
  } catch (err) {
    // Fallback timestamp-based code
    return `SD${Date.now().toString().slice(-4)}`;
  }
};

module.exports = {
  generateOrderNumber
};
