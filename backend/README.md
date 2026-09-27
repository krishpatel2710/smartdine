# 🍽️ SmartDine – Backend REST API

Full-featured, production-ready REST API for the **SmartDine – Smart Restaurant Ordering System**. Built with Node.js, Express.js, MySQL, JWT authentication, and bcrypt password hashing.

---

## 📌 1. Project Overview & Features
SmartDine Backend manages the complete end-to-end lifecycle of restaurant dining:
- **JWT & Role-Based Access Control**: Separate authorization levels for `customer`, `admin`, and `kitchen`.
- **Bcrypt Password Security**: Zero plain-text passwords; industry-standard salting & hashing.
- **Dynamic Food & Category Management**: Full CRUD for admin, live search/filtering for customers.
- **QR Table & Dine-In Ordering**: Contactless dine-in linking table numbers with automatic table state management (`available` ↔ `occupied`).
- **Cart & Server-Side Price Verification**: Never trusts client-sent totals; recalculates amounts against database prices.
- **Strict Order State Machine**: `PLACED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED` (or `CANCELLED`).
- **Kitchen Display System (KDS)**: Real-time active orders queue with stage transition actions.
- **Verified Reviews**: Only customers who ordered and received a dish in a completed order can review it.
- **Real-Time Admin Analytics**: Live calculations of revenue, top-selling dishes, daily order counts, and active tables.

---

## 🛠️ 2. Technology Stack
- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js (v4.21+)
- **Database**: MySQL (v5.7+ / v8.0+) via `mysql2/promise` connection pooling
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs`
- **Environment**: `dotenv`
- **Cross-Origin Requests**: `cors` (configured for Vite React frontend at `http://localhost:5173`)

---

## 📂 3. Folder Structure
```
backend/
├── config/
│   └── db.js                 # MySQL connection pool & startup health check
├── controllers/
│   ├── authController.js      # Register, login, getMe
│   ├── foodController.js      # Food CRUD, availability toggle, categories
│   ├── orderController.js     # Order placement, status transitions, kitchen queue
│   ├── tableController.js     # Table listing, single table, status updates
│   ├── reviewController.js    # Verified review creation & retrieval
│   └── analyticsController.js # Admin KPI metrics, revenue charts, top dishes
├── middleware/
│   ├── authMiddleware.js      # JWT Bearer token verification & optional auth
│   ├── roleMiddleware.js      # restrictTo('admin', 'kitchen', 'customer')
│   └── errorMiddleware.js     # Centralized 404 & 500 error handlers
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── foodRoutes.js          # /api/foods/*
│   ├── categoryRoutes.js      # /api/categories/*
│   ├── tableRoutes.js         # /api/tables/*
│   ├── orderRoutes.js         # /api/orders/*
│   ├── kitchenRoutes.js       # /api/kitchen/*
│   ├── reviewRoutes.js        # /api/reviews/*
│   └── analyticsRoutes.js     # /api/analytics/*
├── scripts/
│   ├── schema.sql             # Pure SQL DDL definitions & foreign keys
│   └── seed.js                # Database initialization & demo fixture seeder
├── utils/
│   ├── response.js            # Standardized JSON response envelope
│   ├── token.js               # JWT signing & validation utilities
│   └── orderNumber.js         # SD1024 sequential order number generator
├── .env                       # Local environment variables
├── .env.example               # Environment variables template
├── package.json
└── server.js                  # Main Express entry point
```

---

## ⚙️ 4. Environment Variables (`.env`)
Create a `.env` file in the `backend/` directory:
```env
# Server Port
PORT=5000
NODE_ENV=development

# MySQL Database Credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=smartdine

# JWT Authentication
JWT_SECRET=smartdine_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d

# Frontend CORS Origin
CLIENT_URL=http://localhost:5173
```

---

## 🗄️ 5. Database Setup & Seed
1. Ensure your MySQL server is running (e.g., via XAMPP, MySQL Workbench, Windows Services, or Docker).
2. Run the automated seed script from inside `backend/`:
```bash
npm run seed
```
This script automatically:
- Creates the `smartdine` database if it doesn't already exist.
- Creates all 7 tables with foreign keys and indexes (`users`, `categories`, `foods`, `restaurant_tables`, `orders`, `order_items`, `reviews`).
- Hashes passwords using bcrypt (`10` salt rounds).
- Seeds **5 users**, **6 categories**, **10 restaurant tables**, **15 pure vegetarian food items**, **5 demo orders**, and sample reviews.

---

## 🔑 6. Demo Login Credentials
| Role | Email | Password | Access |
|---|---|---|---|
| **Admin (Owner)** | `admin@smartdine.com` | `Admin123` | Full dashboard, menu management, order control, analytics |
| **Kitchen Staff** | `kitchen@smartdine.com` | `Kitchen123` | Live Kitchen Display System (KDS), cooking stages |
| **Customer** | `customer@smartdine.com` | `Customer123` | Browse menu, order, track live order, leave reviews |

