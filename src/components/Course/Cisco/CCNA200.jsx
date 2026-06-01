import { useState } from "react";

const syllabusData = {
  title: "CCNA 200-301",
  subtitle: "Cisco Certified Network Associate",
  duration: "120+ Hours",
  modules: [
    {
      id: 1,
      title: "Network Fundamentals",
      weight: "20%",
      color: "#00c6ff",
      topics: [
        "Network components (routers, switches, firewalls, access points)",
        "Network topology architectures (2-tier, 3-tier, Spine-leaf, WAN)",
        "Physical interface and cabling types",
        "TCP and UDP protocols",
        "IPv4 addressing and subnetting",
        "IPv6 addressing and configuration",
        "Wireless principles (802.11 standards)",
        "Switching concepts (MAC table, frame flooding, ARP)",
      ],
    },
    {
      id: 2,
      title: "Network Access",
      weight: "20%",
      color: "#a855f7",
      topics: [
        "VLANs and inter-VLAN routing",
        "Trunking (802.1Q)",
        "EtherChannel (LACP, PAgP)",
        "Spanning Tree Protocol (STP, RSTP)",
        "Cisco Discovery Protocol (CDP) and LLDP",
        "Layer 2 discovery protocols",
        "AP modes and antenna types",
        "WLC configuration basics",
      ],
    },
    {
      id: 3,
      title: "IP Connectivity",
      weight: "25%",
      color: "#10b981",
      topics: [
        "Static routing configuration",
        "Default routing",
        "OSPF (single area, OSPFv2, OSPFv3)",
        "IPv4 and IPv6 static routes",
        "Router forwarding decisions",
        "Administrative distance",
        "Floating static routes",
        "Routing table components",
      ],
    },
    {
      id: 4,
      title: "IP Services",
      weight: "10%",
      color: "#f59e0b",
      topics: [
        "NAT (Static, Dynamic, PAT)",
        "NTP configuration",
        "DHCP and DHCPv6",
        "DNS operations",
        "SNMP versions and operations",
        "Syslog configuration",
        "QoS differentiating and trust boundaries",
        "SSH remote access configuration",
      ],
    },
    {
      id: 5,
      title: "Security Fundamentals",
      weight: "15%",
      color: "#ef4444",
      topics: [
        "Security threat categories (phishing, DoS, MITM)",
        "Password policies and authentication",
        "ACLs (Standard, Extended, Named)",
        "Layer 2 security (DHCP snooping, DAI, port security)",
        "AAA concepts (RADIUS, TACACS+)",
        "VPN concepts (site-to-site, remote access)",
        "Wireless security protocols (WPA2, WPA3)",
        "Device hardening best practices",
      ],
    },
    {
      id: 6,
      title: "Automation & Programmability",
      weight: "10%",
      color: "#06b6d4",
      topics: [
        "SDN architecture and controllers",
        "Cisco DNA Center overview",
        "REST APIs (CRUD operations, JSON/XML)",
        "Configuration management tools (Ansible, Puppet, Chef)",
        "Python scripting basics for networking",
        "Cisco IOS-XE programmability",
        "Model-driven telemetry",
        "YANG data models and NETCONF/RESTCONF",
      ],
    },
  ],
};

