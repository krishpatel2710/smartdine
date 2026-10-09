const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://krishpatel81852_db_user:Smartdine%40123@cluster0.dkjgkpq.mongodb.net/smartdine?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// 1. MONGODB MONGOOSE MODELS
// ==========================================

// Food Schema
const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  rating: { type: Number, default: 4.8 },
  image: { type: String, default: "" },
  is_available: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

const Food = mongoose.model("FoodItem", foodSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true },
  customer_name: { type: String, default: "Guest" },
  customer_phone: { type: String, default: "" },
  order_type: { type: String, default: "dine_in" }, // dine_in or delivery
  table_number: { type: Number, default: null },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  total_amount: { type: Number, required: true },
  status: { type: String, default: "placed" }, // placed, preparing, ready, completed
  created_at: { type: Date, default: Date.now }
});

const Order = mongoose.model("CustomerOrder", orderSchema);

// Fallback in-memory pure veg dishes
const initialFoods = [
  { name: "Margherita Pizza", category: "Pizza", price: 149, rating: 4.9, description: "Fresh mozzarella, Italian basil, San Marzano tomato sauce.", image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=60" },
  { name: "Paneer Makhani Pizza", category: "Pizza", price: 249, rating: 4.9, description: "Spiced paneer cubes, buttery makhani gravy on hand-stretched crust.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60" },
  { name: "Crispy Veg Burger", category: "Burger", price: 89, rating: 4.6, description: "Golden herb-potato patty, crunchy lettuce and creamy mayo.", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60" },
  { name: "Double Cheese Veg Burger", category: "Burger", price: 129, rating: 4.8, description: "Double veggie patty layered with molten cheddar cheese.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60" },
  { name: "Paneer Butter Masala", category: "Indian", price: 219, rating: 4.9, description: "Soft malai paneer simmered in velvety cashew-tomato gravy.", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { name: "Royal Hyderabadi Veg Biryani", category: "Indian", price: 149, rating: 4.8, description: "Aromatic basmati rice layered with garden vegetables and saffron.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { name: "Veg Hakka Noodles", category: "Chinese", price: 139, rating: 4.7, description: "Wok-tossed noodles with bell peppers, cabbage and scallions.", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },
  { name: "Mango Lassi", category: "Drinks", price: 69, rating: 4.8, description: "Hand-churned sweet yogurt blended with fresh Alphonso mango pulp.", image: "https://images.unsplash.com/photo-1553787499-6f9133860278?w=500&auto=format&fit=crop&q=60" },
  { name: "Sizzling Brownie with Ice Cream", category: "Desserts", price: 129, rating: 4.9, description: "Warm chocolate walnut brownie served on a hot skillet with ice cream.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60" }
];

let memoryOrders = [];
let isDbConnected = false;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(async () => {
    isDbConnected = true;
    console.log("🍃 Connected to MongoDB successfully!");
    
    // Seed initial food items if collection is empty
    const count = await Food.countDocuments();
    if (count === 0) {
      await Food.insertMany(initialFoods);
      console.log("🌱 Seeded initial 9 Pure Vegetarian dishes into MongoDB.");
    }
  })
  .catch((err) => {
    console.log("⚠️ MongoDB offline note:", err.message);
    console.log("⚡ Server running smoothly with in-memory catalog.");
  });

// ==========================================
// 2. REST API ENDPOINTS
// ==========================================

// GET all foods
app.get("/api/foods", async (req, res) => {
  try {
    if (isDbConnected) {
      const foods = await Food.find({});
      return res.json({ success: true, data: foods });
    }
    return res.json({ success: true, data: initialFoods.map((f, i) => ({ ...f, _id: `food-${i + 1}` })) });
  } catch (err) {
    return res.json({ success: true, data: initialFoods });
  }
});

// POST new order
let orderSeq = 1020;
app.post("/api/orders", async (req, res) => {
  try {
    const { customer_name, customer_phone, order_type, table_number, items, total_amount } = req.body;
    orderSeq += 1;
    const orderNumber = `SD${orderSeq}`;

    const orderData = {
      order_number: orderNumber,
      customer_name: customer_name || "Guest",
      customer_phone: customer_phone || "",
      order_type: order_type || "dine_in",
      table_number: table_number || null,
      items: items || [],
      total_amount: Number(total_amount) || 0,
      status: "placed"
    };

    if (isDbConnected) {
      const newOrder = await Order.create(orderData);
      return res.status(201).json({ success: true, message: "Order placed successfully in MongoDB!", data: newOrder });
    }

    const memOrder = { ...orderData, _id: `ord-${Date.now()}`, created_at: new Date() };
    memoryOrders.unshift(memOrder);
    return res.status(201).json({ success: true, message: "Order placed successfully!", data: memOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET all orders
app.get("/api/orders", async (req, res) => {
  try {
    if (isDbConnected) {
      const orders = await Order.find({}).sort({ created_at: -1 });
      return res.json({ success: true, data: orders });
    }
    return res.json({ success: true, data: memoryOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST AI Assistant Chat
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const q = (message || "").toLowerCase();

    // Smart food matcher based on actual restaurant menu
    let reply = "";
    if (q.includes("pizza")) {
      reply = "I recommend our **Paneer Makhani Pizza (₹249)** or classic **Margherita Pizza (₹149)**! Both are 100% Pure Veg and baked fresh.";
    } else if (q.includes("burger")) {
      reply = "Try our **Double Cheese Veg Burger (₹129)** or **Crispy Veg Burger (₹89)** with crispy herb patties.";
    } else if (q.includes("spicy") || q.includes("paneer")) {
      reply = "You will love our **Paneer Butter Masala (₹219)** with rich buttery gravy, or spicy **Veg Hakka Noodles (₹139)**!";
    } else if (q.includes("sweet") || q.includes("dessert") || q.includes("drink")) {
      reply = "For something refreshing, go for our chilled **Mango Lassi (₹69)** or **Sizzling Brownie with Ice Cream (₹129)**.";
    } else if (q.includes("under") || q.includes("budget") || q.includes("100") || q.includes("150")) {
      reply = "Within your budget, we have **Crispy Veg Burger (₹89)**, **Mango Lassi (₹69)**, and **Veg Hakka Noodles (₹139)**!";
    } else {
      reply = "Welcome to SmartDine! 🌿 All our dishes are 100% Pure Vegetarian. Try our chef special **Paneer Makhani Pizza** or **Royal Hyderabadi Biryani**.";
    }

    return res.json({ success: true, reply });
  } catch (err) {
    return res.status(500).json({ success: false, message: "AI Assistant error" });
  }
});

// Serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SmartDine Simple Server is running on: http://localhost:${PORT}`);
  console.log(`📂 Frontend: HTML, CSS & JavaScript (Vanilla)`);
  console.log(`🍃 Database: MongoDB (Mongoose)`);
  console.log(`======================================================\n`);
});
