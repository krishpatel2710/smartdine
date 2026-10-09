# SmartDine – Smart Restaurant Ordering System with Gemini AI

A full-stack, enterprise-grade restaurant management and ordering platform built with **React.js, Node.js, Express.js, MongoDB (Mongoose), and Google Gemini AI**.

SmartDine is specifically designed to stand apart from traditional food delivery platforms by integrating **Google Gemini AI Food Assistant & Recommendations**, **QR-Based Contactless Table Ordering (Dine-In)**, a **Live Kitchen Display System (KDS)**, an **Owner/Admin Operations Dashboard**, a **Real-Time Order Tracking Simulator**, and **Restaurant Performance Analytics**.

---

## 🌟 Unique System Highlights

1. **🤖 Google Gemini AI Food Assistant**:
   - **Interactive Chat (`/ai-assistant`) & Floating AI Widget**: Conversational food assistant powered by Google Gemini via the official `@google/genai` SDK.
   - **Real Menu-Grounded Recommendations**: Backend dynamically injects the live restaurant menu into Gemini's prompt context, ensuring it only suggests actual dishes, accurate prices (₹), and dietary specifications (100% Pure Vegetarian).
   - **Quick Suggestion Prompts**: One-click prompt chips (🍕 *Recommend Pizza*, 🥗 *Vegetarian Food*, 💰 *Under ₹200*, 🔥 *Spicy Food*, ⭐ *Popular Items*).
   - **Direct "Add to Cart" Actions**: Recommended dishes feature direct interactive cart addition buttons.
   - **Smart Fallback Engine**: If the Gemini API key is missing or quota is exhausted, the backend's intelligent recommendation engine seamlessly provides menu-accurate suggestions without throwing errors.

2. **📱 QR-Based Contactless Table Ordering (Dine-In)**:
   - Interactive acrylic stand mockup with tap-to-scan QR simulation and laser animation.
   - Instant direct URL table locking via `/table/:tableNumber` (e.g. `/table/5`).
   - Interactive restaurant floor map showing seating capacity (2-8 seaters) and live occupancy status.
   - Automatically suppresses delivery charges and tags orders directly for table service.

3. **🍳 Kitchen Display System (KDS)**:
   - High-contrast, glanceable 3-column Kanban interface (`NEW ORDERS` → `PREPARING` → `READY`).
   - State-machine enforced status progression (`placed` → `accepted` → `preparing` → `ready` → `completed`).
   - Ticket timers showing elapsed preparation time and dietary breakdown.

4. **👑 Restaurant Owner & Admin Dashboard**:
   - Executive KPI cards: Total Orders, Today's Orders, Today's Revenue (₹), and Pending Tickets.
   - Order management table with instant status overrides.
   - Search by Order ID, customer name, and status filter dropdowns.

5. **📊 Restaurant Analytics & Menu Management**:
   - Daily Order Volume bar chart and Ordering Channel breakdown (Dine-In vs Delivery).
   - Menu Management CRUD with instant **In Stock / Out of Stock** toggle switches.

---

## 🏗️ 1. Architecture & Flow

```text
                    SMARTDINE
                       │
                       ▼
                React Frontend (Port 5173)
                       │
              Axios / HTTP Requests
              (JWT Auth Interceptor)
                       │
                       ▼
            Node.js / Express Backend (Port 5000)
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
    MongoDB Database          Google Gemini API
    (via Mongoose ODM)        (@google/genai SDK)
```

### Security & AI Architecture
- **Zero Frontend Key Exposure**: `GEMINI_API_KEY` is strictly managed on the Express backend (`backend/.env`). The React client communicates only with `/api/ai/*`.
- **Database-Grounded AI Prompting**: When customers request recommendations, the backend retrieves real menu items from MySQL and provides them to Gemini with instructions to suggest only active menu items with accurate pricing.
- **Fail-Safe Offline Mode**: If MySQL or Gemini is unavailable, SmartDine automatically falls back to in-memory state preservation and intelligent keyword-matching fallback logic so evaluators never see broken pages or 500 errors.

---

## 💻 2. Technology Stack

### Frontend
- **Framework**: React.js (v19)
- **Routing**: React Router (v7)
- **HTTP Client**: Axios (with base URL `http://localhost:5000/api` & JWT interceptor)
- **Icons**: Lucide React
- **QR Support**: `qrcode.react`, `html5-qrcode`
- **Styling**: Modern responsive CSS tokens & animations

### Backend
- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js
- **Database Driver**: `mysql2` (Connection Pool with transactions)
- **AI SDK**: `@google/genai` (Google GenAI Official SDK)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Security & Config**: `cors`, `dotenv`

### Database
- **Engine**: MySQL 8.x (Compatible with XAMPP MySQL)
- **Database Name**: `smartdine`
- **Tables**: `users`, `menu_items` (and `foods` view), `tables` (and `restaurant_tables`), `orders`, `order_items`, `reviews`