---

## 🚀 7. Running the Project
### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
# Server starts at http://localhost:5000
```

### Terminal 2: React Frontend
```bash
npm run dev
# Frontend starts at http://localhost:5173
```

---

## 📋 8. Complete API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new customer account with name, email, password, phone |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns JWT token and safe user payload |
| `GET` | `/api/auth/me` | Logged In | Retrieve profile of currently authenticated user |

### 🍕 Foods & Menu (`/api/foods`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/foods` | Public | Get food items (filters: `?category=...&search=...&available=true`) |
| `GET` | `/api/foods/:id` | Public | Get single food details with customer reviews |
| `POST` | `/api/foods` | Admin | Add new food dish to the menu |
| `PUT` | `/api/foods/:id` | Admin | Update food dish details, price, rating, or image |
| `DELETE` | `/api/foods/:id` | Admin | Delete food item (or marks unavailable if tied to past orders) |
| `PATCH` | `/api/foods/:id/availability` | Admin | Toggle or set dish in-stock / out-of-stock |

### 📂 Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List all 6 food categories (Pizza, Burger, Indian, Chinese, Drinks, Desserts) |
| `POST` | `/api/categories` | Admin | Add a new menu category |

### 🪑 Restaurant Tables (`/api/tables`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tables` | Public | List tables 1–10 with current status (`available` or `occupied`) |
| `GET` | `/api/tables/:id` | Public | Get single table details and active order |
| `PATCH` | `/api/tables/:id/status` | Admin / Kitchen | Update table status manually |

### 📦 Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Any / Auth | Place an order. Recalculates prices using database records. Auto-marks table occupied if dine-in. |
| `GET` | `/api/orders/my-orders` | Customer | Get order history of logged-in customer |
| `GET` | `/api/orders` | Admin / Kitchen | List all orders with filters (`?status=...&order_type=...`) |
| `GET` | `/api/orders/:id` | Order Owner / Staff | Get full order details and current stage |
| `PATCH` | `/api/orders/:id/status` | Admin / Kitchen | Update order stage with strict state validation |

### 🍳 Kitchen Display System (`/api/kitchen`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/kitchen/orders` | Kitchen / Admin | Fetch all currently active orders (placed, accepted, preparing, ready) |
| `PATCH` | `/api/kitchen/orders/:id/accept` | Kitchen / Admin | Accept order into production line |
| `PATCH` | `/api/kitchen/orders/:id/preparing` | Kitchen / Admin | Mark order as actively cooking |
| `PATCH` | `/api/kitchen/orders/:id/ready` | Kitchen / Admin | Mark food as ready for pickup or table serve |
| `PATCH` | `/api/kitchen/orders/:id/complete` | Kitchen / Admin | Complete order and automatically release table |

### ⭐ Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | Customer | Submit 1–5 star review for food (requires a completed order with that food) |
| `GET` | `/api/reviews/food/:id` | Public | Get all reviews and comments for a food dish |

### 📊 Admin Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard` | Admin | Real-time counts: total, today's, revenue, pending, completed, cancelled |
| `GET` | `/api/analytics/top-foods` | Admin | Top dishes ranked by total units sold and revenue |
| `GET` | `/api/analytics/revenue` | Admin | Daily revenue breakdown for charts |

---

## 💡 9. Example Request & Response

### Register Customer
`POST /api/auth/register`
```json
{
  "name": "Varun Dave",
  "email": "varun@example.com",
  "password": "Password123",
  "phone": "9825012345"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 6,
      "name": "Varun Dave",
      "email": "varun@example.com",
      "phone": "9825012345",
      "role": "customer"
    }
  }
}
```

### Place Dine-In Table Order
`POST /api/orders`
```json
{
  "items": [
    { "food_id": 2, "quantity": 1 },
    { "food_id": 11, "quantity": 1 }
  ],
  "order_type": "dine_in",
  "table_number": 5,
  "notes": "Less spicy paneer tikka please"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": 6,
    "order_number": "SD1026",
    "order_type": "dine_in",
    "table_id": 5,
    "total_amount": 378.00,
    "status": "placed",
    "created_at": "2026-09-26T10:15:00.000Z",
    "items": [
      {
        "id": 11,
        "food_id": 2,
        "name": "Cheese Burst Pizza",
        "quantity": 1,
        "price": 199.00
      },
      {
        "id": 12,
        "food_id": 11,
        "name": "Tandoori Paneer Tikka",
        "quantity": 1,
        "price": 179.00
      }
    ]
  }
}
```
