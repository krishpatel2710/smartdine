import axios from "axios";

/**
 * SmartDine Full-Stack API Client Service
 * Uses Axios to connect the React frontend to the Express/MySQL REST API on port 5000.
 * Includes Google Gemini AI Food Assistant endpoints.
 */

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

// 1. Create Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

// 2. Request Interceptor: Attach JWT token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smartdine_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Format responses cleanly
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to SmartDine backend server. Please verify backend is running on port 5000.";
    return Promise.reject(new Error(errorMsg));
  }
);

// ========================================================
// Section 18: Required Standalone API Functions
// ========================================================

/**
 * Authentication
 */
export const login = async (email, password) => {
  return apiClient.post("/auth/login", { email, password });
};

export const register = async (userData) => {
  return apiClient.post("/auth/register", userData);
};

export const getProfile = async () => {
  return apiClient.get("/auth/profile");
};

/**
 * Menu / Foods
 */
export const getMenu = async (params = {}) => {
  return apiClient.get("/menu", { params });
};

export const getMenuItem = async (id) => {
  return apiClient.get(`/menu/${id}`);
};

/**
 * Orders
 */
export const createOrder = async (orderData) => {
  return apiClient.post("/orders", orderData);
};

export const getOrders = async (params = {}) => {
  return apiClient.get("/orders", { params });
};

export const getOrder = async (id) => {
  return apiClient.get(`/orders/${id}`);
};

/**
 * Tables
 */
export const getTables = async () => {
  return apiClient.get("/tables");
};

/**
 * Gemini AI Food Assistant Endpoints (Section 13, 14, 15)
 */
export const sendAIMessage = async (message) => {
  return apiClient.post("/ai/chat", { message });
};

export const getAIRecommendations = async (criteria = {}) => {
  return apiClient.post("/ai/recommend", criteria);
};

// ========================================================
// Backwards Compatible Grouped API Objects
// ========================================================

export const authAPI = {
  login,
  register,
  getMe: getProfile,
  getProfile
};

export const foodAPI = {
  getAll: (params = {}) => apiClient.get("/foods", { params }),
  getById: (id) => apiClient.get(`/foods/${id}`),
  create: (foodData) => apiClient.post("/foods", foodData),
  update: (id, foodData) => apiClient.put(`/foods/${id}`, foodData),
  delete: (id) => apiClient.delete(`/foods/${id}`),
  updateAvailability: (id, isAvailable) =>
    apiClient.patch(`/foods/${id}/availability`, { is_available: isAvailable })
};

export const menuAPI = {
  getMenu,
  getMenuItem,
  create: (itemData) => apiClient.post("/menu", itemData),
  update: (id, itemData) => apiClient.put(`/menu/${id}`, itemData),
  delete: (id) => apiClient.delete(`/menu/${id}`)
};

export const tableAPI = {
  getAll: getTables,
  getById: (id) => apiClient.get(`/tables/${id}`),
  updateStatus: (id, status) => apiClient.put(`/tables/${id}/status`, { status })
};

export const orderAPI = {
  create: createOrder,
  getMyOrders: () => apiClient.get("/orders/my-orders"),
  getAll: (params = {}) => apiClient.get("/orders", { params }),
  getById: getOrder,
  updateStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status })
};

export const kitchenAPI = {
  getOrders: () => apiClient.get("/kitchen/orders"),
  accept: (id) => apiClient.patch(`/kitchen/orders/${id}/accept`),
  preparing: (id) => apiClient.patch(`/kitchen/orders/${id}/preparing`),
  ready: (id) => apiClient.patch(`/kitchen/orders/${id}/ready`),
  complete: (id) => apiClient.patch(`/kitchen/orders/${id}/complete`),
  updateStatus: (id, status) => apiClient.put(`/kitchen/orders/${id}/status`, { status })
};

export const analyticsAPI = {
  getDashboard: () => apiClient.get("/analytics/dashboard"),
  getTopFoods: () => apiClient.get("/analytics/top-foods"),
  getRevenue: () => apiClient.get("/analytics/revenue")
};

export const adminAPI = {
  getDashboard: () => apiClient.get("/admin/dashboard"),
  getOrders: (params = {}) => apiClient.get("/admin/orders", { params }),
  getUsers: () => apiClient.get("/admin/users")
};

export const aiAPI = {
  chat: sendAIMessage,
  recommend: getAIRecommendations
};

export default apiClient;
