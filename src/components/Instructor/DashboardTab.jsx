// src/components/DashboardTab.jsx
import React from "react";
import { colors } from "./AdminStyles";

// eslint-disable-next-line no-unused-vars
function KpiCard({ label, value, iconBg, icon, loading }) {
  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: 16,
        padding: 20,
        border: `1px solid ${colors.borderLight}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary }}>
        {loading ? "..." : value}
      </div>
    </div>
  );
}

export default function DashboardTab({ kpis, loading, isMobile, onNavigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} loading={loading} />
        ))}
      </div>

      {/* Welcome Banner */}
      <div
        style={{
          background: colors.gradPrimary,
          borderRadius: 16,
          padding: 24,
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
              🎓 Welcome to Instructor Dashboard
            </h3>
            <p style={{ fontSize: 14, opacity: 0.9 }}>
              Manage your courses, track student progress, and monitor your enrollments from one place.
            </p>
          </div>
          <div style={{ fontSize: 48 }}>👨‍🏫</div>
        </div>
      </div>
    </div>
  );
}