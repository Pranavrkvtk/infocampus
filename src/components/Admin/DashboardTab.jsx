import React from "react";
import {
  colors,
  KpiCard,
} from "./AdminStyles";

export default function DashboardTab({
  kpis,
  loading,
  isMobile,
}) {
  return (
    <>
      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(3, 1fr)",
          gap: isMobile ? 12 : 20,
          marginBottom: 24,
        }}
      >
        {kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            {...kpi}
            loading={loading}
          />
        ))}
      </div>

      {/* Welcome Card */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.borderLight}`,
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
            color: colors.textPrimary,
            marginBottom: 12,
          }}
        >
          Welcome to Admin Dashboard
        </h2>

        <p
          style={{
            color: colors.textSecondary,
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

        {/* Quick Stats Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(3, 1fr)",
            gap: 16,
            marginTop: 28,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: colors.primarySoft,
            }}
          >
            <div
              style={{
                fontSize: 22,
                marginBottom: 8,
              }}
            >
              👨‍🎓
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.textPrimary,
              }}
            >
              Students
            </div>

            <div
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              Track student registrations
            </div>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: colors.tealSoft,
            }}
          >
            <div
              style={{
                fontSize: 22,
                marginBottom: 8,
              }}
            >
              📚
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.textPrimary,
              }}
            >
              Courses
            </div>

            <div
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              Create and manage courses
            </div>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: colors.amberSoft,
            }}
          >
            <div
              style={{
                fontSize: 22,
                marginBottom: 8,
              }}
            >
              📈
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.textPrimary,
              }}
            >
              Analytics
            </div>

            <div
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              Monitor platform performance
            </div>
          </div>
        </div>
      </div>
    </>
  );
}