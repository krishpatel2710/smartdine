const express = require("express");
const router = express.Router();
const { getCategories } = require("../controllers/foodController");
const { Category } = require("../models");
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
    let existing = null;
    try {
      existing = await Category.findOne({ name: new RegExp(`^${trimmedName}$`, "i") });
    } catch {}

    if (existing) {
      return errorResponse(res, 400, "Category already exists");
    }

    let newCat = null;
    try {
      newCat = await Category.create({ name: trimmedName });
    } catch {
      newCat = { id: `cat-${Date.now()}`, name: trimmedName };
    }

    return successResponse(res, 201, "Category created successfully", newCat);
  } catch (err) {
    console.error("Error creating category:", err);
    return errorResponse(res, 500, "Failed to create category", err);
  }
});

module.exports = router;
