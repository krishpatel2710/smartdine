import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = "orange", // orange, blue, green, purple, amber
  trend
}) {
  return (
    <div className={`dashboard-kpi-card card-color-${colorScheme}`}>
      <div className="kpi-top">
        <div className="kpi-info">
          <span className="kpi-title">{title}</span>
          <h3 className="kpi-value">{value}</h3>
        </div>
        {Icon && (
          <div className="kpi-icon-wrap">
            <Icon size={24} />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="kpi-bottom">
          {trend && (
            <span className={`kpi-trend ${trend.isPositive ? "trend-up" : "trend-down"}`}>
              {trend.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
