import React, { useState, useEffect } from "react";
import {
  getDashboardStats,
  getAdminStudents,
  getAdminCoursesSimple
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
  { icon: "🌐", label: "Courses",   id: "courses" },
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
    PUBLISHED:    { bg: colors.tealSoft,    color: colors.teal },
    DRAFT:        { bg: "#F0F2F8",           color: colors.textMuted },
    ACTIVE:       { bg: colors.tealSoft,    color: colors.teal },
    PENDING:      { bg: colors.amberSoft,   color: colors.amber },
    INACTIVE:     { bg: "#F0F2F8",           color: colors.textMuted },
    Beginner:     { bg: colors.primarySoft, color: colors.primary },
    Intermediate: { bg: colors.amberSoft,   color: colors.amber },
    Advanced:     { bg: colors.coralSoft,   color: colors.coral },
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

// Live clock widget shown in the page header
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
      {/* Calendar block */}
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: colors.primarySoft,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>📅</div>

      <div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: colors.textPrimary,
          lineHeight: 1.3,
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

// ================= MAIN COMPONENT =================

export default function AdminDashboard() {
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [searchTerm, setSearchTerm]   = useState("");
  const [isMobile, setIsMobile]       = useState(window.innerWidth <= 768);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime()); // ← live clock

  const [dashboardStats, setDashboardStats] = useState(null);
  const [courses, setCourses]               = useState([]);
  const [students, setStudents]             = useState([]);

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

  const fetchDashboardStats = async () => {
    setLoading(true); setError(null);
    try {
      const response = await getDashboardStats();
      setDashboardStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    setLoading(true); setError(null);
    try {
      const response = await getAdminCoursesSimple();
      setCourses(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally { setLoading(false); }
  };

  const fetchStudents = async () => {
    setLoading(true); setError(null);
    try {
      const response = await getAdminStudents();
      setStudents(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "dashboard")     fetchDashboardStats();
    else if (activeTab === "courses")  fetchCourses();
    else if (activeTab === "students") fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.replace("/login");
  };

  const kpis = dashboardStats ? [
    { label: "Total Students",    value: dashboardStats.totalStudents?.toLocaleString()    || "0", iconBg: colors.primarySoft, icon: "👨‍🎓" },
    { label: "Total Courses",     value: dashboardStats.totalCourses?.toString()            || "0", iconBg: colors.tealSoft,    icon: "🌐"  },
    { label: "Total Enrollments", value: dashboardStats.totalEnrollments?.toLocaleString() || "0", iconBg: colors.amberSoft,   icon: "📚"  },
  ] : [];

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error)   return (
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
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", padding: "12px 20px", background: colors.primarySoft, borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: colors.primary }}>{dashboardStats?.totalStudents || 0}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>Active Students</div>
                </div>
                <div style={{ textAlign: "center", padding: "12px 20px", background: colors.tealSoft, borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: colors.teal }}>{dashboardStats?.totalCourses || 0}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>Active Courses</div>
                </div>
                <div style={{ textAlign: "center", padding: "12px 20px", background: colors.amberSoft, borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: colors.amber }}>{dashboardStats?.totalEnrollments || 0}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>Total Enrollments</div>
                </div>
              </div>
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
              <button style={{
                background: colors.primary, color: "#fff", border: "none",
                padding: "8px 16px", borderRadius: 40, fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>+ New Course</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    {["ID", "Course Name", "Instructor", "Price", "Status"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.length > 0
                    ? courses.map((c) => (
                        <tr key={c.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                          <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{c.id}</td>
                          <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>{c.title}</td>
                          <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{c.instructor || "—"}</td>
                          <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>${c.price}</td>
                          <td style={{ padding: "12px 0" }}><Badge status={c.status || "PUBLISHED"} /></td>
                        </tr>
                      ))
                    : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                            No courses available
                          </td>
                        </tr>
                      )
                  }
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
                  Total {students.length} students enrolled
                </p>
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 14px", border: `1px solid ${colors.borderLight}`,
                  borderRadius: 40, fontSize: 13,
                  width: isMobile ? "100%" : 240, outline: "none",
                }}
              />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    {["ID", "Name", "Email", "Status"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0
                    ? filteredStudents.map((s) => (
                        <tr key={s.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                          <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{s.id}</td>
                          <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                          <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{s.email}</td>
                          <td style={{ padding: "12px 0" }}><Badge status={s.status || "ACTIVE"} /></td>
                        </tr>
                      ))
                    : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                            No students found
                          </td>
                        </tr>
                      )
                  }
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
      {/* Desktop Sidebar */}
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

      {/* Mobile Header */}
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
          {/* Compact time in mobile header */}
          <div style={{ fontSize: 11, color: colors.textMuted, textAlign: "right" }}>
            <div style={{ fontWeight: 600, color: colors.primary }}>{currentTime}</div>
            <div>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        flex: 1, padding: isMobile ? "70px 16px 20px" : "32px 40px", overflowY: "auto",
      }}>
        {/* Page Header — title left, date/time widget right */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 0, marginBottom: isMobile ? 20 : 28,
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, marginBottom: 4 }}>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "courses"   && "Course Catalog"}
              {activeTab === "students"  && "Student Management"}
            </h1>
            <p style={{ color: colors.textSecondary, fontSize: isMobile ? 12 : 14 }}>
              {activeTab === "dashboard" && "Welcome back! Track your networking academy performance"}
              {activeTab === "courses"   && "Manage all your courses from one place"}
              {activeTab === "students"  && "View and manage all enrolled students"}
            </p>
          </div>

          {/* ── DATE / TIME WIDGET ── */}
          <DateTimeWidget isMobile={isMobile} currentTime={currentTime} />
        </div>

        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}