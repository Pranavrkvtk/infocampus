import { useState } from "react";

// ==================== MOCK DATA (Premium Design) ====================
const MOCK_COURSES = [
  {
    id: 1, title: "Getting Started", category: "ccna",
    tag: "Odoo Tutorials", duration: "5h 48m", steps: 30,
    rating: 4.5, members: 167098, lastUpdate: "03/12/2026",
    image: "https://picsum.photos/id/1/400/220",
    lessons: [
      { id: 1, title: "Create an Odoo Database", xp: 40, preview: true },
      { id: 2, title: "Navigate in Odoo", xp: 40, preview: true },
      { id: 3, title: "Google Calendar Sync", xp: 80, preview: true },
      { id: 4, title: "Outlook Calendar Sync", xp: 40, preview: true },
      { id: 5, title: "Filters and Views", xp: 40, preview: true },
      { id: 6, title: "Multi-Company Basics", xp: 40, preview: true },
      { id: 7, title: "Multi-Company Transactions", xp: 40, preview: false },
      { id: 8, title: "Reporting Overview", xp: 40, preview: false },
    ],
    reviews: 415,
    description: "Start your journey with the fundamentals. Covers database setup, navigation, calendar sync, and multi-company operations.",
  },
  {
    id: 2, title: "CRM", category: "ccnp",
    tag: "Odoo Tutorials", duration: "2h 40m", steps: 22,
    rating: 4.7, members: 89234, lastUpdate: "01/10/2026",
    image: "https://picsum.photos/id/20/400/220",
    lessons: [
      { id: 1, title: "CRM Overview", xp: 40, preview: true },
      { id: 2, title: "Creating Leads", xp: 40, preview: true },
      { id: 3, title: "Pipeline Management", xp: 80, preview: true },
      { id: 4, title: "Activity Scheduling", xp: 40, preview: false },
    ],
    reviews: 210,
    description: "Master customer relationship management: leads, pipelines, activities and reporting.",
  },
  {
    id: 3, title: "Website", category: "security",
    tag: "Odoo Tutorials", duration: "1h 10m", steps: 12,
    rating: 4.3, members: 42000, lastUpdate: "02/05/2026",
    image: "https://picsum.photos/id/48/400/220",
    lessons: [
      { id: 1, title: "Website Builder Intro", xp: 40, preview: true },
      { id: 2, title: "Adding Pages", xp: 40, preview: true },
      { id: 3, title: "eCommerce Basics", xp: 80, preview: false },
    ],
    reviews: 98,
    description: "Build and customize beautiful websites with drag-and-drop. Includes eCommerce and SEO basics.",
  },
  {
    id: 4, title: "Accounting and Invoicing", category: "ccie",
    tag: "Odoo Tutorials", duration: "10h 4m", steps: 40,
    rating: 4.8, members: 210000, lastUpdate: "03/01/2026",
    image: "https://picsum.photos/id/60/400/220",
    lessons: [
      { id: 1, title: "Chart of Accounts", xp: 40, preview: true },
      { id: 2, title: "Customer Invoices", xp: 40, preview: true },
      { id: 3, title: "Vendor Bills", xp: 80, preview: true },
      { id: 4, title: "Bank Reconciliation", xp: 40, preview: false },
      { id: 5, title: "Financial Reports", xp: 40, preview: false },
    ],
    reviews: 580,
    description: "Full accounting workflow: invoices, bills, reconciliation and financial reporting.",
  },
  {
    id: 5, title: "Inventory Management", category: "linux",
    tag: "Odoo Tutorials", duration: "3h 20m", steps: 18,
    rating: 4.6, members: 63000, lastUpdate: "12/20/2025",
    image: "https://picsum.photos/id/76/400/220",
    lessons: [
      { id: 1, title: "Warehouse Setup", xp: 40, preview: true },
      { id: 2, title: "Product Tracking", xp: 40, preview: true },
      { id: 3, title: "Routes & Rules", xp: 80, preview: false },
    ],
    reviews: 145,
    description: "Configure warehouses, track products, and manage routes with powerful inventory rules.",
  },
  {
    id: 6, title: "Project Management", category: "ccna",
    tag: "Odoo Tutorials", duration: "2h 55m", steps: 16,
    rating: 4.4, members: 37000, lastUpdate: "11/15/2025",
    image: "https://picsum.photos/id/119/400/220",
    lessons: [
      { id: 1, title: "Creating Projects", xp: 40, preview: true },
      { id: 2, title: "Task Management", xp: 40, preview: true },
      { id: 3, title: "Gantt & Kanban Views", xp: 80, preview: false },
    ],
    reviews: 87,
    description: "Plan, track and deliver projects on time using Gantt, Kanban and powerful task automation.",
  },
];

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

