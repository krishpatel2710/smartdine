import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { ToastProvider } from "./context/ToastContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import AIFloatingButton from "./components/AIFloatingButton";

// Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import TableOrder from "./pages/TableOrder";
import Login from "./pages/Login";
import AIAssistant from "./pages/AIAssistant";
import AdminDashboard from "./pages/AdminDashboard";
import MenuManagement from "./pages/MenuManagement";
import KitchenDashboard from "./pages/KitchenDashboard";
import Analytics from "./pages/Analytics";
import "./App.css";

// Scroll to top on navigation helper
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Layout wrapper to conditionally render customer Navbar/Footer or admin sidebar
function LayoutWrapper({ children }) {
  const location = useLocation();
  const isAdminOrKitchen =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/kitchen");

  return (
    <div className={`app-root ${isAdminOrKitchen ? "app-admin-mode" : "app-store-mode"}`}>
      <ScrollToTop />
      <Toast />
      {!isAdminOrKitchen && <Navbar />}
      <div className="main-content-flow">{children}</div>
      {!isAdminOrKitchen && <AIFloatingButton />}
      {!isAdminOrKitchen && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <Router>
              <LayoutWrapper>
                <Routes>
                  {/* Customer Website Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/track" element={<OrderTracking />} />
                  <Route path="/track/:orderId" element={<OrderTracking />} />
                  <Route path="/table-order" element={<TableOrder />} />
                  <Route path="/table/:tableNumber" element={<TableOrder />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/ai-assistant" element={<AIAssistant />} />

                  {/* Staff & Owner Management Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/orders" element={<AdminDashboard />} />
                  <Route path="/admin/menu" element={<MenuManagement />} />
                  <Route path="/admin/analytics" element={<Analytics />} />
                  <Route path="/admin/reports" element={<Analytics />} />
                  <Route path="/admin/customers" element={<AdminDashboard />} />
                  <Route path="/admin/settings" element={<AdminDashboard />} />

                  {/* Kitchen Display System */}
                  <Route path="/kitchen" element={<KitchenDashboard />} />

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </LayoutWrapper>
            </Router>
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
