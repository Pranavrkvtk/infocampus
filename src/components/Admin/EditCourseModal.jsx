// src/components/Admin/EditCourseModal.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import { updateAdminCourse } from "../../api/adminApi";

export default function EditCourseModal({ isOpen, onClose, course, onCourseUpdated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
    duration: "",
    level: "",
    videoUrl: "",
    imageUrl: "",
    status: "PUBLISHED"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        price: course.price || "",
        instructor: course.instructor || "",
        duration: course.duration || "",
        level: course.level || "",
        videoUrl: course.videoUrl || "",
        imageUrl: course.imageUrl || "",
        status: course.status || "PUBLISHED"
      });
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "", description: "", price: "",
      instructor: "", duration: "", level: "",
      videoUrl: "", imageUrl: "", status: "PUBLISHED"
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
      status: formData.status
    };

    try {
      const response = await updateAdminCourse(course.id, courseData);
      console.log("Course updated:", response.data);
      
      Swal.fire({
        title: '✅ Success!',
        text: 'Course updated successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      if (onCourseUpdated) await onCourseUpdated();
      onClose();
      resetForm();
    } catch (err) {
      console.error("Error updating course:", err);
      setError(err.response?.data?.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !course) return null;

  const inputStyle = {
    width: "100%", padding: "8px 12px",
    border: `1px solid ${colors.borderLight}`,
    borderRadius: 10, fontSize: 13, outline: "none",
    boxSizing: "border-box",
  };
  
  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: colors.textPrimary, marginBottom: 4,
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)",
    }} onClick={handleClose}>
      <div style={{
        backgroundColor: colors.surface, borderRadius: 20,
        width: "90%", maxWidth: 500, maxHeight: "85vh",
        overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${colors.borderLight}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>✏️ Edit Course</h2>
            <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>Update course information</p>
          </div>
          <button onClick={handleClose} style={{
            background: "transparent", border: "none",
            fontSize: 20, cursor: "pointer", color: colors.textMuted,
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "16px 20px" }}>
          {error && <div style={{ background: colors.coralSoft, color: colors.coral, padding: "8px 12px", borderRadius: 10, fontSize: 12, marginBottom: 16 }}>⚠️ {error}</div>}

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Course Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Price ($) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Instructor *</label>
              <input type="text" name="instructor" value={formData.instructor} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Duration</label>
              <select name="duration" value={formData.duration} onChange={handleChange} style={inputStyle}>
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
              <select name="level" value={formData.level} onChange={handleChange} style={inputStyle}>
                <option value="">Select</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} style={inputStyle}>
              <option value="PUBLISHED">📢 Published</option>
              <option value="DRAFT">📝 Draft</option>
              <option value="ARCHIVED">📦 Archived</option>
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Video URL</label>
            <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Image URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={handleClose} style={{ padding: "6px 16px", borderRadius: 30, border: `1px solid ${colors.borderLight}`, background: "transparent" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "6px 20px", borderRadius: 30, background: colors.gradPrimary, border: "none", color: "#fff" }}>{loading ? "Updating..." : "Update Course"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}