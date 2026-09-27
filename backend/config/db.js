const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Initial in-memory fixtures for seamless offline development & testing
const adminHash = bcrypt.hashSync("Admin123", 10);
const kitchenHash = bcrypt.hashSync("Kitchen123", 10);
const customerHash = bcrypt.hashSync("Customer123", 10);

const memoryDB = {
  users: [
    { id: 1, name: "Krish Patel (Owner)", email: "admin@smartdine.com", password: adminHash, phone: "9106993883", role: "admin", created_at: new Date() },
    { id: 2, name: "Head Chef Mario", email: "kitchen@smartdine.com", password: kitchenHash, phone: "9106993884", role: "kitchen", created_at: new Date() },
    { id: 3, name: "Sneha Nair", email: "customer@smartdine.com", password: customerHash, phone: "9876543210", role: "customer", created_at: new Date() },
    { id: 4, name: "Priya Patel", email: "priya@smartdine.com", password: customerHash, phone: "9876543211", role: "customer", created_at: new Date() },
    { id: 5, name: "Amit Shah", email: "amit@smartdine.com", password: customerHash, phone: "9876543212", role: "customer", created_at: new Date() }
  ],
  categories: [
    { id: 1, name: "Pizza" },
    { id: 2, name: "Burger" },
    { id: 3, name: "Indian" },
    { id: 4, name: "Chinese" },
    { id: 5, name: "Drinks" },
    { id: 6, name: "Desserts" }
  ],
  foods: [
    { id: 1, name: "Margherita Pizza", category: "Pizza", description: "Classic hand-stretched crust topped with San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves.", price: 149.00, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: 1, created_at: new Date() },
    { id: 2, name: "Cheese Burst Pizza", category: "Pizza", description: "Decadent crust oozing with molten cheddar and mozzarella, topped with herbs and extra cheese pull goodness.", price: 199.00, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80", rating: 4.9, is_available: 1, created_at: new Date() },
    { id: 3, name: "Farmhouse Supreme Pizza", category: "Pizza", description: "Loaded with crunchy bell peppers, sweet corn, button mushrooms, black olives, red onions, and spiced mozzarella.", price: 229.00, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80", rating: 4.7, is_available: 1, created_at: new Date() },
    { id: 4, name: "Exotic Paneer Tikka Pizza", category: "Pizza", description: "Stone-baked crust loaded with marinated cottage cheese cubes, sweet paprika peppers, golden corn, and Italian herbs.", price: 249.00, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: 1, created_at: new Date() },
    { id: 5, name: "Classic Crispy Veg Burger", category: "Burger", description: "Golden spiced potato-herb patty with crunchy iceberg lettuce, ripe tomatoes, and house vegan mayo in a toasted sesame bun.", price: 99.00, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80", rating: 4.5, is_available: 1, created_at: new Date() },
    { id: 6, name: "Double Cheese Melt Burger", category: "Burger", description: "Thick seasoned vegetable patty with double cheddar melt, pickled gherkins, caramelized onions, and smoky BBQ drizzle.", price: 129.00, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: 1, created_at: new Date() },
    { id: 7, name: "Tandoori Paneer Burger", category: "Burger", description: "Marinated grilled cottage cheese slab layered with mint mayo, red onion rings, and chaat masala relish.", price: 149.00, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80", rating: 4.7, is_available: 1, created_at: new Date() },
    { id: 8, name: "Dal Makhani & Butter Naan", category: "Indian", description: "Whole black lentils slow-cooked overnight with churned butter and dairy cream, served with 2 hot butter naans.", price: 199.00, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80", rating: 4.9, is_available: 1, created_at: new Date() },
    { id: 9, name: "Paneer Butter Masala", category: "Indian", description: "Velvety, sweet-savory tomato butter makhani gravy infused with kasuri methi and succulent fresh malai paneer cubes.", price: 219.00, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: 1, created_at: new Date() },
    { id: 10, name: "Royal Hyderabadi Veg Biryani", category: "Indian", description: "Fragrant aged Basmati rice layered with garden veggies, saffron milk, caramelized onions, and served in an earthen handi with mint raita.", price: 149.00, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80", rating: 4.9, is_available: 1, created_at: new Date() },
    { id: 11, name: "Tandoori Paneer Tikka", category: "Indian", description: "Char-grilled cottage cheese cubes marinated in Kashmiri red chilies, mustard oil, and hung curd, served with fresh mint chutney.", price: 179.00, image: "/images/tandoori-paneer-tikka.jpg", rating: 4.9, is_available: 1, created_at: new Date() },
    { id: 12, name: "Hakka Veg Noodles", category: "Chinese", description: "Wok-tossed noodles with shredded cabbage, crunchy carrots, capsicum, scallions, and light garlic-soy glaze.", price: 139.00, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80", rating: 4.6, is_available: 1, created_at: new Date() },
    { id: 13, name: "Veg Manchurian Gravy", category: "Chinese", description: "Crispy minced vegetable balls simmered in a dark, zesty ginger-garlic and cilantro-scented Manchurian sauce.", price: 159.00, image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=700&q=80", rating: 4.7, is_available: 1, created_at: new Date() },
    { id: 14, name: "Cold Coffee with Chocolate", category: "Drinks", description: "Chilled creamy Arabica espresso blended with rich chocolate fudge and topped with a scoop of vanilla ice cream.", price: 89.00, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: 1, created_at: new Date() },
    { id: 15, name: "Sizzling Choco Lava Brownie", category: "Desserts", description: "Warm fudgy cocoa brownie served on a smoking sizzler plate with melted Belgian chocolate and vanilla bean gelato.", price: 99.00, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80", rating: 4.9, is_available: 1, created_at: new Date() }
  ],
  tables: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    table_number: i + 1,
    qr_code: `https://smartdine.local/table/${i + 1}`,
    status: i + 1 === 5 ? "occupied" : "available"
  })),
  orders: [
    { id: 1, order_number: "SD1021", user_id: 3, table_id: 3, order_type: "dine_in", total_amount: 348.00, status: "placed", delivery_address: null, created_at: new Date(Date.now() - 3600000) },
    { id: 2, order_number: "SD1022", user_id: 4, table_id: 5, order_type: "dine_in", total_amount: 238.00, status: "accepted", delivery_address: null, created_at: new Date(Date.now() - 2400000) },
    { id: 3, order_number: "SD1023", user_id: 5, table_id: 2, order_type: "dine_in", total_amount: 328.00, status: "preparing", delivery_address: null, created_at: new Date(Date.now() - 1800000) },
    { id: 4, order_number: "SD1024", user_id: 3, table_id: null, order_type: "delivery", total_amount: 428.00, status: "ready", delivery_address: "Flat 402, Riverview Heights, Amroli, Surat, Gujarat - 394107", created_at: new Date(Date.now() - 900000) },
    { id: 5, order_number: "SD1025", user_id: 4, table_id: 1, order_type: "dine_in", total_amount: 188.00, status: "completed", delivery_address: null, created_at: new Date(Date.now() - 7200000) }
  ],
  order_items: [
    { id: 1, order_id: 1, food_id: 1, quantity: 1, price: 149.00 },
    { id: 2, order_id: 1, food_id: 2, quantity: 1, price: 199.00 },
    { id: 3, order_id: 2, food_id: 5, quantity: 1, price: 99.00 },
    { id: 4, order_id: 2, food_id: 12, quantity: 1, price: 139.00 },
    { id: 5, order_id: 3, food_id: 10, quantity: 1, price: 149.00 },
    { id: 6, order_id: 3, food_id: 11, quantity: 1, price: 179.00 },
    { id: 7, order_id: 4, food_id: 3, quantity: 1, price: 229.00 },
    { id: 8, order_id: 4, food_id: 8, quantity: 1, price: 199.00 },
    { id: 9, order_id: 5, food_id: 14, quantity: 1, price: 89.00 },
    { id: 10, order_id: 5, food_id: 15, quantity: 1, price: 99.00 }
  ],
  reviews: [
    { id: 1, user_id: 4, food_id: 14, order_id: 5, rating: 5, comment: "Absolutely divine cold coffee! Perfectly balanced sweetness and creamy chocolate.", created_at: new Date() },
    { id: 2, user_id: 4, food_id: 15, order_id: 5, rating: 5, comment: "The sizzling choco lava brownie is a must-try. Molten center was pure bliss.", created_at: new Date() }
  ]
};

// Real MySQL connection pool
const realPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smartdine",
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true
});

let isMySQLAlive = false;

// Health test MySQL connection on startup
(async () => {
  try {
    const conn = await realPool.getConnection();
    isMySQLAlive = true;
    console.log(`✅ [MySQL] Successfully connected to live database '${process.env.DB_NAME || "smartdine"}' on ${process.env.DB_HOST || "localhost"}`);
    conn.release();
  } catch (err) {
    isMySQLAlive = false;
    console.warn("\n⚠️  [MySQL Warning] Local MySQL service is offline (port 3306).");
    console.warn("🛡️  [SmartDine Fallback] Memory storage initialized so all pages & APIs remain 100% operational.");
    console.warn("👉 To connect to live MySQL, start MySQL service (e.g. in XAMPP) and run 'npm run seed'.\n");
  }
})();

/**
 * In-Memory SQL Simulator (Ensures zero 500 errors when MySQL is offline)
 */
function simulateQuery(sql, params = []) {
  const cleanSql = sql.replace(/\s+/g, " ").trim();

  // 1. SELECT users by email
  if (/SELECT .* FROM users WHERE email =/i.test(cleanSql)) {
    const email = (params[0] || "").toLowerCase();
    const found = memoryDB.users.filter((u) => u.email.toLowerCase() === email);
    return [found, []];
  }

  // 2. SELECT users by ID
  if (/SELECT .* FROM users WHERE id =/i.test(cleanSql)) {
    const id = Number(params[0]);
    const found = memoryDB.users.filter((u) => u.id === id);
    return [found, []];
  }

  // 3. INSERT user
  if (/INSERT INTO users/i.test(cleanSql)) {
    const [name, email, password, phone, role] = params;
    const newId = memoryDB.users.length + 1;
    const newUser = { id: newId, name, email, password, phone, role, created_at: new Date() };
    memoryDB.users.push(newUser);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // 4. SELECT foods or menu_items count
  if (/SELECT COUNT\(\*\) .* FROM (menu_items|foods)/i.test(cleanSql)) {
    const count = memoryDB.foods.filter((f) => f.is_available !== 0).length;
    return [[{ count, available_menu_items: count }], []];
  }

  // 4a. Analytics Top Foods query
  if (/FROM foods f LEFT JOIN order_items/i.test(cleanSql)) {
    const salesMap = {};
    (memoryDB.order_items || []).forEach((oi) => {
      const fid = oi.food_id;
      if (!salesMap[fid]) salesMap[fid] = { total_sold: 0, total_revenue: 0 };
      salesMap[fid].total_sold += (oi.quantity || 1);
      salesMap[fid].total_revenue += ((oi.quantity || 1) * (oi.price || 0));
    });

    const baselineSales = {
      1: { sold: 142, rev: 28258 },
      2: { sold: 118, rev: 15222 },
      3: { sold: 96, rev: 14304 },
      4: { sold: 84, rev: 11676 },
      5: { sold: 135, rev: 12015 },
      6: { sold: 74, rev: 7326 }
    };

    const topList = memoryDB.foods.map((f) => {
      const live = salesMap[f.id] || { total_sold: 0, total_revenue: 0 };
      const base = baselineSales[f.id] || { sold: 20, rev: 20 * f.price };
      return {
        id: f.id,
        name: f.name,
        category: f.category,
        price: f.price,
        image: f.image,
        rating: f.rating,
        total_sold: base.sold + live.total_sold,
        total_revenue: base.rev + live.total_revenue
      };
    });

    topList.sort((a, b) => b.total_sold - a.total_sold);
    return [topList.slice(0, 6), []];
  }

  // 4b. SELECT foods or menu_items
  if (/SELECT .* FROM (foods|menu_items)/i.test(cleanSql)) {
    let result = memoryDB.foods.map((f) => ({
      ...f,
      available: f.is_available !== 0,
      best_seller: f.rating >= 4.8 ? 1 : 0,
      discount: 0
    }));

    if (cleanSql.includes("category = ?")) {
      const cat = params[0];
      result = result.filter((f) => f.category === cat);
    }
    if (cleanSql.includes("name LIKE ?")) {
      const q = (params[0] || "").replace(/%/g, "").toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }
    if (cleanSql.includes("is_available = ?") || cleanSql.includes("available = 1")) {
      result = result.filter((f) => f.is_available !== 0 && f.available !== false);
    }
    if (cleanSql.includes("id = ?") || cleanSql.includes("WHERE id =")) {
      const id = Number(params[0]);
      result = result.filter((f) => f.id === id);
    }
    return [result, []];
  }

  // 6. INSERT food or menu_item
  if (/INSERT INTO (foods|menu_items)/i.test(cleanSql)) {
    const [name, category, description, price, image, rating, is_available] = params;
    const newId = memoryDB.foods.length + 1;
    const newFood = { id: newId, name, category, description, price, image, rating, is_available, created_at: new Date() };
    memoryDB.foods.push(newFood);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // 7. UPDATE food
  if (/UPDATE foods SET/i.test(cleanSql)) {
    if (cleanSql.includes("is_available = ? WHERE id = ?")) {
      const [avail, id] = params;
      const target = memoryDB.foods.find((f) => f.id === Number(id));
      if (target) target.is_available = avail;
      return [{ affectedRows: 1 }, []];
    }
    const id = Number(params[params.length - 1]);
    const target = memoryDB.foods.find((f) => f.id === id);
    if (target) {
      target.name = params[0];
      target.category = params[1];
      target.description = params[2];
      target.price = params[3];
      target.image = params[4];
      target.rating = params[5];
      target.is_available = params[6];
    }
    return [{ affectedRows: 1 }, []];
  }

  // 8. DELETE food
  if (/DELETE FROM foods WHERE id =/i.test(cleanSql)) {
    const id = Number(params[0]);
    memoryDB.foods = memoryDB.foods.filter((f) => f.id !== id);
    return [{ affectedRows: 1 }, []];
  }

  // 9. Categories
  if (/SELECT .* FROM categories/i.test(cleanSql)) {
    return [memoryDB.categories, []];
  }

  // 10. Tables
  if (/SELECT .* FROM restaurant_tables/i.test(cleanSql)) {
    if (cleanSql.includes("id = ? OR table_number = ?")) {
      const ident = Number(params[0]);
      const found = memoryDB.tables.filter((t) => t.id === ident || t.table_number === ident);
      return [found, []];
    }
    const tablesWithActive = memoryDB.tables.map((t) => {
      const activeCount = memoryDB.orders.filter((o) => o.table_id === t.id && !["completed", "cancelled"].includes(o.status)).length;
      return { ...t, active_orders_count: activeCount };
    });
    return [tablesWithActive, []];
  }

  if (/UPDATE (restaurant_tables|tables) SET status/i.test(cleanSql)) {
    let status = "available";
    let id;
    if (params.length >= 2) {
      status = params[0];
      id = params[1];
    } else if (params.length === 1) {
      id = params[0];
      const match = cleanSql.match(/status\s*=\s*'([^']+)'/i);
      if (match) status = match[1];
    }
    const target = memoryDB.tables.find((t) => t.id === Number(id) || t.table_number === Number(id));
    if (target) target.status = status;
    return [{ affectedRows: 1 }, []];
  }
  // 11. Analytics Queries (Must precede general orders select)
  if (/SELECT COUNT\(\*\) AS total_orders FROM orders/i.test(cleanSql)) {
    return [[{ total_orders: memoryDB.orders.length }], []];
  }
  if (/SELECT COUNT\(\*\) AS today_orders FROM orders/i.test(cleanSql)) {
    return [[{ today_orders: memoryDB.orders.length }], []];
  }
  if (/SELECT COALESCE\(SUM\(total_amount\), 0\) AS today_revenue FROM orders/i.test(cleanSql)) {
    const rev = memoryDB.orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total_amount : 0), 0);
    return [[{ today_revenue: rev }], []];
  }
  if (/SELECT COUNT\(\*\) AS pending_orders FROM orders/i.test(cleanSql)) {
    const count = memoryDB.orders.filter((o) => ["placed", "accepted", "preparing"].includes(o.status)).length;
    return [[{ pending_orders: count }], []];
  }
  if (/SELECT COUNT\(\*\) AS completed_orders FROM orders/i.test(cleanSql)) {
    const count = memoryDB.orders.filter((o) => o.status === "completed").length;
    return [[{ completed_orders: count }], []];
  }
  if (/SELECT COUNT\(\*\) AS cancelled_orders FROM orders/i.test(cleanSql)) {
    const count = memoryDB.orders.filter((o) => o.status === "cancelled").length;
    return [[{ cancelled_orders: count }], []];
  }
  if (/SELECT COUNT\(\*\) AS total_customers FROM users/i.test(cleanSql)) {
    const count = memoryDB.users.filter((u) => u.role === "customer").length;
    return [[{ total_customers: count }], []];
  }
  if (/SELECT COALESCE\(SUM\(total_amount\), 0\) AS total_revenue FROM orders/i.test(cleanSql)) {
    const rev = memoryDB.orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total_amount : 0), 0);
    return [[{ total_revenue: rev }], []];
  }

  // 11b. Analytics Revenue by Day (Last 7 Days)
  if (/SELECT DATE\(created_at\).*DAYNAME\(created_at\)/i.test(cleanSql) || /GROUP BY DATE\(created_at\)/i.test(cleanSql)) {
    const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const baseWeeklyByDay = {
      Monday: { orders: 28, revenue: 8400 },
      Tuesday: { orders: 34, revenue: 10200 },
      Wednesday: { orders: 31, revenue: 9300 },
      Thursday: { orders: 42, revenue: 12600 },
      Friday: { orders: 56, revenue: 16800 },
      Saturday: { orders: 64, revenue: 19200 },
      Sunday: { orders: 58, revenue: 17400 }
    };

    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = fullDayNames[d.getDay()];

      const daysOrders = memoryDB.orders.filter((o) => {
        if (o.status === "cancelled") return false;
        const oDate = new Date(o.created_at || now).toISOString().split("T")[0];
        return oDate === dateStr;
      });

      const base = baseWeeklyByDay[dayName] || { orders: 25, revenue: 7500 };
      const totalOrders = base.orders + daysOrders.length;
      const dailyRevenue = base.revenue + daysOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

      result.push({
        order_date: dateStr,
        day_name: dayName,
        total_orders: totalOrders,
        daily_revenue: dailyRevenue
      });
    }

    return [result, []];
  }

  // 12. Orders Queries
  if (/SELECT .* FROM orders/i.test(cleanSql)) {
    const enrichOrder = (o) => {
      const user = memoryDB.users.find((u) => u.id === o.user_id) || {};
      const table = memoryDB.tables.find((t) => t.id === o.table_id || t.table_number === o.table_id) || {};
      const custName = o.customer_name || user.name || "Guest Customer";
      const custEmail = o.customer_email || user.email || "";
      const custPhone = o.customer_phone || user.phone || "";
      const addr = o.delivery_address || (o.table_id ? `Restaurant Dine-In Table ${table.table_number || o.table_id}` : "Standard Express Delivery, Amroli, Surat");

      return {
        ...o,
        customer_name: custName,
        customer_email: custEmail,
        customer_phone: custPhone,
        delivery_address: addr,
        table_number: table.table_number || o.table_id || null,
        table_status: table.status || "available",
        customer: {
          name: custName,
          email: custEmail,
          phone: custPhone,
          mobile: custPhone,
          address: addr
        }
      };
    };

    // Single order by ID or order_number
    if (cleanSql.includes("id = ?") || cleanSql.includes("order_number = ?")) {
      const ident = params[0];
      const isNum = /^\d+$/.test(ident);
      const found = memoryDB.orders
        .filter((o) => (isNum ? o.id === Number(ident) : o.order_number === ident))
        .map(enrichOrder);
      return [found, []];
    }

    // Customer my-orders
    if (cleanSql.includes("o.user_id = ?")) {
      const uid = Number(params[0]);
      const found = memoryDB.orders
        .filter((o) => o.user_id === uid)
        .map(enrichOrder);
      return [found, []];
    }

    // Kitchen orders
    if (cleanSql.includes("o.status NOT IN ('completed', 'cancelled')")) {
      const active = memoryDB.orders
        .filter((o) => !["completed", "cancelled"].includes(o.status))
        .map(enrichOrder);
      return [active, []];
    }

    // All orders
    const all = memoryDB.orders.map(enrichOrder);
    return [all, []];
  }

  // INSERT Order
  if (/INSERT INTO orders/i.test(cleanSql)) {
    const [order_number, user_id, table_id, order_type, total_amount, delivery_address] = params;
    const newId = memoryDB.orders.length + 1;
    const user = memoryDB.users.find((u) => u.id === user_id) || {};
    const table = memoryDB.tables.find((t) => t.id === table_id || t.table_number === table_id) || {};
    const custName = user.name || "Guest Customer";
    const custEmail = user.email || "";
    const custPhone = user.phone || "";
    const addr = delivery_address || (table_id ? `Restaurant Dine-In Table ${table.table_number || table_id}` : "Standard Express Delivery, Amroli, Surat");

    const newOrder = {
      id: newId,
      order_number,
      user_id: user_id || null,
      table_id: table_id || null,
      order_type,
      total_amount: parseFloat(total_amount),
      status: "placed",
      delivery_address: addr,
      customer_name: custName,
      customer_email: custEmail,
      customer_phone: custPhone,
      table_number: table.table_number || table_id || null,
      customer: {
        name: custName,
        email: custEmail,
        phone: custPhone,
        mobile: custPhone,
        address: addr
      },
      created_at: new Date()
    };
    memoryDB.orders.unshift(newOrder);
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // UPDATE order status
  if (/UPDATE orders SET status/i.test(cleanSql)) {
    const [newStatus, id] = params;
    const target = memoryDB.orders.find((o) => o.id === Number(id) || o.order_number === id);
    if (target) target.status = newStatus;
    return [{ affectedRows: 1 }, []];
  }

  // 12. Order Items
  if (/SELECT .* FROM order_items oi JOIN foods f/i.test(cleanSql)) {
    const orderId = Number(params[0]);
    const items = memoryDB.order_items
      .filter((oi) => oi.order_id === orderId)
      .map((oi) => {
        const food = memoryDB.foods.find((f) => f.id === oi.food_id) || {};
        return {
          id: oi.id,
          food_id: oi.food_id,
          quantity: oi.quantity,
          price: oi.price,
          name: food.name || "Dish",
          category: food.category || "General",
          image: food.image || "/images/smartdine-hero-feast.jpg",
          description: food.description || ""
        };
      });
    return [items, []];
  }

  if (/INSERT INTO order_items/i.test(cleanSql)) {
    const [order_id, food_id, quantity, price] = params;
    const newId = memoryDB.order_items.length + 1;
    memoryDB.order_items.push({ id: newId, order_id: Number(order_id), food_id: Number(food_id), quantity: Number(quantity), price: parseFloat(price) });
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  // Top foods analytics
  if (/SELECT f\.id, f\.name, f\.category, f\.price, f\.image, f\.rating/i.test(cleanSql)) {
    const top = memoryDB.foods.slice(0, 6).map((f) => {
      const sold = memoryDB.order_items
        .filter((oi) => oi.food_id === f.id)
        .reduce((sum, oi) => sum + oi.quantity, 0) || 12;
      return {
        id: f.id,
        name: f.name,
        category: f.category,
        price: f.price,
        image: f.image,
        rating: f.rating,
        total_sold: sold,
        total_revenue: sold * f.price
      };
    });
    return [top, []];
  }

  // Revenue analytics (last 7 days)
  if (/SELECT DATE\(created_at\) AS order_date/i.test(cleanSql)) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const history = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      return {
        order_date: d.toISOString().split("T")[0],
        day_name: days[d.getDay()],
        total_orders: 15 + i * 4,
        daily_revenue: 3500 + i * 1150
      };
    });
    return [history, []];
  }

  // 14. Reviews
  if (/SELECT r\.id, r\.rating, r\.comment, r\.created_at, u\.name as user_name FROM reviews/i.test(cleanSql)) {
    const foodId = Number(params[0]);
    const found = memoryDB.reviews
      .filter((r) => r.food_id === foodId)
      .map((r) => {
        const user = memoryDB.users.find((u) => u.id === r.user_id);
        return { ...r, user_name: user?.name || "Customer" };
      });
    return [found, []];
  }

  if (/SELECT o\.id as order_id FROM orders o JOIN order_items oi/i.test(cleanSql)) {
    // Check if user completed order with this food
    const [userId, foodId] = params;
    const userOrders = memoryDB.orders.filter((o) => o.user_id === Number(userId) && o.status === "completed");
    const matched = userOrders.find((o) => memoryDB.order_items.some((oi) => oi.order_id === o.id && oi.food_id === Number(foodId)));
    return [matched ? [{ order_id: matched.id }] : [], []];
  }

  if (/INSERT INTO reviews/i.test(cleanSql)) {
    const [user_id, food_id, order_id, rating, comment] = params;
    const newId = memoryDB.reviews.length + 1;
    memoryDB.reviews.push({ id: newId, user_id: Number(user_id), food_id: Number(food_id), order_id: Number(order_id), rating: Number(rating), comment, created_at: new Date() });
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  return [[], []];
}

/**
 * Universal Unified Database Pool Adapter
 */
const pool = {
  query: async (sql, params) => {
    if (isMySQLAlive) {
      try {
        return await realPool.query(sql, params);
      } catch (err) {
        if (err.code === "ECONNREFUSED") {
          isMySQLAlive = false;
        } else {
          throw err;
        }
      }
    }
    return simulateQuery(sql, params);
  },

  execute: async (sql, params) => {
    return pool.query(sql, params);
  },

  getConnection: async () => {
    if (isMySQLAlive) {
      try {
        return await realPool.getConnection();
      } catch (err) {
        isMySQLAlive = false;
      }
    }

    // Mock connection with transaction helpers
    return {
      query: async (sql, params) => simulateQuery(sql, params),
      execute: async (sql, params) => simulateQuery(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
};

module.exports = pool;
