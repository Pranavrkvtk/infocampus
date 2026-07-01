// src/components/MobileBottomNav.jsx
import React from "react";
import { colors } from "./AdminStyles";

export default function MobileBottomNav({ activeTab, onTabChange, onLogout, items }) {
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
        padding: "8px 4px",
        zIndex: 99,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: "transparent",
            border: "none",
            padding: "6px 0",
            borderRadius: 12,
            cursor: "pointer",
            color: activeTab === item.id ? colors.primary : colors.textMuted,
            transition: "all 0.2s ease",
            position: "relative",
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 500 }}>{item.label}</span>
          {activeTab === item.id && (
            <div
              style={{
                position: "absolute",
                top: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 20,
                height: 3,
                borderRadius: 2,
                background: colors.primary,
              }}
            />
          )}
        </button>
      ))}
      <button
        onClick={onLogout}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          background: "transparent",
          border: "none",
          padding: "6px 0",
          borderRadius: 12,
          cursor: "pointer",
          color: colors.coral,
        }}
      >
        <span style={{ fontSize: 20 }}>🚪</span>
        <span style={{ fontSize: 9, fontWeight: 500 }}>Logout</span>
      </button>
    </div>
  );
}