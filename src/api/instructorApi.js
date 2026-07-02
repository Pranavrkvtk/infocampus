// src/api/instructorApi.js
import api from "./axios";

// ==================== DASHBOARD STATS ====================
export const getInstructorDashboardStats = async () => {
  try {
    const response = await api.get("/instructor/dashboard");
    return response;
  } catch (error) {
    console.error("Error fetching instructor dashboard stats:", error);
    throw error;
  }
};

// ==================== COURSE MANAGEMENT ====================

// Get instructor's courses
export const getInstructorCourses = async () => {
  try {
    const response = await api.get("/instructor/courses");
    return response;
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    throw error;
  }
};

// Create new course
export const createInstructorCourse = async (courseData) => {
  try {
    const response = await api.post("/instructor/courses", courseData);
    return response;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

// Update course
export const updateInstructorCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/instructor/courses/${courseId}`, courseData);
    return response;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

// Delete course
export const deleteInstructorCourse = async (courseId) => {
  try {
    const response = await api.delete(`/instructor/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

// Get course details
export const getInstructorCourseDetails = async (courseId) => {
  try {
    const response = await api.get(`/instructor/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error("Error fetching course details:", error);
    throw error;
  }
};

// ==================== STUDENT MANAGEMENT ====================

// Get instructor's students
export const getInstructorStudents = async () => {
  try {
    const response = await api.get("/instructor/students");
    return response;
  } catch (error) {
    console.error("Error fetching instructor students:", error);
    throw error;
  }
};

// Search students by name
export const searchInstructorStudentsByName = async (name) => {
  try {
    const response = await api.get(`/instructor/students/search`, {
      params: { name }
    });
    return response;
  } catch (error) {
    console.error("Error searching students:", error);
    throw error;
  }
};

// Get student details
export const getInstructorStudentDetails = async (studentId) => {
  try {
    const response = await api.get(`/instructor/students/${studentId}`);
    return response;
  } catch (error) {
    console.error("Error fetching student details:", error);
    throw error;
  }
};

// ==================== ENROLLMENT MANAGEMENT ====================

// Get instructor's enrollments
export const getInstructorEnrollments = async () => {
  try {
    const response = await api.get("/instructor/enrollments");
    return response;
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    throw error;
  }
};

// Update enrollment status
export const updateInstructorEnrollmentStatus = async (enrollmentId, status) => {
  try {
    const response = await api.patch(`/instructor/enrollments/${enrollmentId}/status`, { status });
    return response;
  } catch (error) {
    console.error("Error updating enrollment status:", error);
    throw error;
  }
};

// ==================== MEDIA MANAGEMENT ====================

// Get home video
export const getInstructorHomeVideo = async () => {
  try {
    const response = await api.get("/instructor/home-video");
    return response;
  } catch (error) {
    console.error("Error fetching home video:", error);
    throw error;
  }
};

// Update home video URL
export const updateInstructorHomeVideoUrl = async (videoUrl) => {
  try {
    const response = await api.patch("/instructor/home-video", { videoUrl });
    return response;
  } catch (error) {
    console.error("Error updating video URL:", error);
    throw error;
  }
};

// ==================== PROFILE MANAGEMENT ====================

// Get instructor profile
export const getInstructorProfile = async () => {
  try {
    const response = await api.get("/instructor/profile");
    return response;
  } catch (error) {
    console.error("Error fetching instructor profile:", error);
    throw error;
  }
};

// ==================== ANALYTICS ====================

// Get instructor analytics
export const getInstructorAnalytics = async () => {
  try {
    const response = await api.get("/instructor/analytics");
    return response;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
};

// Get revenue stats
export const getInstructorRevenueStats = async () => {
  try {
    const response = await api.get("/instructor/revenue");
    return response;
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    throw error;
  }
};

// ==================== TEST ENDPOINTS ====================

// Test endpoint
export const testInstructorApi = async () => {
  try {
    const response = await api.get("/instructor/test");
    return response;
  } catch (error) {
    console.error("Error testing instructor API:", error);
    throw error;
  }
};

// Test authentication
export const testInstructorAuth = async () => {
  try {
    const response = await api.get("/instructor/test-auth");
    return response;
  } catch (error) {
    console.error("Error testing instructor auth:", error);
    throw error;
  }
};

// ==================== EXPORT ALL ====================

export default {
  getInstructorDashboardStats,
  getInstructorCourses,
  createInstructorCourse,
  updateInstructorCourse,
  deleteInstructorCourse,
  getInstructorCourseDetails,
  getInstructorStudents,
  searchInstructorStudentsByName,
  getInstructorStudentDetails,
  getInstructorEnrollments,
  updateInstructorEnrollmentStatus,
  getInstructorHomeVideo,
  updateInstructorHomeVideoUrl,
  getInstructorProfile,
  getInstructorAnalytics,
  getInstructorRevenueStats,
  testInstructorApi,
  testInstructorAuth,
};