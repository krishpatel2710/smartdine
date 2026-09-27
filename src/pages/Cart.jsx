import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  QrCode,
  Truck,
  ArrowLeft,
  ShieldCheck,
  Tag
} from "lucide-react";

export default function Cart() {
  const {
    cart,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    grandTotal,
    totalItemsCount,
    isDineIn,
    activeTable,
    setActiveTable,
    orderType,
    setOrderType
  } = useCart();

  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="page-container">
          <div className="empty-cart-card">
            <div className="empty-cart-icon-wrap">
              <ShoppingBag size={56} className="empty-cart-icon" />
            </div>
            <h2>Your cart is currently empty</h2>
            <p>
              Looks like you haven't added anything to your plate yet. Explore our mouthwatering pizzas, burgers, biryanis, and drinks!
            </p>
            <div className="empty-cart-actions">
              <Link to="/menu" className="btn-explore-menu">
                <ShoppingBag size={18} />
                <span>Explore Full Menu</span>
              </Link>
              <Link to="/table-order" className="btn-table-alt">
                <QrCode size={18} />
                <span>Scan Table QR</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-container">
        {/* Breadcrumb / Title */}
        <div className="cart-page-header">
          <div>
            <Link to="/menu" className="back-to-menu-link">
              <ArrowLeft size={16} />
              <span>Continue Ordering</span>
            </Link>
            <h1 className="cart-title">Your Order Cart</h1>
          </div>
          <button onClick={clearCart} className="btn-clear-cart" title="Clear entire cart">
            <Trash2 size={16} />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="cart-layout-grid">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-section">
            {/* Dining Mode Status */}
            {activeTable ? (
              <div className="cart-table-locked-banner">
                <div className="table-locked-icon-badge">
                  <QrCode size={20} className="text-emerald" />
                </div>
                <div className="table-locked-info">
                  <div className="locked-pill-title">
                    <strong>Dine-In: Table {activeTable}</strong>
                    <span className="tag-qr-verified">QR Scanned & Verified</span>
                  </div>
                  <span className="text-xs text-muted">
                    Auto-detected from your table QR code scan. Food will be served hot directly to Table {activeTable}.
                  </span>
                </div>
              </div>
            ) : (
              <div className="cart-delivery-banner">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-orange" />
                  <span>Order Type: <strong>Home Delivery</strong></span>
                </div>
                <Link to="/table-order" className="btn-cart-scan-link">
                  <QrCode size={14} />
                  <span>Scan Table QR to Dine-In</span>
                </Link>
              </div>
            )}

            {/* List of Cart Items */}
            <div className="cart-items-card">
              <div className="cart-items-header">
                <span>Items ({totalItemsCount})</span>
                <span>Qty & Price</span>
              </div>
              <div className="cart-items-body">
                {cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="promo-code-card">
              <div className="promo-input-group">
                <Tag size={18} className="promo-icon" />
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. DINESMART)"
                  className="promo-input"
                  defaultValue={isDineIn ? "DINESMART" : ""}
                />
                <button type="button" className="btn-apply-coupon">
                  Apply
                </button>
              </div>
              {isDineIn && (
                <span className="promo-hint">🎉 Dine-In discount perks automatically applied!</span>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="cart-summary-section">
            <div className="order-summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-rows">
                <div className="summary-row">
                  <span className="label">Item Subtotal</span>
                  <span className="val">₹{subtotal}</span>
                </div>

                <div className="summary-row">
                  <span className="label">GST / Restaurant Tax (5%)</span>
                  <span className="val">₹{tax}</span>
                </div>

                <div className="summary-row">
                  <div className="delivery-fee-label">
                    <span className="label">Delivery & Packaging</span>
                    {isDineIn ? (
                      <span className="sub-hint text-emerald">Table Service (Free)</span>
                    ) : subtotal >= 500 ? (
                      <span className="sub-hint text-emerald">Free over ₹500</span>
                    ) : null}
                  </div>
                  <span className="val">
                    {deliveryFee === 0 ? <strong className="text-emerald">FREE</strong> : `₹${deliveryFee}`}
                  </span>
                </div>

                <hr className="summary-divider" />

                <div className="summary-row grand-total-row">
                  <span className="total-title">Total Amount</span>
                  <span className="grand-total-val">₹{grandTotal}</span>
                </div>
              </div>

              <div className="summary-order-type-notice">
                {activeTable ? (
                  <p>📍 Serving directly to <strong>Table {activeTable}</strong> (QR Verified)</p>
                ) : (
                  <p>🛵 Fast delivery to your doorstep</p>
                )}
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="btn-proceed-checkout"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div className="cart-security-badge">
                <ShieldCheck size={16} />
                <span>Guaranteed Safe & Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
