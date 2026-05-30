import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function WatchDemoPage({ isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const demoVideo = location.state?.demoVideo;

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const onBack = () => navigate(-1);

  // Guard: if someone lands here directly with no data
  if (!demoVideo) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          fontFamily: "'Trebuchet MS', sans-serif",
          background: "#f8f8f6",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎬</div>
        <h2 style={{ color: "#1a1a2e", marginBottom: "12px" }}>No Demo Selected</h2>
        <p style={{ fontSize: "16px", color: "#555", marginBottom: "32px" }}>
          Please go back to courses and select a demo to watch.
        </p>
        <button
          onClick={onBack}
          style={{
            padding: "14px 32px",
            background: "#3abf94",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: 700,
            fontFamily: "'Trebuchet MS', sans-serif",
          }}
        >
          ← Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        minHeight: "100vh",
        background: "#f8f8f6",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          padding: isMobile ? "16px" : "20px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "3px solid #3abf94",
        }}
      >
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
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
          }
        >
          ← Back to Courses
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🎬</span>
          <h1
            style={{
              color: "#fff",
              margin: 0,
              fontSize: isMobile ? "20px" : "28px",
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          >
            Course Demo Preview
          </h1>
        </div>

        <div
          style={{
            background: "rgba(58,191,148,0.2)",
            padding: "8px 16px",
            borderRadius: "20px",
          }}
        >
          <span
            style={{
              color: "#3abf94",
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: 600,
            }}
          >
            Watch &amp; Learn
          </span>
        </div>
      </div>

      {/* ── Video Hero ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)",
          padding: isMobile ? "40px 20px" : "60px 40px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Video Player */}
          <div
            style={{
              position: "relative",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                background: "#000",
              }}
            >
              {/* Loading overlay */}
              {!isVideoLoaded && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0a0a2a",
                    zIndex: 1,
                  }}
                >
                  <div style={{ textAlign: "center", color: "#fff" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      🎬
                    </div>
                    <p style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                      Loading demo video…
                    </p>
                  </div>
                </div>
              )}

              <iframe
                src={demoVideo.videoUrl}
                title="Course Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsVideoLoaded(true)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* Video Info */}
          <div style={{ color: "#fff" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  background: "#3abf94",
                  padding: "6px 16px",
                  borderRadius: "30px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "'Trebuchet MS', sans-serif",
                }}
              >
                📺 Exclusive Preview
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "6px 16px",
                  borderRadius: "30px",
                  fontSize: "14px",
                  fontFamily: "'Trebuchet MS', sans-serif",
                }}
              >
                ⏱ {demoVideo.duration} mins
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "6px 16px",
                  borderRadius: "30px",
                  fontSize: "14px",
                  fontFamily: "'Trebuchet MS', sans-serif",
                }}
              >
                👨‍🏫 {demoVideo.instructor}
              </span>
            </div>

            <h2
              style={{
                fontSize: isMobile ? "28px" : "42px",
                marginBottom: "16px",
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {demoVideo.title}
            </h2>
            <p
              style={{
                fontSize: isMobile ? "16px" : "18px",
                lineHeight: "1.7",
                color: "rgba(255,255,255,0.9)",
                maxWidth: "800px",
                fontFamily: "'Trebuchet MS', sans-serif",
              }}
            >
              {demoVideo.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── What You'll Experience ── */}
      <div
        style={{
          padding: isMobile ? "48px 20px" : "64px 40px",
          background: "#fff",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                background: "#e8f5e9",
                color: "#2e7d32",
                padding: "6px 16px",
                borderRadius: "30px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "'Trebuchet MS', sans-serif",
              }}
            >
              📖 In This Demo
            </span>
            <h2
              style={{
                fontSize: isMobile ? "28px" : "36px",
                marginTop: "16px",
                color: "#1a1a2e",
                fontFamily: "'Trebuchet MS', sans-serif",
              }}
            >
              What You'll Experience
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "32px",
            }}
          >
            {[
              {
                icon: "🌐",
                title: "Real-World Labs",
                desc: "Hands-on packet tracer simulations & CLI practice",
              },
              {
                icon: "🎯",
                title: "Exam Strategies",
                desc: "Tips to pass CCNA/CCNP on first attempt",
              },
              {
                icon: "🚀",
                title: "Network Automation",
                desc: "Python & Ansible for modern networks",
              },
              {
                icon: "🔒",
                title: "Security Best Practices",
                desc: "Firewalls, VPNs, and access control",
              },
              {
                icon: "⚡",
                title: "Troubleshooting",
                desc: "Step-by-step debugging techniques",
              },
              {
                icon: "🏆",
                title: "Career Guidance",
                desc: "How to land high-paying network roles",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#f8fafc",
                  borderRadius: "20px",
                  padding: "28px 24px",
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "44px", marginBottom: "16px" }}>
                  {item.icon}
                </div>
                <h3
                  style={{
                    marginBottom: "10px",
                    color: "#1e3a8a",
                    fontFamily: "'Trebuchet MS', sans-serif",
                    fontSize: "18px",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: "#475569",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily: "'Trebuchet MS', sans-serif",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div
        style={{
          background: "#f0f2f5",
          padding: isMobile ? "48px 20px" : "64px 40px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: isMobile ? "28px" : "34px",
              marginBottom: "16px",
              color: "#1a1a2e",
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          >
            Ready to Start Your Journey?
          </h2>
          <p
            style={{
              color: "#555",
              marginBottom: "32px",
              fontSize: "16px",
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          >
            Get full access to all courses, labs, and certification guides
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/enroll")}
              style={{
                background: "#3abf94",
                color: "#fff",
                border: "none",
                borderRadius: "50px",
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Trebuchet MS', sans-serif",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              🎓 Enroll Now — 30% Off
            </button>
            <button
              onClick={onBack}
              style={{
                background: "transparent",
                color: "#3abf94",
                border: "2px solid #3abf94",
                borderRadius: "50px",
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Trebuchet MS', sans-serif",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(58,191,148,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              📚 Browse All Courses
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          background: "#1a1a2e",
          padding: "32px 20px",
          textAlign: "center",
          color: "#aaa",
          fontFamily: "'Trebuchet MS', sans-serif",
          fontSize: "14px",
        }}
      >
        <p style={{ margin: 0 }}>
          © 2025 Cisco Networking Academy — Empowering Network Engineers
          Worldwide
        </p>
      </div>
    </div>
  );
}