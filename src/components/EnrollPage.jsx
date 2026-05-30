import { useState } from "react";

// ==================== ENROLL NOW PAGE COMPONENT ====================
function EnrollPage({ isMobile, onBack, course }) {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isEnrolled, setIsEnrolled] = useState(false);

  const plans = {
    monthly: { name: "Monthly", price: 49, period: "month", savings: false },
    yearly: { name: "Yearly", price: 39, period: "month", savings: "Save 20%" },
    lifetime: { name: "Lifetime", price: 299, period: "one-time", savings: "Best Value" }
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    setTimeout(() => setIsEnrolled(false), 3000);
  };

  if (isEnrolled) {
    return (
      <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f8f8f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "24px", maxWidth: "500px", margin: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🎉</div>
          <h2 style={{ color: "#2e7d32", marginBottom: "16px" }}>Successfully Enrolled!</h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>You now have full access to {course.title}. Check your email for login details.</p>
          <button onClick={onBack} style={{ background: "#3abf94", color: "#fff", border: "none", borderRadius: "40px", padding: "14px 32px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>Continue Learning →</button>
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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        borderBottom: "3px solid #3abf94",
      }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "10px 20px", color: "#fff", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          ← Back to Course
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>💳</span>
          <h1 style={{ color: "#fff", margin: 0, fontSize: isMobile ? "20px" : "28px", fontFamily: "'Trebuchet MS', sans-serif" }}>Enroll Now</h1>
        </div>
        <div style={{ background: "rgba(58,191,148,0.2)", padding: "8px 16px", borderRadius: "20px" }}>
          <span style={{ color: "#3abf94", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600 }}>30-Day Money-Back Guarantee</span>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "32px 20px" : "48px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "40px" }}>
          {/* Course Info */}
          <div>
            <div style={{ background: course.color + "10", borderRadius: "20px", padding: "24px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ fontSize: "48px" }}>{course.icon}</div>
                <div>
                  <h2 style={{ margin: 0, color: "#1a1a2e" }}>{course.title}</h2>
                  <p style={{ color: "#666", marginTop: "8px" }}>{course.level} • {course.duration} • {course.lessons} lessons</p>
                </div>
              </div>
              <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "20px" }}>{course.description}</p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ background: "#e8f5e9", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }}>✅ Certificate of Completion</span>
                <span style={{ background: "#e3f2fd", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }}>📱 Mobile Access</span>
                <span style={{ background: "#fff3e0", padding: "6px 12px", borderRadius: "20px", fontSize: "13px" }}>💬 24/7 Support</span>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
              <h3 style={{ marginBottom: "20px", color: "#1a1a2e" }}>What's Included:</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {["Full video library", "Downloadable resources", "Practice exams", "Lab exercises", "Study notes", "Instructor Q&A"].map((item, i) => (
                  <li key={i} style={{ padding: "10px 0", borderBottom: i < 5 ? "1px solid #eee" : "none", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "#3abf94" }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing & Checkout */}
          <div>
            <div style={{ background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
              <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "24px", color: "#fff", textAlign: "center" }}>
                <h3 style={{ marginBottom: "8px" }}>Choose Your Plan</h3>
                <p style={{ opacity: 0.8, fontSize: "14px" }}>Start learning today • Cancel anytime</p>
              </div>

              <div style={{ padding: "24px" }}>
                {/* Plan Toggle */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "28px", background: "#f0f2f5", padding: "6px", borderRadius: "50px" }}>
                  {Object.entries(plans).map(([key, plan]) => (
                    <button key={key} onClick={() => setSelectedPlan(key)} style={{ flex: 1, padding: "12px", borderRadius: "40px", border: "none", background: selectedPlan === key ? "#3abf94" : "transparent", color: selectedPlan === key ? "#fff" : "#555", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                      {plan.name}
                      {plan.savings && <span style={{ display: "block", fontSize: "10px", opacity: 0.8 }}>{plan.savings}</span>}
                    </button>
                  ))}
                </div>

                {/* Price Display */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                  <span style={{ fontSize: "48px", fontWeight: 800, color: "#1a1a2e" }}>${plans[selectedPlan].price}</span>
                  {plans[selectedPlan].period !== "one-time" && <span style={{ color: "#666" }}>/{plans[selectedPlan].period}</span>}
                  {selectedPlan === "yearly" && <div style={{ marginTop: "8px" }}><span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>🎉 Billed annually ($468/year)</span></div>}
                  {selectedPlan === "lifetime" && <div style={{ marginTop: "8px" }}><span style={{ background: "#fff3e0", color: "#ef6c00", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>⭐ One-time payment • Lifetime access</span></div>}
                </div>

                {/* Features per plan */}
                <div style={{ marginBottom: "28px" }}>
                  {selectedPlan === "monthly" && <p style={{ color: "#666", fontSize: "14px", textAlign: "center" }}>✓ Full access • Cancel anytime • No commitment</p>}
                  {selectedPlan === "yearly" && <p style={{ color: "#666", fontSize: "14px", textAlign: "center" }}>✓ Save $120/year • Best for long-term learners</p>}
                  {selectedPlan === "lifetime" && <p style={{ color: "#666", fontSize: "14px", textAlign: "center" }}>✓ Unlimited access forever • All future updates</p>}
                </div>

                <button onClick={handleEnroll} style={{ width: "100%", background: "#3abf94", color: "#fff", border: "none", borderRadius: "50px", padding: "16px", fontSize: "18px", fontWeight: 700, cursor: "pointer", marginBottom: "16px" }}>
                  Enroll Now — ${plans[selectedPlan].price}
                </button>

                <p style={{ textAlign: "center", fontSize: "12px", color: "#999" }}>Secure checkout • 30-day money-back guarantee</p>

                {/* Payment methods */}
                <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px" }}>
                  <span style={{ fontSize: "24px" }}>💳</span>
                  <span style={{ fontSize: "24px" }}>🟦</span>
                  <span style={{ fontSize: "24px" }}>🥧</span>
                  <span style={{ fontSize: "24px" }}>📱</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "24px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px" }}>⭐ 4.9</div>
                <div style={{ fontSize: "12px", color: "#666" }}>5,000+ ratings</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px" }}>🎓 50K+</div>
                <div style={{ fontSize: "12px", color: "#666" }}>students enrolled</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px" }}>🔄 30-day</div>
                <div style={{ fontSize: "12px", color: "#666" }}>refund policy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== WATCH DEMO PAGE COMPONENT ====================
function WatchDemoPage({ isMobile, onBack, demoVideo }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f8f8f6" }}>
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
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "10px 20px", color: "#fff", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          ← Back to Courses
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🎬</span>
          <h1 style={{ color: "#fff", margin: 0, fontSize: isMobile ? "20px" : "28px", fontFamily: "'Trebuchet MS', sans-serif" }}>Course Demo Preview</h1>
        </div>
        <div style={{ background: "rgba(58,191,148,0.2)", padding: "8px 16px", borderRadius: "20px" }}>
          <span style={{ color: "#3abf94", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600 }}>Watch & Learn</span>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)", padding: isMobile ? "40px 20px" : "60px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", marginBottom: "32px" }}>
            <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
              {!isVideoLoaded && (
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a2a", zIndex: 1 }}>
                  <div style={{ textAlign: "center", color: "#fff" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
                    <p>Loading demo video...</p>
                  </div>
                </div>
              )}
              <iframe src={demoVideo.videoUrl} title="Course Demo" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen onLoad={() => setIsVideoLoaded(true)} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
            </div>
          </div>

          <div style={{ color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
              <span style={{ background: "#3abf94", padding: "6px 16px", borderRadius: "30px", fontSize: "14px", fontWeight: "bold" }}>📺 Exclusive Preview</span>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "6px 16px", borderRadius: "30px", fontSize: "14px" }}>⏱ {demoVideo.duration} mins</span>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "6px 16px", borderRadius: "30px", fontSize: "14px" }}>👨‍🏫 {demoVideo.instructor}</span>
            </div>
            <h2 style={{ fontSize: isMobile ? "28px" : "42px", marginBottom: "16px", fontWeight: 800 }}>{demoVideo.title}</h2>
            <p style={{ fontSize: isMobile ? "16px" : "18px", lineHeight: "1.6", color: "rgba(255,255,255,0.9)", maxWidth: "800px" }}>{demoVideo.description}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? "48px 20px" : "64px 40px", background: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: isMobile ? "28px" : "34px", marginBottom: "16px", color: "#1a1a2e" }}>Ready to Start Your Journey?</h2>
          <p style={{ color: "#555", marginBottom: "32px", fontSize: "16px" }}>Get full access to all courses, labs, and certification guides</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onBack} style={{ background: "#3abf94", color: "#fff", border: "none", borderRadius: "50px", padding: "14px 32px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>🎓 Browse All Courses</button>
          </div>
        </div>
      </div>

      <div style={{ background: "#1a1a2e", padding: "32px 20px", textAlign: "center", color: "#aaa" }}>
        <p>© 2025 Cisco Networking Academy — Empowering Network Engineers Worldwide</p>
      </div>
    </div>
  );
}

