import React, { useState, useEffect } from "react";
import {
  getDashboardStats,
  getAllStudents,
  getAdminCoursesSimple,
  createAdminCourse,
  searchUsersByName
} from "../../api/adminApi";

// ================= LIGHT MODERN THEME =================
const colors = {
  bgBase: "#F6F8FC",
  surface: "#FFFFFF",
  borderLight: "#E9EDF2",
  primary: "#5E5BFF",
  primaryLight: "#8C8AFF",
  primarySoft: "#EEF0FF",
  primaryDark: "#4C47E6",
  teal: "#14B895",
  tealLight: "#4FCFB2",
  tealSoft: "#E0F9F2",
  coral: "#E8644A",
  coralLight: "#F08F7A",
  coralSoft: "#FEF2EF",
  amber: "#E68A2E",
  amberLight: "#F0B06B",
  amberSoft: "#FEF5E8",
  textPrimary: "#1E293B",
  textSecondary: "#5A6A85",
  textMuted: "#8C9AB0",
  textFaint: "#B7C1D4",
  gradPrimary: "linear-gradient(135deg, #5E5BFF 0%, #8C8AFF 100%)",
  gradTeal: "linear-gradient(135deg, #14B895 0%, #4FCFB2 100%)",
  gradCoral: "linear-gradient(135deg, #E8644A 0%, #F08F7A 100%)",
  gradAmber: "linear-gradient(135deg, #E68A2E 0%, #F0B06B 100%)",
};

const navItems = [
  { icon: "📊", label: "Dashboard", id: "dashboard" },
  { icon: "🌐", label: "Courses", id: "courses" },
  { icon: "👨‍🎓", label: "Students", id: "students" },
];

// ================= HELPERS =================

const getCurrentDate = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

const getCurrentTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });

// ================= COMPONENTS =================

function NavItem({ icon, label, badge, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", margin: "4px 8px", borderRadius: 12,
        fontSize: 14, fontWeight: 500, cursor: "pointer",
        color: active ? colors.primary : hovered ? colors.textPrimary : colors.textSecondary,
        background: active ? colors.primarySoft : hovered ? "#F1F4FA" : "transparent",
        transition: "all 0.18s",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{
          background: colors.primary, color: "#fff",
          fontSize: 11, borderRadius: 40, padding: "2px 8px", fontWeight: 600,
        }}>{badge}</span>
      )}
    </div>
  );
}

function KpiCard({ label, value, iconBg, icon, loading }) {
  return (
    <div
      style={{
        background: colors.surface, borderRadius: 16, padding: "16px",
        border: `1px solid ${colors.borderLight}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, marginBottom: 12,
      }}>{icon}</div>
      <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>
        {loading ? "..." : value}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    PUBLISHED: { bg: colors.tealSoft, color: colors.teal },
    DRAFT: { bg: "#F0F2F8", color: colors.textMuted },
    ACTIVE: { bg: colors.tealSoft, color: colors.teal },
    PENDING: { bg: colors.amberSoft, color: colors.amber },
    INACTIVE: { bg: colors.coralSoft, color: colors.coral },
    STUDENT: { bg: colors.primarySoft, color: colors.primary },
    ADMIN: { bg: colors.amberSoft, color: colors.amber },
    INSTRUCTOR: { bg: colors.tealSoft, color: colors.teal },
    Beginner: { bg: colors.primarySoft, color: colors.primary },
    Intermediate: { bg: colors.amberSoft, color: colors.amber },
    Advanced: { bg: colors.coralSoft, color: colors.coral },
  };
  const s = map[status] || { bg: "#F0F2F8", color: colors.textMuted };
  return (
    <span style={{
      display: "inline-flex", fontSize: 10.5, padding: "3px 10px",
      borderRadius: 50, fontWeight: 600, background: s.bg, color: s.color,
    }}>{status}</span>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: "center", padding: "60px" }}>
      <div style={{
        width: 50, height: 50,
        border: `3px solid ${colors.borderLight}`,
        borderTop: `3px solid ${colors.primary}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function DateTimeWidget({ isMobile, currentTime }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: colors.surface,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: 14,
      padding: isMobile ? "10px 16px" : "10px 20px",
      minWidth: isMobile ? "100%" : "auto",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: colors.primarySoft,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>📅</div>
      <div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3,
        }}>
          {getCurrentDate()}
        </div>
        <div style={{
          fontSize: 12, color: colors.primary, fontWeight: 500,
          fontVariantNumeric: "tabular-nums", marginTop: 2,
        }}>
          🕐 {currentTime}
        </div>
      </div>
    </div>
  );
}

function MobileBottomNav({ activeTab, onTabChange, onLogout }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: colors.surface, borderTop: `1px solid ${colors.borderLight}`,
      display: "flex", justifyContent: "space-around",
      padding: "8px 16px 20px", zIndex: 100,
    }}>
      {navItems.map((item) => (
        <div
          key={item.id}
          onClick={() => onTabChange(item.id)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 4, cursor: "pointer",
            color: activeTab === item.id ? colors.primary : colors.textMuted,
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
        </div>
      ))}
      <div
        onClick={onLogout}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 4, cursor: "pointer", color: colors.coral,
        }}
      >
        <span style={{ fontSize: 20 }}>🚪</span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>Logout</span>
      </div>
    </div>
  );
}

