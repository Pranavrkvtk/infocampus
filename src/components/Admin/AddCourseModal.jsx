// src/components/Admin/AddCourseModal.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import { colors } from "./AdminStyles";
import { createAdminCourse } from "../../api/adminApi";

export default function AddCourseModal({ isOpen, onClose, onCourseCreated }) {
  const [form, setForm] = useState({ title: "", description: "", price: "", instructor: "", duration: "", level: "", videoUrl: "", imageUrl: "" });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/') || file.size > 5*1024*1024) return;
    const reader = new FileReader();
    reader.onloadend = () => { setPreview(reader.result); setForm({ ...form, imageUrl: reader.result }); };
    reader.readAsDataURL(file);
  };

  const reset = () => { setForm({ title: "", description: "", price: "", instructor: "", duration: "", level: "", videoUrl: "", imageUrl: "" }); setPreview(""); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAdminCourse({
        title: form.title,
        description: form.description || null,
        price: parseFloat(form.price),
        instructor: form.instructor,
        duration: form.duration || null,
        videoUrl: form.videoUrl || null,
        imageUrl: form.imageUrl || null,
        level: form.level || null,
      });
      Swal.fire("Success!", "Course created!", "success");
      if (onCourseCreated) await onCourseCreated();
      handleClose();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to create course", "error");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const input = { width: "100%", padding: "6px 10px", border: `1px solid ${colors.borderLight}`, borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box" };
  const label = { display: "block", fontSize: 11, fontWeight: 600, marginBottom: 3 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={handleClose}>
      <div style={{ background: colors.surface, borderRadius: 12, width: "90%", maxWidth: 450, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${colors.borderLight}`, display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 15, margin: 0 }}>➕ Add Course</h2>
          <button onClick={handleClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "10px 14px" }}>
          <div style={{ marginBottom: 10 }}>
            <label style={label}>Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required style={input} />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={label}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} style={{ ...input, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}><label style={label}>Price *</label><input type="number" name="price" value={form.price} onChange={handleChange} required step="0.01" style={input} /></div>
            <div style={{ flex: 1 }}><label style={label}>Instructor *</label><input type="text" name="instructor" value={form.instructor} onChange={handleChange} required style={input} /></div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Duration</label>
              <select name="duration" value={form.duration} onChange={handleChange} style={input}>
                <option value="">Select</option>
                <option value="1-2 hours">1-2h</option><option value="3-5 hours">3-5h</option>
                <option value="6-10 hours">6-10h</option><option value="10-20 hours">10-20h</option><option value="20+ hours">20+h</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Level</label>
              <select name="level" value={form.level} onChange={handleChange} style={input}>
                <option value="">Select</option>
                <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={label}>Video URL</label>
            <input type="url" name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://..." style={input} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={label}>Image</label>
            {preview && (
              <div style={{ position: "relative", marginBottom: 6 }}>
                <img src={preview} alt="" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6 }} />
                <button type="button" onClick={() => { setPreview(""); setForm({ ...form, imageUrl: "" }); }} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 10 }}>✕</button>
              </div>
            )}
            <div style={{ border: `1px dashed ${colors.borderLight}`, borderRadius: 6, padding: "8px", textAlign: "center", marginBottom: 6, cursor: "pointer" }} onClick={() => document.getElementById("img").click()}>
              <input id="img" type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              <span style={{ fontSize: 20 }}>📸</span>
              <div style={{ fontSize: 10 }}>Upload</div>
            </div>
            <div style={{ textAlign: "center", fontSize: 9, margin: "4px 0" }}>— OR —</div>
            <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." style={input} disabled={!!preview} />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={handleClose} style={{ padding: "5px 12px", borderRadius: 16, fontSize: 11, background: "transparent", border: `1px solid ${colors.borderLight}`, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "5px 16px", borderRadius: 16, fontSize: 11, fontWeight: 600, background: colors.gradPrimary, border: "none", color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>{loading ? "..." : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}