// ==================== COURSE CARD ====================
function CourseCard({ course, onViewCourse, onEnroll, enrolled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onViewCourse(course)}
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #faf9ff 100%)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: hovered 
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.1)" 
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        cursor: "pointer",
        border: "1px solid rgba(139, 92, 246, 0.1)",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden", height: "200px" }}>
        <img
          src={course.image}
          alt={course.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hovered ? "scale(1.1)" : "scale(1)" }}
          onError={e => e.target.src = `https://picsum.photos/id/${course.id * 10}/400/220`}
        />
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          padding: "4px 12px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#fbbf24"
        }}>
          ★ {course.rating}
        </div>
      </div>
      <div style={{ padding: "24px" }}>
        <div style={{
          display: "inline-block", background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
          color: "#fff",
          borderRadius: "8px", padding: "4px 12px", fontSize: "11px",
          fontWeight: 600, marginBottom: "12px", letterSpacing: "0.5px"
        }}>
          {course.tag}
        </div>
        <h3 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: 700, color: "#1f2937", lineHeight: 1.3 }}>
          {course.title}
        </h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#6b7280", fontSize: "13px" }}>
          <span>⏱ {course.duration}</span>
          <span>📋 {course.steps} lessons</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onEnroll(course); }}
          style={{
            marginTop: "20px", width: "100%", padding: "12px",
            background: enrolled 
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
              : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "12px", fontSize: "14px", fontWeight: 600,
            cursor: "pointer", transition: "all 0.3s ease",
            boxShadow: hovered ? "0 10px 15px -3px rgba(139, 92, 246, 0.3)" : "none",
          }}
          onMouseEnter={e => { if (!enrolled) e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          {enrolled ? "✅ Enrolled" : "Enroll Now →"}
        </button>
      </div>
    </div>
  );
}

