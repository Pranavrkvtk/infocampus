import { useState, useEffect, useCallback } from "react";
import {
  getCourses,
  getCourseById,
  enrollInCourse,
  getUserEnrollments,
} from "../api/courseApi"; // adjust path if needed

// ==================== CATEGORIES ====================
const CATEGORIES = [
  { id: "all", label: "All Courses", icon: "📚", color: "#6366f1" },
  { id: "ccna", label: "CCNA", icon: "🔰", color: "#10b981" },
  { id: "ccnp", label: "CCNP", icon: "⚡", color: "#f59e0b" },
  { id: "ccie", label: "CCIE", icon: "🏆", color: "#ef4444" },
  { id: "security", label: "Security", icon: "🔒", color: "#8b5cf6" },
  { id: "linux", label: "Linux", icon: "🐧", color: "#06b6d4" },
];

// ==================== STAR RATING ====================
function Stars({ rating }) {
  return (
    <span style={{ color: "#fbbf24", fontSize: "18px", letterSpacing: "2px" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ opacity: i <= Math.floor(rating) ? 1 : i - rating < 1 ? 0.5 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

// ==================== LOADING SPINNER ====================
function Spinner({ size = 40 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
      <div style={{
        width: size, height: size,
        border: `3px solid #e5e7eb`,
        borderTop: `3px solid #8b5cf6`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ==================== ERROR BANNER ====================
function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px",
      padding: "16px 24px", margin: "24px 0",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap",
    }}>
      <span style={{ color: "#dc2626", fontWeight: 500 }}>⚠️ {message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px",
          padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px",
        }}>Retry</button>
      )}
    </div>
  );
}

// ==================== COURSE CARD ====================
function CourseCard({ course, onViewCourse, onEnroll, enrolled, enrolling }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onViewCourse(course)}
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #faf9ff 100%)",
        borderRadius: "clamp(16px, 5vw, 20px)",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(139,92,246,0.1)"
          : "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        cursor: "pointer",
        border: "1px solid rgba(139,92,246,0.1)",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden", height: "clamp(160px, 30vw, 200px)" }}>
        <img
          src={course.image || course.imageUrl || `https://picsum.photos/id/${(course.id ?? 1) * 10}/400/220`}
          alt={course.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hovered ? "scale(1.1)" : "scale(1)" }}
          onError={e => { e.target.src = `https://picsum.photos/id/${(course.id ?? 1) * 10}/400/220`; }}
        />
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
          borderRadius: "12px", padding: "4px 12px",
          fontSize: "12px", fontWeight: 600, color: "#fbbf24",
        }}>
          ★ {course.rating ?? "N/A"}
        </div>
      </div>

      <div style={{ padding: "clamp(16px, 4vw, 24px)" }}>
        <div style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
          color: "#fff", borderRadius: "8px", padding: "4px 12px",
          fontSize: "11px", fontWeight: 600, marginBottom: "12px", letterSpacing: "0.5px",
        }}>
          {course.tag || "Course"}
        </div>

        <h3 style={{ margin: "0 0 12px", fontSize: "clamp(16px, 4vw, 18px)", fontWeight: 700, color: "#1f2937", lineHeight: 1.3 }}>
          {course.title}
        </h3>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#6b7280", fontSize: "clamp(12px, 3vw, 13px)" }}>
          <span>⏱ {course.duration || "—"}</span>
          <span>📋 {course.steps ?? course.lessons?.length ?? 0} lessons</span>
        </div>

        <button
          onClick={e => { e.stopPropagation(); onEnroll(course); }}
          disabled={enrolling || enrolled}
          style={{
            marginTop: "20px", width: "100%", padding: "clamp(10px, 3vw, 12px)",
            background: enrolled
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
              : enrolling
                ? "#d1d5db"
                : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            color: enrolled || enrolling ? (enrolled ? "#fff" : "#6b7280") : "#fff",
            border: "none", borderRadius: "12px",
            fontSize: "clamp(13px, 3.5vw, 14px)", fontWeight: 600,
            cursor: enrolled || enrolling ? "default" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: hovered && !enrolled ? "0 10px 15px -3px rgba(139,92,246,0.3)" : "none",
          }}
        >
          {enrolling ? "Enrolling…" : enrolled ? "✅ Enrolled" : "Enroll Now →"}
        </button>
      </div>
    </div>
  );
}

