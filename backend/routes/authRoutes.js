const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (support both /me and /profile)
router.get("/me", protect, getMe);
router.get("/profile", protect, getMe);

module.exports = router;
