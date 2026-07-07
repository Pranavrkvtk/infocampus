// src/api/courseApi.js
import api from "./axios";

// ═══════════════════════════════════════════════════════════════════════════════
// COURSE APIs
// ═══════════════════════════════════════════════════════════════════════════════
export const getCourses = () => {
  return api.get("/courses");  // ✅ Removed /api prefix
};

export const getCourseById = (id) => {
  return api.get(`/courses/${id}`);  // ✅ Removed /api prefix
};

export const deleteCourse = (id) => {
  return api.delete(`/courses/${id}`);  // ✅ Removed /api prefix
};

export const createCourse = (data) => {
  return api.post("/courses", data);  // ✅ Removed /api prefix
};

export const updateCourse = (id, data) => {
  return api.put(`/courses/${id}`, data);  // ✅ Removed /api prefix
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENROLLMENT APIs
// ═══════════════════════════════════════════════════════════════════════════════
export const enrollInCourse = (courseId) => {
  const userId = localStorage.getItem("userId");
  
  console.log("=== DEBUG ENROLLMENT ===");
  console.log("Course ID:", courseId);
  console.log("User ID from localStorage:", userId);
  console.log("Full URL:", `/enrollments/enroll/${courseId}/${userId}`);
  console.log("========================");
  
  if (!userId) {
    throw new Error("User not logged in. Please create a user first.");
  }

  return api.post(`/enrollments/enroll/${courseId}/${userId}`);  // ✅ Removed /api prefix
};

export const getUserEnrollments = (userId) => {
  const id = parseInt(userId);
  console.log("Calling API with userId:", id);
  return api.get(`/enrollments/user/${id}`);  // ✅ Removed /api prefix
};

export const getAllEnrollments = () => {
  return api.get("/enrollments");  // ✅ Removed /api prefix
};

export const watchCourse = (courseId) => {
  return api.get(`/enrollments/${courseId}/watch`);  // ✅ Removed /api prefix
};

export const deleteEnrollment = async (enrollmentId) => {
  try {
    console.log("=== DEBUG DELETE ENROLLMENT ===");
    console.log("Enrollment ID:", enrollmentId);
    console.log("Full URL:", `/enrollments/${enrollmentId}`);
    console.log("========================");
    
    if (!enrollmentId) {
      throw new Error("No enrollment ID provided");
    }
    
    const response = await api.delete(`/enrollments/${enrollmentId}`);  // ✅ Removed /api prefix
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
  return api.get('/admin/courses');  // ✅ Removed /api prefix
};

// ─── TOPIC APIs ───────────────────────────────────────────────────────────────
export const getCourseTopics = (courseId) => {
  return api.get(`/admin/courses/${courseId}/topics`);  // ✅ Removed /api prefix
};

export const createTopic = (courseId, topicData) => {
  return api.post(`/admin/courses/${courseId}/topics`, topicData);  // ✅ Removed /api prefix
};

export const updateTopic = (topicId, topicData) => {
  return api.put(`/admin/topics/${topicId}`, topicData);  // ✅ Removed /api prefix
};

export const deleteTopic = (topicId) => {
  return api.delete(`/admin/topics/${topicId}`);  // ✅ Removed /api prefix
};

// ─── SUBTOPIC APIs ────────────────────────────────────────────────────────────
export const createSubtopic = (topicId, subtopicData) => {
  return api.post(`/admin/topics/${topicId}/subtopics`, subtopicData);  // ✅ Removed /api prefix
};

export const updateSubtopic = (subtopicId, subtopicData) => {
  return api.put(`/admin/subtopics/${subtopicId}`, subtopicData);  // ✅ Removed /api prefix
};

export const updateSubtopicNotes = (subtopicId, notes) => {
  return api.put(`/admin/subtopics/${subtopicId}/notes`, { notes });  // ✅ Removed /api prefix
};

export const updateSubtopicVideo = (subtopicId, videoUrl) => {
  return api.put(`/admin/subtopics/${subtopicId}/video`, { videoUrl });  // ✅ Removed /api prefix
};

export const deleteSubtopic = (subtopicId) => {
  return api.delete(`/admin/subtopics/${subtopicId}`);  // ✅ Removed /api prefix
};

// ─── IMAGE APIs ───────────────────────────────────────────────────────────────
export const getSubtopicImages = (subtopicId) => {
  return api.get(`/admin/subtopic-images/subtopic/${subtopicId}`);  // ✅ Removed /api prefix
};

export const deleteImage = (imageId) => {
  return api.delete(`/admin/subtopic-images/${imageId}`);  // ✅ Removed /api prefix
};

// ─── INTERVIEW QUESTION APIs ──────────────────────────────────────────────────
export const createInterviewQuestion = (subtopicId, questionData) => {
  return api.post(`/admin/subtopics/${subtopicId}/interview-questions`, questionData);  // ✅ Removed /api prefix
};

export const updateInterviewQuestion = (questionId, questionData) => {
  return api.put(`/admin/interview-questions/${questionId}`, questionData);  // ✅ Removed /api prefix
};

export const deleteInterviewQuestion = (questionId) => {
  return api.delete(`/admin/interview-questions/${questionId}`);  // ✅ Removed /api prefix
};

// ─── EXAM QUESTION APIs ────────────────────────────────────────────────────────
export const createExamQuestion = (subtopicId, questionData) => {
  return api.post(`/admin/subtopics/${subtopicId}/exam-questions`, questionData);  // ✅ Removed /api prefix
};

export const updateExamQuestion = (questionId, questionData) => {
  return api.put(`/admin/exam-questions/${questionId}`, questionData);  // ✅ Removed /api prefix
};

export const deleteExamQuestion = (questionId) => {
  return api.delete(`/admin/exam-questions/${questionId}`);  // ✅ Removed /api prefix
};

// ─── LAB EXERCISE APIs ─────────────────────────────────────────────────────────
export const createLabExercise = (subtopicId, labData) => {
  return api.post(`/admin/subtopics/${subtopicId}/labs`, labData);  // ✅ Removed /api prefix
};

export const updateLabExercise = (labId, labData) => {
  return api.put(`/admin/labs/${labId}`, labData);  // ✅ Removed /api prefix
};

export const deleteLabExercise = (labId) => {
  return api.delete(`/admin/labs/${labId}`);  // ✅ Removed /api prefix
};

// ─── PDF Upload APIs ───────────────────────────────────────────────────────────
export const uploadPdf = async (formData) => {
  const token = localStorage.getItem('token');
  
  // ✅ Get base URL from env
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8082';
  
  try {
    const response = await fetch(`${baseURL}/api/admin/pdfs/upload`, {  // ✅ Keep /api for fetch
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
    const response = await api.post('/admin/pdfs/upload', formData, {  // ✅ Removed /api prefix
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
    const response = await api.post(`/admin/pdfs/${pdfId}/generate-structure`, {});  // ✅ Removed /api prefix
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
    const response = await api.get(`/admin/pdfs/${pdfId}/images`);  // ✅ Removed /api prefix
    return response;
  } catch (error) {
    console.error('Get PDF images error:', error);
    throw error;
  }
};

// ─── COMPLETE SUBTOPIC API ─────────────────────────────────────────────────────
export const getCompleteSubtopic = async (subtopicId) => {
  try {
    const response = await api.get(`/admin/subtopics/${subtopicId}`);  // ✅ Removed /api prefix
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
    const response = await api.post(`/admin/courses/${courseId}/upload-image`, formData, {  // ✅ Removed /api prefix
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