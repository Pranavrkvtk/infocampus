// src/components/Admin/CoursesTab.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { colors, Badge } from "./AdminStyles";
import { 
  deleteAdminCourse, 
  updateAdminCourse, 
  getAllInstructors 
} from "../../api/adminApi";
import { 
  getAvailableCourses, 
  assignCourseToInstructor,
  updateInstructorCourse,
  deleteInstructorCourse
} from "../../api/instructorApi";

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
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  
  // ✅ Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("ALL");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Fetch available courses for instructor
  useEffect(() => {
    if (isInstructor) {
      fetchAvailableCourses();
    }
  }, [isInstructor]);

  // Fetch instructors for dropdown (only for admin)
  useEffect(() => {
    if (!isInstructor) {
      fetchInstructors();
    }
  }, [isInstructor]);

  // Reset selection when courses change
  useEffect(() => {
    setSelectedCourses([]);
    setSelectAll(false);
    setCurrentPage(1);
  }, [courses]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterInstructor]);

  const fetchAvailableCourses = async () => {
    try {
      const response = await getAvailableCourses();
      setAvailableCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    }
  };

  const fetchInstructors = async () => {
    setLoadingInstructors(true);
    try {
      const response = await getAllInstructors();
      console.log('Full response from getAllInstructors:', response);
      
      let instructorsData = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          instructorsData = response.data;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          instructorsData = response.data.content;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          instructorsData = response.data.data;
        } else if (response.data.instructors && Array.isArray(response.data.instructors)) {
          instructorsData = response.data.instructors;
        }
      } else if (Array.isArray(response)) {
        instructorsData = response;
      } else if (response && response.content && Array.isArray(response.content)) {
        instructorsData = response.content;
      }
      
      const validInstructors = instructorsData.filter(inst => 
        inst && (inst.id || inst._id) && (inst.name || inst.email)
      );
      
      console.log('Valid instructors found:', validInstructors);
      setInstructors(validInstructors);
      
      if (validInstructors.length === 0) {
        console.warn('No valid instructors found in response');
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setInstructors([]);
    } finally {
      setLoadingInstructors(false);
    }
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCourses([]);
    } else {
      const allIds = currentItems.map(c => c.id);
      setSelectedCourses(allIds);
    }
    setSelectAll(!selectAll);
  };

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
      const deletePromises = selectedCourses.map((id) => {
        if (isInstructor) {
          return deleteInstructorCourse(id);
        } else {
          return deleteAdminCourse(id);
        }
      });
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
        if (isInstructor) {
          await deleteInstructorCourse(courseId);
        } else {
          await deleteAdminCourse(courseId);
        }
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

  const handleInlineEdit = (course) => {
    let instructorId = null;
    if (course.instructorId) {
      instructorId = course.instructorId;
    } else if (course.instructor && typeof course.instructor === 'object') {
      instructorId = course.instructor.id;
    } else if (typeof course.instructor === 'string' && !isNaN(course.instructor)) {
      instructorId = parseInt(course.instructor);
    } else if (typeof course.instructor === 'string') {
      const foundInstructor = instructors.find(i => 
        i.name === course.instructor || 
        i.email === course.instructor
      );
      instructorId = foundInstructor?.id || null;
    }
    
    setEditingCourse({ 
      ...course, 
      instructorId: instructorId,
      description: course.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCourse) return;
    
    setUpdating(true);
    try {
      const updateData = {
        title: editingCourse.title,
        description: editingCourse.description || "",
        price: editingCourse.price || 0,
        duration: editingCourse.duration || "",
        level: editingCourse.level || "Beginner",
        videoUrl: editingCourse.videoUrl || "",
        imageUrl: editingCourse.imageUrl || ""
      };

      if (!isInstructor) {
        if (editingCourse.instructorId) {
          updateData.instructor = String(editingCourse.instructorId);
        } else {
          updateData.instructor = null;
        }
      } else {
        updateData.instructor = editingCourse.instructor || String(editingCourse.instructorId) || null;
      }

      console.log('Sending update data:', updateData);
      
      if (isInstructor) {
        await updateInstructorCourse(editingCourse.id, updateData);
      } else {
        await updateAdminCourse(editingCourse.id, updateData);
      }
      
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

  // ✅ Get unique instructors for filter
  const getUniqueInstructors = () => {
    const instructorNames = new Set();
    courses.forEach(course => {
      let name = course.instructor || "Unknown";
      if (typeof course.instructor === 'object' && course.instructor !== null) {
        name = course.instructor.name || course.instructor.email || "Unknown";
      } else if (typeof course.instructor === 'string' && !isNaN(course.instructor)) {
        const found = instructors.find(i => i.id === parseInt(course.instructor));
        name = found ? found.name || found.email : `Instructor #${course.instructor}`;
      }
      instructorNames.add(name);
    });
    return Array.from(instructorNames).sort();
  };

  // ✅ Filter and sort courses
  const filteredAndSortedCourses = [...courses]
    .filter(course => {
      // Filter by search term (course name)
      const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      
      // Filter by instructor
      let instructorName = course.instructor || "Unknown";
      if (typeof course.instructor === 'object' && course.instructor !== null) {
        instructorName = course.instructor.name || course.instructor.email || "Unknown";
      } else if (typeof course.instructor === 'string' && !isNaN(course.instructor)) {
        const found = instructors.find(i => i.id === parseInt(course.instructor));
        instructorName = found ? found.name || found.email : `Instructor #${course.instructor}`;
      }
      
      const matchesInstructor = filterInstructor === "ALL" || instructorName === filterInstructor;
      
      return matchesSearch && matchesInstructor;
    })
    .sort((a, b) => {
      // ✅ Sort by ID descending (newest first)
      return b.id - a.id;
    });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    const tableContainer = document.querySelector('.courses-table-container');
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      const tableContainer = document.querySelector('.courses-table-container');
      if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      const tableContainer = document.querySelector('.courses-table-container');
      if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const uniqueInstructors = getUniqueInstructors();

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
              : `Total ${filteredAndSortedCourses.length} courses available`
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

      {/* ✅ Search and Filter Bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "16px",
        alignItems: "center"
      }}>
        <div style={{
          flex: 1,
          minWidth: "200px"
        }}>
          <input
            type="text"
            placeholder="🔍 Search by course name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 14px",
              borderRadius: "8px",
              border: `1px solid ${colors.borderLight}`,
              fontSize: "13px",
              outline: "none",
              background: "var(--surface)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        <select
          value={filterInstructor}
          onChange={(e) => setFilterInstructor(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: `1px solid ${colors.borderLight}`,
            fontSize: "13px",
            outline: "none",
            background: "var(--surface)",
            color: "var(--text-primary)",
            cursor: "pointer",
            minWidth: "150px"
          }}
        >
          <option value="ALL">👨‍🏫 All Instructors</option>
          {uniqueInstructors.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearchTerm("");
            setFilterInstructor("ALL");
          }}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: `1px solid ${colors.borderLight}`,
            background: "var(--surface)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          ✕ Clear Filters
        </button>
      </div>

      {/* Courses Table */}
      <div 
        className="courses-table-container"
        style={{ overflowX: "auto", marginBottom: isInstructor ? 30 : 0 }}
      >
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
              <th style={{ padding: "12px", textAlign: "left" }}>Description</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Instructor</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Price</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCourses.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: "40px", textAlign: "center", color: colors.textMuted }}>
                  {isInstructor ? 'No courses assigned yet.' : 'No courses available.'}
                </td>
              </tr>
            ) : (
              currentItems.map((c, idx) => {
                const isSelected = selectedCourses.includes(c.id);
                const isEditing = editingCourse?.id === c.id;
                
                let instructorName = c.instructor || "—";
                if (typeof c.instructor === 'object' && c.instructor !== null) {
                  instructorName = c.instructor.name || c.instructor.email || "—";
                } else if (typeof c.instructor === 'string' && !isNaN(c.instructor)) {
                  const foundInstructor = instructors.find(i => i.id === parseInt(c.instructor));
                  instructorName = foundInstructor ? foundInstructor.name || foundInstructor.email : `Instructor #${c.instructor}`;
                }
                
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
                    <td style={{ padding: "12px", maxWidth: "200px" }}>
                      {isEditing ? (
                        <textarea
                          value={editingCourse.description || ''}
                          onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "4px 8px",
                            border: `1px solid ${colors.primary}`,
                            borderRadius: 4,
                            fontSize: "13px",
                            minHeight: "40px",
                            resize: "vertical",
                            fontFamily: "inherit",
                          }}
                          rows={2}
                          placeholder="Enter description"
                        />
                      ) : (
                        <div style={{ 
                          fontSize: "13px", 
                          color: colors.textSecondary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          wordBreak: "break-word"
                        }}>
                          {c.description || "—"}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px", color: colors.textSecondary }}>
                      {isEditing && !isInstructor ? (
                        <select
                          value={editingCourse.instructorId || ''}
                          onChange={(e) => setEditingCourse({ 
                            ...editingCourse, 
                            instructorId: e.target.value ? parseInt(e.target.value) : null 
                          })}
                          style={{
                            width: "100%",
                            padding: "4px 8px",
                            border: `1px solid ${colors.primary}`,
                            borderRadius: 4,
                            fontSize: "13px",
                            background: "#fff",
                          }}
                          disabled={loadingInstructors}
                        >
                          <option value="">Unassigned</option>
                          {loadingInstructors ? (
                            <option value="" disabled>Loading instructors...</option>
                          ) : (
                            instructors.length > 0 ? (
                              instructors.map(instructor => (
                                <option key={instructor.id} value={instructor.id}>
                                  {instructor.name || instructor.email || `Instructor #${instructor.id}`}
                                  {instructor.coursesCount !== undefined && ` (${instructor.coursesCount} courses)`}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>No instructors available</option>
                            )
                          )}
                        </select>
                      ) : (
                        instructorName
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

        {/* Pagination */}
        {filteredAndSortedCourses.length > itemsPerPage && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderTop: `1px solid ${colors.borderLight}`,
              background: colors.bgBase,
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div style={{ fontSize: "13px", color: colors.textMuted }}>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredAndSortedCourses.length)} of{" "}
              {filteredAndSortedCourses.length} courses
            </div>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.borderLight}`,
                  background: currentPage === 1 ? colors.bgBase : colors.surface,
                  color: currentPage === 1 ? colors.textMuted : "var(--text-primary)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  transition: "all 0.2s"
                }}
              >
                ← Previous
              </button>

              <div style={{ display: "flex", gap: "4px" }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.borderLight}`,
                        background: currentPage === pageNum ? colors.primary : colors.surface,
                        color: currentPage === pageNum ? "#fff" : "var(--text-primary)",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: currentPage === pageNum ? 600 : 400,
                        transition: "all 0.2s"
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.borderLight}`,
                  background: currentPage === totalPages ? colors.bgBase : colors.surface,
                  color: currentPage === totalPages ? colors.textMuted : "var(--text-primary)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  transition: "all 0.2s"
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
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