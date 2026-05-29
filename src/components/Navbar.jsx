import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["Courses", "Forum", "Support", "Tools", "About"];

const COURSE_ITEMS = [
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

const CISCO_COURSES = [
  "CCNA 200-301",
  "CCNP ENCOR 350-401",
  "CCNP ENARSI 300-410",
  "CCIE Enterprise Infrastructure",
  "ASA Firewall",
  "Cisco SD-WAN",
];

const TOOLS_ITEMS = ["Packet Captures", "Resources", "Practice Exams"];

const ABOUT_ITEMS = [
  "Free Account",
  "Discounts and Promotions",
  "Network Engineering Training for Teams",
];

const css = `
  .cnav *, .cnav *::before, .cnav *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cnav {
    --nav-bg: #4a7fb5;
    --nav-sub: #3d6898;
    --nav-deep: #305580;
    --nav-divider: rgba(255,255,255,0.10);
    --nav-height: 62px;
    background: var(--nav-bg);
    position: relative;
    z-index: 200;
    width: 100%;
    font-family: 'Trebuchet MS', sans-serif;
  }

  .cnav-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--nav-height);
    padding: 0 20px;
    position: relative;
  }

  .cnav-logo {
    color: #fff;
    font-weight: 700;
    font-size: 20px;
    white-space: nowrap;
    letter-spacing: -0.3px;
  }

  /* ── Desktop menu ── */
  .cnav-desktop {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cnav-hamburger { display: none; }

  /* ── Nav items & buttons ── */
  .nav-item { position: relative; }

  .nav-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 15px;
    font-family: 'Trebuchet MS', sans-serif;
    cursor: pointer;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: 4px;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .nav-btn:hover { background: rgba(255,255,255,0.12); }
  .nav-btn .caret { font-size: 11px; transition: transform 0.2s; display: inline-block; }
  .nav-item.open > .nav-btn .caret { transform: rotate(180deg); }

  /* ── Desktop dropdown ── */
  .dropdown {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 240px;
    background: var(--nav-sub);
    border-radius: 0 0 6px 6px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.22);
    z-index: 300;
    overflow: hidden;
  }
  .nav-item.open > .dropdown { display: block; }

  .dropdown-item {
    padding: 13px 18px;
    border-bottom: 1px solid var(--nav-divider);
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    transition: background 0.12s;
  }
  .dropdown-item:last-child { border-bottom: none; }
  .dropdown-item:hover { background: rgba(255,255,255,0.10); }

  .expand-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
    line-height: 1;
  }
  .expand-btn:hover { background: rgba(255,255,255,0.15); }

  /* ── Cisco subdropdown ── */
  .subdropdown {
    display: none;
    position: absolute;
    left: 100%;
    top: 0;
    min-width: 280px;
    background: var(--nav-deep);
    box-shadow: 0 6px 18px rgba(0,0,0,0.25);
    z-index: 400;
    overflow: hidden;
  }
  .cisco-row.cisco-open .subdropdown { display: block; }

  .subdropdown-item {
    padding: 13px 18px;
    border-bottom: 1px solid var(--nav-divider);
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.12s;
  }
  .subdropdown-item:last-child { border-bottom: none; }
  .subdropdown-item:hover { background: rgba(255,255,255,0.10); }

  /* ── Search ── */
  .cnav-search {
    padding: 8px 12px;
    border-radius: 6px;
    border: none;
    outline: none;
    font-size: 14px;
    background: rgba(255,255,255,0.92);
    color: #1a2d42;
    width: 160px;
    transition: width 0.2s;
  }
  .cnav-search:focus { width: 200px; background: #fff; }

  /* ── Hamburger ── */
  .cnav-hamburger {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 28px;
    cursor: pointer;
    width: 44px;
    height: 44px;
    display: none;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.15s;
  }
  .cnav-hamburger:hover { background: rgba(255,255,255,0.12); }

  /* ── Mobile menu ── */
  .cnav-mobile {
    display: none;
    background: var(--nav-sub);
    border-top: 1px solid var(--nav-divider);
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.35s ease;
  }
  .cnav-mobile.open { max-height: 2000px; }

  .mobile-item { border-bottom: 1px solid var(--nav-divider); }

  .mobile-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 18px;
    color: #fff;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.12s;
  }
  .mobile-row:hover { background: rgba(255,255,255,0.08); }

  .mobile-icon {
    background: none;
    border: none;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
  }

  .mobile-sub { display: none; background: rgba(0,0,0,0.10); }
  .mobile-item.open .mobile-sub { display: block; }

  .mobile-sub-row {
    padding: 12px 30px;
    border-bottom: 1px solid var(--nav-divider);
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.12s;
  }
  .mobile-sub-row:last-child { border-bottom: none; }
  .mobile-sub-row:hover { background: rgba(255,255,255,0.08); }

  .mobile-cisco-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mobile-deep { display: none; background: rgba(0,0,0,0.12); }
  .mobile-deep.open { display: block; }

  .mobile-deep-row {
    padding: 12px 42px;
    border-bottom: 1px solid var(--nav-divider);
    color: #fff;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.12s;
  }
  .mobile-deep-row:last-child { border-bottom: none; }
  .mobile-deep-row:hover { background: rgba(255,255,255,0.08); }

  .mobile-search-wrap { padding: 14px 18px; }
  .mobile-search {
    width: 100%;
    padding: 10px 13px;
    border-radius: 6px;
    border: none;
    outline: none;
    font-size: 14px;
    background: rgba(255,255,255,0.92);
    color: #1a2d42;
  }

  /* ── Responsive breakpoints ── */
  @media (max-width: 992px) {
    .cnav-desktop { display: none; }
    .cnav-hamburger { display: flex; }
    .cnav-mobile { display: block; }
    .cnav-logo { font-size: 17px; }
  }

  @media (max-width: 576px) {
    .cnav { --nav-height: 56px; }
    .cnav-top { padding: 0 14px; }
    .cnav-logo { font-size: 15px; }
  }
`;

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export default function Navbar() {
  const [searchVal, setSearchVal] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktop, setOpenDesktop] = useState(null); // "courses" | "tools" | "about" | null
  const [ciscoDesktopOpen, setCiscoDesktopOpen] = useState(false);

  // Mobile accordion state
  const [mCoursesOpen, setMCoursesOpen] = useState(false);
  const [mToolsOpen, setMToolsOpen] = useState(false);
  const [mAboutOpen, setMAboutOpen] = useState(false);
  const [mCiscoOpen, setMCiscoOpen] = useState(false);

  const navRef = useRef(null);
  useClickOutside(navRef, () => {
    setOpenDesktop(null);
    setCiscoDesktopOpen(false);
  });

  const toggleDesktop = (key) => {
    setOpenDesktop((prev) => (prev === key ? null : key));
    if (key !== "courses") setCiscoDesktopOpen(false);
  };

  return (
    <>
      <style>{css}</style>
      <nav className="cnav" ref={navRef}>
        <div className="cnav-top">
          <span className="cnav-logo">CiscoCourses</span>

          {/* ── Desktop menu ── */}
          <div className="cnav-desktop">
            {/* Courses */}
            <div className={`nav-item${openDesktop === "courses" ? " open" : ""}`}>
              <button className="nav-btn" onClick={() => toggleDesktop("courses")}>
                Courses <span className="caret">▾</span>
              </button>
              <div className="dropdown">
                {COURSE_ITEMS.map((item) =>
                  item === "Cisco" ? (
                    <div
                      key={item}
                      className={`dropdown-item cisco-row${ciscoDesktopOpen ? " cisco-open" : ""}`}
                    >
                      <span>{item}</span>
                      <button
                        className="expand-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCiscoDesktopOpen((p) => !p);
                        }}
                      >
                        {ciscoDesktopOpen ? "−" : "+"}
                      </button>
                      <div className="subdropdown">
                        {CISCO_COURSES.map((c) => (
                          <div key={c} className="subdropdown-item">{c}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div key={item} className="dropdown-item">
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Forum & Support — no dropdown */}
            <div className="nav-item">
              <button className="nav-btn">Forum</button>
            </div>
            <div className="nav-item">
              <button className="nav-btn">Support</button>
            </div>

            {/* Tools */}
            <div className={`nav-item${openDesktop === "tools" ? " open" : ""}`}>
              <button className="nav-btn" onClick={() => toggleDesktop("tools")}>
                Tools <span className="caret">▾</span>
              </button>
              <div className="dropdown">
                {TOOLS_ITEMS.map((item) => (
                  <div key={item} className="dropdown-item"><span>{item}</span></div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className={`nav-item${openDesktop === "about" ? " open" : ""}`}>
              <button className="nav-btn" onClick={() => toggleDesktop("about")}>
                About <span className="caret">▾</span>
              </button>
              <div className="dropdown">
                {ABOUT_ITEMS.map((item) => (
                  <div key={item} className="dropdown-item"><span>{item}</span></div>
                ))}
              </div>
            </div>

            <input
              className="cnav-search"
              type="search"
              placeholder="Search…"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              aria-label="Site search"
            />
          </div>

          {/* ── Hamburger ── */}
          <button
            className="cnav-hamburger"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        <div
          className={`cnav-mobile${mobileOpen ? " open" : ""}`}
          aria-hidden={!mobileOpen}
        >
          {/* Courses */}
          <div className={`mobile-item${mCoursesOpen ? " open" : ""}`}>
            <div className="mobile-row" onClick={() => setMCoursesOpen((p) => !p)}>
              <span>Courses</span>
              <button className="mobile-icon">{mCoursesOpen ? "−" : "+"}</button>
            </div>
            <div className="mobile-sub">
              {COURSE_ITEMS.filter((i) => i !== "Cisco").map((item) => (
                <div key={item} className="mobile-sub-row">{item}</div>
              ))}
              {/* Cisco nested */}
              <div
                className="mobile-sub-row mobile-cisco-toggle"
                onClick={(e) => { e.stopPropagation(); setMCiscoOpen((p) => !p); }}
              >
                <span>Cisco</span>
                <button className="mobile-icon">{mCiscoOpen ? "−" : "+"}</button>
              </div>
              <div className={`mobile-deep${mCiscoOpen ? " open" : ""}`}>
                {CISCO_COURSES.map((c) => (
                  <div key={c} className="mobile-deep-row">{c}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Forum */}
          <div className="mobile-item">
            <div className="mobile-row">Forum</div>
          </div>

          {/* Support */}
          <div className="mobile-item">
            <div className="mobile-row">Support</div>
          </div>

          {/* Tools */}
          <div className={`mobile-item${mToolsOpen ? " open" : ""}`}>
            <div className="mobile-row" onClick={() => setMToolsOpen((p) => !p)}>
              <span>Tools</span>
              <button className="mobile-icon">{mToolsOpen ? "−" : "+"}</button>
            </div>
            <div className="mobile-sub">
              {TOOLS_ITEMS.map((item) => (
                <div key={item} className="mobile-sub-row">{item}</div>
              ))}
            </div>
          </div>

          {/* About */}
          <div className={`mobile-item${mAboutOpen ? " open" : ""}`}>
            <div className="mobile-row" onClick={() => setMAboutOpen((p) => !p)}>
              <span>About</span>
              <button className="mobile-icon">{mAboutOpen ? "−" : "+"}</button>
            </div>
            <div className="mobile-sub">
              {ABOUT_ITEMS.map((item) => (
                <div key={item} className="mobile-sub-row">{item}</div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mobile-item">
            <div className="mobile-search-wrap">
              <input
                className="mobile-search"
                type="search"
                placeholder="Search…"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                aria-label="Mobile site search"
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}