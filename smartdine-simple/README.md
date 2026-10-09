# 🍽️ SmartDine – Simple HTML, CSS, JavaScript & MongoDB Project

A clean, beginner-friendly and presentation-ready full-stack restaurant ordering system built with:
- **Frontend**: Plain HTML5, CSS3, and Vanilla JavaScript (No React required!).
- **Backend**: Node.js & Express.js.
- **Database**: MongoDB (Mongoose ODM).

---

## 📁 Project Structure

```
smartdine-simple/
│
├── public/                 # Frontend Files
│   ├── index.html          # Main HTML structure
│   ├── style.css           # Modern pure CSS design
│   └── script.js           # Vanilla JavaScript (Fetch API, Cart, Movable AI)
│
├── server.js               # Node.js Express server + MongoDB Mongoose models
├── package.json            # Dependencies (express, mongoose, cors, dotenv)
└── README.md
```

---

## 🚀 How to Run (2 Simple Steps)

### Step 1: Install Dependencies
Open Terminal / Command Prompt inside this folder:
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

Now open your browser and visit:
👉 **`http://localhost:3000`**

---

## 🌟 Key Features in this Simple Version:

1. **100% Pure Vegetarian Menu**: Hand-tossed Pizzas, Burgers, North Indian Gravies, Biryani, and Desserts.
2. **Category Filtering**: Instant switching between Pizza, Burger, Indian, Drinks, Desserts.
3. **Contactless QR Table Dine-In**: Select table 1-5 or Takeaway.
4. **Interactive Cart & Real-Time Calculation**: Add dishes, change quantities (+/-), auto-calculated 5% GST and grand total.
5. **MongoDB Order Placement**: Placing an order sends a POST request to `/api/orders` and saves the order directly into your MongoDB database.
6. **Movable Burger AI Assistant**: Click the floating burger icon on bottom right to chat with the smart food assistant! You can also click and drag it anywhere on your screen.
7. **View MongoDB Orders**: Click "My Orders" in the navbar to see all orders retrieved live from MongoDB.
