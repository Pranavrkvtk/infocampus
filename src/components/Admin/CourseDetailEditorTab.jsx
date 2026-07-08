// src/components/Admin/CourseDetailEditorTab.jsx
// Editor for the CourseDetailView (course player) page — colors, labels,
// content-type tabs, empty states, and button text. Saves to
// localStorage['courseDetailConfig'], read by CourseDetailView.jsx.

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

// ─── Default config (mirrors current hardcoded values in CourseDetailView) ─
export const DEFAULT_COURSE_DETAIL_CONFIG = {
  colors: {
    accent: "#2563EB",
    accentDark: "#1D4ED8",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    gold: "#E8B84B",
  },
  labels: {
    lessonsSuffix: "Lessons",
    searchTopicsPlaceholder: "🔍 Search topics...",
    searchQuestionsPlaceholder: "🔍 Search questions...",
    backButtonText: "← Back",
    doneBadgeText: "✅ Done",
    selectSectionText: "Select a section from the sidebar to begin",
    loadingContentText: "Loading content…",
    loadingCourseText: "Loading course content…",
    noContentText: "No content has been added for this section yet.",
    noSectionDataText: "No content",
    submitQuizText: "Submit Quiz",
    markCompleteText: "✓ Mark Complete",
    labDoneText: "✅ Done",
    quizTitleText: "📝 MCQ Quiz",
    correctText: "✅ Correct!",
    incorrectText: "❌ Incorrect",
  },
  emptyStates: {
    notes: "📝 No notes for this section.",
    video: "🎬 No video for this section.",
    interview: "🎤 No interview questions.",
    exam: "📝 No MCQ questions.",
    labs: "🧪 No lab exercises.",
  },
  contentTypes: {
    video:     { icon: "▶",  label: "Video",     color: "#2563EB" },
    notes:     { icon: "📄", label: "Tutorial",  color: "#2563EB" },
    interview: { icon: "🎤", label: "Interview", color: "#F59E0B" },
    exam:      { icon: "📝", label: "Quiz",      color: "#EF4444" },
    labs:      { icon: "🧪", label: "Lab",       color: "#10B981" },
  },
};

const STORAGE_KEY = "courseDetailConfig";

export const getCourseDetailConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // shallow-merge so newly added default keys still show up
      return {
        colors: { ...DEFAULT_COURSE_DETAIL_CONFIG.colors, ...parsed.colors },
        labels: { ...DEFAULT_COURSE_DETAIL_CONFIG.labels, ...parsed.labels },
        emptyStates: { ...DEFAULT_COURSE_DETAIL_CONFIG.emptyStates, ...parsed.emptyStates },
        contentTypes: {
          video: { ...DEFAULT_COURSE_DETAIL_CONFIG.contentTypes.video, ...parsed.contentTypes?.video },
          notes: { ...DEFAULT_COURSE_DETAIL_CONFIG.contentTypes.notes, ...parsed.contentTypes?.notes },
          interview: { ...DEFAULT_COURSE_DETAIL_CONFIG.contentTypes.interview, ...parsed.contentTypes?.interview },
          exam: { ...DEFAULT_COURSE_DETAIL_CONFIG.contentTypes.exam, ...parsed.contentTypes?.exam },
          labs: { ...DEFAULT_COURSE_DETAIL_CONFIG.contentTypes.labs, ...parsed.contentTypes?.labs },
        },
      };
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_COURSE_DETAIL_CONFIG;
};

// ─── Small reusable field components ───────────────────────────────────
function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const textInputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-light)",
  fontSize: 14,
  background: "var(--bg-base)",
  color: "var(--text-primary)",
  outline: "none",
  boxSizing: "border-box",
};

