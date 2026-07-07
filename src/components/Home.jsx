import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

// ✅ Function to get home page configuration from localStorage
const getHomeConfig = () => {
  const saved = localStorage.getItem('homePageConfig');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

// ✅ Default config if nothing is saved
const DEFAULT_CONFIG = {
  bannerText: "Unlock Free Cisco Lessons – No Credit Card Needed!",
  bannerButtonText: "Sign up for Free",
  bannerButtonColor: "#3abf94",
  bannerBgColor: "#f5c842",
  welcomeNewUserMessage: "🎉 Welcome to Infocampus! Your account is ready — let's start your first lesson.",
  welcomeReturningNoCourses: "🌟 Ready to begin your journey? Explore our courses and start learning today!",
  welcomeReturningWithCourses: "👋 Welcome back! Continue learning from where you left off.",
  welcomeNewUserBg: "linear-gradient(135deg, #e5a800 0%, #f5c842 100%)",
  welcomeNoCoursesBg: "linear-gradient(135deg, #714B67 0%, #5B3A63 100%)",
  welcomeWithCoursesBg: "linear-gradient(135deg, #3abf94 0%, #2e9d7a 100%)",
  ctaButtonText: "Browse Courses →",
  ctaButtonBg: "#e5a800",
  ctaButtonTextColor: "#fff",
  taglineLine1: "Complex networking topics explained in the simplest way possible...",
  taglineLine2: "Including Cisco CCNA, CCNP and CCIE Enterprise Infrastructure.",
  featuresBgColor: "#5b8dbf",
  features: [
    {
      icon: "🏅",
      title: "Exclusive Content",
      desc: "809 lessons and I am constantly adding new lessons, videos and reference material. Everything is explained in the simplest way possible."
    },
    {
      icon: "❤️",
      title: "Start for Free",
      desc: "Create your free account and start learning right away. Explore 328 free lessons, experience our teaching style, and learn at your own pace."
    },
    {
      icon: "📢",
      title: "Community Forum",
      desc: "Do you still have questions after viewing some of the lessons? We have a community forum where we help out members with answers."
    }
  ],
  trainingTopics: [
    ["Subnetting", "Switching", "Spanning-Tree", "Frame-Relay"],
    ["RIP", "EIGRP", "OSPF", "BGP"],
    ["Multicast", "IPv6", "QoS", "MPLS"],
    ["Security", "IP Routing", "Network Services", "Linux"],
    ["GRE", "IOS", "DMVPN", "PIM"],
    ["NAT", "ACL", "VPN", "IPSec"]
  ],
  trainingTopicColor: "#3a7fc1",
  trainingTopicHoverColor: "#e5a800",
  instructorTitle: "Stop Struggling & Start Learning",
  instructorText: "My name is Rene, and I am here to help you to achieve your goals. Do you want to upgrade your skills? Want to start a career in networking? Become a CCIE in Enterprise Infrastructure? Let me help you! After teaching Cisco classroom courses for several years I decided to share my knowledge online on Infocampus.com.",
  instructorName: "Rene Molenaar",
  instructorTitle2: "CCIE #41726, founder of Infocampus.com (and primary course author)",
  instructorBgStart: "#4a7fb5",
  instructorBgEnd: "#6fa3d0",
  testimonialsBg: "#f0f2f5",
  testimonials: [
    {
      name: "ETHAN MORISSETTE",
      role: "Network Analyst",
      date: "March 18, 2025",
      title: "Beyond Expectations",
      text: "What can I say... infocampus.com is such a well put together site. The content helped me build my knowledge, link certain topics together, and deepen my understanding of networking. I really love that they included additional resources about note taking and building a home lab. Something I had never seen before is an instructor of a site reaching out (and actually replying) when you subscribe. Thank you for your hard work!",
      initials: "EM",
      color: "#7aa3c8"
    },
    {
      name: "MURAT BILGIN",
      role: "Senior Systems Analyst",
      date: "December 17, 2024",
      title: "Clear and Concise",
      text: "Preparing for my ENRSI, I am a visual learner and learn best from examples. I like that I can follow along using CML/GNS3 to understand the basics and mechanics, then try to build a more difficult lab. Everything so far has been clear and concise.",
      initials: "MB",
      color: "#6b9abf"
    },
    {
      name: "FARRAKH GILANI",
      role: "Network Engineer",
      date: "March 19, 2025",
      title: "Ideal for Certification",
      text: "infocampus.com is simply the best trainer. Topics are explained in a way that makes them easy to understand. The content's quality and clear explanations make it ideal for certification or increasing your knowledge on a topic. Highly recommended!",
      initials: "FG",
      color: "#5b8dbf"
    }
  ],
  testimonialsSignupText: "3414 people signed up the last 30 days!"
};

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(false);
  const [checkingEnrollments, setCheckingEnrollments] = useState(true);
  const navigate = useNavigate();

  // ✅ Get home config
  const homeConfig = getHomeConfig() || DEFAULT_CONFIG;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      const seenKey = `hasSeenHomeBefore_${token}`;
      const hasSeenBefore = localStorage.getItem(seenKey);

      if (hasSeenBefore) {
        setIsNewUser(false);
      } else {
        setIsNewUser(true);
        localStorage.setItem(seenKey, "true");
      }

      checkEnrolledCourses(token);
    } else {
      setCheckingEnrollments(false);
    }
  }, []);

  const checkEnrolledCourses = async (token) => {
    try {
      const response = await api.get("/users/has-enrolled-courses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHasEnrolledCourses(response.data.hasEnrolledCourses);
    } catch (error) {
      console.error("Error checking enrolled courses:", error);
      setHasEnrolledCourses(false);
    } finally {
      setCheckingEnrollments(false);
    }
  };

  const getAbsoluteUrl = (url) => {
    if (!url) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const BACKEND_BASE = "http://localhost:8082";
    return `${BACKEND_BASE}${url}`;
  };

  useEffect(() => {
    api
      .get("/public/home-video")
      .then((res) => {
        const url = res.data.videoUrl || "";
        setVideoUrl(getAbsoluteUrl(url));
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setVideoUrl("");
        setLoading(false);
      });
  }, []);

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return (
      url.includes("youtube.com/watch") ||
      url.includes("youtu.be/") ||
      url.includes("youtube.com/embed")
    );
  };

  const getYouTubeEmbedUrl = (url) => {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/watch")) {
      const params = new URLSearchParams(url.split("?")[1]);
      videoId = params.get("v") || "";
    } else if (url.includes("youtube.com/embed")) {
      videoId = url.split("/embed/")[1]?.split("?")[0] || "";
    }
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`
      : null;
  };

  const renderVideo = () => {
    if (loading) {
      return (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#aaa" }}>
          Loading video...
        </div>
      );
    }

    if (!videoUrl) {
      return (
        <div
          style={{
            background: "#1a1a1a",
            padding: "60px 20px",
            textAlign: "center",
            color: "#666",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
          }}
        >
          <span style={{ fontSize: 64, marginBottom: 16 }}>🎬</span>
          <p style={{ fontSize: 18, color: "#888" }}>No video set</p>
          <p style={{ fontSize: 14, color: "#555" }}>
            Admin can upload a video in the dashboard.
          </p>
        </div>
      );
    }

    if (isYouTubeUrl(videoUrl)) {
      const embedUrl = getYouTubeEmbedUrl(videoUrl);
      if (!embedUrl) {
        return (
          <div style={{ padding: "40px", textAlign: "center", color: "#ff6b6b" }}>
            Invalid YouTube URL
          </div>
        );
      }
      return (
        <iframe
          src={embedUrl}
          title="Home Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: "100%",
            height: "400px",
            display: "block",
            backgroundColor: "#000",
          }}
          key={embedUrl}
        />
      );
    }

    return (
      <video
        autoPlay
        muted
        loop
        controls
        controlsList="nodownload"
        preload="metadata"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          backgroundColor: "#000",
        }}
        key={videoUrl}
        onError={(e) => {
          console.error("❌ Video load error:", videoUrl);
          e.target.style.display = "none";
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        Your browser does not support HTML5 video.
      </video>
    );
  };

  // ✅ Updated: Use config for welcome messages
  const getWelcomeMessage = () => {
    if (!isLoggedIn) return null;
    
    if (isNewUser) {
      return {
        message: homeConfig.welcomeNewUserMessage,
        bgColor: homeConfig.welcomeNewUserBg,
        textColor: "#1a1a1a",
        btnText: "Start Learning →"
      };
    }
    
    if (!hasEnrolledCourses) {
      return {
        message: homeConfig.welcomeReturningNoCourses,
        bgColor: homeConfig.welcomeNoCoursesBg,
        textColor: "#fff",
        btnText: "Explore Courses →"
      };
    }
    
    return {
      message: homeConfig.welcomeReturningWithCourses,
      bgColor: homeConfig.welcomeWithCoursesBg,
      textColor: "#fff",
      btnText: "Continue Learning →"
    };
  };

  const welcome = getWelcomeMessage();
  const showWelcome = !checkingEnrollments && isLoggedIn && welcome;

  // ✅ Updated: CTA button text based on user state
  const getCtaText = () => {
    if (!isLoggedIn) return "Browse Courses →";
    if (isNewUser) return "Start Learning →";
    if (!hasEnrolledCourses) return "Explore Courses →";
    return "Continue Learning →";
  };

  return (
    <div
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        minHeight: "100vh",
        background: "#f8f8f6",
      }}
    >
      {/* ✅ Top Banner - Using config */}
      {!isLoggedIn && (
        <div
          style={{
            background: homeConfig.bannerBgColor,
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
            {homeConfig.bannerText}
          </span>
          <Link to="/free-account" style={{ textDecoration: "none" }}>
            <button
              style={{
                background: homeConfig.bannerButtonColor,
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 18px",
                fontFamily: "'Trebuchet MS', sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? "13px" : "15px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {homeConfig.bannerButtonText}
            </button>
          </Link>
        </div>
      )}

      {/* Welcome message for logged in users */}
      {showWelcome && (
        <div
          style={{
            background: welcome.bgColor,
            padding: "12px 16px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: 500,
              fontSize: isMobile ? "13px" : "15px",
              color: welcome.textColor,
            }}
          >
            {welcome.message}
          </span>
        </div>
      )}

      {/* Main Content */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: isMobile ? "20px 12px 48px" : "40px 20px 60px",
        }}
      >
        {/* Video Player */}
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            borderRadius: isMobile ? "6px" : "10px",
            overflow: "hidden",
            boxShadow: "0 6px 32px rgba(0,0,0,0.16)",
            background: "#111",
          }}
        >
          {renderVideo()}
        </div>

        {/* ✅ CTA buttons - Using config */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => navigate("/my-courses")}
            style={{
              marginTop: isMobile ? "24px" : "36px",
              background: homeConfig.ctaButtonBg,
              color: homeConfig.ctaButtonTextColor,
              border: "none",
              borderRadius: "7px",
              padding: isMobile ? "13px 28px" : "16px 48px",
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? "15px" : "18px",
              cursor: "pointer",
              boxShadow: `0 4px 18px ${homeConfig.ctaButtonBg}4D`,
              width: isMobile ? "100%" : "auto",
            }}
          >
            {getCtaText()}
          </button>
        </div>

        {/* ✅ Tagline - Using config */}
        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            lineHeight: "1.7",
            padding: "0 8px",
          }}
        >
          <p
            style={{
              color: "#444",
              fontSize: isMobile ? "14px" : "16px",
              margin: "0",
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          >
            {homeConfig.taglineLine1}
          </p>
          <p
            style={{
              color: "#444",
              fontSize: isMobile ? "14px" : "16px",
              margin: "0",
              fontFamily: "'Trebuchet MS', sans-serif",
            }}
          >
            {homeConfig.taglineLine2}
          </p>
        </div>
      </main>

      {/* ✅ FeaturesSection - Using config */}
      <FeaturesSection isMobile={isMobile} config={homeConfig} />
      
      {/* ✅ TrainingSection - Using config */}
      <TrainingSection isMobile={isMobile} config={homeConfig} />
      
      {/* ✅ TestimonialsSection - Using config */}
      <TestimonialsSection isMobile={isMobile} config={homeConfig} />
      
      {/* ✅ InstructorSection - Using config */}
      <InstructorSection isMobile={isMobile} config={homeConfig} />
    </div>
  );
}

// ============ FEATURES SECTION - UPDATED ============
function FeaturesSection({ isMobile, config }) {
  // Use config features or fallback to defaults
  const features = config?.features || [
    {
      icon: "🏅",
      title: "Exclusive Content",
      desc: "809 lessons and I am constantly adding new lessons, videos and reference material. Everything is explained in the simplest way possible."
    },
    {
      icon: "❤️",
      title: "Start for Free",
      desc: "Create your free account and start learning right away. Explore 328 free lessons, experience our teaching style, and learn at your own pace."
    },
    {
      icon: "📢",
      title: "Community Forum",
      desc: "Do you still have questions after viewing some of the lessons? We have a community forum where we help out members with answers."
    }
  ];

  return (
    <section
      style={{
        background: config?.featuresBgColor || "#5b8dbf",
        padding: isMobile ? "48px 20px" : "64px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: isMobile ? "40px" : "32px",
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "0 16px",
            }}
          >
            <div style={{ marginBottom: "20px", opacity: 0.95, fontSize: "48px" }}>
              {f.icon || "⭐"}
            </div>
            <h3
              style={{
                color: "#fff",
                fontFamily: "'Trebuchet MS', sans-serif",
                fontWeight: 400,
                fontSize: isMobile ? "22px" : "24px",
                margin: "0 0 16px",
                letterSpacing: "0.2px",
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.88)",
                fontFamily: "'Trebuchet MS', sans-serif",
                fontSize: isMobile ? "14px" : "15px",
                lineHeight: "1.7",
                margin: 0,
                maxWidth: "320px",
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============ TRAINING SECTION - UPDATED ============
function TrainingSection({ isMobile, config }) {
  const topics = config?.trainingTopics || [
    ["Subnetting", "Switching", "Spanning-Tree", "Frame-Relay"],
    ["RIP", "EIGRP", "OSPF", "BGP"],
    ["Multicast", "IPv6", "QoS", "MPLS"],
    ["Security", "IP Routing", "Network Services", "Linux"],
    ["GRE", "IOS", "DMVPN", "PIM"],
    ["NAT", "ACL", "VPN", "IPSec"],
  ];

  const topicColor = config?.trainingTopicColor || "#3a7fc1";
  const topicHoverColor = config?.trainingTopicHoverColor || "#e5a800";

  return (
    <section
      style={{
        background: "#fff",
        padding: isMobile ? "48px 20px" : "64px 40px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)",
            gap: "4px 0",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {topics.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {col.map((topic, ti) => (
                <Link
                  key={ti}
                  to="/my-courses"
                  state={{ topic }}
                  style={{
                    color: topicColor,
                    fontFamily: "'Trebuchet MS', sans-serif",
                    fontWeight: 700,
                    fontSize: isMobile ? "13px" : "14.5px",
                    textDecoration: "none",
                    padding: "3px 0",
                    display: "block",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = topicHoverColor)}
                  onMouseLeave={(e) => (e.target.style.color = topicColor)}
                >
                  {topic}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ INSTRUCTOR SECTION - UPDATED ============
function InstructorSection({ isMobile, config }) {
  return (
    <section
      style={{
        background: `linear-gradient(120deg, ${config?.instructorBgStart || "#4a7fb5"} 60%, ${config?.instructorBgEnd || "#6fa3d0"} 100%)`,
        position: "relative",
        overflow: "hidden",
        minHeight: isMobile ? "auto" : "380px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "55%",
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(120,180,230,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          padding: isMobile ? "48px 24px 0" : "56px 60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "32px",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <div style={{ flex: "0 0 auto", maxWidth: isMobile ? "100%" : "480px", zIndex: 1 }}>
          <h2
            style={{
              color: "#fff",
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: 400,
              fontSize: isMobile ? "26px" : "36px",
              margin: "0 0 24px",
              lineHeight: 1.2,
              letterSpacing: "-0.2px",
            }}
          >
            {config?.instructorTitle || "Stop Struggling & Start Learning"}
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.92)",
              fontFamily: "Georgia, serif",
              fontSize: isMobile ? "14px" : "15.5px",
              lineHeight: "1.8",
              margin: "0 0 22px",
            }}
          >
            {config?.instructorText || "My name is Rene, and I am here to help you to achieve your goals. Do you want to upgrade your skills? Want to start a career in networking? Become a CCIE in Enterprise Infrastructure? Let me help you! After teaching Cisco classroom courses for several years I decided to share my knowledge online on Infocampus.com."}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              fontFamily: "'Trebuchet MS', sans-serif",
              fontSize: isMobile ? "13px" : "14.5px",
              margin: 0,
            }}
          >
            <strong style={{ color: "#fff" }}>{config?.instructorName || "Rene Molenaar"}</strong> {config?.instructorTitle2 || "CCIE #41726, founder of Infocampus.com (and primary course author)"}
          </p>
        </div>
        <div
          style={{
            flexShrink: 0,
            width: isMobile ? "220px" : "380px",
            alignSelf: "flex-end",
            position: "relative",
            zIndex: 1,
          }}
        >
          <InstructorIllustration isMobile={isMobile} />
        </div>
      </div>
    </section>
  );
}

function InstructorIllustration({ isMobile }) {
  const w = isMobile ? 220 : 380;
  const h = isMobile ? 260 : 420;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 380 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="190" cy="300" rx="160" ry="120" fill="rgba(160,210,255,0.18)" />
      <ellipse cx="190" cy="370" rx="130" ry="80" fill="#5b90c8" />
      <path d="M90 340 Q130 290 190 280 Q250 290 290 340 L310 420 L70 420 Z" fill="#5b90c8" />
      <path d="M100 330 Q80 350 75 380 Q85 390 110 385 Q130 360 140 340 Z" fill="#5b90c8" />
      <path d="M280 330 Q300 350 305 375 Q295 388 265 382 Q240 358 230 338 Z" fill="#4a7fb5" />
      <path d="M130 345 Q190 370 250 345 Q240 360 190 380 Q140 360 130 345Z" fill="#4a7fb5" />
      <rect x="172" y="240" width="36" height="44" rx="10" fill="#d4956a" />
      <ellipse cx="190" cy="200" rx="68" ry="78" fill="#d4956a" />
      <path
        d="M126 178 Q128 118 190 110 Q252 118 254 178 Q240 148 190 145 Q140 148 126 178Z"
        fill="#5c3a1e"
      />
      <path d="M124 175 Q118 195 122 215 Q126 165 135 158Z" fill="#5c3a1e" />
      <path d="M256 175 Q262 195 258 215 Q254 165 245 158Z" fill="#5c3a1e" />
      <ellipse cx="123" cy="202" rx="10" ry="14" fill="#c4845a" />
      <ellipse cx="257" cy="202" rx="10" ry="14" fill="#c4845a" />
      <ellipse cx="168" cy="196" rx="9" ry="10" fill="#fff" />
      <ellipse cx="212" cy="196" rx="9" ry="10" fill="#fff" />
      <circle cx="170" cy="197" r="5.5" fill="#3a2a1a" />
      <circle cx="214" cy="197" r="5.5" fill="#3a2a1a" />
      <circle cx="172" cy="195" r="2" fill="#fff" />
      <circle cx="216" cy="195" r="2" fill="#fff" />
      <path
        d="M158 183 Q168 178 178 182"
        stroke="#5c3a1e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M202 182 Q212 178 222 183"
        stroke="#5c3a1e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M188 205 Q184 218 188 224 Q192 226 196 224 Q200 218 192 205"
        stroke="#c4845a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M170 238 Q190 252 210 238"
        stroke="#b07040"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M172 280 L160 310 L190 300 L220 310 L208 280 L190 295 Z" fill="#4a7fb5" />
      <g transform="translate(215,310)">
        <polygon points="12,2 22,18 2,18" fill="#f5c842" opacity="0.9" />
        <polygon points="12,6 19,17 5,17" fill="#5b90c8" />
        <circle cx="12" cy="14" r="2.5" fill="#f5c842" />
      </g>
    </svg>
  );
}

// ============ TESTIMONIALS SECTION - UPDATED ============
function TestimonialsSection({ isMobile, config }) {
  const testimonials = config?.testimonials || [
    {
      name: "ETHAN MORISSETTE",
      role: "Network Analyst",
      date: "March 18, 2025",
      title: "Beyond Expectations",
      text: "What can I say... infocampus.com is such a well put together site. The content helped me build my knowledge, link certain topics together, and deepen my understanding of networking. I really love that they included additional resources about note taking and building a home lab. Something I had never seen before is an instructor of a site reaching out (and actually replying) when you subscribe. Thank you for your hard work!",
      initials: "EM",
      color: "#7aa3c8"
    },
    {
      name: "MURAT BILGIN",
      role: "Senior Systems Analyst",
      date: "December 17, 2024",
      title: "Clear and Concise",
      text: "Preparing for my ENRSI, I am a visual learner and learn best from examples. I like that I can follow along using CML/GNS3 to understand the basics and mechanics, then try to build a more difficult lab. Everything so far has been clear and concise.",
      initials: "MB",
      color: "#6b9abf"
    },
    {
      name: "FARRAKH GILANI",
      role: "Network Engineer",
      date: "March 19, 2025",
      title: "Ideal for Certification",
      text: "infocampus.com is simply the best trainer. Topics are explained in a way that makes them easy to understand. The content's quality and clear explanations make it ideal for certification or increasing your knowledge on a topic. Highly recommended!",
      initials: "FG",
      color: "#5b8dbf"
    }
  ];

  return (
    <section
      style={{
        background: config?.testimonialsBg || "#f0f2f5",
        padding: isMobile ? "48px 16px 40px" : "60px 40px 48px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "28px",
            marginBottom: "36px",
          }}
        >
          {testimonials.map((r, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", marginTop: "28px" }}>
              <div
                style={{
                  background: r.color || "#5b8dbf",
                  borderRadius: "6px 6px 0 0",
                  padding: "14px 18px 18px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  position: "relative",
                  minHeight: "80px",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "'Trebuchet MS', sans-serif",
                    fontSize: "12px",
                  }}
                >
                  {r.date}
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "-28px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    border: "3px solid #fff",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                  }}
                >
                  <AvatarSVG initials={r.initials || "AB"} color={r.color || "#5b8dbf"} />
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[...Array(5)].map((_, si) => (
                    <StarIcon key={si} />
                  ))}
                </div>
              </div>
              <div style={{ background: "#4a7fb5", padding: "10px 18px 14px", textAlign: "center" }}>
                <div
                  style={{
                    color: "#fff",
                    fontFamily: "'Trebuchet MS', sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                    letterSpacing: "0.5px",
                    marginBottom: "3px",
                  }}
                >
                  {r.name}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "'Trebuchet MS', sans-serif",
                    fontSize: "12px",
                  }}
                >
                  {r.role}
                </div>
              </div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "0 0 6px 6px",
                  padding: "20px 20px 24px",
                  flex: 1,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 700,
                    fontStyle: "italic",
                    fontSize: "15px",
                    color: "#222",
                    marginBottom: "12px",
                  }}
                >
                  {r.title}
                </div>
                <p
                  style={{
                    fontFamily: "Georgia, serif",
                    fontStyle: "italic",
                    fontSize: "14px",
                    color: "#444",
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  {r.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Trebuchet MS', sans-serif", fontSize: "16px", color: "#333" }}>
            <span style={{ color: "#e5a800", fontWeight: 700, marginRight: "4px" }}>★</span>
            <strong>{config?.testimonialsSignupText || "3414 people signed up the last 30 days!"}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

// ============ ICON COMPONENTS (unchanged) ============
function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="#f5c842">
      <polygon points="7,1 8.8,5.3 13.5,5.7 10,8.8 11.1,13.4 7,10.9 2.9,13.4 4,8.8 0.5,5.7 5.2,5.3" />
    </svg>
  );
}

function AvatarSVG({ initials, color }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" fill={color} />
      <circle cx="32" cy="24" r="12" fill="rgba(255,255,255,0.35)" />
      <ellipse cx="32" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.25)" />
      <text
        x="32"
        y="30"
        textAnchor="middle"
        fill="#fff"
        fontSize="14"
        fontWeight="700"
        fontFamily="Trebuchet MS, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}