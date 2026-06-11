import React, { useState, useRef, useEffect } from "react";
import { 
  uploadPdf, 
  getAllPdfsEnriched,
  getAllPdfs,
  deletePdf,
  getAllCourses,
  getCurrentUserId,
  formatFileSize,
  formatDate,
  generateCourseStructure
} from "../../api/pdfApi";
import Swal from "sweetalert2";
import axios from "axios";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1a1a2e",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#8e8ea0",
    marginBottom: 20,
  },
  dropZone: (dragging, hasFile) => ({
    border: `2px dashed ${dragging ? "#5E5BFF" : hasFile ? "#22c55e" : "#d1d5db"}`,
    borderRadius: 12,
    padding: "36px 24px",
    textAlign: "center",
    background: dragging ? "#f0f0ff" : hasFile ? "#f0fdf4" : "#fafafa",
    cursor: "pointer",
    transition: "all 0.2s ease",
  }),
  dropIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  dropText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: 500,
    marginBottom: 4,
  },
  dropHint: {
    fontSize: 12,
    color: "#9ca3af",
  },
  hiddenInput: {
    display: "none",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    padding: "12px 16px",
    background: "#f8f8ff",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  },
  fileIcon: {
    fontSize: 26,
  },
  fileName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1a1a2e",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    fontSize: 12,
    color: "#6b7280",
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#ef4444",
    fontSize: 18,
    lineHeight: 1,
    padding: "0 4px",
  },
  formRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    color: "#1a1a2e",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    color: "#1a1a2e",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "80px",
    resize: "vertical",
  },
  select: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    color: "#1a1a2e",
    background: "#fff",
    outline: "none",
    cursor: "pointer",
  },
  optionsRow: {
    display: "flex",
    gap: 12,
    marginTop: 16,
    flexWrap: "wrap",
  },
  optionChip: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 999,
    border: `1.5px solid ${active ? "#5E5BFF" : "#e5e7eb"}`,
    background: active ? "#f0f0ff" : "#fff",
    color: active ? "#5E5BFF" : "#6b7280",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  }),
  uploadBtn: (disabled) => ({
    marginTop: 24,
    width: "100%",
    padding: "13px 0",
    borderRadius: 10,
    border: "none",
    background: disabled ? "#c7c7f5" : "linear-gradient(135deg, #5E5BFF, #7c6fff)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: 0.3,
    transition: "opacity 0.2s",
  }),
  progressBar: {
    marginTop: 16,
    height: 6,
    borderRadius: 999,
    background: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: "linear-gradient(90deg, #5E5BFF, #7c6fff)",
    borderRadius: 999,
    transition: "width 0.3s ease",
  }),
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "right",
  },
  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    marginTop: 16,
    fontSize: 14,
    color: "#16a34a",
    fontWeight: 500,
  },
  infoBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    marginTop: 16,
    fontSize: 13,
    color: "#1e40af",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr 1fr 1fr",
    gap: 12,
    padding: "10px 16px",
    background: "#f9fafb",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr 1fr 1fr",
    gap: 12,
    padding: "14px 16px",
    borderBottom: "1px solid #f3f4f6",
    alignItems: "center",
    fontSize: 13,
    color: "#374151",
  },
  badge: (type) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    background: type === "Course" ? "#ede9fe" : "#dbeafe",
    color: type === "Course" ? "#7c3aed" : "#1d4ed8",
  }),
  statusDot: (status) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: status === "Completed" ? "#16a34a" : status === "Processing" ? "#d97706" : "#6b7280",
    fontWeight: 500,
  }),
  viewBtn: {
    background: "#5E5BFF",
    border: "none",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 11,
    cursor: "pointer",
    color: "#fff",
    marginRight: 6,
  },
  generateBtn: {
    background: "#8b5cf6",
    border: "none",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 11,
    cursor: "pointer",
    color: "#fff",
    marginRight: 6,
  },
  deleteBtn: {
    background: "#ef4444",
    border: "none",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 11,
    cursor: "pointer",
    color: "#fff",
  },
  createCourseBtn: {
    marginTop: 8,
    padding: "8px 16px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 0",
    color: "#9ca3af",
    fontSize: 14,
  },
  loadingState: {
    textAlign: "center",
    padding: "40px 0",
    color: "#5E5BFF",
    fontSize: 14,
  },
  modalOverlay: {
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
  },
  modalContent: {
    background: "white",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80vh",
    overflow: "auto",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20,
    color: "#1a1a2e",
  },
  modalButtons: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelBtn: {
    padding: "10px 20px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  saveBtn: {
    padding: "10px 20px",
    background: "#5E5BFF",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
};

