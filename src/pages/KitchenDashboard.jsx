import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import {
  ChefHat,
  Clock,
  CheckCircle,
  BellRing,
  CheckCheck,
  Flame,
  QrCode,
  MapPin,
  Store,
  RefreshCw,
  AlertCircle,
  Utensils
} from "lucide-react";
import { kitchenAPI } from "../services/api";

export default function KitchenDashboard() {
  const { orders, updateOrderStatus } = useOrders();
  const { showToast } = useToast();
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Auto-refresh timer display every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefreshed(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders by Kanban stage (case-insensitive & safe)
  const newOrders = orders.filter((o) =>
    ["pending", "placed"].includes(String(o.status || "").toLowerCase())
  );

  // PREPARING: status is "Accepted" or "Preparing"
  const preparingOrders = orders.filter((o) =>
    ["accepted", "preparing"].includes(String(o.status || "").toLowerCase())
  );

  // READY: status is "Ready"
  const readyOrders = orders.filter(
    (o) => String(o.status || "").toLowerCase() === "ready"
  );

  // Kitchen Actions
  const handleAcceptOrder = async (orderId) => {
    try {
      await kitchenAPI.accept(orderId);
      await kitchenAPI.preparing(orderId);
    } catch (e) {
      console.warn("Backend kitchen accept fallback:", e.message);
    }
    updateOrderStatus(orderId, "Preparing");
    showToast(`Order #${orderId} accepted into kitchen prep 🍳`, "success");
  };

  const handleMarkReady = async (orderId) => {
    try {
      await kitchenAPI.ready(orderId);
    } catch (e) {
      console.warn("Backend kitchen ready fallback:", e.message);
    }
    updateOrderStatus(orderId, "Ready");
    showToast(`Order #${orderId} marked ready for pickup/serving! 🛎️`, "success");
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await kitchenAPI.complete(orderId);
    } catch (e) {
      console.warn("Backend kitchen complete fallback:", e.message);
    }
    updateOrderStatus(orderId, "Completed");
    showToast(`Order #${orderId} completed and served! ✅`, "success");
  };

  // Helper to calculate minutes elapsed
  const getElapsedMinutes = (dateString) => {
    const diffMs = new Date() - new Date(dateString);
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    return `${mins}m ago`;
  };

  return (
    <div className="kitchen-display-system">
      {/* High Contrast KDS Top Header */}
      <header className="kds-header">
        <div className="kds-header-left">
          <div className="kds-logo-wrap">
            <ChefHat size={26} className="text-orange" />
          </div>
          <div>
            <h1 className="kds-title">Kitchen Display System (KDS)</h1>
            <span className="kds-subtitle">Live Kitchen Production Line • SmartDine</span>
          </div>
        </div>

        <div className="kds-header-stats">
          <div className="kds-stat-item">
            <span className="kds-stat-count text-amber">{newOrders.length}</span>
            <span className="kds-stat-name">New Orders</span>
          </div>
          <div className="kds-stat-item">
            <span className="kds-stat-count text-blue">{preparingOrders.length}</span>
            <span className="kds-stat-name">In Prep</span>
          </div>
          <div className="kds-stat-item">
            <span className="kds-stat-count text-emerald">{readyOrders.length}</span>
            <span className="kds-stat-name">Ready</span>
          </div>
        </div>

        <div className="kds-header-actions">
          <button
            onClick={() => {
              setLastRefreshed(new Date());
              showToast("Kitchen board synchronized", "info");
            }}
            className="kds-btn-refresh"
            title="Refresh order queue"
          >
            <RefreshCw size={16} />
            <span>Sync</span>
          </button>
          <Link to="/admin" className="kds-btn-exit" title="Back to Admin Dashboard">
            <span>Admin Portal</span>
          </Link>
          <Link to="/" className="kds-btn-exit outline" title="Back to Storefront">
            <Store size={16} />
          </Link>
        </div>
      </header>

      {/* 3-Column Kanban Board */}
      <div className="kds-kanban-board">
        {/* COLUMN 1: NEW ORDERS */}
        <div className="kds-column column-new">
          <div className="kds-column-header">
            <div className="col-header-title">
              <span className="col-indicator-dot dot-new"></span>
              <h3>NEW ORDERS</h3>
            </div>
            <span className="column-count-badge badge-new">{newOrders.length}</span>
          </div>

          <div className="kds-cards-container">
            {newOrders.length > 0 ? (
              newOrders.map((order) => {
                const isDineIn = order.orderType === "Dine-In" || !!order.tableNo;
                return (
                  <div key={order.id} className="kds-ticket ticket-new">
                    <div className="ticket-top">
                      <div className="ticket-id-tag">
                        <strong>#{order.id}</strong>
                        <span className="ticket-timer">
                          <Clock size={12} />
                          <span>{getElapsedMinutes(order.createdAt)}</span>
                        </span>
                      </div>
                      <div className={`ticket-destination-badge ${isDineIn ? "badge-dinein" : "badge-delivery"}`}>
                        {isDineIn ? <QrCode size={13} /> : <MapPin size={13} />}
                        <span>{isDineIn ? `Table ${order.tableNo}` : "Delivery"}</span>
                      </div>
                    </div>

                    <div className="ticket-customer-line">
                      <span>Customer: <strong>{order.customer?.name || order.customer_name || "Guest Customer"}</strong></span>
                      {(order.customer?.mobile || order.customer?.phone || order.customer_phone) && (
                        <span className="text-xs text-muted" style={{ display: "block", marginTop: "2px" }}>
                          📞 {order.customer?.mobile || order.customer?.phone || order.customer_phone}
                        </span>
                      )}
                    </div>
                    {!isDineIn && (order.customer?.address || order.delivery_address || order.deliveryAddress) && (
                      <div className="ticket-address-line" style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 6px 0", display: "flex", alignItems: "center", gap: "3px" }}>
                        <MapPin size={11} color="#ea580c" />
                        <span>{order.customer?.address || order.delivery_address || order.deliveryAddress}</span>
                      </div>
                    )}

                    {/* Food Items Checklist */}
                    <div className="ticket-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="ticket-item-row">
                          <span className="ticket-item-qty">{item.quantity}×</span>
                          <span className="ticket-item-name">{item.name}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="ticket-kitchen-notes">
                        <AlertCircle size={14} />
                        <span>"{order.notes}"</span>
                      </div>
                    )}

                    <div className="ticket-actions">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="btn-kds-action btn-accept"
                      >
                        <Flame size={16} />
                        <span>Accept & Cook</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="kds-empty-col">
                <CheckCircle size={32} className="text-muted" />
                <p>No new pending tickets</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="kds-column column-preparing">
          <div className="kds-column-header">
            <div className="col-header-title">
              <span className="col-indicator-dot dot-preparing"></span>
              <h3>PREPARING</h3>
            </div>
            <span className="column-count-badge badge-prep">{preparingOrders.length}</span>
          </div>

          <div className="kds-cards-container">
            {preparingOrders.length > 0 ? (
              preparingOrders.map((order) => {
                const isDineIn = order.orderType === "Dine-In" || !!order.tableNo;
                return (
                  <div key={order.id} className="kds-ticket ticket-preparing">
                    <div className="ticket-top">
                      <div className="ticket-id-tag">
                        <strong>#{order.id}</strong>
                        <span className="ticket-timer timer-active">
                          <Flame size={12} />
                          <span>{getElapsedMinutes(order.createdAt)}</span>
                        </span>
                      </div>
                      <div className={`ticket-destination-badge ${isDineIn ? "badge-dinein" : "badge-delivery"}`}>
                        {isDineIn ? <QrCode size={13} /> : <MapPin size={13} />}
                        <span>{isDineIn ? `Table ${order.tableNo}` : "Delivery"}</span>
                      </div>
                    </div>

                    <div className="ticket-customer-line">
                      <span>Customer: <strong>{order.customer?.name || order.customer_name || "Guest Customer"}</strong></span>
                      {(order.customer?.mobile || order.customer?.phone || order.customer_phone) && (
                        <span className="text-xs text-muted" style={{ display: "block", marginTop: "2px" }}>
                          📞 {order.customer?.mobile || order.customer?.phone || order.customer_phone}
                        </span>
                      )}
                    </div>
                    {!isDineIn && (order.customer?.address || order.delivery_address || order.deliveryAddress) && (
                      <div className="ticket-address-line" style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 6px 0", display: "flex", alignItems: "center", gap: "3px" }}>
                        <MapPin size={11} color="#ea580c" />
                        <span>{order.customer?.address || order.delivery_address || order.deliveryAddress}</span>
                      </div>
                    )}

                    <div className="ticket-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="ticket-item-row">
                          <span className="ticket-item-qty highlight">{item.quantity}×</span>
                          <span className="ticket-item-name">{item.name}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="ticket-kitchen-notes">
                        <AlertCircle size={14} />
                        <span>"{order.notes}"</span>
                      </div>
                    )}

                    <div className="ticket-actions">
                      <button
                        onClick={() => handleMarkReady(order.id)}
                        className="btn-kds-action btn-ready"
                      >
                        <BellRing size={16} />
                        <span>Mark Ready</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="kds-empty-col">
                <Flame size={32} className="text-muted" />
                <p>Nothing on fire in prep</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: READY */}
        <div className="kds-column column-ready">
          <div className="kds-column-header">
            <div className="col-header-title">
              <span className="col-indicator-dot dot-ready"></span>
              <h3>READY FOR SERVE / PICKUP</h3>
            </div>
            <span className="column-count-badge badge-ready">{readyOrders.length}</span>
          </div>

          <div className="kds-cards-container">
            {readyOrders.length > 0 ? (
              readyOrders.map((order) => {
                const isDineIn = order.orderType === "Dine-In" || !!order.tableNo;
                return (
                  <div key={order.id} className="kds-ticket ticket-ready">
                    <div className="ticket-top">
                      <div className="ticket-id-tag">
                        <strong>#{order.id}</strong>
                        <span className="ticket-timer timer-ready">
                          <BellRing size={12} />
                          <span>Ready {getElapsedMinutes(order.createdAt)}</span>
                        </span>
                      </div>
                      <div className={`ticket-destination-badge ${isDineIn ? "badge-dinein" : "badge-delivery"}`}>
                        {isDineIn ? <QrCode size={13} /> : <MapPin size={13} />}
                        <span>{isDineIn ? `Table ${order.tableNo}` : "Delivery"}</span>
                      </div>
                    </div>

                    <div className="ticket-customer-line">
                      <span>Customer: <strong>{order.customer?.name || order.customer_name || "Guest Customer"}</strong></span>
                      {(order.customer?.mobile || order.customer?.phone || order.customer_phone) && (
                        <span className="text-xs text-muted" style={{ display: "block", marginTop: "2px" }}>
                          📞 {order.customer?.mobile || order.customer?.phone || order.customer_phone}
                        </span>
                      )}
                    </div>
                    {!isDineIn && (order.customer?.address || order.delivery_address || order.deliveryAddress) && (
                      <div className="ticket-address-line" style={{ fontSize: "0.75rem", color: "#64748b", margin: "2px 0 6px 0", display: "flex", alignItems: "center", gap: "3px" }}>
                        <MapPin size={11} color="#ea580c" />
                        <span>{order.customer?.address || order.delivery_address || order.deliveryAddress}</span>
                      </div>
                    )}

                    <div className="ticket-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="ticket-item-row ready-item">
                          <span className="ticket-item-qty">{item.quantity}×</span>
                          <span className="ticket-item-name">{item.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="ticket-actions">
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        className="btn-kds-action btn-complete"
                      >
                        <CheckCheck size={16} />
                        <span>{isDineIn ? "Served to Table" : "Dispatched / Complete"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="kds-empty-col">
                <BellRing size={32} className="text-muted" />
                <p>No orders awaiting pickup</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
