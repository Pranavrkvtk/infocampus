// src/components/Admin/NavbarEditorTab.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import { getNavbarConfig, saveNavbarConfig, DEFAULT_CONFIG } from "../Navbar";

export default function NavbarEditorTab() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeSection, setActiveSection] = useState("colors");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [isSaving, setIsSaving] = useState(false);

  // Load saved config on mount
  useEffect(() => {
    const saved = getNavbarConfig();
    setConfig(saved);
  }, []);

  // Update config value
  const updateConfig = (path, value) => {
    const newConfig = { ...config };
    const keys = path.split(".");
    let current = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  // Save config
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = saveNavbarConfig(config);
      if (success) {
        await Swal.fire({
          title: "✅ Saved!",
          text: "Navbar configuration has been saved successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        // Notify other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'navbar_config',
          newValue: JSON.stringify(config)
        }));
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to save configuration.",
        icon: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Reset to Defaults?",
      text: "This will remove all customizations and restore the original navbar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reset",
      confirmButtonColor: colors.coral,
    });
    if (result.isConfirmed) {
      setConfig(DEFAULT_CONFIG);
      localStorage.removeItem("navbar_config");
      Swal.fire({
        title: "Reset!",
        text: "Navbar has been reset to defaults.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      window.location.reload();
    }
  };

  // Color picker component
  const ColorPicker = ({ label, path, value }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text-secondary)",
        marginBottom: 4,
      }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => updateConfig(path, e.target.value)}
          style={{
            width: 40,
            height: 40,
            padding: 2,
            borderRadius: 6,
            border: "2px solid var(--border-light)",
            cursor: "pointer",
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => updateConfig(path, e.target.value)}
          style={{
            flex: 1,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid var(--border-light)",
            fontSize: 13,
            fontFamily: "monospace",
            background: "var(--bg-base)",
            color: "var(--text-primary)",
          }}
        />
      </div>
    </div>
  );

  // Text input component
  const TextInput = ({ label, path, value, placeholder }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text-secondary)",
        marginBottom: 4,
      }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => updateConfig(path, e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid var(--border-light)",
          fontSize: 13,
          background: "var(--bg-base)",
          color: "var(--text-primary)",
        }}
      />
    </div>
  );

  // Number input component
  const NumberInput = ({ label, path, value, min, max }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--text-secondary)",
        marginBottom: 4,
      }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => updateConfig(path, parseInt(e.target.value) || 768)}
        min={min}
        max={max}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid var(--border-light)",
          fontSize: 13,
          background: "var(--bg-base)",
          color: "var(--text-primary)",
        }}
      />
    </div>
  );

  // Preview Navbar
  const PreviewNavbar = () => {
    const previewStyles = {
      background: config.navBg,
      fontFamily: config.font,
      padding: "0 16px",
      height: "56px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      borderRadius: previewMode === "mobile" ? "0" : "8px",
      boxShadow: previewMode === "mobile" ? "none" : "0 2px 8px rgba(0,0,0,0.1)",
      position: "relative",
    };

    return (
      <div style={previewStyles}>
        {/* Logo */}
        <span style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: previewMode === "mobile" ? 16 : 20,
          fontFamily: config.font,
          whiteSpace: "nowrap",
          marginRight: 12,
        }}>
          {config.logoText}
          <span style={{ color: config.logoAccentColor }}>{config.logoAccent}</span>
        </span>

        {previewMode === "desktop" && (
          <>
            {config.navItems.map((item) => (
              <button key={item.id} style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontFamily: config.font,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: 4,
              }}>
                {item.label} {item.type === "dropdown" && "▾"}
              </button>
            ))}

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="text"
                placeholder={config.searchPlaceholder}
                disabled
                style={{
                  padding: "5px 10px",
                  borderRadius: 5,
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontFamily: config.font,
                  fontSize: 13,
                  width: 150,
                  outline: "none",
                }}
              />
              <div style={{
                padding: "7px 18px",
                background: config.green,
                color: "#fff",
                borderRadius: 5,
                fontFamily: config.font,
                fontWeight: 700,
                fontSize: 14,
              }}>
                {config.loginText}
              </div>
            </div>
          </>
        )}

        {previewMode === "mobile" && (
          <>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                placeholder={config.searchPlaceholder}
                disabled
                style={{
                  padding: "4px 8px",
                  borderRadius: 5,
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontFamily: config.font,
                  fontSize: 12,
                  width: 100,
                  outline: "none",
                }}
              />
              <button style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
                padding: "4px 6px",
              }}>
                ☰
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const sections = [
    { id: "colors", label: "🎨 Colors" },
    { id: "branding", label: "🏷️ Branding" },
    { id: "navigation", label: "🧭 Navigation" },
    { id: "content", label: "📄 Content" },
    { id: "search", label: "🔍 Search" },
    { id: "buttons", label: "🔘 Buttons" },
    { id: "preview", label: "👁️ Preview" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
            🎨 Navbar Editor
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Customize the navigation bar appearance and content
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleReset}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid var(--border-light)",
              background: "var(--bg-base)",
              color: "var(--text-secondary)",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "var(--grad-primary)",
              color: "#fff",
              fontWeight: 600,
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "💾 Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 8,
        marginBottom: 24,
        borderBottom: "1px solid var(--border-light)",
      }}>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: activeSection === section.id ? "var(--primary)" : "transparent",
              color: activeSection === section.id ? "#fff" : "var(--text-secondary)",
              fontWeight: activeSection === section.id ? 600 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: 13,
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        {/* Colors Section */}
        {activeSection === "colors" && (
          <div style={{
            background: "var(--surface)",
            borderRadius: 12,
            padding: 24,
            border: "1px solid var(--border-light)",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text-primary)" }}>
              Color Configuration
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <ColorPicker label="Navigation Background" path="navBg" value={config.navBg} />
              <ColorPicker label="Navigation Hover" path="navHover" value={config.navHover} />
              <ColorPicker label="Dropdown Background" path="dropdownBg" value={config.dropdownBg} />
              <ColorPicker label="Dropdown Hover" path="dropdownHover" value={config.dropdownHover} />
              <ColorPicker label="Cisco Section Background" path="ciscoBg" value={config.ciscoBg} />
              <ColorPicker label="Accent Color" path="accent" value={config.accent} />
              <ColorPicker label="Success/Login Color" path="green" value={config.green} />
              <ColorPicker label="Logout Color" path="logoutColor" value={config.logoutColor} />
              <ColorPicker label="Logout Hover" path="logoutHover" value={config.logoutHover} />
            </div>
          </div>
        )}

        {/* Branding Section */}
        {activeSection === "branding" && (
          <div style={{
            background: "var(--surface)",
            borderRadius: 12,
            padding: 24,
            border: "1px solid var(--border-light)",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text-primary)" }}>
              Branding
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 600 }}>
              <TextInput label="Logo Main Text" path="logoText" value={config.logoText} />
              <TextInput label="Logo Accent Text" path="logoAccent" value={config.logoAccent} />
              <ColorPicker label="Logo Accent Color" path="logoAccentColor" value={config.logoAccentColor} />
              <TextInput label="Font Family" path="font" value={config.font} placeholder="'Trebuchet MS', sans-serif" />
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{
                  padding: 16,
                  background: config.navBg,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 20,
                    fontFamily: config.font,
                  }}>
                    {config.logoText}
                    <span style={{ color: config.logoAccentColor }}>{config.logoAccent}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Section */}
        {activeSection === "navigation" && (
          <div style={{
            background: "var(--surface)",
            borderRadius: 12,
            padding: 24,
            border: "1px solid var(--border-light)",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text-primary)" }}>
              Navigation Items
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
              Edit navigation item labels
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {config.navItems.map((item, index) => (
                <div key={item.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  background: "var(--bg-base)",
                  borderRadius: 8,
                  border: "1px solid var(--border-light)",
                }}>
                  <span style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    minWidth: 80,
                  }}>
                    {item.id}
                  </span>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const newItems = [...config.navItems];
                      newItems[index].label = e.target.value;
                      updateConfig("navItems", newItems);
                    }}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border-light)",
                      fontSize: 13,
                      background: "#fff",
                      color: "var(--text-primary)",
                    }}
                  />
                  <span style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    padding: "2px 8px",
                    background: "var(--surface)",
                    borderRadius: 4,
                  }}>
                    {item.type || "link"}
                  </span>
                </div>
              ))}
            </div>
            <NumberInput 
              label="Mobile Breakpoint (px)" 
              path="mobileBreakpoint" 
              value={config.mobileBreakpoint} 
              min={320} 
              max={1200} 
            />
          </div>
        )}

        {/* Content Section */}
        {activeSection === "content" && (
          <div style={{
            background: "var(--surface)",
            borderRadius: 12,
            padding: 24,
            border: "1px solid var(--border-light)",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text-primary)" }}>
              Content Management
            </h3>
            
            {/* Course Items */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
                Course Categories
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {config.courseItems.map((item, index) => (
                  <div key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 12px",
                    background: "var(--bg-base)",
                    borderRadius: 20,
                    border: "1px solid var(--border-light)",
                  }}>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...config.courseItems];
                        newItems[index] = e.target.value;
                        updateConfig("courseItems", newItems);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "none",
                        fontSize: 12,
                        background: "transparent",
                        color: "var(--text-primary)",
                        width: 120,
                      }}
                    />
                    <button
                      onClick={() => {
                        const newItems = config.courseItems.filter((_, i) => i !== index);
                        updateConfig("courseItems", newItems);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--error)",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newItems = [...config.courseItems, "New Category"];
                    updateConfig("courseItems", newItems);
                  }}
                  style={{
                    padding: "4px 16px",
                    borderRadius: 20,
                    border: "2px dashed var(--border-light)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  + Add Category
                </button>
              </div>
            </div>

            {/* Cisco Courses */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
                Cisco Courses
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {config.ciscoCourses.map((course, index) => (
                  <div key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 12px",
                    background: "var(--bg-base)",
                    borderRadius: 20,
                    border: "1px solid var(--border-light)",
                  }}>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => {
                        const newCourses = [...config.ciscoCourses];
                        newCourses[index] = e.target.value;
                        updateConfig("ciscoCourses", newCourses);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "none",
                        fontSize: 12,
                        background: "transparent",
                        color: "var(--text-primary)",
                        width: 120,
                      }}
                    />
                    <button
                      onClick={() => {
                        const newCourses = config.ciscoCourses.filter((_, i) => i !== index);
                        updateConfig("ciscoCourses", newCourses);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--error)",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newCourses = [...config.ciscoCourses, "New Course"];
                    updateConfig("ciscoCourses", newCourses);
                  }}
                  style={{
                    padding: "4px 16px",
                    borderRadius: 20,
                    border: "2px dashed var(--border-light)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  + Add Course
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        {activeSection === "search" && (
          <div style={{
            background: "var(--surface)",
            borderRadius: 12,
            padding: 24,
            border: "1px solid var(--border-light)",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text-primary)" }}>
              Search Configuration
            </h3>
            <div style={{ maxWidth: 500 }}>
              <TextInput
                label="Search Placeholder"
                path="searchPlaceholder"
                value={config.searchPlaceholder}
                placeholder="Search..."
              />
              <div style={{ marginTop: 16 }}>
                <div style={{
                  padding: 12,
                  background: config.navBg,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <input
                    type="text"
                    placeholder={config.searchPlaceholder}
                    disabled
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      borderRadius: 5,
                      border: "1px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontFamily: config.font,
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons Section */}
        {activeSection === "buttons" && (
          <div style={{
            background: "var(--surface)",
            borderRadius: 12,
            padding: 24,
            border: "1px solid var(--border-light)",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text-primary)" }}>
              Button Configuration
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 600 }}>
              <TextInput label="Login Button Text" path="loginText" value={config.loginText} />
              <TextInput label="Logout Button Text" path="logoutText" value={config.logoutText} />
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{
                padding: "8px 18px",
                background: config.green,
                color: "#fff",
                borderRadius: 5,
                fontFamily: config.font,
                fontWeight: 700,
                fontSize: 14,
              }}>
                {config.loginText}
              </div>
              <div style={{
                padding: "8px 18px",
                background: config.logoutColor,
                color: "#fff",
                borderRadius: 5,
                fontFamily: config.font,
                fontWeight: 700,
                fontSize: 14,
              }}>
                {config.logoutText}
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {activeSection === "preview" && (
          <div style={{
            background: "var(--surface)",
            borderRadius: 12,
            padding: 24,
            border: "1px solid var(--border-light)",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "var(--text-primary)" }}>
              Live Preview
            </h3>
            
            {/* View toggle */}
            <div style={{
              display: "flex",
              gap: 8,
              marginBottom: 20,
            }}>
              <button
                onClick={() => setPreviewMode("desktop")}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: previewMode === "desktop" ? "var(--primary)" : "var(--bg-base)",
                  color: previewMode === "desktop" ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                🖥️ Desktop
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: previewMode === "mobile" ? "var(--primary)" : "var(--bg-base)",
                  color: previewMode === "mobile" ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                📱 Mobile
              </button>
            </div>

            {/* Preview container */}
            <div style={{
              background: "#f8f9fa",
              padding: previewMode === "mobile" ? "40px 20px" : "20px",
              borderRadius: 12,
              display: "flex",
              justifyContent: "center",
            }}>
              <div style={{
                width: previewMode === "mobile" ? 375 : "100%",
                maxWidth: 900,
                background: "#fff",
                borderRadius: previewMode === "mobile" ? 16 : 8,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}>
                <PreviewNavbar />
                <div style={{
                  padding: previewMode === "mobile" ? 16 : 24,
                  background: "#fff",
                  minHeight: 100,
                }}>
                  <h3 style={{ fontSize: previewMode === "mobile" ? 16 : 20, color: "var(--text-primary)" }}>
                    Page Content
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: previewMode === "mobile" ? 12 : 14 }}>
                    This is a preview of how the navbar will look.
                    {previewMode === "mobile" && " (Mobile view)"}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: "var(--bg-base)", borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                💡 Tip: The navbar will automatically adapt to mobile devices. 
                Use the preview toggle above to see both views.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 24,
        paddingTop: 24,
        borderTop: "1px solid var(--border-light)",
      }}>
        <button
          onClick={handleReset}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "1px solid var(--border-light)",
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "10px 32px",
            borderRadius: 8,
            border: "none",
            background: "var(--grad-primary)",
            color: "#fff",
            fontWeight: 600,
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.6 : 1,
            fontSize: 15,
          }}
        >
          {isSaving ? "💾 Saving..." : "💾 Save Changes & Reload"}
        </button>
      </div>
    </div>
  );
}