import React from "react";
import { Clock, CheckCircle, Flame, BellRing, CheckCheck, XCircle } from "lucide-react";

export default function OrderStatus({ status, size = "md" }) {
  const normalized = (status || "Pending").toLowerCase();

  const configs = {
    pending: {
      label: "Pending",
      className: "status-pending",
      icon: Clock
    },
    accepted: {
      label: "Accepted",
      className: "status-accepted",
      icon: CheckCircle
    },
    preparing: {
      label: "Preparing",
      className: "status-preparing",
      icon: Flame
    },
    ready: {
      label: "Ready for Pickup/Serve",
      className: "status-ready",
      icon: BellRing
    },
    completed: {
      label: "Completed",
      className: "status-completed",
      icon: CheckCheck
    },
    cancelled: {
      label: "Cancelled",
      className: "status-cancelled",
      icon: XCircle
    }
  };

  const current = configs[normalized] || configs.pending;
  const Icon = current.icon;

  return (
    <span className={`order-status-badge ${current.className} status-size-${size}`}>
      <Icon size={size === "sm" ? 13 : 16} className="status-icon" />
      <span className="status-label">{current.label}</span>
    </span>
  );
}
