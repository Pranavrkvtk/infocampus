// src/api/UserApi.js
import api from "./axios";

// ========== COURSE CATALOG ==========
// Get all available courses
export const getCourses = async () => {
  const response = await api.get("/users/courses");
  return response.data;
};

// ========== ENROLLMENT ==========
// Get all courses the student is enrolled in
export const getEnrolledCourses = async () => {
  const response = await api.get("/users/enrollments");
  return response.data;
};

// Enroll in a course (POST)
export const enrollInCourse = async (courseId) => {
  const response = await api.post(`/users/enroll/${courseId}`);
  return response.data;
};

// ========== COURSE CONTENT ==========
// Get full course details (topics + subtopics) by course ID
export const getCourseDetails = async (courseId) => {
  const response = await api.get(`/users/courses/${courseId}/details`);
  return response.data;
};

// Get topics for a course
export const getCourseTopics = async (courseId) => {
  const response = await api.get(`/users/courses/${courseId}/topics`);
  return response.data;
};

// Get subtopics for a given topic
export const getTopicSubtopics = async (topicId) => {
  const response = await api.get(`/users/topics/${topicId}/subtopics`);
  return response.data;
};

// Get a single subtopic (content, videoUrl)
export const getSubtopic = async (subtopicId) => {
  const response = await api.get(`/users/subtopics/${subtopicId}`);
  return response.data;
};

// Get images for a subtopic
export const getSubtopicImages = async (subtopicId) => {
  const response = await api.get(`/users/subtopics/${subtopicId}/images`);
  return response.data;
};

// ========== OPTIONAL: Progress tracking ==========
export const updateProgress = async (courseId, completedLessons) => {
  const response = await api.put(`/users/progress/${courseId}`, { completedLessons });
  return response.data;
};

export default {
  getCourses,
  getEnrolledCourses,
  enrollInCourse,
  getCourseDetails,
  getCourseTopics,
  getTopicSubtopics,
  getSubtopic,
  getSubtopicImages,
  updateProgress,
};