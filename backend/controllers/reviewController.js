const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Add a review for a food item (Customer only)
 * POST /api/reviews
 * Rule: Only customers who have completed an order containing that food can review it
 */
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { food_id, rating, comment } = req.body;

    if (!food_id || !rating) {
      return errorResponse(res, 400, "Please provide food_id and a rating between 1 and 5");
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return errorResponse(res, 400, "Rating must be an integer between 1 and 5");
    }

    // Verify food exists
    const [foodRows] = await pool.query("SELECT id, name FROM foods WHERE id = ?", [food_id]);
    if (foodRows.length === 0) {
      return errorResponse(res, 404, "Food item not found");
    }
    const food = foodRows[0];

    // Verify user has completed an order containing this food
    const [verifiedOrders] = await pool.query(
      `SELECT o.id as order_id 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.food_id = ? AND o.status = 'completed'
       LIMIT 1`,
      [userId, food_id]
    );

    if (verifiedOrders.length === 0) {
      return errorResponse(
        res,
        403,
        `You can only review '${food.name}' after you have placed and completed an order containing this dish.`
      );
    }

    const completedOrderId = verifiedOrders[0].order_id;

    // Check if user already reviewed this food
    const [existingReview] = await pool.query(
      "SELECT id FROM reviews WHERE user_id = ? AND food_id = ? LIMIT 1",
      [userId, food_id]
    );

    let reviewId;
    if (existingReview.length > 0) {
      // Update existing review
      reviewId = existingReview[0].id;
      await pool.query(
        "UPDATE reviews SET rating = ?, comment = ?, order_id = ?, created_at = NOW() WHERE id = ?",
        [numRating, comment ? comment.trim() : "", completedOrderId, reviewId]
      );
    } else {
      // Insert new review
      const [insertResult] = await pool.query(
        `INSERT INTO reviews (user_id, food_id, order_id, rating, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, food_id, completedOrderId, numRating, comment ? comment.trim() : ""]
      );
      reviewId = insertResult.insertId;
    }

    // Recalculate average rating on foods table
    const [avgRows] = await pool.query(
      "SELECT AVG(rating) as avg_rating FROM reviews WHERE food_id = ?",
      [food_id]
    );

    if (avgRows.length > 0 && avgRows[0].avg_rating) {
      const newAvgRating = parseFloat(avgRows[0].avg_rating).toFixed(1);
      await pool.query("UPDATE foods SET rating = ? WHERE id = ?", [newAvgRating, food_id]);
    }

    return successResponse(res, 201, `Thank you for reviewing '${food.name}'!`, {
      id: reviewId,
      food_id,
      rating: numRating,
      comment: comment || "",
      user_name: req.user.name
    });
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

    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.food_id = ?
       ORDER BY r.created_at DESC`,
      [foodId]
    );

    return successResponse(res, 200, "Reviews retrieved successfully", reviews);
  } catch (err) {
    console.error("Error in getFoodReviews:", err);
    return errorResponse(res, 500, "Failed to retrieve reviews", err);
  }
};

module.exports = {
  createReview,
  getFoodReviews
};
