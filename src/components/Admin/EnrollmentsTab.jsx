// src/components/Admin/EnrollmentsTab.jsx
import React, { useState, useEffect } from "react";
import { colors } from "./AdminStyles";
import Swal from "sweetalert2";
import { 
  getAllEnrollments, 
  deleteEnrollmentById,
  getEnrollmentById 
} from "../../api/adminApi";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

export default function EnrollmentsTab({ isMobile }) {
  // State
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    dropped: 0,
    inactive: 0
  });
  const [courses, setCourses] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  // Fetch enrollments
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await getAllEnrollments();
      const data = response?.data || response || [];
      
      // Sort by enrolledAt (most recent first)
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.enrolledAt ? new Date(a.enrolledAt) : new Date(0);
        const dateB = b.enrolledAt ? new Date(b.enrolledAt) : new Date(0);
        return dateB - dateA;
      });
      
      setEnrollments(sortedData);
      
      // Extract unique courses for filter
      const uniqueCourses = [...new Set(data.map(e => e.course?.title).filter(Boolean))];
      setCourses(uniqueCourses);
      
      // Calculate stats
      const active = data.filter(e => e.status === "ACTIVE").length;
      const completed = data.filter(e => e.status === "COMPLETED").length;
      const dropped = data.filter(e => e.status === "DROPPED").length;
      const inactive = data.filter(e => e.status === "INACTIVE").length;
      
      setStats({
        total: data.length,
        active,
        completed,
        dropped,
        inactive
      });
      
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to load enrollments",
        text: error.response?.data?.message || "Please try again",
        confirmButtonColor: colors.primary
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, selectedCourse]);

  // Handle delete enrollment
  const handleDeleteEnrollment = async (enrollmentId, studentName, courseTitle) => {
    const result = await Swal.fire({
      title: "Delete Enrollment?",
      html: `
        <p>Remove <strong>${studentName}</strong> from <strong>${courseTitle}</strong>?</p>
        <p style="color: #991b1b; font-size: 13px; margin-top: 8px;">
          ⚠️ This will permanently remove the enrollment record.
          <br>This action <strong>cannot</strong> be undone!
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Removing...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        await deleteEnrollmentById(enrollmentId);
        await fetchEnrollments();
        Swal.fire({
          title: "Removed!",
          text: `${studentName} has been removed from ${courseTitle}`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: "Failed!",
          text: error.response?.data?.message || "Failed to remove enrollment",
          icon: "error",
          confirmButtonColor: colors.primary
        });
      }
    }
  };

  // View enrollment details
  const handleViewDetails = async (id) => {
    try {
      Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      
      const response = await getEnrollmentById(id);
      const data = response?.data || response;
      setSelectedEnrollment(data);
      setShowDetailModal(true);
      
      Swal.close();
    } catch (error) {
      console.error('Error fetching enrollment details:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load enrollment details',
        confirmButtonText: 'OK',
        confirmButtonColor: colors.primary
      });
    }
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const studentName = enrollment.user?.name?.toLowerCase() || "";
    const courseTitle = enrollment.course?.title?.toLowerCase() || "";
    const studentEmail = enrollment.user?.email?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = studentName.includes(searchLower) || 
                         courseTitle.includes(searchLower) ||
                         studentEmail.includes(searchLower);
    
    const matchesStatus = filterStatus === "ALL" || enrollment.status === filterStatus;
    
    const matchesCourse = selectedCourse === "ALL" || enrollment.course?.title === selectedCourse;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

  // Handle page change
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    const tableContainer = document.querySelector('.enrollment-table-container');
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      "ACTIVE": { 
        bg: "#d1fae5", 
        color: "#065f46", 
        text: "Active", 
        dot: "#065f46",
        icon: <CheckCircleOutlinedIcon style={{ fontSize: "14px" }} />
      },
      "COMPLETED": { 
        bg: "#dbeafe", 
        color: "#1e40af", 
        text: "Completed", 
        dot: "#1e40af",
        icon: <CheckCircleOutlinedIcon style={{ fontSize: "14px" }} />
      },
      "DROPPED": { 
        bg: "#fee2e2", 
        color: "#991b1b", 
        text: "Dropped", 
        dot: "#991b1b",
        icon: <CancelOutlinedIcon style={{ fontSize: "14px" }} />
      },
      "INACTIVE": { 
        bg: "#fef3c7", 
        color: "#92400e", 
        text: "Inactive", 
        dot: "#92400e",
        icon: <AccessTimeOutlinedIcon style={{ fontSize: "14px" }} />
      }
    };
    return statusMap[status] || statusMap["ACTIVE"];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "N/A";
    }
  };

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "N/A";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ 
          width: "48px", 
          height: "48px", 
          border: `4px solid ${colors.borderLight || '#e5e7eb'}`,
          borderTop: `4px solid ${colors.primary || '#4f46e5'}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto"
        }} />
        <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
          Loading enrollments...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "0" : "0 4px" }}>
      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)",
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
            📊 Total
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
            {stats.active}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            🟢 Active
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
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e40af" }}>
            {stats.completed}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            ✅ Completed
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
            {stats.inactive}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            ⚪ Inactive
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
            {stats.dropped}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            ❌ Dropped
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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
            placeholder="Search by student or course..."
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

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            fontSize: "14px",
            outline: "none",
            background: "var(--surface)",
            color: "var(--text-primary)",
            cursor: "pointer",
            minWidth: "140px"
          }}
        >
          <option value="ALL">📊 All Status</option>
          <option value="ACTIVE">🟢 Active</option>
          <option value="COMPLETED">✅ Completed</option>
          <option value="DROPPED">❌ Dropped</option>
          <option value="INACTIVE">⚪ Inactive</option>
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            fontSize: "14px",
            outline: "none",
            background: "var(--surface)",
            color: "var(--text-primary)",
            cursor: "pointer",
            maxWidth: "200px",
            minWidth: "140px"
          }}
        >
          <option value="ALL">📚 All Courses</option>
          {courses.map((course, index) => (
            <option key={index} value={course}>{course}</option>
          ))}
        </select>

        <button
          onClick={fetchEnrollments}
          style={{
            padding: "10px 16px",
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
          <RefreshOutlinedIcon style={{ fontSize: "18px" }} />
          Refresh
        </button>
      </div>

      {/* Enrollments Table */}
      {filteredEnrollments.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "var(--surface)",
          borderRadius: "16px",
          border: "1px solid var(--border-light)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
            No Enrollments Found
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            {searchTerm || filterStatus !== "ALL" || selectedCourse !== "ALL" 
              ? "Try adjusting your filters" 
              : "No students are enrolled in any courses yet"}
          </p>
          {(searchTerm || filterStatus !== "ALL" || selectedCourse !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("ALL");
                setSelectedCourse("ALL");
              }}
              style={{
                marginTop: "12px",
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: colors.primary || "#4f46e5",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div 
          className="enrollment-table-container"
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
              minWidth: "700px",
              fontSize: "14px"
            }}>
              <thead>
                <tr style={{
                  background: "var(--bg-base)",
                  borderBottom: "2px solid var(--border-light)"
                }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Student
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Course
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Status
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Enrolled
                  </th>
                  <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((enrollment, index) => {
                  const student = enrollment.user || {};
                  const course = enrollment.course || {};
                  const status = enrollment.status || "ACTIVE";
                  const statusBadge = getStatusBadge(status);

                  return (
                    <tr
                      key={enrollment.id || index}
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        background: index % 2 === 0 ? "var(--surface)" : "var(--bg-base)",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--primary-soft)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? "var(--surface)" : "var(--bg-base)";
                      }}
                    >
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: colors.primarySoft || "#eef2ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colors.primary || "#4f46e5",
                            flexShrink: 0
                          }}>
                            <PersonOutlinedIcon style={{ fontSize: "18px" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                              {student.name || "Unknown Student"}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                              {student.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <SchoolOutlinedIcon style={{ 
                            fontSize: "16px", 
                            color: "var(--text-secondary)" 
                          }} />
                          <div>
                            <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                              {course.title || "Unknown Course"}
                            </div>
                            {course.code && (
                              <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                                {course.code}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: statusBadge.bg,
                          color: statusBadge.color
                        }}>
                          {statusBadge.icon}
                          {statusBadge.text}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle", fontSize: "13px", color: "var(--text-secondary)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          <CalendarTodayOutlinedIcon style={{ fontSize: "14px" }} />
                          {formatDate(enrollment.enrolledAt)}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                          <button
                            onClick={() => handleViewDetails(enrollment.id)}
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              border: "none",
                              background: "#dbeafe",
                              color: "#2563eb",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "34px",
                              height: "34px",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            title="View details"
                          >
                            <VisibilityOutlinedIcon style={{ fontSize: "18px" }} />
                          </button>
                          <button
                            onClick={() => handleDeleteEnrollment(
                              enrollment.id,
                              student.name || "Unknown",
                              course.title || "Unknown Course"
                            )}
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              border: "none",
                              background: "#fee2e2",
                              color: "#dc2626",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "34px",
                              height: "34px",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            title="Delete enrollment"
                          >
                            <DeleteOutlinedIcon style={{ fontSize: "18px" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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
                {Math.min(indexOfLastItem, filteredEnrollments.length)} of{" "}
                {filteredEnrollments.length} enrollments
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      const tableContainer = document.querySelector('.enrollment-table-container');
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

                {/* Page numbers */}
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
                        onClick={() => {
                          setCurrentPage(pageNum);
                          const tableContainer = document.querySelector('.enrollment-table-container');
                          if (tableContainer) {
                            tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
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
                      const tableContainer = document.querySelector('.enrollment-table-container');
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
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEnrollment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowDetailModal(false)}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '550px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.3s ease'
          }} onClick={(e) => e.stopPropagation()}>
            <style>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateY(-20px) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Enrollment Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '4px'
                }}
              >
                <CloseOutlinedIcon />
              </button>
            </div>

            {/* Student Info */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: colors.primarySoft || '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.primary || '#4f46e5',
                  flexShrink: 0
                }}>
                  <PersonOutlinedIcon style={{ fontSize: '24px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                    {selectedEnrollment.user?.name || 'N/A'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {selectedEnrollment.user?.email || 'No email'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              {/* Course */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '14px' }}>
                  <SchoolOutlinedIcon style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }} />
                  Course:
                </span>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                  {selectedEnrollment.course?.title || 'N/A'}
                </span>
              </div>

              {/* Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '14px' }}>Status:</span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  background: getStatusBadge(selectedEnrollment.status).bg,
                  color: getStatusBadge(selectedEnrollment.status).color,
                  fontSize: '13px',
                  fontWeight: 600,
                  width: 'fit-content'
                }}>
                  {getStatusBadge(selectedEnrollment.status).icon}
                  {getStatusBadge(selectedEnrollment.status).text}
                </span>
              </div>

              {/* Enrolled At */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '14px' }}>
                  <CalendarTodayOutlinedIcon style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }} />
                  Enrolled:
                </span>
                <span style={{ color: '#0f172a', fontSize: '14px' }}>
                  {formatDateTime(selectedEnrollment.enrolledAt)}
                </span>
              </div>

              {/* Notes (if available) */}
              {selectedEnrollment.notes && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '120px 1fr', 
                  gap: '8px', 
                  alignItems: 'flex-start',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '14px',
                  marginTop: '4px'
                }}>
                  <span style={{ color: '#64748b', fontWeight: 500, fontSize: '14px' }}>Notes:</span>
                  <span style={{ 
                    color: '#0f172a', 
                    fontSize: '14px', 
                    whiteSpace: 'pre-wrap',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {selectedEnrollment.notes || 'No notes available'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ 
              marginTop: '24px', 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'flex-end', 
              borderTop: '1px solid #e5e7eb', 
              paddingTop: '20px' 
            }}>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleDeleteEnrollment(
                    selectedEnrollment.id,
                    selectedEnrollment.user?.name || 'Unknown',
                    selectedEnrollment.course?.title || 'Unknown Course'
                  );
                }}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <DeleteOutlinedIcon style={{ fontSize: '18px' }} />
                Delete
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}