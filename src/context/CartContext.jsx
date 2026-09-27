import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCart,
  saveCart,
  clearCartStorage,
  getActiveTable,
  saveActiveTable
} from "../utils/localStorage";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => getCart());
  const [activeTable, setActiveTableState] = useState(() => getActiveTable());
  const [orderType, setOrderType] = useState(() => (getActiveTable() ? "Dine-In" : "Delivery"));

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // Sync activeTable to localStorage
  const setActiveTable = (tableNo) => {
    setActiveTableState(tableNo);
    saveActiveTable(tableNo);
    if (tableNo) {
      setOrderType("Dine-In");
    }
  };

  const addToCart = (item, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    clearCartStorage();
  };

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
  const isDineIn = orderType === "Dine-In" || !!activeTable;
  const deliveryFee = isDineIn ? 0 : subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const grandTotal = Math.round(subtotal + tax + deliveryFee);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addItem: addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        activeTable,
        setActiveTable,
        orderType,
        setOrderType,
        subtotal,
        tax,
        deliveryFee,
        grandTotal,
        totalItemsCount,
        isDineIn
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
