-- ==========================================================
-- SmartDine - Complete Full-Stack MySQL Database Schema
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.4+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS smartdine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartdine;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer', 'admin', 'kitchen') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Menu Items Table (100% Pure Vegetarian Restaurant Menu)
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0.00,
  image VARCHAR(500),
  available BOOLEAN DEFAULT TRUE,
  best_seller BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 4.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_menu_category (category),
  INDEX idx_menu_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Compatible view for 'foods'
CREATE OR REPLACE VIEW foods AS 
SELECT 
  id, 
  name, 
  category, 
  description, 
  price, 
  image, 
  rating, 
  available AS is_available,
  available,
  discount,
  best_seller,
  created_at 
FROM menu_items;

-- 3. Restaurant Tables Table (Dine-In QR Enabled)
CREATE TABLE IF NOT EXISTS tables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_number INT NOT NULL UNIQUE,
  capacity INT DEFAULT 4,
  status ENUM('available', 'occupied') NOT NULL DEFAULT 'available',
  qr_code VARCHAR(255),
  INDEX idx_tables_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Compatible view for 'restaurant_tables'
CREATE OR REPLACE VIEW restaurant_tables AS 
SELECT 
  id, 
  table_number, 
  capacity, 
  status, 
  qr_code 
FROM tables;

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NULL,
  table_number INT NULL,
  table_id INT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  order_status ENUM('placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'placed',
  payment_status ENUM('pending', 'paid') NOT NULL DEFAULT 'paid',
  order_type ENUM('delivery', 'dine_in') NOT NULL DEFAULT 'delivery',
  delivery_address TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (order_status),
  INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NULL,
  food_id INT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  order_id INT NULL,
  food_id INT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_user (user_id),
  INDEX idx_reviews_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
