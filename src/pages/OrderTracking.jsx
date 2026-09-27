import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrders, normalizeOrder } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import OrderStatus from "../components/OrderStatus";
import {
  CheckCircle,
  Clock,
  Flame,
  BellRing,
  CheckCheck,
  ArrowLeft,
  QrCode,
  MapPin,
  Utensils,
  Play,
  RotateCcw,
  Sparkles,
  PhoneCall
} from "lucide-react";
import { orderAPI } from "../services/api";

export default function OrderTracking() {
  const { orderId } = useParams();
  const { orders, getOrderById, updateOrderStatus } = useOrders();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState("");
  const [liveOrder, setLiveOrder] = useState(null);

  // Fetch real-time status from backend GET /api/orders/:id
  useEffect(() => {
    const idToFetch = orderId || (orders.length > 0 ? orders[0].id : null);
    if (!idToFetch) return;

    orderAPI
      .getById(idToFetch)
      .then((res) => {
        if (res?.success && res.data) {
          const normalized = normalizeOrder(res.data);
          setLiveOrder(normalized);
        }
      })
      .catch(() => {});
  }, [orderId, orders]);

  // Determine active order (prefer live backend status)
  const activeOrder =
    liveOrder ||
    (orderId
      ? getOrderById(orderId)
      : orders.length > 0
      ? orders[0]
      : null);

  const steps = [
    { key: "Pending", label: "Order Placed", desc: "Sent to kitchen", icon: Clock },
    { key: "Accepted", label: "Restaurant Accepted", desc: "Chef confirmed receipt", icon: CheckCircle },
    { key: "Preparing", label: "Preparing in Kitchen", desc: "Cooking fresh with care", icon: Flame },
    { key: "Ready", label: "Food Ready", desc: "Plated & ready for pickup/serve", icon: BellRing },
    { key: "Completed", label: activeOrder?.orderType === "Dine-In" ? "Served at Table" : "Delivered", desc: "Enjoy your meal!", icon: CheckCheck }
  ];

  // Helper to determine stage index
  const getStepIndex = (status) => {
    switch (status) {
      case "Pending": return 0;
      case "Accepted": return 1;
      case "Preparing": return 2;
      case "Ready": return 3;
      case "Completed": return 4;
      case "Cancelled": return -1;
      default: return 0;
    }
  };

  const currentIndex = activeOrder ? getStepIndex(activeOrder.status) : 0;
  const progressPercent = currentIndex >= 0 ? Math.min(100, Math.round((currentIndex / 4) * 100)) : 0;

  // Simulator handler for evaluator
  const handleAdvanceSimulator = () => {
    if (!activeOrder) return;
    const flow = ["Pending", "Accepted", "Preparing", "Ready", "Completed"];
    const curr = flow.indexOf(activeOrder.status);
    if (curr < flow.length - 1) {
      const nextStatus = flow[curr + 1];
      updateOrderStatus(activeOrder.id, nextStatus);
      showToast(`Order status updated to: ${nextStatus} 🚀`, "success");
    } else {
      showToast("Order is already Completed!", "info");
    }
  };

  const handleResetSimulator = () => {
    if (!activeOrder) return;
    updateOrderStatus(activeOrder.id, "Pending");
    showToast("Reset order status to Pending", "info");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim().toUpperCase()}`);
    }
  };

  if (!activeOrder) {
    return (
      <div className="order-tracking-page">
        <div className="page-container py-12 text-center">
          <div className="empty-cart-card">
            <h2>Order Not Found</h2>
            <p>Could not locate an order matching ID <strong>{orderId}</strong>.</p>
            <form onSubmit={handleSearchSubmit} className="order-lookup-form mt-4">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. SD1024)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn-hero-primary">Track</button>
            </form>
            <Link to="/orders" className="btn-explore-menu mt-6">
              View All My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isDineIn = activeOrder.orderType === "Dine-In" || !!activeOrder.tableNo;

  return (
    <div className="order-tracking-page">
      <div className="page-container">
        {/* Top Header */}
        <div className="tracking-top-nav">
          <Link to="/orders" className="back-to-menu-link">
            <ArrowLeft size={16} />
            <span>My Orders</span>
          </Link>

          {/* Quick ID Search */}
          <form onSubmit={handleSearchSubmit} className="quick-id-search-form">
            <input
              type="text"
              placeholder="Track other ID (e.g. SD1025)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="quick-search-field"
            />
            <button type="submit" className="btn-track-mini">Track</button>
          </form>
        </div>

        {/* Hero Tracking Banner */}
        <div className="tracking-hero-card">
          <div className="tracking-hero-left">
            <span className="live-pulse-badge">
              <span className="pulse-dot"></span> LIVE TRACKING
            </span>
            <h1 className="tracking-title">
              Order #{activeOrder.id}
            </h1>
            <p className="tracking-subtitle">
              Placed on {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, {new Date(activeOrder.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="tracking-hero-right">
            <div className="tracking-destination-chip">
              {isDineIn ? (
                <>
                  <QrCode size={18} className="text-orange" />
                  <div>
                    <strong>Table {activeOrder.tableNo}</strong>
                    <span>Dine-In Service</span>
                  </div>
                </>
              ) : (
                <>
                  <MapPin size={18} className="text-orange" />
                  <div>
                    <strong>Home Delivery</strong>
                    <span>Standard Express</span>
                  </div>
                </>
              )}
            </div>
            <OrderStatus status={activeOrder.status} size="lg" />
          </div>
        </div>

        {/* Live Simulator Box (Interactive Feature for College/Demo Evaluation) */}
        <div className="demo-simulator-bar">
          <div className="simulator-label">
            <Sparkles size={16} className="text-orange" />
            <span><strong>Demo Live Simulator:</strong> Test status updates in real-time</span>
          </div>
          <div className="simulator-actions">
            <button
              onClick={handleAdvanceSimulator}
              disabled={activeOrder.status === "Completed" || activeOrder.status === "Cancelled"}
              className="btn-simulator-advance"
              title="Click to advance order to next stage"
            >
              <Play size={14} />
              <span>Simulate Next Stage</span>
            </button>
            <button
              onClick={handleResetSimulator}
              className="btn-simulator-reset"
              title="Reset order back to Pending"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Visual 5-Stage Stepper & Progress Bar */}
        <div className="tracking-stepper-card">
          <h3 className="stepper-section-title">Order Status Flow</h3>

          {/* Continuous Progress Bar */}
          <div className="tracking-progress-track">
            <div
              className="tracking-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="tracking-steps-grid">
            {steps.map((s, idx) => {
              const StepIcon = s.icon;
              const isPast = currentIndex > idx;
              const isCurrent = currentIndex === idx;
              const isFuture = currentIndex < idx;

              let stepStateClass = "step-future";
              if (isPast) stepStateClass = "step-past";
              if (isCurrent) stepStateClass = "step-current";

              return (
                <div key={s.key} className={`tracking-step-col ${stepStateClass}`}>
                  <div className="step-circle">
                    <StepIcon size={20} />
                  </div>
                  <h4 className="step-heading">{s.label}</h4>
                  <p className="step-sub">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-Column Details Breakdown */}
        <div className="tracking-details-grid">
          {/* Items In This Order */}
          <div className="tracking-card">
            <h3 className="card-headline">
              <Utensils size={18} />
              <span>Items Ordered ({activeOrder.items.length})</span>
            </h3>

            <div className="ordered-items-table">
              {activeOrder.items.map((it, idx) => (
                <div key={idx} className="ordered-item-row">
                  <div className="item-name-col">
                    <span className="qty-pill">{it.quantity}x</span>
                    <span className="name-text">{it.name}</span>
                  </div>
                  <span className="price-text">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <hr className="divider-sm" />

            <div className="order-financial-breakdown">
              <div className="fin-row">
                <span>Subtotal</span>
                <span>₹{activeOrder.subtotal}</span>
              </div>
              <div className="fin-row">
                <span>GST (5%)</span>
                <span>₹{activeOrder.tax}</span>
              </div>
              <div className="fin-row">
                <span>Delivery / Service</span>
                <span>{activeOrder.deliveryFee === 0 ? "FREE" : `₹${activeOrder.deliveryFee}`}</span>
              </div>
              <div className="fin-row total-bold">
                <span>Total Paid</span>
                <span>₹{activeOrder.total}</span>
              </div>
            </div>
          </div>

          {/* Delivery / Table Details */}
          <div className="tracking-card">
            <h3 className="card-headline">
              {isDineIn ? <QrCode size={18} /> : <MapPin size={18} />}
              <span>{isDineIn ? "Dine-In Table Details" : "Delivery Details"}</span>
            </h3>

            <div className="meta-info-box">
              <div className="meta-pair">
                <span className="meta-key">Customer Name:</span>
                <span className="meta-val font-semibold">{activeOrder.customer?.name || activeOrder.customer_name || "Guest Customer"}</span>
              </div>
              <div className="meta-pair">
                <span className="meta-key">Phone:</span>
                <span className="meta-val">{activeOrder.customer?.mobile || activeOrder.customer?.phone || activeOrder.customer_phone || "+91 9876543210"}</span>
              </div>
              <div className="meta-pair">
                <span className="meta-key">Email:</span>
                <span className="meta-val">{activeOrder.customer?.email || activeOrder.customer_email || "guest@smartdine.local"}</span>
              </div>
              <div className="meta-pair">
                <span className="meta-key">{isDineIn ? "Table Location:" : "Delivery Address:"}</span>
                <span className="meta-val font-semibold" style={{ color: "#ea580c" }}>
                  {activeOrder.customer?.address || activeOrder.delivery_address || activeOrder.deliveryAddress || (isDineIn ? `Restaurant Table ${activeOrder.tableNo || "QR"}` : "Standard Express Delivery, Amroli, Surat")}
                </span>
              </div>
              <div className="meta-pair">
                <span className="meta-key">Payment Mode:</span>
                <span className="meta-val">{activeOrder.paymentMethod || "UPI"} ({activeOrder.paymentStatus || "Paid"})</span>
              </div>
              {activeOrder.notes && (
                <div className="meta-pair">
                  <span className="meta-key">Kitchen Note:</span>
                  <span className="meta-val italic">"{activeOrder.notes}"</span>
                </div>
              )}
            </div>

            <div className="staff-support-box mt-4">
              <PhoneCall size={18} className="text-orange" />
              <div>
                <strong>Need Help with this Order?</strong>
                <p>Call restaurant owner Krish Patel at +91 9106993883 (Amroli, Surat)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
