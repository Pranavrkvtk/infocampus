// src/components/CoursesTab.jsx
import React, { useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("title"); // 'title', 'id', 'status', 'level'

  // Filter courses based on search
  const filteredCourses = courses.filter((course) => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;

    switch (searchField) {
      case "id":
        return course.id.toString().includes(searchLower);
      case "status":
        return (course.status || "DRAFT").toLowerCase().includes(searchLower);
      case "level":
        return (course.level || "Beginner").toLowerCase().includes(searchLower);
      case "title":
      default:
        return (course.title || "Untitled").toLowerCase().includes(searchLower);
    }
  });

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
            Total {filteredCourses.length} {isInstructor ? "courses you're teaching" : "courses available"}
            {searchTerm && ` (filtered from ${courses.length})`}
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

      {/* Search Bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 8,
              border: `1px solid ${colors.borderLight}`,
              background: colors.bgBase,
              color: colors.textPrimary,
              fontSize: 14,
              outline: "none",
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
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: `1px solid ${colors.borderLight}`,
            background: colors.bgBase,
            color: colors.textPrimary,
            fontSize: 14,
            outline: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.borderLight;
          }}
        >
          <option value="title">Search by Title</option>
          <option value="id">Search by ID</option>
          <option value="status">Search by Status</option>
          <option value="level">Search by Level</option>
        </select>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: `1px solid ${colors.borderLight}`,
              background: colors.surface,
              color: colors.textSecondary,
              cursor: "pointer",
              fontSize: 14,
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.borderLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.surface;
            }}
          >
            ✕ Clear
          </button>
        )}
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
            {filteredCourses.map((c, idx) => (
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
                  {c.enrollmentCount || c.studentCount || 0}
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
        {filteredCourses.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: colors.textMuted,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {searchTerm ? "🔍" : "📚"}
            </div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>
              {searchTerm
                ? `No courses found matching "${searchTerm}"`
                : isInstructor
                ? "No courses yet. Click 'New Course' to get started!"
                : "No courses available."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  marginTop: 12,
                  padding: "8px 20px",
                  borderRadius: 6,
                  border: `1px solid ${colors.borderLight}`,
                  background: colors.surface,
                  color: colors.textSecondary,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}