export default function PdfUploadTab() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [contentType, setContentType] = useState("course");
  const [extractImages, setExtractImages] = useState(true);
  const [extractText, setExtractText] = useState(true);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState({});
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ 
    title: "", 
    description: "", 
    instructor: "", 
    price: 0,
    level: "Beginner",
    duration: ""
  });
  const inputRef = useRef();

  useEffect(() => {
    fetchPdfs();
    fetchCourses();
  }, []);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      // Try enriched endpoint first
      const response = await getAllPdfsEnriched();
      console.log("Enriched PDFs response:", response.data);
      
      const pdfs = response.data.map(pdf => ({
        id: pdf.id,
        name: pdf.fileName,
        type: "Course",
        pages: pdf.pageCount || 0,
        images: pdf.imageCount || 0,
        status: pdf.isProcessed ? "Completed" : "Processing",
        date: pdf.uploadedAt,
        fileSize: pdf.fileSize,
        courseId: pdf.courseId || pdf.course?.id || null,
        courseTitle: pdf.courseTitle || pdf.course?.title || "Not assigned",
      }));
      
      console.log("Processed PDFs with courses:", pdfs);
      setUploads(pdfs);
    } catch (error) {
      console.error("Error fetching enriched PDFs:", error);
      // Fallback to regular endpoint
      try {
        const fallbackResponse = await getAllPdfs();
        console.log("Fallback PDFs response:", fallbackResponse.data);
        
        const pdfs = fallbackResponse.data.map(pdf => ({
          id: pdf.id,
          name: pdf.fileName,
          type: "Course",
          pages: pdf.pageCount || 0,
          images: pdf.imageCount || 0,
          status: pdf.isProcessed ? "Completed" : "Processing",
          date: pdf.uploadedAt,
          fileSize: pdf.fileSize,
          courseId: pdf.course?.id || null,
          courseTitle: pdf.course?.title || "Not assigned",
        }));
        setUploads(pdfs);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        Swal.fire("Error", "Failed to load PDFs", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await getAllCourses();
      console.log("Courses response:", response.data);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) {
      Swal.fire("Error", "Course title is required", "error");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8082/api/admin/courses', newCourse, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      Swal.fire("Success", "Course created successfully!", "success");
      setShowCreateCourse(false);
      setNewCourse({ title: "", description: "", instructor: "", price: 0, level: "Beginner", duration: "" });
      await fetchCourses();
      
      if (response.data && response.data.id) {
        setSelectedCourseId(response.data.id);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      Swal.fire("Error", error.response?.data?.error || "Failed to create course", "error");
    }
  };

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setSuccess(false);
      setProgress(0);
      if (!title) setTitle(f.name.replace(".pdf", ""));
    } else {
      Swal.fire("Invalid File", "Please select a valid PDF file.", "warning");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      Swal.fire("Missing Info", "Please select a file and enter a title", "warning");
      return;
    }

    if (!selectedCourseId && contentType === "course") {
      Swal.fire("Missing Course", "Please select a course for this PDF. The course structure will be generated automatically from the PDF content.", "warning");
      return;
    }

    setUploading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const userId = getCurrentUserId();
      
      await uploadPdf(
        file, 
        title, 
        contentType, 
        extractImages, 
        extractText, 
        selectedCourseId,
        userId
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      
      Swal.fire({
        title: "Success!",
        html: `PDF uploaded successfully!<br/><br/>✅ Text extracted<br/>✅ Images extracted<br/>✅ Course structure generated automatically!`,
        icon: "success",
        timer: 3000,
        showConfirmButton: false
      });
      
      setFile(null);
      setTitle("");
      setSelectedCourseId("");
      setProgress(0);
      await fetchPdfs();
      
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload error:", error);
      Swal.fire(
        "Upload Failed", 
        error.response?.data?.error || error.message || "Failed to upload PDF", 
        "error"
      );
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateStructure = async (pdfId, pdfName) => {
    setGenerating(prev => ({ ...prev, [pdfId]: true }));
    
    Swal.fire({
      title: 'Generating Structure...',
      text: `Parsing "${pdfName}" to create topics and subtopics`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await generateCourseStructure(pdfId);
      console.log("Generation response:", response.data);
      
      Swal.fire({
        title: 'Success!',
        text: `Generated ${response.data.topicsCount} topics and ${response.data.subtopicsCount} subtopics`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      await fetchPdfs();
      
    } catch (error) {
      console.error("Generation error:", error);
      Swal.fire({
        title: 'Generation Failed',
        text: error.response?.data?.error || 'Failed to generate structure. Make sure PDF has extractable text.',
        icon: 'error'
      });
    } finally {
      setGenerating(prev => ({ ...prev, [pdfId]: false }));
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Delete PDF?",
      text: `Are you sure you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await deletePdf(id);
        Swal.fire("Deleted!", "PDF has been deleted.", "success");
        await fetchPdfs();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error", "Failed to delete PDF", "error");
      }
    }
  };

  const handleView = (pdf) => {
    Swal.fire({
      title: pdf.name,
      html: `
        <div style="text-align: left;">
          <p><strong>Course:</strong> ${pdf.courseTitle}</p>
          <p><strong>Course ID:</strong> ${pdf.courseId || 'None'}</p>
          <p><strong>Pages:</strong> ${pdf.pages}</p>
          <p><strong>Images:</strong> ${pdf.images}</p>
          <p><strong>Status:</strong> ${pdf.status}</p>
          <p><strong>Uploaded:</strong> ${formatDate(pdf.date)}</p>
          <p><strong>File Size:</strong> ${formatFileSize(pdf.fileSize)}</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
      confirmButtonColor: "#5E5BFF",
    });
  };

  return (
    <div style={styles.container}>
      {/* Upload Card */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Upload PDF to Generate Course Structure</div>
        <div style={styles.cardSubtitle}>
          Upload a PDF with UPPERCASE headings to automatically create topics and subtopics.
        </div>

        <div style={styles.infoBanner}>
          <span>💡</span>
          <span>PDFs with UPPERCASE lines become TOPICS. Regular lines become SUBTOPICS automatically!</span>
        </div>

        <div
          style={styles.dropZone(dragging, !!file)}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div style={styles.dropIcon}>{file ? "✅" : "📄"}</div>
          <div style={styles.dropText}>
            {file ? file.name : "Drag & drop a PDF here"}
          </div>
          <div style={styles.dropHint}>
            {file ? "Click to change file" : "or click to browse — PDF files only (Max 50MB)"}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={styles.hiddenInput}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {file && (
          <div style={styles.fileInfo}>
            <span style={styles.fileIcon}>📋</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.fileName}>{file.name}</div>
              <div style={styles.fileSize}>{formatFileSize(file.size)}</div>
            </div>
            <button style={styles.removeBtn} onClick={() => setFile(null)}>✕</button>
          </div>
        )}

        <div style={styles.formRow}>
          <label style={styles.label}>Content Title</label>
          <input
            style={styles.input}
            placeholder="e.g. Java Basics – Module 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = "#5E5BFF")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Select Course *</label>
          <select
            style={styles.select}
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            required
          >
            <option value="">-- Select a Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title} - {course.instructor} ({course.level})
              </option>
            ))}
          </select>
          
          <button
            style={styles.createCourseBtn}
            onClick={() => setShowCreateCourse(true)}
          >
            + Create New Course
          </button>
          
          {loadingCourses && <div style={{ fontSize: 12, color: "#6b7280" }}>Loading courses...</div>}
          {courses.length === 0 && !loadingCourses && (
            <div style={{ fontSize: 12, color: "#ef4444" }}>
              No courses found. Please create a course first.
            </div>
          )}
        </div>

        <div style={styles.formRow}>
          <label style={styles.label}>Convert PDF to</label>
          <select
            style={styles.select}
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            <option value="course">Course / Lesson</option>
            <option value="post">Blog Post</option>
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={styles.label}>Extract Options</label>
          <div style={styles.optionsRow}>
            <button
              style={styles.optionChip(extractText)}
              onClick={() => setExtractText(!extractText)}
            >
              {extractText ? "✓" : "○"} Extract Text
            </button>
            <button
              style={styles.optionChip(extractImages)}
              onClick={() => setExtractImages(!extractImages)}
            >
              {extractImages ? "✓" : "○"} Extract Images
            </button>
          </div>
        </div>

        <button
          style={styles.uploadBtn(!file || !title.trim() || !selectedCourseId || uploading)}
          disabled={!file || !title.trim() || !selectedCourseId || uploading}
          onClick={handleUpload}
        >
          {uploading ? `Processing... ${Math.round(progress)}%` : "Upload & Generate Course Structure"}
        </button>

        {(uploading || progress > 0) && !success && (
          <>
            <div style={styles.progressBar}>
              <div style={styles.progressFill(progress)} />
            </div>
            <div style={styles.progressText}>
              {progress < 40 ? "Uploading PDF…" : progress < 75 ? "Extracting content & generating structure…" : "Saving to database…"} {Math.round(progress)}%
            </div>
          </>
        )}

        {success && (
          <div style={styles.successBanner}>
            <span>✅</span> 
            PDF processed successfully! Topics and subtopics have been generated automatically from your PDF content.
          </div>
        )}
      </div>

      {/* Uploads History */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>PDF Upload History</div>
        <div style={styles.cardSubtitle}>All previously uploaded PDFs and their processing status.</div>

        <div style={styles.tableHeader}>
          <span>File Name</span>
          <span>Type</span>
          <span>Course</span>
          <span>Pages</span>
          <span>Images</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <span>⏳</span> Loading PDFs...
          </div>
        ) : uploads.length === 0 ? (
          <div style={styles.emptyState}>
            <span>📭</span>
            <p>No PDFs uploaded yet.</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>Upload your first PDF to automatically generate course structure.</p>
          </div>
        ) : (
          uploads.map((u) => (
            <div key={u.id} style={styles.tableRow}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>📄</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.name}
                </span>
              </span>
              <span><span style={styles.badge(u.type)}>{u.type}</span></span>
              <span style={{ fontSize: 12, color: u.courseId ? "#16a34a" : "#9ca3af" }}>
                {u.courseTitle}
              </span>
              <span>{u.pages}</span>
              <span>{u.images}</span>
              <span>
                <span style={styles.statusDot(u.status)}>
                  {u.status === "Completed" ? "✓" : u.status === "Processing" ? "⏳" : "–"} {u.status}
                </span>
              </span>
              <span>
                <button style={styles.viewBtn} onClick={() => handleView(u)}>View</button>
                {u.courseId && (
                  <button 
                    style={styles.generateBtn} 
                    onClick={() => handleGenerateStructure(u.id, u.name)}
                    disabled={generating[u.id]}
                  >
                    {generating[u.id] ? "⏳" : "🔧"} Gen
                  </button>
                )}
                <button style={styles.deleteBtn} onClick={() => handleDelete(u.id, u.name)}>Del</button>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateCourse(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Create New Course</h3>
            
            <input
              type="text"
              placeholder="Course Title *"
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              style={styles.input}
            />
            
            <textarea
              placeholder="Description"
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              style={{ ...styles.textarea, marginTop: 12 }}
            />
            
            <input
              type="text"
              placeholder="Instructor"
              value={newCourse.instructor}
              onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
              style={{ ...styles.input, marginTop: 12 }}
            />
            
            <input
              type="text"
              placeholder="Duration (e.g., 10 hours)"
              value={newCourse.duration}
              onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
              style={{ ...styles.input, marginTop: 12 }}
            />
            
            <select
              value={newCourse.level}
              onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
              style={{ ...styles.select, marginTop: 12 }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            
            <input
              type="number"
              placeholder="Price"
              value={newCourse.price}
              onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })}
              style={{ ...styles.input, marginTop: 12 }}
            />
            
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowCreateCourse(false)}
              >
                Cancel
              </button>
              <button
                style={styles.saveBtn}
                onClick={handleCreateCourse}
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}