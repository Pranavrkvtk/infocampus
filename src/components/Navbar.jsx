import { useState } from "react";
import "./Navbar.css";

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

export default function Navbar() {
  const [searchVal, setSearchVal] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [courses, setCourses] = useState(false);
  const [tools, setTools] = useState(false);
  const [about, setAbout] = useState(false);
  const [cisco, setCisco] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-top">
        <h2>CiscoCourses</h2>

        <div className="desktop-menu">
          <button>Home</button>

          <div className="menu-item">
            <button onClick={() => setCourses(!courses)}>
              Courses ▾
            </button>

            {courses && (
              <div className="dropdown">
                {courseItems.map((item) => (
                  <div key={item} className="dropdown-item">
                    <span>{item}</span>

                    {item === "Cisco" && (
                      <span
                        className="plus-btn"
                        onClick={() => setCisco(!cisco)}
                      >
                        +
                      </span>
                    )}

                    {item === "Cisco" && cisco && (
                      <div className="sub-dropdown">
                        {ciscoCourses.map((course) => (
                          <div key={course}>{course}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button>Forum</button>

          <button>Support</button>

          <div className="menu-item">
            <button onClick={() => setTools(!tools)}>
              Tools ▾
            </button>

            {tools && (
              <div className="dropdown">
                <div>Packet Captures</div>
                <div>Resources</div>
                <div>Practice Exams</div>
              </div>
            )}
          </div>

          <div className="menu-item">
            <button onClick={() => setAbout(!about)}>
              About ▾
            </button>

            {about && (
              <div className="dropdown">
                <div>Free Account</div>
                <div>Discounts and Promotions</div>
                <div>Training for Teams</div>
              </div>
            )}
          </div>

          <input
            placeholder="Search..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>

        <button
          className="menu-btn"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          ☰
        </button>
      </div>

      {mobileMenu && (
        <div className="mobile-menu">
          <div>Home</div>

          <div onClick={() => setCourses(!courses)}>
            Courses {courses ? "−" : "+"}
          </div>

          {courses && (
            <div className="mobile-submenu">
              {courseItems.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          )}

          <div>Forum</div>

          <div>Support</div>

          <div onClick={() => setTools(!tools)}>
            Tools {tools ? "−" : "+"}
          </div>

          {tools && (
            <div className="mobile-submenu">
              <div>Packet Captures</div>
              <div>Resources</div>
              <div>Practice Exams</div>
            </div>
          )}

          <div onClick={() => setAbout(!about)}>
            About {about ? "−" : "+"}
          </div>

          {about && (
            <div className="mobile-submenu">
              <div>Free Account</div>
              <div>Discounts and Promotions</div>
              <div>Training for Teams</div>
            </div>
          )}

          <div className="mobile-search">
            <input
              placeholder="Search..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
        </div>
      )}
    </nav>
  );
}