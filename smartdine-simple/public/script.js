// ==========================================
// SmartDine – Vanilla JavaScript Frontend
// Connects HTML/CSS UI with Node.js & MongoDB
// ==========================================

let foodsData = [];
let cart = [];
let selectedCategory = "All";

// DOM Elements
const foodsGrid = document.getElementById("foodsGrid");
const categoryFilters = document.getElementById("categoryFilters");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsList = document.getElementById("cartItemsList");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTax = document.getElementById("cartTax");
const cartGrandTotal = document.getElementById("cartGrandTotal");
const checkoutForm = document.getElementById("checkoutForm");
const tableSelect = document.getElementById("tableSelect");

// Orders DOM
const viewOrdersBtn = document.getElementById("viewOrdersBtn");
const ordersModal = document.getElementById("ordersModal");
const closeOrdersBtn = document.getElementById("closeOrdersBtn");
const ordersListContainer = document.getElementById("ordersListContainer");
const ordersCount = document.getElementById("ordersCount");

// AI Chat DOM
const aiBurgerWidget = document.getElementById("aiBurgerWidget");
const aiChatWindow = document.getElementById("aiChatWindow");
const closeAiChat = document.getElementById("closeAiChat");
const aiChatForm = document.getElementById("aiChatForm");
const aiInput = document.getElementById("aiInput");
const chatMessages = document.getElementById("chatMessages");

// 1. Fetch Menu from MongoDB Backend
async function fetchMenu() {
  try {
    const res = await fetch("/api/foods");
    const json = await res.json();
    if (json.success && json.data) {
      foodsData = json.data;
      renderFoods();
    }
  } catch (err) {
    console.error("Failed to fetch menu:", err);
    foodsGrid.innerHTML = `<p class="error">Could not connect to server. Make sure node server.js is running.</p>`;
  }
}

