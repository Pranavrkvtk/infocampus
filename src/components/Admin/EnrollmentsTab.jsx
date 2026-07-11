import React, { useState, useEffect } from "react";
import { colors } from "./AdminStyles";
import Swal from "sweetalert2";
import { getAllEnrollments, deleteEnrollmentById } from "../../api/adminApi";

export default function EnrollmentsTab({ isMobile }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
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
  const [itemsPerPage] = useState(20);

  // Fetch enrollments
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await getAllEnrollments();
      const data = response.data || [];
      
      // ✅ Sort enrollments by enrolledAt (most recent first)
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.enrolledAt ? new Date(a.enrolledAt) : new Date(0);
        const dateB = b.enrolledAt ? new Date(b.enrolledAt) : new Date(0);
        return dateB - dateA; // Descending order (newest first)
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
        text: error.response?.data?.message || "Please try again"
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
          icon: "error"
        });
      }
    }
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const studentName = enrollment.user?.name?.toLowerCase() || "";
    const courseTitle = enrollment.course?.title?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = studentName.includes(searchLower) || 
                         courseTitle.includes(searchLower) ||
                         enrollment.user?.email?.toLowerCase().includes(searchLower);
    
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

  // Handle next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      const tableContainer = document.querySelector('.enrollment-table-container');
      if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Handle previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      const tableContainer = document.querySelector('.enrollment-table-container');
      if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      "ACTIVE": { bg: "#d1fae5", color: "#065f46", text: "Active" },
      "COMPLETED": { bg: "#dbeafe", color: "#1e40af", text: "Completed" },
      "DROPPED": { bg: "#fee2e2", color: "#991b1b", text: "Dropped" },
      "INACTIVE": { bg: "#fef3c7", color: "#92400e", text: "Inactive" }
    };
    return statusMap[status] || statusMap["ACTIVE"];
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: `4px solid ${colors.borderLight}`,
          borderTop: `4px solid ${colors.primary}`,
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
    <div style={{ padding: isMobile ? "0" : "0 20px" }}>
      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{
          background: "var(--surface)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border-light)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
            {stats.total}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Total Enrollments
          </div>
        </div>
        <div style={{
          background: "var(--surface)",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border-light)",
          textAlign: "center"
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
          textAlign: "center"
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
          textAlign: "center"
        }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#991b1b" }}>
            {stats.dropped + stats.inactive}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            ❌ Inactive
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
          minWidth: "200px"
        }}>
          <input
            type="text"
            placeholder="🔍 Search by student or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border-light)",
              fontSize: "14px",
              outline: "none",
              background: "var(--surface)",
              color: "var(--text-primary)"
            }}
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
            cursor: "pointer"
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
            maxWidth: "200px"
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
            background: colors.primary,
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          🔄 Refresh
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
        </div>
      ) : (
        <div 
          className="enrollment-table-container"
          style={{
            background: "var(--surface)",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--border-light)"
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "500px"
            }}>
              <thead>
                <tr style={{
                  background: "var(--bg-base)",
                  borderBottom: "2px solid var(--border-light)"
                }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Student
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Course
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Status
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Enrolled At
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
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

                  // Format enrollment date
                  let enrolledDate = "N/A";
                  if (enrollment.enrolledAt) {
                    try {
                      enrolledDate = new Date(enrollment.enrolledAt).toLocaleDateString();
                    } catch (e) {
                      enrolledDate = "N/A";
                    }
                  }

                  return (
                    <tr
                      key={enrollment.id || index}
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        background: index % 2 === 0 ? "var(--surface)" : "var(--bg-base)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--primary-soft)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? "var(--surface)" : "var(--bg-base)";
                      }}
                    >
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {student.name || "Unknown Student"}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {student.email || "No email"}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                          {course.title || "Unknown Course"}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: statusBadge.bg,
                          color: statusBadge.color
                        }}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle", fontSize: "13px", color: "var(--text-secondary)" }}>
                        {enrolledDate}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                        <button
                          onClick={() => handleDeleteEnrollment(
                            enrollment.id,
                            student.name || "Unknown",
                            course.title || "Unknown Course"
                          )}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#fee2e2",
                            color: "#dc2626",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          🗑️ Remove
                        </button>
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
                padding: "16px 20px",
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

              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: "6px 12px",
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
                  ← Previous
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
                        onClick={() => paginate(pageNum)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-light)",
                          background: currentPage === pageNum ? colors.primary : "var(--surface)",
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
    </div>
  );
}