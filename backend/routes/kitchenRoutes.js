const express = require("express");
const router = express.Router();
const {
  getKitchenOrders,
  acceptKitchenOrder,
  preparingKitchenOrder,
  readyKitchenOrder,
  completeKitchenOrder,
  updateOrderStatus
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// All kitchen routes require authentication with role 'kitchen' or 'admin'
router.use(protect, restrictTo("kitchen", "admin"));

// Get active kitchen queue
router.get("/orders", getKitchenOrders);

// Stage transitions
router.put("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/accept", acceptKitchenOrder);
router.patch("/orders/:id/preparing", preparingKitchenOrder);
router.patch("/orders/:id/ready", readyKitchenOrder);
router.patch("/orders/:id/complete", completeKitchenOrder);

module.exports = router;
