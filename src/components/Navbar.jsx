// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ===================== CONFIGURATION =====================
export const DEFAULT_CONFIG = {
  // Colors
  navBg: "#4a7fb5",
  navHover: "#3a6fa5",
  dropdownBg: "#3a6fa5",
  dropdownHover: "#2e5f8f",
  ciscoBg: "#2e5f8f",
  accent: "#f5c842",
  green: "#3abf94",
  logoutColor: "#e05252",
  logoutHover: "#c94444",
  
  // Font
  font: "'Trebuchet MS', sans-serif",
  
  // Branding
  logoText: "Info",
  logoAccent: "campus",
  logoAccentColor: "#f5c842",
  
  // Navigation Items
  navItems: [
    { id: "home", label: "Home", path: "/" },
    { id: "courses", label: "Courses", type: "dropdown" },
    { id: "tools", label: "Tools", type: "dropdown" },
    { id: "about", label: "About", type: "dropdown" }
  ],
  
  // Course Items
  courseItems: [
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
    "Legacy"
  ],
  
  // Cisco Courses
  ciscoCourses: [
    "CCNA 200-301",
    "CCNP ENCOR 350-401",
    "CCNP ENARSI 300-410",
    "CCIE Enterprise Infrastructure",
    "ASA Firewall",
    "Cisco SD-WAN"
  ],
  
  // Course Routes
  courseRoutes: {
    "CCNA 200-301": "/ccna200",
    "CCNP ENCOR 350-401": "/ccnp-encor",
    "CCNP ENARSI 300-410": "/ccnp-enarsi"
  },
  
  // Tool Items
  toolItems: [
    { label: "Packet Captures", path: "/packet-captures" },
    { label: "Resources", path: "/resources" },
    { label: "Practice Exams", path: "/practice-exam" }
  ],
  
  // About Items
  aboutItems: [
    { label: "Free Account", path: "/free-account" },
    { label: "Discounts and Promotions", path: "/discounts" },
    { label: "Training for Teams", path: "/training" }
  ],
  
  // Search
  searchPlaceholder: "Search...",
  
  // Buttons
  loginText: "Login",
  logoutText: "Logout",
  
  // Mobile
  mobileBreakpoint: 768
};

// Load config from localStorage
const loadConfig = () => {
  try {
    const saved = localStorage.getItem("navbar_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load navbar config:", e);
  }
  return DEFAULT_CONFIG;
};

// Save config to localStorage
export const saveNavbarConfig = (config) => {
  try {
    localStorage.setItem("navbar_config", JSON.stringify(config));
    return true;
  } catch (e) {
    console.error("Failed to save navbar config:", e);
    return false;
  }
};

// Get current config
export const getNavbarConfig = () => {
  return loadConfig();
};

