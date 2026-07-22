// src/components/Admin/CoursesTab.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { colors, Badge } from "./AdminStyles";
import { 
  deleteAdminCourse, 
  updateAdminCourse 
} from "../../api/adminApi";
import { 
  deleteInstructorCourse,
  updateInstructorCourse
} from "../../api/instructorApi";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { getImageUrl } from "../../utils/imageUtils";

// ✅ Currency symbol helper
const getCurrencySymbol = (currencyCode) => {
  const currencyMap = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    BRL: 'R$',
    CNY: '¥',
    KRW: '₩'
  };
  return currencyMap[currencyCode] || '$';
};

export default function CoursesTab({
  courses,
  isMobile,
  setSelectedCourse,
  setIsEditCourseModalOpen,
  setIsAddCourseModalOpen,
  fetchCourses,
  isInstructor = false
}) {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // Reset selection when courses change
  useEffect(() => {
    setSelectedCourses([]);
    setSelectAll(false);
    setCurrentPage(1);
  }, [courses]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      confirmButtonColor: '#dc2626',
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
        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({ title: 'Failed!', text: error.response?.data?.message || 'Failed to delete course', icon: 'error' });
      }
    }
  };

  // ✅ Open Edit Modal instead of inline edit
  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEditCourseModalOpen(true);
  };

  // Filter and sort courses
  const filteredAndSortedCourses = [...courses]
    .filter(course => {
      const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      return matchesSearch;
    })
    .sort((a, b) => {
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

  const getStatusBadge = (status) => {
    const statusMap = {
      PUBLISHED: { bg: "#d1fae5", color: "#065f46", text: "Published", dot: "#065f46" },
      DRAFT: { bg: "#fef3c7", color: "#92400e", text: "Draft", dot: "#92400e" },
      ARCHIVED: { bg: "#fee2e2", color: "#991b1b", text: "Archived", dot: "#991b1b" }
    };
    return statusMap[status] || statusMap["DRAFT"];
  };

  const getLevelBadge = (level) => {
    const levelMap = {
      Beginner: { bg: "#dbeafe", color: "#1e40af", text: "Beginner" },
      Intermediate: { bg: "#fef3c7", color: "#92400e", text: "Intermediate" },
      Advanced: { bg: "#fce4ec", color: "#991b1b", text: "Advanced" },
      "All Levels": { bg: "#ede9fe", color: "#5b21b6", text: "All Levels" }
    };
    return levelMap[level] || levelMap["Beginner"];
  };

  // Stats
  const stats = {
    total: filteredAndSortedCourses.length,
    published: filteredAndSortedCourses.filter(c => c.status === "PUBLISHED").length,
    draft: filteredAndSortedCourses.filter(c => c.status === "DRAFT").length,
    archived: filteredAndSortedCourses.filter(c => c.status === "ARCHIVED").length
  };

  return (
    <div style={{ padding: isMobile ? "0" : "0 4px" }}>
      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "24px"
      }}>
        <div style={{
          background: "var(--surface)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border-light)",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
            {stats.total}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            📚 Total Courses
          </div>
        </div>
        <div style={{
          background: "var(--surface)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border-light)",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#065f46" }}>
            {stats.published}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            ✅ Published
          </div>
        </div>
        <div style={{
          background: "var(--surface)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border-light)",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#92400e" }}>
            {stats.draft}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            📝 Draft
          </div>
        </div>
        <div style={{
          background: "var(--surface)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border-light)",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#991b1b" }}>
            {stats.archived}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            📦 Archived
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "20px",
        alignItems: "center"
      }}>
        <div style={{
          flex: 1,
          minWidth: "200px",
          position: "relative"
        }}>
          <SearchOutlinedIcon style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-secondary)",
            fontSize: "18px"
          }} />
          <input
            type="text"
            placeholder="Search courses by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px 10px 40px",
              borderRadius: "10px",
              border: "1px solid var(--border-light)",
              fontSize: "14px",
              outline: "none",
              background: "var(--surface)",
              color: "var(--text-primary)",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
          />
        </div>

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border-light)",
              background: "var(--surface)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-base)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface)"}
          >
            ✕ Clear
          </button>
        )}

        {selectedCourses.length > 0 && (
          <button
            onClick={handleBulkDelete}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: "#dc2626",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b91c1c";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <DeleteOutlinedIcon style={{ fontSize: "18px" }} />
            Delete ({selectedCourses.length})
          </button>
        )}

        <button
          onClick={() => setIsAddCourseModalOpen(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: colors.primary || "#4f46e5",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s",
            fontSize: "14px",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          <AddOutlinedIcon style={{ fontSize: "18px" }} />
          New Course
        </button>
      </div>

      {/* Courses Table */}
      <div 
        className="courses-table-container"
        style={{
          background: "var(--surface)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid var(--border-light)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse", 
            minWidth: "800px",
            fontSize: "14px"
          }}>
            <thead>
              <tr style={{ 
                background: "var(--bg-base)", 
                borderBottom: "2px solid var(--border-light)" 
              }}>
                <th style={{ 
                  padding: "14px 16px", 
                  textAlign: "center", 
                  fontSize: "12px", 
                  fontWeight: 600, 
                  color: "var(--text-secondary)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px",
                  width: "40px"
                }}>
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
                <th style={{ 
                  padding: "14px 16px", 
                  textAlign: "left", 
                  fontSize: "12px", 
                  fontWeight: 600, 
                  color: "var(--text-secondary)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px" 
                }}>
                  Course
                </th>
                <th style={{ 
                  padding: "14px 16px", 
                  textAlign: "left", 
                  fontSize: "12px", 
                  fontWeight: 600, 
                  color: "var(--text-secondary)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px" 
                }}>
                  <AccessTimeOutlinedIcon style={{ fontSize: "14px", verticalAlign: "middle" }} /> Duration
                </th>
                <th style={{ 
                  padding: "14px 16px", 
                  textAlign: "center", 
                  fontSize: "12px", 
                  fontWeight: 600, 
                  color: "var(--text-secondary)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px" 
                }}>
                  Level
                </th>
                <th style={{ 
                  padding: "14px 16px", 
                  textAlign: "center", 
                  fontSize: "12px", 
                  fontWeight: 600, 
                  color: "var(--text-secondary)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px" 
                }}>
                  <AttachMoneyOutlinedIcon style={{ fontSize: "14px", verticalAlign: "middle" }} /> Price
                </th>
                <th style={{ 
                  padding: "14px 16px", 
                  textAlign: "center", 
                  fontSize: "12px", 
                  fontWeight: 600, 
                  color: "var(--text-secondary)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px" 
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: "14px 16px", 
                  textAlign: "center", 
                  fontSize: "12px", 
                  fontWeight: 600, 
                  color: "var(--text-secondary)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.5px" 
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCourses.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ 
                    padding: "60px 20px", 
                    textAlign: "center", 
                    color: "var(--text-secondary)" 
                  }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
                    <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
                      {isInstructor ? 'No Courses Assigned' : 'No Courses Found'}
                    </h3>
                    <p>
                      {isInstructor 
                        ? 'You have not been assigned any courses yet.' 
                        : searchTerm ? 'Try adjusting your search' : 'Click "New Course" to create one'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                currentItems.map((course, index) => {
                  const isSelected = selectedCourses.includes(course.id);
                  const statusBadge = getStatusBadge(course.status || 'PUBLISHED');
                  const levelBadge = getLevelBadge(course.level || 'Beginner');

                  return (
                    <tr 
                      key={course.id} 
                      style={{ 
                        borderBottom: "1px solid var(--border-light)",
                        background: isSelected ? colors.primarySoft : (index % 2 === 0 ? "var(--surface)" : "var(--bg-base)"),
                        transition: "background 0.2s",
                        ...(isSelected && { borderLeft: `3px solid ${colors.primary}` })
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--primary-soft)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = index % 2 === 0 ? "var(--surface)" : "var(--bg-base)";
                        }
                      }}
                    >
                      <td style={{ 
                        padding: "12px 16px", 
                        textAlign: "center", 
                        verticalAlign: "middle" 
                      }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectCourse(course.id)}
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                            accentColor: "#4f46e5",
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {course.imageUrl ? (
                            <img 
                              src={getImageUrl(course.imageUrl)} 
                              alt={course.title}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                objectFit: "cover",
                                border: "1px solid var(--border-light)",
                                flexShrink: 0
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              background: colors.primarySoft || "#eef2ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: colors.primary || "#4f46e5",
                              flexShrink: 0
                            }}>
                              <SchoolOutlinedIcon style={{ fontSize: "20px" }} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                              {course.title || "Untitled"}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                              ID: #{course.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                          {course.duration || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: levelBadge.bg,
                          color: levelBadge.color
                        }}>
                          {levelBadge.text}
                        </span>
                      </td>
                      <td style={{ 
                        padding: "12px 16px", 
                        textAlign: "center", 
                        verticalAlign: "middle",
                        fontWeight: 700,
                        color: colors.teal || "#14b8a6"
                      }}>
                        {`${getCurrencySymbol(course.currency || 'USD')}${course.price || "0"}`}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: statusBadge.bg,
                          color: statusBadge.color
                        }}>
                          <span style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: statusBadge.dot,
                            display: "inline-block"
                          }} />
                          {statusBadge.text}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleEditCourse(course)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              border: "none",
                              background: "var(--primary-soft)",
                              color: "var(--primary)",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                          >
                            <EditOutlinedIcon style={{ fontSize: "16px" }} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              border: "none",
                              background: "#fee2e2",
                              color: "#dc2626",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                          >
                            <DeleteOutlinedIcon style={{ fontSize: "16px" }} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAndSortedCourses.length > itemsPerPage && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              borderTop: "1px solid var(--border-light)",
              background: "var(--bg-base)",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredAndSortedCourses.length)} of{" "}
              {filteredAndSortedCourses.length} courses
            </div>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                    const tableContainer = document.querySelector('.courses-table-container');
                    if (tableContainer) {
                      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-light)",
                  background: currentPage === 1 ? "var(--bg-base)" : "var(--surface)",
                  color: currentPage === 1 ? "var(--text-secondary)" : "var(--text-primary)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  transition: "all 0.2s"
                }}
              >
                ← Prev
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
                        border: "1px solid var(--border-light)",
                        background: currentPage === pageNum ? (colors.primary || "#4f46e5") : "var(--surface)",
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
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                    const tableContainer = document.querySelector('.courses-table-container');
                    if (tableContainer) {
                      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-light)",
                  background: currentPage === totalPages ? "var(--bg-base)" : "var(--surface)",
                  color: currentPage === totalPages ? "var(--text-secondary)" : "var(--text-primary)",
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
    </div>
  );
}