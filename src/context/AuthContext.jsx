import React, { createContext, useContext, useState, useEffect } from "react";
import { getUser, saveUser, logout as removeUserSession } from "../utils/localStorage";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const DEMO_CREDENTIALS = {
  customer: {
    email: "customer@smartdine.com",
    password: "Customer123",
    name: "Sneha Nair",
    phone: "9876543210",
    role: "customer"
  },
  admin: {
    email: "admin@smartdine.com",
    password: "Admin123",
    name: "Krish Patel (Owner)",
    role: "admin",
    mobile: "+91 9106993883",
    phone: "9106993883"
  },
  kitchen: {
    email: "kitchen@smartdine.com",
    password: "Kitchen123",
    name: "Head Chef Mario",
    phone: "9106993884",
    role: "kitchen"
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    // If token exists, verify current session with backend
    const token = localStorage.getItem("smartdine_token");
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          if (res?.data?.user) {
            setUser(res.data.user);
            saveUser(res.data.user);
          }
        })
        .catch(() => {
          // If offline or token expired, keep cached local user
        });
    }
  }, []);

  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try real backend API
    try {
      const res = await authAPI.login(trimmedEmail, password);
      if (res?.success && res?.data?.token) {
        localStorage.setItem("smartdine_token", res.data.token);
        const loggedUser = res.data.user;
        setUser(loggedUser);
        saveUser(loggedUser);
        return { success: true, user: loggedUser };
      }
    } catch (apiErr) {
      console.warn("Backend API login error/unavailable:", apiErr.message);
      // Fallback check against local demo credentials
      for (const key of Object.keys(DEMO_CREDENTIALS)) {
        const cred = DEMO_CREDENTIALS[key];
        if (cred.email === trimmedEmail && cred.password === password) {
          const userObj = { ...cred };
          setUser(userObj);
          saveUser(userObj);
          return { success: true, user: userObj, isFallback: true };
        }
      }
      return { success: false, message: apiErr.message || "Invalid email or password" };
    }

    return { success: false, message: "Invalid email or password" };
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      if (res?.success && res?.data?.token) {
        localStorage.setItem("smartdine_token", res.data.token);
        const newUser = res.data.user;
        setUser(newUser);
        saveUser(newUser);
        return { success: true, user: newUser };
      }
      return { success: false, message: res?.message || "Registration failed" };
    } catch (err) {
      return { success: false, message: err.message || "Registration failed" };
    }
  };

  const demoLogin = (role) => {
    const cred = DEMO_CREDENTIALS[role];
    if (cred) {
      setUser(cred);
      saveUser(cred);
      return cred;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smartdine_token");
    removeUserSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, demoLogin, logout, DEMO_CREDENTIALS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
