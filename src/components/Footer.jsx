import React from "react";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, QrCode, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top-wave"></div>
      <div className="footer-container">
        <div className="footer-grid">
          {/* Col 1: Brand & Bio */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="brand-logo-icon">
                <UtensilsCrossed size={22} className="brand-icon" />
              </div>
              <span className="brand-title">Smart<span className="brand-highlight">Dine</span></span>
            </div>
            <p className="footer-description">
              Next-generation smart restaurant ordering platform combining contactless table QR scanning, lightning-fast online ordering, and real-time kitchen tracking.
            </p>
            <div className="footer-qr-promo">
              <QrCode size={20} className="qr-promo-icon" />
              <span>Dine-In? Scan any table QR for immediate service!</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Explore SmartDine</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Full Digital Menu</Link></li>
              <li><Link to="/table-order">Table QR Ordering</Link></li>
              <li><Link to="/orders">Order History & Tracking</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Services */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/ai-assistant">🤖 AI Food Assistant</Link></li>
              <li><Link to="/orders">Track My Order</Link></li>
              <li><Link to="/table-order">Table QR Ordering</Link></li>
              <li><Link to="/menu">100% Pure Veg Delicacies</Link></li>
              <li><Link to="/cart">My Cart & Checkout</Link></li>
              <li><Link to="/login">Customer Account Login</Link></li>
            </ul>
          </div>

          {/* Col 4: Timings & Location */}
          <div className="footer-col">
            <h4 className="footer-heading">Timings & Contact</h4>
            <ul className="footer-contact-list">
              <li>
                <Clock size={16} />
                <span>Mon – Sun: 10:00 AM – 11:30 PM</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>Amroli, Surat, Gujarat</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+91 9106993883 (Owner: Krish Patel)</span>
              </li>
              <li>
                <Mail size={16} />
                <span>support@smartdine.restaurant</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SmartDine – Smart Restaurant Ordering System. All rights reserved.</p>
          <div className="footer-bottom-badges">
            <span className="footer-badge"><ShieldCheck size={14} /> 100% Contactless Dine-In</span>
            <span className="footer-badge">Fast Prep Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
