import { initialFoodItems } from "../data/foodData";
import { initialOrders, demoCustomers, restaurantTables } from "../data/demoOrders";

const KEYS = {
  CART: "smartdine_cart",
  ORDERS: "smartdine_orders",
  FOOD: "smartdine_food_items",
  USER: "smartdine_user_session",
  ACTIVE_TABLE: "smartdine_active_table",
  CUSTOMERS: "smartdine_customers",
  TABLES: "smartdine_tables"
};

/**
 * Initialize mock data if not present in localStorage
 */
export const initLocalStorageData = () => {
  const existingFood = localStorage.getItem(KEYS.FOOD);
  if (!existingFood) {
    localStorage.setItem(KEYS.FOOD, JSON.stringify(initialFoodItems));
  } else {
    try {
      const parsed = JSON.parse(existingFood);
      let needsUpdate = false;
      const updated = parsed.map((item) => {
        if (
          item.name === "Tandoori Paneer Tikka" &&
          (!item.image || item.image.includes("1599488615731"))
        ) {
          needsUpdate = true;
          return { ...item, image: "/images/tandoori-paneer-tikka.jpg" };
        }
        return item;
      });

      if (parsed.some((item) => item.isVeg === false)) {
        localStorage.setItem(KEYS.FOOD, JSON.stringify(initialFoodItems));
      } else if (needsUpdate) {
        localStorage.setItem(KEYS.FOOD, JSON.stringify(updated));
      }
    } catch (e) {
      localStorage.setItem(KEYS.FOOD, JSON.stringify(initialFoodItems));
    }
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(initialOrders));
  }
  if (!localStorage.getItem(KEYS.CUSTOMERS)) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(demoCustomers));
  }
  if (!localStorage.getItem(KEYS.TABLES)) {
    localStorage.setItem(KEYS.TABLES, JSON.stringify(restaurantTables));
  }
  if (!localStorage.getItem(KEYS.CART)) {
    localStorage.setItem(KEYS.CART, JSON.stringify([]));
  }
};

// CART UTILITIES
export const saveCart = (cart) => {
  try {
    localStorage.setItem(KEYS.CART, JSON.stringify(cart));
  } catch (err) {
    console.error("Error saving cart to localStorage", err);
  }
};

export const getCart = () => {
  try {
    const data = localStorage.getItem(KEYS.CART);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading cart from localStorage", err);
    return [];
  }
};

export const clearCartStorage = () => {
  localStorage.setItem(KEYS.CART, JSON.stringify([]));
};

// ORDER UTILITIES
export const saveOrders = (orders) => {
  try {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.error("Error saving orders to localStorage", err);
  }
};

export const getOrders = () => {
  try {
    const data = localStorage.getItem(KEYS.ORDERS);
    return data ? JSON.parse(data) : initialOrders;
  } catch (err) {
    console.error("Error reading orders from localStorage", err);
    return initialOrders;
  }
};

// FOOD ITEMS UTILITIES
export const saveFood = (foodItems) => {
  try {
    localStorage.setItem(KEYS.FOOD, JSON.stringify(foodItems));
  } catch (err) {
    console.error("Error saving food to localStorage", err);
  }
};

export const getFood = () => {
  try {
    const data = localStorage.getItem(KEYS.FOOD);
    if (!data) return initialFoodItems;
    const parsed = JSON.parse(data);
    return parsed.map((item) => {
      if (
        item.name === "Tandoori Paneer Tikka" &&
        (!item.image || item.image.includes("1599488615731"))
      ) {
        return { ...item, image: "/images/tandoori-paneer-tikka.jpg" };
      }
      return item;
    });
  } catch (err) {
    console.error("Error reading food from localStorage", err);
    return initialFoodItems;
  }
};

// USER & SESSION UTILITIES
export const saveUser = (user) => {
  try {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (err) {
    console.error("Error saving user session", err);
  }
};

export const getUser = () => {
  try {
    const data = localStorage.getItem(KEYS.USER);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && (parsed.role === "admin" || parsed.email === "admin@test.com" || (parsed.name && parsed.name.includes("Vikram")))) {
      parsed.name = "Krish Patel (Owner)";
      parsed.mobile = "+91 9106993883";
      localStorage.setItem(KEYS.USER, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error("Error getting user session", err);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem(KEYS.USER);
};

// ACTIVE TABLE UTILITIES
export const saveActiveTable = (tableNo) => {
  if (tableNo === null || tableNo === undefined) {
    localStorage.removeItem(KEYS.ACTIVE_TABLE);
  } else {
    localStorage.setItem(KEYS.ACTIVE_TABLE, JSON.stringify(tableNo));
  }
};

export const getActiveTable = () => {
  try {
    const data = localStorage.getItem(KEYS.ACTIVE_TABLE);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

// CUSTOMERS & TABLES
export const getCustomers = () => {
  try {
    const data = localStorage.getItem(KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : demoCustomers;
  } catch (err) {
    return demoCustomers;
  }
};

export const getTables = () => {
  try {
    const data = localStorage.getItem(KEYS.TABLES);
    return data ? JSON.parse(data) : restaurantTables;
  } catch (err) {
    return restaurantTables;
  }
};

export const saveTables = (tables) => {
  try {
    localStorage.setItem(KEYS.TABLES, JSON.stringify(tables));
  } catch (err) {
    console.error("Error saving tables", err);
  }
};

// RESET TO FACTORY DEMO
export const resetAllData = () => {
  localStorage.setItem(KEYS.FOOD, JSON.stringify(initialFoodItems));
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(initialOrders));
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(demoCustomers));
  localStorage.setItem(KEYS.TABLES, JSON.stringify(restaurantTables));
  localStorage.setItem(KEYS.CART, JSON.stringify([]));
  localStorage.removeItem(KEYS.ACTIVE_TABLE);
};
