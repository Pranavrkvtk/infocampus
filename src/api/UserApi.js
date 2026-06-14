// src/api/UserApi.js
import api from "./axios";

// ========== COURSE CATALOG ==========
export const getCourses = async () => {
  const response = await api.get("/users/courses");
  return response.data;
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

// ✅ Make sure all named exports are also in the default export
export default {
  getCourses,
  getEnrolledCourses,
  enrollInCourse,
  getCourseDetails,
  getCourseTopics,
  getSubtopicInterviewQuestions,   // ✅ added
  getSubtopicExamQuestions,        // ✅ added
  getSubtopicLabs,                 // ✅ added
  getTopicSubtopics,
  getSubtopic,
  getSubtopicImages,
  updateProgress,
};