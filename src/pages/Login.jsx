import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, DEMO_CREDENTIALS } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  User,
  ShieldCheck,
  ChefHat,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  CheckCircle2,
  UserPlus,
  LogIn
} from "lucide-react";

export default function Login() {
  const { user, login, register, demoLogin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState("login");
  const [activeTab, setActiveTab] = useState("customer"); // 'customer' | 'admin' | 'kitchen'

  // Login form state
  const [email, setEmail] = useState(DEMO_CREDENTIALS.customer.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.customer.password);

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setEmail(DEMO_CREDENTIALS[tab].email);
    setPassword(DEMO_CREDENTIALS[tab].password);
  };

  const handleQuickDemoClick = async (role) => {
    setLoading(true);
    const cred = DEMO_CREDENTIALS[role];
    const res = await login(cred.email, cred.password);
    setLoading(false);
    if (res.success) {
      showToast(`Logged in as ${res.user.name} (${res.user.role.toUpperCase()})`, "success");
      redirectAfterLogin(res.user.role);
    } else {
      const fallback = demoLogin(role);
      if (fallback) {
        showToast(`Logged in as ${fallback.name} (${fallback.role})`, "success");
        redirectAfterLogin(fallback.role);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (authMode === "register") {
      const res = await register({
        name: registerName,
        email: registerEmail,
        phone: registerPhone,
        password: registerPassword
      });
      setLoading(false);
      if (res.success) {
        showToast(`Account created! Welcome, ${res.user.name}! 🎉`, "success");
        redirectAfterLogin("customer");
      } else {
        showToast(res.message || "Registration failed", "error");
      }
    } else {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, "success");
        redirectAfterLogin(res.user.role);
      } else {
        showToast(res.message || "Invalid credentials", "error");
      }
    }
  };

  const redirectAfterLogin = (role) => {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "kitchen") {
      navigate("/kitchen");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="login-page">
      <div className="page-container">
        <div className="login-card-container">
          {/* Header Brand */}
          <div className="login-brand-header">
            <div className="login-logo-circle">
              <UtensilsCrossed size={28} />
            </div>
            <h1 className="login-title">
              {authMode === "register" ? "Create an Account" : "Sign in to SmartDine"}
            </h1>
            <p className="login-subtitle">
              {authMode === "register"
                ? "Register a customer account for instant pure-veg ordering"
                : "Role-Based Authentication (Customer, Admin & Kitchen)"}
            </p>
          </div>

          {/* Primary Top Mode Switcher: Sign In vs Register */}
          <div className="auth-mode-switch">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`auth-mode-btn ${authMode === "login" ? "active" : ""}`}
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`auth-mode-btn ${authMode === "register" ? "active" : ""}`}
            >
              <UserPlus size={18} />
              <span>Register</span>
            </button>
          </div>

          {/* Active Session Notification */}
          {user && (
            <div className="current-session-box">
              <div className="session-info">
                <CheckCircle2 size={20} className="text-emerald" />
                <div>
                  <strong>Currently logged in as {user.name}</strong>
                  <span className="text-muted text-xs">
                    Role: {user.role?.toUpperCase()} ({user.email})
                  </span>
                </div>
              </div>
              <div className="session-actions">
                <button
                  type="button"
                  onClick={() => redirectAfterLogin(user.role)}
                  className="btn-go-dashboard"
                >
                  <span>
                    Go to{" "}
                    {user.role === "admin"
                      ? "Admin Dashboard"
                      : user.role === "kitchen"
                      ? "Kitchen KDS"
                      : "Storefront"}
                  </span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="btn-switch-account"
                >
                  Switch Account
                </button>
              </div>
            </div>
          )}

          {/* MODE 1: SIGN IN */}
          {authMode === "login" ? (
            <>
              {/* Role Select Tabs */}
              <div className="role-tabs-strip">
                <button
                  type="button"
                  onClick={() => handleTabSwitch("customer")}
                  className={`role-tab-btn ${activeTab === "customer" ? "active" : ""}`}
                >
                  <User size={16} />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabSwitch("admin")}
                  className={`role-tab-btn ${activeTab === "admin" ? "active" : ""}`}
                >
                  <ShieldCheck size={16} />
                  <span>Admin Owner</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabSwitch("kitchen")}
                  className={`role-tab-btn ${activeTab === "kitchen" ? "active" : ""}`}
                >
                  <ChefHat size={16} />
                  <span>Kitchen Staff</span>
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@smartdine.com"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="form-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit-login"
                >
                  <LogIn size={18} />
                  <span>
                    {loading
                      ? "Signing In..."
                      : `Sign In as ${
                          activeTab === "admin"
                            ? "Admin Owner"
                            : activeTab === "kitchen"
                            ? "Kitchen Staff"
                            : "Customer"
                        }`}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Bottom Switch Prompt */}
              <div className="auth-switch-prompt">
                <span>Don't have an account yet?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="auth-switch-link"
                >
                  Create a new account
                </button>
              </div>

              {/* 1-Click Demo Accounts */}
              <div className="demo-credentials-showcase">
                <div className="demo-showcase-title">
                  <Sparkles size={14} className="text-orange" />
                  <span>1-Click Instant Demo Login:</span>
                </div>

                <div className="demo-buttons-grid">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick("customer")}
                    className="btn-quick-demo demo-customer"
                  >
                    <strong>Customer Account</strong>
                    <span>customer@smartdine.com / Customer123</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick("admin")}
                    className="btn-quick-demo demo-admin"
                  >
                    <strong>Restaurant Owner (Admin)</strong>
                    <span>admin@smartdine.com / Admin123</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoClick("kitchen")}
                    className="btn-quick-demo demo-kitchen"
                  >
                    <strong>Kitchen Staff (KDS)</strong>
                    <span>kitchen@smartdine.com / Kitchen123</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* MODE 2: REGISTER */
            <>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. Varun Dave"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="e.g. varun@example.com"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-phone">Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password">Create Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="reg-password"
                      type="password"
                      required
                      minLength={6}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="form-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit-login"
                >
                  <UserPlus size={18} />
                  <span>
                    {loading ? "Registering Account..." : "Create Account & Sign In"}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Bottom Switch Prompt */}
              <div className="auth-switch-prompt">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="auth-switch-link"
                >
                  Sign in here
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
