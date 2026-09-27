const express = require("express");
const router = express.Router();
const {
  getAllTables,
  getTableById,
  updateTableStatus
} = require("../controllers/tableController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// Public routes for viewing tables (or table QR verification)
router.get("/", getAllTables);
router.get("/:id", getTableById);

// Admin or Kitchen can update table status (support both PUT and PATCH)
router.put("/:id/status", protect, restrictTo("admin", "kitchen"), updateTableStatus);
router.patch("/:id/status", protect, restrictTo("admin", "kitchen"), updateTableStatus);

module.exports = router;
