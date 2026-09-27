import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import FoodCard from "../components/FoodCard";
import QRScannerModal from "../components/QRScannerModal";
import {
  QrCode,
  Utensils,
  CheckCircle2,
  ArrowRight,
  Camera,
  RotateCcw,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  ScanLine
} from "lucide-react";

export default function TableOrder() {
  const { tableNumber } = useParams();
  const { activeTable, setActiveTable, setOrderType } = useCart();
  const { foodItems } = useOrders();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Auto-detect table from URL route /table/:tableNumber
  useEffect(() => {
    if (tableNumber) {
      const num = parseInt(tableNumber, 10);
      if (!isNaN(num) && num >= 1 && num <= 10) {
        setActiveTable(num);
        setOrderType("Dine-In");
        showToast(`Table ${num} recognized! Order mode set to Dine-In.`, "info");
      }
    }
  }, [tableNumber]);

  // If table already active, use it; otherwise sample table 5
  const currentTable = activeTable || (tableNumber ? parseInt(tableNumber, 10) : 5);
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const tableQrUrl = `${currentOrigin}/table/${currentTable}`;

  // Scanner handler: Once user scans, table is automatically locked and routes directly to Menu!
  const handleScannerTableDetected = (tableNo) => {
    setActiveTable(tableNo);
    setOrderType("Dine-In");
    showToast(`Table ${tableNo} verified from QR scan! Redirecting to menu...`, "success");
    navigate(`/menu?table=${tableNo}`);
  };

  const handleProceedToMenu = () => {
    setActiveTable(currentTable);
    setOrderType("Dine-In");
    navigate(`/menu?table=${currentTable}`);
  };

  const handleResetTable = () => {
    setActiveTable(null);
    showToast("Cleared table session. Scan a table QR to connect.", "info");
  };

  // 100% Pure veg recommendations
  const tableRecommendations = foodItems.slice(0, 4);

  return (
    <div className="table-order-page">
      <div className="page-container">
        {/* Top Header */}
        <div className="table-order-header text-center">
          <div className="section-eyebrow-pill">
            <span className="diet-dot veg-dot"></span>
            <span>100% PURE VEGETARIAN CONTACTLESS DINE-IN</span>
          </div>
          <h1 className="table-order-title">Scan Table QR to Order</h1>
          <p className="table-order-subtitle">
            Point your device camera at the QR code stand on your table. Your table is automatically verified — no need to choose or select any table.
          </p>

          <div className="table-header-cta-row">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="btn-launch-camera-scanner"
            >
              <Camera size={20} />
              <span>Launch Live Camera Scanner</span>
            </button>
          </div>
        </div>

        {/* If user has already scanned their table, show auto-connected card! NEVER show table picker */}
        {activeTable ? (
          <div className="table-connected-confirmed-card">
            <div className="confirmed-badge">
              <CheckCircle2 size={36} className="text-emerald" />
              <div>
                <h2>Connected to Table {activeTable}</h2>
                <p>
                  Your table has been automatically detected from your QR code scan. All orders will be delivered directly to <strong>Table {activeTable}</strong>.
                </p>
              </div>
            </div>
            <div className="confirmed-actions">
              <button onClick={handleProceedToMenu} className="btn-proceed-table-menu">
                <span>Go to Table {activeTable} Menu & Order</span>
                <ArrowRight size={18} />
              </button>
              <button onClick={() => setIsScannerOpen(true)} className="btn-table-reset" title="Scan a different table QR">
                <RotateCcw size={16} />
                <span>Scan Another Table QR</span>
              </button>
            </div>
          </div>
        ) : (
          /* When not yet scanned: Display the QR stand and live scanner launchpad */
          <div className="table-qr-showcase-grid">
            {/* Left Column: Realistic Restaurant QR Stand Card */}
            <div className="qr-stand-card">
              <div className="qr-stand-acrylic">
                <div className="stand-brand-header">
                  <div className="brand-logo-icon mini">
                    <Utensils size={18} />
                  </div>
                  <div className="stand-brand-name">
                    Smart<strong>Dine</strong>
                    <span className="stand-veg-tag">🌱 100% PURE VEG</span>
                  </div>
                </div>

                {/* Real Scannable 2D QR Code Container */}
                <div
                  className="qr-display-box"
                  onClick={() => setIsScannerOpen(true)}
                  title="Click to launch live camera scanner!"
                  role="button"
                  tabIndex={0}
                >
                  <div className="qr-matrix-render real-svg-qr">
                    <QRCodeSVG
                      value={tableQrUrl}
                      size={180}
                      level="H"
                      includeMargin={true}
                      imageSettings={{
                        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2316a34a'><circle cx='12' cy='12' r='10'/></svg>",
                        x: undefined,
                        y: undefined,
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                  </div>
                  <div className="qr-scan-badge live-pulse-scanner">
                    <Camera size={14} />
                    <span>Click to Scan With Camera</span>
                  </div>
                </div>

                <div className="stand-table-indicator">
                  <span className="stand-table-label">SAMPLE TABLE QR CODE</span>
                  <span className="stand-table-number">Table {currentTable} Stand</span>
                </div>

                <p className="stand-instructions">
                  Scan this code using your smartphone camera or click above to scan live with your laptop webcam.
                </p>
              </div>
            </div>

            {/* Right Column: Contactless Scanning Hub */}
            <div className="table-scan-hub-card">
              <div className="hub-header">
                <div className="hub-icon-bubble">
                  <ScanLine size={24} className="text-orange" />
                </div>
                <div>
                  <h3 className="hub-title">Instant Camera Scanner</h3>
                  <p className="hub-subtitle">Fast, contactless, table-side ordering</p>
                </div>
              </div>

              <div className="hub-feature-list">
                <div className="hub-feature-item">
                  <div className="feature-icon text-emerald">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>No Manual Table Selection</strong>
                    <p>Scanning the QR automatically identifies and locks your table number.</p>
                  </div>
                </div>

                <div className="hub-feature-item">
                  <div className="feature-icon text-orange">
                    <Zap size={18} />
                  </div>
                  <div>
                    <strong>Instant Kitchen Dispatch</strong>
                    <p>Your order transmits directly to the kitchen display screen.</p>
                  </div>
                </div>

                <div className="hub-feature-item">
                  <div className="feature-icon text-emerald">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <strong>100% Pure Vegetarian Kitchen</strong>
                    <p>All items prepared fresh in a strictly vegetarian kitchen.</p>
                  </div>
                </div>

                <div className="hub-feature-item">
                  <div className="feature-icon text-blue">
                    <Clock size={18} />
                  </div>
                  <div>
                    <strong>Zero Delivery Fee</strong>
                    <p>Direct priority table service with ₹0 delivery charges.</p>
                  </div>
                </div>
              </div>

              <div className="hub-cta-section">
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="btn-launch-camera-scanner w-full justify-center"
                >
                  <Camera size={18} />
                  <span>Open Camera to Scan Table QR</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How It Works 4-Step Flow */}
        <div className="qr-how-it-works-section">
          <h3 className="how-title">How Table QR Ordering Works</h3>
          <div className="how-steps-grid">
            <div className="how-step-card">
              <div className="step-num">1</div>
              <h4>Scan Table QR</h4>
              <p>Point your phone camera at the acrylic QR code stand placed on your table.</p>
            </div>
            <div className="how-step-card">
              <div className="step-num">2</div>
              <h4>Table Auto-Detected</h4>
              <p>Your table number is automatically verified — no need to choose or enter a table number.</p>
            </div>
            <div className="how-step-card">
              <div className="step-num">3</div>
              <h4>Pick 100% Pure Veg Dishes</h4>
              <p>Browse fresh pizzas, burgers, biryanis, and customize your meal directly in the app.</p>
            </div>
            <div className="how-step-card">
              <div className="step-num">4</div>
              <h4>Served to Your Table</h4>
              <p>Food is cooked fresh and served directly to your table with zero delivery fees.</p>
            </div>
          </div>
        </div>

        {/* Quick Menu Selection */}
        <div className="table-quick-picks">
          <div className="section-header-compact">
            <div className="header-left">
              <span className="section-eyebrow">100% PURE VEG HIGHLIGHTS</span>
              <h2 className="section-title">Popular Restaurant Dishes</h2>
            </div>
            <button onClick={handleProceedToMenu} className="section-link">
              <span>View Full Menu</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="food-grid">
            {tableRecommendations.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>
      </div>

      {/* Live QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onTableDetected={handleScannerTableDetected}
      />
    </div>
  );
}