// ==================== COURSE DETAIL PAGE ====================
function CourseDetailPage({ course, onBack, onEnroll, enrolled, enrolling, isMobile }) {
  const [detail, setDetail] = useState(course);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch full course detail if lessons not already loaded
  const hasLessons = Boolean(detail.lessons?.length);
  useEffect(() => {
    if (hasLessons || !course.id) return;

    setLoading(true);
    getCourseById(course.id)
      .then(res => setDetail(res.data))
      .catch(() => setError("Failed to load course details."))
      .finally(() => setLoading(false));
  }, [course.id, hasLessons]);

  const lessons = detail.lessons ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", padding: isMobile ? "12px 20px" : "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "2px solid #8b5cf6" }}>
        <span style={{ color: "#fff", fontSize: isMobile ? "12px" : "14px" }}>
          <span style={{ cursor: "pointer", opacity: 0.8 }} onClick={onBack}>Courses</span>
          {" / "}
          <span style={{ fontWeight: 700, color: "#8b5cf6" }}>
            {isMobile ? detail.title?.substring(0, 20) + "…" : detail.title}
          </span>
        </span>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #2d1b69 0%, #4c1d95 50%, #7c3aed 100%)", padding: isMobile ? "40px 20px 0" : "60px 40px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: isMobile ? "300px" : "500px", height: isMobile ? "300px" : "500px", borderRadius: "50%", background: "rgba(139,92,246,0.1)", top: "-200px", right: "-100px" }} />
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", gap: isMobile ? "24px" : "48px", alignItems: "flex-end", flexWrap: "wrap", position: "relative", zIndex: 2 }}>
          <div style={{ width: isMobile ? "120px" : "220px", height: isMobile ? "120px" : "220px", flexShrink: 0, borderRadius: "clamp(12px, 4vw, 20px)", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <img src={detail.image || detail.imageUrl || `https://picsum.photos/id/${(detail.id ?? 1) * 10}/400/220`} alt={detail.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, paddingBottom: "20px" }}>
            <h1 style={{ color: "#fff", fontSize: isMobile ? "32px" : "52px", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>{detail.title}</h1>
            {detail.rating && <Stars rating={detail.rating} />}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "20px" : "40px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "24px" : "40px" }}>
        {/* Sidebar */}
        <div style={{ width: isMobile ? "100%" : "280px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
            <button
              onClick={() => onEnroll(detail)}
              disabled={enrolled || enrolling}
              style={{
                width: "100%", padding: isMobile ? "14px" : "18px",
                background: enrolled
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : enrolling ? "#d1d5db"
                    : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                color: enrolling ? "#6b7280" : "#fff",
                border: "none", fontWeight: 700,
                fontSize: isMobile ? "14px" : "16px",
                cursor: enrolled || enrolling ? "default" : "pointer",
                letterSpacing: "0.5px",
              }}
            >
              {enrolling ? "Enrolling…" : enrolled ? "✅ Enrolled" : "Join this Course"}
            </button>

            <div style={{ padding: isMobile ? "20px" : "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Last Update", value: detail.lastUpdate || detail.updatedAt?.split("T")[0] || "—", icon: "🔄" },
                { label: "Completion Time", value: detail.duration || "—", icon: "⏱️" },
                { label: "Members", value: detail.members?.toLocaleString() ?? "—", icon: "👥" },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{icon} {label}</span>
                  <span style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: 700, color: "#1f2937" }}>{value}</span>
                  <div style={{ height: "1px", background: "#e5e7eb", marginTop: "8px" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div style={{ flex: 1 }}>
          {loading ? <Spinner /> : error ? <ErrorBanner message={error} /> : (
            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <div style={{ padding: isMobile ? "16px 20px" : "20px 28px", borderBottom: "2px solid #f0f0f0", background: "linear-gradient(135deg, #faf9ff 0%, #fff 100%)" }}>
                <span style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", color: "#fff", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 600 }}>
                  {detail.tag || "Course"}
                </span>
              </div>
              <div style={{ padding: isMobile ? "16px 20px" : "20px 28px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <span style={{ fontWeight: 700, fontSize: isMobile ? "16px" : "18px", color: "#1f2937" }}>Course Curriculum</span>
                <span style={{ fontSize: "13px", color: "#8b5cf6", fontWeight: 600 }}>{lessons.length} Lessons · {detail.duration || "—"}</span>
              </div>

              {lessons.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>No lessons available yet.</div>
              ) : lessons.map((lesson, i) => (
                <div key={lesson.id ?? i}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: isMobile ? "14px 20px" : "16px 28px", flexWrap: "wrap", gap: "12px",
                    borderBottom: i < lessons.length - 1 ? "1px solid #f3f4f6" : "none",
                    transition: "background 0.3s ease",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                    <span style={{ color: "#8b5cf6", fontSize: "18px", fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: isMobile ? "13px" : "15px", color: "#374151", fontWeight: 500 }}>{lesson.title}</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    {lesson.preview && (
                      <span style={{ background: "#10b981", color: "#fff", borderRadius: "6px", padding: "4px 12px", fontSize: "11px", fontWeight: 600 }}>Preview</span>
                    )}
                    {lesson.xp && (
                      <span style={{ background: "#fef3c7", color: "#d97706", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>
                        🚩 {lesson.xp} XP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MY COURSES PAGE ====================
function MyCoursesPage({ enrolledIds, courses, onViewCourse, onBack, isMobile, loading, error, onRetry }) {
  const myCourses = courses.filter(c => enrolledIds.includes(c.id));

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)" }}>
      <div style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", padding: isMobile ? "12px 20px" : "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "2px solid #8b5cf6" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: isMobile ? "16px" : "18px" }}>📖 My Learning Journey</span>
        <button onClick={onBack} style={{ background: "rgba(139,92,246,0.2)", border: "1px solid #8b5cf6", borderRadius: "10px", padding: "8px 16px", color: "#8b5cf6", cursor: "pointer", fontWeight: 600, fontSize: isMobile ? "12px" : "14px" }}>
          ← Explore More Courses
        </button>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "24px 20px" : "48px 40px" }}>
        <h1 style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: isMobile ? "28px" : "36px", marginTop: 0, marginBottom: isMobile ? "24px" : "40px", fontWeight: 800 }}>
          My Enrolled Courses
        </h1>

        {loading ? <Spinner /> : error ? <ErrorBanner message={error} onRetry={onRetry} /> : myCourses.length === 0 ? (
          <div style={{ textAlign: "center", padding: isMobile ? "60px 20px" : "80px 0", background: "#fff", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: isMobile ? "60px" : "80px", marginBottom: "20px" }}>🎓</div>
            <p style={{ fontSize: isMobile ? "18px" : "20px", color: "#6b7280", marginBottom: "24px" }}>Start your learning journey today!</p>
            <button onClick={onBack} style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", color: "#fff", border: "none", borderRadius: "12px", padding: isMobile ? "12px 24px" : "14px 32px", fontWeight: 600, cursor: "pointer", fontSize: isMobile ? "14px" : "16px" }}>
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: isMobile ? "20px" : "32px" }}>
            {myCourses.map(course => (
              <div key={course.id} onClick={() => onViewCourse(course)} style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", transition: "transform 0.3s ease", border: "1px solid rgba(139,92,246,0.1)" }}>
                <div style={{ position: "relative" }}>
                  <img src={course.image || course.imageUrl || `https://picsum.photos/id/${(course.id ?? 1) * 10}/400/220`} alt={course.title} style={{ width: "100%", height: isMobile ? "160px" : "180px", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: "16px", right: "16px", background: "#10b981", color: "#fff", borderRadius: "12px", padding: "6px 14px", fontSize: "12px", fontWeight: 700 }}>✓ Enrolled</div>
                </div>
                <div style={{ padding: isMobile ? "20px" : "24px" }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: isMobile ? "18px" : "20px", color: "#1f2937" }}>{course.title}</h3>
                  {course.rating && <div style={{ marginBottom: "12px" }}><Stars rating={course.rating} /></div>}
                  <div style={{ color: "#6b7280", fontSize: "14px" }}>⏱ {course.duration || "—"} · 📋 {course.steps ?? course.lessons?.length ?? 0} lessons</div>
                  <div style={{ marginTop: "16px", height: "4px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: "60%", height: "100%", background: "linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)", borderRadius: "4px" }} />
                  </div>
                  <div style={{ marginTop: "12px", fontSize: "13px", color: "#8b5cf6", fontWeight: 600 }}>60% Complete</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COURSES LIST PAGE ====================
function CoursesListPage({ courses, onViewCourse, onEnroll, enrolledIds, enrollingIds, onMyCoursesNav, isMobile, loading, error, onRetry }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = courses.filter(c =>
    selectedCategory === "all" || c.category === selectedCategory
  );

  const featuredCourses = courses.slice(0, 3);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)", padding: isMobile ? "60px 20px" : "100px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: isMobile ? "300px" : "600px", height: isMobile ? "300px" : "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", top: "-150px", right: "-100px" }} />
        <div style={{ position: "absolute", width: isMobile ? "250px" : "500px", height: isMobile ? "250px" : "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", bottom: "-125px", left: "-75px" }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <h1 style={{ color: "#fff", fontSize: isMobile ? "36px" : "64px", fontWeight: 800, lineHeight: "1.2", marginBottom: "20px", letterSpacing: "-0.5px" }}>
            Master Cisco Networking<br />Build Your Dream Career
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: isMobile ? "14px" : "18px", lineHeight: "1.6", maxWidth: "700px", margin: "0 auto 30px" }}>
            Learn CCNA, CCNP, CCIE, Security, Linux and Network Automation through hands-on labs, video lessons, quizzes and real-world projects.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => courses.length > 0 && onEnroll(courses[0])}
              style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", color: "#fff", border: "none", borderRadius: "60px", padding: isMobile ? "12px 24px" : "16px 40px", fontWeight: 700, fontSize: isMobile ? "14px" : "16px", cursor: "pointer", boxShadow: "0 20px 25px -5px rgba(139,92,246,0.4)" }}
            >
              🎓 Start Learning Free
            </button>
            <button
              onClick={onMyCoursesNav}
              style={{ background: "transparent", border: "2px solid #8b5cf6", borderRadius: "60px", padding: isMobile ? "12px 24px" : "16px 40px", fontWeight: 700, fontSize: isMobile ? "14px" : "16px", cursor: "pointer", color: "#fff" }}
            >
              📖 View My Courses
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ padding: isMobile ? "20px 16px" : "32px 48px", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", maxWidth: "1000px", margin: "0 auto" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}cc 100%)` : "#f3f4f6",
                color: selectedCategory === cat.id ? "#fff" : "#374151",
                border: "none", borderRadius: "40px",
                padding: isMobile ? "8px 16px" : "12px 28px",
                fontWeight: 600, fontSize: isMobile ? "12px" : "14px",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.3s ease",
                boxShadow: selectedCategory === cat.id ? `0 10px 15px -3px ${cat.color}40` : "none",
              }}
            >
              <span>{cat.icon}</span>
              <span>{isMobile && cat.label === "All Courses" ? "All" : cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {selectedCategory === "all" && featuredCourses.length > 0 && (
        <div style={{ padding: isMobile ? "40px 20px" : "64px 48px", background: "linear-gradient(135deg, #faf9ff 0%, #fff 100%)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? "32px" : "48px" }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? "28px" : "36px", fontWeight: 800, background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Featured Courses
              </h2>
              <p style={{ color: "#6b7280", marginTop: "12px", fontSize: isMobile ? "14px" : "16px" }}>Most popular courses chosen by our community</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "20px" : "32px" }}>
              {featuredCourses.map(course => (
                <CourseCard key={course.id} course={course} onViewCourse={onViewCourse} onEnroll={onEnroll}
                  enrolled={enrolledIds.includes(course.id)} enrolling={enrollingIds.has(course.id)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Courses */}
      <div style={{ padding: isMobile ? "40px 20px" : "64px 48px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {loading ? <Spinner /> : error ? <ErrorBanner message={error} onRetry={onRetry} /> : (
            <>
              {selectedCategory !== "all" && (
                <div style={{ marginBottom: "32px", textAlign: "center" }}>
                  <h2 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, color: "#1f2937", marginBottom: "8px" }}>
                    {CATEGORIES.find(c => c.id === selectedCategory)?.label} Courses
                  </h2>
                  <p style={{ color: "#6b7280", fontSize: isMobile ? "14px" : "16px" }}>{filtered.length} premium courses available</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))", gap: isMobile ? "20px" : "32px" }}>
                {filtered.map(course => (
                  <CourseCard key={course.id} course={course} onViewCourse={onViewCourse} onEnroll={onEnroll}
                    enrolled={enrolledIds.includes(course.id)} enrolling={enrollingIds.has(course.id)} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "24px" }}>
                  <p style={{ fontSize: "18px", color: "#6b7280" }}>No courses found in this category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", padding: isMobile ? "60px 20px" : "80px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{ color: "#fff", fontSize: isMobile ? "28px" : "42px", marginBottom: "16px", fontWeight: 800 }}>Ready to Accelerate Your Career?</h2>
          <p style={{ color: "#c4b5fd", fontSize: isMobile ? "14px" : "18px", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
            Join thousands of successful network engineers who transformed their careers with our courses
          </p>
          <button
            onClick={() => courses.length > 0 && onEnroll(courses[0])}
            style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", color: "#fff", border: "none", borderRadius: "60px", padding: isMobile ? "14px 32px" : "18px 48px", fontSize: isMobile ? "16px" : "18px", fontWeight: 700, cursor: "pointer" }}
          >
            🎓 Start Your Journey Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#111827", padding: isMobile ? "40px 20px" : "60px 48px", color: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr", gap: "40px" }}>
          <div>
            <h2 style={{ fontSize: isMobile ? "24px" : "32px", marginBottom: "16px" }}>Test Your Skills</h2>
            <p style={{ color: "#d1d5db", lineHeight: "1.8", marginBottom: "24px" }}>
              Solve the challenge and earn up to a <strong style={{ color: "#8b5cf6" }}>10% scholarship</strong> for our programs!
            </p>
            <button style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 28px", fontWeight: 700, cursor: "pointer" }}>
              Test Your Skills Now →
            </button>
          </div>
          <div>
            <h3 style={{ marginBottom: "20px", fontSize: "20px" }}>Contact</h3>
            <p style={{ color: "#d1d5db", marginBottom: "10px" }}>📞 +91-9037555777</p>
            <p style={{ color: "#d1d5db", marginBottom: "10px" }}>📞 +91-8792633595</p>
            <p style={{ color: "#d1d5db", marginBottom: "20px" }}>✉️ info@infocampus.in</p>
            <h4 style={{ color: "#8b5cf6", marginBottom: "10px" }}>Follow Us</h4>
            <div style={{ display: "flex", gap: "12px", fontSize: "24px" }}>
              <span>📘</span><span>📷</span><span>💼</span><span>▶️</span>
            </div>
          </div>
          <div>
            <h3 style={{ marginBottom: "20px", fontSize: "20px" }}>Locations</h3>
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ color: "#8b5cf6", marginBottom: "8px" }}>📍 Calicut</h4>
              <p style={{ color: "#d1d5db", lineHeight: "1.7", fontSize: "14px" }}>6th Floor, Markaz Complex Mavoor Road, Opposite Private Bus Stand, Calicut - 04</p>
            </div>
            <div>
              <h4 style={{ color: "#8b5cf6", marginBottom: "8px" }}>📍 Bengaluru</h4>
              <p style={{ color: "#d1d5db", lineHeight: "1.7", fontSize: "14px" }}>No.50, 1st Floor, JKN Arcade, 1st Cross Road, 27th Main, Old Madiwala, BTM 1st Stage, Bengaluru - 560068</p>
            </div>
          </div>
        </div>
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #374151, transparent)", margin: "40px 0 20px" }} />
        <p style={{ textAlign: "center", color: "#9ca3af", margin: 0, fontSize: "14px" }}>
          © 2026 INFO CAMPUS Learning Platform. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

// ==================== APP ROOT ====================
export default function CoursesPage() {
  const [page, setPage] = useState("list");
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Courses data
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);

  // Enrolled course IDs (numbers)
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollmentsError, setEnrollmentsError] = useState(null);

  // Track which courseIds are mid-enrollment (for loading state on buttons)
  const [enrollingIds, setEnrollingIds] = useState(new Set());

  // Responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ---- Fetch all courses ----
  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const res = await getCourses();
      // API may return { data: [...] } or directly an array
      const list = Array.isArray(res.data) ? res.data : res.data?.content ?? res.data?.courses ?? [];
      setCourses(list);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setCoursesError("Failed to load courses. Please try again.");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // ---- Fetch enrolled courses for current user ----
  const fetchEnrollments = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return; // not logged in, skip

    setEnrollmentsLoading(true);
    setEnrollmentsError(null);
    try {
      const res = await getUserEnrollments(userId);
      // Backend returns List<Enrollment> — each has a nested course: { id, title, ... }
      const data = Array.isArray(res.data) ? res.data : [];
      const ids = data.map(e => e.course?.id).filter(Boolean);
      setEnrolledIds(ids);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
      setEnrollmentsError("Failed to load your enrollments.");
    } finally {
      setEnrollmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, [fetchCourses, fetchEnrollments]);

  // ---- Enroll in a course ----
  const handleEnroll = useCallback(async (course) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("❌ Please log in first.");
      return;
    }
    if (enrolledIds.includes(course.id)) return; // already enrolled
    if (enrollingIds.has(course.id)) return;      // already in progress

    setEnrollingIds(prev => new Set(prev).add(course.id));
    try {
      await enrollInCourse(course.id);
      setEnrolledIds(prev => [...prev, course.id]);
      alert(`✅ Enrolled in "${course.title}"!`);
    } catch (err) {
      console.error("Enrollment error:", err);
      // Backend returns a plain string on error (e.g. "Already enrolled in this course")
      const msg = typeof err?.response?.data === "string"
        ? err.response.data
        : err?.response?.data?.message ?? err.message ?? "Enrollment failed.";
      alert(`❌ ${msg}`);
    } finally {
      setEnrollingIds(prev => { const s = new Set(prev); s.delete(course.id); return s; });
    }
  }, [enrolledIds, enrollingIds]);

  const handleViewCourse = useCallback((course) => {
    setSelectedCourse(course);
    setPage("detail");
  }, []);

  // ---- Routing ----
  if (page === "detail" && selectedCourse) {
    return (
      <CourseDetailPage
        course={selectedCourse}
        onBack={() => setPage("list")}
        onEnroll={handleEnroll}
        enrolled={enrolledIds.includes(selectedCourse.id)}
        enrolling={enrollingIds.has(selectedCourse.id)}
        isMobile={isMobile}
      />
    );
  }

  if (page === "mycourses") {
    return (
      <MyCoursesPage
        enrolledIds={enrolledIds}
        courses={courses}
        onViewCourse={handleViewCourse}
        onBack={() => setPage("list")}
        isMobile={isMobile}
        loading={enrollmentsLoading}
        error={enrollmentsError}
        onRetry={fetchEnrollments}
      />
    );
  }

  return (
    <CoursesListPage
      courses={courses}
      onViewCourse={handleViewCourse}
      onEnroll={handleEnroll}
      enrolledIds={enrolledIds}
      enrollingIds={enrollingIds}
      onMyCoursesNav={() => setPage("mycourses")}
      isMobile={isMobile}
      loading={coursesLoading}
      error={coursesError}
      onRetry={fetchCourses}
    />
  );
}