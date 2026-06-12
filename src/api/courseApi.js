import api from "./axios";

// Course APIs
export const getCourses = () => {
  return api.get("/courses");
};

export const getCourseById = (id) => {
  return api.get(`/courses/${id}`);
};

export const deleteCourse = (id) => {
  return api.delete(`/courses/${id}`);
};

export const createCourse = (data) => {
  return api.post("/courses", data);
};

export const updateCourse = (id, data) => {
  return api.put(`/courses/${id}`, data);
};

// Enrollment APIs
export const enrollInCourse = (courseId) => {
  const userId = localStorage.getItem("userId");
  
  console.log("=== DEBUG ENROLLMENT ===");
  console.log("Course ID:", courseId);
  console.log("User ID from localStorage:", userId);
  console.log("Full URL:", `/enrollments/enroll/${courseId}/${userId}`);
  console.log("========================");
  
  // Add this check
  if (!userId) {
    throw new Error("User not logged in. Please create a user first.");
  }

  return api.post(`/enrollments/enroll/${courseId}/${userId}`);
};

export const getUserEnrollments = (userId) => {
  // Make sure userId is a number
  const id = parseInt(userId);
  console.log("Calling API with userId:", id);
  return api.get(`/enrollments/user/${id}`);
};

export const getAllEnrollments = () => {
  return api.get("/enrollments");
};

export const watchCourse = (courseId) => {
  return api.get(`/enrollments/${courseId}/watch`);
};

// ✅ FIXED: Delete enrollment using courseId and userId (matching backend)
// In courseApi.js - REPLACE your deleteEnrollment function with this:

// ✅ FIXED: Delete by enrollment ID (not courseId + userId)
export const deleteEnrollment = async (enrollmentId) => {
  try {
    console.log("=== DEBUG DELETE ENROLLMENT ===");
    console.log("Enrollment ID:", enrollmentId);
    console.log("Full URL:", `/enrollments/${enrollmentId}`);
    console.log("========================");
    
    if (!enrollmentId) {
      throw new Error("No enrollment ID provided");
    }
    
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    console.log("Delete successful:", response);
    return response;
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    throw error;
  }
};
// ✅ OPTIONAL: Keep this if you want to also support deletion by enrollment ID
// Alternative name - make sure it's consistent
export const deleteEnrollmentById = async (enrollmentId) => {
  return deleteEnrollment(enrollmentId);
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN COURSE MANAGEMENT APIs
// ═══════════════════════════════════════════════════════════════════════════════

// Get admin courses list
export const getAdminCourses = () => {
  return api.get('/admin/courses');
};

// ─── TOPIC APIs ───────────────────────────────────────────────────────────────
export const getCourseTopics = (courseId) => {
  return api.get(`/admin/courses/${courseId}/topics`);
};

export const createTopic = (courseId, topicData) => {
  return api.post(`/admin/courses/${courseId}/topics`, topicData);
};

export const updateTopic = (topicId, topicData) => {
  return api.put(`/admin/topics/${topicId}`, topicData);
};

export const deleteTopic = (topicId) => {
  return api.delete(`/admin/topics/${topicId}`);
};

// ─── SUBTOPIC APIs ────────────────────────────────────────────────────────────
export const createSubtopic = (topicId, subtopicData) => {
  return api.post(`/admin/topics/${topicId}/subtopics`, subtopicData);
};

export const updateSubtopic = (subtopicId, subtopicData) => {
  return api.put(`/admin/subtopics/${subtopicId}`, subtopicData);
};

export const updateSubtopicNotes = (subtopicId, notes) => {
  return api.put(`/admin/subtopics/${subtopicId}/notes`, { notes });
};

export const updateSubtopicVideo = (subtopicId, videoUrl) => {
  return api.put(`/admin/subtopics/${subtopicId}/video`, { videoUrl });
};

export const deleteSubtopic = (subtopicId) => {
  return api.delete(`/admin/subtopics/${subtopicId}`);
};

// ─── IMAGE APIs ───────────────────────────────────────────────────────────────
export const getSubtopicImages = (subtopicId) => {
  return api.get(`/admin/subtopic-images/${subtopicId}`);
};

export const deleteImage = (imageId) => {
  return api.delete(`/admin/subtopic-images/${imageId}`);
};

// ─── INTERVIEW QUESTION APIs ──────────────────────────────────────────────────
export const createInterviewQuestion = (subtopicId, questionData) => {
  return api.post(`/admin/subtopics/${subtopicId}/interview-questions`, questionData);
};

export const updateInterviewQuestion = (questionId, questionData) => {
  return api.put(`/admin/interview-questions/${questionId}`, questionData);
};

export const deleteInterviewQuestion = (questionId) => {
  return api.delete(`/admin/interview-questions/${questionId}`);
};

// ─── EXAM QUESTION APIs ────────────────────────────────────────────────────────
export const createExamQuestion = (subtopicId, questionData) => {
  return api.post(`/admin/subtopics/${subtopicId}/exam-questions`, questionData);
};

export const updateExamQuestion = (questionId, questionData) => {
  return api.put(`/admin/exam-questions/${questionId}`, questionData);
};

export const deleteExamQuestion = (questionId) => {
  return api.delete(`/admin/exam-questions/${questionId}`);
};

// ─── LAB EXERCISE APIs ─────────────────────────────────────────────────────────
export const createLabExercise = (subtopicId, labData) => {
  return api.post(`/admin/subtopics/${subtopicId}/labs`, labData);
};

export const updateLabExercise = (labId, labData) => {
  return api.put(`/admin/labs/${labId}`, labData);
};

export const deleteLabExercise = (labId) => {
  return api.delete(`/admin/labs/${labId}`);
};

// ─── PDF Upload APIs ───────────────────────────────────────────────────────────
export const uploadPdf = (formData) => {
  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
  return fetch(`${API_BASE}/admin/pdfs/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(r => r.json());
};

export const generateCourseStructure = (pdfId) => {
  return api.post(`/admin/pdfs/${pdfId}/generate-structure`, {});
};