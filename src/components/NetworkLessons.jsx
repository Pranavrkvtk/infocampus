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
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f8f8f6" }}>
      {/* Top Banner */}
      <div style={{
        background: "#f5c842",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "10px 16px",
        flexWrap: "wrap",
        textAlign: "center",
      }}>
        <span style={{ fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 500, fontSize: isMobile ? "13px" : "15px", color: "#1a1a1a" }}>
          Unlock Free Cisco Lessons – No Credit Card Needed!
        </span>
        <button style={{
          background: "#3abf94",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          padding: "8px 18px",
          fontFamily: "'Trebuchet MS', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? "13px" : "15px",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}>
          Sign up for Free
        </button>
      </div>



      {/* Main Content */}
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "20px 12px 48px" : "40px 20px 60px" }}>
        {/* Video Player */}
        <div style={{
          width: "100%",
          maxWidth: "680px",
          borderRadius: isMobile ? "6px" : "10px",
          overflow: "hidden",
          boxShadow: "0 6px 32px rgba(0,0,0,0.16)",
          background: "#111",
        }}>
          {/* Thumbnail */}
          <div style={{
            width: "100%",
            aspectRatio: "16/9",
            background: "linear-gradient(135deg, #2c3e50 0%, #4a6d8c 60%, #c0392b 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(0,0,0,0.07) 18px, rgba(0,0,0,0.07) 19px)",
            }} />
            <div style={{
              position: "absolute", right: "12%", top: "10%", bottom: "0",
              width: isMobile ? "60px" : "90px",
              background: "rgba(0,0,0,0.3)", borderRadius: "4px 4px 0 0",
              display: "flex", flexDirection: "column", padding: "6px", gap: "4px",
            }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ height: "9px", background: "rgba(255,255,255,0.13)", borderRadius: "2px" }} />
              ))}
            </div>
            <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
              <div style={{
                width: isMobile ? "52px" : "80px", height: isMobile ? "52px" : "80px",
                borderRadius: "50%", background: "rgba(255,255,255,0.13)",
                margin: "0 auto 8px", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: isMobile ? "24px" : "36px",
              }}>?????</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "'Trebuchet MS', sans-serif" }}>
                NetworkLessons.com
              </div>
            </div>
            <div style={{
              position: "absolute", left: "10px", bottom: "44px",
              background: "rgba(0,0,0,0.7)", color: "#fff",
              fontFamily: "monospace", fontSize: "11px",
              padding: "2px 6px", borderRadius: "3px",
            }}>01:42</div>
          </div>

          {/* Video Controls */}
          <div style={{
            background: "#1a1a1a", display: "flex", alignItems: "center",
            padding: isMobile ? "8px 10px" : "8px 14px",
            gap: isMobile ? "8px" : "12px",
          }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: "18px", display: "flex", flexShrink: 0 }}>?</button>
            <div style={{ flex: 1, height: "4px", background: "#444", borderRadius: "2px" }}>
              <div style={{ width: "8%", height: "100%", background: "#3abf94", borderRadius: "2px" }} />
            </div>
            <span style={{ color: "#aaa", fontSize: "11px", fontFamily: "monospace", flexShrink: 0 }}>01:42</span>
            {["??", "CC", "?", "?", "?"].map((icon, i) => (
              <button key={i} style={{
                background: "none", border: "none", cursor: "pointer", color: "#ccc",
                fontSize: isMobile ? "11px" : "13px", padding: "2px",
                display: isMobile && i > 2 ? "none" : "block",
              }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button style={{
          marginTop: isMobile ? "24px" : "36px",
          background: "#3abf94", color: "#fff", border: "none",
          borderRadius: "7px",
          padding: isMobile ? "13px 28px" : "16px 48px",
          fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 700,
          fontSize: isMobile ? "15px" : "18px", cursor: "pointer",
          boxShadow: "0 4px 18px rgba(58,191,148,0.3)",
          width: isMobile ? "100%" : "auto",
        }}>
          Browse all Cisco Courses
        </button>

        {/* Tagline */}
        <div style={{ marginTop: "24px", textAlign: "center", lineHeight: "1.7", padding: "0 8px" }}>
          <p style={{ color: "#444", fontSize: isMobile ? "14px" : "16px", margin: "0", fontFamily: "'Trebuchet MS', sans-serif" }}>
            Complex networking topics explained in the simplest way possible...
          </p>
          <p style={{ color: "#444", fontSize: isMobile ? "14px" : "16px", margin: "0", fontFamily: "'Trebuchet MS', sans-serif" }}>
            Including Cisco CCNA, CCNP and CCIE Enterprise Infrastructure.
          </p>
        </div>
      </main>

      {/* Features Section */}
      <FeaturesSection isMobile={isMobile} />

      {/* Training Category Section */}
      <TrainingSection isMobile={isMobile} />

      {/* Testimonials Section */}
      <TestimonialsSection isMobile={isMobile} />

      {/* Instructor Section */}
      <InstructorSection isMobile={isMobile} />
    </div>
  );
}

function FeaturesSection({ isMobile }) {
  const features = [
    {
      icon: <MedalIcon />,
      title: "Exclusive Content",
      desc: "809 lessons and I am constantly adding new lessons, videos and reference material. Everything is explained in the simplest way possible.",
    },
    {
      icon: <HeartIcon />,
      title: "Start for Free",
      desc: "Create your free account and start learning right away. Explore 328 free lessons, experience our teaching style, and learn at your own pace.",
    },
    {
      icon: <MegaphoneIcon />,
      title: "Community Forum",
      desc: "Do you still have questions after viewing some of the lessons? We have a community forum where we help out members with answers.",
    },
  ];

  return (
    <section style={{
      background: "#5b8dbf",
      padding: isMobile ? "48px 20px" : "64px 40px",
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: isMobile ? "40px" : "32px",
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 16px",
          }}>
            <div style={{ marginBottom: "20px", opacity: 0.95 }}>
              {f.icon}
            </div>
            <h3 style={{
              color: "#fff",
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: 400,
              fontSize: isMobile ? "22px" : "24px",
              margin: "0 0 16px",
              letterSpacing: "0.2px",
            }}>
              {f.title}
            </h3>
            <p style={{
              color: "rgba(255,255,255,0.88)",
              fontFamily: "'Trebuchet MS', sans-serif",
              fontSize: isMobile ? "14px" : "15px",
              lineHeight: "1.7",
              margin: 0,
              maxWidth: "320px",
            }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>


      
    </section>
  );
}

function TrainingSection({ isMobile }) {
  const topics = [
    ["Subnetting", "Switching", "Spanning-Tree", "Frame-Relay"],
    ["RIP", "EIGRP", "OSPF", "BGP"],
    ["Multicast", "IPv6", "QoS", "MPLS"],
    ["Security", "IP Routing", "Network Services", "Linux"],
    ["GRE", "IOS", "DMVPN", "PIM"],
    ["NAT", "ACL", "VPN", "IPSec"],
  ];

  return (
    <section style={{ background: "#fff", padding: isMobile ? "48px 20px" : "64px 40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
        {/* Heading */}
        <h2 style={{
          color: "#e5a800",
          fontFamily: "'Trebuchet MS', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? "24px" : "34px",
          margin: "0 0 20px",
          letterSpacing: "-0.3px",
        }}>
          Pick your Hands-On Training Category
        </h2>

        {/* Subtitle */}
        <p style={{
          color: "#333",
          fontFamily: "'Trebuchet MS', sans-serif",
          fontSize: isMobile ? "14px" : "15.5px",
          lineHeight: "1.7",
          maxWidth: "860px",
          margin: "0 auto 40px",
        }}>
          Beginner in networking or professional? We offer Cisco lessons for all levels. If you have never worked in IT before then you will enjoy the CCNA lessons while experts will love the CCIE lessons. My lessons will help you to prepare for popular certifications like:
        </p>

        {/* Cert Logos */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? "24px" : "60px",
          flexWrap: "wrap",
          marginBottom: "44px",
        }}>
          {/* CCNA Badge */}
          <CiscoBadge label="CCNA" />
          {/* CCNP Badge */}
          <CiscoBadge label="CCNP" />
          {/* CCIE Badge */}
          <CCIEBadge />
        </div>

        {/* Other topics label */}
        <p style={{
          color: "#444",
          fontFamily: "'Trebuchet MS', sans-serif",
          fontSize: "15px",
          marginBottom: "24px",
        }}>
          Or any of our other topics
        </p>

        {/* Topics Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(6, 1fr)",
          gap: "4px 0",
          maxWidth: "900px",
          margin: "0 auto",
        }}>
          {topics.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {col.map((topic, ti) => (
                <a key={ti} href="#" style={{
                  color: "#3a7fc1",
                  fontFamily: "'Trebuchet MS', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? "13px" : "14.5px",
                  textDecoration: "none",
                  padding: "3px 0",
                  display: "block",
                  transition: "color 0.15s",
                }}
                  onMouseEnter={e => e.target.style.color = "#e5a800"}
                  onMouseLeave={e => e.target.style.color = "#3a7fc1"}
                >
                  {topic}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CiscoBadge({ label }) {
  return (
    <div style={{
      width: "140px",
      borderRadius: "16px",
      border: "2px solid #1d6b72",
      overflow: "hidden",
      boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
      background: "#fff",
    }}>
      {/* Top: white area with logo */}
      <div style={{
        background: "#fff",
        padding: "16px 16px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}>
        {/* Cisco signal bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", marginBottom: "4px" }}>
          {[6,9,12,15,12,9,6].map((h, i) => (
            <div key={i} style={{ width: "5px", height: `${h}px`, background: "#1d6b72", borderRadius: "1px" }} />
          ))}
        </div>
        {/* CISCO text */}
        <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "22px", color: "#c8102e", letterSpacing: "2px" }}>
          CISCO
        </div>
        <div style={{ fontSize: "8px", color: "#888", letterSpacing: "1px", marginTop: "-4px" }}>™</div>
      </div>
      {/* Bottom: teal label */}
      <div style={{
        background: "#1d6b72",
        color: "#fff",
        fontFamily: "'Trebuchet MS', sans-serif",
        fontWeight: 700,
        fontSize: "18px",
        letterSpacing: "3px",
        padding: "10px 0",
        textAlign: "center",
      }}>
        {label}
      </div>
    </div>
  );
}

function CCIEBadge() {
  return (
    <div style={{ textAlign: "center", width: "160px" }}>
      {/* Outer ring with laurel feel */}
      <div style={{
        position: "relative",
        width: "150px",
        height: "150px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Decorative ring */}
        <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: "absolute", top: 0, left: 0 }}>
          <circle cx="75" cy="75" r="70" fill="none" stroke="#bbb" strokeWidth="1.5" strokeDasharray="4 3"/>
          <circle cx="75" cy="75" r="62" fill="none" stroke="#ccc" strokeWidth="0.8"/>
          {/* Laurel leaves hint */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 360;
            const rad = (angle * Math.PI) / 180;
            const x1 = 75 + 66 * Math.cos(rad);
            const y1 = 75 + 66 * Math.sin(rad);
            const x2 = 75 + 58 * Math.cos(rad);
            const y2 = 75 + 58 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#bbb" strokeWidth="1.5"/>;
          })}
        </svg>
        {/* Inner content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", fontFamily: "'Trebuchet MS', sans-serif", marginBottom: "2px" }}>CISCO</div>
          <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", fontFamily: "'Trebuchet MS', sans-serif", marginBottom: "4px" }}>CERTIFIED</div>
          <div style={{
            fontFamily: "Georgia, serif", fontWeight: 700,
            fontSize: "38px", color: "#c8102e", lineHeight: 1,
            letterSpacing: "1px",
          }}>CCIE</div>
          <div style={{ fontSize: "9px", color: "#555", letterSpacing: "2px", fontFamily: "'Trebuchet MS', sans-serif", marginTop: "4px" }}>ENTERPRISE</div>
        </div>
      </div>
    </div>
  );
}

function InstructorSection({ isMobile }) {
  return (
    <section style={{
      background: "linear-gradient(120deg, #4a7fb5 60%, #6fa3d0 100%)",
      position: "relative",
      overflow: "hidden",
      minHeight: isMobile ? "auto" : "380px",
      display: "flex",
      alignItems: "center",
    }}>
      {/* Subtle radial glow on the right */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        width: "55%",
        background: "radial-gradient(ellipse at 80% 50%, rgba(120,180,230,0.35) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        width: "100%",
        padding: isMobile ? "48px 24px 0" : "56px 60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "32px",
        flexDirection: isMobile ? "column" : "row",
      }}>
        {/* Text side */}
        <div style={{ flex: "0 0 auto", maxWidth: isMobile ? "100%" : "480px", zIndex: 1 }}>
          <h2 style={{
            color: "#fff",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 400,
            fontSize: isMobile ? "26px" : "36px",
            margin: "0 0 24px",
            lineHeight: 1.2,
            letterSpacing: "-0.2px",
          }}>
            Stop Struggling &amp; Start Learning
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.92)",
            fontFamily: "Georgia, serif",
            fontSize: isMobile ? "14px" : "15.5px",
            lineHeight: "1.8",
            margin: "0 0 22px",
          }}>
            "My name is Rene Molenaar, and I am here to help you to achieve your goals. Do you want to upgrade your skills? Want to start a career in networking? Become a CCIE in Enterprise Infrastructure? Let me help you! After teaching Cisco classroom courses for several years I decided to share my knowledge online on NetworkLessons.com."
          </p>
          <p style={{
            color: "rgba(255,255,255,0.9)",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontSize: isMobile ? "13px" : "14.5px",
            margin: 0,
          }}>
            <strong style={{ color: "#fff" }}>Rene Molenaar</strong> CCIE #41726, founder of NetworkLessons.com (and primary course author)
          </p>
        </div>

        {/* Instructor illustration */}
        <div style={{
          flexShrink: 0,
          width: isMobile ? "220px" : "380px",
          alignSelf: "flex-end",
          position: "relative",
          zIndex: 1,
        }}>
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
    <svg width={w} height={h} viewBox="0 0 380 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Subtle glow behind figure */}
      <ellipse cx="190" cy="300" rx="160" ry="120" fill="rgba(160,210,255,0.18)"/>

      {/* Body / shirt - blue polo */}
      <ellipse cx="190" cy="370" rx="130" ry="80" fill="#5b90c8"/>
      <path d="M90 340 Q130 290 190 280 Q250 290 290 340 L310 420 L70 420 Z" fill="#5b90c8"/>

      {/* Arms crossed */}
      {/* Left arm */}
      <path d="M100 330 Q80 350 75 380 Q85 390 110 385 Q130 360 140 340 Z" fill="#5b90c8"/>
      {/* Right arm over left */}
      <path d="M280 330 Q300 350 305 375 Q295 388 265 382 Q240 358 230 338 Z" fill="#4a7fb5"/>
      {/* Arms crossing band */}
      <path d="M130 345 Q190 370 250 345 Q240 360 190 380 Q140 360 130 345Z" fill="#4a7fb5"/>

      {/* Neck */}
      <rect x="172" y="240" width="36" height="44" rx="10" fill="#d4956a"/>

      {/* Head */}
      <ellipse cx="190" cy="200" rx="68" ry="78" fill="#d4956a"/>

      {/* Hair */}
      <path d="M126 178 Q128 118 190 110 Q252 118 254 178 Q240 148 190 145 Q140 148 126 178Z" fill="#5c3a1e"/>
      {/* Hair sides */}
      <path d="M124 175 Q118 195 122 215 Q126 165 135 158Z" fill="#5c3a1e"/>
      <path d="M256 175 Q262 195 258 215 Q254 165 245 158Z" fill="#5c3a1e"/>

      {/* Ears */}
      <ellipse cx="123" cy="202" rx="10" ry="14" fill="#c4845a"/>
      <ellipse cx="257" cy="202" rx="10" ry="14" fill="#c4845a"/>

      {/* Eyes */}
      <ellipse cx="168" cy="196" rx="9" ry="10" fill="#fff"/>
      <ellipse cx="212" cy="196" rx="9" ry="10" fill="#fff"/>
      <circle cx="170" cy="197" r="5.5" fill="#3a2a1a"/>
      <circle cx="214" cy="197" r="5.5" fill="#3a2a1a"/>
      <circle cx="172" cy="195" r="2" fill="#fff"/>
      <circle cx="216" cy="195" r="2" fill="#fff"/>

      {/* Eyebrows */}
      <path d="M158 183 Q168 178 178 182" stroke="#5c3a1e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M202 182 Q212 178 222 183" stroke="#5c3a1e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* Nose */}
      <path d="M188 205 Q184 218 188 224 Q192 226 196 224 Q200 218 192 205" stroke="#c4845a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Smile */}
      <path d="M170 238 Q190 252 210 238" stroke="#b07040" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* Polo collar */}
      <path d="M172 280 L160 310 L190 300 L220 310 L208 280 L190 295 Z" fill="#4a7fb5"/>

      {/* Logo on shirt */}
      <g transform="translate(215,310)">
        <polygon points="12,2 22,18 2,18" fill="#f5c842" opacity="0.9"/>
        <polygon points="12,6 19,17 5,17" fill="#5b90c8"/>
        <circle cx="12" cy="14" r="2.5" fill="#f5c842"/>
      </g>
    </svg>
  );
}

