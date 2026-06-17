import React from "react";

export default function MobileBottomNav({ activeTab, onTabChange, onLogout, items }) {
  // Fallback to default items if not provided
  const defaultItems = [
    { icon: "📊", label: "Dashboard", id: "dashboard" },
    { icon: "🌐", label: "Courses", id: "courses" },
    { icon: "👨‍🎓", label: "Students", id: "students" },
    { icon: "👨‍🏫", label: "Instructors", id: "instructors" },
    { icon: "🎬", label: "Media", id: "media" },        // Added
    { icon: "🏗️", label: "Course Manager", id: "course-manager" },
  ];
  const navItems = items || defaultItems;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "var(--surface)",
      borderTop: "1px solid var(--border-light)",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0",
      zIndex: 100,
    }}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          style={{
            background: "transparent",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 12,
            color: activeTab === item.id ? "var(--primary)" : "var(--text-secondary)",
            padding: "4px 8px",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          <span style={{ fontSize: 10, marginTop: 2 }}>{item.label}</span>
          {activeTab === item.id && (
            <span style={{
              position: "absolute",
              top: -2,
              width: 20,
              height: 3,
              background: "var(--primary)",
              borderRadius: 2,
            }} />
          )}
        </button>
      ))}
      <button
        onClick={onLogout}
        style={{
          background: "transparent",
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: 12,
          color: "var(--error)",
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 22 }}>🚪</span>
        <span style={{ fontSize: 10 }}>Logout</span>
      </button>
    </div>
  );
}