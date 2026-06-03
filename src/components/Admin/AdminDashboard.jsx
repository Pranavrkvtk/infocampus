import React, { useState } from "react";

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

// Navigation - only 4 items
const navItems = [
  { icon: "📊", label: "Dashboard", id: "dashboard" },
  { icon: "🌐", label: "Courses", id: "courses", badge: 12 },
  { icon: "💳", label: "Payments", id: "payments" },
  { icon: "👨‍🎓", label: "Students", id: "students", badge: 3 },
];

// Dashboard Data
const kpis = [
  { label: "Total Students", value: "8,247", delta: "+12.4% this month", up: true, accent: colors.primary, iconBg: colors.primarySoft, icon: "👨‍🎓" },
  { label: "Active Courses", value: "18", delta: "+3 this week", up: true, accent: colors.teal, iconBg: colors.tealSoft, icon: "🌐" },
  { label: "Certifications", value: "2,156", delta: "+28% vs last month", up: true, accent: colors.coral, iconBg: colors.coralSoft, icon: "🏆" },
  { label: "Lab Hours", value: "4,892", delta: "+15.3% this week", up: true, accent: colors.amber, iconBg: colors.amberSoft, icon: "💻" },
];

// CCNA & Networking Courses Data
const courseEnrollments = [
  { name: "CCNA 200-301 Full Course", count: 1245, pct: 92, color: colors.gradPrimary, level: "Intermediate" },
  { name: "Network Fundamentals", count: 982, pct: 78, color: colors.gradTeal, level: "Beginner" },
  { name: "CCNP Enterprise", count: 567, pct: 65, color: colors.gradCoral, level: "Advanced" },
  { name: "Routing & Switching", count: 834, pct: 71, color: colors.gradAmber, level: "Intermediate" },
  { name: "Network Security Basics", count: 723, pct: 59, color: colors.gradPrimary, opacity: 0.65, level: "Intermediate" },
  { name: "CCNA Security", count: 445, pct: 48, color: colors.gradTeal, opacity: 0.65, level: "Advanced" },
];

const activities = [
  { dot: colors.primary, text: "Michael Chen passed CCNA 200-301 exam", bold: "Michael Chen", time: "2 minutes ago" },
  { dot: colors.teal, text: "New CCNA lab: VLAN Configuration added", bold: "VLAN Configuration", time: "18 minutes ago" },
  { dot: colors.coral, text: "$299 payment received for CCNP Enterprise", bold: "$299", time: "41 minutes ago" },
  { dot: colors.amber, text: "Sarah Johnson completed Network Fundamentals", bold: "Sarah Johnson", time: "1 hour ago" },
  { dot: colors.primary, text: "Live webinar: Subnetting Mastery scheduled", bold: "Subnetting Mastery", time: "2 hours ago" },
];

// Networking Courses Data
const allCourses = [
  { id: 1, name: "CCNA 200-301 Full Course", instructor: "David Wilkins", students: 1245, price: "$299", status: "Published", progress: 92, level: "Intermediate", duration: "40 hours" },
  { id: 2, name: "Network Fundamentals", instructor: "Dr. Sarah Chen", students: 982, price: "$149", status: "Published", progress: 78, level: "Beginner", duration: "25 hours" },
  { id: 3, name: "CCNP Enterprise", instructor: "Robert Martinez", students: 567, price: "$499", status: "Published", progress: 65, level: "Advanced", duration: "60 hours" },
  { id: 4, name: "Routing & Switching Deep Dive", instructor: "James Wilson", students: 834, price: "$249", status: "Draft", progress: 71, level: "Intermediate", duration: "35 hours" },
  { id: 5, name: "Network Security & Firewalls", instructor: "Emily Brown", students: 723, price: "$199", status: "Published", progress: 59, level: "Intermediate", duration: "30 hours" },
  { id: 6, name: "CCNA Security (210-260)", instructor: "Michael Lee", students: 445, price: "$349", status: "Published", progress: 48, level: "Advanced", duration: "45 hours" },
  { id: 7, name: "Wireless Networking", instructor: "Lisa Thompson", students: 567, price: "$179", status: "Published", progress: 55, level: "Intermediate", duration: "28 hours" },
  { id: 8, name: "IPv6 Fundamentals", instructor: "Kevin Patel", students: 412, price: "$129", status: "Draft", progress: 42, level: "Beginner", duration: "20 hours" },
];