function TextField({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={textInputStyle}
      onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border-light)")}
    />
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 42, height: 42, border: "1px solid var(--border-light)", borderRadius: 8, cursor: "pointer", padding: 2, background: "var(--surface)" }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{value}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      border: "1px solid var(--border-light)",
      marginBottom: 24,
    }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18, color: "var(--text-primary)" }}>
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Content-type tab editor row ───────────────────────────────────────
function ContentTypeRow({ typeKey, value, onChange }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "70px 1fr 1fr 60px",
      gap: 10,
      alignItems: "center",
      padding: "12px",
      background: "var(--bg-base)",
      borderRadius: 10,
      marginBottom: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
        {typeKey}
      </div>
      <TextField
        value={value.icon}
        placeholder="Icon/emoji"
        onChange={(v) => onChange({ ...value, icon: v })}
      />
      <TextField
        value={value.label}
        placeholder="Tab label"
        onChange={(v) => onChange({ ...value, label: v })}
      />
      <input
        type="color"
        value={value.color}
        onChange={(e) => onChange({ ...value, color: e.target.value })}
        style={{ width: "100%", height: 40, border: "1px solid var(--border-light)", borderRadius: 8, cursor: "pointer", padding: 2 }}
      />
    </div>
  );
}

// ─── Main Editor Tab ────────────────────────────────────────────────────
export default function CourseDetailEditorTab() {
  const [config, setConfig] = useState(DEFAULT_COURSE_DETAIL_CONFIG);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConfig(getCourseDetailConfig());
  }, []);

  const updateColor = (key, val) =>
    setConfig((prev) => ({ ...prev, colors: { ...prev.colors, [key]: val } }));

  const updateLabel = (key, val) =>
    setConfig((prev) => ({ ...prev, labels: { ...prev.labels, [key]: val } }));

  const updateEmptyState = (key, val) =>
    setConfig((prev) => ({ ...prev, emptyStates: { ...prev.emptyStates, [key]: val } }));

  const updateContentType = (key, val) =>
    setConfig((prev) => ({ ...prev, contentTypes: { ...prev.contentTypes, [key]: val } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      Swal.fire({ title: "Saved!", text: "Course player settings updated.", icon: "success", timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", "Could not save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Reset to defaults?",
      text: "This will discard all customizations to the course player page.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reset",
      confirmButtonColor: "#dc2626",
    });
    if (result.isConfirmed) {
      localStorage.removeItem(STORAGE_KEY);
      setConfig(DEFAULT_COURSE_DETAIL_CONFIG);
      Swal.fire({ title: "Reset!", icon: "success", timer: 1500, showConfirmButton: false });
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* ─── Save bar ────────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20,
        position: "sticky", top: 0, zIndex: 5, background: "var(--bg-base)", padding: "4px 0",
      }}>
        <button
          onClick={handleReset}
          style={{
            padding: "10px 18px", background: "var(--surface)", color: "var(--error)",
            border: "1px solid var(--border-light)", borderRadius: 8, fontWeight: 600,
            fontSize: 13, cursor: "pointer",
          }}
        >
          ↺ Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "10px 22px", background: "var(--primary)", color: "#fff", border: "none",
            borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "⏳ Saving..." : "💾 Save Changes"}
        </button>
      </div>

      {/* ─── Colors ──────────────────────────────────────────────── */}
      <SectionCard title="Theme Colors" icon="🎨">
        <ColorField label="Accent (primary blue)" value={config.colors.accent} onChange={(v) => updateColor("accent", v)} />
        <ColorField label="Accent Dark (hover)" value={config.colors.accentDark} onChange={(v) => updateColor("accentDark", v)} />
        <ColorField label="Success" value={config.colors.success} onChange={(v) => updateColor("success", v)} />
        <ColorField label="Error" value={config.colors.error} onChange={(v) => updateColor("error", v)} />
        <ColorField label="Warning" value={config.colors.warning} onChange={(v) => updateColor("warning", v)} />
        <ColorField label="Gold" value={config.colors.gold} onChange={(v) => updateColor("gold", v)} />
      </SectionCard>

      {/* ─── Content type tabs ───────────────────────────────────── */}
      <SectionCard title="Content Type Tabs (sidebar leaf items)" icon="🗂️">
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
          Controls the icon, label, and color shown for each content type under a lesson (Video, Tutorial, Interview, Quiz, Lab).
        </p>
        {Object.entries(config.contentTypes).map(([key, val]) => (
          <ContentTypeRow key={key} typeKey={key} value={val} onChange={(v) => updateContentType(key, v)} />
        ))}
      </SectionCard>

      {/* ─── Labels & buttons ────────────────────────────────────── */}
      <SectionCard title="Labels & Button Text" icon="🏷️">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <FieldRow label="Back button text">
            <TextField value={config.labels.backButtonText} onChange={(v) => updateLabel("backButtonText", v)} />
          </FieldRow>
          <FieldRow label='"Done" badge text'>
            <TextField value={config.labels.doneBadgeText} onChange={(v) => updateLabel("doneBadgeText", v)} />
          </FieldRow>
          <FieldRow label="Lessons count suffix">
            <TextField value={config.labels.lessonsSuffix} onChange={(v) => updateLabel("lessonsSuffix", v)} />
          </FieldRow>
          <FieldRow label="Sidebar search placeholder">
            <TextField value={config.labels.searchTopicsPlaceholder} onChange={(v) => updateLabel("searchTopicsPlaceholder", v)} />
          </FieldRow>
          <FieldRow label="Interview search placeholder">
            <TextField value={config.labels.searchQuestionsPlaceholder} onChange={(v) => updateLabel("searchQuestionsPlaceholder", v)} />
          </FieldRow>
          <FieldRow label="Quiz title text">
            <TextField value={config.labels.quizTitleText} onChange={(v) => updateLabel("quizTitleText", v)} />
          </FieldRow>
          <FieldRow label="Submit quiz button">
            <TextField value={config.labels.submitQuizText} onChange={(v) => updateLabel("submitQuizText", v)} />
          </FieldRow>
          <FieldRow label="Mark complete button (labs)">
            <TextField value={config.labels.markCompleteText} onChange={(v) => updateLabel("markCompleteText", v)} />
          </FieldRow>
          <FieldRow label="Correct answer text">
            <TextField value={config.labels.correctText} onChange={(v) => updateLabel("correctText", v)} />
          </FieldRow>
          <FieldRow label="Incorrect answer text">
            <TextField value={config.labels.incorrectText} onChange={(v) => updateLabel("incorrectText", v)} />
          </FieldRow>
          <FieldRow label="No section selected text">
            <TextField value={config.labels.selectSectionText} onChange={(v) => updateLabel("selectSectionText", v)} />
          </FieldRow>
          <FieldRow label="No content available text">
            <TextField value={config.labels.noContentText} onChange={(v) => updateLabel("noContentText", v)} />
          </FieldRow>
        </div>
      </SectionCard>

      {/* ─── Empty states ────────────────────────────────────────── */}
      <SectionCard title="Empty State Messages" icon="📭">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <FieldRow label="No notes">
            <TextField value={config.emptyStates.notes} onChange={(v) => updateEmptyState("notes", v)} />
          </FieldRow>
          <FieldRow label="No video">
            <TextField value={config.emptyStates.video} onChange={(v) => updateEmptyState("video", v)} />
          </FieldRow>
          <FieldRow label="No interview questions">
            <TextField value={config.emptyStates.interview} onChange={(v) => updateEmptyState("interview", v)} />
          </FieldRow>
          <FieldRow label="No exam/quiz questions">
            <TextField value={config.emptyStates.exam} onChange={(v) => updateEmptyState("exam", v)} />
          </FieldRow>
          <FieldRow label="No labs">
            <TextField value={config.emptyStates.labs} onChange={(v) => updateEmptyState("labs", v)} />
          </FieldRow>
        </div>
      </SectionCard>

      {/* ─── Live preview ────────────────────────────────────────── */}
      <SectionCard title="Preview" icon="👁️">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          {Object.entries(config.contentTypes).map(([key, t]) => (
            <div key={key} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: 8, background: t.color, color: "#fff", fontSize: 13, fontWeight: 600,
            }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </div>
          ))}
        </div>
        <button style={{
          padding: "10px 20px", background: config.colors.accent, color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, marginRight: 10,
        }}>
          {config.labels.submitQuizText}
        </button>
        <span style={{
          fontSize: 12, background: "#D1FAE5", color: "#065F46", padding: "4px 12px",
          borderRadius: 20, fontWeight: 600,
        }}>
          {config.labels.doneBadgeText}
        </span>
      </SectionCard>
    </div>
  );
}