// ================= ADD COURSE MODAL =================

function AddCourseModal({ isOpen, onClose, onCourseCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
    duration: "",
    level: "",
    videoUrl: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "", description: "", price: "",
      instructor: "", duration: "", level: "",
      videoUrl: "", imageUrl: "",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const courseData = {
      title: formData.title,
      description: formData.description || null,
      price: parseFloat(formData.price),
      instructor: formData.instructor,
      duration: formData.duration || null,
      videoUrl: formData.videoUrl || null,
      imageUrl: formData.imageUrl || null,
      level: formData.level || null,
    };

    try {
      const response = await createAdminCourse(courseData);
      console.log("Course created successfully:", response.data);
      alert("Course created successfully!");
      if (onCourseCreated) await onCourseCreated();
      onClose();
      resetForm();
    } catch (err) {
      console.error("Error creating course:", err);
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: `1px solid ${colors.borderLight}`,
    borderRadius: 12, fontSize: 14, outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: colors.textPrimary, marginBottom: 6,
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)",
    }} onClick={handleClose}>
      <div style={{
        backgroundColor: colors.surface, borderRadius: 24,
        width: "90%", maxWidth: 600, maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${colors.borderLight}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>➕ Add New Course</h2>
            <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: 0 }}>
              Fill in the details below to create a new course
            </p>
          </div>
          <button onClick={handleClose} style={{
            background: "transparent", border: "none",
            fontSize: 24, cursor: "pointer", color: colors.textMuted,
            padding: 4, borderRadius: 8,
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {error && (
            <div style={{
              background: colors.coralSoft, color: colors.coral,
              padding: "12px", borderRadius: 12, fontSize: 13, marginBottom: 20,
            }}>⚠️ {error}</div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Course Title *</label>
            <input
              type="text" name="title" value={formData.title}
              onChange={handleChange} required
              placeholder="e.g., Advanced JavaScript"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description" value={formData.description}
              onChange={handleChange} rows={3}
              placeholder="Brief description of the course..."
              style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Price ($) *</label>
              <input
                type="number" name="price" value={formData.price}
                onChange={handleChange} required step="0.01" placeholder="0.00"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Instructor *</label>
              <input
                type="text" name="instructor" value={formData.instructor}
                onChange={handleChange} required placeholder="e.g., John Doe"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Duration</label>
              <select
                name="duration" value={formData.duration} onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: colors.surface, cursor: "pointer" }}
              >
                <option value="">Select duration</option>
                <option value="1-2 hours">1–2 hours</option>
                <option value="3-5 hours">3–5 hours</option>
                <option value="6-10 hours">6–10 hours</option>
                <option value="10-20 hours">10–20 hours</option>
                <option value="20+ hours">20+ hours</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Level</label>
              <select
                name="level" value={formData.level} onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: colors.surface, cursor: "pointer" }}
              >
                <option value="">Select level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Video URL</label>
            <input
              type="url" name="videoUrl" value={formData.videoUrl}
              onChange={handleChange} placeholder="https://youtube.com/..."
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Image URL</label>
            <input
              type="url" name="imageUrl" value={formData.imageUrl}
              onChange={handleChange} placeholder="https://example.com/image.jpg"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8 }}>
            <button type="button" onClick={handleClose} style={{
              padding: "10px 20px", borderRadius: 40, fontSize: 13, fontWeight: 500,
              background: "transparent", border: `1px solid ${colors.borderLight}`,
              color: colors.textSecondary, cursor: "pointer",
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              padding: "10px 24px", borderRadius: 40, fontSize: 13, fontWeight: 600,
              background: colors.gradPrimary, border: "none", color: "#fff",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}>{loading ? "Creating..." : "Create Course"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ================= MAIN COMPONENT =================

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);

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
    const timer = setInterval(() => setCurrentTime(getCurrentTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all students (without search)
  const fetchAllStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllStudents();
      setStudents(response.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Search students by name
  const searchStudents = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await searchUsersByName(name);
      setStudents(response.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.response?.data?.message || "Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
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
    setError(null);
    try {
      const response = await getAdminCoursesSimple();
      setCourses(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      await fetchAllStudents();
    } else {
      await searchStudents(value);
    }
  };

  // Tab change effect
  useEffect(() => {
    setSearchTerm("");
    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else if (activeTab === "courses") {
      fetchCourses();
    } else if (activeTab === "students") {
      fetchAllStudents();
    }
  }, [activeTab]);

  const handleUpdateRole = (studentId, currentRole) => {
    alert(`Edit role for user ${studentId}\nCurrent role: ${currentRole}\nThis feature requires updateUserRole API endpoint.`);
  };

  const handleToggleStatus = (studentId, currentStatus) => {
    alert(`Toggle status for user ${studentId}\nCurrent status: ${currentStatus}\nThis feature requires updateUserStatus API endpoint.`);
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
      </div>
    );

    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
              gap: isMobile ? 12 : 20, marginBottom: 24,
            }}>
              {kpis.map((k, i) => <KpiCard key={i} {...k} loading={loading} />)}
            </div>
            <div style={{
              background: colors.surface, border: `1px solid ${colors.borderLight}`,
              borderRadius: 16, padding: isMobile ? 20 : 30, textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
              <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, marginBottom: 12 }}>
                Welcome to Admin Dashboard
              </h2>
              <p style={{ color: colors.textSecondary, fontSize: 14 }}>
                Manage your courses, track student progress, and monitor your learning platform
              </p>
            </div>
          </>
        );

      case "courses":
        return (
          <div style={{
            background: colors.surface, border: `1px solid ${colors.borderLight}`,
            borderRadius: 16, padding: isMobile ? 16 : 20,
          }}>
            <div style={{
              display: "flex", flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center",
              gap: isMobile ? 12 : 0, marginBottom: 20,
            }}>
              <div>
                <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700 }}>🌐 All Courses</h2>
                <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                  Total {courses.length} courses available
                </p>
              </div>
              <button
                onClick={() => setIsAddCourseModalOpen(true)}
                style={{
                  background: colors.primary, color: "#fff", border: "none",
                  padding: "8px 16px", borderRadius: 40, fontSize: 13,
                  fontWeight: 500, cursor: "pointer",
                }}
              >+ New Course</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>ID</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Course Name</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Instructor</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Price</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length > 0 ? (
                    courses.map((c) => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{c.id}</td>
                        <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>{c.title}</td>
                        <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{c.instructor || "—"}</td>
                        <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>${c.price}</td>
                        <td style={{ padding: "12px 0" }}><Badge status={c.status || "PUBLISHED"} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                        No courses available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "students":
        return (
          <div style={{
            background: colors.surface, border: `1px solid ${colors.borderLight}`,
            borderRadius: 16, padding: isMobile ? 16 : 20,
          }}>
            <div style={{
              display: "flex", flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center",
              gap: isMobile ? 12 : 0, marginBottom: 20,
            }}>
              <div>
                <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700 }}>👨‍🎓 All Students</h2>
                <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                  Total {students.length} students found
                </p>
              </div>
              <input
                type="text"
                placeholder="Search users by name..."
                value={searchTerm}
                onChange={handleSearch}
                style={{
                  padding: "8px 14px",
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 40,
                  fontSize: 13,
                  width: isMobile ? "100%" : 240,
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>ID</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Name</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Email</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Role</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Status</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((s) => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{s.id}</td>
                        <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                        <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{s.email}</td>
                        <td style={{ padding: "12px 0" }}><Badge status={s.role || "STUDENT"} /></td>
                        <td style={{ padding: "12px 0" }}><Badge status={s.status || "ACTIVE"} /></td>
                        <td style={{ padding: "12px 0" }}>
                          <button
                            onClick={() => handleUpdateRole(s.id, s.role)}
                            style={{
                              padding: "4px 10px", fontSize: 11, borderRadius: 6,
                              border: `1px solid ${colors.borderLight}`,
                              background: colors.surface, cursor: "pointer", marginRight: 8,
                            }}
                          >Edit Role</button>
                          <button
                            onClick={() => handleToggleStatus(s.id, s.status)}
                            style={{
                              padding: "4px 10px", fontSize: 11, borderRadius: 6,
                              border: `1px solid ${colors.borderLight}`,
                              background: s.status === "ACTIVE" ? colors.coralSoft : colors.tealSoft,
                              color: s.status === "ACTIVE" ? colors.coral : colors.teal,
                              cursor: "pointer",
                            }}
                          >{s.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                        {searchTerm ? `No students found matching "${searchTerm}"` : "No students found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: colors.bgBase,
      fontFamily: "'Inter', -apple-system, sans-serif",
      paddingBottom: isMobile ? 70 : 0,
    }}>
      {!isMobile && (
        <nav style={{
          width: 260, background: colors.surface,
          borderRight: `1px solid ${colors.borderLight}`,
          display: "flex", flexDirection: "column",
          padding: "28px 0", position: "sticky",
          top: 0, height: "100vh", overflowY: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", marginBottom: 32 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: colors.gradPrimary,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "#fff",
            }}>⚡</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>INFOCAMPUS</div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>ADMIN</div>
            </div>
          </div>

          {navItems.map((item) => (
            <NavItem
              key={item.id} {...item}
              badge={item.id === "courses" ? courses.length : item.id === "students" ? students.length : 0}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}

          <div style={{ flex: 1 }} />
          <div style={{ padding: "0 8px 20px 8px" }}>
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "12px 16px", borderRadius: 12,
                fontSize: 14, fontWeight: 600, color: colors.coral,
                background: colors.coralSoft, border: "none", cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18 }}>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      )}

      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          background: colors.surface, borderBottom: `1px solid ${colors.borderLight}`,
          padding: "12px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          zIndex: 99,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: colors.gradPrimary,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#fff",
            }}>⚡</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>INFOCAMPUS</div>
              <div style={{ fontSize: 9, color: colors.textMuted }}>ADMIN DASHBOARD</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, textAlign: "right" }}>
            <div style={{ fontWeight: 600, color: colors.primary }}>{currentTime}</div>
            <div>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
          </div>
        </div>
      )}

      <main style={{
        flex: 1, padding: isMobile ? "70px 16px 20px" : "32px 40px", overflowY: "auto",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 0, marginBottom: isMobile ? 20 : 28,
        }}>
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

      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
      )}

      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onCourseCreated={fetchCourses}
      />
    </div>
  );
}