// src/components/StudentsTab.jsx
import React, { useState } from "react";
import { colors, Badge } from "./AdminStyles";

export default function StudentsTab({
  students,
  isMobile,
  isInstructor = false,
}) {
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    id: "",
    course: "",
    status: ""
  });

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
      const totalProgress = student.courses.reduce((sum, c) => sum + (c.progress || 0), 0);
      return Math.round(totalProgress / student.courses.length);
    }
    return student.progress || 0;
  };

  // Helper function to get student status
  const getStudentStatus = (student) => {
    if (student.status) return student.status;
    if (student.courses && Array.isArray(student.courses) && student.courses.length > 0) {
      const hasActive = student.courses.some(c => c.status === "ACTIVE");
      return hasActive ? "ACTIVE" : "INACTIVE";
    }
    return "ACTIVE";
  };

  // Helper function to get student name
  const getStudentName = (student) => {
    return student.name || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unnamed";
  };

  // Get unique statuses from students for dropdown
  const getUniqueStatuses = () => {
    const statuses = new Set();
    students.forEach(student => {
      statuses.add(getStudentStatus(student));
    });
    return Array.from(statuses).sort();
  };

  // Filter students based on all active filters
  const filteredStudents = students.filter((student) => {
    const nameFilter = filters.name.toLowerCase().trim();
    const emailFilter = filters.email.toLowerCase().trim();
    const idFilter = filters.id.toLowerCase().trim();
    const courseFilter = filters.course.toLowerCase().trim();
    const statusFilter = filters.status.toLowerCase().trim();

    // Check each filter - if filter is empty, it passes
    const nameMatch = !nameFilter || getStudentName(student).toLowerCase().includes(nameFilter);
    const emailMatch = !emailFilter || (student.email || "").toLowerCase().includes(emailFilter);
    const idMatch = !idFilter || student.id.toString().toLowerCase().includes(idFilter);
    const courseMatch = !courseFilter || getCourseList(student).toLowerCase().includes(courseFilter);
    const statusMatch = !statusFilter || getStudentStatus(student).toLowerCase().includes(statusFilter);

    return nameMatch && emailMatch && idMatch && courseMatch && statusMatch;
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      name: "",
      email: "",
      id: "",
      course: "",
      status: ""
    });
  };

  const isFilterActive = () => {
    return Object.values(filters).some(value => value.trim() !== "");
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value.trim() !== "").length;
  };

  const statusOptions = getUniqueStatuses();

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
            Total {filteredStudents.length} students
            {isInstructor && " enrolled in your courses"}
            {isFilterActive() && ` (filtered from ${students.length})`}
          </p>
        </div>
        {isFilterActive() && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: `1px solid ${colors.borderLight}`,
              background: colors.surface,
              color: colors.coral,
              cursor: "pointer",
              fontSize: 13,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.coralSoft;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.surface;
            }}
          >
            ✕ Clear All Filters ({getActiveFilterCount()})
          </button>
        )}
      </div>

      {/* Multiple Search Inputs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: "block", marginBottom: 4 }}>
            🔍 Name
          </label>
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: `1px solid ${filters.name ? colors.primary : colors.borderLight}`,
              background: colors.bgBase,
              color: colors.textPrimary,
              fontSize: 13,
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = filters.name ? colors.primary : colors.borderLight;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: "block", marginBottom: 4 }}>
            📧 Email
          </label>
          <input
            type="text"
            placeholder="Search by email..."
            value={filters.email}
            onChange={(e) => handleFilterChange("email", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: `1px solid ${filters.email ? colors.primary : colors.borderLight}`,
              background: colors.bgBase,
              color: colors.textPrimary,
              fontSize: 13,
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = filters.email ? colors.primary : colors.borderLight;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: "block", marginBottom: 4 }}>
            🆔 ID
          </label>
          <input
            type="text"
            placeholder="Search by ID..."
            value={filters.id}
            onChange={(e) => handleFilterChange("id", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: `1px solid ${filters.id ? colors.primary : colors.borderLight}`,
              background: colors.bgBase,
              color: colors.textPrimary,
              fontSize: 13,
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = filters.id ? colors.primary : colors.borderLight;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: "block", marginBottom: 4 }}>
            📚 Course
          </label>
          <input
            type="text"
            placeholder="Search by course..."
            value={filters.course}
            onChange={(e) => handleFilterChange("course", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: `1px solid ${filters.course ? colors.primary : colors.borderLight}`,
              background: colors.bgBase,
              color: colors.textPrimary,
              fontSize: 13,
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = filters.course ? colors.primary : colors.borderLight;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: "block", marginBottom: 4 }}>
            📊 Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 6,
              border: `1px solid ${filters.status ? colors.primary : colors.borderLight}`,
              background: colors.bgBase,
              color: colors.textPrimary,
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = filters.status ? colors.primary : colors.borderLight;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {isFilterActive() && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
            padding: "10px 12px",
            background: colors.primarySoft,
            borderRadius: 6,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 13, color: colors.textPrimary, marginRight: 8 }}>
            Active Filters:
          </span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value.trim()) return null;
            const labels = {
              name: "Name",
              email: "Email",
              id: "ID",
              course: "Course",
              status: "Status"
            };
            return (
              <span
                key={key}
                style={{
                  background: colors.surface,
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontSize: 12,
                  border: `1px solid ${colors.borderLight}`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontWeight: 600, color: colors.textSecondary }}>
                  {labels[key]}:
                </span>
                <span style={{ color: colors.textPrimary }}>"{value}"</span>
                <button
                  onClick={() => handleFilterChange(key, "")}
                  style={{
                    background: "none",
                    border: "none",
                    color: colors.coral,
                    cursor: "pointer",
                    padding: "0 2px",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
          <button
            onClick={clearAllFilters}
            style={{
              background: "none",
              border: "none",
              color: colors.coral,
              cursor: "pointer",
              padding: "4px 8px",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Clear All
          </button>
        </div>
      )}

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
            {filteredStudents.map((s, idx) => {
              const courseCount = getCourseCount(s);
              const courseList = getCourseList(s);
              const progress = getProgress(s);
              const status = getStudentStatus(s);
              const studentName = getStudentName(s);
              
              // Highlight matching text function
              const highlightMatch = (text, filterField) => {
                const filterValue = filters[filterField].trim();
                if (!filterValue) return text;
                const index = text.toLowerCase().indexOf(filterValue.toLowerCase());
                if (index === -1) return text;
                return (
                  <>
                    {text.substring(0, index)}
                    <span style={{ 
                      background: colors.primarySoft, 
                      padding: "1px 4px", 
                      borderRadius: 3,
                      fontWeight: 700
                    }}>
                      {text.substring(index, index + filterValue.length)}
                    </span>
                    {text.substring(index + filterValue.length)}
                  </>
                );
              };

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
                  <td style={{ padding: "12px", fontSize: 13, color: colors.textSecondary }}>
                    {filters.id ? highlightMatch(`#${s.id}`, "id") : `#${s.id}`}
                  </td>
                  <td style={{ padding: "12px", fontWeight: 500, color: colors.textPrimary }}>
                    {filters.name ? highlightMatch(studentName, "name") : studentName}
                  </td>
                  <td style={{ padding: "12px", color: colors.textSecondary }}>
                    {filters.email ? highlightMatch(s.email, "email") : s.email}
                  </td>
                  <td style={{ padding: "12px", color: colors.textSecondary }}>
                    <div>
                      <span style={{ fontWeight: 600, color: colors.teal }}>{courseCount}</span>
                      {courseList && (
                        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                          {filters.course 
                            ? highlightMatch(courseList.length > 40 ? courseList.substring(0, 40) + "..." : courseList, "course")
                            : courseList.length > 40 ? courseList.substring(0, 40) + "..." : courseList
                          }
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
        {filteredStudents.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: colors.textMuted,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {isFilterActive() ? "🔍" : "👨‍🎓"}
            </div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>
              {isFilterActive()
                ? `No students found matching the current filters`
                : isInstructor
                ? "No students enrolled in your courses yet."
                : "No students found."}
            </p>
            {isFilterActive() && (
              <button
                onClick={clearAllFilters}
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
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}