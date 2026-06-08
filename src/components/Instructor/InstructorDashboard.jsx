import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

// ================= COLORS =================
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

// ================= LOADING SPINNER =================
function LoadingSpinner() {
  return (
    <div style={{ textAlign: "center", padding: "60px" }}>
      <div
        style={{
          width: 50,
          height: 50,
          border: `3px solid ${colors.borderLight}`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ================= BADGE =================
function Badge({ status }) {
  const map = {
    PUBLISHED: { bg: colors.tealSoft, color: colors.teal },
    DRAFT: { bg: "#F0F2F8", color: colors.textMuted },
    ACTIVE: { bg: colors.tealSoft, color: colors.teal },
    INACTIVE: { bg: colors.coralSoft, color: colors.coral },
    PENDING: { bg: colors.amberSoft, color: colors.amber },
    APPROVED: { bg: colors.tealSoft, color: colors.teal },
    REJECTED: { bg: colors.coralSoft, color: colors.coral },
    Beginner: { bg: colors.primarySoft, color: colors.primary },
    Intermediate: { bg: colors.amberSoft, color: colors.amber },
    Advanced: { bg: colors.coralSoft, color: colors.coral },
  };

  const style = map[status] || { bg: "#F0F2F8", color: colors.textMuted };

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "3px 10px",
        borderRadius: 50,
        fontSize: 10.5,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
}

// ================= KPI CARD =================
function KpiCard({ label, value, iconBg, icon, loading }) {
  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: 16,
        padding: 16,
        border: `1px solid ${colors.borderLight}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
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
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>
        {loading ? "..." : value}
      </div>
    </div>
  );
}

// ================= DATE TIME WIDGET =================
function DateTimeWidget({ isMobile, currentTime }) {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 10 : 14,
        background: colors.surface,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 14,
        padding: isMobile ? "10px 12px" : "12px 18px",
        width: isMobile ? "100%" : "auto",
        maxWidth: isMobile ? "100%" : "320px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: isMobile ? 38 : 46,
          height: isMobile ? 38 : 46,
          borderRadius: 12,
          background: colors.primarySoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isMobile ? 18 : 22,
          flexShrink: 0,
        }}
      >
        📅
      </div>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            color: colors.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentDate}
        </div>
        <div
          style={{
            fontSize: isMobile ? 11 : 13,
            color: colors.primary,
            fontWeight: 600,
            marginTop: 2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          🕐 {currentTime}
        </div>
      </div>
    </div>
  );
}

// ================= COURSES TAB =================
function CoursesTab({ courses, isMobile, setSelectedCourse, setIsEditCourseModalOpen, setIsAddCourseModalOpen, handleDeleteCourse }) {
  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: 16,
      padding: isMobile ? 16 : 20,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>🌐 My Courses</h2>
          <p style={{ fontSize: 12, color: colors.textMuted }}>
            Total {courses.length} courses you're teaching
          </p>
        </div>
        <button
          onClick={() => setIsAddCourseModalOpen(true)}
          style={{
            background: colors.primary,
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: 40,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          + New Course
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, background: colors.bgBase }}>
              <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Course Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Students</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Price</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Level</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, idx) => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${colors.borderLight}`, background: idx % 2 === 0 ? colors.surface : colors.bgBase }}>
                <td style={{ padding: "12px" }}>#{c.id}</td>
                <td style={{ padding: "12px", fontWeight: 500 }}>{c.title || "Untitled"}</td>
                <td style={{ padding: "12px", color: colors.textSecondary }}>{c.studentCount || 0}</td>
                <td style={{ padding: "12px", color: colors.teal, fontWeight: 600 }}>${c.price || "0"}</td>
                <td style={{ padding: "12px" }}><Badge status={c.status || "DRAFT"} /></td>
                <td style={{ padding: "12px" }}><Badge status={c.level || "Beginner"} /></td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => {
                      setSelectedCourse(c);
                      setIsEditCourseModalOpen(true);
                    }}
                    style={{
                      padding: "5px 12px",
                      marginRight: 8,
                      borderRadius: 6,
                      border: `1px solid ${colors.borderLight}`,
                      background: colors.surface,
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(c.id, c.title)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: `1px solid ${colors.borderLight}`,
                      background: colors.surface,
                      color: colors.coral,
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
            No courses yet. Click "New Course" to get started!
          </div>
        )}
      </div>
    </div>
  );
}

