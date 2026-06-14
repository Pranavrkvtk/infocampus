import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getDashboardStats,
  getAllStudents,
  getAdminCoursesSimple,
  searchUsersByName,
  deleteAdminCourse,
  updateUserStatus,
  getAllInstructors,
  deleteInstructor,
  updateInstructorStatus
} from "../../api/adminApi";
import Swal from "sweetalert2";
import { colors, LoadingSpinner, DateTimeWidget } from "./AdminStyles";
import NavItem from "./NavItem";
import MobileBottomNav from "./MobileBottomNav";
import AddCourseModal from "./AddCourseModal";
import EditCourseModal from "./EditCourseModal";
import EditRoleModal from "./EditRoleModal";
import DashboardTab from "./DashboardTab";
import CoursesTab from "./CoursesTab";
import StudentsTab from "./StudentsTab";
import InstructorsTab from "./InstructorsTab";
import PdfViewerTab from "../PdfViewerTab";
import CourseViewTab from "../CourseViewTab";
import AdminCourseManager from "./AdminCourseManager";

// ================= MAIN COMPONENT =================
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
  const [isDarkMode, setIsDarkMode] = useState(false); // ✅ Dark mode state

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [isDarkMode]);

  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const currentSearchTermRef = useRef("");

  const [dashboardStats, setDashboardStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);

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

  // Fetch all students
  const fetchAllStudents = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    setError(null);
    try {
      const response = await getAllStudents();
      setStudents(response.data || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.response?.data?.message || "Failed to load users");
        setStudents([]);
      }
    } finally {
      setLoading(false);
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  };

  // Fetch all instructors
  const fetchAllInstructors = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    setError(null);
    try {
      const response = await getAllInstructors();
      setInstructors(response.data || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.response?.data?.message || "Failed to load instructors");
        setInstructors([]);
      }
    } finally {
      setLoading(false);
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  };

  // Search students
  const searchStudents = useCallback(async (name) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const trimmedName = name?.trim();
    currentSearchTermRef.current = trimmedName || "";
    if (!trimmedName) {
      await fetchAllStudents();
      return;
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    try {
      const response = await searchUsersByName(trimmedName);
      if (currentSearchTermRef.current === trimmedName) setStudents(response.data || []);
    } catch (err) {
      if (err.name !== 'AbortError' && currentSearchTermRef.current === trimmedName) {
        setError(err.response?.data?.message || "Failed to search users");
      }
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
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await getAdminCoursesSimple();
      setCourses(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (pdf) => {
    setSelectedCoursePdf(pdf);
    setActiveTab("course-view");
  };

  // Delete Course with API
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
        await fetchCourses();
        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({ title: 'Failed!', text: error.response?.data?.message || 'Failed to delete course', icon: 'error' });
      }
    }
  };

  // Delete Instructor
  const handleDeleteInstructor = async (instructorId, instructorName) => {
    const result = await Swal.fire({
      title: 'Delete Instructor?',
      html: `<p>Delete <strong>${instructorName}</strong>? This cannot be undone!</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#E8644A',
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      try {
        await deleteInstructor(instructorId);
        await fetchAllInstructors();
        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({ title: 'Failed!', text: error.response?.data?.message || 'Failed to delete instructor', icon: 'error' });
      }
    }
  };

  // Toggle Instructor Status
  const handleToggleInstructorStatus = async (instructorId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "activate" : "deactivate";
    
    const result = await Swal.fire({
      title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Instructor?`,
      text: `Are you sure you want to ${action} this instructor?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: action === 'activate' ? colors.teal : colors.coral,
    });
    
    if (result.isConfirmed) {
      Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      try {
        await updateInstructorStatus(instructorId, newStatus);
        await fetchAllInstructors();
        Swal.fire({ title: `Instructor ${action}d!`, icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        console.error("Status update error:", error);
        Swal.fire({ title: 'Failed!', text: error.response?.data?.message || `Failed to ${action} instructor`, icon: 'error' });
      }
    }
  };

  // Toggle User Status with API
  const handleToggleStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "activate" : "deactivate";
    
    const result = await Swal.fire({
      title: `${action === 'activate' ? 'Activate' : 'Deactivate'} User?`,
      text: `Are you sure you want to ${action} this user?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: action === 'activate' ? colors.teal : colors.coral,
    });
    
    if (result.isConfirmed) {
      Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      try {
        await updateUserStatus(studentId, newStatus);
        await fetchAllStudents();
        Swal.fire({ title: `User ${action}d!`, icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        console.error("Status update error:", error);
        Swal.fire({ title: 'Failed!', text: error.response?.data?.message || `Failed to ${action} user`, icon: 'error' });
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchStudents(value), 500);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    setSearchTerm("");
    currentSearchTermRef.current = "";
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (activeTab === "dashboard") fetchDashboardStats();
    else if (activeTab === "courses") fetchCourses();
    else if (activeTab === "students") fetchAllStudents();
    else if (activeTab === "instructors") fetchAllInstructors();
  }, [activeTab]);

  const handleUpdateRole = (userId, currentRole) => {
    const user = students.find(s => s.id === userId);
    setSelectedUser(user);
    setIsEditRoleModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.replace("/login");
  };

  const kpis = dashboardStats ? [
    { label: "Total Students", value: dashboardStats.totalStudents?.toLocaleString() || "0", iconBg: colors.primarySoft, icon: "👨‍🎓" },
    { label: "Total Courses", value: dashboardStats.totalCourses?.toString() || "0", iconBg: colors.tealSoft, icon: "🌐" },
    { label: "Total Enrollments", value: dashboardStats.totalEnrollments?.toLocaleString() || "0", iconBg: colors.amberSoft, icon: "📚" },
    { label: "Total Instructors",value: dashboardStats.totalInstructors?.toString() || "0", iconBg: colors.purpleSoft, icon: "👨‍🏫" },
  ] : [];

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return (
      <div style={{ textAlign: "center", color: "var(--error)", padding: "40px" }}>
        ⚠️ {error}
        <button onClick={() => {
          if (activeTab === "students") fetchAllStudents();
          else if (activeTab === "courses") fetchCourses();
          else if (activeTab === "instructors") fetchAllInstructors();
          else fetchDashboardStats();
        }} style={{ marginLeft: 12, padding: "6px 12px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Retry</button>
      </div>
    );

    switch (activeTab) {
      case "dashboard":
        return <DashboardTab kpis={kpis} loading={loading} isMobile={isMobile} />;
      case "courses":
        return (
          <CoursesTab
            courses={courses}
            isMobile={isMobile}
            handleDeleteCourse={handleDeleteCourse}
            setSelectedCourse={setSelectedCourse}
            setIsEditCourseModalOpen={setIsEditCourseModalOpen}
            setIsAddCourseModalOpen={setIsAddCourseModalOpen}
            fetchCourses={fetchCourses}
          />
        );
      case "students":
        return (
          <StudentsTab
            students={students}
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            handleUpdateRole={handleUpdateRole}
            handleToggleStatus={handleToggleStatus}
            isMobile={isMobile}
          />
        );
      case "instructors":
        return (
          <InstructorsTab
            instructors={instructors}
            isMobile={isMobile}
            handleDeleteInstructor={handleDeleteInstructor}
            handleToggleInstructorStatus={handleToggleInstructorStatus}
            fetchAllInstructors={fetchAllInstructors}
          />
        );
      case "pdf-viewer":
        return <PdfViewerTab onViewCourse={handleViewCourse} />;
      case "course-view":
        return <CourseViewTab pdf={selectedCoursePdf} onBack={() => setActiveTab("pdf-viewer")} />;
      case "course-manager":
        return <AdminCourseManager />;
      default:
        return null;
    }
  };

  const navItems = [
    { icon: "📊", label: "Dashboard", id: "dashboard" }, 
    { icon: "🌐", label: "Courses", id: "courses" }, 
    { icon: "👨‍🎓", label: "Students", id: "students" },
    { icon: "👨‍🏫", label: "Instructors", id: "instructors" },
    { icon: "👁️", label: "View PDFs", id: "pdf-viewer" },
    { icon: "🏗️", label: "Course Manager", id: "course-manager" }
  ];

  return (
    <>
      {/* Dark theme CSS overrides */}
      <style>
        {`
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
            --sidebar: #1e1b4b;
            --sidebar-text: #c7d2fe;
            --grad-primary: linear-gradient(135deg, #4f46e5, #7c3aed);
          }
          body.dark-theme {
            --bg-base: #344e8a;
            --surface: #000000;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --border-light: #334155;
            --primary: #818cf8;
            --primary-soft: #312e81;
            --error: #f87171;
            --success: #34d399;
            --teal: #2dd4bf;
            --teal-soft: #134e4a;
            --amber-soft: #78350f;
            --purple-soft: #4c1d95;
            --sidebar: #0f172a;
            --sidebar-text: #a5b4fc;
            --grad-primary: linear-gradient(135deg, #818cf8, #a78bfa);
          }
          body.dark-theme .swal2-popup {
            background: #1e293b !important;
            color: #f1f5f9 !important;
          }
          body.dark-theme input, body.dark-theme textarea, body.dark-theme select {
            background: #334155 !important;
            color: #c3d1e0 !important;
            border-color: #475569 !important;
          }
          body.dark-theme button, body.dark-theme .btn {
            transition: all 0.2s;
          }
        `}
      </style>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", paddingBottom: isMobile ? 70 : 0 }}>
        {/* Hamburger button for desktop (visible only when sidebar closed) */}
        {!isMobile && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: "fixed",
              top: 20,
              left: 20,
              zIndex: 1100,
              background: "var(--surface)",
              border: `1px solid var(--border-light)`,
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              color: "var(--text-primary)"
            }}
          >
            ☰
          </button>
        )}

        {/* Slide Sidebar - Desktop */}
        {!isMobile && (
          <nav
            style={{
              width: sidebarOpen ? 260 : 0,
              background: "var(--surface)",
              borderRight: sidebarOpen ? `1px solid var(--border-light)` : "none",
              display: "flex",
              flexDirection: "column",
              padding: sidebarOpen ? "28px 0" : "0",
              position: "sticky",
              top: 0,
              height: "100vh",
              overflowY: "auto",
              transition: "width 0.3s ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {sidebarOpen && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", marginBottom: 32 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff" }}>⚡</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>INFOCAMPUS</div>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>ADMIN</div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-secondary)" }}
                  >
                    ✕
                  </button>
                </div>

                {navItems.map((item) => {
                  let badge = 0;
                  if (item.id === "courses") badge = courses.length;
                  else if (item.id === "students") badge = students.length;
                  else if (item.id === "instructors") badge = instructors.length;
                  
                  return (
                    <NavItem
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
                <div style={{ padding: "0 8px 20px 8px" }}>
                  <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "var(--error)", background: "var(--surface)", border: "1px solid var(--border-light)", cursor: "pointer" }}>
                    <span style={{ fontSize: 18 }}>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </nav>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "var(--surface)", borderBottom: `1px solid var(--border-light)`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 99 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>⚡</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>INFOCAMPUS</div>
                <div style={{ fontSize: 9, color: "var(--text-secondary)" }}>ADMIN</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "right" }}>
              <div style={{ fontWeight: 600, color: "var(--primary)" }}>{currentTime}</div>
              <div>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: isMobile ? "70px 16px 20px" : "32px 40px",
          overflowY: "auto",
          transition: "margin-left 0.3s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 0, marginBottom: isMobile ? 20 : 28 }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "courses" && "Course Catalog"}
                {activeTab === "students" && "Student Management"}
                {activeTab === "instructors" && "Instructor Management"}
                {activeTab === "pdf-viewer" && "PDF Library"}
                {activeTab === "course-manager" && "Course Manager"}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? 12 : 14 }}>
                {activeTab === "dashboard" && "Welcome back! Track your networking academy performance"}
                {activeTab === "courses" && "Manage all your courses from one place"}
                {activeTab === "students" && "View and manage all enrolled students"}
                {activeTab === "instructors" && "Manage instructors, their status and permissions"}
                {activeTab === "pdf-viewer" && "View all uploaded PDFs, extracted text, and images"}
                {activeTab === "course-manager" && "Create and manage courses, topics, subtopics, notes, videos, and exam questions"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <DateTimeWidget isMobile={isMobile} currentTime={currentTime} />
              {/* Dark mode toggle button */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{
                  background: "var(--surface)",
                  border: `1px solid var(--border-light)`,
                  borderRadius: 40,
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
              >
                {isDarkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />}

        {/* Modals */}
        <AddCourseModal isOpen={isAddCourseModalOpen} onClose={() => setIsAddCourseModalOpen(false)} onCourseCreated={fetchCourses} />
        <EditCourseModal isOpen={isEditCourseModalOpen} onClose={() => { setIsEditCourseModalOpen(false); setSelectedCourse(null); }} course={selectedCourse} onCourseUpdated={fetchCourses} />
        <EditRoleModal isOpen={isEditRoleModalOpen} onClose={() => { setIsEditRoleModalOpen(false); setSelectedUser(null); }} user={selectedUser} onRoleUpdated={fetchAllStudents} />
      </div>
    </>
  );
}