function TestimonialsSection({ isMobile }) {
  const reviews = [
    {
      name: "ETHAN MORISSETTE",
      role: "Network Analyst",
      date: "March 18, 2025",
      title: "Beyond Expectations",
      text: "What can I say... NetworkLessons.com is such a well put together site. The content helped me build my knowledge, link certain topics together, and deepen my understanding of networking. I really love that they included additional resources about note taking and building a home lab. Something I had never seen before is an instructor of a site reaching out (and actually replying) when you subscribe. Thank you for your hard work!",
      initials: "EM",
      color: "#7aa3c8",
    },
    {
      name: "MURAT BILGIN",
      role: "Senior Systems Analyst",
      date: "December 17, 2024",
      title: "Clear and Concise",
      text: "Preparing for my ENRSI, I am a visual learner and learn best from examples. I like that I can follow along using CML/GNS3 to understand the basics and mechanics, then try to build a more difficult lab. Everything so far has been clear and concise.",
      initials: "MB",
      color: "#6b9abf",
    },
    {
      name: "FARRAKH GILANI",
      role: "Network Engineer",
      date: "March 19, 2025",
      title: "Ideal for Certification",
      text: "NetworkLessons.com is simply the best trainer. Topics are explained in a way that makes them easy to understand. The content's quality and clear explanations make it ideal for certification or increasing your knowledge on a topic. Highly recommended!",
      initials: "FG",
      color: "#5b8dbf",
    },
  ];

  return (
    <section style={{ background: "#f0f2f5", padding: isMobile ? "48px 16px 40px" : "60px 40px 48px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: "28px",
          marginBottom: "36px",
        }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", marginTop: "28px" }}>
              <div style={{
                background: "#5b8dbf",
                borderRadius: "6px 6px 0 0",
                padding: "14px 18px 18px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                position: "relative",
                minHeight: "80px",
              }}>
                <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Trebuchet MS', sans-serif", fontSize: "12px" }}>
                  {r.date}
                </div>
                <div style={{
                  position: "absolute", top: "-28px", left: "50%", transform: "translateX(-50%)",
                  width: "64px", height: "64px", borderRadius: "50%",
                  border: "3px solid #fff", overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                }}>
                  <AvatarSVG initials={r.initials} color={r.color} />
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[...Array(5)].map((_, si) => <StarIcon key={si} />)}
                </div>
              </div>
              <div style={{ background: "#4a7fb5", padding: "10px 18px 14px", textAlign: "center" }}>
                <div style={{ color: "#fff", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px", marginBottom: "3px" }}>
                  {r.name}
                </div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Trebuchet MS', sans-serif", fontSize: "12px" }}>
                  {r.role}
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: "0 0 6px 6px", padding: "20px 20px 24px", flex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontStyle: "italic", fontSize: "15px", color: "#222", marginBottom: "12px" }}>
                  {r.title}
                </div>
                <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "14px", color: "#444", lineHeight: "1.75", margin: 0 }}>
                  {r.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Trebuchet MS', sans-serif", fontSize: "16px", color: "#333" }}>
            <span style={{ color: "#e5a800", fontWeight: 700, marginRight: "4px" }}>?</span>
            <strong>3414 people</strong> signed up the last 30 days!
          </p>
        </div>
      </div>
    </section>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="#f5c842">
      <polygon points="7,1 8.8,5.3 13.5,5.7 10,8.8 11.1,13.4 7,10.9 2.9,13.4 4,8.8 0.5,5.7 5.2,5.3"/>
    </svg>
  );
}

