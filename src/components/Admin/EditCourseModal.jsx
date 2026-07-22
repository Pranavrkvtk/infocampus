// src/components/Admin/EditCourseModal.jsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import { updateAdminCourse } from "../../api/adminApi";
import { updateInstructorCourse } from "../../api/instructorApi";
import axiosInstance from "../../api/axios";

// ✅ Currency options
const currencyOptions = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
];

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (
    imageUrl.startsWith("data:image/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8082/api";
  if (imageUrl.startsWith("/uploads/")) return `${API_BASE}/admin${imageUrl}`;
  if (imageUrl.startsWith("uploads/")) return `${API_BASE}/admin/${imageUrl}`;
  return `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

export default function EditCourseModal({ 
  isOpen, 
  onClose, 
  course, 
  onCourseUpdated,
  isInstructor = false 
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    details: "",  // ✅ ADD DETAILS
    price: "",
    currency: "USD",  // ✅ ADD CURRENCY
    instructor: "",
    duration: "",
    level: "",
    videoUrl: "",
    imageUrl: "",
    status: "PUBLISHED"
  });

  // ── Image upload state ─────────────────────────────────────────
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        details: course.details || "",  // ✅ SET DETAILS
        price: course.price || "",
        currency: course.currency || "USD",  // ✅ SET CURRENCY
        instructor: course.instructor || "",
        duration: course.duration || "",
        level: course.level || "",
        videoUrl: course.videoUrl || "",
        imageUrl: course.imageUrl || "",
        status: course.status || "PUBLISHED"
      });
      setImageFile(null);
      setImagePreview(null);
      setRemoveExistingImage(false);
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      Swal.fire("Error", "Please upload a valid image (JPG, PNG, WEBP, or GIF)", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "Image size must be less than 5MB", "error");
      return;
    }

    setImageFile(file);
    setRemoveExistingImage(false);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearNewImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveExistingImage = () => {
    clearNewImage();
    setRemoveExistingImage(true);
  };

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencyOptions.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  };

  const resetForm = () => {
    setFormData({
      title: "", description: "", details: "",
      price: "", currency: "USD", instructor: "",
      duration: "", level: "", videoUrl: "",
      imageUrl: "", status: "PUBLISHED"
    });
    clearNewImage();
    setRemoveExistingImage(false);
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

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Swal.fire("Error", "Please enter a valid price greater than 0", "error");
      setLoading(false);
      return;
    }

    if (!formData.title.trim()) {
      Swal.fire("Error", "Please enter a course title", "error");
      setLoading(false);
      return;
    }

    const courseData = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      details: formData.details?.trim() || null,  // ✅ ADD DETAILS
      price: priceValue,
      currency: formData.currency || "USD",  // ✅ ADD CURRENCY
      instructor: formData.instructor,
      duration: formData.duration || null,
      videoUrl: formData.videoUrl || null,
      imageUrl: removeExistingImage ? null : (formData.imageUrl || null),
      level: formData.level || null,
      status: formData.status
    };

    try {
      // 1. Update the course's text/meta fields
      if (isInstructor) {
        await updateInstructorCourse(course.id, courseData);
      } else {
        await updateAdminCourse(course.id, courseData);
      }

      // 2. If a new image file was picked, upload it separately
      if (imageFile) {
        setUploadingImage(true);
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);
        try {
          const uploadResponse = await axiosInstance.post(
            `/admin/courses/${course.id}/upload-image`,
            imageFormData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          if (!uploadResponse.data?.success) {
            throw new Error(uploadResponse.data?.message || "Upload failed");
          }
        } catch (uploadErr) {
          console.warn("⚠️ Image upload failed:", uploadErr);
          Swal.fire({
            title: "Course Updated",
            text: "Course details saved, but the new image failed to upload. Please try again.",
            icon: "warning",
          });
        } finally {
          setUploadingImage(false);
        }
      }

      Swal.fire({
        title: "✅ Success!",
        text: "Course updated successfully!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      if (onCourseUpdated) await onCourseUpdated();
      onClose();
      resetForm();
    } catch (err) {
      console.error("Error updating course:", err);
      setError(err.response?.data?.message || "Failed to update course");
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to update course",
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !course) return null;

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: `1px solid ${colors.borderLight}`,
    borderRadius: 10,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    background: "var(--bg-base)",
    color: "var(--text-primary)",
    transition: "border-color 0.2s"
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: 4,
  };

  // What to actually show in the preview box
  const existingImageUrl = !removeExistingImage ? resolveImageUrl(formData.imageUrl) : null;
  const displayedImage = imagePreview || existingImageUrl;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      animation: "fadeIn 0.2s ease"
    }} onClick={handleClose}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      <div style={{
        backgroundColor: "var(--surface)",
        borderRadius: 12,
        width: "90%",
        maxWidth: 500,
        maxHeight: "85vh",
        overflowY: "auto",
        overflowX: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "slideUp 0.3s ease"
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${colors.borderLight}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--bg-base)",
          borderRadius: "12px 12px 0 0"
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              ✏️ Edit Course
            </h2>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
              {isInstructor ? "Update your course information" : "Update course information"}
            </p>
          </div>
          <button onClick={handleClose} style={{
            background: "transparent",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "var(--text-secondary)",
            padding: "4px 8px",
            borderRadius: "4px",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "16px 20px" }}>
          {error && (
            <div style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 16
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── Course Image Upload ───────────────────────────────── */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Course Image</label>
            <div
              style={{
                border: `2px dashed ${displayedImage ? colors.borderLight : colors.primary}`,
                borderRadius: 8,
                padding: displayedImage ? "8px" : "16px",
                textAlign: "center",
                background: displayedImage ? "transparent" : "rgba(0,0,0,0.02)",
                position: "relative",
                transition: "all 0.3s ease"
              }}
            >
              {displayedImage ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={displayedImage}
                    alt="Course"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                    onError={(e) => { e.target.style.opacity = 0.3; }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    display: "flex",
                    gap: 6,
                  }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Replace image"
                      style={{
                        background: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.9)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={imageFile ? clearNewImage : handleRemoveExistingImage}
                      title="Remove image"
                      style={{
                        background: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.9)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
                    >
                      ✕
                    </button>
                  </div>
                  {imageFile && (
                    <div style={{
                      position: "absolute",
                      bottom: "8px",
                      left: "8px",
                      background: "rgba(46, 139, 87, 0.9)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 10,
                    }}>
                      New image selected
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>🖼️</div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>
                    Click to upload a course image
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", opacity: 0.7, margin: 0 }}>
                    JPG, PNG, WEBP, GIF (max 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                </div>
              )}
            </div>
            {uploadingImage && (
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 6 }}>
                ⏳ Uploading image...
              </div>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Course Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Enter course title"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Enter course description"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Additional Details</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.6
              }}
              placeholder="Enter additional course information"
            />
          </div>

          {/* ✅ Price with Currency */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Price *</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="1"
                  min="1"
                  style={{ ...inputStyle, flex: 1, minWidth: "80px" }}
                  placeholder="0"
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    width: "80px",
                    flexShrink: 0,
                    cursor: "pointer",
                    padding: "8px 6px"
                  }}
                >
                  {currencyOptions.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{
                fontSize: 10,
                color: "var(--text-secondary)",
                marginTop: 3
              }}>
                Currency: <strong>{getCurrencySymbol(formData.currency)} {formData.currency}</strong>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Instructor *</label>
              {isInstructor ? (
                <div style={{
                  ...inputStyle,
                  background: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  You (Logged-in instructor)
                </div>
              ) : (
                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Instructor name or ID"
                />
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Duration</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                style={inputStyle}
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
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="PUBLISHED">✅ Published</option>
              <option value="DRAFT">📝 Draft</option>
              <option value="ARCHIVED">📦 Archived</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Video URL</label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              style={inputStyle}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "6px 16px",
                borderRadius: 30,
                border: `1px solid ${colors.borderLight}`,
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              style={{
                padding: "6px 20px",
                borderRadius: 30,
                background: colors.gradPrimary,
                border: "none",
                color: "#fff",
                cursor: (loading || uploadingImage) ? "not-allowed" : "pointer",
                opacity: (loading || uploadingImage) ? 0.7 : 1,
                transition: "opacity 0.2s"
              }}
            >
              {loading ? "Updating..." : uploadingImage ? "Uploading..." : "Update Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}