const express = require("express");
const router = express.Router();
const {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  updateAvailability
} = require("../controllers/foodController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getAllFoods);
router.get("/:id", getFoodById);

// Admin-only routes
router.post("/", protect, restrictTo("admin"), createFood);
router.put("/:id", protect, restrictTo("admin"), updateFood);
router.delete("/:id", protect, restrictTo("admin"), deleteFood);
router.patch("/:id/availability", protect, restrictTo("admin"), updateAvailability);

module.exports = router;
