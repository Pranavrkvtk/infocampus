// src/components/EditCourseModal.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import { updateInstructorCourse } from "../../api/instructorApi";

export default function EditCourseModal({
  isOpen,
  onClose,
  course,
  onCourseUpdated,
  isInstructor = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    level: "Beginner",
    status: "DRAFT",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        price: course.price || "",
        level: course.level || "Beginner",
        status: course.status || "DRAFT",
        description: course.description || "",
      });
    }
  }, [course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateInstructorCourse(course.id, formData);
      Swal.fire({
        title: "Success!",
        text: "Course updated successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      if (onCourseUpdated) await onCourseUpdated();
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update course",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        style={{
          background: colors.surface,
          borderRadius: 20,
          padding: 32,
          width: "100%",
          maxWidth: 500,
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: colors.textPrimary }}>
          ✏️ Edit Course
        </h2>
        <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>
          Update your course information
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
                display: "block",
                color: colors.textPrimary,
              }}
            >
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${colors.borderLight}`,
                outline: "none",
                background: "#fff",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.borderLight;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
                display: "block",
                color: colors.textPrimary,
              }}
            >
              Price ($) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${colors.borderLight}`,
                outline: "none",
                background: "#fff",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.borderLight;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
                display: "block",
                color: colors.textPrimary,
              }}
            >
              Level *
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${colors.borderLight}`,
                outline: "none",
                background: "#fff",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.borderLight;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
                display: "block",
                color: colors.textPrimary,
              }}
            >
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${colors.borderLight}`,
                outline: "none",
                background: "#fff",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.borderLight;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 6,
                display: "block",
                color: colors.textPrimary,
              }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${colors.borderLight}`,
                outline: "none",
                minHeight: 80,
                background: "#fff",
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primarySoft}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.borderLight;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 24px",
                borderRadius: 40,
                border: `1px solid ${colors.borderLight}`,
                background: "transparent",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgBase;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 24px",
                borderRadius: 40,
                background: colors.primary,
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                opacity: submitting ? 0.6 : 1,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = colors.primaryDark;
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = colors.primary;
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}