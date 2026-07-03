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
  // Helper function to get enrolled courses count
  const getCourseCount = (student) => {
    if (student.courses && Array.isArray(student.courses)) {
      return student.courses.length;
    }
    if (student.enrolledCourses && Array.isArray(student.enrolledCourses)) {
      return student.enrolledCourses.length;
    }
    if (student.courseCount) {
      return student.courseCount;
    }
    if (student.enrollmentCount) {
      return student.enrollmentCount;
    }
    return 0;
  };

  // Helper function to get enrolled courses list
  const getCourseList = (student) => {
    if (student.courses && Array.isArray(student.courses)) {
      return student.courses.map(c => c.courseTitle || c.title || c.name).join(", ");
    }
    if (student.enrolledCourses && Array.isArray(student.enrolledCourses)) {
      return student.enrolledCourses.join(", ");
    }
    return "";
  };

  // Helper function to get progress
  const getProgress = (student) => {
    if (student.courses && Array.isArray(student.courses) && student.courses.length > 0) {
      // Calculate average progress from all courses
      const totalProgress = student.courses.reduce((sum, c) => sum + (c.progress || 0), 0);
      return Math.round(totalProgress / student.courses.length);
    }
    return student.progress || 0;
  };

  // Helper function to get student status
  const getStudentStatus = (student) => {
    if (student.status) return student.status;
    if (student.courses && Array.isArray(student.courses) && student.courses.length > 0) {
      // Check if any course is active
      const hasActive = student.courses.some(c => c.status === "ACTIVE");
      return hasActive ? "ACTIVE" : "INACTIVE";
    }
    return "ACTIVE";
  };

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
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, background: colors.bgBase }}>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Student Name</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Courses</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Progress</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Status</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Enrolled Date</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => {
              const courseCount = getCourseCount(s);
              const courseList = getCourseList(s);
              const progress = getProgress(s);
              const status = getStudentStatus(s);
              
              return (
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
                    <div>
                      <span style={{ fontWeight: 600, color: colors.teal }}>{courseCount}</span>
                      {courseList && (
                        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                          {courseList.length > 40 ? courseList.substring(0, 40) + "..." : courseList}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
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
                            width: `${Math.min(progress, 100)}%`,
                            height: 6,
                            background: progress >= 80 ? colors.teal : progress >= 50 ? colors.primary : colors.amber,
                            borderRadius: 3,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600, minWidth: 35 }}>
                        {progress}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <Badge status={status} />
                  </td>
                  <td style={{ padding: "12px", fontSize: 12, color: colors.textSecondary }}>
                    {s.courses && s.courses.length > 0 && s.courses[0].enrolledAt 
                      ? new Date(s.courses[0].enrolledAt).toLocaleDateString()
                      : s.enrolledAt 
                        ? new Date(s.enrolledAt).toLocaleDateString()
                        : "-"
                    }
                  </td>
                </tr>
              );
            })}
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