// src/api/pdfApi.js - UPDATED VERSION WITH COURSE SUPPORT AND STRUCTURE GENERATION

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== COURSE ENDPOINTS ====================
// Get all courses (for dropdown selection)
export const getAllCourses = () => {
  return api.get('/admin/courses');
};

// Get course structure (topics and subtopics)
export const getCourseStructure = (courseId) => {
  return api.get(`/courses/${courseId}/structure`);
};

// Get course topics only
export const getCourseTopics = (courseId) => {
  return api.get(`/courses/${courseId}/topics`);
};

// Get subtopics for a specific topic
export const getSubtopicsByTopic = (topicId) => {
  return api.get(`/courses/topics/${topicId}/subtopics`);
};

// Update subtopic content
export const updateSubtopicContent = (subtopicId, content) => {
  return api.put(`/courses/subtopics/${subtopicId}`, { content });
};

// Delete entire course structure
export const deleteCourseStructure = (courseId) => {
  return api.delete(`/courses/${courseId}/structure`);
};

// ==================== STRUCTURE GENERATION ENDPOINTS ====================
/**
 * Generate course structure from PDF extracted text
 * This will parse the PDF content and create topics/subtopics automatically
 */
export const generateCourseStructure = (pdfId) => {
  return api.post(`/admin/pdfs/${pdfId}/generate-structure`);
};

/**
 * Reprocess PDF with course association (for old PDFs that were uploaded without course)
 */
export const reprocessPdfWithCourse = (pdfId, courseId) => {
  return api.post(`/admin/pdfs/${pdfId}/reprocess-with-course?courseId=${courseId}`);
};

// ==================== AUTO-FIX ENDPOINT ====================
/**
 * Auto-fix PDF - creates a course from filename and assigns it
 * Use this for PDFs that were uploaded without a course
 */
export const autoFixPdf = (pdfId) => {
  return api.post(`/admin/pdfs/${pdfId}/auto-fix`);
};

// ==================== ENRICHED PDF ENDPOINTS ====================
/**
 * Get all PDFs with enriched course information (courseId, courseTitle, course object)
 * This is the recommended endpoint for getting PDFs with course data
 */
export const getAllPdfsEnriched = () => {
  return api.get('/user/pdfs/enriched');
};

// ==================== ORDERED CONTENT ENDPOINTS ====================
export const getOrderedPdfContent = (pdfId, page = 0, size = 50) => {
  return api.get(`/user/pdfs/${pdfId}/ordered-content?page=${page}&size=${size}`);
};

// Get all content with automatic pagination
export const getAllOrderedPdfContent = async (pdfId, onProgress) => {
  const allItems = [];
  let currentPage = 0;
  const pageSize = 100;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await getOrderedPdfContent(pdfId, currentPage, pageSize);
      const data = response.data;
      
      if (data.content && data.content.length > 0) {
        allItems.push(...data.content);
        if (onProgress) {
          onProgress({
            loaded: allItems.length,
            total: data.totalItems,
            page: currentPage,
            totalPages: data.totalPages
          });
        }
      }
      
      hasMore = data.hasNext;
      currentPage++;
      
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error loading page:', currentPage, error);
      throw error;
    }
  }
  
  return { data: { orderedContent: allItems } };
};

// ==================== USER/STUDENT ENDPOINTS ====================
export const getAllPdfs = () => {
  return api.get('/user/pdfs');
};

export const getPdfDetails = (pdfId) => {
  return api.get(`/user/pdfs/${pdfId}/view`);
};

export const getPdfText = (pdfId) => {
  return api.get(`/user/pdfs/${pdfId}/text`);
};

export const getPdfImages = (pdfId) => {
  return api.get(`/user/pdfs/${pdfId}/images`);
};

export const getPdfImagesByPage = (pdfId, pageNumber) => {
  return api.get(`/user/pdfs/${pdfId}/images/page/${pageNumber}`);
};

// ==================== ADMIN ONLY ENDPOINTS ====================
// UPDATED: Now requires courseId
export const uploadPdf = (file, title, contentType, extractImages, extractText, courseId, userId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('contentType', contentType);
  formData.append('extractImages', extractImages);
  formData.append('extractText', extractText);
  formData.append('courseId', courseId);  // ← REQUIRED for course association
  
  if (userId) {
    formData.append('userId', userId);
  }
  
  return api.post('/admin/pdfs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deletePdf = (pdfId) => {
  return api.delete(`/admin/pdfs/${pdfId}`);
};

// Force reprocess a PDF
export const reprocessPdf = (pdfId) => {
  return api.post(`/admin/pdfs/${pdfId}/force-reprocess`);
};

// Get PDF statistics
export const getPdfStatistics = () => {
  return api.get('/admin/pdfs/statistics');
};

// Search PDFs by filename
export const searchPdfs = (keyword) => {
  return api.get(`/admin/pdfs/search?keyword=${keyword}`);
};

// ==================== ENROLLMENT ENDPOINTS ====================
/**
 * Enroll user in a course
 */
export const enrollInCourse = (courseId, userId) => {
  return api.post(`/enrollments/enroll/${courseId}/${userId}`);
};

/**
 * Get user's enrolled courses
 */
export const getUserEnrolledCourses = (userId) => {
  return api.get(`/enrollments/user/${userId}/courses`);
};

/**
 * Update course progress
 */
export const updateCourseProgress = (enrollmentId, progress, completedLessons) => {
  return api.put(`/enrollments/progress/${enrollmentId}`, { progress, completedLessons });
};

/**
 * Cancel enrollment
 */
export const cancelEnrollment = (courseId, userId) => {
  return api.delete(`/enrollments/enroll/${courseId}/${userId}`);
};

// ==================== UTILITIES ====================
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Get user ID from localStorage or token
export const getCurrentUserId = () => {
  // Try to get from localStorage
  let userId = localStorage.getItem('userId');
  if (userId) return userId;
  
  // Try to decode from token
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.userId || payload.id || payload.sub;
      if (userId) {
        localStorage.setItem('userId', userId);
        return userId;
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }
  
  // Default to 1 (admin user) for testing
  return '1';
};