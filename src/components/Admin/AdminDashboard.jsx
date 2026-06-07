// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getDashboardStats,
  getAllStudents,
  getAdminCoursesSimple,
  createAdminCourse,
  searchUsersByName
} from "../../api/adminApi";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import Sidebar from "./AdminSidebar";
import MobileHeader from "./AdminMobileHeader";
import DashboardTab from "./AdminDashboardTabs";

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

  const handleDeleteCourse = (courseId, courseTitle) => {
    Swal.fire({
      title: 'Delete Course?',
      html: `<p>Delete <strong>${courseTitle}</strong>? This cannot be undone!</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#E8644A',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        setTimeout(() => {
          setCourses(prev => prev.filter(c => c.id !== courseId));
          Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false });
        }, 1000);
      }
    });
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bgBase, paddingBottom: isMobile ? 70 : 0 }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} coursesCount={courses.length} studentsCount={students.length} onLogout={handleLogout} />
      
      <div style={{ flex: 1, padding: isMobile ? "70px 16px 20px" : "32px 40px", overflowY: "auto" }}>
        <MobileHeader isMobile={isMobile} currentTime={currentTime} activeTab={activeTab} />
        
        <DashboardTab
          activeTab={activeTab}
          loading={loading}
          error={error}
          kpis={kpis}
          courses={courses}
          students={students}
          searchTerm={searchTerm}
          isMobile={isMobile}
          onSearchChange={handleSearchChange}
          onAddCourse={() => setIsAddCourseModalOpen(true)}
          onEditCourse={(course) => { setSelectedCourse(course); setIsEditCourseModalOpen(true); }}
          onDeleteCourse={handleDeleteCourse}
          onEditRole={(user) => { setSelectedUser(user); setIsEditRoleModalOpen(true); }}
          onToggleStatus={(id, status) => alert(`Toggle status for user ${id}`)}
          onRetry={() => {
            if (activeTab === "students") fetchAllStudents();
            else if (activeTab === "courses") fetchCourses();
            else fetchDashboardStats();
          }}
        />
      </div>

      {/* Modals would go here */}
    </div>
  );
}