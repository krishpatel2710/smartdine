import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-item-row">
      {/* Item Image */}
      <div className="cart-item-thumbnail">
        <img src={item.image} alt={item.name} />
        <span className="cart-item-diet diet-veg" title="100% Pure Vegetarian">
          <span className="diet-dot"></span>
        </span>
      </div>

      {/* Item Details */}
      <div className="cart-item-info">
        <h4 className="cart-item-title">{item.name}</h4>
        <span className="cart-item-price-each">₹{item.price} each</span>
      </div>

      {/* Quantity Stepper */}
      <div className="cart-item-controls">
        <div className="qty-control-box">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="qty-btn"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="qty-number">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="qty-btn"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Item Total */}
        <div className="cart-item-subtotal">
          <span>₹{item.price * item.quantity}</span>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => removeFromCart(item.id)}
          className="cart-item-remove-btn"
          title="Remove item"
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
