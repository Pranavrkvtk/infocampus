import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getDashboardStats,
  getAllStudents,
  getAdminCoursesSimple,
  createAdminCourse,
  searchUsersByName,
  deleteAdminCourse,
  updateUserRole,
  updateUserStatus
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

// ================= MAIN COMPONENT =================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const currentSearchTermRef = useRef("");

  const [dashboardStats, setDashboardStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
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
  ] : [];

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return (
      <div style={{ textAlign: "center", color: colors.coral, padding: "40px" }}>
        ⚠️ {error}
        <button onClick={() => {
          if (activeTab === "students") fetchAllStudents();
          else if (activeTab === "courses") fetchCourses();
          else fetchDashboardStats();
        }} style={{ marginLeft: 12, padding: "6px 12px", background: colors.primary, color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Retry</button>
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
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bgBase, paddingBottom: isMobile ? 70 : 0 }}>
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <nav style={{ width: 260, background: colors.surface, borderRight: `1px solid ${colors.borderLight}`, display: "flex", flexDirection: "column", padding: "28px 0", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", marginBottom: 32 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: colors.gradPrimary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff" }}>⚡</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>INFOCAMPUS</div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>ADMIN</div>
            </div>
          </div>

          {[{ icon: "📊", label: "Dashboard", id: "dashboard" }, { icon: "🌐", label: "Courses", id: "courses" }, { icon: "👨‍🎓", label: "Students", id: "students" }].map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              badge={item.id === "courses" ? courses.length : item.id === "students" ? students.length : 0}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}

          <div style={{ flex: 1 }} />
          <div style={{ padding: "0 8px 20px 8px" }}>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600, color: colors.coral, background: colors.coralSoft, border: "none", cursor: "pointer" }}>
              <span style={{ fontSize: 18 }}>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: colors.surface, borderBottom: `1px solid ${colors.borderLight}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 99 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: colors.gradPrimary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>⚡</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>INFOCAMPUS</div>
              <div style={{ fontSize: 9, color: colors.textMuted }}>ADMIN</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, textAlign: "right" }}>
            <div style={{ fontWeight: 600, color: colors.primary }}>{currentTime}</div>
            <div>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, padding: isMobile ? "70px 16px 20px" : "32px 40px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 12 : 0, marginBottom: isMobile ? 20 : 28 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, marginBottom: 4 }}>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "courses" && "Course Catalog"}
              {activeTab === "students" && "Student Management"}
            </h1>
            <p style={{ color: colors.textSecondary, fontSize: isMobile ? 12 : 14 }}>
              {activeTab === "dashboard" && "Welcome back! Track your networking academy performance"}
              {activeTab === "courses" && "Manage all your courses from one place"}
              {activeTab === "students" && "View and manage all enrolled students"}
            </p>
          </div>
          <DateTimeWidget isMobile={isMobile} currentTime={currentTime} />
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
  );
}