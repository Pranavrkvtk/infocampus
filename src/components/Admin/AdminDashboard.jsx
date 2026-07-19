// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getDashboardStats,
  getAllStudents,
  getAdminCoursesSimple,
  searchUsersByName,
  updateUserStatus,
  getAllEnrollments,
  deleteUser,
} from "../../api/adminApi";
import Swal from "sweetalert2";
import { colors, LoadingSpinner, DateTimeWidget } from "./AdminStyles";
import MobileBottomNav from "./MobileBottomNav";
import AddCourseModal from "./AddCourseModal";
import EditCourseModal from "./EditCourseModal";
import EditRoleModal from "./EditRoleModal";
import DashboardTab from "./DashboardTab";
import CoursesTab from "./CoursesTab";
import StudentsTab from "./StudentsTab";
import EnrollmentsTab from "./EnrollmentsTab";
import PdfViewerTab from "../PdfViewerTab";
import CourseViewTab from "../CourseViewTab";
import AdminCourseManager from "./AdminCourseManager";
import CoursePageSettingsTab from "./CoursePageSettingsTab"; // 👈 NEW IMPORT

// ===================== MAIN ADMIN DASHBOARD =====================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCoursePdf, setSelectedCoursePdf] = useState(null);

  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const currentSearchTermRef = useRef("");

  const [dashboardStats, setDashboardStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ FIXED: Fetch all students with proper response handling
  const fetchAllStudents = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    setError(null);
    try {
      const response = await getAllStudents();
      console.log('📥 Students API response:', response);
      
      // ✅ Handle different response formats
      let studentsData = [];
      if (response.data && response.data.success) {
        // New format: { success: true, count: 30, users: [...] }
        studentsData = response.data.users || [];
      } else if (response.data && Array.isArray(response.data)) {
        // Old format: directly array
        studentsData = response.data;
      } else if (Array.isArray(response)) {
        studentsData = response;
      }
      
      console.log('📥 Extracted students:', studentsData.length);
      setStudents(studentsData);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || "Failed to load users");
        setStudents([]);
      }
    } finally {
      setLoading(false);
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  };

  // ✅ FIXED: Fetch enrollments with proper response handling
  const fetchEnrollments = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    setError(null);
    try {
      const response = await getAllEnrollments();
      console.log('📥 Enrollments API response:', response);
      
      let enrollmentsData = [];
      if (response.data && response.data.success) {
        enrollmentsData = response.data.enrollments || response.data.data || [];
      } else if (response.data && Array.isArray(response.data)) {
        enrollmentsData = response.data;
      } else if (Array.isArray(response)) {
        enrollmentsData = response;
      }
      
      setEnrollments(enrollmentsData);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error('Error fetching enrollments:', err);
        setError(err.response?.data?.message || "Failed to load enrollments");
        setEnrollments([]);
      }
    } finally {
      setLoading(false);
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  };

  // ✅ FIXED: Search students with proper response handling
  const searchStudents = useCallback(async (name) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const trimmedName = name?.trim();
    currentSearchTermRef.current = trimmedName || "";
    if (!trimmedName) { await fetchAllStudents(); return; }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    try {
      const response = await searchUsersByName(trimmedName);
      if (currentSearchTermRef.current === trimmedName) {
        let studentsData = [];
        if (response.data && response.data.success) {
          studentsData = response.data.users || [];
        } else if (response.data && Array.isArray(response.data)) {
          studentsData = response.data;
        } else if (Array.isArray(response)) {
          studentsData = response;
        }
        setStudents(studentsData);
      }
    } catch (err) {
      if (err.name !== "AbortError" && currentSearchTermRef.current === trimmedName)
        setError(err.response?.data?.message || "Failed to search users");
    } finally {
      if (currentSearchTermRef.current === trimmedName) setLoading(false);
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await getDashboardStats();
      setDashboardStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await getAdminCoursesSimple();
      setCourses(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally { setLoading(false); }
  };

  const handleViewCourse = (pdf) => { setSelectedCoursePdf(pdf); setActiveTab("course-view"); };

  const handleToggleStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "activate" : "deactivate";
    const result = await Swal.fire({
      title: `${action === "activate" ? "Activate" : "Deactivate"} User?`,
      text: `Are you sure you want to ${action} this user?`,
      icon: "question", showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: action === "activate" ? colors.teal : colors.coral,
    });
    if (result.isConfirmed) {
      Swal.fire({ title: "Processing...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        await updateUserStatus(studentId, newStatus); 
        await fetchAllStudents();
        Swal.fire({ title: `User ${action}d!`, icon: "success", timer: 2000, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ title: "Failed!", text: error.response?.data?.message || `Failed to ${action} user`, icon: "error" });
      }
    }
  };

  const handleDeleteStudent = async (studentId) => {
    await deleteUser(studentId);
    await fetchAllStudents();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchStudents(value), 500);
  };

  useEffect(() => () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  }, []);

  useEffect(() => {
    setSearchTerm(""); currentSearchTermRef.current = "";
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (activeTab === "dashboard") fetchDashboardStats();
    else if (activeTab === "courses") fetchCourses();
    else if (activeTab === "students") fetchAllStudents();
    else if (activeTab === "enrollments") fetchEnrollments();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.replace("/login");
  };

  const kpis = dashboardStats ? [
    { label: "Total Students",    value: dashboardStats.totalStudents?.toLocaleString() || "0",  iconBg: colors.primarySoft, icon: "👨‍🎓" },
    { label: "Total Courses",     value: dashboardStats.totalCourses?.toString() || "0",          iconBg: colors.tealSoft,    icon: "🌐"  },
    { label: "Total Enrollments", value: dashboardStats.totalEnrollments?.toLocaleString() || "0",iconBg: colors.amberSoft,   icon: "📚"  },
  ] : [];

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return (
      <div style={{ textAlign: "center", color: "var(--error)", padding: "40px" }}>
        ⚠️ {error}
        <button onClick={() => {
          if (activeTab === "students") fetchAllStudents();
          else if (activeTab === "courses") fetchCourses();
          else if (activeTab === "enrollments") fetchEnrollments();
          else if (activeTab === "page-settings") window.location.reload();
          else fetchDashboardStats();
        }} style={{ marginLeft: 12, padding: "6px 12px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
    switch (activeTab) {
      case "dashboard":   return <DashboardTab kpis={kpis} loading={loading} isMobile={isMobile} onNavigate={setActiveTab} />;
      case "courses":     return <CoursesTab courses={courses} isMobile={isMobile} setSelectedCourse={setSelectedCourse} setIsEditCourseModalOpen={setIsEditCourseModalOpen} setIsAddCourseModalOpen={setIsAddCourseModalOpen} fetchCourses={fetchCourses} />;
      case "students":    return <StudentsTab students={students} searchTerm={searchTerm} handleSearchChange={handleSearchChange} handleToggleStatus={handleToggleStatus} handleDeleteStudent={handleDeleteStudent} isMobile={isMobile} />;
      case "enrollments": return <EnrollmentsTab isMobile={isMobile} />;
      case "pdf-viewer":  return <PdfViewerTab onViewCourse={handleViewCourse} />;
      case "course-view": return <CourseViewTab pdf={selectedCoursePdf} onBack={() => setActiveTab("pdf-viewer")} />;
      case "course-manager": return <AdminCourseManager />;
      case "page-settings": return <CoursePageSettingsTab />; // 👈 NEW CASE
      default: return null;
    }
  };

  // ✅ UPDATED: Added "Page Settings" to navigation
  const navItems = [
    { icon: "📊", label: "Dashboard",      id: "dashboard"      },
    { icon: "🌐", label: "Courses",        id: "courses"        },
    { icon: "👨‍🎓", label: "Students",      id: "students"       },
    { icon: "📋", label: "Enrollments",    id: "enrollments"    },
    { icon: "🏗️", label: "Course Manager", id: "course-manager" },
    { icon: "⚙️", label: "Page Settings",  id: "page-settings"  }, // 👈 NEW
  ];

  // ✅ UPDATED: Added page settings to titles
  const PAGE_TITLES = {
    dashboard:       "Dashboard",
    courses:         "Course Catalog",
    students:        "Student Management",
    enrollments:     "Enrollment Management",
    "pdf-viewer":    "PDF Library",
    "course-manager":"Course Manager",
    "page-settings": "Course Page Settings", // 👈 NEW
  };

  // ✅ UPDATED: Added page settings to subs
  const PAGE_SUBS = {
    dashboard:       "Welcome back! Track your networking academy performance",
    courses:         "Manage all your courses from one place",
    students:        "View and manage all enrolled students",
    enrollments:     "View all student enrollments",
    "pdf-viewer":    "View all uploaded PDFs, extracted text, and images",
    "course-manager":"Create and manage courses, topics, subtopics, notes, videos, exam questions, interview questions and labs ",
    "page-settings": "Customize hero section, colors, text, and more", // 👈 NEW
  };

  // ===================== SIDEBAR NAV ITEM =====================
  const SidebarNavItem = ({ icon, label, badge, active, onClick }) => (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "10px 16px",
        borderRadius: "10px",
        background: active ? "#4f46e5" : "transparent",
        color: active ? "#ffffff" : "#e2e8f0",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: active ? 600 : 400,
        transition: "all 0.2s",
        marginBottom: "2px",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "#1e293b";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>{icon}</span>
      <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
      {badge > 0 && (
        <span style={{
          background: active ? "#ffffff" : "#4f46e5",
          color: active ? "#4f46e5" : "#ffffff",
          fontSize: "11px",
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: "12px",
          minWidth: "20px",
          textAlign: "center",
        }}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <>
      <style>{`
        :root {
          --bg-base: #f8f9fb;
          --surface: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
          --border-light: #e4e7ec;
          --primary: #4f46e5;
          --primary-soft: #eef2ff;
          --error: #dc2626;
          --success: #16a34a;
          --teal: #14b8a6;
          --teal-soft: #ccfbf1;
          --amber-soft: #fef3c7;
          --purple-soft: #f3e8ff;
          --grad-start: #4f46e5;
          --grad-end: #7c3aed;
          --grad-primary: linear-gradient(135deg, var(--grad-start), var(--grad-end));
        }
        *, *::before, *::after {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
        }
        input, textarea, select {
          background: #fff !important;
          color: #0f172a !important;
          border-color: #e4e7ec !important;
        }
        input::placeholder, textarea::placeholder { color: #64748b !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1; border-radius: 3px;
        }
        th {
          background: #f1f5f9 !important;
          color: #475569 !important;
          border-color: #e2e8f0 !important;
        }
        td {
          border-color: #e2e8f0 !important;
          color: #0f172a !important;
        }
        tr:hover td { background: #f8fafc !important; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", paddingBottom: isMobile ? 70 : 0 }}>

        {/* Hamburger */}
        {!isMobile && !sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} style={{
            position: "fixed", top: 20, left: 20, zIndex: 1100,
            background: "var(--surface)", border: "1px solid var(--border-light)",
            borderRadius: 8, padding: "8px 12px", cursor: "pointer",
            fontSize: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            color: "var(--text-primary)",
          }}>☰</button>
        )}

        {/* Desktop Sidebar */}
        {!isMobile && (
          <nav style={{
            width: sidebarOpen ? 260 : 0,
            background: "#0f172a",
            borderRight: sidebarOpen ? "1px solid #1e293b" : "none",
            display: "flex", flexDirection: "column",
            padding: sidebarOpen ? "28px 0" : "0",
            position: "sticky", top: 0, height: "100vh",
            overflowY: "auto", overflowX: "hidden",
            transition: "width 0.3s ease",
            whiteSpace: "nowrap", flexShrink: 0,
            color: "#e2e8f0",
          }}>
            {sidebarOpen && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", marginBottom: 32 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", flexShrink: 0 }}>⚡</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>INFOCAMPUS</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "1px" }}>ADMIN</div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
                </div>

                {navItems.map((item) => {
                  let badge = 0;
                  if (item.id === "courses") badge = courses.length;
                  else if (item.id === "students") badge = students.length;
                  else if (item.id === "enrollments") badge = enrollments.length;
                  return (
                    <SidebarNavItem
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      badge={badge}
                      active={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                    />
                  );
                })}

                <div style={{ flex: 1 }} />
                <div style={{ padding: "0 8px 20px" }}>
                  <button onClick={handleLogout} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "12px 16px", borderRadius: 12,
                    fontSize: 14, fontWeight: 600,
                    background: "transparent",
                    border: "1px solid #1e293b",
                    cursor: "pointer",
                    color: "#f87171",
                  }}>
                    <span style={{ fontSize: 18 }}>🚪</span><span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </nav>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0,
            background: "var(--surface)", borderBottom: "1px solid var(--border-light)",
            padding: "12px 16px", display: "flex", justifyContent: "space-between",
            alignItems: "center", zIndex: 99,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>⚡</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>INFOCAMPUS</div>
                <div style={{ fontSize: 9, color: "var(--text-secondary)", letterSpacing: "1px" }}>ADMIN</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "right" }}>
                <div style={{ fontWeight: 600, color: "var(--primary)" }}>{currentTime}</div>
                <div>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main style={{ flex: 1, padding: isMobile ? "70px 16px 20px" : "32px 40px", overflowY: "auto" }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 12 : 0, marginBottom: isMobile ? 20 : 28,
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
                {PAGE_TITLES[activeTab] || "Dashboard"}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? 12 : 14 }}>
                {PAGE_SUBS[activeTab] || ""}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <DateTimeWidget isMobile={isMobile} currentTime={currentTime} />
            </div>
          </div>

          {renderContent()}
        </main>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            items={navItems}
          />
        )}

        {/* Modals */}
        <AddCourseModal isOpen={isAddCourseModalOpen} onClose={() => setIsAddCourseModalOpen(false)} onCourseCreated={fetchCourses} isInstructor={false} />
        <EditCourseModal isOpen={isEditCourseModalOpen} onClose={() => { setIsEditCourseModalOpen(false); setSelectedCourse(null); }} course={selectedCourse} onCourseUpdated={fetchCourses} />
        <EditRoleModal isOpen={isEditRoleModalOpen} onClose={() => { setIsEditRoleModalOpen(false); setSelectedUser(null); }} user={selectedUser} onRoleUpdated={fetchAllStudents} />
      </div>
    </>
  );
}