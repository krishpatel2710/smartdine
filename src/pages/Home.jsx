import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import FoodCard from "../components/FoodCard";
import {
  QrCode,
  ShoppingBag,
  Zap,
  Activity,
  Sparkles,
  Utensils,
  ChevronRight,
  ShieldCheck,
  Clock,
  HeartHandshake,
  Percent
} from "lucide-react";

export default function Home() {
  const { foodItems } = useOrders();
  const navigate = useNavigate();

  // Pick top 4 popular foods
  const popularFoods = foodItems
    .filter((f) => f.rating >= 4.7 && f.inStock !== false)
    .slice(0, 4);

  const categories = [
    { name: "Pizza", icon: "🍕", count: "4 Items", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80" },
    { name: "Burger", icon: "🍔", count: "3 Items", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80" },
    { name: "Indian", icon: "🍛", count: "4 Items", img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80" },
    { name: "Chinese", icon: "🍜", count: "3 Items", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80" },
    { name: "Drinks", icon: "🥤", count: "3 Items", img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80" },
    { name: "Desserts", icon: "🍰", count: "2 Items", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80" }
  ];

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge pure-veg-hero-badge">
              <span className="diet-dot veg-dot"></span>
              <span>100% Pure Vegetarian • Smart Table & Online Ordering</span>
            </div>

            <h1 className="hero-title">
              Delicious Food. <br />
              <span className="hero-gradient-text">Smart Ordering.</span>
            </h1>

            <p className="hero-subtitle">
              Order online or scan the table QR and enjoy a faster restaurant experience.
              Skip the wait, customize your plate, and track preparation directly to your table or doorstep.
            </p>

            <div className="hero-actions">
              <Link to="/menu" className="btn-hero-primary">
                <ShoppingBag size={18} />
                <span>Order Now</span>
              </Link>
              <Link to="/table-order" className="btn-hero-secondary">
                <QrCode size={18} />
                <span>Scan Table QR</span>
              </Link>
            </div>

            {/* Quick Metrics Strip */}
            <div className="hero-stats-strip">
              <div className="hero-stat">
                <span className="stat-number">18 mins</span>
                <span className="stat-label">Avg. Kitchen Prep</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-number">8 Tables</span>
                <span className="stat-label">Live QR Enabled</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-number">4.8 ★</span>
                <span className="stat-label">Customer Rating</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img
                src="/images/smartdine-hero-feast.jpg"
                alt="100% Pure Vegetarian SmartDine Feast"
                className="hero-main-img"
              />
              <div className="hero-floating-card floating-qr">
                <QrCode size={26} className="text-orange" />
                <div>
                  <span className="floating-title">Table 5 Connected</span>
                  <span className="floating-sub">Instant Dine-In Menu</span>
                </div>
              </div>

              <div className="hero-floating-card floating-prep">
                <Zap size={22} className="text-emerald" />
                <div>
                  <span className="floating-title">Live Kitchen Feed</span>
                  <span className="floating-sub">Real-time status sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPECIAL OFFERS SECTION */}
      <section className="offers-section">
        <div className="page-container">
          <div className="section-header-compact">
            <div className="header-left">
              <span className="section-eyebrow">SAVINGS</span>
              <h2 className="section-title">Today's Special Offers</h2>
            </div>
            <Link to="/menu" className="section-link">
              <span>View All Menu</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="offers-grid">
            <div className="offer-banner-card banner-gradient-orange">
              <div className="offer-text">
                <span className="offer-tag"><Percent size={14} /> DINE-IN PERK</span>
                <h3 className="offer-headline">Flat 20% Off on Table Orders</h3>
                <p>Use code <strong>DINESMART</strong> when ordering from your table QR code.</p>
                <Link to="/table-order" className="btn-offer-cta">
                  <span>Scan Table QR</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="offer-art">🍽️</div>
            </div>

            <div className="offer-banner-card banner-gradient-dark">
              <div className="offer-text">
                <span className="offer-tag"><Zap size={14} /> QUICK COMBO</span>
                <h3 className="offer-headline">Pizza + Beverage @ ₹199</h3>
                <p>Choose any personal pizza and get a chilled Cold Coffee on the house.</p>
                <Link to="/menu" className="btn-offer-cta">
                  <span>Claim Combo</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="offer-art">🍕</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="categories-section">
        <div className="page-container">
          <div className="section-header-center">
            <span className="section-eyebrow">CURATED FLAVORS</span>
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-desc">Handcrafted recipes prepared fresh on every single order.</p>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="category-card"
                onClick={() => navigate(`/menu?category=${cat.name}`)}
              >
                <div className="category-img-box">
                  <img src={cat.img} alt={cat.name} />
                  <span className="cat-icon-badge">{cat.icon}</span>
                </div>
                <h4 className="category-name">{cat.name}</h4>
                <span className="category-count">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR FOODS */}
      <section className="popular-foods-section">
        <div className="page-container">
          <div className="section-header-compact">
            <div className="header-left">
              <span className="section-eyebrow">CHEF'S PICKS</span>
              <h2 className="section-title">Most Popular Foods</h2>
            </div>
            <Link to="/menu" className="section-link">
              <span>See Full Menu</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="food-grid">
            {popularFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY SMARTDINE? */}
      <section className="why-section">
        <div className="page-container">
          <div className="section-header-center">
            <span className="section-eyebrow">THE SMART RESTAURANT ADVANTAGE</span>
            <h2 className="section-title">Why SmartDine?</h2>
            <p className="section-desc">
              Designed for modern diners who value their time, food temperature, and convenience.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box icon-fast">
                <Zap size={24} />
              </div>
              <h3 className="feature-title">Fast Ordering</h3>
              <p className="feature-text">
                Browse our interactive visual menu, customize your order, and place it in under 30 seconds with zero delays.
              </p>
              <div className="feature-tick">✓ Instant Order Dispatch</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box icon-tracking">
                <Activity size={24} />
              </div>
              <h3 className="feature-title">Live Order Tracking</h3>
              <p className="feature-text">
                Track every milestone: Order Placed → Kitchen Accepted → Preparing → Food Ready → Served or Delivered.
              </p>
              <div className="feature-tick">✓ Real-time status sync</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box icon-qr">
                <QrCode size={24} />
              </div>
              <h3 className="feature-title">QR Table Ordering</h3>
              <p className="feature-text">
                Seated at a restaurant table? Skip waiting for staff. Scan the table QR, order directly, and have food brought to you.
              </p>
              <div className="feature-tick">✓ 100% Contactless Dining</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box icon-fresh">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">100% Pure Veg & Fresh</h3>
              <p className="feature-text">
                Prepared with highest sattvic hygiene, farm-fresh produce, pure dairy butter and paneer, with zero meat or eggs.
              </p>
              <div className="feature-tick">✓ 100% Pure Vegetarian Kitchen</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DINE-IN QR CALL TO ACTION */}
      <section className="qr-cta-section">
        <div className="page-container">
          <div className="qr-cta-box">
            <div className="qr-cta-text">
              <span className="qr-cta-eyebrow">AT THE RESTAURANT?</span>
              <h2 className="qr-cta-heading">Ready to Order From Your Table?</h2>
              <p className="qr-cta-description">
                Experience table ordering the smart way. Scan your table QR code, browse fresh pure-veg dishes, and watch the kitchen prepare your meal live.
              </p>
              <div className="qr-cta-buttons">
                <Link to="/table-order" className="btn-cta-qr">
                  <QrCode size={18} />
                  <span>Scan Table QR</span>
                </Link>
                <Link to="/orders" className="btn-cta-secondary">
                  <span>Track Past Orders</span>
                </Link>
              </div>
            </div>

            <div className="qr-cta-mockup">
              <div className="mockup-qr-card">
                <div className="mockup-qr-header">
                  <Utensils size={18} />
                  <span>SmartDine Table QR</span>
                </div>
                <div className="mockup-qr-code">
                  <QrCode size={120} strokeWidth={1.5} />
                </div>
                <span className="mockup-table-no">Table 5 • Dine-In</span>
                <span className="mockup-scan-hint">Scan with phone camera</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
