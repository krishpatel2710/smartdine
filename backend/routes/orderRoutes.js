const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require("../controllers/orderController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// Customer specific order history (Must be placed before /:id to prevent matching 'my-orders' as id)
router.get("/my-orders", protect, getMyOrders);

// Order creation (logged-in user or guest with optional token)
router.post("/", optionalAuth, createOrder);

// All orders (Admin or Kitchen)
router.get("/", protect, restrictTo("admin", "kitchen"), getAllOrders);

// Single order tracking / details (accessible by owner, admin, or kitchen)
router.get("/:id", optionalAuth, getOrderById);

// Update status (Admin or Kitchen) - support both PUT and PATCH
router.put("/:id/status", protect, restrictTo("admin", "kitchen"), updateOrderStatus);
router.patch("/:id/status", protect, restrictTo("admin", "kitchen"), updateOrderStatus);

module.exports = router;
