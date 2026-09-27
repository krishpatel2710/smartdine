import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  ChefHat,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  Store
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "info");
    navigate("/");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop mobile-only" onClick={onClose}></div>}

      <aside className={`admin-sidebar ${isOpen ? "sidebar-open" : ""}`}>
        {/* Sidebar Brand Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <div className="sidebar-logo-icon">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <span className="sidebar-title">Smart<strong>Dine</strong></span>
              <span className="sidebar-tag">Portal</span>
            </div>
          </Link>
        </div>

        {/* User Role Card in Sidebar */}
        <div className="sidebar-user-pill">
          <div className="sidebar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{user?.name || "Krish Patel (Owner)"}</span>
            <span className="sidebar-user-role">{user?.role?.toUpperCase() || "ADMIN"}</span>
            <span className="sidebar-user-phone text-xs text-muted">📞 9106993883 • Amroli, Surat</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-group-title">MAIN MENU</div>
          <NavLink
            to="/admin"
            end
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <ShoppingBag size={18} />
            <span>Live Orders</span>
          </NavLink>

          <NavLink
            to="/admin/menu"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <UtensilsCrossed size={18} />
            <span>Menu Management</span>
          </NavLink>

          <NavLink
            to="/kitchen"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <ChefHat size={18} />
            <span>Kitchen Display (KDS)</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <BarChart3 size={18} />
            <span>Analytics & Reports</span>
          </NavLink>

          <div className="sidebar-nav-group-title">MANAGEMENT</div>
          <NavLink
            to="/admin/customers"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <Users size={18} />
            <span>Customers</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <Settings size={18} />
            <span>Restaurant Settings</span>
          </NavLink>
        </nav>

        {/* Bottom Actions */}
        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link return-store-link" onClick={onClose}>
            <Store size={18} />
            <span>Customer Website</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