// ================= STUDENTS TAB =================
function StudentsTab({ students, searchTerm, handleSearchChange, isMobile }) {
  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: 16,
      padding: isMobile ? 16 : 20,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>👨‍🎓 My Students</h2>
          <p style={{ fontSize: 12, color: colors.textMuted }}>
            Total {students.length} students enrolled in your courses
          </p>
        </div>
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            padding: "8px 14px",
            borderRadius: 40,
            border: `1px solid ${colors.borderLight}`,
            background: colors.surface,
            width: isMobile ? "100%" : 220,
            outline: "none",
          }}
        />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, background: colors.bgBase }}>
              <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Student Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Enrolled Courses</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Progress</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${colors.borderLight}`, background: idx % 2 === 0 ? colors.surface : colors.bgBase }}>
                <td style={{ padding: "12px" }}>#{s.id}</td>
                <td style={{ padding: "12px", fontWeight: 500 }}>{s.name || `${s.firstName} ${s.lastName}`}</td>
                <td style={{ padding: "12px", color: colors.textSecondary }}>{s.email}</td>
                <td style={{ padding: "12px" }}>{s.enrolledCourses || 0}</td>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: colors.borderLight, borderRadius: 3, width: 80 }}>
                      <div style={{ width: `${s.progress || 0}%`, height: 6, background: colors.teal, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: colors.textMuted }}>{s.progress || 0}%</span>
                  </div>
                </td>
                <td style={{ padding: "12px" }}><Badge status={s.status || "ACTIVE"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
            No students enrolled in your courses yet.
          </div>
        )}
      </div>
    </div>
  );
}

// ================= ANALYTICS TAB =================
function AnalyticsTab({ stats, isMobile }) {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    enrollments: [12, 19, 15, 25, 22, 30],
    revenue: [500, 750, 620, 980, 850, 1200]
  };

  const maxEnrollment = Math.max(...chartData.enrollments);
  const maxRevenue = Math.max(...chartData.revenue);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Stats Overview */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: 16,
      }}>
        <KpiCard label="Total Students" value={stats?.totalStudents || 0} iconBg={colors.primarySoft} icon="👨‍🎓" />
        <KpiCard label="Total Courses" value={stats?.totalCourses || 0} iconBg={colors.tealSoft} icon="🌐" />
        <KpiCard label="Total Revenue" value={`$${stats?.totalRevenue || 0}`} iconBg={colors.amberSoft} icon="💰" />
      </div>

      {/* Chart - Enrollments */}
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 16,
        padding: 20,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>📈 Monthly Enrollments</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
          {chartData.enrollments.map((value, idx) => (
            <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: isMobile ? 30 : 40,
                height: `${(value / maxEnrollment) * 160}px`,
                background: colors.primary,
                borderRadius: 8,
                transition: "height 0.3s ease",
              }} />
              <span style={{ fontSize: 11, color: colors.textMuted }}>{chartData.labels[idx]}</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart - Revenue */}
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 16,
        padding: 20,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>💰 Monthly Revenue ($)</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
          {chartData.revenue.map((value, idx) => (
            <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{
                width: isMobile ? 30 : 40,
                height: `${(value / maxRevenue) * 160}px`,
                background: colors.teal,
                borderRadius: 8,
                transition: "height 0.3s ease",
              }} />
              <span style={{ fontSize: 11, color: colors.textMuted }}>{chartData.labels[idx]}</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>${value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================= DASHBOARD TAB =================
function DashboardTab({ kpis, loading, isMobile }) {
  const recentActivities = [
    { id: 1, action: "New student enrolled in 'React Basics'", time: "2 hours ago", type: "enrollment" },
    { id: 2, action: "Course 'Advanced JavaScript' was published", time: "1 day ago", type: "course" },
    { id: 3, action: "5 students completed 'Python for Beginners'", time: "2 days ago", type: "completion" },
    { id: 4, action: "New comment on 'Web Design Fundamentals'", time: "3 days ago", type: "comment" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
        gap: 16,
      }}>
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} loading={loading} />
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 16,
        padding: 20,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🕐 Recent Activity</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recentActivities.map(activity => (
            <div key={activity.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: `1px solid ${colors.borderLight}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>
                  {activity.type === "enrollment" && "📝"}
                  {activity.type === "course" && "📚"}
                  {activity.type === "completion" && "🎉"}
                  {activity.type === "comment" && "💬"}
                </span>
                <span style={{ fontSize: 13, color: colors.textPrimary }}>{activity.action}</span>
              </div>
              <span style={{ fontSize: 11, color: colors.textMuted }}>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome Banner */}
      <div style={{
        background: colors.gradPrimary,
        borderRadius: 16,
        padding: 20,
        color: "white",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>🎓 Welcome to Instructor Dashboard</h3>
            <p style={{ fontSize: 13, opacity: 0.9 }}>Manage your courses, track student progress, and monitor your earnings from one place.</p>
          </div>
          <div style={{ fontSize: 40 }}>👨‍🏫</div>
        </div>
      </div>
    </div>
  );
}

