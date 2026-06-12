// src/api/pdfApi.js - COMPLETE VERSION WITH ALL ENDPOINTS
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

// ==================== COURSE MANAGEMENT ====================

// Get all courses
export const getAllCourses = () => {
  return api.get('/admin/courses');
};

// Get course topics with all content
export const getCourseTopics = (courseId) => {
  return api.get(`/admin/courses/${courseId}/topics`);
};

// Get course structure (topics and subtopics only)
export const getCourseStructure = (courseId) => {
  return api.get(`/courses/${courseId}/structure`);
};

// Get complete subtopic with all content
export const getCompleteSubtopic = (subtopicId) => {
  return api.get(`/admin/subtopics/${subtopicId}/complete`);
};

// Delete entire course structure
export const deleteCourseStructure = (courseId) => {
  return api.delete(`/admin/courses/${courseId}/structure`);
};

// ==================== MANUAL TOPIC MANAGEMENT ====================

export const createTopic = (courseId, title) => {
  return api.post(`/admin/courses/${courseId}/topics`, { title });
};

export const updateTopic = (topicId, title, displayOrder) => {
  return api.put(`/admin/topics/${topicId}`, { title, displayOrder });
};

export const deleteTopic = (topicId) => {
  return api.delete(`/admin/topics/${topicId}`);
};

export const reorderTopics = (courseId, topicIds) => {
  return api.put(`/admin/courses/${courseId}/topics/reorder`, topicIds);
};

// ==================== MANUAL SUBTOPIC MANAGEMENT ====================

export const createSubtopic = (topicId, title, notes = '', videoUrl = '') => {
  return api.post(`/admin/topics/${topicId}/subtopics`, { title, notes, videoUrl });
};

export const updateSubtopic = (subtopicId, title, notes, videoUrl, displayOrder) => {
  return api.put(`/admin/subtopics/${subtopicId}`, { title, notes, videoUrl, displayOrder });
};

export const deleteSubtopic = (subtopicId) => {
  return api.delete(`/admin/subtopics/${subtopicId}`);
};

export const reorderSubtopics = (topicId, subtopicIds) => {
  return api.put(`/admin/topics/${topicId}/subtopics/reorder`, subtopicIds);
};

// ==================== NOTES & VIDEO ====================

export const updateSubtopicNotes = (subtopicId, notes) => {
  return api.put(`/admin/subtopics/${subtopicId}/notes`, { notes });
};

export const updateSubtopicVideo = (subtopicId, videoUrl) => {
  return api.put(`/admin/subtopics/${subtopicId}/video`, { videoUrl });
};

// ==================== INTERVIEW QUESTIONS ====================

export const addInterviewQuestion = (subtopicId, question, answer) => {
  return api.post(`/admin/subtopics/${subtopicId}/interview-questions`, { question, answer });
};

export const updateInterviewQuestion = (questionId, question, answer) => {
  return api.put(`/admin/interview-questions/${questionId}`, { question, answer });
};

export const deleteInterviewQuestion = (questionId) => {
  return api.delete(`/admin/interview-questions/${questionId}`);
};

// ==================== EXAM QUESTIONS ====================

export const addExamQuestion = (subtopicId, question, optionA, optionB, optionC, optionD, correctAnswer) => {
  return api.post(`/admin/subtopics/${subtopicId}/exam-questions`, {
    question, optionA, optionB, optionC, optionD, correctAnswer
  });
};

export const updateExamQuestion = (questionId, question, optionA, optionB, optionC, optionD, correctAnswer) => {
  return api.put(`/admin/exam-questions/${questionId}`, {
    question, optionA, optionB, optionC, optionD, correctAnswer
  });
};

export const deleteExamQuestion = (questionId) => {
  return api.delete(`/admin/exam-questions/${questionId}`);
};
export const updateSubtopicContent = (subtopicId, content) => {
    return api.put(
        `/admin/subtopics/${subtopicId}/content`,
        { content }
    );
};
// ==================== LAB EXERCISES ====================

export const addLabExercise = (subtopicId, title, instructions) => {
  return api.post(`/admin/subtopics/${subtopicId}/labs`, { title, instructions });
};

export const updateLabExercise = (labId, title, instructions) => {
  return api.put(`/admin/labs/${labId}`, { title, instructions });
};

export const deleteLabExercise = (labId) => {
  return api.delete(`/admin/labs/${labId}`);
};

// ==================== PDF UPLOAD & STRUCTURE GENERATION ====================

export const uploadPdf = (file, title, contentType, extractImages, extractText, courseId, userId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('contentType', contentType);
  formData.append('extractImages', extractImages);
  formData.append('extractText', extractText);
  
  if (courseId) {
    formData.append('courseId', courseId);
  }
  if (userId) {
    formData.append('userId', userId);
  }
  
  return api.post('/admin/pdfs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const generateCourseStructure = (pdfId) => {
  return api.post(`/admin/pdfs/${pdfId}/generate-structure`);
};

export const autoFixPdf = (pdfId) => {
  return api.post(`/admin/pdfs/${pdfId}/auto-fix`);
};

export const reprocessPdf = (pdfId) => {
  return api.post(`/admin/pdfs/${pdfId}/force-reprocess`);
};

export const deletePdf = (pdfId) => {
  return api.delete(`/admin/pdfs/${pdfId}`);
};

// ==================== PDF QUERIES ====================

export const getAllPdfs = () => {
  return api.get('/user/pdfs');
};

export const getAllPdfsEnriched = () => {
  return api.get('/admin/user/pdfs/enriched');
};

export const getPdfDetails = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}`);
};

export const getPdfText = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}/text`);
};

export const getPdfImages = (pdfId) => {
  return api.get(`/admin/pdfs/${pdfId}/images`);
};

export const getPdfImagesByPage = (pdfId, pageNumber) => {
  return api.get(`/admin/pdfs/${pdfId}/images/page/${pageNumber}`);
};

export const getOrderedPdfContent = (pdfId, page = 0, size = 50) => {
  return api.get(`/admin/pdfs/${pdfId}/ordered-content?page=${page}&size=${size}`);
};

export const getPdfStatistics = () => {
  return api.get('/admin/pdfs/statistics');
};

export const searchPdfs = (keyword) => {
  return api.get(`/admin/pdfs/search?keyword=${keyword}`);
};

// ==================== ENROLLMENT ====================

export const enrollInCourse = (courseId, userId) => {
  return api.post(`/enrollments/enroll/${courseId}/${userId}`);
};

export const getUserEnrolledCourses = (userId) => {
  return api.get(`/enrollments/user/${userId}/courses`);
};

export const updateCourseProgress = (enrollmentId, progress, completedLessons) => {
  return api.put(`/enrollments/progress/${enrollmentId}`, { progress, completedLessons });
};

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

export const getCurrentUserId = () => {
  let userId = localStorage.getItem('userId');
  if (userId) return userId;
  
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
  return '1';
};

export default api;