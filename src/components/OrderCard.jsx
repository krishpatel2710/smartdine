import React from "react";
import { Link } from "react-router-dom";
import OrderStatus from "./OrderStatus";
import { Calendar, Utensils, IndianRupee, ArrowRight, MapPin, QrCode } from "lucide-react";

export default function OrderCard({ order }) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const isDineIn = order.orderType === "Dine-In" || !!order.tableNo;

  return (
    <div className="order-history-card">
      {/* Top Header Row */}
      <div className="order-card-header">
        <div className="order-id-group">
          <span className="order-id-label">Order #</span>
          <span className="order-id-value">{order.id}</span>
        </div>

        <div className="order-header-badges">
          <span className={`order-type-pill ${isDineIn ? "type-dinein" : "type-delivery"}`}>
            {isDineIn ? (
              <>
                <QrCode size={13} />
                <span>Dine-In • Table {order.tableNo}</span>
              </>
            ) : (
              <>
                <MapPin size={13} />
                <span>Home Delivery</span>
              </>
            )}
          </span>
          <OrderStatus status={order.status} size="sm" />
        </div>
      </div>

      {/* Date, Customer & Destination Row */}
      <div className="order-meta-row">
        <div className="order-meta-item">
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>
        {order.customer?.name && (
          <div className="order-customer-hint">
            <span>Customer: <strong>{order.customer.name}</strong></span>
          </div>
        )}
      </div>

      {(order.customer?.address || order.delivery_address || order.deliveryAddress) && (
        <div className="order-address-hint" style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.35rem", margin: "0.35rem 0" }}>
          {isDineIn ? <QrCode size={13} color="#16a34a" /> : <MapPin size={13} color="#ea580c" />}
          <span>{order.customer?.address || order.delivery_address || order.deliveryAddress}</span>
        </div>
      )}

      {/* Items List Summary */}
      <div className="order-items-snippet">
        <Utensils size={15} className="utensils-icon" />
        <div className="items-text-flow">
          {order.items.map((item, idx) => (
            <span key={idx} className="item-token">
              {item.name} <strong className="item-qty">× {item.quantity}</strong>
              {idx < order.items.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Summary & Actions */}
      <div className="order-card-bottom">
        <div className="order-price-total">
          <span className="total-label">Amount:</span>
          <span className="total-val">₹{order.total}</span>
          <span className="payment-status-tag">({order.paymentMethod} • {order.paymentStatus || "Paid"})</span>
        </div>

        <Link to={`/track/${order.id}`} className="btn-track-order">
          <span>Track Order</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
