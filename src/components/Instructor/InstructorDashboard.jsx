// src/components/Instructor/InstructorDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import {
  getInstructorDashboardStats,
  getInstructorCourses,
  getInstructorStudents,
  // ✅ Remove unused imports:
  // createInstructorCourse,
  deleteInstructorCourse,
  // updateInstructorCourse,
  searchInstructorStudentsByName,
  // getAllInstructorCourses,
  // getAvailableCourses,
  // assignCourseToInstructor,
  getRecentActivity,
} from "../../api/instructorApi";
import { colors, LoadingSpinner, DateTimeWidget } from "./AdminStyles";
import NavItem from "./NavItem";
import MobileBottomNav from "./MobileBottomNav";
import AddCourseModal from "./AddCourseModal";
import EditCourseModal from "./EditCourseModal";
import DashboardTab from "./DashboardTab";
import CoursesTab from "./CoursesTab";
import StudentsTab from "./StudentsTab";
import CourseViewTab from "../CourseViewTab";
import PdfViewerTab from "../PdfViewerTab";
import AdminCourseManager from "../Admin/AdminCourseManager";
import RecentActivityPage from "./RecentActivityPage";

// ===================== MAIN INSTRUCTOR DASHBOARD =====================
export default function InstructorDashboard() {
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
  const [selectedCoursePdf, setSelectedCoursePdf] = useState(null);

  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const currentSearchTermRef = useRef("");

  const [dashboardStats, setDashboardStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

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

  // Fetch students (only those in instructor's courses)
  const fetchStudents = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    setError(null);
    try {
      const response = await getInstructorStudents();
      setStudents(response.data || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.response?.data?.message || "Failed to load students");
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
    if (!trimmedName) { await fetchStudents(); return; }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    try {
      const response = await searchInstructorStudentsByName(trimmedName);
      if (currentSearchTermRef.current === trimmedName) setStudents(response.data || []);
    } catch (err) {
      if (err.name !== "AbortError" && currentSearchTermRef.current === trimmedName)
        setError(err.response?.data?.message || "Failed to search students");
    } finally {
      if (currentSearchTermRef.current === trimmedName) setLoading(false);
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  }, []);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInstructorDashboardStats();
      console.log('Dashboard Stats:', response.data);
      setDashboardStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally { 
      setLoading(false); 
    }
  };

  // ✅ Fetch recent activity
  const fetchRecentActivity = async () => {
    setLoadingActivity(true);
    try {
      const response = await getRecentActivity(10);
      console.log('Recent Activity:', response);
      
      const sortedActivities = (response.activities || []).sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });
      
      setRecentActivity(sortedActivities);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setRecentActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Fetch courses (only instructor's own courses)
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInstructorCourses();
      console.log('Courses Response:', response.data);
      
      const coursesData = (response.data || []).map(course => ({
        ...course,
        enrollmentCount: course.enrollmentCount || course.studentCount || 0,
      }));
      
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || "Failed to load courses");
      setCourses([]);
    } finally { 
      setLoading(false); 
    }
  };

  const handleViewCourse = (pdf) => { 
    setSelectedCoursePdf(pdf); 
    setActiveTab("course-view"); 
  };

  // Delete course (only instructor's own)
  const handleDeleteCourse = async (courseId, courseTitle) => {
    const result = await Swal.fire({
      title: "Delete Course?",
      html: `<p>Delete <strong>${courseTitle}</strong>? This cannot be undone!</p>`,
      icon: "warning", 
      showCancelButton: true,
      confirmButtonText: "Yes, Delete", 
      confirmButtonColor: "#E8644A",
    });
    if (result.isConfirmed) {
      Swal.fire({ 
        title: "Deleting...", 
        allowOutsideClick: false, 
        didOpen: () => Swal.showLoading() 
      });
      try {
        await deleteInstructorCourse(courseId); 
        await fetchCourses();
        await fetchDashboardStats();
        await fetchRecentActivity();
        Swal.fire({ 
          title: "Deleted!", 
          icon: "success", 
          timer: 2000, 
          showConfirmButton: false 
        });
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({ 
          title: "Failed!", 
          text: error.response?.data?.message || "Failed to delete course", 
          icon: "error" 
        });
      }
    }
  };

  // Handle course creation
  const handleCourseCreated = async () => {
    await fetchCourses();
    await fetchDashboardStats();
    await fetchRecentActivity();
  };

  // Handle course update
  const handleCourseUpdated = async () => {
    await fetchCourses();
    await fetchDashboardStats();
    await fetchRecentActivity();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchStudents(value), 500);
  };

  // Cleanup on unmount
  useEffect(() => () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    setSearchTerm(""); 
    currentSearchTermRef.current = "";
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (activeTab === "dashboard") {
      fetchDashboardStats();
      fetchRecentActivity();
    } else if (activeTab === "courses") {
      fetchCourses();
    } else if (activeTab === "students") {
      fetchStudents();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.replace("/login");
  };

  const kpis = dashboardStats ? [
    { label: "My Students",     value: dashboardStats.totalStudents?.toLocaleString() || "0",  iconBg: colors.primarySoft, icon: "👨‍🎓" },
    { label: "My Courses",      value: dashboardStats.totalCourses?.toString() || "0",          iconBg: colors.tealSoft,    icon: "🌐"  },
    { label: "Total Enrollments", value: dashboardStats.totalEnrollments?.toLocaleString() || "0", iconBg: colors.amberSoft,   icon: "📚"  },
    { label: "Active Students", value: dashboardStats.activeStudents?.toString() || "0",      iconBg: colors.purpleSoft,  icon: "📊" },
  ] : [];

  // ✅ Render Recent Activity component with latest at top
  const renderRecentActivity = () => {
    if (loadingActivity) {
      return (
        <div style={{ textAlign: "center", padding: "20px", color: colors.textMuted }}>
          <div style={{ 
            border: `4px solid ${colors.borderLight}`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            animation: "spin 1s linear infinite",
            margin: "0 auto 12px"
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Loading activities...
        </div>
      );
    }

    if (recentActivity.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
          <p>No recent activity yet</p>
          <p style={{ fontSize: "12px" }}>Activities will appear here when students enroll or complete courses</p>
        </div>
      );
    }

    const sortedActivities = [...recentActivity].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });

    // ✅ Show only first 5 activities
    const displayActivities = sortedActivities.slice(0, 5);
    const hasMoreActivities = sortedActivities.length > 5;

    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {displayActivities.map((activity, index) => {
            let timeDisplay = "Just now";
            if (activity.timestamp) {
              const date = new Date(activity.timestamp);
              const now = new Date();
              const diffMs = now - date;
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMs / 3600000);
              const diffDays = Math.floor(diffMs / 86400000);
              
              if (diffMins < 1) {
                timeDisplay = "Just now";
              } else if (diffMins < 60) {
                timeDisplay = `${diffMins}m ago`;
              } else if (diffHours < 24) {
                timeDisplay = `${diffHours}h ago`;
              } else if (diffDays < 7) {
                timeDisplay = `${diffDays}d ago`;
              } else {
                timeDisplay = date.toLocaleDateString();
              }
            }
            
            return (
              <div 
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "14px 16px",
                  background: colors.surface,
                  borderRadius: "12px",
                  border: `1px solid ${colors.borderLight}`,
                  transition: "all 0.2s",
                  cursor: "default",
                  animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
                }}
              >
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: activity.type === "ENROLLMENT" ? colors.primarySoft :
                             activity.type === "COMPLETION" ? colors.tealSoft :
                             activity.type === "COURSE_UPDATE" ? colors.amberSoft :
                             activity.type === "COURSE_CREATED" ? colors.purpleSoft : colors.bgBase,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}>
                  {activity.icon || "📌"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: 500, 
                    color: colors.textPrimary,
                    wordBreak: "break-word"
                  }}>
                    {activity.message}
                  </div>
                  {activity.studentName && (
                    <div style={{ 
                      fontSize: "12px", 
                      color: colors.textMuted,
                      marginTop: "2px"
                    }}>
                      👤 {activity.studentName}
                    </div>
                  )}
                  {activity.courseTitle && (
                    <div style={{ 
                      fontSize: "12px", 
                      color: colors.primary,
                      marginTop: "2px"
                    }}>
                      📖 {activity.courseTitle}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: "11px", 
                    color: colors.textMuted,
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    flexWrap: "wrap"
                  }}>
                    🕐 {timeDisplay}
                    {activity.status && (
                      <span style={{
                        marginLeft: "8px",
                        padding: "1px 8px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: 600,
                        background: activity.status === "ACTIVE" ? colors.tealSoft :
                                   activity.status === "COMPLETED" ? colors.successLight :
                                   colors.bgBase,
                        color: activity.status === "ACTIVE" ? colors.teal :
                               activity.status === "COMPLETED" ? colors.success :
                               colors.textMuted,
                      }}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontSize: "10px",
                  fontWeight: 600,
                  background: activity.type === "ENROLLMENT" ? colors.primarySoft :
                             activity.type === "COMPLETION" ? colors.tealSoft :
                             activity.type === "COURSE_UPDATE" ? colors.amberSoft :
                             activity.type === "COURSE_CREATED" ? colors.purpleSoft : colors.bgBase,
                  color: activity.type === "ENROLLMENT" ? colors.primary :
                         activity.type === "COMPLETION" ? colors.teal :
                         activity.type === "COURSE_UPDATE" ? "#b45309" :
                         activity.type === "COURSE_CREATED" ? "#7c3aed" : colors.textMuted,
                  whiteSpace: "nowrap",
                }}>
                  {activity.type === "ENROLLMENT" ? "New Enroll" :
                   activity.type === "COMPLETION" ? "Completed" :
                   activity.type === "COURSE_UPDATE" ? "Updated" :
                   activity.type === "COURSE_CREATED" ? "New Course" : "Activity"}
                </div>
              </div>
            );
          })}
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* ✅ View All Button */}
        {hasMoreActivities && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button
              onClick={() => setActiveTab("recent-activity")}
              style={{
                padding: "8px 24px",
                borderRadius: 8,
                border: "none",
                background: colors.primary,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              View All Activities →
            </button>
          </div>
        )}
      </>
    );
  };

  // ✅ Update the renderContent to include Recent Activity in Dashboard tab
  const renderContent = () => {
    if (loading && activeTab !== "dashboard" && activeTab !== "recent-activity") return <LoadingSpinner />;
    if (error) return (
      <div style={{ textAlign: "center", color: "var(--error)", padding: "40px" }}>
        ⚠️ {error}
        <button onClick={() => {
          if (activeTab === "students") fetchStudents();
          else if (activeTab === "courses") fetchCourses();
          else if (activeTab === "dashboard") { fetchDashboardStats(); fetchRecentActivity(); }
        }} style={{ marginLeft: 12, padding: "6px 12px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
    
    switch (activeTab) {
      case "dashboard":   
        return (
          <div>
            <DashboardTab 
              kpis={kpis} 
              loading={loading} 
              isMobile={isMobile} 
              onNavigate={setActiveTab} 
              recentActivities={recentActivity}
              activityLoading={loadingActivity}
            />
            
            {/* ✅ Recent Activity Section */}
            <div style={{ 
              marginTop: "32px",
              background: colors.surface,
              borderRadius: "16px",
              border: `1px solid ${colors.borderLight}`,
              padding: isMobile ? "16px" : "24px",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "10px",
              }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: colors.textPrimary }}>
                    🕐 Recent Activity
                  </h3>
                  <p style={{ fontSize: "13px", color: colors.textMuted }}>
                    Latest activity from your courses
                  </p>
                </div>
                <button
                  onClick={() => {
                    fetchRecentActivity();
                    Swal.fire({
                      title: "Refreshed!",
                      text: "Activity updated",
                      icon: "success",
                      timer: 1500,
                      showConfirmButton: false
                    });
                  }}
                  style={{
                    padding: "6px 14px",
                    background: colors.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
              
              {renderRecentActivity()}
            </div>
          </div>
        );
      
      case "recent-activity":
        return <RecentActivityPage onBack={() => setActiveTab("dashboard")} />;
      
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
            isInstructor={true}
          />
        );
      
      case "students":    
        return (
          <StudentsTab 
            students={students} 
            searchTerm={searchTerm} 
            handleSearchChange={handleSearchChange} 
            isMobile={isMobile}
            isInstructor={true}
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

  // Navigation items
  const navItems = [
    { icon: "📊", label: "Dashboard",      id: "dashboard"      },
    { icon: "🌐", label: "My Courses",     id: "courses"        },
    { icon: "👨‍🎓", label: "My Students",   id: "students"       },
    { icon: "🏗️", label: "Course Manager", id: "course-manager" },
    { icon: "🕐", label: "Recent Activity", id: "recent-activity" },
  ];

  const PAGE_TITLES = {
    dashboard:       "Instructor Dashboard",
    courses:         "My Courses",
    students:        "My Students",
    "pdf-viewer":    "PDF Library",
    "course-view":   "Course View",
    "course-manager":"Course Manager",
    "recent-activity": "Recent Activity",
  };
  
  const PAGE_SUBS = {
    dashboard:       "Welcome back! Manage your courses and students",
    courses:         "Create and manage your courses",
    students:        "View students enrolled in your courses",
    "pdf-viewer":    "View all uploaded PDFs, extracted text, and images",
    "course-view":   "View course details",
    "course-manager":"Create and manage courses, topics, subtopics, notes, videos, and exam questions",
    "recent-activity": "Complete history of all activities across your courses",
  };

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
          --success-light: #f0fdf4;
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

        {/* Hamburger — desktop sidebar closed */}
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
            background: "var(--surface)",
            borderRight: sidebarOpen ? "1px solid var(--border-light)" : "none",
            display: "flex", flexDirection: "column",
            padding: sidebarOpen ? "28px 0" : "0",
            position: "sticky", top: 0, height: "100vh",
            overflowY: "auto", overflowX: "hidden",
            transition: "width 0.3s ease",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {sidebarOpen && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", marginBottom: 32 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", flexShrink: 0 }}>⚡</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>INFOCAMPUS</div>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: "1px" }}>INSTRUCTOR</div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-secondary)" }}>✕</button>
                </div>

                {navItems.map((item) => {
                  let badge = 0;
                  if (item.id === "courses") badge = courses.length;
                  else if (item.id === "students") badge = students.length;
                  return <NavItem key={item.id} icon={item.icon} label={item.label} badge={badge} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} />;
                })}

                <div style={{ flex: 1 }} />
                <div style={{ padding: "0 8px 20px" }}>
                  <button onClick={handleLogout} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "12px 16px", borderRadius: 12,
                    fontSize: 14, fontWeight: 600, color: "var(--error)",
                    background: "var(--surface)", border: "1px solid var(--border-light)", cursor: "pointer",
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
                <div style={{ fontSize: 9, color: "var(--text-secondary)", letterSpacing: "1px" }}>INSTRUCTOR</div>
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
              <button
                onClick={() => {
                  if (activeTab === "dashboard") { fetchDashboardStats(); fetchRecentActivity(); }
                  else if (activeTab === "courses") fetchCourses();
                  else if (activeTab === "students") fetchStudents();
                  else if (activeTab === "recent-activity") { /* handled in RecentActivityPage */ }
                  Swal.fire({
                    title: "Refreshed!",
                    text: "Data updated successfully",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                  });
                }}
                style={{
                  padding: "8px 14px",
                  background: colors.primary,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                🔄 Refresh
              </button>
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
        <AddCourseModal 
          isOpen={isAddCourseModalOpen} 
          onClose={() => setIsAddCourseModalOpen(false)} 
          onCourseCreated={handleCourseCreated}
          isInstructor={true}
        />
        <EditCourseModal 
          isOpen={isEditCourseModalOpen} 
          onClose={() => { 
            setIsEditCourseModalOpen(false); 
            setSelectedCourse(null); 
          }} 
          course={selectedCourse} 
          onCourseUpdated={handleCourseUpdated}
          isInstructor={true}
        />
      </div>
    </>
  );
}