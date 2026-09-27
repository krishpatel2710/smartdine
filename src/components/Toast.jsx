import React from "react";
import { useToast } from "../context/ToastContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let badgeClass = "toast-success";

        if (toast.type === "error") {
          Icon = AlertCircle;
          badgeClass = "toast-error";
        } else if (toast.type === "info" || toast.type === "warning") {
          Icon = Info;
          badgeClass = "toast-info";
        }

        return (
          <div key={toast.id} className={`toast-item ${badgeClass}`}>
            <Icon className="toast-icon" size={20} />
            <span className="toast-message">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