// 2. Render Food Cards Grid
function renderFoods() {
  const filtered = selectedCategory === "All"
    ? foodsData
    : foodsData.filter(f => f.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filtered.length === 0) {
    foodsGrid.innerHTML = `<p class="empty-state">No dishes found in this category.</p>`;
    return;
  }

  foodsGrid.innerHTML = filtered.map(dish => `
    <div class="food-card">
      <div class="food-img-wrap">
        <img src="${dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}" alt="${dish.name}" loading="lazy">
        <span class="veg-tag">🌿 PURE VEG</span>
      </div>
      <div class="food-info">
        <div class="food-title-row">
          <h3>${dish.name}</h3>
          <span class="rating">★ ${dish.rating || 4.8}</span>
        </div>
        <p class="food-desc">${dish.description || ''}</p>
        <div class="food-bottom">
          <span class="price">₹${dish.price}</span>
          <button class="btn btn-primary" onclick="addToCart('${dish.name}', ${dish.price})">
            + Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// 3. Category Filter Buttons
categoryFilters.addEventListener("click", (e) => {
  if (e.target.classList.contains("cat-btn")) {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    selectedCategory = e.target.getAttribute("data-category");
    renderFoods();
  }
});

// 4. Cart Operations
window.addToCart = function(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartUI();
  // Feedback animation
  cartBtn.style.transform = "scale(1.15)";
  setTimeout(() => cartBtn.style.transform = "scale(1)", 200);
};

window.changeQty = function(name, delta) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.name !== name);
    }
  }
  updateCartUI();
};

function updateCartUI() {
  const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  cartCount.textContent = totalCount;

  if (cart.length === 0) {
    cartItemsList.innerHTML = `<p class="empty-cart-text">Your cart is currently empty. Add dishes from the menu!</p>`;
    cartSubtotal.textContent = "₹0";
    cartTax.textContent = "₹0";
    cartGrandTotal.textContent = "₹0";
    return;
  }

  cartItemsList.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <div>
        <strong>${item.name}</strong>
        <div style="font-size: 0.8rem; color: #64748b;">₹${item.price} each</div>
      </div>
      <div class="qty-control">
        <button type="button" class="qty-btn" onclick="changeQty('${item.name}', -1)">-</button>
        <span>${item.quantity}</span>
        <button type="button" class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
      </div>
      <div><strong>₹${item.price * item.quantity}</strong></div>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;

  cartSubtotal.textContent = `₹${subtotal}`;
  cartTax.textContent = `₹${tax}`;
  cartGrandTotal.textContent = `₹${grandTotal}`;
}

// 5. Checkout / Place Order into MongoDB
checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (cart.length === 0) {
    alert("Please add items to your cart first!");
    return;
  }

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const tableVal = tableSelect.value;
  const isDineIn = tableVal !== "none";

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const grandTotal = subtotal + Math.round(subtotal * 0.05);

  const orderPayload = {
    customer_name: name,
    customer_phone: phone,
    order_type: isDineIn ? "dine_in" : "delivery",
    table_number: isDineIn ? Number(tableVal) : null,
    items: cart,
    total_amount: grandTotal
  };

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });
    const result = await res.json();

    if (result.success) {
      alert(`🎉 Order Placed Successfully in MongoDB!\nOrder No: ${result.data.order_number}\nTotal Amount: ₹${result.data.total_amount}`);
      cart = [];
      updateCartUI();
      cartModal.classList.add("hidden");
      checkoutForm.reset();
      fetchOrdersCount();
    } else {
      alert("Error placing order: " + result.message);
    }
  } catch (err) {
    alert("Server error while placing order.");
  }
});

// 6. View Orders from MongoDB
async function fetchOrdersCount() {
  try {
    const res = await fetch("/api/orders");
    const json = await res.json();
    if (json.success && json.data) {
      ordersCount.textContent = json.data.length;
    }
  } catch (err) {}
}

async function showOrders() {
  ordersModal.classList.remove("hidden");
  ordersListContainer.innerHTML = "<p>Loading orders from MongoDB...</p>";

  try {
    const res = await fetch("/api/orders");
    const json = await res.json();

    if (json.success && json.data && json.data.length > 0) {
      ordersListContainer.innerHTML = `
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Type / Table</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${json.data.map(o => `
              <tr>
                <td><strong>${o.order_number}</strong></td>
                <td>${o.customer_name || 'Guest'}</td>
                <td>${o.order_type === 'dine_in' ? `Table ${o.table_number}` : 'Takeaway'}</td>
                <td>${(o.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
                <td><strong>₹${o.total_amount}</strong></td>
                <td><span class="badge badge-placed">${o.status.toUpperCase()}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else {
      ordersListContainer.innerHTML = "<p>No orders found in MongoDB yet.</p>";
    }
  } catch (err) {
    ordersListContainer.innerHTML = "<p>Error loading orders.</p>";
  }
}

// Modal open/close listeners
cartBtn.addEventListener("click", () => cartModal.classList.remove("hidden"));
closeCartBtn.addEventListener("click", () => cartModal.classList.add("hidden"));

viewOrdersBtn.addEventListener("click", showOrders);
closeOrdersBtn.addEventListener("click", () => ordersModal.classList.add("hidden"));

// 7. Movable / Draggable Burger AI Assistant Logic
let isDragging = false;
let startX, startY, initialLeft, initialTop;
let dragOccurred = false;

aiBurgerWidget.addEventListener("mousedown", (e) => {
  isDragging = true;
  dragOccurred = false;
  startX = e.clientX;
  startY = e.clientY;
  
  const rect = aiBurgerWidget.getBoundingClientRect();
  initialLeft = rect.left;
  initialTop = rect.top;

  aiBurgerWidget.style.right = "auto";
  aiBurgerWidget.style.bottom = "auto";
  aiBurgerWidget.style.left = initialLeft + "px";
  aiBurgerWidget.style.top = initialTop + "px";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    dragOccurred = true;
  }

  aiBurgerWidget.style.left = `${initialLeft + dx}px`;
  aiBurgerWidget.style.top = `${initialTop + dy}px`;
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

// Click toggles chat window if not dragged
aiBurgerWidget.addEventListener("click", () => {
  if (!dragOccurred) {
    aiChatWindow.classList.toggle("hidden");
  }
});

closeAiChat.addEventListener("click", () => {
  aiChatWindow.classList.add("hidden");
});

// 8. AI Chatbot Message Handler
aiChatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = aiInput.value.trim();
  if (!text) return;

  appendMessage(text, "user-msg");
  aiInput.value = "";

  const loadingMsg = appendMessage("Thinking...", "ai-msg");

  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const json = await res.json();
    loadingMsg.innerHTML = json.reply || "Sorry, I could not check the menu.";
  } catch (err) {
    loadingMsg.textContent = "AI Assistant connection error.";
  }
});

// Quick suggestion chips
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    aiInput.value = chip.getAttribute("data-prompt");
    aiChatForm.dispatchEvent(new Event("submit"));
  });
});

function appendMessage(text, className) {
  const div = document.createElement("div");
  div.className = `message ${className}`;
  div.innerHTML = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

// Initial Boot
fetchMenu();
fetchOrdersCount();
