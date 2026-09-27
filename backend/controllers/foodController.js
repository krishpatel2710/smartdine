const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Get all foods
 * GET /api/foods
 * Query params: category, search, available (true/false)
 */
const getAllFoods = async (req, res) => {
  try {
    const { category, search, available } = req.query;

    let query = "SELECT * FROM foods WHERE 1=1";
    const params = [];

    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (available !== undefined) {
      query += " AND is_available = ?";
      params.push(available === "true" || available === "1" ? 1 : 0);
    }

    query += " ORDER BY id ASC";

    const [rows] = await pool.query(query, params);

    return successResponse(res, 200, "Food items retrieved successfully", rows);
  } catch (err) {
    console.error("Error in getAllFoods:", err);
    return errorResponse(res, 500, "Failed to retrieve food items", err);
  }
};

/**
 * Get single food by ID with reviews
 * GET /api/foods/:id
 */
const getFoodById = async (req, res) => {
  try {
    const foodId = req.params.id;

    const [foodRows] = await pool.query("SELECT * FROM foods WHERE id = ?", [foodId]);

    if (foodRows.length === 0) {
      return errorResponse(res, 404, "Food item not found");
    }

    // Get reviews for this food
    const [reviewRows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.food_id = ?
       ORDER BY r.created_at DESC`,
      [foodId]
    );

    const foodData = {
      ...foodRows[0],
      reviews: reviewRows
    };

    return successResponse(res, 200, "Food item retrieved successfully", foodData);
  } catch (err) {
    console.error("Error in getFoodById:", err);
    return errorResponse(res, 500, "Failed to retrieve food item", err);
  }
};

/**
 * Add a new food item (Admin only)
 * POST /api/foods
 */
const createFood = async (req, res) => {
  try {
    const { name, category, description, price, image, rating, is_available } = req.body;

    if (!name || !category || price === undefined) {
      return errorResponse(res, 400, "Please provide food name, category, and price");
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return errorResponse(res, 400, "Price must be a valid positive number");
    }

    const foodRating = rating ? parseFloat(rating) : 4.5;
    const available = is_available !== undefined ? (is_available ? 1 : 0) : 1;

    const [result] = await pool.query(
      `INSERT INTO foods (name, category, description, price, image, rating, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category.trim(),
        description ? description.trim() : "",
        numPrice,
        image || "/images/smartdine-hero-feast.jpg",
        foodRating,
        available
      ]
    );

    const newFood = {
      id: result.insertId,
      name: name.trim(),
      category: category.trim(),
      description: description || "",
      price: numPrice,
      image: image || "/images/smartdine-hero-feast.jpg",
      rating: foodRating,
      is_available: Boolean(available)
    };

    return successResponse(res, 201, "Food item created successfully", newFood);
  } catch (err) {
    console.error("Error in createFood:", err);
    return errorResponse(res, 500, "Failed to create food item", err);
  }
};

/**
 * Update an existing food item (Admin only)
 * PUT /api/foods/:id
 */
const updateFood = async (req, res) => {
  try {
    const foodId = req.params.id;
    const { name, category, description, price, image, rating, is_available } = req.body;

    // Check if food exists
    const [existing] = await pool.query("SELECT * FROM foods WHERE id = ?", [foodId]);
    if (existing.length === 0) {
      return errorResponse(res, 404, "Food item not found");
    }

    const current = existing[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedCategory = category !== undefined ? category.trim() : current.category;
    const updatedDescription = description !== undefined ? description.trim() : current.description;
    const updatedPrice = price !== undefined ? parseFloat(price) : current.price;
    const updatedImage = image !== undefined ? image : current.image;
    const updatedRating = rating !== undefined ? parseFloat(rating) : current.rating;
    const updatedAvailable = is_available !== undefined ? (is_available ? 1 : 0) : current.is_available;

    await pool.query(
      `UPDATE foods
       SET name = ?, category = ?, description = ?, price = ?, image = ?, rating = ?, is_available = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedCategory,
        updatedDescription,
        updatedPrice,
        updatedImage,
        updatedRating,
        updatedAvailable,
        foodId
      ]
    );

    const updatedFood = {
      id: Number(foodId),
      name: updatedName,
      category: updatedCategory,
      description: updatedDescription,
      price: updatedPrice,
      image: updatedImage,
      rating: updatedRating,
      is_available: Boolean(updatedAvailable)
    };

    return successResponse(res, 200, "Food item updated successfully", updatedFood);
  } catch (err) {
    console.error("Error in updateFood:", err);
    return errorResponse(res, 500, "Failed to update food item", err);
  }
};

/**
 * Delete a food item (Admin only)
 * DELETE /api/foods/:id
 */
const deleteFood = async (req, res) => {
  try {
    const foodId = req.params.id;

    // Check if food exists
    const [existing] = await pool.query("SELECT id FROM foods WHERE id = ?", [foodId]);
    if (existing.length === 0) {
      return errorResponse(res, 404, "Food item not found");
    }

    // Check if food item has been ordered before
    const [ordered] = await pool.query(
      "SELECT id FROM order_items WHERE food_id = ? LIMIT 1",
      [foodId]
    );

    if (ordered.length > 0) {
      // Soft-delete to preserve order history integrity
      await pool.query("UPDATE foods SET is_available = 0 WHERE id = ?", [foodId]);
      return successResponse(
        res,
        200,
        "Food item is referenced in previous orders. Marked as unavailable instead of deleting permanently."
      );
    }

    await pool.query("DELETE FROM foods WHERE id = ?", [foodId]);
    return successResponse(res, 200, "Food item deleted permanently");
  } catch (err) {
    console.error("Error in deleteFood:", err);
    return errorResponse(res, 500, "Failed to delete food item", err);
  }
};

/**
 * Change food availability (Admin only)
 * PATCH /api/foods/:id/availability
 */
const updateAvailability = async (req, res) => {
  try {
    const foodId = req.params.id;
    const { is_available } = req.body;

    const [existing] = await pool.query("SELECT * FROM foods WHERE id = ?", [foodId]);
    if (existing.length === 0) {
      return errorResponse(res, 404, "Food item not found");
    }

    const current = existing[0];
    const newStatus = is_available !== undefined ? (is_available ? 1 : 0) : (current.is_available ? 0 : 1);

    await pool.query("UPDATE foods SET is_available = ? WHERE id = ?", [newStatus, foodId]);

    return successResponse(res, 200, "Food availability updated successfully", {
      id: Number(foodId),
      is_available: Boolean(newStatus)
    });
  } catch (err) {
    console.error("Error in updateAvailability:", err);
    return errorResponse(res, 500, "Failed to update food availability", err);
  }
};

/**
 * Get all categories
 * GET /api/categories
 */
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    return successResponse(res, 200, "Categories retrieved successfully", rows);
  } catch (err) {
    console.error("Error in getCategories:", err);
    return errorResponse(res, 500, "Failed to retrieve categories", err);
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  updateAvailability,
  getCategories
};
