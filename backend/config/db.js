const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartdine";

// Do not buffer operations if MongoDB is offline so in-memory fallback responds instantly
mongoose.set("bufferCommands", false);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });

    isConnected = true;
    console.log(`\n🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed if database is freshly created
    try {
      const { Food, User } = require("../models");
      const foodCount = await Food.countDocuments();
      if (foodCount === 0) {
        console.log("🌱 Database is empty. Auto-seeding initial SmartDine dishes and users...");
        require("../scripts/seed");
      }
    } catch (seedErr) {
      console.warn("Auto-seed check note:", seedErr.message);
    }
  } catch (error) {
    console.warn("\n⚠️  MongoDB connection note:", error.message);
    console.log("👉 If MongoDB is not yet running locally, you can:");
    console.log("   1. Start MongoDB service / MongoDB Compass on mongodb://127.0.0.1:27017/smartdine");
    console.log("   2. Or set MONGODB_URI in backend/.env to your free MongoDB Atlas connection string.");
    console.log("⚡ Backend will continue running gracefully with in-memory documents.\n");
  }
};

module.exports = connectDB;
