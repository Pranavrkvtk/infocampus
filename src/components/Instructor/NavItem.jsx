// src/components/NavItem.jsx
import React from "react";
import { colors } from "./AdminStyles";

export default function NavItem({ icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "12px 20px",
        marginBottom: 4,
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        background: active ? colors.primarySoft : "transparent",
        color: active ? colors.primary : colors.textSecondary,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = colors.bgBase;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span
          style={{
            background: active ? colors.primary : colors.borderLight,
            color: active ? "white" : colors.textMuted,
            padding: "2px 8px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            transition: "all 0.2s ease",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}