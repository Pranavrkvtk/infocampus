import React from "react";

// ================= COLORS =================

export const colors = {
  bgBase: "#F6F8FC",
  surface: "#FFFFFF",
  borderLight: "#E9EDF2",

  primary: "#5E5BFF",
  primaryLight: "#8C8AFF",
  primarySoft: "#EEF0FF",
  primaryDark: "#4C47E6",

  teal: "#14B895",
  tealLight: "#4FCFB2",
  tealSoft: "#E0F9F2",

  coral: "#E8644A",
  coralLight: "#F08F7A",
  coralSoft: "#FEF2EF",

  amber: "#E68A2E",
  amberLight: "#F0B06B",
  amberSoft: "#FEF5E8",

  textPrimary: "#1E293B",
  textSecondary: "#5A6A85",
  textMuted: "#8C9AB0",
  textFaint: "#B7C1D4",

  gradPrimary: "linear-gradient(135deg, #5E5BFF 0%, #8C8AFF 100%)",
  gradTeal: "linear-gradient(135deg, #14B895 0%, #4FCFB2 100%)",
  gradCoral: "linear-gradient(135deg, #E8644A 0%, #F08F7A 100%)",
  gradAmber: "linear-gradient(135deg, #E68A2E 0%, #F0B06B 100%)",
};

// ================= NAVIGATION =================

// ================= NAVIGATION =================

export const navItems = [
  { icon: "📊", label: "Dashboard", id: "dashboard" },
  { icon: "🌐", label: "Courses", id: "courses" },
  { icon: "👨‍🎓", label: "Students", id: "students" },
  { icon: "👨‍🏫", label: "Instructors", id: "instructors" }  // Add this line
];
// ================= HELPERS =================

export const getCurrentDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const getCurrentTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

// ================= BADGE =================

export function Badge({ status }) {
  const map = {
    PUBLISHED: {
      bg: colors.tealSoft,
      color: colors.teal,
    },

    DRAFT: {
      bg: "#F0F2F8",
      color: colors.textMuted,
    },

    ACTIVE: {
      bg: colors.tealSoft,
      color: colors.teal,
    },

    INACTIVE: {
      bg: colors.coralSoft,
      color: colors.coral,
    },

    PENDING: {
      bg: colors.amberSoft,
      color: colors.amber,
    },

    STUDENT: {
      bg: colors.primarySoft,
      color: colors.primary,
    },

    ADMIN: {
      bg: colors.amberSoft,
      color: colors.amber,
    },

    INSTRUCTOR: {
      bg: colors.tealSoft,
      color: colors.teal,
    },

    Beginner: {
      bg: colors.primarySoft,
      color: colors.primary,
    },

    Intermediate: {
      bg: colors.amberSoft,
      color: colors.amber,
    },

    Advanced: {
      bg: colors.coralSoft,
      color: colors.coral,
    },
  };

  const style = map[status] || {
    bg: "#F0F2F8",
    color: colors.textMuted,
  };

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "3px 10px",
        borderRadius: 50,
        fontSize: 10.5,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
}

// ================= KPI CARD =================

export function KpiCard({
  label,
  value,
  iconBg,
  icon,
  loading,
}) {
  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: 16,
        padding: 16,
        border: `1px solid ${colors.borderLight}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 2px 8px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 11,
          color: colors.textMuted,
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: colors.textPrimary,
        }}
      >
        {loading ? "..." : value}
      </div>
    </div>
  );
}

// ================= LOADING SPINNER =================

export function LoadingSpinner() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px",
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          border: `3px solid ${colors.borderLight}`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto",
        }}
      />

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// Add this at the end of your AdminStyles.js file

// ================= DATE TIME WIDGET =================

export function DateTimeWidget({ isMobile, currentTime }) {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 10 : 14,
        background: colors.surface,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 14,
        padding: isMobile ? "10px 12px" : "12px 18px",
        width: isMobile ? "100%" : "auto",
        maxWidth: isMobile ? "100%" : "320px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Date Icon */}
      <div
        style={{
          width: isMobile ? 38 : 46,
          height: isMobile ? 38 : 46,
          borderRadius: 12,
          background: colors.primarySoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isMobile ? 18 : 22,
          flexShrink: 0,
        }}
      >
        📅
      </div>

      {/* Date & Time */}
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            color: colors.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentDate}
        </div>

        <div
          style={{
            fontSize: isMobile ? 11 : 13,
            color: colors.primary,
            fontWeight: 600,
            marginTop: 2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          🕐 {currentTime}
        </div>
      </div>
    </div>
  );
}