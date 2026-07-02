import React, { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import {
  getInstructorDashboardStats,
  getInstructorCourses,
  getInstructorStudents,
  createInstructorCourse,
  deleteInstructorCourse,
  updateInstructorCourse,
  getInstructorHomeVideo,
  updateInstructorHomeVideoUrl,
  searchInstructorStudentsByName,
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

// ===================== MEDIA TAB (INSTRUCTOR VERSION) =====================
function MediaTab({ videoUrl, videoLoading, fetchHomeVideo }) {
  const [urlInput, setUrlInput] = useState("");
  const [updatingUrl, setUpdatingUrl] = useState(false);

  useEffect(() => {
    setUrlInput(videoUrl || "");
  }, [videoUrl]);

  const handleSaveUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      Swal.fire("Error", "Please enter a valid video URL", "error");
      return;
    }
    try {
      new URL(trimmed);
    } catch (_) {
      Swal.fire("Invalid URL", "Please enter a full URL (e.g., https://...)", "error");
      return;
    }
    const result = await Swal.fire({
      title: "Set Video URL?",
      text: "This will replace the current home video.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, set URL",
      confirmButtonColor: colors.teal,
    });
    if (!result.isConfirmed) return;

    setUpdatingUrl(true);
    try {
      await updateInstructorHomeVideoUrl(trimmed);
      await fetchHomeVideo();
      Swal.fire("Success!", "Home video URL updated.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update URL", "error");
    } finally {
      setUpdatingUrl(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid var(--border-light)",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
          🎬 Home Page Video URL
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          Paste a direct video URL or a YouTube link. This will be shown on the public home page.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="https://example.com/video.mp4 or YouTube link"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid var(--border-light)",
              fontSize: 14,
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          <button
            onClick={handleSaveUrl}
            disabled={updatingUrl || !urlInput.trim()}
            style={{
              padding: "12px 24px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              opacity: (updatingUrl || !urlInput.trim()) ? 0.6 : 1,
              whiteSpace: "nowrap",
              transition: "opacity 0.2s",
            }}
          >
            {updatingUrl ? "Saving..." : "Set URL"}
          </button>
        </div>
      </div>
    </div>
  );
}

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

  // ---------- video state ----------
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  // ---------------------------------

  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const currentSearchTermRef = useRef("");

  const [dashboardStats, setDashboardStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

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

  // ---------- fetch home video ----------
  const fetchHomeVideo = async () => {
    setVideoLoading(true);
    try {
      const response = await getInstructorHomeVideo();
      setVideoUrl(response.data.videoUrl || "");
    } catch (err) {
      console.error("Failed to fetch home video:", err);
      setVideoUrl("");
    } finally {
      setVideoLoading(false);
    }
  };
  // --------------------------------------

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
      setDashboardStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally { 
      setLoading(false); 
    }
  };

  // Fetch courses (only instructor's own courses)
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInstructorCourses();
      setCourses(response.data || []);
    } catch (err) {
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
        // Refresh stats too
        await fetchDashboardStats();
        Swal.fire({ 
          title: "Deleted!", 
          icon: "success", 
          timer: 2000, 
          showConfirmButton: false 
        });
      } catch (error) {
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
  };

  // Handle course update
  const handleCourseUpdated = async () => {
    await fetchCourses();
    await fetchDashboardStats();
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
    } else if (activeTab === "courses") {
      fetchCourses();
    } else if (activeTab === "students") {
      fetchStudents();
    } else if (activeTab === "media") {
      fetchHomeVideo();
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

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error) return (
      <div style={{ textAlign: "center", color: "var(--error)", padding: "40px" }}>
        ⚠️ {error}
        <button onClick={() => {
          if (activeTab === "students") fetchStudents();
          else if (activeTab === "courses") fetchCourses();
          else if (activeTab === "media") fetchHomeVideo();
          else if (activeTab === "dashboard") fetchDashboardStats();
        }} style={{ marginLeft: 12, padding: "6px 12px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
    
    switch (activeTab) {
      case "dashboard":   
        return <DashboardTab kpis={kpis} loading={loading} isMobile={isMobile} onNavigate={setActiveTab} />;
      
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
      
      case "media":       
        return <MediaTab videoUrl={videoUrl} videoLoading={videoLoading} fetchHomeVideo={fetchHomeVideo} />;
      
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
    { icon: "🎬", label: "Media",          id: "media"          },
    { icon: "🏗️", label: "Course Manager", id: "course-manager" },
  ];

  const PAGE_TITLES = {
    dashboard:       "Instructor Dashboard",
    courses:         "My Courses",
    students:        "My Students",
    media:           "Media Manager",
    "pdf-viewer":    "PDF Library",
    "course-view":   "Course View",
    "course-manager":"Course Manager",
  };
  
  const PAGE_SUBS = {
    dashboard:       "Welcome back! Manage your courses and students",
    courses:         "Create and manage your courses",
    students:        "View students enrolled in your courses",
    media:           "Manage the home page video",
    "pdf-viewer":    "View all uploaded PDFs, extracted text, and images",
    "course-view":   "View course details",
    "course-manager":"Create and manage courses, topics, subtopics, notes, videos, and exam questions",
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