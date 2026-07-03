// src/components/DashboardTab.jsx
import React, { useState, useEffect } from "react";
import { colors } from "./AdminStyles";
import { getInstructorDashboardStats, getInstructorEnrollments } from "../../api/instructorApi";


function KpiCard({ label, value, iconBg, icon, loading }) {
  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: 16,
        padding: 20,
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
          width: 44,
          height: 44,
          borderRadius: 12,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary }}>
        {loading ? "..." : value}
      </div>
    </div>
  );
}

export default function DashboardTab({ kpis, loading, isMobile, onNavigate }) {
  const [recentActivities, setRecentActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch recent activities (enrollments)
  const fetchRecentActivities = async () => {
    setActivityLoading(true);
    setError(null);
    try {
      const response = await getInstructorEnrollments();
      const enrollments = response.data || [];
      
      // Transform enrollments into activity items
      const activities = enrollments
        .slice(0, 10) // Get only the 10 most recent
        .map(enrollment => {
          const studentName = enrollment.user?.name || "Unknown Student";
          const courseTitle = enrollment.course?.title || "Unknown Course";
          const status = enrollment.status || "ACTIVE";
          
          let action = "";
          let type = "";
          let icon = "";
          
          switch(status) {
            case "ACTIVE":
              action = `${studentName} enrolled in '${courseTitle}'`;
              type = "enrollment";
              icon = "📝";
              break;
            case "COMPLETED":
              action = `${studentName} completed '${courseTitle}'`;
              type = "completion";
              icon = "🎉";
              break;
            case "DROPPED":
              action = `${studentName} dropped '${courseTitle}'`;
              type = "dropped";
              icon = "⚠️";
              break;
            default:
              action = `${studentName} has '${status}' status in '${courseTitle}'`;
              type = "status";
              icon = "📊";
          }
          
          return {
            id: enrollment.id,
            action: action,
            time: enrollment.enrolledAt 
              ? timeAgo(new Date(enrollment.enrolledAt))
              : "Recently",
            type: type,
            icon: icon,
            student: studentName,
            course: courseTitle,
            status: status,
            progress: enrollment.progress || 0
          };
        });

      setRecentActivities(activities);
    } catch (err) {
      console.error("Error fetching recent activities:", err);
      setError("Failed to load recent activities");
      // Set fallback activities
      setRecentActivities([
        { id: 1, action: "No recent activities found", time: "", type: "info", icon: "ℹ️" }
      ]);
    } finally {
      setActivityLoading(false);
    }
  };

  // Helper function to format time ago
  const timeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  // Calculate stats from activities
  const stats = {
    totalEnrollments: recentActivities.filter(a => a.type === "enrollment").length,
    completions: recentActivities.filter(a => a.type === "completion").length,
    dropped: recentActivities.filter(a => a.type === "dropped").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} loading={loading} />
        ))}
      </div>

      {/* Quick Stats Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        <div style={{
          background: colors.surface,
          borderRadius: 12,
          padding: 16,
          border: `1px solid ${colors.borderLight}`,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>
            {stats.totalEnrollments}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>New Enrollments</div>
        </div>
        <div style={{
          background: colors.surface,
          borderRadius: 12,
          padding: 16,
          border: `1px solid ${colors.borderLight}`,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: colors.teal }}>
            {stats.completions}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>Completions</div>
        </div>
        <div style={{
          background: colors.surface,
          borderRadius: 12,
          padding: 16,
          border: `1px solid ${colors.borderLight}`,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: colors.coral }}>
            {stats.dropped}
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>Dropped</div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div
        style={{
          background: colors.gradPrimary,
          borderRadius: 16,
          padding: 24,
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
              🎓 Welcome to Instructor Dashboard
            </h3>
            <p style={{ fontSize: 14, opacity: 0.9 }}>
              Manage your courses, track student progress, and monitor your enrollments from one place.
            </p>
          </div>
          <div style={{ fontSize: 48 }}>👨‍🏫</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: 16,
          padding: 20,
        }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 16
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>
            🕐 Recent Activity
          </h3>
          <button
            onClick={fetchRecentActivities}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              border: `1px solid ${colors.borderLight}`,
              background: colors.surface,
              fontSize: 11,
              cursor: "pointer",
              color: colors.textSecondary,
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {activityLoading ? (
          <div style={{ textAlign: "center", padding: "20px", color: colors.textMuted }}>
            Loading activities...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "20px", color: colors.coral }}>
            ⚠️ {error}
          </div>
        ) : recentActivities.length === 0 || (recentActivities.length === 1 && recentActivities[0].type === "info") ? (
          <div style={{ textAlign: "center", padding: "20px", color: colors.textMuted }}>
            📭 No recent activities yet. Enrollments will appear here.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: `1px solid ${colors.borderLight}`,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (onNavigate && activity.course) {
                    // Navigate to students tab or course details
                    onNavigate("students");
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>
                    {activity.icon || "📝"}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, color: colors.textPrimary }}>
                      {activity.action}
                    </div>
                    {activity.progress !== undefined && activity.progress > 0 && (
                      <div style={{ 
                        fontSize: 11, 
                        color: colors.textMuted,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 2
                      }}>
                        Progress: 
                        <span style={{ 
                          fontWeight: 600,
                          color: activity.progress >= 80 ? colors.teal : 
                                 activity.progress >= 50 ? colors.amber : colors.coral
                        }}>
                          {activity.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: colors.textMuted }}>
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        )}

        {recentActivities.length > 5 && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              onClick={() => onNavigate && onNavigate("students")}
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                border: "none",
                background: colors.primarySoft,
                color: colors.primary,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View All Students →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}