// ===================== NAVBAR COMPONENT =====================
export default function Navbar() {
  const [config, setConfig] = useState(loadConfig);
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [cisco, setCisco] = useState(false);

  // Listen for config changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "navbar_config") {
        setConfig(loadConfig());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    closeAllMenus();
    setMobileMenu(false);
    navigate("/login");
  };

  const closeAllMenus = () => {
    setOpenMenu(null);
    setCisco(false);
  };

  const toggle = (name) => {
    if (openMenu === name) {
      closeAllMenus();
    } else {
      setOpenMenu(name);
      setCisco(false);
    }
  };

  const handleNavigation = () => {
    closeAllMenus();
    setMobileMenu(false);
  };

  const {
    navBg,
    navHover,
    dropdownBg,
    dropdownHover,
    ciscoBg,
    accent,
    green,
    logoutColor,
    logoutHover,
    font,
    logoText,
    logoAccent,
    logoAccentColor,
    searchPlaceholder,
    loginText,
    logoutText,
    courseItems,
    ciscoCourses,
    courseRoutes,
    toolItems,
    aboutItems,
    navItems
  } = config;

  return (
    <nav style={{ background: navBg, fontFamily: font, position: "relative", zIndex: 100 }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        height: "56px",
        gap: "4px",
      }}>
        {/* Logo */}
        <Link to="/" onClick={handleNavigation} style={{ textDecoration: "none", marginRight: "12px" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
            {logoText}<span style={{ color: logoAccentColor }}>{logoAccent}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <DesktopMenu
          config={config}
          searchVal={searchVal} 
          setSearchVal={setSearchVal}
          openMenu={openMenu} 
          toggle={toggle}
          cisco={cisco} 
          setCisco={setCisco}
          closeAllMenus={closeAllMenus}
          handleNavigation={handleNavigation}
          isLoggedIn={isLoggedIn}
          handleLogout={handleLogout}
        />

        {/* Hamburger */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="hamburger"
          style={{
            marginLeft: "auto", 
            background: "none", 
            border: "none",
            color: "#fff", 
            fontSize: "22px", 
            cursor: "pointer",
            display: "none", 
            padding: "6px 10px",
          }}
        >
          {mobileMenu ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <MobileMenu
          config={config}
          searchVal={searchVal} 
          setSearchVal={setSearchVal}
          openMenu={openMenu} 
          toggle={toggle}
          cisco={cisco} 
          setCisco={setCisco}
          setMobileMenu={setMobileMenu}
          closeAllMenus={closeAllMenus}
          handleNavigation={handleNavigation}
          isLoggedIn={isLoggedIn}
          handleLogout={handleLogout}
        />
      )}

      <style>{`
        @media (max-width: ${config.mobileBreakpoint}px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
        @media (min-width: ${config.mobileBreakpoint + 1}px) {
          .hamburger { display: none !important; }
        }
        .nav-btn {
          background: none; border: none; color: #fff;
          font-family: ${font}; font-size: 14px; font-weight: 500;
          cursor: pointer; padding: 6px 12px; border-radius: 4px;
          transition: background 0.15s; white-space: nowrap;
        }
        .nav-btn:hover { background: ${navHover}; }
        .nav-btn.active { background: ${navHover}; }
        .dd-row {
          padding: 9px 16px; color: #fff; font-family: ${font};
          font-size: 13.5px; cursor: pointer; transition: background 0.12s;
          white-space: nowrap; display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .dd-row:hover { background: ${dropdownHover}; }
        .cisco-row {
          padding: 9px 16px 9px 28px; color: rgba(255,255,255,0.88);
          font-family: ${font}; font-size: 13px; cursor: pointer;
          transition: background 0.12s;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: ${ciscoBg};
        }
        .cisco-row:hover { background: #255080; }
        .cisco-row-link {
          padding: 9px 16px 9px 28px; color: ${accent};
          font-family: ${font}; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.12s;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: ${ciscoBg}; display: block;
        }
        .cisco-row-link:hover { background: #255080; }
        .nav-search {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3); border-radius: 5px;
          padding: 5px 10px; color: #fff; font-family: ${font};
          font-size: 13px; width: 150px; outline: none; transition: background 0.15s;
        }
        .nav-search::placeholder { color: rgba(255,255,255,0.6); }
        .nav-search:focus { background: rgba(255,255,255,0.22); }
      `}</style>
    </nav>
  );
}

