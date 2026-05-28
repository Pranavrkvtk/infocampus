import { useState, useEffect } from "react";

export default function NetworkLessons() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();

    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        minHeight: "100vh",
        background: "#f8f8f6",
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          background: "#f5c842",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "10px 16px",
          flexWrap: "wrap",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 500,
            fontSize: isMobile ? "13px" : "15px",
            color: "#1a1a1a",
          }}
        >
          Unlock Free Cisco Lessons – No Credit Card Needed!
        </span>

        <button
          style={{
            background: "#3abf94",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 18px",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "13px" : "15px",
            cursor: "pointer",
          }}
        >
          Sign up for Free
        </button>
      </div>

      {/* Main Content */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: isMobile
            ? "20px 12px 48px"
            : "40px 20px 60px",
        }}
      >
        {/* Video Section */}
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 6px 32px rgba(0,0,0,0.16)",
            background: "#111",
          }}
        >
          {/* Thumbnail */}
          <div
            style={{
              width: "100%",
              aspectRatio: "16/9",
              background:
                "linear-gradient(135deg, #2c3e50 0%, #4a6d8c 60%, #c0392b 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: isMobile ? "30px" : "42px",
            }}
          >
            👨‍💻
          </div>

          {/* Controls */}
          <div
            style={{
              background: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              padding: "10px 14px",
              gap: "12px",
            }}
          >
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ▶
            </button>

            <div
              style={{
                flex: 1,
                height: "4px",
                background: "#444",
                borderRadius: "2px",
              }}
            >
              <div
                style={{
                  width: "8%",
                  height: "100%",
                  background: "#3abf94",
                }}
              />
            </div>

            <span
              style={{
                color: "#aaa",
                fontSize: "11px",
                fontFamily: "monospace",
              }}
            >
              01:42
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          style={{
            marginTop: "36px",
            background: "#3abf94",
            color: "#fff",
            border: "none",
            borderRadius: "7px",
            padding: isMobile
              ? "13px 28px"
              : "16px 48px",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "15px" : "18px",
            cursor: "pointer",
            width: isMobile ? "100%" : "auto",
          }}
        >
          Browse all Cisco Courses
        </button>

        {/* Text */}
        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            lineHeight: "1.7",
            padding: "0 10px",
          }}
        >
          <p
            style={{
              color: "#444",
              fontSize: isMobile ? "14px" : "16px",
              margin: 0,
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          >
            Complex networking topics explained in the simplest
            way possible...
          </p>

          <p
            style={{
              color: "#444",
              fontSize: isMobile ? "14px" : "16px",
              margin: 0,
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          >
            Including Cisco CCNA, CCNP and CCIE Enterprise
            Infrastructure.
          </p>
        </div>
      </main>

      {/* Training Section */}
      <TrainingSection isMobile={isMobile} />
    </div>
  );
}

function TrainingSection({ isMobile }) {
  const topics = [
    ["Subnetting", "Switching", "Spanning-Tree"],
    ["RIP", "EIGRP", "OSPF"],
    ["Multicast", "IPv6", "QoS"],
    ["Security", "IP Routing", "Linux"],
    ["GRE", "IOS", "DMVPN"],
    ["NAT", "ACL", "VPN"],
  ];

  return (
    <section
      style={{
        background: "#fff",
        padding: isMobile
          ? "48px 20px"
          : "64px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Heading */}
        <h2
          style={{
            color: "#e5a800",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? "24px" : "34px",
            marginBottom: "20px",
          }}
        >
          Pick your Hands-On Training Category
        </h2>

        {/* Subtitle */}
        <p
          style={{
            color: "#333",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontSize: isMobile ? "14px" : "15px",
            lineHeight: "1.7",
            maxWidth: "860px",
            margin: "0 auto 40px",
          }}
        >
          Beginner in networking or professional? We offer Cisco
          lessons for all levels.
        </p>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(6, 1fr)",
            gap: "10px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {topics.map((column, columnIndex) => (
            <div
              key={columnIndex}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {column.map((topic, topicIndex) => (
                <button
                  key={topicIndex}
                  type="button"
                  style={{
                    color: "#3a7fc1",
                    fontFamily:
                      "'Trebuchet MS', sans-serif",
                    fontWeight: 700,
                    fontSize: isMobile ? "13px" : "14px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}