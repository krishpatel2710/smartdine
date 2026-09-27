const express = require("express");
const router = express.Router();
const {
  getDashboardMetrics,
  getTopFoods,
  getRevenueAnalytics
} = require("../controllers/analyticsController");
const { optionalAuth } = require("../middleware/authMiddleware");

// Allow analytics to be viewed by authenticated admins and demo evaluators
router.use(optionalAuth);

router.get("/dashboard", getDashboardMetrics);
router.get("/top-foods", getTopFoods);
router.get("/revenue", getRevenueAnalytics);

module.exports = router;
