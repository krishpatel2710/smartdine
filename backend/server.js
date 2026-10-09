const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Import Routes
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const foodRoutes = require("./routes/foodRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tableRoutes = require("./routes/tableRoutes");
const orderRoutes = require("./routes/orderRoutes");
const kitchenRoutes = require("./routes/kitchenRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Import Middleware
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const connectDB = require("./config/db");

// Connect to MongoDB Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in local development
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (for dev visibility)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Root API Health Check (Section 5)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SmartDine API is running"
  });
});

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/foods", foodRoutes); // Backwards compatibility for existing components
app.use("/api/categories", categoryRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes); // Gemini AI Food Assistant & Recommendations
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve Frontend Static Assets in Production
const fs = require("fs");
const distPath = path.join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  console.log(`📦 Serving production frontend build from: ${distPath}`);
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Centralized 404 & Error Handling for API routes
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log("\n=======================================================");
  console.log(`🚀 SmartDine Backend API is running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Gemini AI Routes: http://localhost:${PORT}/api/ai/chat`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`);
  console.log("=======================================================\n");
});

module.exports = app;
