const express = require("express");
const router = express.Router();
const { createReview, getFoodReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Post review (customer must be logged in)
router.post("/", protect, createReview);

// Get reviews for a food
router.get("/food/:id", getFoodReviews);

module.exports = router;
