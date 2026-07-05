// src/components/Admin/AddCourseModal.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import { createAdminCourse, getAllInstructors } from "../../api/adminApi";
import { createInstructorCourse } from "../../api/instructorApi";

export default function AddCourseModal({ 
  isOpen, 
  onClose, 
  onCourseCreated,
  isInstructor = false
}) {
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    price: "", 
    instructor: "", 
    duration: "", 
    level: ""
  });
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  useEffect(() => {
    if (isOpen && !isInstructor) {
      fetchInstructors();
    }
  }, [isOpen, isInstructor]);

  const fetchInstructors = async () => {
    setLoadingInstructors(true);
    try {
      const data = await getAllInstructors();
      let instructorsArray = [];
      
      if (Array.isArray(data)) {
        instructorsArray = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.instructors)) {
          instructorsArray = data.instructors;
        } else if (Array.isArray(data.data)) {
          instructorsArray = data.data;
        } else if (Array.isArray(data.content)) {
          instructorsArray = data.content;
        } else {
          instructorsArray = [data];
        }
      }
      
      const validInstructors = instructorsArray.filter(inst => 
        inst && (inst.id || inst._id) && (inst.name || inst.email)
      );
      
      setInstructors(validInstructors);
      
      if (validInstructors.length === 0) {
        console.warn('No valid instructors found in response');
      }
    } catch (error) {
      console.error("Failed to fetch instructors:", error);
      Swal.fire("Error", "Failed to load instructors list", "error");
      setInstructors([]);
    } finally {
      setLoadingInstructors(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const reset = () => { 
    setForm({ 
      title: "", 
      description: "", 
      price: "", 
      instructor: "", 
      duration: "", 
      level: ""
    }); 
  };
  
  const handleClose = () => { 
    reset(); 
    onClose(); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate price
    const priceValue = parseFloat(form.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Swal.fire("Error", "Please enter a valid price greater than 0", "error");
      return;
    }
    
    setLoading(true);
    try {
      const courseData = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        price: priceValue,
        duration: form.duration || null,
        level: form.level || null,
      };

      // For admin mode, include instructor ID if selected
      if (!isInstructor && form.instructor) {
        courseData.instructor = form.instructor;
      } else if (!isInstructor) {
        courseData.instructor = null;
      }

      console.log('Creating course with data:', courseData);
      
      // Use different API based on mode
      if (isInstructor) {
        await createInstructorCourse(courseData);
      } else {
        await createAdminCourse(courseData);
      }
      
      Swal.fire("Success!", "Course created successfully!", "success");
      if (onCourseCreated) await onCourseCreated();
      handleClose();
    } catch (err) {
      console.error('Error creating course:', err);
      Swal.fire("Error", err.response?.data?.message || "Failed to create course", "error");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const input = { 
    width: "100%", 
    padding: "6px 10px", 
    border: `1px solid ${colors.borderLight}`, 
    borderRadius: 6, 
    fontSize: 12, 
    outline: "none", 
    boxSizing: "border-box" 
  };
  
  const label = { 
    display: "block", 
    fontSize: 11, 
    fontWeight: 600, 
    marginBottom: 3 
  };

  const getInstructorId = (instructor) => {
    return instructor.id || instructor._id;
  };

  const getInstructorName = (instructor) => {
    return instructor.name || 
           instructor.fullName || 
           instructor.username || 
           instructor.email || 
           `Instructor ${getInstructorId(instructor)}`;
  };

  return (
    <div 
      style={{ 
        position: "fixed", 
        inset: 0, 
        background: "rgba(0,0,0,0.5)", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        zIndex: 1000 
      }} 
      onClick={handleClose}
    >
      <div 
        style={{ 
          background: colors.surface, 
          borderRadius: 12, 
          width: "90%", 
          maxWidth: 450, 
          maxHeight: "80vh", 
          overflowY: "auto" 
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div 
          style={{ 
            padding: "10px 14px", 
            borderBottom: `1px solid ${colors.borderLight}`, 
            display: "flex", 
            justifyContent: "space-between" 
          }}
        >
          <h2 style={{ fontSize: 15, margin: 0 }}>
            {isInstructor ? "➕ Add Course" : "➕ Add Course"}
          </h2>
          <button 
            onClick={handleClose} 
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: 18, 
              cursor: "pointer" 
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "10px 14px" }}>
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
<div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
  <div style={{ flex: 1 }}>
    <label style={label}>Price *</label>
    <input 
      type="number" 
      name="price" 
      value={form.price} 
      onChange={handleChange} 
      required 
      step="1" 
      min="1"
      style={input} 
      placeholder="0"
    />
  </div>
  
  {/* Instructor dropdown - only show for admin */}
  {!isInstructor && (
    <div style={{ flex: 1 }}>
      <label style={label}>Instructor (Optional)</label>
      <select 
        name="instructor" 
        value={form.instructor} 
        onChange={handleChange} 
        style={input}
        disabled={loadingInstructors}
      >
        <option value="">Unassigned</option>
        {Array.isArray(instructors) && instructors.length > 0 ? (
          instructors.map((instructor) => {
            const id = getInstructorId(instructor);
            const displayName = getInstructorName(instructor);
            
            return (
              <option key={id} value={id}>
                {displayName}
              </option>
            );
          })
        ) : (
          !loadingInstructors && (
            <option value="" disabled>No instructors available</option>
          )
        )}
      </select>
      {!loadingInstructors && instructors.length === 0 && (
        <div style={{ fontSize: 10, color: '#e74c3c', marginTop: 4 }}>
          No instructors found. Please add instructors first.
        </div>
      )}
    </div>
  )}
  
  {/* For instructor mode, show the instructor name as read-only */}
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
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
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