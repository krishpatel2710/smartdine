import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  ArrowLeft,
  Truck,
  QrCode,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Utensils
} from "lucide-react";

export default function Checkout() {
  const {
    cart,
    subtotal,
    tax,
    deliveryFee,
    grandTotal,
    clearCart,
    activeTable
  } = useCart();

  const { createOrder } = useOrders();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // If table was scanned via QR code, order is automatically locked to that table!
  const isDineIn = Boolean(activeTable);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "Rahul Verma",
    email: user?.email || "rahul.verma@example.com",
    mobile: "9876543210",
    address: isDineIn ? `Restaurant Dine-In Table ${activeTable}` : "Flat 402, Riverview Heights, Amroli, Surat",
    notes: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, redirect to menu
  if (cart.length === 0) {
    return (
      <div className="page-container py-12 text-center">
        <div className="empty-cart-card">
          <h2>No items to checkout</h2>
          <p>Please add some delicious items from our menu first.</p>
          <Link to="/menu" className="btn-explore-menu mt-4">
            Go to Menu
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.mobile || !formData.email) {
      showToast("Please fill in your contact information", "error");
      return;
    }

    if (!isDineIn && !formData.address) {
      showToast("Please provide a delivery address", "error");
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customer: {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        address: isDineIn ? `Restaurant Dine-In Table ${activeTable}` : formData.address
      },
      orderType: isDineIn ? "Dine-In" : "Delivery",
      tableNo: isDineIn ? activeTable : null,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        isVeg: i.isVeg
      })),
      subtotal,
      tax,
      deliveryFee: isDineIn ? 0 : deliveryFee,
      total: isDineIn ? Math.round(subtotal + tax) : grandTotal,
      paymentMethod,
      notes: formData.notes
    };

    // Order placement
    setTimeout(async () => {
      try {
        const placedOrder = await createOrder(orderPayload);
        clearCart();
        showToast(
          isDineIn
            ? `Order sent to kitchen for Table ${activeTable}! 🎉`
            : "Order Placed Successfully! 🎉",
          "success"
        );
        setIsSubmitting(false);
        navigate(`/track/${placedOrder.id}`);
      } catch (err) {
        showToast("Error placing order: " + err.message, "error");
        setIsSubmitting(false);
      }
    }, 500);
  };

  return (
    <div className="checkout-page">
      <div className="page-container">
        {/* Header */}
        <div className="checkout-header">
          <Link to="/cart" className="back-to-menu-link">
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </Link>
          <h1 className="checkout-title">Complete Your Order</h1>
        </div>

        <form onSubmit={handleSubmit} className="checkout-layout-grid">
          {/* Left Column: Customer & Payment Form */}
          <div className="checkout-form-column">
            {/* 1. Dining Destination Status (Strictly locked from QR scan - NEVER show table picker) */}
            <div className="checkout-section-card">
              <h2 className="checkout-section-title">1. Order Destination</h2>

              {isDineIn ? (
                /* Auto-Detected from QR Scan: Locked Table Card */
                <div className="scanned-table-locked-card">
                  <div className="table-locked-icon">
                    <QrCode size={26} className="text-emerald" />
                  </div>
                  <div className="table-locked-text">
                    <div className="table-badge-row">
                      <span className="badge-scanned-table">
                        <Lock size={12} className="inline mr-1" />
                        TABLE {activeTable} VERIFIED
                      </span>
                      <span className="badge-pure-veg">🌱 100% PURE VEG DINE-IN</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">
                      Dine-In Order: Table {activeTable}
                    </h3>
                    <p className="text-sm text-muted">
                      Your table was automatically verified from your QR code scan. Food will be prepared fresh by the kitchen and served directly to <strong>Table {activeTable}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                /* Home Delivery Mode */
                <div className="delivery-confirmed-card">
                  <div className="table-locked-icon">
                    <Truck size={26} className="text-orange" />
                  </div>
                  <div className="table-locked-text">
                    <div className="table-badge-row">
                      <span className="badge-delivery-tag">HOME DELIVERY</span>
                      <span className="badge-pure-veg">🌱 100% PURE VEG</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">
                      Direct Doorstep Delivery
                    </h3>
                    <p className="text-sm text-muted">
                      Freshly prepared vegetarian meals delivered hot to your doorstep.
                    </p>
                    <div className="dinein-prompt-link mt-2">
                      <span className="text-xs text-muted mr-2">Sitting in our restaurant?</span>
                      <Link to="/table-order" className="text-xs text-orange font-semibold hover:underline">
                        Scan Table QR Stand
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Customer Contact Information */}
            <div className="checkout-section-card">
              <h2 className="checkout-section-title">2. Contact Information</h2>

              <div className="form-grid-two">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number *</label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="form-input"
                />
              </div>

              {/* Delivery Address: ONLY shown for Home Delivery, never needed for Table Dine-In */}
              {!isDineIn && (
                <div className="form-group">
                  <label htmlFor="address">Delivery Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    required={!isDineIn}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Flat No, Apartment, Street, Landmark, Pin code"
                    className="form-textarea"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="notes">Special Kitchen Instructions (Optional)</label>
                <input
                  id="notes"
                  name="notes"
                  type="text"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Less spicy, Jain preparation, extra napkins..."
                  className="form-input"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="checkout-section-card">
              <h2 className="checkout-section-title">3. Payment Method</h2>

              <div className="payment-options-grid">
                <label className={`payment-card-option ${paymentMethod === "UPI" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Smartphone size={22} className="payment-icon" />
                  <div>
                    <strong>UPI / QR Scan</strong>
                    <span className="text-muted text-xs">GPay, PhonePe, Paytm</span>
                  </div>
                </label>

                <label className={`payment-card-option ${paymentMethod === "Card" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Card"
                    checked={paymentMethod === "Card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <CreditCard size={22} className="payment-icon" />
                  <div>
                    <strong>Credit / Debit Card</strong>
                    <span className="text-muted text-xs">Visa, MasterCard, RuPay</span>
                  </div>
                </label>

                <label className={`payment-card-option ${paymentMethod === "Cash" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash"
                    checked={paymentMethod === "Cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Banknote size={22} className="payment-icon" />
                  <div>
                    <strong>{isDineIn ? "Cash at Counter / Table" : "Cash on Delivery"}</strong>
                    <span className="text-muted text-xs">{isDineIn ? "Pay after meal" : "Pay at door"}</span>
                  </div>
                </label>
              </div>

              {/* Simulated UPI fast payment notice */}
              {paymentMethod === "UPI" && (
                <div className="simulated-upi-banner">
                  <div className="upi-badge">Demo Fast-Pay UPI</div>
                  <p>Order amount ₹{isDineIn ? Math.round(subtotal + tax) : grandTotal} will be simulated as Instant UPI Verified.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Review Sidebar */}
          <div className="checkout-summary-column">
            <div className="order-summary-card sticky-sidebar">
              <h3 className="summary-title">Review Items ({cart.length})</h3>

              <div className="checkout-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="checkout-item-line">
                    <div className="line-info">
                      <span className="line-name">{item.name}</span>
                      <span className="line-qty">× {item.quantity}</span>
                    </div>
                    <span className="line-price">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <hr className="summary-divider" />

              <div className="summary-rows">
                <div className="summary-row">
                  <span className="label">Subtotal</span>
                  <span className="val">₹{subtotal}</span>
                </div>
                <div className="summary-row">
                  <span className="label">GST (5%)</span>
                  <span className="val">₹{tax}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Delivery Fee</span>
                  <span className="val">
                    {isDineIn || deliveryFee === 0 ? (
                      <strong className="text-emerald">FREE</strong>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-row grand-total-row">
                  <span className="total-title">Total Payable</span>
                  <span className="grand-total-val">
                    ₹{isDineIn ? Math.round(subtotal + tax) : grandTotal}
                  </span>
                </div>
              </div>

              <div className="destination-preview">
                {isDineIn ? (
                  <div className="dest-badge dest-dinein">
                    <QrCode size={16} />
                    <span>Serving directly to <strong>Table {activeTable}</strong></span>
                  </div>
                ) : (
                  <div className="dest-badge dest-delivery">
                    <Truck size={16} />
                    <span>Delivering to Home / Work</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-place-order"
              >
                {isSubmitting ? (
                  <span>Transmitting to Kitchen...</span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>
                      {isDineIn
                        ? `Confirm & Send to Table ${activeTable} Kitchen (₹${Math.round(subtotal + tax)})`
                        : `Confirm & Place Order (₹${grandTotal})`}
                    </span>
                  </>
                )}
              </button>

              <div className="cart-security-badge mt-4">
                <ShieldCheck size={16} />
                <span>Instant dispatch to restaurant kitchen</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
