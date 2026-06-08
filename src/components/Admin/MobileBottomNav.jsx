import React from "react";
import { colors, navItems } from "./AdminStyles";

export default function MobileBottomNav({ activeTab, onTabChange, onLogout }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: colors.surface,
        borderTop: `1px solid ${colors.borderLight}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 16px",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))", // Added safe area
        zIndex: 100,
      }}
    >
      {navItems.map((item) => (
        <div
          key={item.id}
          onClick={() => onTabChange(item.id)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            color: activeTab === item.id ? colors.primary : colors.textMuted,
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
        </div>
      ))}
      <div
        onClick={onLogout}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          cursor: "pointer",
          color: colors.coral,
        }}
      >
        <span style={{ fontSize: 20 }}>🚪</span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>Logout</span>
      </div>
    </div>
  );
}