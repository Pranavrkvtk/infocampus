// src/components/Admin/AddCourseModal.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import { createAdminCourse } from "../../api/adminApi";

export default function AddCourseModal({ isOpen, onClose, onCourseCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
    duration: "",
    level: "",
    videoUrl: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      instructor: "",
      duration: "",
      level: "",
      videoUrl: "",
      imageUrl: "",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const courseData = {
      title: formData.title,
      description: formData.description || null,
      price: parseFloat(formData.price),
      instructor: formData.instructor,
      duration: formData.duration || null,
      videoUrl: formData.videoUrl || null,
      imageUrl: formData.imageUrl || null,
      level: formData.level || null,
    };

    try {
      await createAdminCourse(courseData);
      Swal.fire({
        title: "Success!",
        text: "Course created successfully!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      if (onCourseCreated) await onCourseCreated();
      onClose();
      resetForm();
    } catch (err) {
      console.error("Error creating course:", err);
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: `1px solid ${colors.borderLight}`,
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          width: "90%",
          maxWidth: 500,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${colors.borderLight}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>➕ Add Course</h2>
            <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, marginBottom: 0 }}>
              Fill in course details
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: colors.textMuted,
              padding: 2,
              borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "16px 20px" }}>
          {error && (
            <div
              style={{
                background: colors.coralSoft,
                color: colors.coral,
                padding: "8px 12px",
                borderRadius: 10,
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Course Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Advanced JavaScript"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="Brief description..."
              style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Instructor *</label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                required
                placeholder="e.g., John Doe"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Duration</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: colors.surface, cursor: "pointer" }}
              >
                <option value="">Select</option>
                <option value="1-2 hours">1–2 hours</option>
                <option value="3-5 hours">3–5 hours</option>
                <option value="6-10 hours">6–10 hours</option>
                <option value="10-20 hours">10–20 hours</option>
                <option value="20+ hours">20+ hours</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: colors.surface, cursor: "pointer" }}
              >
                <option value="">Select</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Video URL</label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "6px 16px",
                borderRadius: 30,
                fontSize: 12,
                fontWeight: 500,
                background: "transparent",
                border: `1px solid ${colors.borderLight}`,
                color: colors.textSecondary,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "6px 20px",
                borderRadius: 30,
                fontSize: 12,
                fontWeight: 600,
                background: colors.gradPrimary,
                border: "none",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}