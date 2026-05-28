import { useState, useEffect } from "react";

const NAV_LINKS = ["Courses", "Forum", "Support", "Tools", "About"];

export default function Navbar() {
  const [searchVal, setSearchVal] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [coursesOpen, setCoursesOpen] =
    useState(false);

  const [toolsOpen, setToolsOpen] =
    useState(false);

  const [aboutOpen, setAboutOpen] =
    useState(false);

  const [ciscoOpen, setCiscoOpen] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  useEffect(() => {
    const check = () =>
      setIsMobile(window.innerWidth < 768);

    check();

    window.addEventListener("resize", check);

    return () =>
      window.removeEventListener("resize", check);
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
    "CCNA 200-301",
    "CCNP ENCOR 350-401",
    "CCNP ENARSI 300-410",
    "CCIE Enterprise Infrastructure",
    "ASA Firewall",
    "Cisco SD-WAN",
  ];

  return (
    <nav
      style={{
        background: "#4a7fb5",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.12)",
        position: "relative",
        zIndex: 100,
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      {/* Navbar Top */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          padding: isMobile
            ? "0 14px"
            : "0 20px",

          height: isMobile
            ? "56px"
            : "62px",

          width: "100%",

          maxWidth: "100vw",

          overflow: "hidden",

          position: "relative",

          boxSizing: "border-box",
        }}
      >
        {/* Logo */}
        <span
          style={{
            color: "#fff",
            fontFamily:
              "'Trebuchet MS', sans-serif",
            fontWeight: "700",
            fontSize: isMobile
              ? "15px"
              : "20px",
            whiteSpace: "nowrap",
          }}
        >
          CiscoCourses
        </span>

        {/* Desktop Menu */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
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
                      setCoursesOpen(
                        !coursesOpen
                      );
                    }

                    if (link === "Tools") {
                      setToolsOpen(
                        !toolsOpen
                      );
                    }

                    if (link === "About") {
                      setAboutOpen(
                        !aboutOpen
                      );
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: "15px",
                    fontFamily:
                      "'Trebuchet MS', sans-serif",
                    cursor: "pointer",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {link}

                  {(link === "Courses" ||
                    link === "Tools" ||
                    link === "About") && (
                    <span>▾</span>
                  )}
                </button>

                {/* Courses Dropdown */}
                {coursesOpen &&
                  link === "Courses" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "280px",
                        background:
                          "#4a6f9d",
                        color: "#fff",
                        zIndex: 999,
                      }}
                    >
                      {courseItems.map(
                        (item, i) => (
                          <div
                            key={i}
                            style={{
                              padding:
                                "15px 18px",
                              borderBottom:
                                "1px solid rgba(255,255,255,0.08)",
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              position:
                                "relative",
                            }}
                          >
                            <span>{item}</span>

                            {item ===
                              "Cisco" && (
                              <span
                                onClick={() =>
                                  setCiscoOpen(
                                    !ciscoOpen
                                  )
                                }
                                style={{
                                  cursor:
                                    "pointer",
                                  fontSize:
                                    "20px",
                                }}
                              >
                                +
                              </span>
                            )}

                            {/* Cisco Submenu */}
                            {ciscoOpen &&
                              item ===
                                "Cisco" && (
                                <div
                                  style={{
                                    position:
                                      "absolute",
                                    left:
                                      "100%",
                                    top: 0,
                                    width:
                                      "320px",
                                    background:
                                      "#4a6f9d",
                                  }}
                                >
                                  {ciscoCourses.map(
                                    (
                                      course,
                                      index
                                    ) => (
                                      <div
                                        key={
                                          index
                                        }
                                        style={{
                                          padding:
                                            "16px 18px",
                                          borderBottom:
                                            "1px solid rgba(255,255,255,0.08)",
                                        }}
                                      >
                                        {
                                          course
                                        }
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                {/* Tools Dropdown */}
                {toolsOpen &&
                  link === "Tools" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "260px",
                        background:
                          "#4a6f9d",
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
                            padding:
                              "16px 18px",
                            borderBottom:
                              "1px solid rgba(255,255,255,0.08)",
                            color: "#fff",
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}

                {/* About Dropdown */}
                {aboutOpen &&
                  link === "About" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "300px",
                        background:
                          "#4a6f9d",
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
                            padding:
                              "16px 18px",
                            borderBottom:
                              "1px solid rgba(255,255,255,0.08)",
                            color: "#fff",
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {/* Search */}
            <input
              value={searchVal}
              onChange={(e) =>
                setSearchVal(e.target.value)
              }
              placeholder="Search..."
              style={{
                padding: "9px 12px",
                borderRadius: "6px",
                border: "none",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Mobile Button */}
        {isMobile && (
          <button
            onClick={() =>
              setMobileMenuOpen(
                !mobileMenuOpen
              )
            }
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",

              fontSize: "30px",

              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              width: "44px",
              height: "44px",

              minWidth: "44px",

              flexShrink: 0,

              position: "absolute",

              right: "10px",

              top: "50%",

              transform:
                "translateY(-50%)",

              touchAction:
                "manipulation",
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

            maxWidth: "100vw",

            overflowX: "hidden",

            color: "#fff",

            fontFamily:
              "'Trebuchet MS', sans-serif",

            boxSizing: "border-box",
          }}
        >
          {/* Courses */}
          <div>
            <div
              onClick={() =>
                setCoursesOpen(
                  !coursesOpen
                )
              }
              style={mobileMenuStyle}
            >
              <span>Courses</span>

              <span>
                {coursesOpen ? "−" : "+"}
              </span>
            </div>

            {coursesOpen && (
              <div
                style={{
                  background: "#3f6797",
                }}
              >
                {courseItems.map(
                  (item, i) => (
                    <div
                      key={i}
                      style={{
                        padding:
                          "14px 30px",
                        borderBottom:
                          "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {item}
                    </div>
                  )
                )}

                {/* Cisco Courses */}
                <div
                  onClick={() =>
                    setCiscoOpen(
                      !ciscoOpen
                    )
                  }
                  style={{
                    padding: "14px 30px",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    cursor: "pointer",
                  }}
                >
                  <span>
                    Cisco Courses
                  </span>

                  <span>
                    {ciscoOpen
                      ? "−"
                      : "+"}
                  </span>
                </div>

                {ciscoOpen && (
                  <div
                    style={{
                      background:
                        "#34506f",
                    }}
                  >
                    {ciscoCourses.map(
                      (
                        course,
                        index
                      ) => (
                        <div
                          key={index}
                          style={{
                            padding:
                              "14px 40px",
                            borderBottom:
                              "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          {course}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Forum */}
          <div style={mobileMenuStyle}>
            Forum
          </div>

          {/* Support */}
          <div style={mobileMenuStyle}>
            Support
          </div>

          {/* Tools */}
          <div>
            <div
              onClick={() =>
                setToolsOpen(!toolsOpen)
              }
              style={mobileMenuStyle}
            >
              <span>Tools</span>

              <span>
                {toolsOpen ? "−" : "+"}
              </span>
            </div>

            {toolsOpen && (
              <div
                style={{
                  background: "#3f6797",
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
                      padding:
                        "14px 30px",
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
              onClick={() =>
                setAboutOpen(!aboutOpen)
              }
              style={mobileMenuStyle}
            >
              <span>About</span>

              <span>
                {aboutOpen ? "−" : "+"}
              </span>
            </div>

            {aboutOpen && (
              <div
                style={{
                  background: "#3f6797",
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
                      padding:
                        "14px 30px",
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

          {/* Search */}
          <div
            style={{
              padding: "16px 18px",
            }}
          >
            <input
              value={searchVal}
              onChange={(e) =>
                setSearchVal(e.target.value)
              }
              placeholder="Search..."
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "6px",
                border: "none",
                outline: "none",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

const mobileMenuStyle = {
  padding: "16px 18px",
  borderBottom:
    "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
};