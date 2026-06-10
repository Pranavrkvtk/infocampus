// src/api/pdfApi.js
import api from "./axios";

// Get the base URL from environment or window location
const getBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
};

// ==================== USER PDF APIS (for regular users) ====================

// Get all PDFs accessible to current user
export const getAllPdfs = () => {
  return api.get("/user/pdfs");
};

// Get PDF summary (lightweight version)
export const getPdfSummaries = () => {
  return api.get("/user/pdfs/summary");
};

// Get PDF details by ID
export const getPdfDetails = (pdfId) => {
  return api.get(`/user/pdfs/${pdfId}/view`);
};

// Get extracted text from PDF
export const getPdfText = (pdfId) => {
  return api.get(`/user/pdfs/${pdfId}/text`);
};

// Get all images from PDF
export const getPdfImages = (pdfId) => {
  return api.get(`/user/pdfs/${pdfId}/images`);
};

// Get images by page number
export const getPdfImagesByPage = (pdfId, pageNumber) => {
  return api.get(`/user/pdfs/${pdfId}/images/page/${pageNumber}`);
};

// Get image file as blob
export const getPdfImageFile = (pdfId, imageId) => {
  return api.get(`/user/pdfs/${pdfId}/images/${imageId}`, {
    responseType: 'blob'
  });
};

// ==================== ADMIN PDF APIS (for admin users) ====================

// Upload PDF file (admin only)
export const uploadPdf = (file, title, contentType, extractImages, extractText) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title || "");
  formData.append("contentType", contentType || "course");
  formData.append("extractImages", extractImages !== false);
  formData.append("extractText", extractText !== false);
  
  console.log("Uploading PDF:", {
    fileName: file.name,
    title: title,
    contentType: contentType,
    extractImages: extractImages,
    extractText: extractText
  });
  
  return api.post("/admin/pdfs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000,
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });
};

// Delete PDF document (admin only)
export const deletePdf = (pdfId) => {
  return api.delete(`/admin/pdfs/${pdfId}`);
};

// Get all PDFs (admin only)
export const getAllPdfsAdmin = () => {
  return api.get("/admin/pdfs");
};

// Get PDF statistics (admin only)
export const getPdfStatistics = () => {
  return api.get("/admin/pdfs/statistics");
};

// Search PDFs by keyword (admin only)
export const searchPdfs = (keyword) => {
  return api.get(`/admin/pdfs/search?keyword=${keyword}`);
};

// Batch delete PDFs (admin only)
export const batchDeletePdfs = (pdfIds) => {
  return api.post("/admin/pdfs/batch-delete", { ids: pdfIds });
};

// Download PDF file
export const downloadPdf = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}/download`, {
    responseType: 'blob'
  });
};

// Get PDF processing status
export const getPdfStatus = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}/status`);
};

// Retry processing a failed PDF
export const retryPdfProcessing = (pdfId) => {
  return api.post(`/admin/pdfs/${pdfId}/retry`);
};

// Export all PDFs data
export const exportPdfsData = () => {
  return api.get("/admin/pdfs/export", {
    responseType: 'blob'
  });
};

// ==================== HELPER FUNCTIONS ====================

// Local SVG fallback image (no external dependency)
export const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

// Helper function to get full image URL
export const getImageUrl = (pdfId, imageId) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/user/pdfs/${pdfId}/images/${imageId}`;
};

// Helper function to get admin image URL
export const getAdminImageUrl = (pdfId, imageId) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/admin/pdfs/${pdfId}/images/${imageId}`;
};

// Helper function to get image source with fallback
export const getImageSrc = (pdfId, imageId, imageErrors, setImageErrors) => {
  if (imageErrors && imageErrors[imageId]) {
    return FALLBACK_IMAGE;
  }
  return getImageUrl(pdfId, imageId);
};

// Helper function to handle image load errors
export const handleImageError = (imageId, imageErrors, setImageErrors) => {
  if (!imageErrors[imageId]) {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  }
};

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// Helper function to format date
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to format date only (no time)
export const formatDateOnly = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Check if PDF is processed
export const isPdfProcessed = (pdf) => {
  return pdf && pdf.isProcessed === true;
};

// Get processing status text
export const getProcessingStatusText = (pdf) => {
  if (!pdf) return "Unknown";
  if (pdf.isProcessed) return "Completed";
  if (pdf.pageCount === 0) return "Pending";
  return "Processing";
};

// Get processing status color
export const getProcessingStatusColor = (pdf) => {
  if (!pdf) return "#6b7280";
  if (pdf.isProcessed) return "#16a34a";
  if (pdf.pageCount === 0) return "#d97706";
  return "#3b82f6";
};

// Extract sections from text
export const extractSectionsFromText = (text, courseTitle) => {
  if (!text) return generateDefaultSections(courseTitle);
  
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const sectionsArray = [];
  let currentSection = { title: 'Introduction', content: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if ((trimmed.toUpperCase() === trimmed && trimmed.length > 5 && trimmed.length < 100 && !trimmed.includes('.')) ||
        (trimmed.endsWith(':') && trimmed.length < 60) ||
        (/^\d+\./.test(trimmed))) {
      if (currentSection.content.length > 0) {
        sectionsArray.push(currentSection);
      }
      currentSection = { title: trimmed.replace(/:/g, ''), content: [] };
    } else if (trimmed.length > 20) {
      currentSection.content.push(trimmed);
    }
  }

  if (currentSection.content.length > 0) sectionsArray.push(currentSection);

  return sectionsArray.length > 0 ? sectionsArray : generateDefaultSections(courseTitle);
};

// Generate default sections for a course
export const generateDefaultSections = (courseTitle) => {
  return [
    { title: "Introduction to " + (courseTitle || "Course"), content: ["Welcome to this course. This section introduces the key concepts and prerequisites you'll need to understand."] },
    { title: "Core Concepts", content: ["This section covers the fundamental principles and core concepts that form the foundation of the subject."] },
    { title: "Advanced Topics", content: ["Building on the basics, this section explores more advanced topics and complex scenarios."] },
    { title: "Practical Applications", content: ["Learn how to apply the knowledge in real-world situations with practical examples and case studies."] },
    { title: "Best Practices", content: ["Discover industry best practices, tips, and techniques to optimize your work."] },
    { title: "Summary & Review", content: ["Review key takeaways from the course and test your understanding."] }
  ];
};