const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  multipleStatements: true
};

const DB_NAME = process.env.DB_NAME || "smartdine";

async function seedDatabase() {
  console.log("🌱 Starting SmartDine database initialization & seed...\n");

  let connection;
  try {
    // 1. Connect to MySQL server
    connection = await mysql.createConnection(DB_CONFIG);
    console.log(`✓ Connected to MySQL server at ${DB_CONFIG.host}:${DB_CONFIG.port}`);

    // 2. Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✓ Database '${DB_NAME}' created or verified.`);

    // Switch to database
    await connection.changeUser({ database: DB_NAME });

    // 3. Create Tables
    console.log("✓ Creating tables with constraints & indexes...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('customer', 'admin', 'kitchen') NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0.00,
        image VARCHAR(500),
        available BOOLEAN DEFAULT TRUE,
        best_seller BOOLEAN DEFAULT FALSE,
        rating DECIMAL(2,1) DEFAULT 4.5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_menu_category (category),
        INDEX idx_menu_available (available)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS foods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(500),
        rating DECIMAL(2,1) DEFAULT 4.5,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_foods_category (category),
        INDEX idx_foods_is_available (is_available)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_number INT NOT NULL UNIQUE,
        capacity INT DEFAULT 4,
        status ENUM('available', 'occupied') NOT NULL DEFAULT 'available',
        qr_code VARCHAR(255),
        INDEX idx_tables_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_number INT NOT NULL UNIQUE,
        qr_code VARCHAR(255),
        status ENUM('available', 'occupied') NOT NULL DEFAULT 'available',
        INDEX idx_tables_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT NULL,
        table_number INT NULL,
        table_id INT NULL,
        order_type ENUM('delivery', 'dine_in') NOT NULL DEFAULT 'delivery',
        total_amount DECIMAL(10,2) NOT NULL,
        order_status ENUM('placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'placed',
        status ENUM('placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'placed',
        payment_status ENUM('pending', 'paid') NOT NULL DEFAULT 'paid',
        delivery_address TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_orders_user (user_id),
        INDEX idx_orders_status (status),
        INDEX idx_orders_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        food_id INT NULL,
        menu_item_id INT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_items_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        food_id INT NULL,
        order_id INT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reviews_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Clean existing records if any
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("TRUNCATE TABLE reviews;");
    await connection.query("TRUNCATE TABLE order_items;");
    await connection.query("TRUNCATE TABLE orders;");
    await connection.query("TRUNCATE TABLE restaurant_tables;");
    await connection.query("TRUNCATE TABLE tables;");
    await connection.query("TRUNCATE TABLE menu_items;");
    await connection.query("TRUNCATE TABLE foods;");
    await connection.query("TRUNCATE TABLE categories;");
    await connection.query("TRUNCATE TABLE users;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

    // 4. Seed Users (Demo accounts from Section 20)
    console.log("✓ Seeding demo accounts (admin123, kitchen123, customer123)...");
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const kitchenPasswordHash = await bcrypt.hash("kitchen123", 10);
    const customerPasswordHash = await bcrypt.hash("customer123", 10);

    const usersData = [
      ["Krish Patel (Owner)", "admin@smartdine.com", adminPasswordHash, "9106993883", "admin"],
      ["Head Chef Mario", "kitchen@smartdine.com", kitchenPasswordHash, "9106993884", "kitchen"],
      ["Sneha Nair", "customer@smartdine.com", customerPasswordHash, "9876543210", "customer"],
      ["Priya Patel", "priya@smartdine.com", customerPasswordHash, "9876543211", "customer"],
      ["Amit Shah", "amit@smartdine.com", customerPasswordHash, "9876543212", "customer"]
    ];

    await connection.query(
      "INSERT INTO users (name, email, password, phone, role) VALUES ?",
      [usersData]
    );

    // 5. Seed Categories
    console.log("✓ Seeding 6 categories...");
    const categoriesData = [
      ["Pizza"],
      ["Burger"],
      ["Indian"],
      ["Chinese"],
      ["Drinks"],
      ["Desserts"]
    ];
    await connection.query("INSERT INTO categories (name) VALUES ?", [categoriesData]);

    // 6. Seed Restaurant Tables (10 tables)
    console.log("✓ Seeding 10 restaurant tables...");
    const tablesData = [];
    const restaurantTablesData = [];
    for (let i = 1; i <= 10; i++) {
      const status = i === 5 ? "occupied" : "available";
      tablesData.push([i, i, 4, status, `https://smartdine.local/table/${i}`]);
      restaurantTablesData.push([i, i, `https://smartdine.local/table/${i}`, status]);
    }
    await connection.query(
      "INSERT INTO tables (id, table_number, capacity, status, qr_code) VALUES ?",
      [tablesData]
    );
    await connection.query(
      "INSERT INTO restaurant_tables (id, table_number, qr_code, status) VALUES ?",
      [restaurantTablesData]
    );

    // 7. Seed 15 Food Items (100% Pure Vegetarian)
    console.log("✓ Seeding 15 pure vegetarian food items...");
    const foodsList = [
      {
        id: 1,
        name: "Margherita Pizza",
        category: "Pizza",
        description: "Classic hand-stretched crust topped with rich San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves.",
        price: 149.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=700&q=80",
        rating: 4.8,
        available: 1,
        best_seller: 1
      },
      {
        id: 2,
        name: "Cheese Burst Pizza",
        category: "Pizza",
        description: "Decadent crust oozing with molten cheddar and mozzarella, topped with Italian herbs and extra cheese pull goodness.",
        price: 199.00,
        discount: 20,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",
        rating: 4.9,
        available: 1,
        best_seller: 1
      },
      {
        id: 3,
        name: "Farmhouse Supreme Pizza",
        category: "Pizza",
        description: "Loaded with crunchy bell peppers, sweet corn, button mushrooms, black olives, red onions, and spiced mozzarella.",
        price: 229.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80",
        rating: 4.7,
        available: 1,
        best_seller: 0
      },
      {
        id: 4,
        name: "Exotic Paneer Tikka Pizza",
        category: "Pizza",
        description: "Stone-baked crust loaded with marinated cottage cheese cubes, sweet paprika peppers, golden corn, and Italian herbs.",
        price: 249.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80",
        rating: 4.8,
        available: 1,
        best_seller: 1
      },
      {
        id: 5,
        name: "Classic Crispy Veg Burger",
        category: "Burger",
        description: "Golden spiced potato-herb patty with crunchy iceberg lettuce, ripe tomatoes, and house vegan mayo in a toasted sesame bun.",
        price: 99.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
        rating: 4.5,
        available: 1,
        best_seller: 0
      },
      {
        id: 6,
        name: "Double Cheese Melt Burger",
        category: "Burger",
        description: "Thick seasoned vegetable patty with double cheddar melt, pickled gherkins, caramelized onions, and smoky BBQ drizzle.",
        price: 129.00,
        discount: 10,
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80",
        rating: 4.8,
        available: 1,
        best_seller: 1
      },
      {
        id: 7,
        name: "Tandoori Paneer Burger",
        category: "Burger",
        description: "Marinated grilled cottage cheese slab layered with mint mayo, red onion rings, and chaat masala relish.",
        price: 149.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80",
        rating: 4.7,
        available: 1,
        best_seller: 0
      },
      {
        id: 8,
        name: "Dal Makhani & Butter Naan",
        category: "Indian",
        description: "Whole black lentils slow-cooked overnight with churned butter and dairy cream, served with 2 hot butter naans.",
        price: 199.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
        rating: 4.9,
        available: 1,
        best_seller: 1
      },
      {
        id: 9,
        name: "Paneer Butter Masala",
        category: "Indian",
        description: "Velvety, sweet-savory tomato butter makhani gravy infused with kasuri methi and succulent fresh malai paneer cubes.",
        price: 219.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80",
        rating: 4.8,
        available: 1,
        best_seller: 1
      },
      {
        id: 10,
        name: "Royal Hyderabadi Veg Biryani",
        category: "Indian",
        description: "Fragrant aged Basmati rice layered with garden veggies, saffron milk, caramelized onions, and served with mint raita.",
        price: 149.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80",
        rating: 4.9,
        available: 1,
        best_seller: 1
      },
      {
        id: 11,
        name: "Tandoori Paneer Tikka",
        category: "Indian",
        description: "Char-grilled cottage cheese cubes marinated in Kashmiri red chilies, mustard oil, and hung curd, served with fresh mint chutney.",
        price: 179.00,
        discount: 0,
        image: "/images/tandoori-paneer-tikka.jpg",
        rating: 4.9,
        available: 1,
        best_seller: 1
      },
      {
        id: 12,
        name: "Hakka Veg Noodles",
        category: "Chinese",
        description: "Wok-tossed noodles with shredded cabbage, crunchy carrots, capsicum, scallions, and light garlic-soy glaze.",
        price: 139.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80",
        rating: 4.6,
        available: 1,
        best_seller: 0
      },
      {
        id: 13,
        name: "Veg Manchurian Gravy",
        category: "Chinese",
        description: "Crispy minced vegetable balls simmered in a dark, zesty ginger-garlic and cilantro-scented Manchurian sauce.",
        price: 159.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=700&q=80",
        rating: 4.7,
        available: 1,
        best_seller: 0
      },
      {
        id: 14,
        name: "Cold Coffee with Chocolate",
        category: "Drinks",
        description: "Chilled creamy Arabica espresso blended with rich chocolate fudge and topped with a scoop of vanilla ice cream.",
        price: 89.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80",
        rating: 4.8,
        available: 1,
        best_seller: 1
      },
      {
        id: 15,
        name: "Sizzling Choco Lava Brownie",
        category: "Desserts",
        description: "Warm fudgy cocoa brownie served on a smoking sizzler plate with melted Belgian chocolate and vanilla bean gelato.",
        price: 99.00,
        discount: 0,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80",
        rating: 4.9,
        available: 1,
        best_seller: 1
      }
    ];

    const menuItemsRows = foodsList.map((f) => [
      f.id,
      f.name,
      f.description,
      f.category,
      f.price,
      f.discount,
      f.image,
      f.available,
      f.best_seller,
      f.rating
    ]);

    const foodsRows = foodsList.map((f) => [
      f.id,
      f.name,
      f.category,
      f.description,
      f.price,
      f.image,
      f.rating,
      f.available
    ]);

    await connection.query(
      "INSERT INTO menu_items (id, name, description, category, price, discount, image, available, best_seller, rating) VALUES ?",
      [menuItemsRows]
    );

    await connection.query(
      "INSERT INTO foods (id, name, category, description, price, image, rating, is_available) VALUES ?",
      [foodsRows]
    );

    // 8. Seed Demo Orders
    console.log("✓ Seeding demo orders...");
    const ordersData = [
      [1, "SD1021", 3, 3, 3, "dine_in", 348.00, "placed", "placed", "paid", null],
      [2, "SD1022", 4, 5, 5, "dine_in", 238.00, "accepted", "accepted", "paid", null],
      [3, "SD1023", 5, 2, 2, "dine_in", 328.00, "preparing", "preparing", "paid", null],
      [4, "SD1024", 3, null, null, "delivery", 428.00, "ready", "ready", "paid", "Flat 402, Riverview Heights, Amroli, Surat, Gujarat - 394107"],
      [5, "SD1025", 4, 1, 1, "dine_in", 188.00, "completed", "completed", "paid", null]
    ];

    await connection.query(
      "INSERT INTO orders (id, order_number, user_id, table_number, table_id, order_type, total_amount, order_status, status, payment_status, delivery_address) VALUES ?",
      [ordersData]
    );

    // 9. Seed Order Items
    console.log("✓ Seeding order items...");
    const orderItemsData = [
      [1, 1, 1, 1, 1, 149.00],
      [2, 1, 2, 2, 1, 199.00],
      [3, 2, 5, 5, 1, 99.00],
      [4, 2, 12, 12, 1, 139.00],
      [5, 3, 10, 10, 1, 149.00],
      [6, 3, 11, 11, 1, 179.00],
      [7, 4, 3, 3, 1, 229.00],
      [8, 4, 8, 8, 1, 199.00],
      [9, 5, 14, 14, 1, 89.00],
      [10, 5, 15, 15, 1, 99.00]
    ];

    await connection.query(
      "INSERT INTO order_items (id, order_id, food_id, menu_item_id, quantity, price) VALUES ?",
      [orderItemsData]
    );

    // 10. Seed Reviews
    console.log("✓ Seeding reviews...");
    const reviewsData = [
      [1, 4, 14, 5, 5, "Absolutely divine cold coffee! Perfectly balanced sweetness and creamy chocolate."],
      [2, 4, 15, 5, 5, "The sizzling choco lava brownie is a must-try. Molten center was pure bliss."]
    ];

    await connection.query(
      "INSERT INTO reviews (id, user_id, food_id, order_id, rating, comment) VALUES ?",
      [reviewsData]
    );

    console.log("\n=======================================================");
    console.log("🎉 SMARTDINE FULL-STACK DATABASE INITIALIZATION SUCCESSFUL!");
    console.log("=======================================================");
    console.log("Demo Accounts Created:");
    console.log("  • Admin:    admin@smartdine.com    | Password: admin123");
    console.log("  • Kitchen:  kitchen@smartdine.com  | Password: kitchen123");
    console.log("  • Customer: customer@smartdine.com | Password: customer123");
    console.log("Data Seeded:");
    console.log("  • 5 Users");
    console.log("  • 15 Pure Vegetarian Menu Items (menu_items & foods)");
    console.log("  • 10 Restaurant Tables (tables & restaurant_tables)");
    console.log("  • 5 Live Demo Orders & 10 Order Items");
    console.log("  • Customer Reviews");
    console.log("=======================================================\n");

  } catch (error) {
    console.error("❌ Database seeding error:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
