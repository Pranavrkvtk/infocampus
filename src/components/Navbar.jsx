import { useState, useEffect } from "react";

const NAV_LINKS = ["Courses", "Forum", "Support", "Tools", "About"];

export default function Navbar() {
  const [searchVal, setSearchVal] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [coursesOpen, setCoursesOpen] = useState(false);
  const [ciscoOpen, setCiscoOpen] = useState(false);

  const [aboutOpen, setAboutOpen] = useState(false);

  const [toolsOpen, setToolsOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();

    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  const courseItems = [
    "Network Fundamentals",
    "Cisco",
    "Routing & Switching",
    "Data Center",
    "Automation & Cloud",
    "Infrastructure Services",
    "WAN & Connectivity",
    "Troubleshooting",
    "Miscellaneous",
    "Labs",
    "Legacy",
  ];

  const ciscoCourses = [
    ["Cisco", "CCNA 200-301"],
    ["Routing & Switching", "CCNP ENCOR 350-401 v1.2"],
    ["Data Center", "CCNP ENARSI 300-410 v1.1"],
    ["Automation & Cloud", "CCIE Enterprise Infrastructure"],
    ["Infrastructure Services", "ASA Firewall"],
    ["WAN & Connectivity", "Cisco SD-WAN"],
  ];

  return (
    <nav
      style={{
        background: "#4a7fb5",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* Navbar Top */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: "62px",
        }}
      >
        {/* Logo */}
        <div>
          <span
            style={{
              color: "#fff",
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: "700",
              fontSize: isMobile ? "17px" : "20px",
            }}
          >
            CiscoCourses
          </span>
        </div>

        {/* Desktop Menu */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "8px" }}>
            {NAV_LINKS.map((link) => (
              <div
                key={link}
                style={{
                  position: "relative",
                }}
              >
                <button
                  onClick={() => {
                    if (link === "Courses") {
                      setCoursesOpen(!coursesOpen);
                    }

                    if (link === "About") {
                      setAboutOpen(!aboutOpen);
                    }

                    if (link === "Tools") {
                      setToolsOpen(!toolsOpen);
                    }
                  }}
                  style={{
                    background:
                      (coursesOpen && link === "Courses") ||
                      (aboutOpen && link === "About") ||
                      (toolsOpen && link === "Tools")
                        ? "#5b8dbf"
                        : "transparent",

                    border: "none",
                    color: "#fff",
                    fontFamily: "'Trebuchet MS', sans-serif",
                    fontSize: "15px",
                    cursor: "pointer",
                    padding: "12px 16px",

                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {link}

                  {(link === "Courses" ||
                    link === "About" ||
                    link === "Tools") && <span>▾</span>}
                </button>

                {/* Courses Dropdown */}
                {coursesOpen && link === "Courses" && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "280px",
                      background: "#4a6f9d",
                      color: "#fff",
                      padding: "10px 0",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                      zIndex: 999,
                    }}
                  >
                    {courseItems.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          position: "relative",
                          padding: "14px 18px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontFamily: "'Trebuchet MS', sans-serif",
                          fontSize: "15px",
                          cursor: "pointer",
                        }}
                      >
                        <span>{item}</span>

                        {[
                          "Cisco",
                          "Routing & Switching",
                          "Data Center",
                          "Automation & Cloud",
                          "Infrastructure Services",
                          "WAN & Connectivity",
                          "Legacy",
                        ].includes(item) && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();

                              if (item === "Cisco") {
                                setCiscoOpen(!ciscoOpen);
                              }
                            }}
                            style={{
                              fontSize: "22px",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            +
                          </span>
                        )}

                        {/* Cisco Submenu */}
                        {ciscoOpen && item === "Cisco" && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: "100%",
                              width: "360px",
                              background: "#4a6f9d",
                              color: "#fff",
                              boxShadow:
                                "0 6px 20px rgba(0,0,0,0.2)",
                              zIndex: 1000,
                            }}
                          >
                            {ciscoCourses.map((course, index) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: "18px 20px",
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.08)",
                                  fontFamily:
                                    "'Trebuchet MS', sans-serif",
                                }}
                              >
                                <span>{course[0]}</span>
                                <span>{course[1]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <div style={{ padding: "14px 18px" }}>
                      ➕ New Lessons
                    </div>

                    <div style={{ padding: "14px 18px" }}>
                      ✏️ Updated Lessons
                    </div>

                    <div style={{ padding: "14px 18px" }}>
                      💡 Lesson Ideas
                    </div>
                  </div>
                )}

                {/* Tools Dropdown */}
                {toolsOpen && link === "Tools" && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "260px",
                      background: "#4a6f9d",
                      color: "#fff",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                      zIndex: 999,
                    }}
                  >
                    {[
                      "Packet Captures",
                      "Resources",
                      "Practice Exams",
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "18px 20px",
                          fontSize: "15px",
                          fontFamily:
                            "'Trebuchet MS', sans-serif",
                          borderBottom:
                            i !== 2
                              ? "1px solid rgba(255,255,255,0.08)"
                              : "none",
                          cursor: "pointer",
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* About Dropdown */}
                {aboutOpen && link === "About" && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "300px",
                      background: "#4a6f9d",
                      color: "#fff",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                      zIndex: 999,
                    }}
                  >
                    {[
                      "Free Account",
                      "Discounts and Promotions",
                      "Network Engineering Training for Teams",
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "18px 20px",
                          fontSize: "15px",
                          fontFamily:
                            "'Trebuchet MS', sans-serif",
                          borderBottom:
                            i !== 2
                              ? "1px solid rgba(255,255,255,0.08)"
                              : "none",
                          cursor: "pointer",
                          lineHeight: "1.5",
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Desktop Search */}
        {!isMobile && (
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search..."
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "none",
              outline: "none",
            }}
          />
        )}

        {/* Mobile Button */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "28px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        )}
      </div>

{/* Mobile Menu */}
{isMobile && mobileMenuOpen && (
  <div
    style={{
      background: "#4a6f9d",
      width: "100%",
      color: "#fff",
      fontFamily: "'Trebuchet MS', sans-serif",
    }}
  >
    {/* Courses */}
    <div>
      <div
        onClick={() => setCoursesOpen(!coursesOpen)}
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span>Courses</span>
        <span>{coursesOpen ? "−" : "+"}</span>
      </div>

      {coursesOpen && (
        <div style={{ background: "#3d5f88" }}>
          {courseItems.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "14px 30px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {item}
            </div>
          ))}

          {/* Cisco Courses */}
          <div
            onClick={() => setCiscoOpen(!ciscoOpen)}
            style={{
              padding: "14px 30px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Cisco Courses</span>
            <span>{ciscoOpen ? "−" : "+"}</span>
          </div>

          {ciscoOpen && (
            <div style={{ background: "#34506f" }}>
              {ciscoCourses.map((course, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 40px",
                    borderBottom:
                      "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {course[1]}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

    {/* Forum */}
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      Forum
    </div>

    {/* Support */}
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      Support
    </div>

    {/* Tools */}
    <div>
      <div
        onClick={() => setToolsOpen(!toolsOpen)}
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span>Tools</span>
        <span>{toolsOpen ? "−" : "+"}</span>
      </div>

      {toolsOpen && (
        <div style={{ background: "#3d5f88" }}>
          {[
            "Packet Captures",
            "Resources",
            "Practice Exams",
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "14px 30px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* About */}
    <div>
      <div
        onClick={() => setAboutOpen(!aboutOpen)}
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span>About</span>
        <span>{aboutOpen ? "−" : "+"}</span>
      </div>

      {aboutOpen && (
        <div style={{ background: "#3d5f88" }}>
          {[
            "Free Account",
            "Discounts and Promotions",
            "Network Engineering Training for Teams",
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "14px 30px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Mobile Search */}
    <div style={{ padding: "16px 20px" }}>
      <input
        value={searchVal}
        onChange={(e) => setSearchVal(e.target.value)}
        placeholder="Search..."
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "6px",
          border: "none",
          outline: "none",
        }}
      />
    </div>
  </div>
)}
    </nav>
  );
}