// ===================== NAV DROPDOWN =====================
function NavDropdown({ name, label, openMenu, toggle, children }) {
  const open = openMenu === name;
  const config = loadConfig();
  
  return (
    <div style={{ position: "relative" }}>
      <button className={`nav-btn${open ? " active" : ""}`} onClick={() => toggle(name)}>
        {label} <span style={{ fontSize: "10px", opacity: 0.8 }}>{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", 
          top: "calc(100% + 4px)", 
          left: 0,
          background: config.dropdownBg, 
          borderRadius: "6px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.22)",
          minWidth: "210px", 
          zIndex: 200,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ===================== DESKTOP MENU =====================
function DesktopMenu({
  config,
  searchVal, 
  setSearchVal, 
  openMenu, 
  toggle,
  cisco, 
  setCisco, 
  closeAllMenus, 
  handleNavigation,
  isLoggedIn, 
  handleLogout,
}) {
  const {
    navHover,
    dropdownBg,
    dropdownHover,
    ciscoBg,
    accent,
    green,
    logoutColor,
    logoutHover,
    font,
    courseItems,
    ciscoCourses,
    courseRoutes,
    toolItems,
    aboutItems,
    searchPlaceholder,
    loginText,
    logoutText
  } = config;

  return (
    <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1 }}>
      <Link to="/" onClick={handleNavigation} style={{ textDecoration: "none" }}>
        <button className="nav-btn">Home</button>
      </Link>

      {/* Courses */}
      <NavDropdown name="courses" label="Courses" openMenu={openMenu} toggle={toggle}>
        {courseItems.map((item) => (
          <div key={item}>
            <div className="dd-row" onClick={() => {
              if (item !== "Cisco") closeAllMenus();
            }}>
              <span>{item}</span>
              {item === "Cisco" && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setCisco(!cisco);
                  }}
                  style={{
                    background: cisco ? accent : "rgba(255,255,255,0.2)",
                    color: cisco ? "#1a1a1a" : "#fff",
                    borderRadius: "3px", 
                    padding: "1px 8px",
                    fontSize: "15px", 
                    fontWeight: 700, 
                    cursor: "pointer",
                    lineHeight: 1.4, 
                    flexShrink: 0,
                  }}
                >
                  {cisco ? "−" : "+"}
                </span>
              )}
            </div>
            {item === "Cisco" && cisco && (
              <div>
                {ciscoCourses.map((course) =>
                  courseRoutes[course] ? (
                    <Link
                      key={course}
                      to={courseRoutes[course]}
                      onClick={closeAllMenus}
                      style={{ textDecoration: "none" }}
                    >
                      <div className="cisco-row-link">{course} →</div>
                    </Link>
                  ) : (
                    <div key={course} className="cisco-row">{course}</div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </NavDropdown>

      {/* Tools */}
      <NavDropdown name="tools" label="Tools" openMenu={openMenu} toggle={toggle}>
        {toolItems.map((item) => (
          item.path ? (
            <Link key={item.label} to={item.path} onClick={closeAllMenus} style={{ textDecoration: "none" }}>
              <div className="dd-row">{item.label}</div>
            </Link>
          ) : (
            <div key={item.label} className="dd-row" onClick={closeAllMenus}>{item.label}</div>
          )
        ))}
      </NavDropdown>

      {/* About */}
      <NavDropdown name="about" label="About" openMenu={openMenu} toggle={toggle}>
        {aboutItems.map((item) => (
          item.path ? (
            <Link key={item.label} to={item.path} onClick={closeAllMenus} style={{ textDecoration: "none" }}>
              <div className="dd-row">{item.label}</div>
            </Link>
          ) : (
            <div key={item.label} className="dd-row" onClick={closeAllMenus}>{item.label}</div>
          )
        ))}
      </NavDropdown>

      {/* Right side: search + login/logout */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          className="nav-search"
          placeholder={searchPlaceholder}
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              background: logoutColor, 
              color: "#fff", 
              border: "none",
              borderRadius: "5px", 
              padding: "7px 18px", 
              fontFamily: font,
              fontWeight: 700, 
              fontSize: "14px", 
              cursor: "pointer",
              whiteSpace: "nowrap", 
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = logoutHover}
            onMouseLeave={e => e.currentTarget.style.background = logoutColor}
          >
            {logoutText}
          </button>
        ) : (
          <Link to="/login" onClick={closeAllMenus} style={{ textDecoration: "none" }}>
            <button
              style={{
                background: green, 
                color: "#fff", 
                border: "none",
                borderRadius: "5px", 
                padding: "7px 18px", 
                fontFamily: font,
                fontWeight: 700, 
                fontSize: "14px", 
                cursor: "pointer",
                whiteSpace: "nowrap", 
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#2eac82"}
              onMouseLeave={e => e.currentTarget.style.background = green}
            >
              {loginText}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ===================== MOBILE MENU =====================
function MobileMenu({
  config,
  searchVal, 
  setSearchVal, 
  openMenu, 
  toggle,
  cisco, 
  setCisco, 
  setMobileMenu, 
  closeAllMenus, 
  handleNavigation,
  isLoggedIn, 
  handleLogout,
}) {
  const {
    navBg,
    dropdownBg,
    dropdownHover,
    ciscoBg,
    accent,
    green,
    logoutColor,
    font,
    courseItems,
    ciscoCourses,
    courseRoutes,
    toolItems,
    aboutItems,
    searchPlaceholder,
    loginText,
    logoutText
  } = config;

  const rowStyle = {
    padding: "13px 20px", 
    color: "#fff", 
    fontFamily: font, 
    fontSize: "15px",
    borderBottom: "1px solid rgba(255,255,255,0.1)", 
    cursor: "pointer",
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
  };
  
  const subRowStyle = {
    padding: "10px 32px", 
    color: "rgba(255,255,255,0.85)", 
    fontFamily: font,
    fontSize: "14px", 
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    cursor: "pointer", 
    background: dropdownBg,
  };
  
  const ciscoSubStyle = {
    padding: "10px 44px", 
    color: "rgba(255,255,255,0.8)", 
    fontFamily: font,
    fontSize: "13px", 
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer", 
    background: ciscoBg,
  };
  
  const ciscoLinkStyle = {
    ...ciscoSubStyle,
    color: accent,
    fontWeight: 600,
    display: "block",
  };

  return (
    <div style={{ background: navBg, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
      <Link to="/" onClick={handleNavigation} style={{ textDecoration: "none" }}>
        <div style={rowStyle}>Home</div>
      </Link>

      {/* Courses */}
      <div style={rowStyle} onClick={() => toggle("courses")}>
        <span>Courses</span>
        <span style={{ fontSize: "12px" }}>{openMenu === "courses" ? "▴" : "▾"}</span>
      </div>
      {openMenu === "courses" && courseItems.map(item => (
        <div key={item}>
          <div
            style={{ ...subRowStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onClick={() => {
              if (item === "Cisco") {
                setCisco(!cisco);
              } else {
                closeAllMenus();
                setMobileMenu(false);
              }
            }}
          >
            <span>{item}</span>
            {item === "Cisco" && (
              <span style={{
                background: cisco ? accent : "rgba(255,255,255,0.2)",
                color: cisco ? "#1a1a1a" : "#fff",
                borderRadius: "3px", 
                padding: "1px 8px",
                fontSize: "14px", 
                fontWeight: 700, 
                lineHeight: 1.4,
              }}>
                {cisco ? "−" : "+"}
              </span>
            )}
          </div>
          {item === "Cisco" && cisco && ciscoCourses.map(course =>
            courseRoutes[course] ? (
              <Link
                key={course}
                to={courseRoutes[course]}
                style={{ textDecoration: "none" }}
                onClick={handleNavigation}
              >
                <div style={ciscoLinkStyle}>{course} →</div>
              </Link>
            ) : (
              <div key={course} style={ciscoSubStyle}>{course}</div>
            )
          )}
        </div>
      ))}

      {/* Tools */}
      <div style={rowStyle} onClick={() => toggle("tools")}>
        <span>Tools</span>
        <span style={{ fontSize: "12px" }}>{openMenu === "tools" ? "▴" : "▾"}</span>
      </div>
      {openMenu === "tools" && (
        <>
          {toolItems.map((item) => (
            item.path ? (
              <Link key={item.label} to={item.path} onClick={handleNavigation} style={{ textDecoration: "none" }}>
                <div style={subRowStyle}>{item.label}</div>
              </Link>
            ) : (
              <div key={item.label} style={subRowStyle} onClick={handleNavigation}>{item.label}</div>
            )
          ))}
        </>
      )}

      {/* About */}
      <div style={rowStyle} onClick={() => toggle("about")}>
        <span>About</span>
        <span style={{ fontSize: "12px" }}>{openMenu === "about" ? "▴" : "▾"}</span>
      </div>
      {openMenu === "about" && (
        <>
          {aboutItems.map((item) => (
            item.path ? (
              <Link key={item.label} to={item.path} onClick={handleNavigation} style={{ textDecoration: "none" }}>
                <div style={subRowStyle}>{item.label}</div>
              </Link>
            ) : (
              <div key={item.label} style={subRowStyle} onClick={handleNavigation}>{item.label}</div>
            )
          ))}
        </>
      )}

      {/* Search */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <input
          className="nav-search"
          placeholder={searchPlaceholder}
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* Login / Logout */}
      <div style={{ padding: "12px 20px" }}>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              background: logoutColor, 
              color: "#fff", 
              border: "none",
              borderRadius: "5px", 
              padding: "10px 0", 
              width: "100%",
              fontFamily: font, 
              fontWeight: 700, 
              fontSize: "15px", 
              cursor: "pointer",
            }}
          >
            {logoutText}
          </button>
        ) : (
          <Link to="/login" onClick={handleNavigation} style={{ textDecoration: "none" }}>
            <button
              style={{
                background: green, 
                color: "#fff", 
                border: "none",
                borderRadius: "5px", 
                padding: "10px 0", 
                width: "100%",
                fontFamily: font, 
                fontWeight: 700, 
                fontSize: "15px", 
                cursor: "pointer",
              }}
            >
              {loginText}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}