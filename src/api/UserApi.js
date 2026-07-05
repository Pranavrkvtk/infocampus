// src/api/UserApi.js
import api from "./axios";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

// ========== COURSE CATALOG ==========
export const getCourses = async () => {
  const response = await api.get("/users/courses");
  return response.data;
};

// ========== GET COURSES WITH IMAGES (Alias for getCourses) ==========
export const getCoursesWithImages = async () => {
  const response = await api.get("/users/courses");
  return response.data;
};

// ========== COURSE IMAGE UPLOAD (Admin) ==========
export const uploadCourseImage = async (courseId, file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE}/admin/courses/${courseId}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// ========== ENROLLMENT ==========
export const getEnrolledCourses = async () => {
  const response = await api.get("/users/enrollments");
  return response.data;
};

export const enrollInCourse = async (courseId) => {
  const response = await api.post(`/users/enroll/${courseId}`);
  return response.data;
};

// ========== ENROLLMENT COUNT ==========
export const getEnrollmentCount = async (courseId) => {
  const response = await api.get(`/users/courses/${courseId}/enrollment-count`);
  return response.data;
};

// ========== INSTRUCTOR APIs (NEW) ==========

// Get instructor details for a specific course
export const getCourseInstructor = async (courseId) => {
  const response = await api.get(`/users/courses/${courseId}/instructor`);
  return response.data;
};

// Get all instructors
export const getAllInstructors = async () => {
  const response = await api.get("/users/instructors");
  return response.data;
};

// Get instructor by ID
export const getInstructorById = async (instructorId) => {
  const response = await api.get(`/users/instructors/${instructorId}`);
  return response.data;
};

// Get courses by instructor
export const getInstructorCourses = async (instructorId) => {
  const response = await api.get(`/users/instructors/${instructorId}/courses`);
  return response.data;
};

// ========== COURSE CONTENT ==========
export const getCourseDetails = async (courseId) => {
  const response = await api.get(`/users/courses/${courseId}/details`);
  return response.data;
};

export const getCourseTopics = async (courseId) => {
  const response = await api.get(`/users/courses/${courseId}/topics`);
  return response.data;
};

export const getSubtopicInterviewQuestions = async (subtopicId) => {
  const response = await api.get(`/users/subtopics/${subtopicId}/interview-questions`);
  return response.data;
};

export const getSubtopicExamQuestions = async (subtopicId) => {
  const response = await api.get(`/users/subtopics/${subtopicId}/exam-questions`);
  return response.data;
};

export const getSubtopicLabs = async (subtopicId) => {
  const response = await api.get(`/users/subtopics/${subtopicId}/labs`);
  return response.data;
};

export const getTopicSubtopics = async (topicId) => {
  const response = await api.get(`/users/topics/${topicId}/subtopics`);
  return response.data;
};

export const getSubtopic = async (subtopicId) => {
  const response = await api.get(`/users/subtopics/${subtopicId}`);
  return response.data;
};

export const getSubtopicImages = async (subtopicId) => {
  const response = await api.get(`/users/subtopics/${subtopicId}/images`);
  return response.data;
};

// ========== OPTIONAL: Progress tracking ==========
export const updateProgress = async (courseId, completedLessons) => {
  const response = await api.put(`/users/progress/${courseId}`, { completedLessons });
  return response.data;
};

// ========== DEFAULT EXPORT ==========
export default {
  getCourses,
  getCoursesWithImages,
  uploadCourseImage,
  getEnrolledCourses,
  enrollInCourse,
  getEnrollmentCount,
  // New instructor APIs
  getCourseInstructor,
  getAllInstructors,
  getInstructorById,
  getInstructorCourses,
  // Course content
  getCourseDetails,
  getCourseTopics,
  getSubtopicInterviewQuestions,
  getSubtopicExamQuestions,
  getSubtopicLabs,
  getTopicSubtopics,
  getSubtopic,
  getSubtopicImages,
  updateProgress,
};