// ==================== COURSE CARD COMPONENT ====================
function CourseCard({ course, isMobile, hovered, onHover, levelColors, onWatchDemo, onEnrollNow }) {
  return (
    <div onMouseEnter={() => onHover(course.id)} onMouseLeave={() => onHover(null)} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.15)" : "0 4px 15px rgba(0,0,0,0.08)", transition: "all 0.3s ease", transform: hovered ? "translateY(-4px)" : "translateY(0)", cursor: "pointer" }}>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: `${course.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>{course.icon}</div>
          <span style={{ fontWeight: 700, fontSize: "14px", background: "#f0f0f0", padding: "4px 10px", borderRadius: "20px" }}>🎥 {course.lessons} lessons</span>
        </div>
        <h3 style={{ margin: "0 0 12px", fontSize: isMobile ? "18px" : "20px", color: "#1a1a2e" }}>{course.title}</h3>
        <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>{course.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <span style={{ background: levelColors[course.level].bg, color: levelColors[course.level].text, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{course.level}</span>
          <span style={{ background: "#f0f0f0", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>⏱ {course.duration}</span>
          <span style={{ background: "#f0f0f0", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>👥 {course.students.toLocaleString()} students</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onWatchDemo(course); }} style={{ width: "100%", background: course.color, color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s", marginBottom: "8px" }}>
          ▶ Watch Demo
        </button>
        <button onClick={(e) => { e.stopPropagation(); onEnrollNow(course); }} style={{ width: "100%", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "10px", padding: "10px", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
          Enroll Now →
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN COURSES PAGE ====================
export default function CoursesPage({ isMobile, onBack, onWatchDemoRedirect, onEnrollRedirect }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCourse, setHoveredCourse] = useState(null);

  const categories = [
    { id: "all", name: "All Courses", icon: "📚", color: "#3abf94" },
    { id: "ccna", name: "CCNA", icon: "🔰", color: "#e5a800" },
    { id: "ccnp", name: "CCNP", icon: "⚡", color: "#1d6b72" },
    { id: "ccie", name: "CCIE", icon: "🏆", color: "#c8102e" },
    { id: "security", name: "Security", icon: "🔒", color: "#7aa3c8" },
    { id: "linux", name: "Linux", icon: "🐧", color: "#5b8dbf" },
  ];

  const courses = [
    { id: 1, title: "CCNA 200-301 Complete Course", description: "Master networking fundamentals, IP services, security fundamentals, and automation.", level: "Beginner", duration: "40+ hours", lessons: 187, category: "ccna", icon: "🌐", color: "#e5a800", featured: true, students: 12450 },
    { id: 2, title: "Subnetting Mastery", description: "Learn subnetting in seconds with proven techniques and practice labs.", level: "Beginner", duration: "8+ hours", lessons: 34, category: "ccna", icon: "🔢", color: "#e5a800", featured: false, students: 8750 },
    { id: 3, title: "Routing Fundamentals", description: "Static routing, dynamic routing protocols, and advanced routing concepts.", level: "Intermediate", duration: "25+ hours", lessons: 112, category: "ccna", icon: "🔄", color: "#e5a800", featured: false, students: 6320 },
    { id: 4, title: "Switching and VLANs", description: "Configure switches, VLANs, STP, EtherChannel, and switch security.", level: "Intermediate", duration: "20+ hours", lessons: 89, category: "ccna", icon: "🔌", color: "#e5a800", featured: false, students: 7140 },
    { id: 5, title: "CCNP ENCOR (350-401)", description: "Advanced routing, switching, VPNs, automation, and network assurance.", level: "Advanced", duration: "60+ hours", lessons: 245, category: "ccnp", icon: "🎯", color: "#1d6b72", featured: true, students: 5430 },
    { id: 6, title: "CCNP ENARSI (300-410)", description: "Deep dive into advanced routing, VPN services, and infrastructure security.", level: "Advanced", duration: "50+ hours", lessons: 198, category: "ccnp", icon: "🚀", color: "#1d6b72", featured: false, students: 3980 },
    { id: 7, title: "Advanced OSPF & BGP", description: "Master OSPF areas, route redistribution, BGP attributes, and route filtering.", level: "Advanced", duration: "35+ hours", lessons: 145, category: "ccnp", icon: "🌍", color: "#1d6b72", featured: false, students: 4670 },
    { id: 8, title: "CCIE Enterprise Infrastructure", description: "Expert-level preparation with complex labs, troubleshooting, and design.", level: "Expert", duration: "120+ hours", lessons: 423, category: "ccie", icon: "👑", color: "#c8102e", featured: true, students: 2150 },
    { id: 9, title: "CCIE Lab Preparation", description: "Full-scale lab simulations and topology design for CCIE certification.", level: "Expert", duration: "80+ hours", lessons: 267, category: "ccie", icon: "🧪", color: "#c8102e", featured: false, students: 1890 },
    { id: 10, title: "Network Security Fundamentals", description: "Firewalls, VPNs, access control, and security best practices.", level: "Intermediate", duration: "30+ hours", lessons: 124, category: "security", icon: "🛡️", color: "#7aa3c8", featured: false, students: 5920 },
    { id: 11, title: "Cisco Firepower & ASA", description: "Configure and manage Next-Gen Firewalls and security policies.", level: "Advanced", duration: "45+ hours", lessons: 167, category: "security", icon: "🔥", color: "#7aa3c8", featured: true, students: 3340 },
    { id: 12, title: "VPN Technologies", description: "Site-to-site VPN, Remote Access VPN, DMVPN, and FlexVPN.", level: "Advanced", duration: "28+ hours", lessons: 98, category: "security", icon: "🔗", color: "#7aa3c8", featured: false, students: 4210 },
    { id: 13, title: "Linux for Network Engineers", description: "Essential Linux commands, scripting, and automation for networking.", level: "Beginner", duration: "25+ hours", lessons: 89, category: "linux", icon: "💻", color: "#5b8dbf", featured: false, students: 6780 },
    { id: 14, title: "Python Network Automation", description: "Automate network tasks with Python, Netmiko, and NAPALM.", level: "Intermediate", duration: "35+ hours", lessons: 134, category: "linux", icon: "🐍", color: "#5b8dbf", featured: true, students: 7530 },
    { id: 15, title: "Ansible for Networking", description: "Network automation using Ansible playbooks and roles.", level: "Intermediate", duration: "22+ hours", lessons: 76, category: "linux", icon: "📦", color: "#5b8dbf", featured: false, students: 4120 },
  ];

  const filteredCourses = selectedCategory === "all" ? courses : courses.filter(c => c.category === selectedCategory);
  const featuredCourses = courses.filter(c => c.featured);
  
  const levelColors = {
    Beginner: { bg: "#e8f5e9", text: "#2e7d32" },
    Intermediate: { bg: "#fff3e0", text: "#ef6c00" },
    Advanced: { bg: "#fce4ec", text: "#c62828" },
    Expert: { bg: "#f3e5f5", text: "#6a1b9a" },
  };

  const handleWatchDemo = (course) => {
    const demoData = {
      title: `${course.title} — Exclusive Preview`,
      description: `Get a sneak peek into our "${course.title}" course. Experience real instructor-led sessions, hands-on lab walkthroughs, and exam strategies. This demo covers key topics from ${course.category.toUpperCase()} track including practical configurations and troubleshooting scenarios.`,
      instructor: course.category === "ccie" ? "Dr. James Chen, CCIE #10234" : "Senior Instructor Team",
      duration: "15",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1",
    };
    if (course.category === "ccna") demoData.videoUrl = "https://www.youtube.com/embed/0KZNRhjjC3s?autoplay=1";
    if (course.category === "ccnp") demoData.videoUrl = "https://www.youtube.com/embed/3rV5m7kALWg?autoplay=1";
    if (course.category === "security") demoData.videoUrl = "https://www.youtube.com/embed/k2B1f3bBkaA?autoplay=1";
    onWatchDemoRedirect(demoData);
  };

  const handleEnrollNow = (course) => {
    onEnrollRedirect(course);
  };

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f8f8f6" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: isMobile ? "16px" : "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", borderBottom: "3px solid #3abf94" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "10px 20px", color: "#fff", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>← Back to Home</button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ fontSize: "28px" }}>🎓</span><h1 style={{ color: "#fff", margin: 0, fontSize: isMobile ? "20px" : "28px", fontFamily: "'Trebuchet MS', sans-serif" }}>All Cisco Courses</h1></div>
        <div style={{ background: "rgba(58,191,148,0.2)", padding: "8px 16px", borderRadius: "20px" }}><span style={{ color: "#3abf94", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600 }}>{courses.length} Courses Available</span></div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3abf94 100%)", padding: isMobile ? "70px 20px" : "100px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "8px 18px", borderRadius: "30px", color: "#fff", fontWeight: 600, marginBottom: "20px" }}>🚀 Trusted by 50,000+ Network Engineers</div>
          <h1 style={{ color: "#fff", fontSize: isMobile ? "36px" : "62px", fontWeight: 800, lineHeight: "1.1", marginBottom: "20px", fontFamily: "'Trebuchet MS', sans-serif" }}>Master Cisco Networking<br />Build Your Dream Career</h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: isMobile ? "16px" : "20px", lineHeight: "1.8", maxWidth: "750px", margin: "0 auto 35px" }}>Learn CCNA, CCNP, CCIE, Security, Linux and Network Automation through hands-on labs, video lessons, quizzes and real-world projects.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button style={{ background: "#fff", color: "#1e3a8a", border: "none", borderRadius: "50px", padding: "16px 36px", fontWeight: 700, fontSize: "16px", cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>🎓 Start Learning Free</button>
            <button onClick={() => handleWatchDemo(courses[0])} style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "50px", padding: "16px 36px", fontWeight: 700, fontSize: "16px", cursor: "pointer" }}>▶ Watch Demo</button>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "40px 20px", display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "20px", textAlign: "center" }}>
        <div><h2 style={{ color: "#3abf94", margin: 0 }}>15+</h2><p>Courses</p></div>
        <div><h2 style={{ color: "#3abf94", margin: 0 }}>50K+</h2><p>Students</p></div>
        <div><h2 style={{ color: "#3abf94", margin: 0 }}>2000+</h2><p>Labs</p></div>
        <div><h2 style={{ color: "#3abf94", margin: 0 }}>4.9★</h2><p>Rating</p></div>
      </div>

      <div style={{ padding: isMobile ? "24px 16px" : "32px 40px", background: "#fff", borderBottom: "1px solid #e0e0e0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", maxWidth: "900px", margin: "0 auto" }}>
          {categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ background: selectedCategory === cat.id ? cat.color : "#f0f0f0", color: selectedCategory === cat.id ? "#fff" : "#333", border: "none", borderRadius: "40px", padding: "12px 24px", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, fontSize: isMobile ? "13px" : "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s", boxShadow: selectedCategory === cat.id ? `0 4px 12px ${cat.color}40` : "none" }}><span>{cat.icon}</span> {cat.name}</button>))}
        </div>
      </div>

      {selectedCategory === "all" && (
        <div style={{ padding: isMobile ? "32px 16px" : "48px 40px", background: "#f0f2f5" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}><span style={{ fontSize: "32px" }}>⭐</span><h2 style={{ margin: 0, fontSize: isMobile ? "24px" : "32px", color: "#1a1a2e" }}>Featured Courses</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "24px" }}>
              {featuredCourses.map(course => <CourseCard key={course.id} course={course} isMobile={isMobile} hovered={hoveredCourse === course.id} onHover={setHoveredCourse} levelColors={levelColors} onWatchDemo={handleWatchDemo} onEnrollNow={handleEnrollNow} />)}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: isMobile ? "32px 16px 64px" : "48px 40px 80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {selectedCategory !== "all" && (<div style={{ marginBottom: "32px" }}><h2 style={{ fontSize: isMobile ? "22px" : "28px", color: "#1a1a2e" }}>{categories.find(c => c.id === selectedCategory)?.name} Courses</h2><p style={{ color: "#666", marginTop: "8px" }}>{filteredCourses.length} courses available</p></div>)}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
            {filteredCourses.map(course => <CourseCard key={course.id} course={course} isMobile={isMobile} hovered={hoveredCourse === course.id} onHover={setHoveredCourse} levelColors={levelColors} onWatchDemo={handleWatchDemo} onEnrollNow={handleEnrollNow} />)}
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: isMobile ? "48px 20px" : "64px 40px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: isMobile ? "24px" : "36px", marginBottom: "16px" }}>Ready to Start Learning?</h2>
        <p style={{ color: "#ccc", fontSize: isMobile ? "14px" : "16px", marginBottom: "32px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>Join thousands of successful network engineers who accelerated their careers</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{ background: "#3abf94", color: "#fff", border: "none", borderRadius: "40px", padding: "14px 36px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>🎓 Start Free Trial</button>
          <button style={{ background: "transparent", color: "#3abf94", border: "2px solid #3abf94", borderRadius: "40px", padding: "14px 36px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>View Pricing</button>
        </div>
      </div>
    </div>
  );
}