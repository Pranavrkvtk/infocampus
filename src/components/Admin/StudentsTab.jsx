// src/components/Admin/StudentsTab.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { colors } from "./AdminStyles";
import Swal from "sweetalert2";
import { searchUsersByPhone, searchUsersByEmail } from "../../api/adminApi";
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

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
  
  // Email search state
  const [emailSearch, setEmailSearch] = useState("");
  const [emailSearchResults, setEmailSearchResults] = useState([]);
  const [isEmailSearching, setIsEmailSearching] = useState(false);
  const [showEmailResults, setShowEmailResults] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

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

  // ─── Email Search Handler ────────────────────────────────────────────
  const handleEmailSearch = async () => {
    if (!emailSearch.trim()) {
      setShowEmailResults(false);
      setEmailSearchResults([]);
      return;
    }

    setIsEmailSearching(true);
    try {
      const response = await searchUsersByEmail(emailSearch);
      console.log('📧 Email search response:', response);
      
      let users = [];
      if (response.data && response.data.success) {
        users = response.data.users || [];
      } else if (response.data && Array.isArray(response.data)) {
        users = response.data;
      } else if (Array.isArray(response)) {
        users = response;
      }
      
      setEmailSearchResults(users);
      setShowEmailResults(true);
    } catch (error) {
      console.error("Error searching by email:", error);
      Swal.fire({
        title: "Search Failed",
        text: error?.response?.data?.error || "Failed to search users by email",
        icon: "error",
      });
    } finally {
      setIsEmailSearching(false);
    }
  };

  // Clear email search results
  const clearEmailSearch = () => {
    setEmailSearch("");
    setEmailSearchResults([]);
    setShowEmailResults(false);
  };

  // ─── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const studentsArray = Array.isArray(students) ? students : [];
    const total = studentsArray.length;
    const active = studentsArray.filter((s) => (s.status || "ACTIVE") === "ACTIVE").length;
    const inactive = studentsArray.filter((s) => s.status === "INACTIVE").length;
    const withPhone = studentsArray.filter((s) => s.phone && s.phone.length > 0).length;
    return { total, active, inactive, withPhone };
  }, [students]);

  // ─── Filtered list ─────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    const studentsArray = Array.isArray(students) ? students : [];
    
    if (showPhoneResults && phoneSearchResults.length > 0) {
      return phoneSearchResults;
    }
    
    if (showEmailResults && emailSearchResults.length > 0) {
      return emailSearchResults;
    }
    
    return studentsArray.filter((s) => {
      const status = s.status || "ACTIVE";
      const matchesStatus = filterStatus === "ALL" || status === filterStatus;
      return matchesStatus;
    });
  }, [students, filterStatus, phoneSearchResults, showPhoneResults, emailSearchResults, showEmailResults]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm, phoneSearchResults, emailSearchResults]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedStudents([]);
    setSelectAll(false);
  }, [filterStatus, searchTerm, phoneSearchResults, emailSearchResults]);

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

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { 
        bg: "#d1fae5", 
        color: "#065f46", 
        text: "Active",
        dot: "#065f46",
        icon: <CheckCircleOutlinedIcon style={{ fontSize: "14px" }} />
      },
      INACTIVE: { 
        bg: "#fee2e2", 
        color: "#991b1b", 
        text: "Inactive",
        dot: "#991b1b",
        icon: <CancelOutlinedIcon style={{ fontSize: "14px" }} />
      },
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
            return `<li>${student?.name || 'Unknown'} (${student?.email || 'No email'}) - ${student?.status || 'ACTIVE'}</li>`;
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
      console.error('Bulk delete error:', error);
      Swal.fire({
        title: "Partial Failure",
        text: "Some students could not be deleted. Please try again individually.",
        icon: "warning",
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
        ${student.status === 'ACTIVE' ? 
          '<p style="color: #f59e0b; font-size: 13px;">💡 This user is active. They will be soft-deleted first, then permanently deleted.</p>' : 
          ''
        }
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
      console.error('Delete error:', error);
      
      if (error.response?.data?.error?.includes('soft deleted first')) {
        try {
          await handleToggleStatus(student.id, student.status);
          await handleDeleteStudent(student.id);
          
          Swal.fire({
            title: "Deleted!",
            text: `${student.name} has been permanently removed.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (retryError) {
          Swal.fire({
            title: "Failed!",
            text: retryError.response?.data?.error || "Failed to delete student",
            icon: "error",
          });
        }
      } else {
        Swal.fire({
          title: "Failed!",
          text: error.response?.data?.error || "Failed to delete student",
          icon: "error",
        });
      }
    }
  };

  return (
    <div style={{ padding: isMobile ? "0" : "0 4px" }}>
      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
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
            👥 Total Students
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
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#991b1b" }}>
            {stats.inactive}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            🔴 Inactive
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
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#7c3aed" }}>
            {stats.withPhone}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            📱 With Phone
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
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
            placeholder="Search users by name..."
            value={localSearch}
            onChange={onSearchInput}
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

        {/* Phone Search */}
        <div style={{ display: "flex", gap: "8px", minWidth: "160px" }}>
          <input
            type="text"
            placeholder="📱 Search phone..."
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handlePhoneSearch()}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border-light)",
              fontSize: "14px",
              outline: "none",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontFamily: "monospace",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
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
            {isPhoneSearching ? "⏳" : "Search"}
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
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Email Search */}
        <div style={{ display: "flex", gap: "8px", minWidth: "180px" }}>
          <input
            type="text"
            placeholder="📧 Search email..."
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleEmailSearch()}
            style={{
              width: "100%",
              padding: "10px 16px",
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
          <button
            onClick={handleEmailSearch}
            disabled={isEmailSearching || !emailSearch.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "none",
              background: emailSearch.trim() ? colors.primary : "#e2e8f0",
              color: emailSearch.trim() ? "#fff" : "#94a3b8",
              fontWeight: 600,
              fontSize: "13px",
              cursor: emailSearch.trim() ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            {isEmailSearching ? "⏳" : "Search"}
          </button>
          {showEmailResults && (
            <button
              onClick={clearEmailSearch}
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
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              ✕ Clear
            </button>
          )}
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
              gap: "6px",
              transition: "all 0.2s ease",
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
            Delete ({selectedStudents.length})
          </button>
        )}
      </div>

      {/* Search Results Info */}
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
            📱 Found {phoneSearchResults.length} user{phoneSearchResults.length !== 1 ? 's' : ''}
          </span>
          <span style={{ color: "#7c3aed", fontSize: "12px" }}>
            Phone: <strong>{phoneSearch}</strong>
          </span>
        </div>
      )}

      {showEmailResults && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: "16px",
            background: "#dbeafe",
            borderRadius: "10px",
            border: "1px solid #93c5fd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span style={{ color: "#1e40af", fontSize: "14px", fontWeight: 500 }}>
            📧 Found {emailSearchResults.length} user{emailSearchResults.length !== 1 ? 's' : ''}
          </span>
          <span style={{ color: "#3b82f6", fontSize: "12px" }}>
            Email: <strong>{emailSearch}</strong>
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
            {showPhoneResults ? "No Users Found" : showEmailResults ? "No Users Found" : "No Students Found"}
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            {showPhoneResults
              ? `No users found with phone number: ${phoneSearch}`
              : showEmailResults
              ? `No users found with email: ${emailSearch}`
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
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px", fontSize: "14px" }}>
              <thead>
                <tr
                  style={{
                    background: "var(--bg-base)",
                    borderBottom: "2px solid var(--border-light)",
                  }}
                >
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
                    Student
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
                    <EmailOutlinedIcon style={{ fontSize: "14px", verticalAlign: "middle" }} /> Email
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
                    <PhoneOutlinedIcon style={{ fontSize: "14px", verticalAlign: "middle" }} /> Phone
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
                        transition: "background 0.2s"
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
                      <td style={{ 
                        padding: "12px 16px", 
                        textAlign: "center", 
                        verticalAlign: "middle" 
                      }}>
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

                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: status === "ACTIVE" ? colors.primarySoft : "#fee2e2",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              color: status === "ACTIVE" ? colors.primary : "#dc2626",
                              flexShrink: 0,
                              fontSize: "14px"
                            }}
                          >
                            {student.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>

                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                {student.name || 'Unknown'}
                              </span>
                              {isProtectedAdmin && (
                                <span
                                  style={{
                                    fontSize: "9px",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    fontWeight: 600
                                  }}
                                >
                                  🔒 Protected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ 
                        padding: "12px 16px", 
                        verticalAlign: "middle",
                        color: "var(--text-secondary)" 
                      }}>
                        {student.email || '-'}
                      </td>

                      {/* Phone column */}
                      <td style={{ 
                        padding: "12px 16px", 
                        textAlign: "center", 
                        verticalAlign: "middle" 
                      }}>
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
                      <td style={{ 
                        padding: "12px 16px", 
                        textAlign: "center", 
                        verticalAlign: "middle" 
                      }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: statusBadge.bg,
                            color: statusBadge.color,
                          }}
                        >
                          {statusBadge.icon}
                          {statusBadge.text}
                        </span>
                      </td>

                      <td style={{ 
                        padding: "12px 16px", 
                        textAlign: "center", 
                        verticalAlign: "middle" 
                      }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
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
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              if (!isProtectedAdmin) {
                                e.currentTarget.style.opacity = "0.8";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isProtectedAdmin) {
                                e.currentTarget.style.opacity = "1";
                              }
                            }}
                          >
                            {status === "ACTIVE" ? "Deactivate" : "Activate"}
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
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              if (!isProtectedAdmin) {
                                e.currentTarget.style.background = "#fecaca";
                                e.currentTarget.style.transform = "scale(1.05)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isProtectedAdmin) {
                                e.currentTarget.style.background = "#fee2e2";
                                e.currentTarget.style.transform = "scale(1)";
                              }
                            }}
                          >
                            <DeleteOutlinedIcon style={{ fontSize: "14px", verticalAlign: "middle" }} />
                            Delete
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
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredStudents.length)} of{" "}
                {filteredStudents.length} students
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      const tableContainer = document.querySelector('.table-container');
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
                          const tableContainer = document.querySelector('.table-container');
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
                      const tableContainer = document.querySelector('.table-container');
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
    </div>
  );
}