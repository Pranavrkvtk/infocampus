// src/components/Admin/AdminMobileHeader.jsx
import React from "react";
import { colors } from "./AdminStyles";

export default function AdminMobileHeader({ isMobile, currentTime, activeTab }) {
  if (!isMobile) return null;

  const getTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard";
      case "courses": return "Course Catalog";
      case "students": return "Student Management";
      default: return "Admin";
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      background: colors.surface, borderBottom: `1px solid ${colors.borderLight}`,
      padding: "12px 16px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      zIndex: 99,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, background: colors.gradPrimary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: "#fff",
        }}>⚡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>INFOCAMPUS</div>
          <div style={{ fontSize: 9, color: colors.textMuted }}>{getTitle()}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: colors.textMuted, textAlign: "right" }}>
        <div style={{ fontWeight: 600, color: colors.primary }}>{currentTime}</div>
        <div>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
      </div>
    </div>
  );
}