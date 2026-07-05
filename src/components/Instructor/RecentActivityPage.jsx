// src/components/Instructor/RecentActivityPage.jsx
import React, { useState, useEffect } from "react";
import { colors } from "../Admin/AdminStyles";
import { getRecentActivity } from "../../api/instructorApi";

export default function RecentActivityPage({ onBack }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRecentActivity(50);
      console.log('API Response:', response); // Debug log
      setActivities(response.activities || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // ✅ Fixed: Match exact API type values
  const filteredActivities = activities.filter(activity => {
    if (filter === "all") return true;
    return activity.type === filter; // Exact match
  });

  // ✅ Fixed: Count activities by exact type
  const stats = {
    total: activities.length,
    enrollments: activities.filter(a => a.type === "ENROLLMENT").length,
    completions: activities.filter(a => a.type === "COMPLETION").length,
    updates: activities.filter(a => a.type === "COURSE_UPDATE").length,
    created: activities.filter(a => a.type === "COURSE_CREATED").length,
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case "ENROLLMENT": return "📚";
      case "COMPLETION": return "✅";
      case "COURSE_UPDATE": return "✏️";
      case "COURSE_CREATED": return "🎉";
      default: return "📌";
    }
  };

  const getActivityBg = (type) => {
    switch(type) {
      case "ENROLLMENT": return colors.primarySoft;
      case "COMPLETION": return colors.tealSoft;
      case "COURSE_UPDATE": return colors.amberSoft;
      case "COURSE_CREATED": return colors.purpleSoft;
      default: return colors.bgBase;
    }
  };

  const getActivityLabel = (type) => {
    switch(type) {
      case "ENROLLMENT": return "New Enrollment";
      case "COMPLETION": return "Completed";
      case "COURSE_UPDATE": return "Updated";
      case "COURSE_CREATED": return "New Course";
      default: return "Activity";
    }
  };

  // ✅ Fixed: Filter options with exact type values
  const filterOptions = [
    { value: "all", label: "All Activities", count: stats.total },
    { value: "ENROLLMENT", label: "Enrollments", count: stats.enrollments },
    { value: "COMPLETION", label: "Completions", count: stats.completions },
    { value: "COURSE_UPDATE", label: "Updates", count: stats.updates },
    { value: "COURSE_CREATED", label: "New Courses", count: stats.created },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: colors.primary,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary }}>
            🕐 Recent Activity
          </h1>
          <p style={{ fontSize: 14, color: colors.textMuted }}>
            Complete history of all activities across your courses
          </p>
        </div>
        <button
          onClick={fetchActivities}
          style={{
            padding: "8px 16px",
            background: colors.primary,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
        marginBottom: 24,
      }}>
        {filterOptions.map(opt => (
          <div
            key={opt.value}
            style={{
              background: colors.surface,
              borderRadius: 12,
              padding: "12px 16px",
              border: `1px solid ${filter === opt.value ? colors.primary : colors.borderLight}`,
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
            }}
            onClick={() => setFilter(opt.value)}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary }}>
              {opt.count}
            </div>
            <div style={{ fontSize: 12, color: filter === opt.value ? colors.primary : colors.textMuted }}>
              {opt.label}
            </div>
          </div>
        ))}
      </div>

      {/* Activities List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
          <div style={{ 
            border: `4px solid ${colors.borderLight}`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
            margin: "0 auto 12px"
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Loading activities...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px", color: colors.error }}>
          ⚠️ {error}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <p style={{ fontSize: 16 }}>No activities found</p>
          <p style={{ fontSize: 13 }}>Try changing the filter or check back later</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredActivities.map((activity, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                padding: "16px 20px",
                background: colors.surface,
                borderRadius: 12,
                border: `1px solid ${colors.borderLight}`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.borderLight;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: getActivityBg(activity.type),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}>
                {getActivityIcon(activity.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: colors.textPrimary }}>
                      {activity.message}
                    </div>
                    {activity.studentName && (
                      <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                        👤 {activity.studentName}
                      </div>
                    )}
                    {activity.courseTitle && (
                      <div style={{ fontSize: 12, color: colors.primary, marginTop: 2 }}>
                        📖 {activity.courseTitle}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ fontSize: 11, color: colors.textMuted }}>
                      {formatTime(activity.timestamp)}
                    </span>
                    <span style={{
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: 10,
                      fontWeight: 600,
                      background: getActivityBg(activity.type),
                      color: activity.type === "ENROLLMENT" ? colors.primary :
                             activity.type === "COMPLETION" ? colors.teal :
                             activity.type === "COURSE_UPDATE" ? "#b45309" :
                             activity.type === "COURSE_CREATED" ? "#7c3aed" : colors.textMuted,
                    }}>
                      {getActivityLabel(activity.type)}
                    </span>
                  </div>
                </div>
                {activity.status && (
                  <div style={{ marginTop: 4 }}>
                    <span style={{
                      padding: "1px 8px",
                      borderRadius: "12px",
                      fontSize: 9,
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {!loading && !error && (
        <div style={{ textAlign: "center", marginTop: 24, color: colors.textMuted, fontSize: 12 }}>
          Showing {filteredActivities.length} of {activities.length} activities
        </div>
      )}
    </div>
  );
}