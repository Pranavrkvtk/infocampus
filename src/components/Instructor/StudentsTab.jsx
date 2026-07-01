// src/components/StudentsTab.jsx
import React from "react";
import { colors, Badge } from "./AdminStyles";

export default function StudentsTab({
  students,
  searchTerm,
  handleSearchChange,
  isMobile,
  isInstructor = false,
}) {
  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 16,
        padding: isMobile ? 16 : 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary }}>
            👨‍🎓 {isInstructor ? "My Students" : "All Students"}
          </h2>
          <p style={{ fontSize: 12, color: colors.textMuted }}>
            Total {students.length} students
            {isInstructor && " enrolled in your courses"}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            padding: "10px 16px",
            borderRadius: 40,
            border: `1px solid ${colors.borderLight}`,
            background: colors.surface,
            width: isMobile ? "100%" : 240,
            outline: "none",
            fontSize: 13,
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.borderLight;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, background: colors.bgBase }}>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Student Name</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Enrolled Courses</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Progress</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr
                key={s.id}
                style={{
                  borderBottom: `1px solid ${colors.borderLight}`,
                  background: idx % 2 === 0 ? colors.surface : colors.bgBase,
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primarySoft;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = idx % 2 === 0 ? colors.surface : colors.bgBase;
                }}
              >
                <td style={{ padding: "12px", fontSize: 13, color: colors.textSecondary }}>#{s.id}</td>
                <td style={{ padding: "12px", fontWeight: 500, color: colors.textPrimary }}>
                  {s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Unnamed"}
                </td>
                <td style={{ padding: "12px", color: colors.textSecondary }}>{s.email}</td>
                <td style={{ padding: "12px", color: colors.textSecondary }}>
                  {s.enrolledCourses || s.courseCount || 0}
                </td>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 6,
                        background: colors.borderLight,
                        borderRadius: 3,
                        width: 80,
                      }}
                    >
                      <div
                        style={{
                          width: `${s.progress || 0}%`,
                          height: 6,
                          background: colors.teal,
                          borderRadius: 3,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600 }}>
                      {s.progress || 0}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: "12px" }}>
                  <Badge status={s.status || "ACTIVE"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: colors.textMuted,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🎓</div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>
              {isInstructor
                ? "No students enrolled in your courses yet."
                : "No students found."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}