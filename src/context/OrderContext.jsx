import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getOrders,
  saveOrders,
  getFood,
  saveFood,
  getTables,
  saveTables,
  initLocalStorageData
} from "../utils/localStorage";
import { foodAPI, orderAPI, tableAPI } from "../services/api";

const OrderContext = createContext();

// Normalizers to bridge MySQL backend snake_case with React frontend camelCase
const normalizeFood = (f) => ({
  ...f,
  id: f.id,
  name: f.name,
  category: f.category,
  price: parseFloat(f.price || 0),
  rating: parseFloat(f.rating || 4.5),
  is_available: f.is_available !== false,
  inStock: f.is_available !== false && f.inStock !== false,
  isVeg: true,
  image: f.image || "/images/smartdine-hero-feast.jpg",
  description: f.description || "",
  prepTime: f.prepTime || "15-20 min"
});

export const normalizeOrder = (o) => {
  if (!o) return null;
  const statusMap = {
    placed: "Pending",
    accepted: "Accepted",
    preparing: "Preparing",
    ready: "Ready",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  const normStatus = statusMap[o.status?.toLowerCase()] || o.status || "Pending";
  const normType = o.order_type === "dine_in" || o.orderType === "Dine-In" || o.tableNo || o.table_number ? "Dine-In" : "Delivery";
  const tableVal = o.table_number || (o.table_id ? String(o.table_id) : o.tableNo || null);
  const deliveryAddr = o.delivery_address || o.deliveryAddress || o.customer?.address || (tableVal ? `Restaurant Dine-In Table ${tableVal}` : "Standard Express Delivery, Amroli, Surat");

  const custName = o.customer?.name || o.customer_name || "Guest Customer";
  const custEmail = o.customer?.email || o.customer_email || "";
  const custPhone = o.customer?.mobile || o.customer?.phone || o.customer_phone || "";

  const subtotalVal = parseFloat(o.subtotal || o.total_amount || o.total || 0);
  const taxVal = parseFloat(o.tax || Math.round(subtotalVal * 0.05));
  const feeVal = normType === "Dine-In" ? 0 : parseFloat(o.deliveryFee || (subtotalVal > 500 ? 0 : 30));
  const totalVal = parseFloat(o.total_amount || o.total || (subtotalVal + taxVal + feeVal));

  return {
    ...o,
    id: o.order_number || (typeof o.id === "number" ? `SD${o.id}` : o.id),
    rawId: o.id,
    orderNumber: o.order_number || o.id,
    orderType: normType,
    status: normStatus,
    total: totalVal,
    subtotal: subtotalVal,
    tax: taxVal,
    deliveryFee: feeVal,
    tableNo: tableVal,
    deliveryAddress: deliveryAddr,
    delivery_address: deliveryAddr,
    paymentMethod: o.paymentMethod || "UPI",
    paymentStatus: o.paymentStatus || (o.paymentMethod === "Cash on Delivery" ? "Pending" : "Paid"),
    customer: {
      name: custName,
      email: custEmail,
      phone: custPhone,
      mobile: custPhone,
      address: deliveryAddr
    },
    items: (o.items || []).map((i) => ({
      ...i,
      id: i.food_id || i.id,
      food_id: i.food_id || i.id,
      name: i.name,
      price: parseFloat(i.price || 0),
      quantity: parseInt(i.quantity || 1, 10),
      image: i.image,
      category: i.category,
      isVeg: true
    })),
    createdAt: o.created_at || o.createdAt || new Date().toISOString()
  };
};

export const OrderProvider = ({ children }) => {
  // Ensure default fixtures exist in localStorage as cache
  useEffect(() => {
    initLocalStorageData();
  }, []);

  const [orders, setOrders] = useState(() => (getOrders() || []).map(normalizeOrder));
  const [foodItems, setFoodItems] = useState(() => (getFood() || []).map(normalizeFood));
  const [tables, setTables] = useState(() => getTables() || []);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sync with Backend API on mount
  useEffect(() => {
    let mounted = true;

    // 1. Fetch live foods from backend
    foodAPI
      .getAll()
      .then((res) => {
        if (mounted && res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const normalized = res.data.map(normalizeFood);
          setFoodItems(normalized);
          saveFood(normalized);
          setIsBackendConnected(true);
        }
      })
      .catch((err) => {
        console.warn("Backend foods endpoint offline, using local cache:", err.message);
      });

    // 2. Fetch live tables
    tableAPI
      .getAll()
      .then((res) => {
        if (mounted && res?.success && Array.isArray(res.data)) {
          const mappedTables = res.data.map((t) => ({
            id: t.table_number || t.id,
            seats: 4,
            status: t.status === "occupied" ? "Occupied" : "Available",
            activeOrder: t.active_orders_count > 0 ? "Active" : null
          }));
          setTables(mappedTables);
          saveTables(mappedTables);
        }
      })
      .catch(() => {});

    // 3. Fetch live orders
    orderAPI
      .getAll()
      .then((res) => {
        if (mounted && res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const normalized = res.data.map(normalizeOrder);
          setOrders(normalized);
          saveOrders(normalized);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveFood(foodItems);
  }, [foodItems]);

  useEffect(() => {
    saveTables(tables);
  }, [tables]);

  // Order Operations
  const createOrder = async (orderData) => {
    const isDineIn = orderData.orderType === "Dine-In" || Boolean(orderData.tableNo);
    const destAddress =
      orderData.customer?.address ||
      orderData.deliveryAddress ||
      orderData.address ||
      (isDineIn ? `Restaurant Dine-In Table ${orderData.tableNo || "QR"}` : "Standard Express Delivery, Amroli, Surat");

    // Try creating order via real Backend REST API
    try {
      const payload = {
        items: (orderData.items || []).map((i) => ({
          food_id: i.food_id || i.id,
          id: i.food_id || i.id,
          quantity: i.quantity,
          price: i.price,
          name: i.name
        })),
        order_type: isDineIn ? "dine_in" : "delivery",
        orderType: isDineIn ? "Dine-In" : "Delivery",
        table_number: orderData.tableNo ? parseInt(orderData.tableNo, 10) : null,
        tableNo: orderData.tableNo || null,
        delivery_address: destAddress,
        deliveryAddress: destAddress,
        address: destAddress,
        notes: orderData.notes || "",
        paymentMethod: orderData.paymentMethod || "UPI",
        customer_info: {
          ...orderData.customer,
          address: destAddress
        },
        customer: {
          ...orderData.customer,
          address: destAddress
        }
      };

      const res = await orderAPI.create(payload);
      if (res?.success && res.data) {
        const created = normalizeOrder(res.data);
        setOrders((prev) => [created, ...prev.filter((o) => o.id !== created.id)]);

        // Update local table status
        if (created.tableNo) {
          setTables((prev) =>
            prev.map((t) =>
              t.id === Number(created.tableNo) ? { ...t, status: "Occupied" } : t
            )
          );
        }

        return created;
      }
    } catch (err) {
      console.warn("Backend order creation warning:", err.message);
    }

    // Local Fallback
    const highestNum = orders.reduce((max, o) => {
      const match = (o.id || "").match(/SD(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1025);

    const newId = `SD${highestNum + 1}`;

    const newOrder = {
      id: newId,
      orderNumber: newId,
      customer: orderData.customer,
      orderType: orderData.orderType || (orderData.tableNo ? "Dine-In" : "Delivery"),
      tableNo: orderData.tableNo || null,
      items: orderData.items,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      deliveryFee: orderData.deliveryFee || 0,
      total: orderData.total,
      status: "Pending",
      paymentMethod: orderData.paymentMethod || "UPI",
      paymentStatus: orderData.paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
      createdAt: new Date().toISOString(),
      notes: orderData.notes || ""
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (newOrder.tableNo) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === Number(newOrder.tableNo) ? { ...t, status: "Occupied" } : t
        )
      );
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // 1. Optimistically update local state
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId || String(o.rawId) === String(orderId)
          ? { ...o, status: newStatus }
          : o
      )
    );

    // 2. Call backend API
    try {
      const backendStatus = newStatus.toLowerCase();
      await orderAPI.updateStatus(orderId, backendStatus);
    } catch (err) {
      console.warn("Backend status update error/offline:", err.message);
    }

    // 3. Handle table release if completed/cancelled
    const targetOrder = orders.find(
      (o) => o.id === orderId || o.orderNumber === orderId || String(o.rawId) === String(orderId)
    );

    if (
      targetOrder &&
      targetOrder.tableNo &&
      ["Completed", "Cancelled", "completed", "cancelled"].includes(newStatus)
    ) {
      const hasOtherActive = orders.some(
        (o) =>
          o.id !== orderId &&
          o.tableNo === targetOrder.tableNo &&
          !["Completed", "Cancelled", "completed", "cancelled"].includes(o.status)
      );
      if (!hasOtherActive) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === Number(targetOrder.tableNo) ? { ...t, status: "Available" } : t
          )
        );
      }
    }
  };

  const getOrderById = (orderId) => {
    return orders.find(
      (o) =>
        (o.id || "").toUpperCase() === (orderId || "").toUpperCase() ||
        (o.orderNumber || "").toUpperCase() === (orderId || "").toUpperCase() ||
        String(o.rawId) === String(orderId)
    );
  };

  // Food Item Management (Admin)
  const addFoodItem = async (newItem) => {
    try {
      const res = await foodAPI.create(newItem);
      if (res?.success && res.data) {
        const created = normalizeFood(res.data);
        setFoodItems((prev) => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.warn("Backend food create offline, adding locally:", err.message);
    }

    const nextId = foodItems.length > 0 ? Math.max(...foodItems.map((i) => i.id)) + 1 : 1;
    const itemWithId = normalizeFood({ ...newItem, id: nextId });
    setFoodItems((prev) => [itemWithId, ...prev]);
    return itemWithId;
  };

  const updateFoodItem = async (updatedItem) => {
    try {
      await foodAPI.update(updatedItem.id, updatedItem);
    } catch (err) {
      console.warn("Backend food update offline:", err.message);
    }

    setFoodItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? normalizeFood(updatedItem) : item))
    );
  };

  const deleteFoodItem = async (itemId) => {
    try {
      await foodAPI.delete(itemId);
    } catch (err) {
      console.warn("Backend food delete offline:", err.message);
    }

    setFoodItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const toggleStock = async (itemId) => {
    const item = foodItems.find((i) => i.id === itemId);
    const newStock = !item?.inStock;

    try {
      await foodAPI.updateAvailability(itemId, newStock);
    } catch (err) {
      console.warn("Backend toggleStock offline:", err.message);
    }

    setFoodItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, inStock: newStock, is_available: newStock } : i
      )
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        getOrderById,
        foodItems,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        toggleStock,
        tables,
        isBackendConnected
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