// ================= MOBILE BOTTOM NAV =================
function MobileBottomNav({ activeTab, onTabChange, onLogout }) {
  const items = [
    { icon: "📊", label: "Dashboard", id: "dashboard" },
    { icon: "🌐", label: "Courses", id: "courses" },
    { icon: "👨‍🎓", label: "Students", id: "students" },
    { icon: "📈", label: "Analytics", id: "analytics" },
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: colors.surface,
      borderTop: `1px solid ${colors.borderLight}`,
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 12px",
      zIndex: 99,
    }}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: "transparent",
            border: "none",
            padding: "8px 0",
            borderRadius: 12,
            cursor: "pointer",
            color: activeTab === item.id ? colors.primary : colors.textMuted,
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
        </button>
      ))}
      <button
        onClick={onLogout}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          background: "transparent",
          border: "none",
          padding: "8px 0",
          borderRadius: 12,
          cursor: "pointer",
          color: colors.coral,
        }}
      >
        <span style={{ fontSize: 20 }}>🚪</span>
        <span style={{ fontSize: 10, fontWeight: 500 }}>Logout</span>
      </button>
    </div>
  );
}

// ================= NAV ITEM =================
function NavItem({ icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "12px 20px",
        marginBottom: 4,
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        background: active ? colors.primarySoft : "transparent",
        color: active ? colors.primary : colors.textSecondary,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{
          background: active ? colors.primary : colors.borderLight,
          color: active ? "white" : colors.textMuted,
          padding: "2px 8px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ================= ADD COURSE MODAL =================
function AddCourseModal({ isOpen, onClose, onCourseCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    level: "Beginner",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Swal.fire({
        title: "Success!",
        text: "Course created successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      if (onCourseCreated) await onCourseCreated();
      onClose();
      setFormData({ title: "", price: "", level: "Beginner", description: "" });
    } catch (error) {
      Swal.fire({ title: "Error!", text: "Failed to create course", icon: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: colors.surface,
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 500,
        maxHeight: "90vh",
        overflow: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>➕ Create New Course</h2>
        <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>Fill in the details to add a new course</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Course Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderLight}`, outline: "none" }}
              placeholder="e.g., React Masterclass"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Price ($)</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderLight}`, outline: "none" }}
              placeholder="0"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderLight}`, outline: "none" }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderLight}`, outline: "none", minHeight: 80 }}
              placeholder="Course description..."
            />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 20px", borderRadius: 40, border: `1px solid ${colors.borderLight}`, background: "transparent", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: "8px 20px", borderRadius: 40, background: colors.primary, color: "white", border: "none", cursor: "pointer" }}>{submitting ? "Creating..." : "Create Course"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ================= EDIT COURSE MODAL =================
function EditCourseModal({ isOpen, onClose, course, onCourseUpdated }) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    level: "Beginner",
    status: "DRAFT",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        price: course.price || "",
        level: course.level || "Beginner",
        status: course.status || "DRAFT",
        description: course.description || "",
      });
    }
  }, [course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Swal.fire({ title: "Success!", text: "Course updated successfully", icon: "success", timer: 2000, showConfirmButton: false });
      if (onCourseUpdated) await onCourseUpdated();
      onClose();
    } catch (error) {
      Swal.fire({ title: "Error!", text: "Failed to update course", icon: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: colors.surface,
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 500,
        maxHeight: "90vh",
        overflow: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>✏️ Edit Course</h2>
        <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>Update your course information</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Course Title</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderLight}`, outline: "none" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Price ($)</label>
            <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderLight}`, outline: "none" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Level</label>
            <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderLight}`, outline: "none" }}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderLight}`, outline: "none" }}>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderLight}`, outline: "none", minHeight: 80 }} />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 20px", borderRadius: 40, border: `1px solid ${colors.borderLight}`, background: "transparent", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: "8px 20px", borderRadius: 40, background: colors.primary, color: "white", border: "none", cursor: "pointer" }}>{submitting ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ================= MAIN INSTRUCTOR DASHBOARD =================
export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Mock data - replace with actual API calls
  const [dashboardStats, setDashboardStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data fetching
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDashboardStats({
        totalStudents: 156,
        totalCourses: 8,
        totalRevenue: 12450,
        avgRating: 4.8,
      });
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCourses([
        { id: 1, title: "React Basics", price: 49, status: "PUBLISHED", level: "Beginner", studentCount: 45, description: "Learn React from scratch" },
        { id: 2, title: "Advanced JavaScript", price: 79, status: "PUBLISHED", level: "Advanced", studentCount: 32, description: "Master JavaScript concepts" },
        { id: 3, title: "Python for Beginners", price: 39, status: "DRAFT", level: "Beginner", studentCount: 0, description: "Introduction to Python" },
        { id: 4, title: "Web Design Fundamentals", price: 59, status: "PUBLISHED", level: "Intermediate", studentCount: 28, description: "Learn HTML, CSS, and design principles" },
        { id: 5, title: "Node.js Backend", price: 89, status: "DRAFT", level: "Advanced", studentCount: 0, description: "Build REST APIs with Node.js" },
      ]);
    } catch (err) {
      console.error("Failed to load courses", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudents([
        { id: 1, name: "John Doe", email: "john@example.com", enrolledCourses: 2, progress: 75, status: "ACTIVE" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", enrolledCourses: 1, progress: 45, status: "ACTIVE" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com", enrolledCourses: 3, progress: 90, status: "ACTIVE" },
        { id: 4, name: "Sarah Williams", email: "sarah@example.com", enrolledCourses: 2, progress: 30, status: "INACTIVE" },
        { id: 5, name: "David Brown", email: "david@example.com", enrolledCourses: 1, progress: 60, status: "ACTIVE" },
      ]);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

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
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCourses(courses.filter(c => c.id !== courseId));
        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ title: 'Failed!', text: 'Failed to delete course', icon: 'error' });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.replace("/login");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Implement search logic as needed
  };

  useEffect(() => {
    if (activeTab === "dashboard") fetchDashboardStats();
    else if (activeTab === "courses") fetchCourses();
    else if (activeTab === "students") fetchStudents();
  }, [activeTab]);

  const kpis = dashboardStats ? [
    { label: "Total Students", value: dashboardStats.totalStudents?.toLocaleString() || "0", iconBg: colors.primarySoft, icon: "👨‍🎓" },
    { label: "Total Courses", value: dashboardStats.totalCourses?.toString() || "0", iconBg: colors.tealSoft, icon: "🌐" },
    { label: "Total Revenue", value: `$${dashboardStats.totalRevenue?.toLocaleString() || "0"}`, iconBg: colors.amberSoft, icon: "💰" },
    { label: "Avg Rating", value: `${dashboardStats.avgRating || "0"} ⭐`, iconBg: colors.coralSoft, icon: "⭐" },
  ] : [];

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;

    switch (activeTab) {
      case "dashboard":
        return <DashboardTab kpis={kpis} loading={loading} isMobile={isMobile} />;
      case "courses":
        return (
          <CoursesTab
            courses={courses}
            isMobile={isMobile}
            setSelectedCourse={setSelectedCourse}
            setIsEditCourseModalOpen={setIsEditCourseModalOpen}
            setIsAddCourseModalOpen={setIsAddCourseModalOpen}
            handleDeleteCourse={handleDeleteCourse}
          />
        );
      case "students":
        return (
          <StudentsTab
            students={students}
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            isMobile={isMobile}
          />
        );
      case "analytics":
        return <AnalyticsTab stats={dashboardStats} isMobile={isMobile} />;
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
              <div style={{ fontSize: 10, color: colors.textMuted }}>INSTRUCTOR</div>
            </div>
          </div>

          {[
            { icon: "📊", label: "Dashboard", id: "dashboard" },
            { icon: "🌐", label: "Courses", id: "courses" },
            { icon: "👨‍🎓", label: "Students", id: "students" },
            { icon: "📈", label: "Analytics", id: "analytics" },
          ].map((item) => (
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
              <div style={{ fontSize: 9, color: colors.textMuted }}>INSTRUCTOR</div>
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
              {activeTab === "dashboard" && "Instructor Dashboard"}
              {activeTab === "courses" && "My Courses"}
              {activeTab === "students" && "My Students"}
              {activeTab === "analytics" && "Analytics"}
            </h1>
            <p style={{ color: colors.textSecondary, fontSize: isMobile ? 12 : 14 }}>
              {activeTab === "dashboard" && "Welcome back! Track your teaching performance"}
              {activeTab === "courses" && "Manage all your courses from one place"}
              {activeTab === "students" && "View and manage students enrolled in your courses"}
              {activeTab === "analytics" && "Monitor your platform performance and earnings"}
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
    </div>
  );
}