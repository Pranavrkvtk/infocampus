import { useState } from "react";
import { Link } from "react-router-dom";

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

const NAV_BG = "#4a7fb5";
const NAV_HOVER = "#3a6fa5";
const DROPDOWN_BG = "#3a6fa5";
const DROPDOWN_HOVER = "#2e5f8f";
const CISCO_BG = "#2e5f8f";
const ACCENT = "#f5c842";
const GREEN = "#3abf94";
const FONT = "'Trebuchet MS', sans-serif";

export default function Navbar() {
  const [searchVal, setSearchVal] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [courses, setCourses] = useState(false);
  const [tools, setTools] = useState(false);
  const [about, setAbout] = useState(false);
  const [cisco, setCisco] = useState(false);

  return (
    <nav style={{ background: NAV_BG, fontFamily: FONT, position: "relative", zIndex: 100 }}>
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
        <Link to="/" style={{ textDecoration: "none", marginRight: "12px" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
            Cisco<span style={{ color: ACCENT }}>Courses</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <DesktopMenu
          searchVal={searchVal} setSearchVal={setSearchVal}
          courses={courses} setCourses={setCourses}
          tools={tools} setTools={setTools}
          about={about} setAbout={setAbout}
          cisco={cisco} setCisco={setCisco}
        />

        {/* Hamburger */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="hamburger"
          style={{
            marginLeft: "auto", background: "none", border: "none",
            color: "#fff", fontSize: "22px", cursor: "pointer",
            display: "none", padding: "6px 10px",
          }}
        >
          {mobileMenu ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <MobileMenu
          searchVal={searchVal} setSearchVal={setSearchVal}
          courses={courses} setCourses={setCourses}
          tools={tools} setTools={setTools}
          about={about} setAbout={setAbout}
          cisco={cisco} setCisco={setCisco}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
        }
        .nav-btn {
          background: none; border: none; color: #fff;
          font-family: ${FONT}; font-size: 14px; font-weight: 500;
          cursor: pointer; padding: 6px 12px; border-radius: 4px;
          transition: background 0.15s; white-space: nowrap;
        }
        .nav-btn:hover { background: ${NAV_HOVER}; }
        .dd-row {
          padding: 9px 16px; color: #fff; font-family: ${FONT};
          font-size: 13.5px; cursor: pointer; transition: background 0.12s;
          white-space: nowrap; display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .dd-row:hover { background: ${DROPDOWN_HOVER}; }
        .cisco-row {
          padding: 9px 16px 9px 28px; color: rgba(255,255,255,0.88);
          font-family: ${FONT}; font-size: 13px; cursor: pointer;
          transition: background 0.12s;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: ${CISCO_BG};
        }
        .cisco-row:hover { background: #255080; }
        .nav-search {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3); border-radius: 5px;
          padding: 5px 10px; color: #fff; font-family: ${FONT};
          font-size: 13px; width: 150px; outline: none; transition: background 0.15s;
        }
        .nav-search::placeholder { color: rgba(255,255,255,0.6); }
        .nav-search:focus { background: rgba(255,255,255,0.22); }
      `}</style>
    </nav>
  );
}

function NavDropdown({ label, open, onToggle, children }) {
  return (
    <div style={{ position: "relative" }}>
      <button className="nav-btn" onClick={onToggle}>
        {label} <span style={{ fontSize: "10px", opacity: 0.8 }}>{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0,
          background: DROPDOWN_BG, borderRadius: "6px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.22)",
          minWidth: "210px", zIndex: 200,
          /* NO overflow:hidden — lets Cisco sub-dropdown show */
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function DesktopMenu({ searchVal, setSearchVal, courses, setCourses, tools, setTools, about, setAbout, cisco, setCisco }) {
  return (
    <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1 }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <button className="nav-btn">Home</button>
      </Link>

      {/* Courses */}
      <NavDropdown label="Courses" open={courses} onToggle={() => setCourses(!courses)}>
        {courseItems.map((item) => (
          <div key={item}>
            {/* Main course row */}
            <div className="dd-row">
              <span>{item}</span>
              {item === "Cisco" && (
                <span
                  onClick={(e) => { e.stopPropagation(); setCisco(!cisco); }}
                  style={{
                    background: cisco ? ACCENT : "rgba(255,255,255,0.2)",
                    color: cisco ? "#1a1a1a" : "#fff",
                    borderRadius: "3px", padding: "1px 8px",
                    fontSize: "15px", fontWeight: 700, cursor: "pointer",
                    lineHeight: 1.4, flexShrink: 0,
                  }}
                >
                  {cisco ? "−" : "+"}
                </span>
              )}
            </div>
            {/* Cisco sub-items render BELOW the Cisco row, inside the same dropdown flow */}
            {item === "Cisco" && cisco && (
              <div>
                {ciscoCourses.map((course) => (
                  <div key={course} className="cisco-row">{course}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </NavDropdown>

      <button className="nav-btn">Forum</button>
      <button className="nav-btn">Support</button>

      {/* Tools */}
      <NavDropdown label="Tools" open={tools} onToggle={() => setTools(!tools)}>
        {["Packet Captures", "Resources", "Practice Exams"].map(t => (
          <div key={t} className="dd-row">{t}</div>
        ))}
      </NavDropdown>

      {/* About */}
      <NavDropdown label="About" open={about} onToggle={() => setAbout(!about)}>
        <Link to="/free-account" style={{ textDecoration: "none" }}>
          <div className="dd-row">Free Account</div>
        </Link>
        <div className="dd-row">Discounts and Promotions</div>
        <div className="dd-row">Training for Teams</div>
      </NavDropdown>

      {/* Login + Search pushed right */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          className="nav-search"
          placeholder="Search..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
        <Link to="/login" style={{ textDecoration: "none" }}>
          <button
            style={{
              background: GREEN, color: "#fff", border: "none",
              borderRadius: "5px", padding: "7px 18px", fontFamily: FONT,
              fontWeight: 700, fontSize: "14px", cursor: "pointer",
              whiteSpace: "nowrap", transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#2eac82"}
            onMouseLeave={e => e.currentTarget.style.background = GREEN}
          >
            Login
          </button>
        </Link>
      </div>
    </div>
  );
}

function MobileMenu({ searchVal, setSearchVal, courses, setCourses, tools, setTools, about, setAbout, cisco, setCisco }) {
  const rowStyle = {
    padding: "13px 20px", color: "#fff", fontFamily: FONT, fontSize: "15px",
    borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  };
  const subRowStyle = {
    padding: "10px 32px", color: "rgba(255,255,255,0.85)", fontFamily: FONT,
    fontSize: "14px", borderBottom: "1px solid rgba(255,255,255,0.07)",
    cursor: "pointer", background: DROPDOWN_BG,
  };
  const ciscoSubStyle = {
    padding: "10px 44px", color: "rgba(255,255,255,0.8)", fontFamily: FONT,
    fontSize: "13px", borderBottom: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer", background: CISCO_BG,
  };

  return (
    <div style={{ background: NAV_BG, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <div style={rowStyle}>Home</div>
      </Link>

      {/* Courses */}
      <div style={rowStyle} onClick={() => setCourses(!courses)}>
        <span>Courses</span>
        <span style={{ fontSize: "12px" }}>{courses ? "▴" : "▾"}</span>
      </div>
      {courses && courseItems.map(item => (
        <div key={item}>
          {/* Course row */}
          <div
            style={{ ...subRowStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onClick={() => item === "Cisco" && setCisco(!cisco)}
          >
            <span>{item}</span>
            {item === "Cisco" && (
              <span style={{
                background: cisco ? ACCENT : "rgba(255,255,255,0.2)",
                color: cisco ? "#1a1a1a" : "#fff",
                borderRadius: "3px", padding: "1px 8px",
                fontSize: "14px", fontWeight: 700, lineHeight: 1.4,
              }}>
                {cisco ? "−" : "+"}
              </span>
            )}
          </div>
          {/* Cisco sub-items in mobile */}
          {item === "Cisco" && cisco && ciscoCourses.map(course => (
            <div key={course} style={ciscoSubStyle}>{course}</div>
          ))}
        </div>
      ))}

      <div style={rowStyle}>Forum</div>
      <div style={rowStyle}>Support</div>

      {/* Tools */}
      <div style={rowStyle} onClick={() => setTools(!tools)}>
        <span>Tools</span>
        <span style={{ fontSize: "12px" }}>{tools ? "▴" : "▾"}</span>
      </div>
      {tools && ["Packet Captures", "Resources", "Practice Exams"].map(t => (
        <div key={t} style={subRowStyle}>{t}</div>
      ))}

      {/* About */}
      <div style={rowStyle} onClick={() => setAbout(!about)}>
        <span>About</span>
        <span style={{ fontSize: "12px" }}>{about ? "▴" : "▾"}</span>
      </div>
      {about && (
        <>
          <Link to="/free-account" style={{ textDecoration: "none" }}>
            <div style={subRowStyle}>Free Account</div>
          </Link>
          <div style={subRowStyle}>Discounts and Promotions</div>
          <div style={subRowStyle}>Training for Teams</div>
        </>
      )}

      {/* Search */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <input
          className="nav-search"
          placeholder="Search..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* Login */}
      <div style={{ padding: "12px 20px" }}>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <button style={{
            background: GREEN, color: "#fff", border: "none", borderRadius: "5px",
            padding: "10px 0", width: "100%", fontFamily: FONT,
            fontWeight: 700, fontSize: "15px", cursor: "pointer",
          }}>
            Login
          </button>
        </Link>
      </div>
    </div>
  );
}