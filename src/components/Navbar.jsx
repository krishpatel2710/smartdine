import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  UtensilsCrossed,
  ShoppingCart,
  QrCode,
  User,
  LogOut,
  LayoutDashboard,
  ChefHat,
  Menu as MenuIcon,
  X,
  History,
  Bot,
  Sparkles
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemsCount, activeTable, setActiveTable } = useCart();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "info");
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-logo-icon">
            <UtensilsCrossed size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Smart<span className="brand-highlight">Dine</span></span>
            <span className="brand-tagline">🌱 100% Pure Veg</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-only">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Menu
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            My Orders
          </NavLink>
          <NavLink to="/table-order" className={({ isActive }) => `nav-link nav-qr-link ${isActive ? "active" : ""}`}>
            <QrCode size={16} />
            <span>Table Order</span>
            {activeTable && (
              <span className="nav-table-pill" title={`Ordering for Table ${activeTable}`}>
                T{activeTable}
              </span>
            )}
          </NavLink>
          <NavLink to="/ai-assistant" className={({ isActive }) => `nav-link nav-ai-link ${isActive ? "active" : ""}`}>
            <Bot size={16} className="text-orange" />
            <span>AI Assistant</span>
          </NavLink>
        </nav>

        {/* Right Action Icons: Cart, Table info, Login / Profile */}
        <div className="navbar-actions">
          {/* Active Table Quick Indicator if selected */}
          {activeTable && (
            <div className="active-table-badge desktop-only">
              <span>Dine-In: <strong>Table {activeTable}</strong></span>
              <button
                className="clear-table-btn"
                title="Switch to Delivery / Clear Table"
                onClick={() => {
                  setActiveTable(null);
                  showToast("Switched order mode to Delivery", "info");
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Cart Icon with Counter */}
          <Link to="/cart" className="nav-cart-btn" aria-label="View Shopping Cart">
            <ShoppingCart size={20} />
            {totalItemsCount > 0 && (
              <span className="cart-counter-badge">{totalItemsCount}</span>
            )}
          </Link>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="user-dropdown-container desktop-only">
              <div className="user-profile-badge">
                <div className="user-avatar">
                  <User size={15} />
                </div>
                <div className="user-info-text">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role-label">{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-logout-icon"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login-nav desktop-only">
              <User size={16} />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-toggle mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="brand-text">
                <span className="brand-title">Smart<span className="brand-highlight">Dine</span></span>
              </div>
              <button className="mobile-close-btn" onClick={closeMenu}>
                <X size={22} />
              </button>
            </div>

            {activeTable && (
              <div className="mobile-table-notice">
                <span>📍 Ordering for <strong>Table {activeTable}</strong> (Dine-In)</span>
                <button
                  onClick={() => {
                    setActiveTable(null);
                    showToast("Table cleared", "info");
                  }}
                  className="mobile-clear-table"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="mobile-nav-links">
              <NavLink to="/" onClick={closeMenu} className="mobile-nav-item">
                Home
              </NavLink>
              <NavLink to="/menu" onClick={closeMenu} className="mobile-nav-item">
                Menu
              </NavLink>
              <NavLink to="/table-order" onClick={closeMenu} className="mobile-nav-item">
                <QrCode size={18} />
                <span>QR Table Ordering</span>
              </NavLink>
              <NavLink to="/orders" onClick={closeMenu} className="mobile-nav-item">
                <History size={18} />
                <span>My Orders</span>
              </NavLink>
              <NavLink to="/cart" onClick={closeMenu} className="mobile-nav-item">
                <ShoppingCart size={18} />
                <span>Cart ({totalItemsCount} items)</span>
              </NavLink>
              <NavLink to="/ai-assistant" onClick={closeMenu} className="mobile-nav-item mobile-ai-item">
                <Bot size={18} className="text-orange" />
                <span>AI Food Assistant</span>
              </NavLink>

              <hr className="drawer-divider" />

              {user ? (
                <div className="mobile-auth-footer">
                  <div className="mobile-user-card">
                    <User size={18} />
                    <div>
                      <p className="mobile-user-name">{user.name}</p>
                      <span className="mobile-user-email">{user.email} ({user.role})</span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="btn-mobile-logout">
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={closeMenu} className="btn-mobile-login">
                  <User size={18} />
                  <span>Sign In / Demo Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
