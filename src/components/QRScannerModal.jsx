import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  QrCode,
  ArrowRight
} from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function QRScannerModal({ isOpen, onClose, onTableDetected }) {
  const { showToast } = useToast();
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize camera scan when modal is opened
  useEffect(() => {
    let html5QrCode = null;

    if (isOpen) {
      setCameraError(null);
      setIsProcessing(false);

      // Enumerate available video inputs
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length > 0) {
            setCameras(devices);
            // Default to back camera on mobile or first available
            const backCam = devices.find(
              (d) =>
                d.label.toLowerCase().includes("back") ||
                d.label.toLowerCase().includes("environment")
            );
            const chosenId = backCam ? backCam.id : devices[0].id;
            setSelectedCameraId(chosenId);
            startCamera(chosenId);
          } else {
            setCameraError(
              "No camera device detected. You can upload a QR image or select a table below."
            );
          }
        })
        .catch((err) => {
          console.warn("Camera enumeration error:", err);
          setCameraError(
            "Camera access was blocked or is unavailable. Please grant browser camera permissions, or upload a QR image."
          );
        });
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async (cameraId) => {
    try {
      setCameraError(null);

      // Stop existing if any
      await stopCamera();

      const qrCode = new Html5Qrcode("qr-reader-container");
      scannerRef.current = qrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await qrCode.start(
        cameraId || { facingMode: "environment" },
        config,
        (decodedText) => {
          handleDecodedData(decodedText);
        },
        (errorMessage) => {
          // Frame-by-frame parse message, ignore non-matches
        }
      );

      setScannerActive(true);
    } catch (err) {
      console.error("Failed to start camera:", err);
      setScannerActive(false);
      setCameraError(
        "Could not access camera stream. Please check browser permissions, or use image upload below."
      );
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
      scannerRef.current = null;
      setScannerActive(false);
    }
  };

  // Parse QR contents (URLs, table numbers, tags)
  const handleDecodedData = async (text) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Stop camera scanning right away
    await stopCamera();

    // Check for table patterns:
    // e.g., "http://.../menu?table=5"
    // "TABLE_5", "Table 5", or simple integer "5"
    let tableNum = null;

    if (text) {
      const urlMatch = text.match(/table=(\d+)/i);
      if (urlMatch) {
        tableNum = parseInt(urlMatch[1], 10);
      } else {
        const rawMatch = text.match(/table[:_\s-]*(\d+)/i);
        if (rawMatch) {
          tableNum = parseInt(rawMatch[1], 10);
        } else {
          const directNum = parseInt(text.trim(), 10);
          if (!isNaN(directNum) && directNum >= 1 && directNum <= 20) {
            tableNum = directNum;
          }
        }
      }
    }

    if (tableNum && tableNum >= 1 && tableNum <= 8) {
      showToast(`🎉 QR Code Scanned! Connecting to Table ${tableNum}`, "success");
      onTableDetected(tableNum);
      onClose();
    } else {
      showToast(`Scanned QR: "${text}". Selected Table 5 for Dine-In!`, "success");
      onTableDetected(5);
      onClose();
    }
  };

  // Handle Image File Upload for QR scanning
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      await stopCamera();

      const html5QrCode = new Html5Qrcode("qr-file-processor");
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      handleDecodedData(decodedText);
    } catch (err) {
      console.error("QR File scan error:", err);
      showToast("Could not find a valid Table QR code in that image.", "error");
      setIsProcessing(false);
    }
  };

  // Simulate QR Code scanning (for testing without physical camera)
  const handleSimulateScan = () => {
    handleDecodedData("http://localhost:5173/menu?table=5");
  };

  if (!isOpen) return null;

  return (
    <div className="scanner-modal-backdrop" onClick={onClose}>
      <div className="scanner-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="scanner-modal-header">
          <div className="scanner-modal-title">
            <div className="scanner-icon-bubble">
              <Camera size={20} className="text-orange" />
            </div>
            <div>
              <h3>Smart Table QR Scanner</h3>
              <p>Point camera at Table QR code or upload QR screenshot</p>
            </div>
          </div>
          <button onClick={onClose} className="scanner-modal-close" aria-label="Close scanner">
            <X size={20} />
          </button>
        </div>

        {/* Live Camera Viewfinder */}
        <div className="scanner-viewfinder-wrapper">
          <div id="qr-reader-container" className="qr-video-box"></div>
          {/* Hidden element for file scanning */}
          <div id="qr-file-processor" style={{ display: "none" }}></div>

          {/* Scanner Overlay Sight Crosshair */}
          {scannerActive && (
            <div className="scanner-sight-overlay">
              <div className="scanner-laser-line"></div>
              <div className="corner-bracket top-left"></div>
              <div className="corner-bracket top-right"></div>
              <div className="corner-bracket bottom-left"></div>
              <div className="corner-bracket bottom-right"></div>
              <span className="scanner-hint-tag">Align Table QR in frame</span>
            </div>
          )}

          {/* Fallback error if camera blocked */}
          {cameraError && (
            <div className="scanner-error-card">
              <AlertCircle size={32} className="text-amber" />
              <h4>Camera Stream Unavailable</h4>
              <p>{cameraError}</p>
              <button
                type="button"
                onClick={() => startCamera(selectedCameraId)}
                className="btn-retry-camera"
              >
                <RefreshCw size={14} />
                <span>Retry Camera</span>
              </button>
            </div>
          )}
        </div>

        {/* Controls: Switch Camera & Upload QR Image */}
        <div className="scanner-controls-strip">
          {cameras.length > 1 && (
            <div className="camera-switcher-box">
              <select
                value={selectedCameraId || ""}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  startCamera(e.target.value);
                }}
                className="camera-select"
                aria-label="Switch camera"
              >
                {cameras.map((c, i) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="scanner-alt-actions">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-upload-qr"
            >
              <Upload size={16} />
              <span>Scan QR from Image File</span>
            </button>
          </div>
        </div>

        {/* Instant Scanner Test Helper (Simulates scanning the Table QR Stand) */}
        <div className="scanner-quick-test-section">
          <button
            type="button"
            onClick={handleSimulateScan}
            className="btn-simulate-qr-trigger"
          >
            <Sparkles size={15} />
            <span>Test Scanner with Sample QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
