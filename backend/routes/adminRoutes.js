const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// All admin routes require authentication with role 'admin'
router.use(protect, restrictTo("admin"));

// GET /api/admin/dashboard
router.get("/dashboard", adminController.getDashboard);

// GET /api/admin/orders
router.get("/orders", adminController.getAdminOrders);

// GET /api/admin/users
router.get("/users", adminController.getAdminUsers);

module.exports = router;
