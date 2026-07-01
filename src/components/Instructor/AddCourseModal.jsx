// AddCourseModal.jsx (updated for instructor)
import React, { useState } from "react";
import Swal from "sweetalert2";
import { createInstructorCourse } from "../../api/instructorApi";
import { colors } from "./AdminStyles";

export default function AddCourseModal({ isOpen, onClose, onCourseCreated, isInstructor = false }) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    level: "Beginner",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await createInstructorCourse(formData);
      Swal.fire({
        title: "Success!",
        text: "Course created successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      if (onCourseCreated) await onCourseCreated();
      onClose();
      setFormData({ title: "", price: "", level: "Beginner", description: "" });
    } catch (error) {
      Swal.fire({
        title: "Error!", 
        text: error.response?.data?.message || "Failed to create course", 
        icon: "error" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }} onClick={onClose}>
      <div style={{
        background: colors.surface,
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 500,
        maxHeight: "90vh",
        overflow: "auto",
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          {isInstructor ? "➕ Create New Course" : "➕ Add New Course"}
        </h2>
        <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>
          {isInstructor 
            ? "Create a new course for your students" 
            : "Fill in the details to add a new course"}
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
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
                background: "#fff"
              }}
              placeholder="e.g., React Masterclass"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
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
                background: "#fff"
              }}
              placeholder="0"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
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
                background: "#fff"
              }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
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
                background: "#fff"
              }}
              placeholder="Course description..."
            />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ 
                padding: "8px 20px", 
                borderRadius: 40, 
                border: `1px solid ${colors.borderLight}`, 
                background: "transparent", 
                cursor: "pointer" 
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              style={{ 
                padding: "8px 20px", 
                borderRadius: 40, 
                background: colors.primary, 
                color: "white", 
                border: "none", 
                cursor: "pointer",
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}