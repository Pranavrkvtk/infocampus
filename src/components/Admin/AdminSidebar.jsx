// src/components/Admin/AdminSidebar.jsx
import React, { useState } from "react";
import { colors, navItems } from "./AdminStyles";

export default function AdminSidebar({ activeTab, setActiveTab, coursesCount, studentsCount, onLogout }) {
  const [hovered, setHovered] = useState(null);

  return (
    <nav style={{
      width: 260, background: colors.surface,
      borderRight: `1px solid ${colors.borderLight}`,
      display: "flex", flexDirection: "column",
      padding: "28px 0", position: "sticky",
      top: 0, height: "100vh", overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", marginBottom: 32 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, background: colors.gradPrimary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: "#fff",
        }}>⚡</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>INFOCAMPUS</div>
          <div style={{ fontSize: 10, color: colors.textMuted }}>ADMIN</div>
        </div>
      </div>

      {/* Navigation Items */}
      {navItems.map((item) => (
        <div
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", margin: "4px 8px", borderRadius: 12,
            fontSize: 14, fontWeight: 500, cursor: "pointer",
            color: activeTab === item.id ? colors.primary : hovered === item.id ? colors.textPrimary : colors.textSecondary,
            background: activeTab === item.id ? colors.primarySoft : hovered === item.id ? "#F1F4FA" : "transparent",
            transition: "all 0.18s",
          }}
        >
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.id === "courses" && coursesCount > 0 && (
            <span style={{
              background: colors.primary, color: "#fff",
              fontSize: 11, borderRadius: 40, padding: "2px 8px", fontWeight: 600,
            }}>{coursesCount}</span>
          )}
          {item.id === "students" && studentsCount > 0 && (
            <span style={{
              background: colors.primary, color: "#fff",
              fontSize: 11, borderRadius: 40, padding: "2px 8px", fontWeight: 600,
            }}>{studentsCount}</span>
          )}
        </div>
      ))}

      <div style={{ flex: 1 }} />
      
      {/* Logout Button */}
      <div style={{ padding: "0 8px 20px 8px" }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%", padding: "12px 16px", borderRadius: 12,
            fontSize: 14, fontWeight: 600, color: colors.coral,
            background: colors.coralSoft, border: "none", cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}