// Payments Data
const allPayments = [
  { id: 1, student: "Michael Chen", course: "CCNA 200-301", amount: "$299", status: "Paid", date: "2026-06-03" },
  { id: 2, student: "Sarah Johnson", course: "Network Fundamentals", amount: "$149", status: "Paid", date: "2026-06-02" },
  { id: 3, student: "David Kim", course: "CCNP Enterprise", amount: "$499", status: "Pending", date: "2026-06-02" },
  { id: 4, student: "Emily Rodriguez", course: "Network Security", amount: "$199", status: "Paid", date: "2026-06-01" },
  { id: 5, student: "James Wilson", course: "CCNA Security", amount: "$349", status: "Refunded", date: "2026-05-31" },
  { id: 6, student: "Lisa Brown", course: "Routing & Switching", amount: "$249", status: "Paid", date: "2026-05-30" },
  { id: 7, student: "Thomas Lee", course: "Wireless Networking", amount: "$179", status: "Paid", date: "2026-05-29" },
];

// Students Data with networking focus
const allStudents = [
  { id: 1, name: "Michael Chen", email: "michael.chen@example.com", course: "CCNA 200-301", progress: 92, status: "Active", enrolled: "2026-01-15", lab_completed: 18 },
  { id: 2, name: "Sarah Johnson", email: "sarah.j@example.com", course: "Network Fundamentals", progress: 78, status: "Active", enrolled: "2026-02-10", lab_completed: 12 },
  { id: 3, name: "David Kim", email: "david.kim@example.com", course: "CCNP Enterprise", progress: 45, status: "Active", enrolled: "2026-01-20", lab_completed: 8 },
  { id: 4, name: "Emily Rodriguez", email: "emily.r@example.com", course: "Network Security", progress: 88, status: "Pending", enrolled: "2026-03-05", lab_completed: 14 },
  { id: 5, name: "James Wilson", email: "james.w@example.com", course: "CCNA Security", progress: 34, status: "Active", enrolled: "2026-02-18", lab_completed: 6 },
  { id: 6, name: "Lisa Brown", email: "lisa.b@example.com", course: "Routing & Switching", progress: 71, status: "Active", enrolled: "2026-03-12", lab_completed: 11 },
  { id: 7, name: "Thomas Lee", email: "thomas.lee@example.com", course: "Wireless Networking", progress: 55, status: "Active", enrolled: "2026-04-01", lab_completed: 9 },
  { id: 8, name: "Maria Garcia", email: "maria.g@example.com", course: "IPv6 Fundamentals", progress: 42, status: "Pending", enrolled: "2026-04-15", lab_completed: 5 },
];

// Components
function NavItem({ icon, label, badge, active, onClick, isMobile, onMobileNavClick }) {
  const [hovered, setHovered] = useState(false);
  
  const handleClick = () => {
    onClick();
    if (isMobile && onMobileNavClick) {
      onMobileNavClick();
    }
  };
  
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        margin: "4px 8px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        color: active ? colors.primary : hovered ? colors.textPrimary : colors.textSecondary,
        cursor: "pointer",
        background: active ? colors.primarySoft : hovered ? "#F1F4FA" : "transparent",
        transition: "all 0.18s",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          background: colors.primary,
          color: "#fff",
          fontSize: 11,
          borderRadius: 40,
          padding: "2px 8px",
          fontWeight: 600,
        }}>{badge}</span>
      )}
    </div>
  );
}

function KpiCard({ label, value, delta, up, iconBg, icon }) {
  return (
    <div style={{
      background: colors.surface,
      borderRadius: 16,
      padding: "16px",
      border: `1px solid ${colors.borderLight}`,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, marginBottom: 12,
      }}>{icon}</div>
      <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, color: up ? colors.teal : colors.coral }}>
        <span>{up ? "↑" : "↓"}</span> {delta}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    Published: { bg: colors.tealSoft, color: colors.teal },
    Paid: { bg: colors.tealSoft, color: colors.teal },
    Pending: { bg: colors.amberSoft, color: colors.amber },
    Refunded: { bg: "#F0F2F8", color: colors.textMuted },
    Active: { bg: colors.tealSoft, color: colors.teal },
    Draft: { bg: "#F0F2F8", color: colors.textMuted },
    Beginner: { bg: colors.primarySoft, color: colors.primary },
    Intermediate: { bg: colors.amberSoft, color: colors.amber },
    Advanced: { bg: colors.coralSoft, color: colors.coral },
  };
  const s = map[status] || { bg: "#F0F2F8", color: colors.textMuted };
  return (
    <span style={{
      display: "inline-flex",
      fontSize: 10.5, padding: "3px 10px", borderRadius: 50,
      fontWeight: 600, background: s.bg, color: s.color,
    }}>{status}</span>
  );
}

