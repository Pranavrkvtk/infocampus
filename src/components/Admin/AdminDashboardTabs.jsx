// src/components/Admin/AdminDashboardTabs.jsx
import React from "react";
import { colors, Badge, LoadingSpinner, KpiCard } from "./AdminStyles";

function DashboardTabContent({ kpis, loading, isMobile }) {
  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
        gap: isMobile ? 12 : 20, marginBottom: 24,
      }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} loading={loading} />)}
      </div>
      <div style={{
        background: colors.surface, border: `1px solid ${colors.borderLight}`,
        borderRadius: 16, padding: isMobile ? 20 : 30, textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
        <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, marginBottom: 12 }}>Welcome to Admin Dashboard</h2>
        <p style={{ color: colors.textSecondary, fontSize: 14 }}>Manage your courses, track student progress, and monitor your learning platform</p>
      </div>
    </>
  );
}

function CoursesTabContent({ courses, isMobile, onAddCourse, onEditCourse, onDeleteCourse }) {
  return (
    <div style={{ background: colors.surface, border: `1px solid ${colors.borderLight}`, borderRadius: 16, padding: isMobile ? 16 : 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700 }}>🌐 All Courses</h2><p style={{ fontSize: 12, color: colors.textMuted }}>Total {courses.length} courses available</p></div>
        <button onClick={onAddCourse} style={{ background: colors.primary, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 40, cursor: "pointer" }}>+ New Course</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead><tr style={{ borderBottom: `2px solid ${colors.borderLight}`, background: colors.bgBase }}>
            <th style={{ padding: "12px", textAlign: "left" }}>ID</th><th style={{ padding: "12px", textAlign: "left" }}>Course Name</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Instructor</th><th style={{ padding: "12px", textAlign: "left" }}>Price</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Status</th><th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
          </tr></thead>
          <tbody>
            {courses.map((c, idx) => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${colors.borderLight}`, background: idx % 2 === 0 ? colors.surface : colors.bgBase }}>
                <td style={{ padding: "12px" }}>#{c.id}</td>
                <td style={{ padding: "12px", fontWeight: 500 }}>{c.title || "Untitled"}</td>
                <td style={{ padding: "12px", color: colors.textSecondary }}>{c.instructor || "—"}</td>
                <td style={{ padding: "12px", color: colors.teal, fontWeight: 600 }}>${c.price || "0"}</td>
                <td style={{ padding: "12px" }}><Badge status={c.status || "PUBLISHED"} /></td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button onClick={() => onEditCourse(c)} style={{ padding: "5px 12px", marginRight: 8, borderRadius: 6, border: `1px solid ${colors.borderLight}`, background: colors.surface, cursor: "pointer" }}>✏️ Edit</button>
                  <button onClick={() => onDeleteCourse(c.id, c.title)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${colors.borderLight}`, background: colors.surface, color: colors.coral, cursor: "pointer" }}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentsTabContent({ students, searchTerm, isMobile, onSearchChange, onEditRole, onToggleStatus }) {
  const protectedEmails = ["pranav@gmail.com", "admin@gmail.com"];
  
  return (
    <div style={{ background: colors.surface, border: `1px solid ${colors.borderLight}`, borderRadius: 16, padding: isMobile ? 16 : 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700 }}>👨‍🎓 All Students</h2><p style={{ fontSize: 12, color: colors.textMuted }}>Total {students.length} students found {searchTerm && `for "${searchTerm}"`}</p></div>
        <input type="text" placeholder="Search users by name..." value={searchTerm} onChange={onSearchChange} style={{ padding: "8px 14px", border: `1px solid ${colors.borderLight}`, borderRadius: 40, fontSize: 13, width: isMobile ? "100%" : 240 }} />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead><tr style={{ borderBottom: `2px solid ${colors.borderLight}`, background: colors.bgBase }}>
            <th style={{ padding: "12px", textAlign: "left" }}>ID</th><th style={{ padding: "12px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Email</th><th style={{ padding: "12px", textAlign: "left" }}>Role</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Status</th><th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
           </tr></thead>
          <tbody>
            {students.map((s, idx) => {
              const isProtectedAdmin = s.role === "ADMIN" && protectedEmails.includes(s.email);
              return (
                <tr key={s.id} style={{ borderBottom: `1px solid ${colors.borderLight}`, background: idx % 2 === 0 ? colors.surface : colors.bgBase, opacity: s.status === "INACTIVE" ? 0.7 : 1 }}>
                  <td style={{ padding: "12px" }}>#{s.id}</td>
                  <td style={{ padding: "12px", fontWeight: 500 }}>{s.name}{isProtectedAdmin && <span style={{ marginLeft: 8, fontSize: 9, background: colors.coralSoft, color: colors.coral, padding: "2px 6px", borderRadius: 10 }}>🔒 Protected</span>}</td>
                  <td style={{ padding: "12px", color: colors.textSecondary }}>{s.email}</td>
                  <td style={{ padding: "12px" }}><Badge status={s.role || "STUDENT"} /></td>
                  <td style={{ padding: "12px" }}><Badge status={s.status || "ACTIVE"} /></td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button onClick={() => onEditRole(s)} disabled={isProtectedAdmin} style={{ padding: "5px 12px", marginRight: 8, borderRadius: 6, border: `1px solid ${colors.borderLight}`, background: colors.surface, cursor: isProtectedAdmin ? "not-allowed" : "pointer", opacity: isProtectedAdmin ? 0.6 : 1 }}>👑 Edit Role</button>
                    <button onClick={() => onToggleStatus(s.id, s.status)} disabled={isProtectedAdmin && s.status === "ACTIVE"} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: s.status === "ACTIVE" ? colors.coralSoft : colors.tealSoft, color: s.status === "ACTIVE" ? colors.coral : colors.teal, cursor: "pointer" }}>{s.status === "ACTIVE" ? "🔴 Deactivate" : "🟢 Activate"}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {students.length > 0 && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${colors.borderLight}`, display: "flex", gap: 16 }}>
          <span>✅ Active: {students.filter(s => s.status === "ACTIVE").length}</span>
          <span>❌ Inactive: {students.filter(s => s.status === "INACTIVE").length}</span>
          <span>👑 Admins: {students.filter(s => s.role === "ADMIN").length}</span>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardTabs({ 
  activeTab, loading, error, kpis, courses, students, searchTerm, isMobile,
  onSearchChange, onAddCourse, onEditCourse, onDeleteCourse, onEditRole, onToggleStatus, onRetry 
}) {
  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div style={{ textAlign: "center", color: colors.coral, padding: "40px" }}>
      ⚠️ {error}
      <button onClick={onRetry} style={{ marginLeft: 12, padding: "6px 12px", background: colors.primary, color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Retry</button>
    </div>
  );

  switch (activeTab) {
    case "dashboard": return <DashboardTabContent kpis={kpis} loading={loading} isMobile={isMobile} />;
    case "courses": return <CoursesTabContent courses={courses} isMobile={isMobile} onAddCourse={onAddCourse} onEditCourse={onEditCourse} onDeleteCourse={onDeleteCourse} />;
    case "students": return <StudentsTabContent students={students} searchTerm={searchTerm} isMobile={isMobile} onSearchChange={onSearchChange} onEditRole={onEditRole} onToggleStatus={onToggleStatus} />;
    default: return null;
  }
}