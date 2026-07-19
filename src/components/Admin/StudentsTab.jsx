// src/components/Admin/StudentsTab.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { colors } from "./AdminStyles";
import Swal from "sweetalert2";
import { searchUsersByPhone, getAllUsers } from "../../api/adminApi";

export default function StudentsTab({
  students = [],
  searchTerm,
  handleSearchChange,
  handleToggleStatus,
  handleDeleteStudent,
  isMobile,
}) {
  const protectedEmails = ["admin@gmail.com"];

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Phone search state
  const [phoneSearch, setPhoneSearch] = useState("");
  const [phoneSearchResults, setPhoneSearchResults] = useState([]);
  const [isPhoneSearching, setIsPhoneSearching] = useState(false);
  const [showPhoneResults, setShowPhoneResults] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // --- Debounced search ---
  const [localSearch, setLocalSearch] = useState(searchTerm || "");
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchTerm || "");
  }, [searchTerm]);

  const onSearchInput = (e) => {
    const value = e.target.value;
    setLocalSearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearchChange({ target: { value } });
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ─── Phone Search Handler ────────────────────────────────────────────
  const handlePhoneSearch = async () => {
    if (!phoneSearch.trim()) {
      setShowPhoneResults(false);
      setPhoneSearchResults([]);
      return;
    }

    setIsPhoneSearching(true);
    try {
      const response = await searchUsersByPhone(phoneSearch);
      console.log('📱 Phone search response:', response);
      
      // ✅ Handle different response formats
      let users = [];
      if (response.data && response.data.success) {
        users = response.data.users || [];
      } else if (response.data && Array.isArray(response.data)) {
        users = response.data;
      } else if (Array.isArray(response)) {
        users = response;
      }
      
      setPhoneSearchResults(users);
      setShowPhoneResults(true);
      console.log(`📱 Found ${users.length} users with phone: ${phoneSearch}`);
    } catch (error) {
      console.error("Error searching by phone:", error);
      Swal.fire({
        title: "Search Failed",
        text: error?.response?.data?.error || "Failed to search users by phone",
        icon: "error",
      });
    } finally {
      setIsPhoneSearching(false);
    }
  };

  // Clear phone search results
  const clearPhoneSearch = () => {
    setPhoneSearch("");
    setPhoneSearchResults([]);
    setShowPhoneResults(false);
  };

  // ─── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const studentsArray = Array.isArray(students) ? students : [];
    const total = studentsArray.length;
    const active = studentsArray.filter((s) => (s.status || "ACTIVE") === "ACTIVE").length;
    const inactive = studentsArray.filter((s) => s.status === "INACTIVE").length;
    const withPhone = studentsArray.filter((s) => s.phone && s.phone && s.phone.length > 0).length;
    return { total, active, inactive, withPhone };
  }, [students]);

  // ─── Filtered list ─────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    const studentsArray = Array.isArray(students) ? students : [];
    
    // If phone search is active, show phone search results
    if (showPhoneResults && phoneSearchResults.length > 0) {
      return phoneSearchResults;
    }
    
    // Otherwise filter by status only
    return studentsArray.filter((s) => {
      const status = s.status || "ACTIVE";
      const matchesStatus = filterStatus === "ALL" || status === filterStatus;
      return matchesStatus;
    });
  }, [students, filterStatus, phoneSearchResults, showPhoneResults]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm, phoneSearchResults]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedStudents([]);
    setSelectAll(false);
  }, [filterStatus, searchTerm, phoneSearchResults]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Handle page change
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      const tableContainer = document.querySelector('.table-container');
      if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Handle previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      const tableContainer = document.querySelector('.table-container');
      if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { bg: "#d1fae5", color: "#065f46", text: "🟢 Active" },
      INACTIVE: { bg: "#fee2e2", color: "#991b1b", text: "🔴 Inactive" },
    };
    return statusMap[status] || statusMap["ACTIVE"];
  };

  // Check if student can be selected (not protected admin)
  const isSelectable = (student) => {
    return !(student.role === "ADMIN" && protectedEmails.includes(student.email));
  };

  // Handle individual student selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle select all on current page
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      const selectableIds = currentItems
        .filter((s) => isSelectable(s))
        .map((s) => s.id);
      setSelectedStudents(selectableIds);
    }
    setSelectAll(!selectAll);
  };

  // Bulk delete selected students
  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      Swal.fire("No Selection", "Please select at least one student to delete.", "info");
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${selectedStudents.length} Students?`,
      html: `
        <p>Permanently remove <strong>${selectedStudents.length}</strong> students?</p>
        <p style="color: #991b1b; font-size: 13px; margin-top: 8px;">
          ⚠️ This will permanently delete all selected student accounts and their associated data.
          <br>This action <strong>cannot</strong> be undone!
        </p>
        <ul style="text-align: left; max-height: 150px; overflow-y: auto; font-size: 13px; margin-top: 10px;">
          ${selectedStudents.map(id => {
            const student = students.find(s => s.id === id);
            return `<li>${student?.name || 'Unknown'} (${student?.email || 'No email'})</li>`;
          }).join('')}
        </ul>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, Delete ${selectedStudents.length} Students`,
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
      const deletePromises = selectedStudents.map((id) => handleDeleteStudent(id));
      await Promise.all(deletePromises);

      setSelectedStudents([]);
      setSelectAll(false);

      Swal.fire({
        title: "Deleted!",
        text: `${selectedStudents.length} students have been permanently removed.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Failed!",
        text: error?.response?.data?.message || "Failed to delete some students",
        icon: "error",
      });
    }
  };

  // Permanently delete a single student
  const confirmDelete = async (student) => {
    const result = await Swal.fire({
      title: "Delete Student?",
      html: `
        <p>Permanently remove <strong>${student.name}</strong> (${student.email})?</p>
        <p style="color: #991b1b; font-size: 13px; margin-top: 8px;">
          ⚠️ This will permanently delete the student account and all associated data.
          <br>This action <strong>cannot</strong> be undone!
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete Permanently",
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
      await handleDeleteStudent(student.id);
      Swal.fire({
        title: "Deleted!",
        text: `${student.name} has been permanently removed.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Failed!",
        text: error?.response?.data?.message || "Failed to delete student",
        icon: "error",
      });
    }
  };

  return (
    <div style={{ padding: isMobile ? "0" : "0 20px" }}>
      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={statCardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
            {stats.total}
          </div>
          <div style={statLabelStyle}>Total Students</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#065f46" }}>
            {stats.active}
          </div>
          <div style={statLabelStyle}>🟢 Active</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#991b1b" }}>
            {stats.inactive}
          </div>
          <div style={statLabelStyle}>🔴 Inactive</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#7c3aed" }}>
            {stats.withPhone}
          </div>
          <div style={statLabelStyle}>📱 With Phone</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <input
            type="text"
            placeholder="🔍 Search users by name..."
            value={localSearch}
            onChange={onSearchInput}
            style={inputStyle}
          />
        </div>

        {/* ✅ Phone Search Input */}
        <div style={{ display: "flex", gap: "8px", minWidth: "200px" }}>
          <input
            type="text"
            placeholder="📱 Search by phone..."
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handlePhoneSearch()}
            style={{
              ...inputStyle,
              minWidth: "150px",
              fontFamily: "monospace",
            }}
          />
          <button
            onClick={handlePhoneSearch}
            disabled={isPhoneSearching || !phoneSearch.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "none",
              background: phoneSearch.trim() ? colors.primary : "#e2e8f0",
              color: phoneSearch.trim() ? "#fff" : "#94a3b8",
              fontWeight: 600,
              fontSize: "13px",
              cursor: phoneSearch.trim() ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            {isPhoneSearching ? "⏳" : "🔍"}
          </button>
          {showPhoneResults && (
            <button
              onClick={clearPhoneSearch}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "none",
                background: "#fee2e2",
                color: "#dc2626",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="ALL">📊 All Status</option>
          <option value="ACTIVE">🟢 Active</option>
          <option value="INACTIVE">🔴 Inactive</option>
        </select>

        {/* Bulk Delete Button */}
        {selectedStudents.length > 0 && (
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
              gap: "8px",
              transition: "all 0.2s ease",
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
            🗑️ Delete Selected ({selectedStudents.length})
          </button>
        )}
      </div>

      {/* Phone Search Results Info */}
      {showPhoneResults && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: "16px",
            background: "#ede9fe",
            borderRadius: "10px",
            border: "1px solid #c4b5fd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span style={{ color: "#5b21b6", fontSize: "14px", fontWeight: 500 }}>
            📱 Phone Search Results: Found {phoneSearchResults.length} user{phoneSearchResults.length !== 1 ? 's' : ''}
          </span>
          <span style={{ color: "#7c3aed", fontSize: "12px" }}>
            Search term: <strong>{phoneSearch}</strong>
          </span>
        </div>
      )}

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--surface)",
            borderRadius: "16px",
            border: "1px solid var(--border-light)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
            {showPhoneResults ? "No Users Found" : "No Students Found"}
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            {showPhoneResults
              ? `No users found with phone number: ${phoneSearch}`
              : localSearch || filterStatus !== "ALL"
                ? "Try adjusting your filters"
                : "No students have registered yet"}
          </p>
        </div>
      ) : (
        <div
          className="table-container"
          style={{
            background: "var(--surface)",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--border-light)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
              <thead>
                <tr
                  style={{
                    background: "var(--bg-base)",
                    borderBottom: "2px solid var(--border-light)",
                  }}
                >
                  <th style={{ ...thStyle, textAlign: "center", width: "40px" }}>
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
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Email</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>📱 Phone</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map((student, index) => {
                  const isProtectedAdmin =
                    student.role === "ADMIN" && protectedEmails.includes(student.email);
                  const status = student.status || "ACTIVE";
                  const statusBadge = getStatusBadge(status);
                  const selectable = isSelectable(student);
                  const isSelected = selectedStudents.includes(student.id);

                  return (
                    <tr
                      key={student.id}
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        background: index % 2 === 0 ? "var(--surface)" : "var(--bg-base)",
                        opacity: status === "INACTIVE" ? 0.7 : 1,
                        ...(isSelected && { background: colors.primarySoft }),
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "var(--primary-soft)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background =
                            index % 2 === 0 ? "var(--surface)" : "var(--bg-base)";
                        }
                      }}
                    >
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectStudent(student.id)}
                          disabled={!selectable}
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: selectable ? "pointer" : "not-allowed",
                            accentColor: "#4f46e5",
                            opacity: selectable ? 1 : 0.4,
                          }}
                        />
                      </td>

                      <td style={tdStyle}>#{student.id}</td>

                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: status === "ACTIVE" ? colors.primarySoft : colors.coralSoft,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              color: status === "ACTIVE" ? colors.primary : colors.coral,
                              flexShrink: 0,
                            }}
                          >
                            {student.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>

                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                {student.name || 'Unknown'}
                              </span>
                              {isProtectedAdmin && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    padding: "2px 6px",
                                    borderRadius: 20,
                                    background: colors.coralSoft,
                                    color: colors.coral,
                                  }}
                                >
                                  🔒 Protected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ ...tdStyle, color: "var(--text-secondary)" }}>
                        {student.email || '-'}
                      </td>

                      {/* Phone column */}
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {student.phone ? (
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 500,
                              background: "#ede9fe",
                              color: "#5b21b6",
                              fontFamily: "monospace",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {student.phone}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                            —
                          </span>
                        )}
                      </td>

                      {/* Status column */}
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: statusBadge.bg,
                            color: statusBadge.color,
                          }}
                        >
                          {statusBadge.text}
                        </span>
                      </td>

                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                          <button
                            onClick={() => handleToggleStatus(student.id, student.status)}
                            disabled={isProtectedAdmin}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: isProtectedAdmin ? "not-allowed" : "pointer",
                              background: status === "ACTIVE" ? "#fee2e2" : "#d1fae5",
                              color: status === "ACTIVE" ? "#dc2626" : "#065f46",
                              opacity: isProtectedAdmin ? 0.6 : 1,
                            }}
                          >
                            {status === "ACTIVE" ? "🔴 Deactivate" : "🟢 Activate"}
                          </button>

                          <button
                            onClick={() => confirmDelete(student)}
                            disabled={isProtectedAdmin}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: isProtectedAdmin ? "not-allowed" : "pointer",
                              background: "#fee2e2",
                              color: "#dc2626",
                              opacity: isProtectedAdmin ? 0.6 : 1,
                            }}
                          >
                            🗑️ Delete
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
                padding: "16px 20px",
                borderTop: "1px solid var(--border-light)",
                background: "var(--bg-base)",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredStudents.length)} of{" "}
                {filteredStudents.length} students
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
                          border: "1px solid var(--border-light)",
                          background: currentPage === pageNum ? colors.primary : "var(--surface)",
                          color: currentPage === pageNum ? "#fff" : "var(--text-primary)",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: currentPage === pageNum ? 600 : 400,
                          transition: "all 0.2s",
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

const statCardStyle = {
  background: "var(--surface)",
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid var(--border-light)",
  textAlign: "center",
};

const statLabelStyle = {
  fontSize: "13px",
  color: "var(--text-secondary)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 16px",
  borderRadius: "10px",
  border: "1px solid var(--border-light)",
  fontSize: "14px",
  outline: "none",
  background: "var(--surface)",
  color: "var(--text-primary)",
};

const selectStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "1px solid var(--border-light)",
  fontSize: "14px",
  outline: "none",
  background: "var(--surface)",
  color: "var(--text-primary)",
  cursor: "pointer",
};

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--text-secondary)",
};

const tdStyle = {
  padding: "12px 16px",
  verticalAlign: "middle",
  fontSize: "13px",
};