// Mobile Bottom Navigation
function MobileBottomNav({ activeTab, onTabChange }) {
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
      padding: "8px 16px 20px",
      zIndex: 100,
    }}>
      {navItems.map(item => (
        <div
          key={item.id}
          onClick={() => onTabChange(item.id)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            color: activeTab === item.id ? colors.primary : colors.textMuted,
            position: "relative",
          }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
          {item.badge && (
            <span style={{
              position: "absolute",
              top: -4,
              right: -8,
              background: colors.primary,
              color: "#fff",
              fontSize: 9,
              borderRadius: 10,
              padding: "1px 5px",
              minWidth: 16,
              textAlign: "center",
            }}>{item.badge}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderContent = () => {
    const commonTableStyles = {
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
    };

    switch(activeTab) {
      case "dashboard":
        return (
          <>
            {/* KPI Grid - Responsive */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: isMobile ? 12 : 20,
              marginBottom: 24,
            }}>
              {kpis.map(k => <KpiCard key={k.label} {...k} />)}
            </div>

            {/* Top Courses & Activity */}
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 20,
              marginBottom: 24,
            }}>
              {/* Top Enrolled Courses */}
              <div style={{
                flex: 1,
                background: colors.surface,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: 16,
                padding: isMobile ? 16 : 20,
              }}>
                <h3 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, marginBottom: 16 }}>📊 Top Networking Courses</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {courseEnrollments.map(c => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: colors.textSecondary, width: isMobile ? 120 : 160 }}>{c.name}</span>
                      <div style={{ flex: 1, height: 5, background: "#EDF1F8", borderRadius: 10 }}>
                        <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: 10, opacity: c.opacity || 1 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{c.count}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${colors.borderLight}` }}>
                  <div style={{ fontSize: 12, color: colors.textSecondary, display: "flex", justifyContent: "space-between" }}>
                    <span>🖥️ Total Lab Exercises: 142</span>
                    <span>🎯 Completion Rate: 68%</span>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div style={{
                flex: 1,
                background: colors.surface,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: 16,
                padding: isMobile ? 16 : 20,
              }}>
                <h3 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, marginBottom: 16 }}>🔄 Recent Activity</h3>
                {activities.map((a, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10,
                    padding: "10px 0",
                    borderBottom: i < activities.length - 1 ? `1px solid ${colors.borderLight}` : "none",
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.dot, marginTop: 5 }} />
                    <div>
                      <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.4 }}>
                        {a.text.split(a.bold).map((part, j, arr) => (
                          <span key={j}>
                            {part}
                            {j < arr.length - 1 && <strong style={{ color: colors.textPrimary }}>{a.bold}</strong>}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 3 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Students Preview */}
            <div style={{
              background: colors.surface,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: 16,
              padding: isMobile ? 16 : 20,
            }}>
              <h3 style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, marginBottom: 16 }}>👨‍🎓 Top Performing Students</h3>
              <div style={commonTableStyles}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Student</th>
                      <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Course</th>
                      <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Labs Done</th>
                      <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Progress</th>
                      <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudents.slice(0, 4).map(s => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <td style={{ padding: "10px 0", fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                        <td style={{ padding: "10px 0", fontSize: 12, color: colors.textSecondary }}>{s.course}</td>
                        <td style={{ padding: "10px 0", fontSize: 12, color: colors.textSecondary }}>{s.lab_completed}/20</td>
                        <td style={{ padding: "10px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 60, height: 4, background: "#EDF1F8", borderRadius: 10 }}>
                              <div style={{ width: `${s.progress}%`, height: "100%", background: colors.primary, borderRadius: 10 }} />
                            </div>
                            <span style={{ fontSize: 11 }}>{s.progress}%</span>
                          </div>
                        </td>
                        <td><Badge status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      case "courses":
        return (
          <div style={{
            background: colors.surface,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: 16,
            padding: isMobile ? 16 : 20,
          }}>
            <div style={{ 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between", 
              alignItems: isMobile ? "stretch" : "center", 
              gap: isMobile ? 12 : 0,
              marginBottom: 20 
            }}>
              <div>
                <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700 }}>🌐 Networking Courses</h2>
                <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>CCNA, CCNP, and professional network training</p>
              </div>
              <button style={{
                background: colors.primary,
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 40,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}>+ New Course</button>
            </div>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Course</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Instructor</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Level</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Students</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Price</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allCourses.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>
                        {c.name}
                        <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{c.duration} • {c.progress}% complete</div>
                      </td>
                      <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{c.instructor}</td>
                      <td style={{ padding: "12px 0" }}><Badge status={c.level} /></td>
                      <td style={{ padding: "12px 0", fontSize: 12 }}>{c.students}</td>
                      <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>{c.price}</td>
                      <td style={{ padding: "12px 0" }}><Badge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "payments":
        return (
          <div style={{
            background: colors.surface,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: 16,
            padding: isMobile ? 16 : 20,
          }}>
            <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, marginBottom: 20 }}>💳 Payment Transactions</h2>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Student</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Course</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Amount</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Date</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>{p.student}</td>
                      <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{p.course}</td>
                      <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 600, color: p.status === "Paid" ? colors.teal : p.status === "Pending" ? colors.amber : colors.textMuted }}>{p.amount}</td>
                      <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{p.date}</td>
                      <td><Badge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${colors.borderLight}`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: colors.textSecondary }}>Total Revenue (June): $2,874</span>
              <span style={{ fontSize: 12, color: colors.teal, fontWeight: 500 }}>↑ +15.3% vs last month</span>
            </div>
          </div>
        );

      case "students":
        return (
          <div style={{
            background: colors.surface,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: 16,
            padding: isMobile ? 16 : 20,
          }}>
            <div style={{ 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between", 
              alignItems: isMobile ? "stretch" : "center", 
              gap: isMobile ? 12 : 0,
              marginBottom: 20 
            }}>
              <div>
                <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700 }}>👨‍🎓 Student Directory</h2>
                <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>8,247 total enrolled students</p>
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 14px",
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 40,
                  fontSize: 13,
                  width: isMobile ? "100%" : 240,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Name</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Email</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Course</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Labs</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Progress</th>
                    <th style={{ textAlign: "left", padding: "10px 0", fontSize: 11, color: colors.textMuted }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudents
                    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(s => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                        <td style={{ padding: "12px 0", fontSize: 13, fontWeight: 500 }}>{s.name}</td>
                        <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{s.email}</td>
                        <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{s.course}</td>
                        <td style={{ padding: "12px 0", fontSize: 12, color: colors.textSecondary }}>{s.lab_completed}/20</td>
                        <td style={{ padding: "12px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 60, height: 4, background: "#EDF1F8", borderRadius: 10 }}>
                              <div style={{ width: `${s.progress}%`, height: "100%", background: colors.primary, borderRadius: 10 }} />
                            </div>
                            <span style={{ fontSize: 11 }}>{s.progress}%</span>
                          </div>
                        </td>
                        <td><Badge status={s.status} /></td>
                      </tr>
                    ))}
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
      display: "flex",
      minHeight: "100vh",
      background: colors.bgBase,
      fontFamily: "'Inter', -apple-system, sans-serif",
      paddingBottom: isMobile ? 70 : 0,
    }}>
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <nav style={{
          width: 260,
          background: colors.surface,
          borderRight: `1px solid ${colors.borderLight}`,
          display: "flex",
          flexDirection: "column",
          padding: "28px 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 20px",
            marginBottom: 32,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: colors.gradPrimary,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "#fff",
            }}>⚡</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>NetLab</div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>Networking Academy</div>
            </div>
          </div>

          {navItems.map(item => (
            <NavItem
              key={item.id}
              {...item}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: colors.surface,
          borderBottom: `1px solid ${colors.borderLight}`,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 99,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: colors.gradPrimary,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#fff",
            }}>⚡</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>NetLab</div>
              <div style={{ fontSize: 9, color: colors.textMuted }}>Networking Academy</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 32,
              border: `1px solid ${colors.borderLight}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, cursor: "pointer",
            }}>🔔</div>
            <div style={{
              width: 32, height: 32, borderRadius: 32,
              background: colors.gradPrimary,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>AD</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: isMobile ? "70px 16px 20px" : "32px 40px",
        overflowY: "auto",
      }}>
        {/* Page Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 0,
          marginBottom: isMobile ? 20 : 28,
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, marginBottom: 4 }}>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "courses" && "Course Catalog"}
              {activeTab === "payments" && "Payment Overview"}
              {activeTab === "students" && "Student Management"}
            </h1>
            <p style={{ color: colors.textSecondary, fontSize: isMobile ? 12 : 14 }}>
              {activeTab === "dashboard" && "Welcome back! Track your networking academy performance"}
              {activeTab === "courses" && "CCNA, CCNP, and professional network training courses"}
              {activeTab === "payments" && "Track all financial transactions and subscriptions"}
              {activeTab === "students" && "Manage and monitor student progress in networking courses"}
            </p>
          </div>
          
          {/* Desktop top bar */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 40,
                border: `1px solid ${colors.borderLight}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}>🔔</div>
              <div style={{
                width: 40, height: 40, borderRadius: 40,
                background: colors.gradPrimary,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 600, cursor: "pointer",
              }}>AD</div>
            </div>
          )}
        </div>

        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}