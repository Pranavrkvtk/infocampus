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
  hardDeleteInstructor,
  updateInstructorStatus,
  getHomeVideo,
  // uploadHomeVideo, // ❌ Removed - not used
  // deleteHomeVideo,  // ❌ Removed - not used
  updateHomeVideoUrl,
  getAllEnrollments,
  deleteUser,
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
import EnrollmentsTab from "./EnrollmentsTab";
import PdfViewerTab from "../PdfViewerTab";
import CourseViewTab from "../CourseViewTab";
import AdminCourseManager from "./AdminCourseManager";

// ===================== MEDIA TAB =====================
function MediaTab({ videoUrl, videoLoading, fetchHomeVideo, setVideoLoading }) {
  const [urlInput, setUrlInput] = useState("");
  const [updatingUrl, setUpdatingUrl] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  // const [isValidUrl, setIsValidUrl] = useState(false); // ❌ Removed - not used
  const [isYoutube, setIsYoutube] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");

  useEffect(() => {
    setUrlInput(videoUrl || "");
    if (videoUrl) {
      setPreviewUrl(videoUrl);
      validateAndEmbedUrl(videoUrl);
    }
  }, [videoUrl]);

  const validateAndEmbedUrl = (url) => {
    if (!url || !url.trim()) {
      // setIsValidUrl(false); // ❌ Removed
      setIsYoutube(false);
      setEmbedUrl("");
      return;
    }

    try {
      new URL(url);
      // setIsValidUrl(true); // ❌ Removed
      
      // Check if it's a YouTube URL
      const isYoutubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
      setIsYoutube(isYoutubeUrl);
      
      if (isYoutubeUrl) {
        // Extract video ID and create embed URL
        let videoId = null;
        let embed = url;
        
        // Handle various YouTube URL formats
        if (url.includes('watch?v=')) {
          const videoIdMatch = url.match(/[?&]v=([^&]+)/);
          if (videoIdMatch && videoIdMatch[1]) {
            videoId = videoIdMatch[1];
          }
        } else if (url.includes('youtu.be/')) {
          const videoIdMatch = url.match(/youtu\.be\/([^?&]+)/);
          if (videoIdMatch && videoIdMatch[1]) {
            videoId = videoIdMatch[1];
          }
        }
        
        if (videoId) {
          // Check if it's a playlist
          const listMatch = url.match(/[?&]list=([^&]+)/);
          if (listMatch && listMatch[1]) {
            embed = `https://www.youtube.com/embed/${videoId}?list=${listMatch[1]}`;
          } else {
            embed = `https://www.youtube.com/embed/${videoId}`;
          }
        }
        setEmbedUrl(embed);
      } else {
        setEmbedUrl(url);
      }
    } catch (_) {
      // setIsValidUrl(false); // ❌ Removed
      setIsYoutube(false);
      setEmbedUrl("");
    }
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setUrlInput(value);
    if (value.trim()) {
      validateAndEmbedUrl(value);
    } else {
      // setIsValidUrl(false); // ❌ Removed
      setIsYoutube(false);
      setEmbedUrl("");
    }
  };

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
      await updateHomeVideoUrl(trimmed);
      await fetchHomeVideo();
      setPreviewUrl(trimmed);
      validateAndEmbedUrl(trimmed);
      Swal.fire("Success!", "Home video URL updated.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update URL", "error");
    } finally {
      setUpdatingUrl(false);
    }
  };

  // Extract YouTube video ID for thumbnail
  const getYoutubeThumbnail = (url) => {
    if (!url) return null;
    let videoId = null;
    if (url.includes('watch?v=')) {
      const match = url.match(/[?&]v=([^&]+)/);
      if (match) videoId = match[1];
    } else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      if (match) videoId = match[1];
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const thumbnailUrl = isYoutube && previewUrl ? getYoutubeThumbnail(previewUrl) : null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
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
          🎬 Home Page Video
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          Paste a direct video URL or a YouTube link. This will be shown on the public home page.
        </p>

        {/* URL Input */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="text"
              placeholder="https://example.com/video.mp4 or YouTube link"
              value={urlInput}
              onChange={handleUrlChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid var(--border-light)",
                fontSize: 14,
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
            />
          </div>
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
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {updatingUrl ? (
              <span>⏳ Saving...</span>
            ) : (
              <span>💾 Set URL</span>
            )}
          </button>
        </div>

        {/* Current Video Preview */}
        {previewUrl && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}>
              <span style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}>
                📺 Current Video Preview
              </span>
              {isYoutube && (
                <span style={{
                  fontSize: "11px",
                  background: "#ff0000",
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontWeight: 600,
                }}>
                  YouTube
                </span>
              )}
              {previewUrl && !isYoutube && (
                <span style={{
                  fontSize: "11px",
                  background: "#4CAF50",
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontWeight: 600,
                }}>
                  Direct Video
                </span>
              )}
            </div>

            {/* Video Player or Thumbnail */}
            {isYoutube && embedUrl ? (
              <div style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
                borderRadius: 12,
                background: "#000",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}>
                <iframe
                  src={embedUrl}
                  title="Home Page Video"
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            ) : previewUrl && !isYoutube ? (
              <div style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
                borderRadius: 12,
                background: "#000",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}>
                <video
                  controls
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <source src={previewUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : null}

            {/* Video Info */}
            <div style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}>
              <span style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                wordBreak: "break-all",
                flex: 1,
              }}>
                🔗 {previewUrl}
              </span>
              {isYoutube && thumbnailUrl && (
                <span style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  🖼️ Thumbnail available
                </span>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!previewUrl && (
          <div style={{
            marginTop: 24,
            padding: "40px 20px",
            textAlign: "center",
            background: "var(--bg-base)",
            borderRadius: 12,
            border: "2px dashed var(--border-light)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <h3 style={{ color: "var(--text-secondary)", fontSize: 16, fontWeight: 500 }}>
              No video set yet
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Enter a YouTube URL or direct video link above to add a video to the home page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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
  // const [isThemeOpen, setIsThemeOpen] = useState(false); // ❌ Removed - not used

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
  const [instructors, setInstructors] = useState([]);
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

  // ---------- fetch home video ----------
  const fetchHomeVideo = async () => {
    setVideoLoading(true);
    try {
      const response = await getHomeVideo();
      setVideoUrl(response.data.videoUrl || "");
    } catch (err) {
      console.error("Failed to fetch home video:", err);
      setVideoUrl("");
    } finally {
      setVideoLoading(false);
    }
  };
  // --------------------------------------

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
      if (err.name !== "AbortError") {
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
      if (err.name !== "AbortError") {
        setError(err.response?.data?.message || "Failed to load instructors");
        setInstructors([]);
      }
    } finally {
      setLoading(false);
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  };

  // Fetch all enrollments
  const fetchEnrollments = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    setError(null);
    try {
      const response = await getAllEnrollments();
      setEnrollments(response.data || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.response?.data?.message || "Failed to load enrollments");
        setEnrollments([]);
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
    if (!trimmedName) { await fetchAllStudents(); return; }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setLoading(true);
    try {
      const response = await searchUsersByName(trimmedName);
      if (currentSearchTermRef.current === trimmedName) setStudents(response.data || []);
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

  const handleDeleteCourse = async (courseId, courseTitle) => {
    const result = await Swal.fire({
      title: "Delete Course?",
      html: `<p>Delete <strong>${courseTitle}</strong>? This cannot be undone!</p>`,
      icon: "warning", showCancelButton: true,
      confirmButtonText: "Yes, Delete", confirmButtonColor: "#E8644A",
    });
    if (result.isConfirmed) {
      Swal.fire({ title: "Deleting...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        await deleteAdminCourse(courseId); await fetchCourses();
        Swal.fire({ title: "Deleted!", icon: "success", timer: 2000, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ title: "Failed!", text: error.response?.data?.message || "Failed to delete course", icon: "error" });
      }
    }
  };

  const handleDeleteInstructor = async (instructorId, instructorName, isActive = true) => {
    if (!isActive) {
      const result = await Swal.fire({
        title: "Permanently Delete Instructor?",
        html: `
          <p>Delete <strong>${instructorName}</strong>?</p>
          <p style="color: #991b1b; font-size: 13px; margin-top: 8px;">
            ⚠️ This will permanently delete the instructor and all their data.
            <br>This action <strong>cannot</strong> be undone!
          </p>
        `,
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Yes, Permanently Delete",
        confirmButtonColor: "#dc2626",
        cancelButtonText: "Cancel",
        cancelButtonColor: "#6b7280"
      });
      
      if (result.isConfirmed) {
        Swal.fire({ 
          title: "Deleting...", 
          allowOutsideClick: false, 
          didOpen: () => Swal.showLoading() 
        });
        
        try {
          await hardDeleteInstructor(instructorId);
          await fetchAllInstructors();
          
          Swal.fire({ 
            title: "Deleted!", 
            text: `${instructorName} has been permanently deleted.`,
            icon: "success", 
            timer: 2000, 
            showConfirmButton: false 
          });
        } catch (error) {
          console.error("Hard delete error:", error);
          Swal.fire({ 
            title: "Failed!", 
            text: error.response?.data?.message || error.response?.data?.error || "Failed to delete instructor", 
            icon: "error" 
          });
        }
      }
      return;
    }

    const { value: choice } = await Swal.fire({
      title: `Manage ${instructorName}`,
      text: "What would you like to do with this instructor?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "🔒 Deactivate",
      cancelButtonText: "Cancel",
      showDenyButton: true,
      denyButtonText: "🗑️ Permanently Delete",
      denyButtonColor: "#dc2626",
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280"
    });

    if (choice === true) {
      const confirm = await Swal.fire({
        title: "Deactivate Instructor?",
        html: `
          <p>Deactivate <strong>${instructorName}</strong>?</p>
          <p style="color: #92400e; font-size: 13px; margin-top: 8px;">
            ⚠️ This instructor will no longer be able to log in.
            <br>They can be <strong>reactivated</strong> later if needed.
          </p>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Deactivate",
        confirmButtonColor: "#f59e0b",
        cancelButtonText: "Cancel"
      });

      if (confirm.isConfirmed) {
        Swal.fire({ 
          title: "Deactivating...", 
          allowOutsideClick: false, 
          didOpen: () => Swal.showLoading() 
        });
        
        try {
          await deleteInstructor(instructorId);
          await fetchAllInstructors();
          
          Swal.fire({ 
            title: "Deactivated!", 
            text: `${instructorName} has been deactivated.`,
            icon: "success", 
            timer: 2000, 
            showConfirmButton: false 
          });
        } catch (error) {
          console.error("Deactivate error:", error);
          Swal.fire({ 
            title: "Failed!", 
            text: error.response?.data?.message || error.response?.data?.error || "Failed to deactivate instructor", 
            icon: "error" 
          });
        }
      }
    } else if (choice === false) {
      const confirm = await Swal.fire({
        title: "Permanently Delete?",
        html: `
          <p>Delete <strong>${instructorName}</strong>?</p>
          <p style="color: #991b1b; font-size: 13px; margin-top: 8px;">
            ⚠️ This will permanently delete the instructor and all their data.
            <br>This action <strong>cannot</strong> be undone!
          </p>
        `,
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete Permanently",
        confirmButtonColor: "#dc2626",
        cancelButtonText: "Cancel",
        cancelButtonColor: "#6b7280"
      });

      if (confirm.isConfirmed) {
        Swal.fire({ 
          title: "Deleting...", 
          allowOutsideClick: false, 
          didOpen: () => Swal.showLoading() 
        });
        
        try {
          await hardDeleteInstructor(instructorId);
          await fetchAllInstructors();
          
          Swal.fire({ 
            title: "Deleted!", 
            text: `${instructorName} has been permanently deleted.`,
            icon: "success", 
            timer: 2000, 
            showConfirmButton: false 
          });
        } catch (error) {
          console.error("Hard delete error:", error);
          Swal.fire({ 
            title: "Failed!", 
            text: error.response?.data?.message || error.response?.data?.error || "Failed to delete instructor", 
            icon: "error" 
          });
        }
      }
    }
  };

  const handleToggleInstructorStatus = async (instructorId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "activate" : "deactivate";
    const result = await Swal.fire({
      title: `${action === "activate" ? "Activate" : "Deactivate"} Instructor?`,
      text: `Are you sure you want to ${action} this instructor?`,
      icon: "question", showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: action === "activate" ? colors.teal : colors.coral,
    });
    if (result.isConfirmed) {
      Swal.fire({ title: "Processing...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        await updateInstructorStatus(instructorId, newStatus); await fetchAllInstructors();
        Swal.fire({ title: `Instructor ${action}d!`, icon: "success", timer: 2000, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ title: "Failed!", text: error.response?.data?.message || `Failed to ${action} instructor`, icon: "error" });
      }
    }
  };

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
        await updateUserStatus(studentId, newStatus); await fetchAllStudents();
        Swal.fire({ title: `User ${action}d!`, icon: "success", timer: 2000, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ title: "Failed!", text: error.response?.data?.message || `Failed to ${action} user`, icon: "error" });
      }
    }
  };

  // Permanently delete a student
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
    else if (activeTab === "instructors") fetchAllInstructors();
    else if (activeTab === "enrollments") fetchEnrollments();
    else if (activeTab === "media") fetchHomeVideo();
  }, [activeTab]);

  // ❌ Removed: handleUpdateRole - not used

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
    { label: "Total Instructors", value: dashboardStats.totalInstructors?.toString() || "0",      iconBg: colors.purpleSoft,  icon: "👨‍🏫" },
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
          else if (activeTab === "enrollments") fetchEnrollments();
          else if (activeTab === "media") fetchHomeVideo();
          else fetchDashboardStats();
        }} style={{ marginLeft: 12, padding: "6px 12px", background: "var(--primary)", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
    switch (activeTab) {
      case "dashboard":   return <DashboardTab kpis={kpis} loading={loading} isMobile={isMobile} onNavigate={setActiveTab} />;
      case "courses":     return <CoursesTab courses={courses} isMobile={isMobile} handleDeleteCourse={handleDeleteCourse} setSelectedCourse={setSelectedCourse} setIsEditCourseModalOpen={setIsEditCourseModalOpen} setIsAddCourseModalOpen={setIsAddCourseModalOpen} fetchCourses={fetchCourses} />;
      case "students":    return <StudentsTab students={students} searchTerm={searchTerm} handleSearchChange={handleSearchChange} handleToggleStatus={handleToggleStatus} handleDeleteStudent={handleDeleteStudent} isMobile={isMobile} />;
      case "instructors": return <InstructorsTab instructors={instructors} isMobile={isMobile} handleDeleteInstructor={handleDeleteInstructor} handleToggleInstructorStatus={handleToggleInstructorStatus} fetchAllInstructors={fetchAllInstructors} />;
      case "enrollments": return <EnrollmentsTab isMobile={isMobile} />;
      case "media":       return <MediaTab videoUrl={videoUrl} videoLoading={videoLoading} fetchHomeVideo={fetchHomeVideo} setVideoLoading={setVideoLoading} />;
      case "pdf-viewer":  return <PdfViewerTab onViewCourse={handleViewCourse} />;
      case "course-view": return <CourseViewTab pdf={selectedCoursePdf} onBack={() => setActiveTab("pdf-viewer")} />;
      case "course-manager": return <AdminCourseManager />;
      default: return null;
    }
  };

  const navItems = [
    { icon: "📊", label: "Dashboard",      id: "dashboard"      },
    { icon: "🌐", label: "Courses",        id: "courses"        },
    { icon: "👨‍🎓", label: "Students",      id: "students"       },
    { icon: "👨‍🏫", label: "Instructors",   id: "instructors"    },
    { icon: "📋", label: "Enrollments",    id: "enrollments"    },
    { icon: "🎬", label: "Media",          id: "media"          },
    { icon: "🏗️", label: "Course Manager", id: "course-manager" },
  ];

  const PAGE_TITLES = {
    dashboard:       "Dashboard",
    courses:         "Course Catalog",
    students:        "Student Management",
    instructors:     "Instructor Management",
    enrollments:     "Enrollment Management",
    media:           "Media Manager",
    "pdf-viewer":    "PDF Library",
    "course-manager":"Course Manager",
  };
  const PAGE_SUBS = {
    dashboard:       "Welcome back! Track your networking academy performance",
    courses:         "Manage all your courses from one place",
    students:        "View and manage all enrolled students",
    instructors:     "Manage instructors, their status and permissions",
    enrollments:     "View all student enrollments and progress",
    media:           "Manage the home page video and future image assets",
    "pdf-viewer":    "View all uploaded PDFs, extracted text, and images",
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
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: "1px" }}>ADMIN</div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-secondary)" }}>✕</button>
                </div>

                {navItems.map((item) => {
                  let badge = 0;
                  if (item.id === "courses") badge = courses.length;
                  else if (item.id === "students") badge = students.length;
                  else if (item.id === "instructors") badge = instructors.length;
                  else if (item.id === "enrollments") badge = enrollments.length;
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
        <AddCourseModal isOpen={isAddCourseModalOpen} onClose={() => setIsAddCourseModalOpen(false)} onCourseCreated={fetchCourses} />
        <EditCourseModal isOpen={isEditCourseModalOpen} onClose={() => { setIsEditCourseModalOpen(false); setSelectedCourse(null); }} course={selectedCourse} onCourseUpdated={fetchCourses} />
        <EditRoleModal isOpen={isEditRoleModalOpen} onClose={() => { setIsEditRoleModalOpen(false); setSelectedUser(null); }} user={selectedUser} onRoleUpdated={fetchAllStudents} />
      </div>
    </>
  );
}