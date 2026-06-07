// src/components/Admin/CoursesTab.jsx
import React from "react";
import Swal from "sweetalert2";
import { colors, Badge } from "./AdminStyles";
import { deleteAdminCourse } from "../../api/adminApi";

export default function CoursesTab({
  courses,
  isMobile,
  setSelectedCourse,
  setIsEditCourseModalOpen,
  setIsAddCourseModalOpen,
  fetchCourses
}) {
  const handleDeleteCourse = async (courseId, courseTitle) => {
    const result = await Swal.fire({
      title: 'Delete Course?',
      html: `<p>Delete <strong>${courseTitle}</strong>? This cannot be undone!</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#E8644A',
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      try {
        await deleteAdminCourse(courseId);
        if (fetchCourses) await fetchCourses();
        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({ title: 'Failed!', text: error.response?.data?.message || 'Failed to delete course', icon: 'error' });
      }
    }
  };

  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: 16,
      padding: isMobile ? 16 : 20,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>🌐 All Courses</h2>
          <p style={{ fontSize: 12, color: colors.textMuted }}>
            Total {courses.length} courses available
          </p>
        </div>
        <button
          onClick={() => setIsAddCourseModalOpen(true)}
          style={{
            background: colors.primary,
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 40,
            cursor: "pointer",
          }}
        >
          + New Course
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, background: colors.bgBase }}>
              <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Course Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Instructor</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Price</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, idx) => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${colors.borderLight}`, background: idx % 2 === 0 ? colors.surface : colors.bgBase }}>
                <td style={{ padding: "12px" }}>#{c.id}</td>
                <td style={{ padding: "12px", fontWeight: 500 }}>{c.title || "Untitled"}</td>
                <td style={{ padding: "12px", color: colors.textSecondary }}>{c.instructor || "—"}</td>
                <td style={{ padding: "12px", color: colors.teal, fontWeight: 600 }}>${c.price || "0"}</td>
                <td style={{ padding: "12px" }}><Badge status={c.status || "PUBLISHED"} /></td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => {
                      setSelectedCourse(c);
                      setIsEditCourseModalOpen(true);
                    }}
                    style={{
                      padding: "5px 12px",
                      marginRight: 8,
                      borderRadius: 6,
                      border: `1px solid ${colors.borderLight}`,
                      background: colors.surface,
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c.id, c.title)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: `1px solid ${colors.borderLight}`,
                      background: colors.surface,
                      color: colors.coral,
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}