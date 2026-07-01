// src/components/CoursesTab.jsx
import React from "react";
import { colors, Badge } from "./AdminStyles";

export default function CoursesTab({
  courses,
  isMobile,
  setSelectedCourse,
  setIsEditCourseModalOpen,
  setIsAddCourseModalOpen,
  handleDeleteCourse,
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
            {isInstructor ? "🌐 My Courses" : "🌐 All Courses"}
          </h2>
          <p style={{ fontSize: 12, color: colors.textMuted }}>
            Total {courses.length} {isInstructor ? "courses you're teaching" : "courses available"}
          </p>
        </div>
        <button
          onClick={() => setIsAddCourseModalOpen(true)}
          style={{
            background: colors.primary,
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 40,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primaryDark;
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.primary;
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          + New Course
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, background: colors.bgBase }}>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Course Name</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Students</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Price</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Status</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Level</th>
              <th style={{ padding: "12px", textAlign: "center", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, idx) => (
              <tr
                key={c.id}
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
                <td style={{ padding: "12px", fontSize: 13, color: colors.textSecondary }}>#{c.id}</td>
                <td style={{ padding: "12px", fontWeight: 500, color: colors.textPrimary }}>
                  {c.title || "Untitled"}
                </td>
                <td style={{ padding: "12px", color: colors.textSecondary }}>
                  {c.studentCount || 0}
                </td>
                <td style={{ padding: "12px", color: colors.teal, fontWeight: 600 }}>
                  ${c.price || "0"}
                </td>
                <td style={{ padding: "12px" }}>
                  <Badge status={c.status || "DRAFT"} />
                </td>
                <td style={{ padding: "12px" }}>
                  <Badge status={c.level || "Beginner"} />
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => {
                      setSelectedCourse(c);
                      setIsEditCourseModalOpen(true);
                    }}
                    style={{
                      padding: "6px 14px",
                      marginRight: 8,
                      borderRadius: 6,
                      border: `1px solid ${colors.borderLight}`,
                      background: colors.surface,
                      cursor: "pointer",
                      fontSize: 12,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.primarySoft;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.surface;
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c.id, c.title)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: `1px solid ${colors.borderLight}`,
                      background: colors.surface,
                      color: colors.coral,
                      cursor: "pointer",
                      fontSize: 12,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.coralSoft;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.surface;
                    }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: colors.textMuted,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>
              {isInstructor
                ? "No courses yet. Click 'New Course' to get started!"
                : "No courses available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}