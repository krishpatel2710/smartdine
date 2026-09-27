import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders, normalizeOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import OrderCard from "../components/OrderCard";
import { orderAPI } from "../services/api";
import {
  History,
  ShoppingBag,
  ArrowRight,
  Filter,
  Search,
  UtensilsCrossed,
  QrCode
} from "lucide-react";

export default function Orders() {
  const { orders } = useOrders();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'active' | 'completed'
  const [searchTerm, setSearchTerm] = useState("");
  const [myBackendOrders, setMyBackendOrders] = useState(null);

  // Fetch customer orders from backend GET /api/orders/my-orders
  useEffect(() => {
    if (user) {
      orderAPI
        .getMyOrders()
        .then((res) => {
          if (res?.success && res.data && res.data.length > 0) {
            const mapped = res.data.map(normalizeOrder);
            setMyBackendOrders(mapped);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const displayOrders = myBackendOrders || orders;

  // Filter orders
  const filteredOrders = displayOrders.filter((order) => {
    const isMatchingCustomer = user?.email
      ? String(order.customer?.email || "").toLowerCase() === user.email.toLowerCase() || true
      : true;

    const idStr = String(order.id || order.order_number || "");
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      idStr.toLowerCase().includes(search) ||
      order.items?.some((i) => String(i?.name || "").toLowerCase().includes(search));

    const status = String(order.status || "").toLowerCase();
    const isActive = ["pending", "placed", "accepted", "preparing", "ready"].includes(status);
    const isDone = ["completed", "cancelled"].includes(status);

    if (activeTab === "active") return isMatchingCustomer && matchesSearch && isActive;
    if (activeTab === "completed") return isMatchingCustomer && matchesSearch && isDone;
    return isMatchingCustomer && matchesSearch;
  });

  return (
    <div className="orders-history-page">
      <div className="page-container">
        {/* Header */}
        <div className="orders-header-row">
          <div>
            <div className="section-eyebrow-pill">
              <History size={14} />
              <span>YOUR DINING TIMELINE</span>
            </div>
            <h1 className="orders-page-title">My Orders & Tracking</h1>
            <p className="orders-page-subtitle">
              View order receipt histories, check preparation progress, or reorder favorite items.
            </p>
          </div>

          <div className="orders-header-actions">
            <Link to="/menu" className="btn-hero-primary">
              <ShoppingBag size={16} />
              <span>Order Food</span>
            </Link>
            <Link to="/table-order" className="btn-hero-secondary">
              <QrCode size={16} />
              <span>Table QR</span>
            </Link>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="orders-control-bar">
          <div className="orders-tab-group">
            <button
              onClick={() => setActiveTab("all")}
              className={`orders-tab-btn ${activeTab === "all" ? "active" : ""}`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`orders-tab-btn ${activeTab === "active" ? "active" : ""}`}
            >
              Active ({orders.filter((o) => ["Pending", "Accepted", "Preparing", "Ready"].includes(o.status)).length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`orders-tab-btn ${activeTab === "completed" ? "active" : ""}`}
            >
              Completed ({orders.filter((o) => o.status === "Completed").length})
            </button>
          </div>

          <div className="orders-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Order # or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="orders-search-input"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="orders-cards-grid">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="empty-cart-card">
            <UtensilsCrossed size={48} className="empty-cart-icon" />
            <h3>No orders found</h3>
            <p>You have no {activeTab !== "all" ? activeTab : ""} orders matching your criteria.</p>
            <Link to="/menu" className="btn-explore-menu mt-4">
              Browse Menu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
