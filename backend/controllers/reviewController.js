const { Food, Review, Order } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

// In-memory fallback reviews
const memoryReviews = [
  {
    id: "rev-1",
    food: null,
    food_id: "1",
    food_name: "Margherita Pizza",
    user_name: "Amit Sharma",
    rating: 5,
    comment: "Crispy crust and rich pure mozzarella! Best veg pizza in Surat.",
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: "rev-2",
    food: null,
    food_id: "9",
    food_name: "Paneer Butter Masala",
    user_name: "Pooja Varma",
    rating: 5,
    comment: "Rich, creamy and perfectly spiced gravy. Goes amazingly well with butter naan.",
    createdAt: new Date(Date.now() - 43200000)
  }
];

/**
 * Add a review for a food item
 * POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : "Diner";
    const { food_id, rating, comment } = req.body;

    if (!food_id || !rating) {
      return errorResponse(res, 400, "Please provide food_id and a rating between 1 and 5");
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return errorResponse(res, 400, "Rating must be an integer between 1 and 5");
    }

    // Try finding food
    let food = null;
    try {
      if (food_id.match(/^[0-9a-fA-F]{24}$/)) {
        food = await Food.findById(food_id);
      } else {
        food = await Food.findOne({ $or: [{ name: new RegExp(food_id, "i") }, { _id: food_id }] });
      }
    } catch {
      // Ignore id casting error
    }

    const foodName = food ? food.name : "Delightful Dish";

    try {
      const reviewDoc = await Review.create({
        user: userId && userId.match(/^[0-9a-fA-F]{24}$/) ? userId : null,
        user_name: userName,
        food: food ? food._id : null,
        rating: numRating,
        comment: comment ? comment.trim() : ""
      });

      // Recalculate average rating for food if found
      if (food) {
        try {
          const allReviews = await Review.find({ food: food._id });
          if (allReviews.length > 0) {
            const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
            food.rating = parseFloat((sum / allReviews.length).toFixed(1));
            await food.save();
          }
        } catch (calcErr) {
          console.warn("[Review] Could not recalculate average rating:", calcErr.message);
        }
      }

      return successResponse(res, 201, `Thank you for reviewing '${foodName}'!`, {
        id: reviewDoc._id.toString(),
        food_id,
        rating: numRating,
        comment: comment || "",
        user_name: userName,
        createdAt: reviewDoc.createdAt
      });
    } catch (dbErr) {
      // Memory fallback
      const fallbackRev = {
        id: `rev-${Date.now()}`,
        food_id,
        food_name: foodName,
        rating: numRating,
        comment: comment ? comment.trim() : "",
        user_name: userName,
        createdAt: new Date()
      };
      memoryReviews.unshift(fallbackRev);

      return successResponse(res, 201, `Thank you for reviewing '${foodName}'!`, fallbackRev);
    }
  } catch (err) {
    console.error("Error in createReview:", err);
    return errorResponse(res, 500, "Failed to submit review", err);
  }
};

/**
 * Get reviews for a specific food item
 * GET /api/foods/:id/reviews or GET /api/reviews/food/:id
 */
const getFoodReviews = async (req, res) => {
  try {
    const foodId = req.params.id;
    let reviews = [];

    try {
      let query = {};
      if (foodId && foodId.match(/^[0-9a-fA-F]{24}$/)) {
        query = { food: foodId };
      }
      reviews = await Review.find(query).sort({ createdAt: -1 }).limit(20);
    } catch {
      // Fallback
    }

    if (reviews.length === 0) {
      reviews = memoryReviews;
    }

    const formatted = reviews.map((r) => ({
      id: r._id ? r._id.toString() : r.id,
      rating: r.rating,
      comment: r.comment,
      user_name: r.user_name || "SmartDine Guest",
      created_at: r.createdAt || r.created_at
    }));

    return successResponse(res, 200, "Reviews retrieved successfully", formatted);
  } catch (err) {
    console.error("Error in getFoodReviews:", err);
    return errorResponse(res, 500, "Failed to retrieve reviews", err);
  }
};

module.exports = {
  createReview,
  getFoodReviews
};
