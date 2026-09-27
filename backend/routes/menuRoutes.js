const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// Public routes for customers
// Supports /api/menu?category=Pizza and /api/menu?search=burger
router.get("/", menuController.getMenu);
router.get("/:id", menuController.getMenuItem);

// Admin-only management routes
router.post("/", protect, restrictTo("admin"), menuController.createMenuItem);
router.put("/:id", protect, restrictTo("admin"), menuController.updateMenuItem);
router.delete("/:id", protect, restrictTo("admin"), menuController.deleteMenuItem);

module.exports = router;
