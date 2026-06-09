// src/api/pdfApi.js
import api from "./axios";

// Get all PDF documents (lightweight version - use summary)
export const getAllPdfs = () => {
  return api.get("/admin/pdfs/summary");
};

// Get PDF details by ID (full details including text)
export const getPdfDetails = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}`);
};

// Get extracted text from PDF
export const getPdfText = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}/text`);
};

// Get all images from PDF
export const getPdfImages = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}/images`);
};

// Get images by page number
export const getPdfImagesByPage = (pdfId, pageNumber) => {
  return api.get(`/admin/pdfs/${pdfId}/images/page/${pageNumber}`);
};

// Get image file as blob/arraybuffer
export const getPdfImageFile = (pdfId, imageId) => {
  return api.get(`/admin/pdfs/${pdfId}/images/${imageId}`, {
    responseType: 'blob'
  });
};

// Upload PDF file with metadata
export const uploadPdf = (file, title, contentType, extractImages, extractText) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title || "");
  formData.append("contentType", contentType || "course");
  formData.append("extractImages", extractImages !== false);
  formData.append("extractText", extractText !== false);
  
  return api.post("/admin/pdfs/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 300000, // 5 minutes for large uploads
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });
};

// Delete PDF document
export const deletePdf = (pdfId) => {
  return api.delete(`/admin/pdfs/${pdfId}`);
};

// Get PDF statistics
export const getPdfStatistics = () => {
  return api.get("/admin/pdfs/statistics");
};

// Search PDFs by keyword
export const searchPdfs = (keyword) => {
  return api.get(`/admin/pdfs/search?keyword=${keyword}`);
};

// Get PDF processing status
export const getPdfStatus = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}/status`);
};

// Retry processing a failed PDF
export const retryPdfProcessing = (pdfId) => {
  return api.post(`/admin/pdfs/${pdfId}/retry`);
};

// Download PDF file
export const downloadPdf = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}/download`, {
    responseType: 'blob'
  });
};

// Batch delete PDFs
export const batchDeletePdfs = (pdfIds) => {
  return api.post("/admin/pdfs/batch-delete", { ids: pdfIds });
};

// Export all PDFs data
export const exportPdfsData = () => {
  return api.get("/admin/pdfs/export", {
    responseType: 'blob'
  });
};

// Helper function to get image URL (for img src)
export const getImageUrl = (pdfId, imageId) => {
  return `http://localhost:8080/api/admin/pdfs/${pdfId}/images/${imageId}`;
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