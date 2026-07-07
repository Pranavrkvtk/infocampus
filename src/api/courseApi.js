// src/api/courseApi.js
import api from "./axios";

// ═══════════════════════════════════════════════════════════════════════════════
// COURSE APIs
// ═══════════════════════════════════════════════════════════════════════════════
export const getCourses = () => {
  return api.get("/api/courses");  // ✅ Added /api prefix
};

export const getCourseById = (id) => {
  return api.get(`/api/courses/${id}`);  // ✅ Added /api prefix
};

export const deleteCourse = (id) => {
  return api.delete(`/api/courses/${id}`);  // ✅ Added /api prefix
};

export const createCourse = (data) => {
  return api.post("/api/courses", data);  // ✅ Added /api prefix
};

export const updateCourse = (id, data) => {
  return api.put(`/api/courses/${id}`, data);  // ✅ Added /api prefix
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENROLLMENT APIs
// ═══════════════════════════════════════════════════════════════════════════════
export const enrollInCourse = (courseId) => {
  const userId = localStorage.getItem("userId");
  
  console.log("=== DEBUG ENROLLMENT ===");
  console.log("Course ID:", courseId);
  console.log("User ID from localStorage:", userId);
  console.log("Full URL:", `/api/enrollments/enroll/${courseId}/${userId}`);
  console.log("========================");
  
  if (!userId) {
    throw new Error("User not logged in. Please create a user first.");
  }

  return api.post(`/api/enrollments/enroll/${courseId}/${userId}`);  // ✅ Added /api prefix
};

export const getUserEnrollments = (userId) => {
  const id = parseInt(userId);
  console.log("Calling API with userId:", id);
  return api.get(`/api/enrollments/user/${id}`);  // ✅ Added /api prefix
};

export const getAllEnrollments = () => {
  return api.get("/api/enrollments");  // ✅ Added /api prefix
};

export const watchCourse = (courseId) => {
  return api.get(`/api/enrollments/${courseId}/watch`);  // ✅ Added /api prefix
};

export const deleteEnrollment = async (enrollmentId) => {
  try {
    console.log("=== DEBUG DELETE ENROLLMENT ===");
    console.log("Enrollment ID:", enrollmentId);
    console.log("Full URL:", `/api/enrollments/${enrollmentId}`);
    console.log("========================");
    
    if (!enrollmentId) {
      throw new Error("No enrollment ID provided");
    }
    
    const response = await api.delete(`/api/enrollments/${enrollmentId}`);  // ✅ Added /api prefix
    console.log("Delete successful:", response);
    return response;
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    throw error;
  }
};

export const deleteEnrollmentById = async (enrollmentId) => {
  return deleteEnrollment(enrollmentId);
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN COURSE MANAGEMENT APIs
// ═══════════════════════════════════════════════════════════════════════════════

export const getAdminCourses = () => {
  return api.get('/api/admin/courses');  // ✅ Added /api prefix
};

// ─── TOPIC APIs ───────────────────────────────────────────────────────────────
export const getCourseTopics = (courseId) => {
  return api.get(`/api/admin/courses/${courseId}/topics`);  // ✅ Added /api prefix
};

export const createTopic = (courseId, topicData) => {
  return api.post(`/api/admin/courses/${courseId}/topics`, topicData);  // ✅ Added /api prefix
};

export const updateTopic = (topicId, topicData) => {
  return api.put(`/api/admin/topics/${topicId}`, topicData);  // ✅ Added /api prefix
};

export const deleteTopic = (topicId) => {
  return api.delete(`/api/admin/topics/${topicId}`);  // ✅ Added /api prefix
};

// ─── SUBTOPIC APIs ────────────────────────────────────────────────────────────
export const createSubtopic = (topicId, subtopicData) => {
  return api.post(`/api/admin/topics/${topicId}/subtopics`, subtopicData);  // ✅ Added /api prefix
};

export const updateSubtopic = (subtopicId, subtopicData) => {
  return api.put(`/api/admin/subtopics/${subtopicId}`, subtopicData);  // ✅ Added /api prefix
};

export const updateSubtopicNotes = (subtopicId, notes) => {
  return api.put(`/api/admin/subtopics/${subtopicId}/notes`, { notes });  // ✅ Added /api prefix
};

export const updateSubtopicVideo = (subtopicId, videoUrl) => {
  return api.put(`/api/admin/subtopics/${subtopicId}/video`, { videoUrl });  // ✅ Added /api prefix
};

export const deleteSubtopic = (subtopicId) => {
  return api.delete(`/api/admin/subtopics/${subtopicId}`);  // ✅ Added /api prefix
};

// ─── IMAGE APIs ───────────────────────────────────────────────────────────────
export const getSubtopicImages = (subtopicId) => {
  return api.get(`/api/admin/subtopic-images/subtopic/${subtopicId}`);  // ✅ Added /api prefix
};

export const deleteImage = (imageId) => {
  return api.delete(`/api/admin/subtopic-images/${imageId}`);  // ✅ Added /api prefix
};

// ─── INTERVIEW QUESTION APIs ──────────────────────────────────────────────────
export const createInterviewQuestion = (subtopicId, questionData) => {
  return api.post(`/api/admin/subtopics/${subtopicId}/interview-questions`, questionData);  // ✅ Added /api prefix
};

export const updateInterviewQuestion = (questionId, questionData) => {
  return api.put(`/api/admin/interview-questions/${questionId}`, questionData);  // ✅ Added /api prefix
};

export const deleteInterviewQuestion = (questionId) => {
  return api.delete(`/api/admin/interview-questions/${questionId}`);  // ✅ Added /api prefix
};

// ─── EXAM QUESTION APIs ────────────────────────────────────────────────────────
export const createExamQuestion = (subtopicId, questionData) => {
  return api.post(`/api/admin/subtopics/${subtopicId}/exam-questions`, questionData);  // ✅ Added /api prefix
};

export const updateExamQuestion = (questionId, questionData) => {
  return api.put(`/api/admin/exam-questions/${questionId}`, questionData);  // ✅ Added /api prefix
};

export const deleteExamQuestion = (questionId) => {
  return api.delete(`/api/admin/exam-questions/${questionId}`);  // ✅ Added /api prefix
};

// ─── LAB EXERCISE APIs ─────────────────────────────────────────────────────────
export const createLabExercise = (subtopicId, labData) => {
  return api.post(`/api/admin/subtopics/${subtopicId}/labs`, labData);  // ✅ Added /api prefix
};

export const updateLabExercise = (labId, labData) => {
  return api.put(`/api/admin/labs/${labId}`, labData);  // ✅ Added /api prefix
};

export const deleteLabExercise = (labId) => {
  return api.delete(`/api/admin/labs/${labId}`);  // ✅ Added /api prefix
};

// ─── PDF Upload APIs ───────────────────────────────────────────────────────────
export const uploadPdf = async (formData) => {
  const token = localStorage.getItem('token');
  
  // ✅ Get base URL from env
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8082';
  
  try {
    const response = await fetch(`${baseURL}/api/admin/pdfs/upload`, {  // ✅ Added /api prefix
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }
    
    const data = await response.json();
    console.log('Upload response:', data);
    return { data };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// ─── ALTERNATIVE: Use axios for PDF upload (Recommended) ─────────────────────
export const uploadPdfWithAxios = async (formData) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await api.post('/api/admin/pdfs/upload', formData, {  // ✅ Added /api prefix
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Upload response:', response.data);
    return response;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const generateCourseStructure = async (pdfId) => {
  try {
    const response = await api.post(`/api/admin/pdfs/${pdfId}/generate-structure`, {});  // ✅ Added /api prefix
    console.log('Generate structure response:', response.data);
    return response;
  } catch (error) {
    console.error('Generate structure error:', error);
    throw error;
  }
};

// ─── PDF IMAGE APIs ────────────────────────────────────────────────────────────
export const getPdfImages = async (pdfId) => {
  try {
    const response = await api.get(`/api/admin/pdfs/${pdfId}/images`);  // ✅ Added /api prefix
    return response;
  } catch (error) {
    console.error('Get PDF images error:', error);
    throw error;
  }
};

// ─── COMPLETE SUBTOPIC API ─────────────────────────────────────────────────────
export const getCompleteSubtopic = async (subtopicId) => {
  try {
    const response = await api.get(`/api/admin/subtopics/${subtopicId}`);  // ✅ Added /api prefix
    return response;
  } catch (error) {
    console.error('Get complete subtopic error:', error);
    throw error;
  }
};

// ─── COURSE IMAGE UPLOAD ──────────────────────────────────────────────────────
export const uploadCourseImage = async (courseId, formData) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await api.post(`/api/admin/courses/${courseId}/upload-image`, formData, {  // ✅ Added /api prefix
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Course image upload response:', response.data);
    return response;
  } catch (error) {
    console.error('Course image upload error:', error);
    throw error;
  }
};