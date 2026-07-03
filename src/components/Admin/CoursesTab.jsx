// src/components/Admin/CoursesTab.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { colors, Badge } from "./AdminStyles";
import { deleteAdminCourse, updateAdminCourse, getAllInstructors } from "../../api/adminApi";
import { getAvailableCourses, assignCourseToInstructor } from "../../api/instructorApi";

export default function CoursesTab({
  courses,
  isMobile,
  setSelectedCourse,
  setIsEditCourseModalOpen,
  setIsAddCourseModalOpen,
  fetchCourses,
  isInstructor = false
}) {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch available courses for instructor
  useEffect(() => {
    if (isInstructor) {
      fetchAvailableCourses();
    }
  }, [isInstructor]);

  // Fetch instructors for dropdown
  useEffect(() => {
    fetchInstructors();
  }, []);

  // Reset selection when courses change
  useEffect(() => {
    setSelectedCourses([]);
    setSelectAll(false);
  }, [courses]);

  const fetchAvailableCourses = async () => {
    try {
      const response = await getAvailableCourses();
      setAvailableCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await getAllInstructors();
      setInstructors(response.data || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  // Handle individual course selection
  const handleSelectCourse = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCourses([]);
    } else {
      const allIds = courses.map(c => c.id);
      setSelectedCourses(allIds);
    }
    setSelectAll(!selectAll);
  };

  // Bulk delete selected courses
  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) {
      Swal.fire("No Selection", "Please select at least one course to delete.", "info");
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${selectedCourses.length} Courses?`,
      html: `
        <p>Permanently delete <strong>${selectedCourses.length}</strong> courses?</p>
        <p style="color: #991b1b; font-size: 13px; margin-top: 8px;">
          ⚠️ This will permanently delete all selected courses and their associated data.
          <br>This action <strong>cannot</strong> be undone!
        </p>
        <ul style="text-align: left; max-height: 150px; overflow-y: auto; font-size: 13px; margin-top: 10px;">
          ${selectedCourses.map(id => {
            const course = courses.find(c => c.id === id);
            return `<li>${course?.title || 'Untitled'} (ID: ${id})</li>`;
          }).join('')}
        </ul>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, Delete ${selectedCourses.length} Courses`,
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Deleting...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Delete all selected courses one by one
      const deletePromises = selectedCourses.map((id) => deleteAdminCourse(id));
      await Promise.all(deletePromises);

      setSelectedCourses([]);
      setSelectAll(false);

      if (fetchCourses) await fetchCourses();
      if (isInstructor) await fetchAvailableCourses();

      Swal.fire({
        title: "Deleted!",
        text: `${selectedCourses.length} courses have been permanently removed.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      Swal.fire({
        title: "Failed!",
        text: error?.response?.data?.message || "Failed to delete some courses",
        icon: "error",
      });
    }
  };

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
        if (isInstructor) await fetchAvailableCourses();
        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({ title: 'Failed!', text: error.response?.data?.message || 'Failed to delete course', icon: 'error' });
      }
    }
  };

  const handleAssignCourse = async (courseId, courseTitle) => {
    const result = await Swal.fire({
      title: 'Assign Course?',
      html: `Do you want to assign <strong>${courseTitle}</strong> to yourself?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Assign',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4CAF50'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await assignCourseToInstructor(courseId);
        Swal.fire('Success!', 'Course assigned successfully!', 'success');
        await fetchCourses();
        await fetchAvailableCourses();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'Failed to assign course', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle inline edit with instructor dropdown
  const handleInlineEdit = (course) => {
    setEditingCourse({ ...course });
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCourse) return;
    
    setUpdating(true);
    try {
      await updateAdminCourse(editingCourse.id, {
        title: editingCourse.title,
        instructorId: editingCourse.instructorId,
        price: editingCourse.price,
        status: editingCourse.status,
        duration: editingCourse.duration
      });
      
      await fetchCourses();
      setEditingCourse(null);
      Swal.fire({
        title: 'Updated!',
        text: 'Course updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        title: 'Failed!',
        text: error.response?.data?.message || 'Failed to update course',
        icon: 'error'
      });
    } finally {
      setUpdating(false);
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
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            {isInstructor ? '📚 My Courses' : '🌐 All Courses'}
          </h2>
          <p style={{ fontSize: 12, color: colors.textMuted }}>
            {isInstructor 
              ? `You have ${courses.length} courses assigned` 
              : `Total ${courses.length} courses available`
            }
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {selectedCourses.length > 0 && (
            <button
              onClick={handleBulkDelete}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 40,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#b91c1c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#dc2626";
              }}
            >
              🗑️ Delete Selected ({selectedCourses.length})
            </button>
          )}
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
      </div>

      {/* My Courses Table */}
      <div style={{ overflowX: "auto", marginBottom: isInstructor ? 30 : 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, background: colors.bgBase }}>
              <th style={{ padding: "12px", textAlign: "center", width: "40px" }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    accentColor: "#4f46e5",
                  }}
                />
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Course Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Instructor</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Price</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: colors.textMuted }}>
                  {isInstructor ? 'No courses assigned yet.' : 'No courses available.'}
                </td>
              </tr>
            ) : (
              courses.map((c, idx) => {
                const isSelected = selectedCourses.includes(c.id);
                const isEditing = editingCourse?.id === c.id;
                
                return (
                  <tr 
                    key={c.id} 
                    style={{ 
                      borderBottom: `1px solid ${colors.borderLight}`, 
                      background: isSelected ? colors.primarySoft : (idx % 2 === 0 ? colors.surface : colors.bgBase),
                      ...(isSelected && { borderLeft: `3px solid ${colors.primary}` })
                    }}
                  >
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectCourse(c.id)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "#4f46e5",
                        }}
                      />
                    </td>
                    <td style={{ padding: "12px" }}>#{c.id}</td>
                    <td style={{ padding: "12px", fontWeight: 500 }}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingCourse.title}
                          onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "4px 8px",
                            border: `1px solid ${colors.primary}`,
                            borderRadius: 4,
                            fontSize: "13px",
                          }}
                        />
                      ) : (
                        c.title || "Untitled"
                      )}
                    </td>
                    <td style={{ padding: "12px", color: colors.textSecondary }}>
                      {isEditing ? (
                        <select
                          value={editingCourse.instructorId || ''}
                          onChange={(e) => setEditingCourse({ ...editingCourse, instructorId: parseInt(e.target.value) || null })}
                          style={{
                            width: "100%",
                            padding: "4px 8px",
                            border: `1px solid ${colors.primary}`,
                            borderRadius: 4,
                            fontSize: "13px",
                            background: "#fff",
                          }}
                        >
                          <option value="">Select Instructor</option>
                          {instructors.map(instructor => (
                            <option key={instructor.id} value={instructor.id}>
                              {instructor.name || instructor.email || `Instructor #${instructor.id}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        c.instructor || "—"
                      )}
                    </td>
                    <td style={{ padding: "12px", color: colors.teal, fontWeight: 600 }}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editingCourse.price || 0}
                          onChange={(e) => setEditingCourse({ ...editingCourse, price: parseFloat(e.target.value) || 0 })}
                          style={{
                            width: "80px",
                            padding: "4px 8px",
                            border: `1px solid ${colors.primary}`,
                            borderRadius: 4,
                            fontSize: "13px",
                          }}
                        />
                      ) : (
                        `$${c.price || "0"}`
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {isEditing ? (
                        <select
                          value={editingCourse.status || 'PUBLISHED'}
                          onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value })}
                          style={{
                            padding: "4px 8px",
                            border: `1px solid ${colors.primary}`,
                            borderRadius: 4,
                            fontSize: "13px",
                            background: "#fff",
                          }}
                        >
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="DRAFT">DRAFT</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      ) : (
                        <Badge status={c.status || "PUBLISHED"} />
                      )}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            onClick={handleSaveEdit}
                            disabled={updating}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 6,
                              border: "none",
                              background: "#4CAF50",
                              color: "#fff",
                              cursor: updating ? "not-allowed" : "pointer",
                              opacity: updating ? 0.6 : 1,
                              fontSize: "12px",
                            }}
                          >
                            {updating ? 'Saving...' : '💾 Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 6,
                              border: "1px solid #ccc",
                              background: "#f5f5f5",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            ✖ Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleInlineEdit(c)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 6,
                              border: `1px solid ${colors.borderLight}`,
                              background: colors.surface,
                              cursor: "pointer",
                              fontSize: "12px",
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
                              fontSize: "12px",
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Available Courses Section (Only for Instructor) */}
      {isInstructor && (
        <div style={{ marginTop: 30, borderTop: `2px solid ${colors.borderLight}`, paddingTop: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            📋 Available Courses to Assign ({availableCourses.length})
          </h3>
          
          {availableCourses.length === 0 ? (
            <div style={{ 
              padding: 20, 
              background: '#f5f5f5', 
              borderRadius: 8,
              textAlign: 'center',
              color: '#666',
              fontSize: 13
            }}>
              ✅ All courses are assigned to you or other instructors.
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16 
            }}>
              {availableCourses.map(course => (
                <div key={course.id} style={{
                  background: '#fff8e1',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px dashed #ffb300',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    {course.title}
                  </h4>
                  <p style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                    Instructor: {course.instructor || 'Not Assigned'}
                  </p>
                  <p style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                    Price: ${course.price || 0}
                  </p>
                  <p style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 12 }}>
                    Duration: {course.duration || 'N/A'}
                  </p>
                  
                  <button
                    onClick={() => handleAssignCourse(course.id, course.title)}
                    disabled={loading}
                    style={{
                      padding: '6px 16px',
                      background: '#4CAF50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      width: '100%',
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {loading ? 'Assigning...' : '📋 Assign to Me'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}