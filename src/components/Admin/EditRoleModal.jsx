// src/components/Admin/EditRoleModal.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import { updateUserRole } from "../../api/adminApi";

export default function EditRoleModal({ isOpen, onClose, user, onRoleUpdated }) {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || "STUDENT");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await updateUserRole(user.id, selectedRole);
      console.log("Role updated:", response.data);
      
      Swal.fire({
        title: '✅ Role Updated!',
        text: `${user?.name}'s role changed to ${selectedRole}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      if (onRoleUpdated) await onRoleUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating role:", err);
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "STUDENT", label: "👨‍🎓 Student", color: colors.primary, bg: colors.primarySoft, desc: "Can view and access courses" },
    { value: "ADMIN", label: "👑 Admin", color: colors.amber, bg: colors.amberSoft, desc: "Full system access" },
    { value: "INSTRUCTOR", label: "👨‍🏫 Instructor", color: colors.teal, bg: colors.tealSoft, desc: "Can create and manage courses" },
  ];

  if (!isOpen || !user) return null;

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        backgroundColor: colors.surface, borderRadius: 24,
        width: "90%", maxWidth: 450,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${colors.borderLight}`,
          background: `linear-gradient(135deg, ${colors.primarySoft} 0%, ${colors.surface} 100%)`,
          borderRadius: "24px 24px 0 0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: colors.primary }}>👑 Edit User Role</h2>
              <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: 0 }}>Update user permissions</p>
            </div>
            <button onClick={onClose} style={{
              background: colors.surface, border: `1px solid ${colors.borderLight}`, borderRadius: 10,
              width: 32, height: 32, fontSize: 18, cursor: "pointer", color: colors.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "20px 24px", background: colors.bgBase }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: colors.primarySoft,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, color: colors.primary,
            }}>{user.name?.charAt(0).toUpperCase() || "?"}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>{user.name}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{user.email}</div>
              <div style={{ marginTop: 4 }}><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 10, background: colors.primarySoft, color: colors.primary }}>ID: #{user.id}</span></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {error && <div style={{ background: colors.coralSoft, color: colors.coral, padding: "12px", borderRadius: 12, fontSize: 13, marginBottom: 20 }}>⚠️ {error}</div>}
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Current Role</label>
            <div style={{ padding: "10px 14px", background: colors.bgBase, borderRadius: 12, border: `1px solid ${colors.borderLight}` }}>{user.role || "STUDENT"}</div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Select New Role</label>
            {roles.map((role) => (
              <label key={role.value} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 8,
                background: selectedRole === role.value ? role.bg : colors.surface,
                border: `2px solid ${selectedRole === role.value ? role.color : colors.borderLight}`,
                borderRadius: 12, cursor: "pointer",
              }}>
                <input type="radio" name="role" value={role.value} checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)} style={{ width: 18, height: 18 }} />
                <div><div style={{ fontWeight: 600 }}>{role.label}</div><div style={{ fontSize: 11, color: colors.textMuted }}>{role.desc}</div></div>
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 40, border: `1px solid ${colors.borderLight}`, background: "transparent" }}>Cancel</button>
            <button type="submit" disabled={loading || selectedRole === user.role} style={{ padding: "10px 24px", borderRadius: 40, background: colors.gradPrimary, border: "none", color: "#fff" }}>{loading ? "Updating..." : "💾 Update Role"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}