const express = require("express");
const router = express.Router();
const { getCategories } = require("../controllers/foodController");
const pool = require("../config/db");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const { successResponse, errorResponse } = require("../utils/response");

// Public: Get all categories
router.get("/", getCategories);

// Admin: Add new category
router.post("/", protect, restrictTo("admin"), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return errorResponse(res, 400, "Category name is required");
    }

    const trimmedName = name.trim();
    const [existing] = await pool.query("SELECT id FROM categories WHERE name = ?", [trimmedName]);
    if (existing.length > 0) {
      return errorResponse(res, 400, "Category already exists");
    }

    const [result] = await pool.query("INSERT INTO categories (name) VALUES (?)", [trimmedName]);

    return successResponse(res, 201, "Category created successfully", {
      id: result.insertId,
      name: trimmedName
    });
  } catch (err) {
    console.error("Error creating category:", err);
    return errorResponse(res, 500, "Failed to create category", err);
  }
});

module.exports = router;
