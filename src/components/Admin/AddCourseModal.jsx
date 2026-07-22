// src/components/Admin/AddCourseModal.jsx
import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import { createAdminCourse } from "../../api/adminApi";
import { createInstructorCourse } from "../../api/instructorApi";
import axiosInstance from "../../api/axios";

export default function AddCourseModal({ 
  isOpen, 
  onClose, 
  onCourseCreated,
  isInstructor = false
}) {
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    details: "",
    price: "", 
    currency: "USD",  // ✅ ADD CURRENCY FIELD
    duration: "", 
    level: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Currency options
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        Swal.fire("Error", "Please upload a valid image (JPG, PNG, WEBP, or GIF)", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Error", "Image size must be less than 5MB", "error");
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const reset = () => { 
    setForm({ 
      title: "", 
      description: "", 
      details: "",
      price: "", 
      currency: "USD",
      duration: "", 
      level: ""
    });
    resetImageState();
  };
  
  const handleClose = () => { 
    reset(); 
    onClose(); 
  };

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencyOptions.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const priceValue = parseFloat(form.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Swal.fire("Error", "Please enter a valid price greater than 0", "error");
      return;
    }

    if (!form.title.trim()) {
      Swal.fire("Error", "Please enter a course title", "error");
      return;
    }
    
    setLoading(true);
    setUploadProgress(10);
    
    try {
      const courseData = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        details: form.details?.trim() || '',
        price: priceValue,
        currency: form.currency || 'USD',  // ✅ ADD CURRENCY TO COURSE DATA
        duration: form.duration || '',
        level: form.level || '',
      };

      console.log('📤 STEP 1: Creating course with data:', courseData);
      console.log('📤 Mode:', isInstructor ? 'Instructor' : 'Admin');
      console.log('📤 Details length:', courseData.details.length);
      console.log('📤 Currency:', courseData.currency);
      setUploadProgress(30);
      
      let response;
      if (isInstructor) {
        response = await createInstructorCourse(courseData);
      } else {
        response = await createAdminCourse(courseData);
      }
      
      const courseId = response?.courseId || response?.id || response?.course?.id;
      
      if (!courseId) {
        throw new Error('Course created but no ID returned');
      }
      
      console.log('✅ Course created with ID:', courseId);
      setUploadProgress(60);
      
      if (imageFile) {
        console.log('📤 STEP 2: Uploading image for course:', courseId);
        
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        
        try {
          const uploadResponse = await axiosInstance.post(
            `/admin/courses/${courseId}/upload-image`,
            imageFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          if (uploadResponse.data.success) {
            console.log('✅ Image uploaded successfully:', uploadResponse.data);
            setUploadProgress(90);
          } else {
            throw new Error(uploadResponse.data.message || 'Upload failed');
          }
        } catch (uploadError) {
          console.warn('⚠️ Image upload failed:', uploadError);
          Swal.fire({
            title: "Course Created",
            text: "Course created successfully, but image upload failed. You can add image later.",
            icon: "warning",
            timer: 2000,
            showConfirmButton: true,
          });
        }
      }
      
      setUploadProgress(100);
      
      Swal.fire({
        title: "Success!",
        text: "Course created successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      
      if (onCourseCreated) await onCourseCreated();
      handleClose();
      
    } catch (err) {
      console.error('❌ Error creating course:', err);
      
      let errorMessage = "Failed to create course";
      if (err.response?.status === 403) {
        errorMessage = "You don't have permission to create courses. Please make sure you're logged in as an admin.";
      } else if (err.response?.status === 401) {
        errorMessage = "Your session has expired. Please login again.";
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Swal.fire("Error", errorMessage, "error");
    }
    setLoading(false);
    setUploadProgress(0);
  };

  if (!isOpen) return null;

  const input = { 
    width: "100%", 
    padding: "6px 10px", 
    border: `1px solid ${colors.borderLight}`, 
    borderRadius: 6, 
    fontSize: 12, 
    outline: "none", 
    boxSizing: "border-box",
    background: "var(--bg-base)",
    color: "var(--text-primary)",
    transition: "border-color 0.2s"
  };
  
  const label = { 
    display: "block", 
    fontSize: 11, 
    fontWeight: 600, 
    marginBottom: 3,
    color: "var(--text-secondary)"
  };

  return (
    <div 
      style={{ 
        position: "fixed", 
        inset: 0, 
        background: "rgba(0,0,0,0.5)", 
        backdropFilter: "blur(4px)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        zIndex: 1000,
        animation: "fadeIn 0.2s ease"
      }} 
      onClick={handleClose}
    >
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
      <div 
        style={{ 
          background: "var(--surface)",
          borderRadius: 12, 
          width: "90%", 
          maxWidth: 450, 
          maxHeight: "80vh", 
          overflowY: "auto",
          overflowX: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          animation: "slideUp 0.3s ease"
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div 
          style={{ 
            padding: "10px 14px", 
            borderBottom: `1px solid ${colors.borderLight}`, 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-base)",
            borderRadius: "12px 12px 0 0"
          }}
        >
          <h2 style={{ fontSize: 15, margin: 0, color: "var(--text-primary)" }}>
            {isInstructor ? "➕ Add Course (Instructor)" : "➕ Add Course"}
          </h2>
          <button 
            onClick={handleClose} 
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: 18, 
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
              transition: "background 0.2s",
              color: "var(--text-secondary)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "10px 14px" }}>
          {/* Course Image Upload Section */}
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Course Image</label>
            <div 
              style={{ 
                border: `2px dashed ${imagePreview ? colors.borderLight : colors.primary}`,
                borderRadius: 8,
                padding: imagePreview ? "8px" : "16px",
                textAlign: "center",
                transition: "all 0.3s ease",
                background: imagePreview ? "transparent" : "rgba(0,0,0,0.02)",
                position: "relative",
                cursor: "pointer",
              }}
            >
              {imagePreview ? (
                <div style={{ position: "relative" }}>
                  <img 
                    src={imagePreview} 
                    alt="Course preview" 
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(0,0,0,0.7)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      fontSize: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.9)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "40px", marginBottom: "8px" }}>
                    🖼️
                  </div>
                  <p style={{ 
                    fontSize: "13px", 
                    color: "var(--text-secondary)", 
                    margin: "0 0 8px 0"
                  }}>
                    Click to upload course image
                  </p>
                  <p style={{ 
                    fontSize: "11px", 
                    color: "var(--text-secondary)", 
                    opacity: 0.7,
                    margin: 0
                  }}>
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
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={label}>Title *</label>
            <input 
              type="text" 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              required 
              style={input} 
              placeholder="Enter course title"
              maxLength={100}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={label}>Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows={2} 
              style={{ ...input, resize: "vertical" }} 
              placeholder="Enter course description"
              maxLength={500}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={label}>Additional Details</label>
            <textarea 
              name="details" 
              value={form.details} 
              onChange={handleChange} 
              rows={4} 
              style={{ 
                ...input, 
                resize: "vertical",
                fontFamily: "inherit",
                fontSize: 12,
                lineHeight: 1.6
              }} 
              placeholder="Enter additional course information like:
• Course objectives
• What students will learn
• Prerequisites
• Target audience
• Course highlights"
            />
            <div style={{ 
              fontSize: 10, 
              color: "var(--text-secondary)", 
              marginTop: 3,
              display: "flex",
              justifyContent: "space-between"
            }}>
              <span>You can add multiple paragraphs and bullet points</span>
              <span>{form.details.length}/5000</span>
            </div>
          </div>

          {/* ✅ Price with Currency Selection */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Price *</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input 
                  type="number" 
                  name="price" 
                  value={form.price} 
                  onChange={handleChange} 
                  required 
                  step="1" 
                  min="1"
                  style={{ 
                    ...input, 
                    flex: 1,
                    minWidth: "80px"
                  }} 
                  placeholder="0"
                />
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  style={{
                    ...input,
                    width: "80px",
                    flexShrink: 0,
                    cursor: "pointer",
                    padding: "6px 6px"
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
                Current currency: <strong>{getCurrencySymbol(form.currency)} {form.currency}</strong>
              </div>
            </div>
            
            {isInstructor && (
              <div style={{ flex: 1 }}>
                <label style={label}>Instructor</label>
                <div style={{ 
                  ...input, 
                  background: '#f5f5f5', 
                  color: '#333',
                  padding: '6px 10px',
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'not-allowed'
                }}>
                  You (Logged-in instructor)
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Duration</label>
              <select 
                name="duration" 
                value={form.duration} 
                onChange={handleChange} 
                style={input}
              >
                <option value="">Select</option>
                <option value="1-2 hours">1-2h</option>
                <option value="3-5 hours">3-5h</option>
                <option value="6-10 hours">6-10h</option>
                <option value="10-20 hours">10-20h</option>
                <option value="20+ hours">20+h</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Level</label>
              <select 
                name="level" 
                value={form.level} 
                onChange={handleChange} 
                style={input}
              >
                <option value="">Select</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ 
                width: '100%', 
                height: '4px', 
                background: '#e0e0e0', 
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${uploadProgress}%`, 
                  height: '100%', 
                  background: colors.gradPrimary,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {uploadProgress < 60 ? 'Creating course...' : 'Uploading image...'} {uploadProgress}%
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button 
              type="button" 
              onClick={handleClose} 
              style={{ 
                padding: "5px 12px", 
                borderRadius: 16, 
                fontSize: 11, 
                background: "transparent", 
                border: `1px solid ${colors.borderLight}`, 
                cursor: "pointer",
                transition: "background-color 0.2s",
                color: "var(--text-secondary)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                padding: "5px 16px", 
                borderRadius: 16, 
                fontSize: 11, 
                fontWeight: 600, 
                background: colors.gradPrimary, 
                border: "none", 
                color: "#fff", 
                cursor: loading ? "not-allowed" : "pointer", 
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.2s"
              }}
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}