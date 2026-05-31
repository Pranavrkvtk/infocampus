import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ==================== COURSE CARD COMPONENT ====================
function CourseCard({ course, isMobile, hovered, onHover, levelColors, onWatchDemo, onEnrollNow }) {
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
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: `${course.color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            {course.icon}
          </div>
          <span style={{ fontWeight: 700, fontSize: "14px", background: "#f0f0f0", padding: "4px 10px", borderRadius: "20px" }}>
            🎥 {course.lessons} lessons
          </span>
        </div>
        <h3 style={{ margin: "0 0 12px", fontSize: isMobile ? "18px" : "20px", color: "#1a1a2e" }}>{course.title}</h3>
        <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>{course.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <span style={{ background: levelColors[course.level].bg, color: levelColors[course.level].text, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
            {course.level}
          </span>
          <span style={{ background: "#f0f0f0", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>⏱ {course.duration}</span>
          <span style={{ background: "#f0f0f0", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>👥 {course.students.toLocaleString()} students</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onWatchDemo(course); }}
          style={{
            width: "100%",
            background: course.color,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.2s",
            marginBottom: "8px",
            fontSize: "15px",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          ▶ Watch Demo
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEnrollNow(course); }}
          style={{
            width: "100%",
            background: "#f0f0f0",
            color: "#333",
            border: "none",
            borderRadius: "10px",
            padding: "10px",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: "13px",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#e0e0e0"}
          onMouseLeave={e => e.currentTarget.style.background = "#f0f0f0"}
        >
          Enroll Now →
        </button>
      </div>
    </div>
  );
}

// ==================== COURSES DATA ====================
export const courses = [
  { id: 1,  title: "CCNA 200-301 Complete Course",    description: "Master networking fundamentals, IP services, security fundamentals, and automation.",              level: "Beginner",     duration: "40+ hours",  lessons: 187, category: "ccna",     icon: "🌐", color: "#e5a800", featured: true,  students: 12450 },
  { id: 2,  title: "Subnetting Mastery",              description: "Learn subnetting in seconds with proven techniques and practice labs.",                            level: "Beginner",     duration: "8+ hours",   lessons: 34,  category: "ccna",     icon: "🔢", color: "#e5a800", featured: false, students: 8750  },
  { id: 3,  title: "Routing Fundamentals",            description: "Static routing, dynamic routing protocols, and advanced routing concepts.",                        level: "Intermediate", duration: "25+ hours",  lessons: 112, category: "ccna",     icon: "🔄", color: "#e5a800", featured: false, students: 6320  },
  { id: 4,  title: "Switching and VLANs",             description: "Configure switches, VLANs, STP, EtherChannel, and switch security.",                              level: "Intermediate", duration: "20+ hours",  lessons: 89,  category: "ccna",     icon: "🔌", color: "#e5a800", featured: false, students: 7140  },
  { id: 5,  title: "CCNP ENCOR (350-401)",            description: "Advanced routing, switching, VPNs, automation, and network assurance.",                           level: "Advanced",     duration: "60+ hours",  lessons: 245, category: "ccnp",     icon: "🎯", color: "#1d6b72", featured: true,  students: 5430  },
  { id: 6,  title: "CCNP ENARSI (300-410)",           description: "Deep dive into advanced routing, VPN services, and infrastructure security.",                     level: "Advanced",     duration: "50+ hours",  lessons: 198, category: "ccnp",     icon: "🚀", color: "#1d6b72", featured: false, students: 3980  },
  { id: 7,  title: "Advanced OSPF & BGP",             description: "Master OSPF areas, route redistribution, BGP attributes, and route filtering.",                  level: "Advanced",     duration: "35+ hours",  lessons: 145, category: "ccnp",     icon: "🌍", color: "#1d6b72", featured: false, students: 4670  },
  { id: 8,  title: "CCIE Enterprise Infrastructure", description: "Expert-level preparation with complex labs, troubleshooting, and design.",                        level: "Expert",       duration: "120+ hours", lessons: 423, category: "ccie",     icon: "👑", color: "#c8102e", featured: true,  students: 2150  },
  { id: 9,  title: "CCIE Lab Preparation",            description: "Full-scale lab simulations and topology design for CCIE certification.",                          level: "Expert",       duration: "80+ hours",  lessons: 267, category: "ccie",     icon: "🧪", color: "#c8102e", featured: false, students: 1890  },
  { id: 10, title: "Network Security Fundamentals",  description: "Firewalls, VPNs, access control, and security best practices.",                                   level: "Intermediate", duration: "30+ hours",  lessons: 124, category: "security", icon: "🛡️", color: "#7aa3c8", featured: false, students: 5920  },
  { id: 11, title: "Cisco Firepower & ASA",           description: "Configure and manage Next-Gen Firewalls and security policies.",                                  level: "Advanced",     duration: "45+ hours",  lessons: 167, category: "security", icon: "🔥", color: "#7aa3c8", featured: true,  students: 3340  },
  { id: 12, title: "VPN Technologies",               description: "Site-to-site VPN, Remote Access VPN, DMVPN, and FlexVPN.",                                        level: "Advanced",     duration: "28+ hours",  lessons: 98,  category: "security", icon: "🔗", color: "#7aa3c8", featured: false, students: 4210  },
  { id: 13, title: "Linux for Network Engineers",    description: "Essential Linux commands, scripting, and automation for networking.",                              level: "Beginner",     duration: "25+ hours",  lessons: 89,  category: "linux",    icon: "💻", color: "#5b8dbf", featured: false, students: 6780  },
  { id: 14, title: "Python Network Automation",      description: "Automate network tasks with Python, Netmiko, and NAPALM.",                                         level: "Intermediate", duration: "35+ hours",  lessons: 134, category: "linux",    icon: "🐍", color: "#5b8dbf", featured: true,  students: 7530  },
  { id: 15, title: "Ansible for Networking",         description: "Network automation using Ansible playbooks and roles.",                                            level: "Intermediate", duration: "22+ hours",  lessons: 76,  category: "linux",    icon: "📦", color: "#5b8dbf", featured: false, students: 4120  },
];

// ==================== MAIN COURSES PAGE ====================
export default function CoursesPage({ isMobile, onBack }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCourse, setHoveredCourse] = useState(null);

  const categories = [
    { id: "all",      name: "All Courses", icon: "📚", color: "#3abf94" },
    { id: "ccna",     name: "CCNA",        icon: "🔰", color: "#e5a800" },
    { id: "ccnp",     name: "CCNP",        icon: "⚡", color: "#1d6b72" },
    { id: "ccie",     name: "CCIE",        icon: "🏆", color: "#c8102e" },
    { id: "security", name: "Security",    icon: "🔒", color: "#7aa3c8" },
    { id: "linux",    name: "Linux",       icon: "🐧", color: "#5b8dbf" },
  ];

  const levelColors = {
    Beginner:     { bg: "#e8f5e9", text: "#2e7d32" },
    Intermediate: { bg: "#fff3e0", text: "#ef6c00" },
    Advanced:     { bg: "#fce4ec", text: "#c62828" },
    Expert:       { bg: "#f3e5f5", text: "#6a1b9a" },
  };

  const getVideoUrlForCourse = (course) => {
    const base = "https://www.youtube.com/embed/";
    switch (course.category) {
      case "ccna":     return base + "0KZNRhjjC3s?autoplay=1&rel=0";
      case "ccnp":     return base + "3rV5m7kALWg?autoplay=1&rel=0";
      case "security": return base + "k2B1f3bBkaA?autoplay=1&rel=0";
      default:         return base + "dQw4w9WgXcQ?autoplay=1&rel=0";
    }
  };

  // ✅ Both use navigate — no prop callbacks needed
  const handleWatchDemo = (course) => {
    const demoData = {
      title: `${course.title} — Exclusive Preview`,
      description: `Get a sneak peek into our "${course.title}" course. Experience real instructor-led sessions, hands-on lab walkthroughs, and exam strategies. This demo covers key topics from ${course.category.toUpperCase()} track including practical configurations and troubleshooting scenarios.`,
      instructor: course.category === "ccie" ? "Dr. James Chen, CCIE #10234" : "Senior Instructor Team",
      duration: "15",
      videoUrl: getVideoUrlForCourse(course),
    };
    navigate("/watch-demo", { state: { demoVideo: demoData } });
  };

  const handleEnrollNow = (course) => {
    navigate("/enroll", { state: { course } });
  };

  const filteredCourses = selectedCategory === "all"
    ? courses
    : courses.filter(c => c.category === selectedCategory);

  const featuredCourses = courses.filter(c => c.featured);

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f8f8f6" }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: isMobile ? "16px" : "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        borderBottom: "3px solid #3abf94",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            padding: "10px 20px",
            color: "#fff",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s",
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

        <div style={{ background: "rgba(58,191,148,0.2)", padding: "8px 16px", borderRadius: "20px" }}>
          <span style={{ color: "#3abf94", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600 }}>
            {courses.length} Courses Available
          </span>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3abf94 100%)",
        padding: isMobile ? "70px 20px" : "100px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
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
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleEnrollNow(courses[0])}
              style={{ background: "#fff", color: "#1e3a8a", border: "none", borderRadius: "50px", padding: "16px 36px", fontWeight: 700, fontSize: "16px", cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", fontFamily: "'Trebuchet MS', sans-serif" }}
            >
              🎓 Start Learning Free
            </button>
            <button
              onClick={() => handleWatchDemo(courses[0])}
              style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "50px", padding: "16px 36px", fontWeight: 700, fontSize: "16px", cursor: "pointer", fontFamily: "'Trebuchet MS', sans-serif" }}
            >
              ▶ Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ background: "#fff", padding: "40px 20px", display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "20px", textAlign: "center" }}>
        {[["15+", "Courses"], ["50K+", "Students"], ["2000+", "Labs"], ["4.9★", "Rating"]].map(([val, label]) => (
          <div key={label}>
            <h2 style={{ color: "#3abf94", margin: 0, fontFamily: "'Trebuchet MS', sans-serif" }}>{val}</h2>
            <p style={{ fontFamily: "'Trebuchet MS', sans-serif", color: "#555" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Category Filter ── */}
      <div style={{ padding: isMobile ? "24px 16px" : "32px 40px", background: "#fff", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", maxWidth: "900px", margin: "0 auto" }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? cat.color : "#f0f0f0",
                color: selectedCategory === cat.id ? "#fff" : "#333",
                border: "none",
                borderRadius: "40px",
                padding: "12px 24px",
                fontFamily: "'Trebuchet MS', sans-serif",
                fontWeight: 600,
                fontSize: isMobile ? "13px" : "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                boxShadow: selectedCategory === cat.id ? `0 4px 12px ${cat.color}40` : "none",
              }}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured Courses ── */}
      {selectedCategory === "all" && (
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
                  levelColors={levelColors}
                  onWatchDemo={handleWatchDemo}
                  onEnrollNow={handleEnrollNow}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── All Courses Grid ── */}
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
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isMobile={isMobile}
                hovered={hoveredCourse === course.id}
                onHover={setHoveredCourse}
                levelColors={levelColors}
                onWatchDemo={handleWatchDemo}
                onEnrollNow={handleEnrollNow}
              />
            ))}
          </div>
          {filteredCourses.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <p style={{ fontSize: "18px", color: "#999", fontFamily: "'Trebuchet MS', sans-serif" }}>No courses found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: isMobile ? "48px 20px" : "64px 40px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: isMobile ? "24px" : "36px", marginBottom: "16px", fontFamily: "'Trebuchet MS', sans-serif" }}>
          Ready to Start Learning?
        </h2>
        <p style={{ color: "#ccc", fontSize: isMobile ? "14px" : "16px", marginBottom: "32px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto", fontFamily: "'Trebuchet MS', sans-serif" }}>
          Join thousands of successful network engineers who accelerated their careers
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => handleEnrollNow(courses[0])}
            style={{ background: "#3abf94", color: "#fff", border: "none", borderRadius: "40px", padding: "14px 36px", fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: "'Trebuchet MS', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            🎓 Start Free Trial
          </button>
          <button
            onClick={() => handleWatchDemo(courses[0])}
            style={{ background: "transparent", color: "#3abf94", border: "2px solid #3abf94", borderRadius: "40px", padding: "14px 36px", fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: "'Trebuchet MS', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(58,191,148,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            ▶ Watch Demo
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: "#0f172a", padding: "32px 20px", textAlign: "center", color: "#aaa", fontFamily: "'Trebuchet MS', sans-serif", fontSize: "14px" }}>
        <p style={{ margin: 0 }}>© 2025 Cisco Networking Academy — Empowering Network Engineers Worldwide</p>
      </div>
    </div>
  );
}