import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, GripVertical } from "lucide-react";

export default function AIFloatingButton() {
  const location = useLocation();
  const navigate = useNavigate();

  // Position state (persisted in localStorage or default to bottom-right)
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("smartdine_ai_btn_pos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          return parsed;
        }
      } catch (e) {}
    }
    const initialX = typeof window !== "undefined" ? Math.max(20, window.innerWidth - 240) : 1000;
    const initialY = typeof window !== "undefined" ? Math.max(20, window.innerHeight - 100) : 700;
    return { x: initialX, y: initialY };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragInfoRef = useRef({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    hasMoved: false
  });

  // Ensure button stays within screen boundaries on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.max(10, Math.min(window.innerWidth - 210, prev.x)),
        y: Math.max(10, Math.min(window.innerHeight - 80, prev.y))
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Drag handlers
  const handlePointerDown = (clientX, clientY) => {
    setIsDragging(true);
    dragInfoRef.current = {
      startX: clientX,
      startY: clientY,
      origX: position.x,
      origY: position.y,
      hasMoved: false
    };

    const handlePointerMove = (e) => {
      const curX = e.touches ? e.touches[0].clientX : e.clientX;
      const curY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = curX - dragInfoRef.current.startX;
      const dy = curY - dragInfoRef.current.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragInfoRef.current.hasMoved = true;
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 220, dragInfoRef.current.origX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragInfoRef.current.origY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      // Save position to localStorage
      setPosition((current) => {
        try {
          localStorage.setItem("smartdine_ai_btn_pos", JSON.stringify(current));
        } catch (e) {}
        return current;
      });
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
  };

  const handleMouseDown = (e) => {
    // Only drag with left click
    if (e.button !== 0) return;
    handlePointerDown(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handlePointerDown(touch.clientX, touch.clientY);
  };

  const handleClick = (e) => {
    if (dragInfoRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate("/ai-assistant");
  };

  // Hide on admin, kitchen, and when already on /ai-assistant
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/kitchen") ||
    location.pathname === "/ai-assistant"
  ) {
    return null;
  }

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`ai-floating-widget burger-ai-widget ${isDragging ? "dragging" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: "auto",
        right: "auto",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none"
      }}
      title="Click to open AI Food Assistant • Drag to move anywhere"
      role="button"
      tabIndex={0}
      aria-label="Open AI Food Assistant"
    >
      {/* Drag Grip Handle */}
      <span className="burger-drag-grip" title="Drag to move">
        <GripVertical size={13} color="#94a3b8" />
      </span>

      {/* Animated Burger Avatar */}
      <div className="burger-avatar-wrapper">
        <svg
          viewBox="0 0 64 64"
          className="burger-svg-icon"
          width="36"
          height="36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Bun */}
          <path
            d="M8 28C8 16.9543 18.7452 8 32 8C45.2548 8 56 16.9543 56 28H8Z"
            fill="#F59E0B"
          />
          {/* Sesame Seeds */}
          <circle cx="20" cy="18" r="1.5" fill="#FEF3C7" />
          <circle cx="28" cy="14" r="1.5" fill="#FEF3C7" />
          <circle cx="36" cy="15" r="1.5" fill="#FEF3C7" />
          <circle cx="44" cy="19" r="1.5" fill="#FEF3C7" />
          <circle cx="26" cy="22" r="1.5" fill="#FEF3C7" />
          <circle cx="38" cy="22" r="1.5" fill="#FEF3C7" />
          {/* Crisp Green Lettuce */}
          <path
            d="M6 31C9 28.5 12 32.5 15 31C18 29.5 21 32.5 24 31C27 29.5 30 32.5 33 31C36 29.5 39 32.5 42 31C45 29.5 48 32.5 51 31C54 29.5 57 32 58 31V33.5H6V31Z"
            fill="#22C55E"
          />
          {/* Melted Cheese Slice */}
          <path
            d="M9 33.5H55L49 41L38 35L26 40L17 35L9 38V33.5Z"
            fill="#FBBF24"
          />
          {/* Crispy Veg Patty */}
          <rect x="9" y="38" width="46" height="8" rx="4" fill="#78350F" />
          {/* Bottom Bun */}
          <path
            d="M10 47.5C10 47.5 11 55 32 55C53 55 54 47.5 54 47.5H10Z"
            fill="#F59E0B"
          />
        </svg>

        {/* AI Sparkle Badge */}
        <span className="burger-sparkle-badge">
          <Sparkles size={11} color="#ffffff" />
        </span>
      </div>

      {/* Label */}
      <div className="ai-widget-label">
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <strong>Ask Burger AI</strong>
          <span className="badge-ai-live">AI</span>
        </div>
        <span>Food Assistant • Moveable</span>
      </div>
    </div>
  );
}
