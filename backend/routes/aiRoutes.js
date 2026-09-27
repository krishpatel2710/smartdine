const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// POST /api/ai/chat
router.post("/chat", aiController.chat);

// POST /api/ai/recommend
router.post("/recommend", aiController.recommend);

module.exports = router;
