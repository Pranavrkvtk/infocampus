// src/components/Admin/NavItem.jsx
import React, { useState } from "react";
import { colors } from "./AdminStyles";

export default function NavItem({ icon, label, badge, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        margin: "4px 8px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        color: active ? colors.primary : hovered ? colors.textPrimary : colors.textSecondary,
        background: active ? colors.primarySoft : hovered ? "#F1F4FA" : "transparent",
        transition: "all 0.18s",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span
          style={{
            background: colors.primary,
            color: "#fff",
            fontSize: 11,
            borderRadius: 40,
            padding: "2px 8px",
            fontWeight: 600,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}