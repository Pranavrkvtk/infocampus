import React, { useState, useEffect } from "react";

// ── Default palettes ──────────────────────────────────────────────────────────
export const LIGHT_DEFAULTS = {
  "--bg-base":      "#f8f9fb",
  "--surface":      "#ffffff",
  "--text-primary": "#0f172a",
  "--text-secondary":"#64748b",
  "--border-light": "#e4e7ec",
  "--primary":      "#4f46e5",
  "--primary-soft": "#eef2ff",
  "--error":        "#dc2626",
  "--success":      "#16a34a",
  "--teal":         "#14b8a6",
  "--teal-soft":    "#ccfbf1",
  "--amber-soft":   "#fef3c7",
  "--purple-soft":  "#f3e8ff",
  "--grad-start":   "#4f46e5",
  "--grad-end":     "#7c3aed",
};

export const DARK_DEFAULTS = {
  "--bg-base":      "#0d1117",
  "--surface":      "#161b22",
  "--text-primary": "#e6edf3",
  "--text-secondary":"#8b949e",
  "--border-light": "#21262d",
  "--primary":      "#a78bfa",
  "--primary-soft": "#1e1b4b",
  "--error":        "#f87171",
  "--success":      "#34d399",
  "--teal":         "#2dd4bf",
  "--teal-soft":    "#134e4a",
  "--amber-soft":   "#78350f",
  "--purple-soft":  "#4c1d95",
  "--grad-start":   "#7c3aed",
  "--grad-end":     "#a78bfa",
};

const PRESETS = {
  light: [
    { name: "Indigo",  light: { "--primary":"#4f46e5","--grad-start":"#4f46e5","--grad-end":"#7c3aed","--primary-soft":"#eef2ff" } },
    { name: "Teal",    light: { "--primary":"#0d9488","--grad-start":"#0d9488","--grad-end":"#06b6d4","--primary-soft":"#ccfbf1" } },
    { name: "Rose",    light: { "--primary":"#e11d48","--grad-start":"#e11d48","--grad-end":"#f43f5e","--primary-soft":"#fff1f2" } },
    { name: "Amber",   light: { "--primary":"#d97706","--grad-start":"#d97706","--grad-end":"#f59e0b","--primary-soft":"#fffbeb" } },
    { name: "Emerald", light: { "--primary":"#059669","--grad-start":"#059669","--grad-end":"#10b981","--primary-soft":"#ecfdf5" } },
    { name: "Slate",   light: { "--primary":"#475569","--grad-start":"#334155","--grad-end":"#64748b","--primary-soft":"#f1f5f9" } },
  ],
  dark: [
    { name: "Violet",  dark: { "--primary":"#a78bfa","--grad-start":"#7c3aed","--grad-end":"#a78bfa","--primary-soft":"rgba(124,58,237,0.14)" } },
    { name: "Cyan",    dark: { "--primary":"#22d3ee","--grad-start":"#0e7490","--grad-end":"#22d3ee","--primary-soft":"rgba(14,116,144,0.15)" } },
    { name: "Pink",    dark: { "--primary":"#f472b6","--grad-start":"#be185d","--grad-end":"#f472b6","--primary-soft":"rgba(190,24,93,0.14)" } },
    { name: "Lime",    dark: { "--primary":"#a3e635","--grad-start":"#3f6212","--grad-end":"#a3e635","--primary-soft":"rgba(63,98,18,0.15)" } },
    { name: "Orange",  dark: { "--primary":"#fb923c","--grad-start":"#c2410c","--grad-end":"#fb923c","--primary-soft":"rgba(194,65,12,0.14)" } },
    { name: "Steel",   dark: { "--primary":"#94a3b8","--grad-start":"#334155","--grad-end":"#94a3b8","--primary-soft":"rgba(51,65,85,0.25)" } },
  ],
};