function AvatarSVG({ initials, color }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" fill={color}/>
      <circle cx="32" cy="24" r="12" fill="rgba(255,255,255,0.35)"/>
      <ellipse cx="32" cy="54" rx="20" ry="14" fill="rgba(255,255,255,0.25)"/>
      <text x="32" y="30" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="Trebuchet MS, sans-serif">{initials}</text>
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg width="60" height="70" viewBox="0 0 60 70" fill="none">
      <circle cx="30" cy="42" r="20" stroke="white" strokeWidth="3.5" fill="none"/>
      <circle cx="30" cy="42" r="13" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M22 8 L30 2 L38 8 L36 20 L24 20 Z" stroke="white" strokeWidth="3" fill="none" strokeLinejoin="round"/>
      <line x1="24" y1="20" x2="22" y2="28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <line x1="36" y1="20" x2="38" y2="28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="62" height="58" viewBox="0 0 62 58" fill="white">
      <path d="M31 52 C31 52 4 34 4 17 C4 9 10 3 18 3 C23 3 28 6 31 11 C34 6 39 3 44 3 C52 3 58 9 58 17 C58 34 31 52 31 52Z"/>
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg width="64" height="60" viewBox="0 0 64 60" fill="none">
      <path d="M10 22 L10 38 L20 38 L20 22 Z" fill="white"/>
      <path d="M20 22 L50 8 L50 52 L20 38 Z" fill="white"/>
      <rect x="10" y="38" width="10" height="14" rx="3" fill="white"/>
      <circle cx="54" cy="30" r="5" fill="white" opacity="0.7"/>
    </svg>
  );
}


