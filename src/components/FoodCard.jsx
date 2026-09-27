import React from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Star, Plus, Minus, Check, Clock } from "lucide-react";

export default function FoodCard({ food }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const { showToast } = useToast();

  const cartItem = cart.find((i) => i.id === food.id);
  const isInStock = food.inStock !== false;

  const handleAdd = () => {
    if (!isInStock) {
      showToast(`${food.name} is currently out of stock`, "error");
      return;
    }
    addToCart(food, 1);
    showToast(`Added ${food.name} to cart!`, "success");
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    addToCart(food, 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(food.id, cartItem.quantity - 1);
    }
  };

  return (
    <div className={`food-card ${!isInStock ? "is-out-of-stock" : ""}`}>
      {/* Food Image Container */}
      <div className="food-card-media">
        <img
          src={food.image}
          alt={food.name}
          className="food-card-img"
          loading="lazy"
        />
        {/* 100% Pure Veg Indicator */}
        <div className="diet-indicator" title="100% Pure Vegetarian">
          <span className="diet-box diet-veg">
            <span className="diet-dot"></span>
          </span>
        </div>

        {/* Rating Badge */}
        <div className="food-rating-badge">
          <Star size={13} className="star-icon" fill="currentColor" />
          <span>{food.rating}</span>
        </div>

        {/* Out of Stock Overlay */}
        {!isInStock && (
          <div className="out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      {/* Food Information */}
      <div className="food-card-content">
        <div className="food-category-tag">{food.category}</div>
        <h3 className="food-title">{food.name}</h3>
        <p className="food-desc" title={food.description}>
          {food.description}
        </p>

        {food.prepTime && (
          <div className="food-prep-time">
            <Clock size={12} />
            <span>{food.prepTime}</span>
          </div>
        )}

        {/* Price & Action Row */}
        <div className="food-card-footer">
          <div className="food-price-block">
            <span className="currency-symbol">₹</span>
            <span className="food-price">{food.price}</span>
          </div>

          <div className="food-action-block">
            {!isInStock ? (
              <button className="btn-add-food btn-disabled" disabled>
                Unavailable
              </button>
            ) : cartItem ? (
              <div className="food-qty-stepper">
                <button
                  onClick={handleDecrement}
                  className="btn-stepper-qty minus"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="stepper-count">{cartItem.quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="btn-stepper-qty plus"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button onClick={handleAdd} className="btn-add-food">
                <Plus size={16} />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