const COLOR_FIELDS = [
  { key: "--bg-base",       label: "Page background" },
  { key: "--surface",       label: "Surface / cards" },
  { key: "--text-primary",  label: "Primary text" },
  { key: "--text-secondary",label: "Secondary text" },
  { key: "--border-light",  label: "Border" },
  { key: "--primary",       label: "Accent / primary" },
  { key: "--primary-soft",  label: "Accent soft bg" },
  { key: "--grad-start",    label: "Logo gradient start" },
  { key: "--grad-end",      label: "Logo gradient end" },
  { key: "--error",         label: "Error / danger" },
  { key: "--success",       label: "Success" },
  { key: "--teal",          label: "Teal accent" },
];

// ── Apply colours to :root ────────────────────────────────────────────────────
export function applyTheme(vars) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
    if (k === "--grad-start" || k === "--grad-end") {
      // rebuild the gradient whenever either stop changes
      const start = vars["--grad-start"] || getComputedStyle(root).getPropertyValue("--grad-start");
      const end   = vars["--grad-end"]   || getComputedStyle(root).getPropertyValue("--grad-end");
      root.style.setProperty("--grad-primary", `linear-gradient(135deg, ${start}, ${end})`);
    }
  });
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const LS_KEY = "infocampus_theme";
export function saveTheme(isDark, vars) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ isDark, vars })); } catch (_) {}
}
export function loadSavedTheme() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch (_) { return null; }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ThemeCustomizer({ isDarkMode, onClose }) {
  const defaults = isDarkMode ? DARK_DEFAULTS : LIGHT_DEFAULTS;
  const saved    = loadSavedTheme();

  const [colors, setColors] = useState(() => {
    if (saved && saved.isDark === isDarkMode) return { ...defaults, ...saved.vars };
    return { ...defaults };
  });

  const [activeSection, setActiveSection] = useState("presets");
  const [copied, setCopied] = useState(false);

  // Apply on mount + whenever colors change
  useEffect(() => { applyTheme(colors); }, [colors]);

  const set = (key, val) => {
    const next = { ...colors, [key]: val };
    // auto-sync gradient
    if (key === "--grad-start" || key === "--grad-end") {
      next["--grad-primary"] = `linear-gradient(135deg, ${next["--grad-start"]}, ${next["--grad-end"]})`;
    }
    setColors(next);
    saveTheme(isDarkMode, next);
  };

  const applyPreset = (preset) => {
    const overrides = preset.light || preset.dark || {};
    const next = { ...colors, ...overrides };
    if (overrides["--grad-start"] || overrides["--grad-end"]) {
      next["--grad-primary"] = `linear-gradient(135deg, ${next["--grad-start"]}, ${next["--grad-end"]})`;
    }
    setColors(next);
    saveTheme(isDarkMode, next);
  };

  const reset = () => {
    setColors({ ...defaults });
    applyTheme(defaults);
    saveTheme(isDarkMode, defaults);
  };

  const exportCSS = () => {
    const lines = Object.entries(colors)
      .filter(([k]) => k.startsWith("--"))
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");
    const css = `/* Infocampus ${isDarkMode ? "dark" : "light"} theme */\n:root {\n${lines}\n}`;
    navigator.clipboard?.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const presets = isDarkMode ? PRESETS.dark : PRESETS.light;

  // Styles (inline so no external CSS needed)
  const s = {
    overlay: {
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.45)", display: "flex",
      alignItems: "center", justifyContent: "center",
    },
    panel: {
      width: 400, maxHeight: "90vh",
      background: "var(--surface)", border: "1px solid var(--border-light)",
      borderRadius: 16, display: "flex", flexDirection: "column",
      overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
    },
    header: {
      padding: "18px 20px 14px", borderBottom: "1px solid var(--border-light)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    title: { fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 },
    subtitle: { fontSize: 11, color: "var(--text-secondary)", marginTop: 2 },
    tabs: {
      display: "flex", gap: 4, padding: "10px 20px 0",
      borderBottom: "1px solid var(--border-light)",
    },
    tab: (active) => ({
      fontSize: 12, fontWeight: 600, padding: "7px 14px",
      borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer",
      background: active ? "var(--primary)" : "transparent",
      color: active ? "#fff" : "var(--text-secondary)",
      marginBottom: -1,
    }),
    body: { flex: 1, overflowY: "auto", padding: "16px 20px" },
    section: { marginBottom: 20 },
    sectionLabel: {
      fontSize: 10, fontWeight: 700, letterSpacing: "1px",
      color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 10,
    },
    presetGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
    presetBtn: (color) => ({
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 6, padding: "10px 6px", borderRadius: 10, cursor: "pointer",
      border: "1px solid var(--border-light)", background: "var(--surface)",
      transition: "all 0.15s",
    }),
    presetDot: (color) => ({
      width: 28, height: 28, borderRadius: "50%", background: color,
      boxShadow: `0 0 0 3px ${color}33`,
    }),
    presetName: { fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 },
    colorRow: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 0", borderBottom: "1px solid var(--border-light)",
    },
    colorLabel: { fontSize: 13, color: "var(--text-primary)", flex: 1 },
    colorRight: { display: "flex", alignItems: "center", gap: 8 },
    colorHex: {
      fontSize: 11, color: "var(--text-secondary)", fontFamily: "monospace",
      background: "var(--primary-soft)", padding: "3px 6px", borderRadius: 4,
      minWidth: 60, textAlign: "center",
    },
    colorSwatch: (val) => ({
      width: 28, height: 28, borderRadius: 6, cursor: "pointer",
      border: "2px solid var(--border-light)",
      background: val.includes("rgba") || val.includes("gradient") ? val : val,
      position: "relative", overflow: "hidden",
    }),
    footer: {
      padding: "12px 20px", borderTop: "1px solid var(--border-light)",
      display: "flex", gap: 8,
    },
    btn: (variant) => ({
      flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: "pointer", border: "none", transition: "all 0.15s",
      background: variant === "primary" ? "var(--primary)" : variant === "ghost"
        ? "transparent" : "var(--primary-soft)",
      color: variant === "primary" ? "#fff" : variant === "ghost"
        ? "var(--text-secondary)" : "var(--primary)",
      border: variant === "ghost" ? "1px solid var(--border-light)" : "none",
    }),
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.panel}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.title}>🎨 Theme Customizer</p>
            <p style={s.subtitle}>
              {isDarkMode ? "Dark mode" : "Light mode"} — changes apply live
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-secondary)", lineHeight: 1 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {["presets", "colors"].map((t) => (
            <button key={t} style={s.tab(activeSection === t)} onClick={() => setActiveSection(t)}>
              {t === "presets" ? "Quick presets" : "Custom colors"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={s.body}>
          {activeSection === "presets" && (
            <div style={s.section}>
              <p style={s.sectionLabel}>Accent presets</p>
              <div style={s.presetGrid}>
                {presets.map((p) => {
                  const accentColor = (p.light || p.dark)["--primary"];
                  return (
                    <button key={p.name} style={s.presetBtn(accentColor)} onClick={() => applyPreset(p)}>
                      <div style={s.presetDot(accentColor)} />
                      <span style={s.presetName}>{p.name}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 20 }}>
                <p style={s.sectionLabel}>Background style</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {isDarkMode ? (
                    <>
                      <button style={s.presetBtn("#0d1117")} onClick={() => set("--bg-base", "#0d1117")}>
                        <div style={{ ...s.presetDot("#0d1117"), border: "1px solid #30363d" }} />
                        <span style={s.presetName}>GitHub dark</span>
                      </button>
                      <button style={s.presetBtn("#1a1a2e")} onClick={() => set("--bg-base", "#1a1a2e")}>
                        <div style={s.presetDot("#1a1a2e")} />
                        <span style={s.presetName}>Midnight blue</span>
                      </button>
                      <button style={s.presetBtn("#0f0f0f")} onClick={() => set("--bg-base", "#0f0f0f")}>
                        <div style={s.presetDot("#0f0f0f")} />
                        <span style={s.presetName}>Pure black</span>
                      </button>
                      <button style={s.presetBtn("#1e1e2e")} onClick={() => set("--bg-base", "#1e1e2e")}>
                        <div style={s.presetDot("#1e1e2e")} />
                        <span style={s.presetName}>Catppuccin</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button style={s.presetBtn("#f8f9fb")} onClick={() => set("--bg-base", "#f8f9fb")}>
                        <div style={{ ...s.presetDot("#f8f9fb"), border: "1px solid #e4e7ec" }} />
                        <span style={s.presetName}>Cool gray</span>
                      </button>
                      <button style={s.presetBtn("#fafafa")} onClick={() => set("--bg-base", "#fafafa")}>
                        <div style={{ ...s.presetDot("#fafafa"), border: "1px solid #e4e7ec" }} />
                        <span style={s.presetName}>Warm white</span>
                      </button>
                      <button style={s.presetBtn("#f0f4ff")} onClick={() => set("--bg-base", "#f0f4ff")}>
                        <div style={s.presetDot("#f0f4ff")} />
                        <span style={s.presetName}>Lavender mist</span>
                      </button>
                      <button style={s.presetBtn("#f0fdf4")} onClick={() => set("--bg-base", "#f0fdf4")}>
                        <div style={s.presetDot("#f0fdf4")} />
                        <span style={s.presetName}>Mint frost</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "colors" && (
            <div style={s.section}>
              <p style={s.sectionLabel}>Individual color controls</p>
              {COLOR_FIELDS.map(({ key, label }) => {
                const val = colors[key] || "";
                const isGradientOrRgba = val.includes("rgba") || val.includes("gradient") || val.includes("linear");
                return (
                  <div key={key} style={s.colorRow}>
                    <span style={s.colorLabel}>{label}</span>
                    <div style={s.colorRight}>
                      <span style={s.colorHex}>{isGradientOrRgba ? "—" : val}</span>
                      {!isGradientOrRgba ? (
                        <label style={{ position: "relative", cursor: "pointer" }}>
                          <div style={s.colorSwatch(val)} />
                          <input
                            type="color"
                            value={val.startsWith("#") ? val : "#ffffff"}
                            onChange={(e) => set(key, e.target.value)}
                            style={{
                              position: "absolute", inset: 0, opacity: 0,
                              width: "100%", height: "100%", cursor: "pointer",
                            }}
                          />
                        </label>
                      ) : (
                        <div style={{ display: "flex", gap: 4 }}>
                          {key === "--grad-start" || key === "--primary-soft" ? null : (
                            <div style={{ ...s.colorSwatch(val), width: 40 }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: 16 }}>
                <p style={s.sectionLabel}>Gradient logo colors</p>
                {["--grad-start", "--grad-end"].map((key) => (
                  <div key={key} style={s.colorRow}>
                    <span style={s.colorLabel}>{key === "--grad-start" ? "Gradient start" : "Gradient end"}</span>
                    <div style={s.colorRight}>
                      <span style={s.colorHex}>{colors[key]}</span>
                      <label style={{ position: "relative", cursor: "pointer" }}>
                        <div style={s.colorSwatch(colors[key])} />
                        <input
                          type="color"
                          value={colors[key]?.startsWith("#") ? colors[key] : "#7c3aed"}
                          onChange={(e) => set(key, e.target.value)}
                          style={{
                            position: "absolute", inset: 0, opacity: 0,
                            width: "100%", height: "100%", cursor: "pointer",
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <button style={s.btn("ghost")} onClick={reset}>↺ Reset</button>
          <button style={s.btn("soft")} onClick={exportCSS}>
            {copied ? "✓ Copied!" : "⬆ Export CSS"}
          </button>
          <button style={s.btn("primary")} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}