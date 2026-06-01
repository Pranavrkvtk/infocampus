import { useState } from "react";

const syllabusData = {
  title: "CCNP ENCOR 350-401",
  subtitle: "Cisco Certified Network Professional - Enterprise Core",
  duration: "150+ Hours",
  modules: [
    {
      id: 1,
      title: "Architecture",
      weight: "15%",
      color: "#00c6ff",
      topics: [
        "Enterprise network design (2-tier, 3-tier, fabric)",
        "High availability techniques (FHRP, SSO, NSF)",
        "Wireless deployment models (centralized, distributed, cloud)",
        "SD-Access architecture and components",
        "SD-WAN architecture and components",
        "QoS concepts (DSCP, CoS, queuing, shaping, policing)",
        "Network virtualization (VRF, GRE, IPsec)",
        "Campus and branch design considerations",
      ],
    },
    {
      id: 2,
      title: "Virtualization",
      weight: "10%",
      color: "#a855f7",
      topics: [
        "Device virtualization technologies (hypervisors, VMs, containers)",
        "Virtual network functions (VNF) and service chaining",
        "Network function virtualization (NFV) infrastructure",
        "LISP and VXLAN concepts",
        "Virtual switching (vSwitch, vDS)",
        "Cloud deployment models (IaaS, SaaS, PaaS)",
        "Cisco SD-Access fabric roles",
        "Overlay and underlay network concepts",
      ],
    },
    {
      id: 3,
      title: "Infrastructure",
      weight: "30%",
      color: "#10b981",
      topics: [
        "Layer 2 technologies (VLANs, trunking, EtherChannel)",
        "Spanning Tree Protocol (RSTP, MST)",
        "IPv4/IPv6 routing protocols (OSPF, EIGRP, BGP)",
        "Route filtering and redistribution",
        "Multicast routing (PIM, IGMP, RP)",
        "MPLS fundamentals (LDP, MPLS forwarding)",
        "DMVPN phases 1, 2, and 3",
        "Quality of Service implementation",
        "Network Address Translation (NAT) types",
        "IPv6 transition mechanisms (6to4, NAT64, tunneling)",
      ],
    },
    {
      id: 4,
      title: "Network Assurance",
      weight: "10%",
      color: "#f59e0b",
      topics: [
        "Troubleshooting methodologies",
        "SNMP v2c and v3 configuration",
        "NetFlow and IPFIX",
        "Syslog severity levels and configuration",
        "SPAN, RSPAN, ERSPAN",
        "IP SLA for network monitoring",
        "Cisco DNA Center assurance",
        "Packet capture and analysis tools",
      ],
    },
    {
      id: 5,
      title: "Security",
      weight: "20%",
      color: "#ef4444",
      topics: [
        "Network security design (defense-in-depth)",
        "AAA using RADIUS and TACACS+",
        "ACLs (standard, extended, named, time-based)",
        "Zone-based firewall (ZBF) concepts",
        "CoPP (Control Plane Policing)",
        "802.1X port-based authentication",
        "MACsec encryption",
        "TrustSec and SGT concepts",
        "VPN technologies (IPsec, DMVPN, FlexVPN)",
        "Web filtering and email security concepts",
      ],
    },
    {
      id: 6,
      title: "Automation",
      weight: "15%",
      color: "#06b6d4",
      topics: [
        "Python scripting for network automation",
        "REST API interaction (GET, POST, PUT, DELETE)",
        "Ansible playbooks for network configuration",
        "Cisco DNA Center APIs",
        "YANG models and NETCONF/RESTCONF",
        "Model-driven telemetry (gRPC, gNMI)",
        "Puppet and Chef for infrastructure automation",
        "Git version control for network configs",
      ],
    },
  ],
};

export default function CCNA300() {
  const [expandedModule, setExpandedModule] = useState(null);

  return (
    <div style={styles.root}>
      <div style={styles.bgGrid} />

      <div style={styles.page}>
        {/* Header */}
        <div style={styles.syllabusHeader}>
          <div>
            <div style={styles.examCode}>Exam: 350-401</div>
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
              <span style={styles.metaValue}>MCQ + Lab</span>
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

        {/* Legend */}
        <div style={styles.weightLegend}>
          {syllabusData.modules.map((m) => (
            <span key={m.id} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: m.color }} />
              {m.title} ({m.weight})
            </span>
          ))}
        </div>

        {/* Modules */}
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
                  <span style={{ ...styles.moduleWeight, color: mod.color }}>{mod.weight}</span>
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
  page: {
    position: "relative",
    zIndex: 1,
    maxWidth: 860,
    margin: "0 auto",
    padding: "40px 24px 80px",
    animation: "fadeUp 0.35s ease both",
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
    fontSize: 32,
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