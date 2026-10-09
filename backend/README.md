# 🍽️ SmartDine – Backend REST API (MongoDB & Mongoose)

Full-featured, production-ready REST API for the **SmartDine – Smart Restaurant Ordering System**. Built with Node.js, Express.js, **MongoDB (Mongoose)**, JWT authentication, bcrypt password hashing, and Google Gemini AI integration.

---

## 📌 1. Project Overview & Features
SmartDine Backend manages the complete end-to-end lifecycle of restaurant dining:
- **MongoDB & Mongoose ODM**: Fully schema-validated, document-driven database architecture with resilient built-in in-memory fallback.
- **JWT & Role-Based Access Control**: Separate authorization levels for `customer`, `admin`, and `kitchen`.
- **Bcrypt Password Security**: Zero plain-text passwords; industry-standard salting & hashing.
- **Dynamic Food & Category Management**: Full CRUD for admin, live search/filtering for customers (100% Pure Vegetarian).
- **Google Gemini AI Assistant**: Natural language food recommendations and interactive chat grounded in the restaurant's actual live menu.
- **QR Table & Dine-In Ordering**: Contactless dine-in linking table numbers with automatic table state management (`available` ↔ `occupied`).
- **Cart & Server-Side Price Verification**: Never trusts client-sent totals; recalculates amounts against verified database prices.
- **Strict Order State Machine**: `placed` ➔ `preparing` ➔ `ready` ➔ `completed` (or `cancelled`).
- **Kitchen Display System (KDS)**: Real-time active orders queue with stage transition actions.
- **Real-Time Admin Analytics**: Live calculations of revenue, top-selling dishes, daily order counts, and active tables.

---

## 🛠️ 2. Technology Stack
- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js (v4.21+)
- **Database**: MongoDB (v6.0+) via `mongoose` (v8.24+)
- **AI Integration**: Google GenAI SDK (`@google/genai`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs`
- **Environment**: `dotenv`
- **Cross-Origin Requests**: `cors` (configured for Vite React frontend at `http://localhost:5173`)

---

## 📂 3. Folder Structure
```
backend/
├── config/
│   └── db.js                 # Mongoose connection & resilient fallback
├── controllers/
│   ├── adminController.js     # Admin KPI metrics & dashboard
│   ├── aiController.js        # Gemini AI chat & food recommendations
│   ├── analyticsController.js # Revenue charts, top dishes, daily volume
│   ├── authController.js      # Register, login, profile
│   ├── foodController.js      # Food CRUD, search, category filtering
│   ├── menuController.js      # Menu API delegation
│   ├── orderController.js     # Order placement, status transitions, kitchen queue
│   ├── reviewController.js    # Verified review creation & retrieval
│   └── tableController.js     # Table listing, single table, status updates
├── middleware/
│   ├── authMiddleware.js      # JWT Bearer token verification
│   └── roleMiddleware.js      # Role restriction ('admin', 'kitchen', 'customer')
├── models/
│   ├── Category.js            # Category schema
│   ├── Food.js                # Food/dish schema
│   ├── Order.js               # Order & order items schema
│   ├── Review.js              # Reviews schema
│   ├── Table.js               # Dining tables schema
│   ├── User.js                # Users schema with role & bcrypt hashing
│   └── index.js               # Central models export
├── routes/
│   ├── adminRoutes.js         # /api/admin/*
│   ├── aiRoutes.js            # /api/ai/*
│   ├── analyticsRoutes.js     # /api/analytics/*
│   ├── authRoutes.js          # /api/auth/*
│   ├── categoryRoutes.js      # /api/categories/*
│   ├── foodRoutes.js          # /api/foods/*
│   ├── kitchenRoutes.js       # /api/kitchen/*
│   ├── menuRoutes.js          # /api/menu/*
│   ├── orderRoutes.js         # /api/orders/*
│   ├── reviewRoutes.js        # /api/reviews/*
│   └── tableRoutes.js         # /api/tables/*
├── scripts/
│   └── seed.js                # MongoDB initialization & pure veg seeder
├── utils/
│   ├── orderNumber.js         # SD1026 sequential order number generator
│   ├── response.js            # Standardized JSON response envelope
│   └── token.js               # JWT signing & validation utilities
├── .env                       # Local environment variables
├── .env.example               # Environment variables template
├── package.json
└── server.js                  # Main Express entry point
```

---

## ⚙️ 4. Environment Variables (`.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Local Compass or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/smartdine

# JWT Authentication
JWT_SECRET=smartdine_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d

# Google Gemini AI API Key
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Frontend CORS Origin
CLIENT_URL=http://localhost:5173
```

---

## 🗄️ 5. Database Setup & Seed
1. Ensure your MongoDB server is running (e.g. MongoDB Community Service, Docker, or MongoDB Atlas).
   > *Note: Even if MongoDB is not locally started, the SmartDine backend includes a graceful in-memory fallback so all APIs continue to work without crashing!*
2. Run the automated seed script from inside `backend/`:
```bash
npm run seed
```
This script automatically:
- Connects to your MongoDB database.
- Drops obsolete/empty collections.
- Hashes demo passwords with `bcryptjs`.
- Seeds default **users** (admin, kitchen, customer), **categories**, **15 pure vegetarian dishes**, **10 restaurant tables**, and demo orders.

---

## 🔑 6. Demo Login Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@smartdine.com` | `admin123` |
| **Kitchen** | `kitchen@smartdine.com` | `kitchen123` |
| **Customer** | `customer@smartdine.com` | `customer123` |

---

## 🚀 7. Running the Server
```bash
# Production mode
npm start

# Development mode (with live reload)
npm run dev
```
The server will start listening at `http://localhost:5000`.
Health check endpoint: `GET http://localhost:5000/api/health`.