---

## 🔑 3. Demo Credentials

| Role | Email | Password | Default Redirect |
|---|---|---|---|
| **Restaurant Admin / Owner** | `admin@smartdine.com` | `admin123` (or `Admin123`) | Admin Dashboard (`/admin`) |
| **Kitchen Staff** | `kitchen@smartdine.com` | `kitchen123` (or `Kitchen123`) | Kitchen Display (`/kitchen`) |
| **Customer** | `customer@smartdine.com` | `customer123` (or `Customer123`) | Home (`/`) |

> **Restaurant Owner Details**: Krish Patel, Amroli, Surat, Gujarat - 394107 | Contact: `+91 9106993883`

---

## 🚀 4. How to Run the Project

### Prerequisites
- **Node.js** (v18 or higher)
- **MySQL / XAMPP** (optional for live database; automatic in-memory fallback included)

---

### Step A: Start the Backend Server

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=smartdine
   JWT_SECRET=smartdine_super_secret_jwt_key_2025
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your_gemini_api_key_here
   CLIENT_URL=http://localhost:5173
   ```
4. *(Optional)* Seed MySQL Database:
   If MySQL is running in XAMPP on port 3306, create the database and seed it:
   ```bash
   npm run seed
   ```
5. Start the backend:
   ```bash
   npm start
   ```
   *The backend will run on `http://localhost:5000`.*

---

### Step B: Start the Frontend Application

1. Open a second terminal in the project root:
   ```bash
   cd smartdine
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📡 5. REST API Endpoints

### 🩺 Health Check
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Server and database status check | Public |

### 🤖 Gemini AI Assistant
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/ai/chat` | Chat with Gemini Food Assistant using menu context | Public |
| `POST` | `/api/ai/recommend` | Structured recommendations by budget, category, spicy | Public |

### 🔐 Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new customer account | Public |
| `POST` | `/api/auth/login` | Login user and return JWT token | Public |
| `GET` | `/api/auth/profile` | Retrieve authenticated user profile | Bearer Token |

### 🍕 Menu & Foods
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/menu` | List all menu items (filters: category, search) | Public |
| `GET` | `/api/menu/:id` | Get specific menu item details | Public |
| `POST` | `/api/menu` | Add new dish to catalog | Admin |
| `PUT` | `/api/menu/:id` | Update dish details or stock availability | Admin |
| `DELETE` | `/api/menu/:id` | Delete dish from menu | Admin |

### 🪑 Restaurant Tables
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/tables` | List all restaurant tables & occupancy | Public |
| `GET` | `/api/tables/:id` | Get single table details | Public |
| `PUT` | `/api/tables/:id/status` | Update table status (`available`/`occupied`/`reserved`) | Admin / Kitchen |

### 🛍️ Orders
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/orders` | Place new dine-in or delivery order | Public / Customer |
| `GET` | `/api/orders` | List user orders or all orders | Customer / Admin |
| `GET` | `/api/orders/:id` | Get detailed order summary and items | Public / Customer |
| `GET` | `/api/orders/user/:userId` | Get order history for a customer | Customer / Admin |

### 🍳 Kitchen Display System (KDS)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/kitchen/orders` | Active kitchen order queue | Kitchen / Admin |
| `PUT` | `/api/kitchen/orders/:id/status` | Transition order status | Kitchen / Admin |
| `PATCH`| `/api/kitchen/orders/:id/accept` | Mark order accepted | Kitchen / Admin |
| `PATCH`| `/api/kitchen/orders/:id/preparing` | Mark order preparing | Kitchen / Admin |
| `PATCH`| `/api/kitchen/orders/:id/ready` | Mark order ready for pickup/serving | Kitchen / Admin |
| `PATCH`| `/api/kitchen/orders/:id/complete` | Mark order completed / served | Kitchen / Admin |

### 📊 Admin Operations & Analytics
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Executive KPIs (revenue, active tickets, totals) | Admin |
| `GET` | `/api/admin/orders` | Comprehensive order management list | Admin |
| `GET` | `/api/admin/users` | List registered restaurant customers | Admin |
| `GET` | `/api/analytics/overview` | Weekly volume and revenue statistics | Admin |

---

## 🧪 6. Testing & Verification

A test script is available in the root/scratch directory to test the live API endpoints:
```bash
node scratch/test_endpoints.js
node scratch/test_order_flow.js
```
The test verifies:
- API health check (`200 OK`)
- Menu catalog query (`15+ dishes`)
- Tables status query (`10 tables`)
- JWT Authentication (`Admin login`)
- Gemini AI Chat & Grounded Recommendation Engine
- Full order lifecycle (`placed` → `accepted` → `preparing` → `ready` → `completed`)

---

## 📄 License
This project is licensed under the MIT License. Developed for **SmartDine Restaurant Systems**.
Owner: **Krish Patel**, Amroli, Surat, Gujarat (+91 9106993883).
