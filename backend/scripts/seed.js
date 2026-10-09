const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { User, Food, Category, Table, Order } = require("../models");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartdine";

const categories = [
  { name: "Pizza", icon: "Pizza" },
  { name: "Burger", icon: "Sandwich" },
  { name: "Indian", icon: "Utensils" },
  { name: "Chinese", icon: "Soup" },
  { name: "Drinks", icon: "Coffee" },
  { name: "Desserts", icon: "Cake" }
];

const foods = [
  {
    name: "Margherita Pizza",
    category: "Pizza",
    description: "Classic hand-stretched crust topped with San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves.",
    price: 149.00,
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=700&q=80",
    rating: 4.8,
    is_available: true,
    available: true,
    best_seller: false
  },
  {
    name: "Cheese Burst Pizza",
    category: "Pizza",
    description: "Decadent crust oozing with molten cheddar and mozzarella, topped with herbs and extra cheese pull goodness.",
    price: 199.00,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",
    rating: 4.9,
    is_available: true,
    available: true,
    best_seller: true
  },
  {
    name: "Farmhouse Supreme Pizza",
    category: "Pizza",
    description: "Loaded with crunchy bell peppers, sweet corn, button mushrooms, black olives, red onions, and spiced mozzarella.",
    price: 229.00,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80",
    rating: 4.7,
    is_available: true,
    available: true,
    best_seller: false
  },
  {
    name: "Exotic Paneer Tikka Pizza",
    category: "Pizza",
    description: "Stone-baked crust loaded with marinated cottage cheese cubes, sweet paprika peppers, golden corn, and Italian herbs.",
    price: 249.00,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80",
    rating: 4.8,
    is_available: true,
    available: true,
    best_seller: true
  },
  {
    name: "Classic Crispy Veg Burger",
    category: "Burger",
    description: "Golden spiced potato-herb patty with crunchy iceberg lettuce, ripe tomatoes, and house vegan mayo in a toasted sesame bun.",
    price: 99.00,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    rating: 4.5,
    is_available: true,
    available: true,
    best_seller: false
  },
  {
    name: "Double Cheese Melt Burger",
    category: "Burger",
    description: "Thick seasoned vegetable patty with double cheddar melt, pickled gherkins, caramelized onions, and smoky BBQ drizzle.",
    price: 129.00,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80",
    rating: 4.8,
    is_available: true,
    available: true,
    best_seller: true
  },
  {
    name: "Tandoori Paneer Burger",
    category: "Burger",
    description: "Marinated grilled cottage cheese slab layered with mint mayo, red onion rings, and chaat masala relish.",
    price: 149.00,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80",
    rating: 4.7,
    is_available: true,
    available: true,
    best_seller: false
  },
  {
    name: "Dal Makhani & Butter Naan",
    category: "Indian",
    description: "Whole black lentils slow-cooked overnight with churned butter and dairy cream, served with 2 hot butter naans.",
    price: 199.00,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
    rating: 4.9,
    is_available: true,
    available: true,
    best_seller: true
  },
  {
    name: "Paneer Butter Masala",
    category: "Indian",
    description: "Velvety, sweet-savory tomato butter makhani gravy infused with kasuri methi and succulent fresh malai paneer cubes.",
    price: 219.00,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80",
    rating: 4.8,
    is_available: true,
    available: true,
    best_seller: true
  },
  {
    name: "Royal Hyderabadi Veg Biryani",
    category: "Indian",
    description: "Fragrant aged Basmati rice layered with garden veggies, saffron milk, caramelized onions, and served in an earthen handi with mint raita.",
    price: 149.00,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80",
    rating: 4.9,
    is_available: true,
    available: true,
    best_seller: true
  },
  {
    name: "Tandoori Paneer Tikka",
    category: "Indian",
    description: "Char-grilled cottage cheese cubes marinated in Kashmiri red chilies, mustard oil, and hung curd, served with fresh mint chutney.",
    price: 179.00,
    image: "/images/tandoori-paneer-tikka.jpg",
    rating: 4.9,
    is_available: true,
    available: true,
    best_seller: true
  },
  {
    name: "Hakka Veg Noodles",
    category: "Chinese",
    description: "Wok-tossed noodles with shredded cabbage, crunchy carrots, capsicum, scallions, and light garlic-soy glaze.",
    price: 139.00,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80",
    rating: 4.6,
    is_available: true,
    available: true,
    best_seller: false
  },
  {
    name: "Veg Manchurian Gravy",
    category: "Chinese",
    description: "Crispy minced vegetable balls simmered in a dark, zesty ginger-garlic and cilantro-scented Manchurian sauce.",
    price: 159.00,
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=700&q=80",
    rating: 4.7,
    is_available: true,
    available: true,
    best_seller: false
  },
  {
    name: "Cold Coffee with Chocolate",
    category: "Drinks",
    description: "Chilled creamy Arabica espresso blended with rich chocolate fudge and topped with a scoop of vanilla ice cream.",
    price: 89.00,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80",
    rating: 4.8,
    is_available: true,
    available: true,
    best_seller: true
  },
  {
    name: "Sizzling Choco Lava Brownie",
    category: "Desserts",
    description: "Warm fudgy cocoa brownie served on a smoking sizzler plate with melted Belgian chocolate and vanilla bean gelato.",
    price: 99.00,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80",
    rating: 4.9,
    is_available: true,
    available: true,
    best_seller: true
  }
];

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✓ Connected to MongoDB successfully.");

    // Clear existing collections
    console.log("Cleaning old data...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Food.deleteMany({});
    await Table.deleteMany({});
    await Order.deleteMany({});

    // 1. Seed Users
    console.log("Seeding Users...");
    const adminUser = await User.create({
      name: "Krish Patel (Owner)",
      email: "admin@smartdine.com",
      password: "Admin123",
      phone: "+91 9106993883",
      role: "admin"
    });

    const kitchenUser = await User.create({
      name: "Head Chef Mario",
      email: "kitchen@smartdine.com",
      password: "Kitchen123",
      phone: "+91 9106993884",
      role: "kitchen"
    });

    const customerUser = await User.create({
      name: "Sneha Nair",
      email: "customer@smartdine.com",
      password: "Customer123",
      phone: "+91 9876543210",
      role: "customer"
    });

    // 2. Seed Categories
    console.log("Seeding Categories...");
    await Category.insertMany(categories);

    // 3. Seed Foods
    console.log("Seeding Foods...");
    const createdFoods = await Food.insertMany(foods);

    // 4. Seed Tables
    console.log("Seeding Tables...");
    const tableDocs = Array.from({ length: 10 }, (_, i) => ({
      table_number: i + 1,
      capacity: 4,
      status: i + 1 === 5 ? "occupied" : "available",
      qr_code: `https://smartdine.local/table/${i + 1}`
    }));
    await Table.insertMany(tableDocs);

    // 5. Seed Initial Orders
    console.log("Seeding Orders...");
    const sampleOrders = [
      {
        order_number: "SD1021",
        user: customerUser._id,
        table_number: 3,
        order_type: "dine_in",
        total_amount: 348.00,
        total: 348.00,
        status: "placed",
        payment_method: "upi",
        customer: {
          name: customerUser.name,
          email: customerUser.email,
          phone: customerUser.phone,
          address: "Table 3, SmartDine"
        },
        items: [
          { food: createdFoods[0]._id, name: createdFoods[0].name, price: createdFoods[0].price, quantity: 1 },
          { food: createdFoods[1]._id, name: createdFoods[1].name, price: createdFoods[1].price, quantity: 1 }
        ]
      },
      {
        order_number: "SD1022",
        user: customerUser._id,
        table_number: null,
        order_type: "delivery",
        total_amount: 428.00,
        total: 428.00,
        status: "ready",
        payment_method: "online",
        delivery_address: "Flat 402, Riverview Heights, Amroli, Surat, Gujarat - 394107",
        customer: {
          name: "Sneha Nair",
          email: "customer@smartdine.com",
          phone: "+91 9876543210",
          mobile: "+91 9876543210",
          address: "Flat 402, Riverview Heights, Amroli, Surat, Gujarat - 394107"
        },
        items: [
          { food: createdFoods[8]._id, name: createdFoods[8].name, price: createdFoods[8].price, quantity: 1 },
          { food: createdFoods[9]._id, name: createdFoods[9].name, price: createdFoods[9].price, quantity: 1 }
        ]
      }
    ];
    await Order.insertMany(sampleOrders);

    console.log("\n=======================================================");
    console.log("🎉 MongoDB Seeding Complete!");
    console.log(`- Users: 3 (Admin: admin@smartdine.com / Admin123)`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Dishes (100% Pure Veg): ${createdFoods.length}`);
    console.log(`- Tables: 10`);
    console.log(`- Orders: ${sampleOrders.length}`);
    console.log("=======================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err.message);
    process.exit(1);
  }
}

seedDatabase();
