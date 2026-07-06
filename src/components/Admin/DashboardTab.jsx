// src/components/Admin/DashboardTab.jsx
import React from "react";
import {
  colors,
  // ✅ Remove unused import
  // KpiCard,  
} from "./AdminStyles";

export default function DashboardTab({
  kpis,
  loading,
  isMobile,
  onNavigate, // ✅ Add this prop
}) {
  // ✅ Map KPI cards to their respective tabs
  const getNavigationTarget = (index) => {
    const targets = {
      0: "students",      // Total Students → Students tab
      1: "courses",       // Total Courses → Courses tab
      2: "enrollments",   // Total Enrollments → Enrollments tab
      3: "instructors",   // Total Instructors → Instructors tab
    };
    return targets[index] || null;
  };

  // ✅ Get icon for each KPI
  const getKpiIcon = (label) => {
    if (label.includes("Students")) return "👨‍🎓";
    if (label.includes("Courses")) return "📚";
    if (label.includes("Enrollments")) return "📋";
    if (label.includes("Instructors")) return "👨‍🏫";
    return "📊";
  };

  // ✅ Get description for each KPI
  const getKpiDescription = (label) => {
    if (label.includes("Students")) return "View and manage all students";
    if (label.includes("Courses")) return "View and manage all courses";
    if (label.includes("Enrollments")) return "View all enrollments and progress";
    if (label.includes("Instructors")) return "View and manage instructors";
    return "View details";
  };

  // ✅ Get color for each KPI
  const getKpiColor = (label) => {
    if (label.includes("Students")) return colors.primarySoft;
    if (label.includes("Courses")) return colors.tealSoft;
    if (label.includes("Enrollments")) return colors.amberSoft;
    if (label.includes("Instructors")) return colors.purpleSoft;
    return colors.primarySoft;
  };

  // ✅ Handle card click
  const handleCardClick = (index) => {
    const target = getNavigationTarget(index);
    if (target && onNavigate) {
      onNavigate(target);
    }
  };

  return (
    <>
      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(4, 1fr)",
          gap: isMobile ? 12 : 20,
          marginBottom: 24,
        }}
      >
        {kpis.map((kpi, index) => {
          const targetTab = getNavigationTarget(index);
          const icon = getKpiIcon(kpi.label);
          const description = getKpiDescription(kpi.label);
          const bgColor = getKpiColor(kpi.label);

          return (
            <div
              key={index}
              onClick={() => handleCardClick(index)}
              style={{
                cursor: targetTab ? "pointer" : "default",
                transition: "all 0.3s ease",
                borderRadius: 16,
                background: "var(--surface)",
                border: `1px solid var(--border-light)`,
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (targetTab) {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = colors.primary;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "var(--border-light)";
              }}
            >
              {/* Icon with background */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: 12,
                }}
              >
                {icon}
              </div>

              {/* Value */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                {loading ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: 60,
                      height: 28,
                      background: "var(--bg-base)",
                      borderRadius: 4,
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ) : (
                  kpi.value
                )}
              </div>

              {/* Label */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                {kpi.label}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  opacity: 0.7,
                  marginBottom: 12,
                }}
              >
                {description}
              </div>

              {/* Click to view indicator */}
              {targetTab && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    color: colors.primary,
                  }}
                >
                  <span>Click to view</span>
                  <span style={{ fontSize: 14 }}>→</span>
                </div>
              )}

              {/* Loading shimmer */}
              {loading && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Welcome Card */}
      <div
        style={{
          background: "var(--surface)",
          border: `1px solid var(--border-light)`,
          borderRadius: 16,
          padding: isMobile ? 20 : 30,
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            fontSize: isMobile ? 42 : 56,
            marginBottom: 16,
          }}
        >
          🎓
        </div>

        <h2
          style={{
            fontSize: isMobile ? 20 : 24,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          Welcome to Admin Dashboard
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Manage your courses, track student progress,
          monitor enrollments, and oversee the entire
          learning platform from one place.
        </p>

        {/* Quick Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(4, 1fr)",
            gap: 16,
            marginTop: 28,
          }}
        >
          <QuickActionCard
            icon="👨‍🎓"
            label="Students"
            description="Manage students"
            onClick={() => onNavigate && onNavigate("students")}
            color={colors.primarySoft}
          />
          <QuickActionCard
            icon="📚"
            label="Courses"
            description="Manage courses"
            onClick={() => onNavigate && onNavigate("courses")}
            color={colors.tealSoft}
          />
          <QuickActionCard
            icon="📋"
            label="Enrollments"
            description="View enrollments"
            onClick={() => onNavigate && onNavigate("enrollments")}
            color={colors.amberSoft}
          />
          <QuickActionCard
            icon="👨‍🏫"
            label="Instructors"
            description="Manage instructors"
            onClick={() => onNavigate && onNavigate("instructors")}
            color={colors.purpleSoft}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}

// ✅ Quick Action Card Component
function QuickActionCard({ icon, label, description, onClick, color }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 16,
        borderRadius: 12,
        background: color || "var(--bg-base)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        e.currentTarget.style.borderColor = colors.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <div
        style={{
          fontSize: 28,
          marginBottom: 8,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          marginTop: 4,
        }}
      >
        {description}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: colors.primary,
          fontWeight: 500,
        }}
      >
        Click to view →
      </div>
    </div>
  );
}