// ==================== COURSE DETAIL PAGE ====================
function CourseDetailPage({ course, onBack, onEnroll, enrolled }) {
  const [activeTab, setActiveTab] = useState("course");
  const tabs = ["course", `Reviews (${course.reviews})`, "Forum"];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #8b5cf6" }}>
        <span style={{ color: "#fff", fontSize: "14px" }}>
          <span style={{ cursor: "pointer", opacity: 0.8, transition: "opacity 0.3s" }} onClick={onBack}>Courses</span>
          {" / "}
          <span style={{ fontWeight: 700, color: "#8b5cf6" }}>{course.title}</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(139, 92, 246, 0.1)", borderRadius: "12px", padding: "6px 14px", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
          <input placeholder="Search courses" style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", width: "160px" }} />
          <span style={{ color: "#8b5cf6" }}>🔍</span>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #2d1b69 0%, #4c1d95 50%, #7c3aed 100%)", padding: "60px 40px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(139, 92, 246, 0.1)", top: "-200px", right: "-100px" }} />
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "48px", alignItems: "flex-end", position: "relative", zIndex: 2 }}>
          <div style={{ width: "220px", height: "220px", flexShrink: 0, background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <img src={course.image} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, paddingBottom: "20px" }}>
            <h1 style={{ color: "#fff", fontSize: "52px", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1, textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>{course.title}</h1>
            <Stars rating={course.rating} />
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "32px auto 0", display: "flex", gap: "0" }}>
          {tabs.map(tab => {
            const key = tab.toLowerCase().startsWith("reviews") ? "reviews" : tab.toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "14px 32px", border: "none", cursor: "pointer",
                  background: activeTab === key ? "#fff" : "transparent",
                  color: activeTab === key ? "#7c3aed" : "rgba(255,255,255,0.8)",
                  fontWeight: 700, fontSize: "15px",
                  borderRadius: "12px 12px 0 0",
                  transition: "all 0.3s ease",
                  backdropFilter: activeTab === key ? "none" : "blur(10px)",
                }}
              >
                {key === "course" && "📚 "}{tab}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px", display: "grid", gridTemplateColumns: "280px 1fr", gap: "40px" }}>
        <div>
          <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
            <button
              onClick={() => onEnroll(course)}
              style={{
                width: "100%", padding: "18px", background: enrolled 
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                  : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                color: "#fff", border: "none",
                fontWeight: 700, fontSize: "16px", cursor: "pointer",
                letterSpacing: "0.5px",
              }}
            >
              {enrolled ? "✅ Enrolled" : "Join this Course"}
            </button>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Last Update", value: course.lastUpdate, icon: "🔄" },
                { label: "Completion Time", value: course.duration, icon: "⏱️" },
                { label: "Members", value: course.members.toLocaleString(), icon: "👥" },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{icon} {label}</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>{value}</span>
                  <div style={{ height: "1px", background: "linear-gradient(90deg, #e5e7eb 0%, #e5e7eb 100%)", marginTop: "8px" }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {activeTab === "course" && (
            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
              <div style={{ padding: "20px 28px", borderBottom: "2px solid #f0f0f0", background: "linear-gradient(135deg, #faf9ff 0%, #fff 100%)" }}>
                <span style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", color: "#fff", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 600 }}>
                  {course.tag}
                </span>
              </div>
              <div style={{ padding: "20px 28px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: "18px", color: "#1f2937" }}>Course Curriculum</span>
                <span style={{ fontSize: "13px", color: "#8b5cf6", fontWeight: 600 }}>{course.lessons.length} Lessons · {course.duration}</span>
              </div>
              {course.lessons.map((lesson, i) => (
                <div key={lesson.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 28px",
                  borderBottom: i < course.lessons.length - 1 ? "1px solid #f3f4f6" : "none",
                  transition: "background 0.3s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ color: "#8b5cf6", fontSize: "18px", fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: "15px", color: "#374151", fontWeight: 500 }}>{lesson.title}</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {lesson.preview && (
                      <span style={{ background: "#10b981", color: "#fff", borderRadius: "6px", padding: "4px 12px", fontSize: "11px", fontWeight: 600 }}>
                        Preview
                      </span>
                    )}
                    <span style={{ background: "#fef3c7", color: "#d97706", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>
                      🚩 {lesson.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "reviews" && (
            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "40px" }}>
              <h2 style={{ color: "#1f2937", marginTop: 0, fontSize: "28px", fontWeight: 700 }}>Student Reviews</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", padding: "20px", background: "#f9fafb", borderRadius: "16px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "48px", fontWeight: 800, color: "#8b5cf6" }}>{course.rating}</div>
                  <Stars rating={course.rating} />
                  <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>Based on {course.reviews} reviews</div>
                </div>
              </div>
              {[
                { name: "Sarah Johnson", rating: 5, text: "Absolutely phenomenal course! The instructor breaks down complex topics into digestible chunks. Highly recommend!", avatar: "SJ" },
                { name: "Michael Chen", rating: 5, text: "Best investment in my career. The hands-on projects and real-world examples are invaluable.", avatar: "MC" },
                { name: "Emma Williams", rating: 4, text: "Great content and structure. Would love to see more advanced topics covered in future updates.", avatar: "EW" },
              ].map((review, i) => (
                <div key={i} style={{ marginTop: "24px", padding: "24px", background: "#faf9ff", borderRadius: "16px", border: "1px solid #e9d5ff" }}>
                  <div style={{ display: "flex", gap: "16px", marginBottom: "12px", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff" }}>
                      {review.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1f2937", fontSize: "16px" }}>{review.name}</div>
                      <Stars rating={review.rating} />
                    </div>
                  </div>
                  <p style={{ margin: 0, color: "#4b5563", fontSize: "15px", lineHeight: 1.6 }}>{review.text}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === "forum" && (
            <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>💬</div>
              <h2 style={{ color: "#1f2937", marginBottom: "12px" }}>Discussion Forum</h2>
              <p style={{ color: "#6b7280", marginBottom: "32px" }}>Connect with 50,000+ learners. Ask questions, share insights, and grow together.</p>
              <button style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", color: "#fff", border: "none", padding: "14px 32px", borderRadius: "12px", fontWeight: 600, cursor: "pointer" }}>
                Start a Discussion →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MY COURSES PAGE ====================
function MyCoursesPage({ enrolledIds, courses, onViewCourse, onBack }) {
  const myCourses = courses.filter(c => enrolledIds.includes(c.id));
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)" }}>
      <div style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #8b5cf6" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "18px" }}>📖 My Learning Journey</span>
        <button onClick={onBack} style={{ background: "rgba(139, 92, 246, 0.2)", border: "1px solid #8b5cf6", borderRadius: "10px", padding: "8px 20px", color: "#8b5cf6", cursor: "pointer", fontWeight: 600, transition: "all 0.3s" }}>← Explore More Courses</button>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 40px" }}>
        <h1 style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "36px", marginTop: 0, marginBottom: "40px", fontWeight: 800 }}>
          My Enrolled Courses
        </h1>
        {myCourses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ fontSize: "80px", marginBottom: "20px" }}>🎓</div>
            <p style={{ fontSize: "20px", color: "#6b7280", marginBottom: "24px" }}>Start your learning journey today!</p>
            <button onClick={onBack} style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px 32px", fontWeight: 600, cursor: "pointer" }}>
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
            {myCourses.map(course => (
              <div key={course.id} onClick={() => onViewCourse(course)} style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", transition: "transform 0.3s ease", border: "1px solid rgba(139, 92, 246, 0.1)" }}>
                <div style={{ position: "relative" }}>
                  <img src={course.image} alt={course.title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: "16px", right: "16px", background: "#10b981", color: "#fff", borderRadius: "12px", padding: "6px 14px", fontSize: "12px", fontWeight: 700 }}>
                    ✓ Enrolled
                  </div>
                </div>
                <div style={{ padding: "24px" }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: "20px", color: "#1f2937" }}>{course.title}</h3>
                  <div style={{ marginBottom: "12px" }}><Stars rating={course.rating} /></div>
                  <div style={{ color: "#6b7280", fontSize: "14px" }}>⏱ {course.duration} · 📋 {course.steps} lessons</div>
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

// ==================== MAIN COURSES LIST PAGE ====================
function CoursesListPage({ courses, onViewCourse, onEnroll, enrolledIds, onMyCoursesNav }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = courses.filter(c => {
    const matchCat = selectedCategory === "all" || c.category === selectedCategory;
    return matchCat ;
  });

  const featuredCourses = courses.slice(0, 3);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)" }}>
      {/* Premium Navbar */}
  

      {/* Premium Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        padding: "100px 48px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", top: "-300px", right: "-200px" }} />
        <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", bottom: "-250px", left: "-150px" }} />
        
        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 2 }}>
       
          <h1 style={{ color: "#fff", fontSize: "64px", fontWeight: 800, lineHeight: "1.1", marginBottom: "24px", letterSpacing: "-1px" }}>
            Master Cisco Networking<br />Build Your Dream Career
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px", lineHeight: "1.6", maxWidth: "700px", margin: "0 auto 40px" }}>
            Learn CCNA, CCNP, CCIE, Security, Linux and Network Automation through hands-on labs, video lessons, quizzes and real-world projects.
          </p>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => courses.length > 0 && onEnroll(courses[0])}
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "60px",
                padding: "16px 40px",
                fontWeight: 700,
                fontSize: "16px",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.4)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 25px 30px -5px rgba(139, 92, 246, 0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(139, 92, 246, 0.4)"; }}
            >
              🎓 Start Learning Free
            </button>
            <button
              onClick={onMyCoursesNav}
              style={{
                background: "transparent",
                border: "2px solid #8b5cf6",
                borderRadius: "60px",
                padding: "16px 40px",
                fontWeight: 700,
                fontSize: "16px",
                cursor: "pointer",
                color: "#fff",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)"; e.currentTarget.style.borderColor = "#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#8b5cf6"; }}
            >
              📖 View My Courses
            </button>
          </div>
        </div>
      </div>

      {/* Premium Stats */}
      <div style={{ background: "#fff", padding: "48px 48px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px", textAlign: "center", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
        {[
          { end: courses.length || 15, suffix: "+", label: "Expert Courses", icon: "📚" },
          { end: 50, suffix: "K+", label: "Active Students", icon: "👥" },
          { end: 2000, suffix: "+", label: "Practice Labs", icon: "💻" },
          { end: 4.9, suffix: "★", label: "Student Rating", icon: "⭐" },
        ].map(({ end, suffix, label, icon }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>{icon}</div>
            <h2 style={{ color: "#8b5cf6", margin: 0, fontSize: "40px", fontWeight: 800 }}>
              {end}{suffix}
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px", fontWeight: 500, marginTop: "8px" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Premium Category Filter */}
      <div style={{ padding: "32px 48px", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", maxWidth: "1000px", margin: "0 auto" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? `linear-gradient(135deg, ${cat.color} 0%, ${cat.color}cc 100%)` : "#f3f4f6",
                color: selectedCategory === cat.id ? "#fff" : "#374151",
                border: "none",
                borderRadius: "40px",
                padding: "12px 28px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                boxShadow: selectedCategory === cat.id ? `0 10px 15px -3px ${cat.color}40` : "none",
              }}
              onMouseEnter={e => { if (selectedCategory !== cat.id) e.currentTarget.style.background = "#e5e7eb"; }}
              onMouseLeave={e => { if (selectedCategory !== cat.id) e.currentTarget.style.background = "#f3f4f6"; }}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Courses Section */}
      {selectedCategory === "all" && featuredCourses.length > 0 && (
        <div style={{ padding: "64px 48px", background: "linear-gradient(135deg, #faf9ff 0%, #fff 100%)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ display: "inline-block", background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", width: "60px", height: "4px", borderRadius: "2px", marginBottom: "16px" }} />
              <h2 style={{ margin: 0, fontSize: "36px", fontWeight: 800, background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Featured Courses
              </h2>
              <p style={{ color: "#6b7280", marginTop: "12px" }}>Most popular courses chosen by our community</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
              {featuredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onViewCourse={onViewCourse}
                  onEnroll={onEnroll}
                  enrolled={enrolledIds.includes(course.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Courses Grid */}
      <div style={{ padding: "64px 48px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {selectedCategory !== "all" && (
            <div style={{ marginBottom: "40px", textAlign: "center" }}>
              <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#1f2937", marginBottom: "8px" }}>
                {CATEGORIES.find(c => c.id === selectedCategory)?.label} Courses
              </h2>
              <p style={{ color: "#6b7280" }}>{filtered.length} premium courses available</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "32px" }}>
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onViewCourse={onViewCourse}
                onEnroll={onEnroll}
                enrolled={enrolledIds.includes(course.id)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: "24px" }}>
              <p style={{ fontSize: "18px", color: "#6b7280" }}>No courses found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Premium CTA Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", padding: "80px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", top: "-200px", left: "10%" }} />
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", bottom: "-150px", right: "10%" }} />
        
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{ color: "#fff", fontSize: "42px", marginBottom: "20px", fontWeight: 800 }}>Ready to Accelerate Your Career?</h2>
          <p style={{ color: "#c4b5fd", fontSize: "18px", marginBottom: "40px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            Join thousands of successful network engineers who transformed their careers with our courses
          </p>
          <button
            onClick={() => courses.length > 0 && onEnroll(courses[0])}
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "60px",
              padding: "18px 48px",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            🎓 Start Your Journey Today
          </button>
        </div>
      </div>

      {/* Premium Footer */}
      <div style={{ background: "#111827", padding: "48px 48px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "32px" }}>
            <span style={{ fontSize: "32px" }}>🎓</span>
            <h3 style={{ color: "#fff", marginTop: "12px", fontSize: "20px" }}>Cisco Networking Academy</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>Empowering Network Engineers Worldwide</p>
          </div>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #374151, transparent)", margin: "24px 0" }} />
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>© 2025 Cisco Networking Academy — Excellence in Network Education</p>
        </div>
      </div>
    </div>
  );
}

// ==================== APP ROOT ====================
export default function CoursesPage({ isMobile, onBack }) {
  const [page, setPage] = useState("list");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses] = useState(MOCK_COURSES);
  const [enrolledIds, setEnrolledIds] = useState([]);

  const handleEnroll = async (course) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("❌ Please create a user first!");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/enrollments/enroll/${course.id}/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        alert(`✅ Enrolled in ${course.title}!`);
        setEnrolledIds(prev => [...prev, course.id]);
      } else {
        alert("Enrollment failed");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Failed to enroll");
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setPage("detail");
  };

  if (page === "detail" && selectedCourse) {
    return <CourseDetailPage course={selectedCourse} onBack={() => setPage("list")} onEnroll={handleEnroll} enrolled={enrolledIds.includes(selectedCourse.id)} />;
  }

  if (page === "mycourses") {
    return <MyCoursesPage enrolledIds={enrolledIds} courses={courses} onViewCourse={handleViewCourse} onBack={() => setPage("list")} />;
  }

  return <CoursesListPage courses={courses} onViewCourse={handleViewCourse} onEnroll={handleEnroll} enrolledIds={enrolledIds} onMyCoursesNav={() => setPage("mycourses")} />;
}