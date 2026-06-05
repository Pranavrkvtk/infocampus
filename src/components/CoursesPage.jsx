import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses } from "../api/courseApi";
// ==================== COUNTER COMPONENT ====================
function CountUp({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={elementRef}>{count.toLocaleString()}{suffix}</span>;
}

// ==================== NORMALIZE API COURSE ====================
const CARD_COLORS = ["#3abf94", "#e5a800", "#1d6b72", "#c8102e", "#7aa3c8", "#5b8dbf"];
const CARD_ICONS = ["🖥️", "🔰", "⚡", "🏆", "🔒", "🐧"];

function normalizeCourse(course, index) {
  let title = course.title;
  if (!title || title === null) {
    if (course.price && course.price > 0) {
      title = `Course (₹${course.price})`;
    } else {
      title = `Course #${course.id || index + 1}`;
    }
  }

  let instructor = course.instructor;
  if (!instructor || instructor === null) {
    if (course.description && course.description.includes("by ")) {
      const match = course.description.match(/by\s+([^,\s]+)/);
      instructor = match ? match[1] : "Staff";
    } else {
      instructor = "TBA";
    }
  }

  let duration = course.duration;
  if (!duration || duration === null) {
    duration = "Self-paced";
  }

  let priceDisplay = "Free";
  if (course.price != null && course.price > 0) {
    priceDisplay = `₹${course.price}`;
  }

  let imageUrl = course.imageUrl;
  if (!imageUrl || imageUrl === null) {
    imageUrl = `https://picsum.photos/id/${(course.id || index) % 100}/300/200`;
  }

  let description = course.description;
  if (!description || description === null || description === "null") {
    if (course.title && course.title !== "null") {
      description = `Master ${course.title} with hands-on labs, real-world projects, and expert instruction.`;
    } else {
      description = "Comprehensive networking course with practical labs and expert guidance.";
    }
  }

  return {
    ...course,
    title: title,
    description: description,
    duration: duration,
    instructor: instructor,
    price: priceDisplay,
    color: CARD_COLORS[index % CARD_COLORS.length],
    icon: CARD_ICONS[index % CARD_ICONS.length],
    imageUrl: imageUrl,
    category: getCategoryFromCourse(course, title)
  };
}

function getCategoryFromCourse(course, title) {
  const titleLower = (title || "").toLowerCase();
  const descLower = (course.description || "").toLowerCase();
  
  if (titleLower.includes("ccna") || descLower.includes("ccna")) return "ccna";
  if (titleLower.includes("ccnp") || descLower.includes("ccnp")) return "ccnp";
  if (titleLower.includes("ccie") || descLower.includes("ccie")) return "ccie";
  if (titleLower.includes("security") || descLower.includes("security")) return "security";
  if (titleLower.includes("linux") || descLower.includes("linux")) return "linux";
  return "all";
}

// ==================== COURSE CARD COMPONENT ====================
function CourseCard({ course, isMobile, hovered, onHover, onEnroll }) { // ✅ Changed from onEnrollNow to onEnroll
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnrollClick = async (e) => {
    e.stopPropagation();
    setIsEnrolling(true);
    await onEnroll(course);
    setIsEnrolling(false);
  };

  return (
    <div
      onMouseEnter={() => onHover(course.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.15)" : "0 4px 15px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        cursor: "pointer",
      }}
    >
      <img
        src={course.imageUrl}
        alt={course.title}
        style={{ width: "100%", height: "160px", objectFit: "cover" }}
        onError={(e) => {
          e.target.src = `https://picsum.photos/id/${(course.id || 1) % 100}/300/200`;
        }}
      />

      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: `${course.color}20`, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "28px", flexShrink: 0,
          }}>
            {course.icon}
          </div>
          <span style={{ fontWeight: 600, fontSize: "13px", color: "#555" }}>
            👨‍🏫 {course.instructor}
          </span>
        </div>

        <h3 style={{ margin: "0 0 10px", fontSize: isMobile ? "18px" : "20px", color: "#1a1a2e" }}>
          {course.title}
        </h3>

        <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
          {course.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          <span style={{ background: "#f0f0f0", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>
            ⏱ {course.duration}
          </span>
          <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
            {course.price}
          </span>
          {course.videoUrl && course.videoUrl !== "null" && (
            <a
              href={course.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ background: "#fce4ec", color: "#c62828", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}
            >
              🎥 Preview
            </a>
          )}
        </div>

        <button
          onClick={handleEnrollClick} // ✅ Changed to use handleEnrollClick
          disabled={isEnrolling}
          style={{
            width: "100%", 
            background: course.color, 
            color: "#fff",
            border: "none", 
            borderRadius: "10px", 
            padding: "14px",
            fontFamily: "'Trebuchet MS', sans-serif", 
            fontWeight: 600,
            cursor: isEnrolling ? "wait" : "pointer", 
            transition: "all 0.2s", 
            fontSize: "15px",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "8px",
            opacity: isEnrolling ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (!isEnrolling) e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={e => {
            if (!isEnrolling) e.currentTarget.style.opacity = "1";
          }}
        >
          <span>🎓</span> 
          {isEnrolling ? "Enrolling..." : "Enroll Now →"}
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN COURSES PAGE ====================
export default function CoursesPage({ isMobile, onBack }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", name: "All Courses", icon: "📚", color: "#3abf94" },
    { id: "ccna", name: "CCNA", icon: "🔰", color: "#e5a800" },
    { id: "ccnp", name: "CCNP", icon: "⚡", color: "#1d6b72" },
    { id: "ccie", name: "CCIE", icon: "🏆", color: "#c8102e" },
    { id: "security", name: "Security", icon: "🔒", color: "#7aa3c8" },
    { id: "linux", name: "Linux", icon: "🐧", color: "#5b8dbf" },
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await getCourses();
      console.log("API Response:", res.data);
      
      const validCourses = res.data.filter(c => c && (c.title !== null || c.description !== null));
      const normalized = validCourses.map((c, i) => normalizeCourse(c, i));
      setCourses(normalized);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };
const handleEnroll = async (course) => {
  try {
    const userId = localStorage.getItem("userId");
    
    // Check if user exists
    if (!userId) {
      alert("❌ Please create a user first!\n\nClick the 'Create Test User' button at the top of the page.");
      return;
    }
    
    console.log("Enrolling in course:", course.id);
    console.log("Using userId:", userId);
    
    // Correct API call with both courseId AND userId in URL
    const response = await fetch(`http://localhost:8080/api/enrollments/enroll/${course.id}/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.text();
    console.log("Enrollment response:", data);
    
    if (response.ok) {
      alert(`✅ Successfully enrolled in ${course.title}!`);
      // Optionally navigate to my courses
      navigate("/my-courses");
    } else {
      alert(`❌ Failed: ${data}`);
    }
  } catch (error) {
    console.error("Enrollment error:", error);
    alert("Failed to enroll. Please try again.");
  }
};

  const filteredCourses = selectedCategory === "all"
    ? courses
    : courses.filter(c => c.category === selectedCategory);

  const featuredCourses = courses.slice(0, 3);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontFamily: "'Trebuchet MS', sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f8f8f6" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: isMobile ? "16px" : "20px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px", borderBottom: "3px solid #3abf94",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px", padding: "10px 20px", color: "#fff",
            fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, fontSize: "14px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
            backdropFilter: "blur(10px)", transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        >
          ← Back to Home
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🎓</span>
          <h1 style={{ color: "#fff", margin: 0, fontSize: isMobile ? "20px" : "28px", fontFamily: "'Trebuchet MS', sans-serif" }}>
            All Cisco Courses
          </h1>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* ✅ Added My Courses button */}
          <button
            onClick={() => navigate("/my-courses")}
            style={{
              background: "rgba(58,191,148,0.2)",
              border: "1px solid #3abf94",
              borderRadius: "20px",
              padding: "8px 16px",
              color: "#3abf94",
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📖 My Courses
          </button>
          <div style={{ background: "rgba(58,191,148,0.2)", padding: "8px 16px", borderRadius: "20px" }}>
            <span style={{ color: "#3abf94", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600 }}>
              {courses.length} Courses Available
            </span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3abf94 100%)",
        padding: isMobile ? "70px 20px" : "100px 40px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: "-150px", right: "-100px" }} />
        <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", bottom: "-120px", left: "-80px" }} />

        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "8px 18px", borderRadius: "30px", color: "#fff", fontWeight: 600, marginBottom: "20px", fontFamily: "'Trebuchet MS', sans-serif" }}>
            🚀 Trusted by 50,000+ Network Engineers
          </div>
          <h1 style={{ color: "#fff", fontSize: isMobile ? "36px" : "62px", fontWeight: 800, lineHeight: "1.1", marginBottom: "20px", fontFamily: "'Trebuchet MS', sans-serif" }}>
            Master Cisco Networking<br />Build Your Dream Career
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: isMobile ? "16px" : "20px", lineHeight: "1.8", maxWidth: "750px", margin: "0 auto 35px", fontFamily: "'Trebuchet MS', sans-serif" }}>
            Learn CCNA, CCNP, CCIE, Security, Linux and Network Automation through hands-on labs, video lessons, quizzes and real-world projects.
          </p>
          <button
            onClick={() => courses.length > 0 && handleEnroll(courses[0])}
            style={{ background: "#fff", color: "#1e3a8a", border: "none", borderRadius: "50px", padding: "16px 36px", fontWeight: 700, fontSize: "16px", cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", fontFamily: "'Trebuchet MS', sans-serif" }}
          >
            🎓 Start Learning Free
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#fff", padding: "40px 20px", display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "20px", textAlign: "center" }}>
        {[
          { end: courses.length || 15, suffix: "+", label: "Courses" },
          { end: 50, suffix: "K+", label: "Students" },
          { end: 2000, suffix: "+", label: "Labs" },
          { end: 4.9, suffix: "★", label: "Rating" },
        ].map(({ end, suffix, label }) => (
          <div key={label}>
            <h2 style={{ color: "#3abf94", margin: 0, fontFamily: "'Trebuchet MS', sans-serif", fontSize: isMobile ? "28px" : "36px" }}>
              <CountUp end={end} suffix={suffix} />
            </h2>
            <p style={{ fontFamily: "'Trebuchet MS', sans-serif", color: "#555" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div style={{ padding: isMobile ? "24px 16px" : "32px 40px", background: "#fff", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", maxWidth: "900px", margin: "0 auto" }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? cat.color : "#f0f0f0",
                color: selectedCategory === cat.id ? "#fff" : "#333",
                border: "none", borderRadius: "40px", padding: "12px 24px",
                fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600,
                fontSize: isMobile ? "13px" : "14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s",
                boxShadow: selectedCategory === cat.id ? `0 4px 12px ${cat.color}40` : "none",
              }}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Courses */}
      {selectedCategory === "all" && featuredCourses.length > 0 && (
        <div style={{ padding: isMobile ? "32px 16px" : "48px 40px", background: "#f0f2f5" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <span style={{ fontSize: "32px" }}>⭐</span>
              <h2 style={{ margin: 0, fontSize: isMobile ? "24px" : "32px", color: "#1a1a2e", fontFamily: "'Trebuchet MS', sans-serif" }}>Featured Courses</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "24px" }}>
              {featuredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isMobile={isMobile}
                  hovered={hoveredCourse === course.id}
                  onHover={setHoveredCourse}
                  onEnroll={handleEnroll} // ✅ Changed from onEnrollNow to onEnroll
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Courses Grid */}
      <div style={{ padding: isMobile ? "32px 16px 64px" : "48px 40px 80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {selectedCategory !== "all" && (
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: isMobile ? "22px" : "28px", color: "#1a1a2e", fontFamily: "'Trebuchet MS', sans-serif" }}>
                {categories.find(c => c.id === selectedCategory)?.name} Courses
              </h2>
              <p style={{ color: "#666", marginTop: "8px", fontFamily: "'Trebuchet MS', sans-serif" }}>
                {filteredCourses.length} courses available
              </p>
            </div>
          )}

          {courses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <p style={{ fontSize: "18px", color: "#999", fontFamily: "'Trebuchet MS', sans-serif" }}>No courses available.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isMobile={isMobile}
                  hovered={hoveredCourse === course.id}
                  onHover={setHoveredCourse}
                  onEnroll={handleEnroll} // ✅ Changed from onEnrollNow to onEnroll
                />
              ))}
            </div>
          )}

          {courses.length > 0 && filteredCourses.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <p style={{ fontSize: "18px", color: "#999", fontFamily: "'Trebuchet MS', sans-serif" }}>No courses found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: isMobile ? "48px 20px" : "64px 40px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: isMobile ? "24px" : "36px", marginBottom: "16px", fontFamily: "'Trebuchet MS', sans-serif" }}>
          Ready to Start Learning?
        </h2>
        <p style={{ color: "#ccc", fontSize: isMobile ? "14px" : "16px", marginBottom: "32px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto", fontFamily: "'Trebuchet MS', sans-serif" }}>
          Join thousands of successful network engineers who accelerated their careers
        </p>
        <button
          onClick={() => courses.length > 0 && handleEnroll(courses[0])}
          style={{ background: "#3abf94", color: "#fff", border: "none", borderRadius: "40px", padding: "14px 36px", fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: "'Trebuchet MS', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          🎓 Start Free Trial
        </button>
      </div>

      {/* Footer */}
      <div style={{ background: "#0f172a", padding: "32px 20px", textAlign: "center", color: "#aaa", fontFamily: "'Trebuchet MS', sans-serif", fontSize: "14px" }}>
        <p style={{ margin: 0 }}>© 2025 Cisco Networking Academy — Empowering Network Engineers Worldwide</p>
      </div>
    </div>
  );
}