const courses = [
  { id: 1, title: "CCNA 200-301", badge: "HOT", category: "Cisco" },
  { id: 2, title: "CCNP Enterprise", badge: "NEW", category: "Cisco" },
  { id: 3, title: "CompTIA Network+", badge: null, category: "CompTIA" },
  { id: 4, title: "AWS Cloud Practitioner", badge: "NEW", category: "AWS" },
  { id: 5, title: "CEH v12", badge: null, category: "EC-Council" },
];

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  return (
    <div style={styles.root}>
      {/* Background grid */}
      <div style={styles.bgGrid} />

      {!selectedCourse ? (
        <div style={styles.listPage}>
          <header style={styles.header}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>⬡</span>
              <span style={styles.logoText}>NetAcademy</span>
            </div>
            <p style={styles.tagline}>Click a course to explore its syllabus</p>
          </header>

          <div style={styles.courseGrid}>
            {courses.map((c, i) => (
              <button
                key={c.id}
                style={{
                  ...styles.courseCard,
                  animationDelay: `${i * 80}ms`,
                  borderColor: c.id === 1 ? "#00c6ff44" : "#ffffff11",
                }}
                onClick={() => c.id === 1 && setSelectedCourse(c)}
                onMouseEnter={(e) => {
                  if (c.id === 1) {
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                    e.currentTarget.style.borderColor = "#00c6ff88";
                    e.currentTarget.style.boxShadow = "0 12px 40px #00c6ff22";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = c.id === 1 ? "#00c6ff44" : "#ffffff11";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={styles.courseTop}>
                  <span style={styles.category}>{c.category}</span>
                  {c.badge && (
                    <span
                      style={{
                        ...styles.badge,
                        background: c.badge === "HOT" ? "#ef444422" : "#10b98122",
                        color: c.badge === "HOT" ? "#ef4444" : "#10b981",
                        border: `1px solid ${c.badge === "HOT" ? "#ef444444" : "#10b98144"}`,
                      }}
                    >
                      {c.badge}
                    </span>
                  )}
                </div>
                <h3 style={styles.courseTitle}>{c.title}</h3>
                {c.id === 1 && (
                  <span style={styles.clickHint}>View Syllabus →</span>
                )}
                {c.id !== 1 && (
                  <span style={{ ...styles.clickHint, color: "#ffffff33" }}>Coming soon</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.syllabusPage}>
          <button
            style={styles.backBtn}
            onClick={() => { setSelectedCourse(null); setExpandedModule(null); }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00c6ff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#ffffff88")}
          >
            ← Back to Courses
          </button>

          <div style={styles.syllabusHeader}>
            <div>
              <div style={styles.examCode}>Exam: 200-301</div>
              <h1 style={styles.syllabusTitle}>{syllabusData.title}</h1>
              <p style={styles.syllabusSubtitle}>{syllabusData.subtitle}</p>
            </div>
            <div style={styles.metaBox}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Duration</span>
                <span style={styles.metaValue}>{syllabusData.duration}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Modules</span>
                <span style={styles.metaValue}>{syllabusData.modules.length}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Format</span>
                <span style={styles.metaValue}>MCQ + Sim</span>
              </div>
            </div>
          </div>

          {/* Weight bar */}
          <div style={styles.weightBar}>
            {syllabusData.modules.map((m) => (
              <div
                key={m.id}
                title={`${m.title}: ${m.weight}`}
                style={{
                  flex: parseInt(m.weight),
                  background: m.color,
                  height: "100%",
                  opacity: 0.85,
                  transition: "opacity 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
              />
            ))}
          </div>
          <div style={styles.weightLegend}>
            {syllabusData.modules.map((m) => (
              <span key={m.id} style={styles.legendItem}>
                <span style={{ ...styles.legendDot, background: m.color }} />
                {m.title} ({m.weight})
              </span>
            ))}
          </div>

          <div style={styles.moduleList}>
            {syllabusData.modules.map((mod, i) => (
              <div
                key={mod.id}
                style={{
                  ...styles.moduleCard,
                  borderLeft: `3px solid ${mod.color}`,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <button
                  style={styles.moduleHeader}
                  onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                >
                  <div style={styles.moduleLeft}>
                    <span style={{ ...styles.moduleNum, color: mod.color }}>
                      {String(mod.id).padStart(2, "0")}
                    </span>
                    <span style={styles.moduleName}>{mod.title}</span>
                  </div>
                  <div style={styles.moduleRight}>
                    <span style={{ ...styles.moduleWeight, color: mod.color }}>
                      {mod.weight}
                    </span>
                    <span
                      style={{
                        ...styles.chevron,
                        transform: expandedModule === mod.id ? "rotate(180deg)" : "rotate(0deg)",
                        color: mod.color,
                      }}
                    >
                      ▾
                    </span>
                  </div>
                </button>

                {expandedModule === mod.id && (
                  <ul style={styles.topicList}>
                    {mod.topics.map((topic, ti) => (
                      <li key={ti} style={styles.topicItem}>
                        <span style={{ ...styles.topicDot, background: mod.color }} />
                        {topic}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandIn {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 600px; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0d14",
    fontFamily: "'DM Sans', sans-serif",
    color: "#e2e8f0",
    position: "relative",
    overflow: "hidden",
  },
  bgGrid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg, #ffffff06 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },
  listPage: {
    position: "relative",
    zIndex: 1,
    maxWidth: 900,
    margin: "0 auto",
    padding: "60px 24px",
  },
  header: {
    marginBottom: 48,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 28,
    color: "#00c6ff",
  },
  logoText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    color: "#fff",
  },
  tagline: {
    color: "#ffffff55",
    fontSize: 14,
    letterSpacing: "0.04em",
    fontFamily: "'Space Mono', monospace",
  },
  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
  },
  courseCard: {
    background: "#12151f",
    border: "1px solid #ffffff11",
    borderRadius: 12,
    padding: "20px 22px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    animation: "fadeUp 0.4s ease both",
  },
  courseTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  category: {
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#ffffff44",
    fontFamily: "'Space Mono', monospace",
  },
  badge: {
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 20,
    fontWeight: 700,
    letterSpacing: "0.06em",
    fontFamily: "'Space Mono', monospace",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#fff",
    marginBottom: 8,
  },
  clickHint: {
    fontSize: 12,
    color: "#00c6ff",
    fontFamily: "'Space Mono', monospace",
  },
  syllabusPage: {
    position: "relative",
    zIndex: 1,
    maxWidth: 860,
    margin: "0 auto",
    padding: "40px 24px 80px",
    animation: "fadeUp 0.35s ease both",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#ffffff88",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
    marginBottom: 32,
    padding: 0,
    transition: "color 0.2s",
    display: "block",
  },
  syllabusHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 24,
    marginBottom: 36,
  },
  examCode: {
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#00c6ff",
    fontFamily: "'Space Mono', monospace",
    marginBottom: 8,
  },
  syllabusTitle: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 36,
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.1,
    marginBottom: 6,
  },
  syllabusSubtitle: {
    color: "#ffffff55",
    fontSize: 15,
  },
  metaBox: {
    display: "flex",
    gap: 24,
    background: "#12151f",
    border: "1px solid #ffffff11",
    borderRadius: 12,
    padding: "16px 24px",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 10,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#ffffff33",
    fontFamily: "'Space Mono', monospace",
  },
  metaValue: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: "'Space Mono', monospace",
    color: "#fff",
  },
  weightBar: {
    display: "flex",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    gap: 2,
    marginBottom: 12,
  },
  weightLegend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 16px",
    marginBottom: 36,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    color: "#ffffff66",
    fontFamily: "'Space Mono', monospace",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  moduleList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  moduleCard: {
    background: "#12151f",
    border: "1px solid #ffffff0d",
    borderRadius: 10,
    overflow: "hidden",
    animation: "fadeUp 0.4s ease both",
    transition: "border-color 0.2s",
  },
  moduleHeader: {
    width: "100%",
    background: "none",
    border: "none",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    color: "inherit",
  },
  moduleLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  moduleNum: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    fontWeight: 700,
    minWidth: 24,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: 500,
    color: "#e2e8f0",
  },
  moduleRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  moduleWeight: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    fontWeight: 700,
  },
  chevron: {
    fontSize: 18,
    transition: "transform 0.25s ease",
    display: "inline-block",
  },
  topicList: {
    listStyle: "none",
    padding: "4px 20px 18px 52px",
    borderTop: "1px solid #ffffff08",
    animation: "expandIn 0.3s ease both",
    overflow: "hidden",
  },
  topicItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "6px 0",
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  topicDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: 6,
    opacity: 0.7,
  },
};