// src/api/instructorApi.js
import api from "./axios";

// ==================== INSTRUCTOR COURSE MANAGEMENT ====================

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

// Get ALL courses (admin view)
export const getAllCourses = async () => {
  try {
    const response = await api.get("/instructor/courses/all");
    return response;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    throw error;
  }
};

// ✅ Get available courses (not assigned to this instructor)
export const getAvailableCourses = async () => {
  try {
    const response = await api.get("/instructor/courses/available");
    return response;
  } catch (error) {
    console.error("Error fetching available courses:", error);
    throw error;
  }
};

// FIXED: Create instructor course with FormData support
export const createInstructorCourse = async (formData) => {
  const token = localStorage.getItem('token');
  
  // Check if token exists
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    // Use the api instance instead of direct axios
    const response = await api.post('/instructor/courses', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it with boundary for FormData
      }
    });
    return response.data;
  } catch (error) {
    console.error('Instructor course creation error:', error);
    throw error;
  }
};

// Update instructor's course
export const updateInstructorCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/instructor/courses/${courseId}`, courseData);
    return response;
  } catch (error) {
    console.error("Error updating instructor course:", error);
    throw error;
  }
};

// Delete instructor's course
export const deleteInstructorCourse = async (courseId) => {
  try {
    const response = await api.delete(`/instructor/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error("Error deleting instructor course:", error);
    throw error;
  }
};

// Get instructor course details
export const getInstructorCourseDetails = async (courseId) => {
  try {
    const response = await api.get(`/instructor/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error("Error fetching instructor course details:", error);
    throw error;
  }
};

// ✅ Assign a course to instructor
export const assignCourseToInstructor = async (courseId) => {
  try {
    const response = await api.post(`/instructor/courses/${courseId}/assign`);
    return response;
  } catch (error) {
    console.error("Error assigning course:", error);
    throw error;
  }
};

// ==================== INSTRUCTOR STUDENT MANAGEMENT ====================

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

// Search students by name (within instructor's courses)
export const searchInstructorStudentsByName = async (name) => {
  try {
    const response = await api.get("/instructor/students/search", {
      params: { name }
    });
    return response;
  } catch (error) {
    console.error("Error searching instructor students:", error);
    throw error;
  }
};

// Get instructor student details
export const getInstructorStudentDetails = async (studentId) => {
  try {
    const response = await api.get(`/instructor/students/${studentId}`);
    return response;
  } catch (error) {
    console.error("Error fetching instructor student details:", error);
    throw error;
  }
};

// ==================== INSTRUCTOR ENROLLMENT MANAGEMENT ====================

// Get instructor's enrollments
export const getInstructorEnrollments = async () => {
  try {
    const response = await api.get("/instructor/enrollments");
    return response;
  } catch (error) {
    console.error("Error fetching instructor enrollments:", error);
    throw error;
  }
};

// Update enrollment status (within instructor's courses)
export const updateInstructorEnrollmentStatus = async (enrollmentId, status) => {
  try {
    const response = await api.patch(`/instructor/enrollments/${enrollmentId}/status`, { status });
    return response;
  } catch (error) {
    console.error("Error updating instructor enrollment status:", error);
    throw error;
  }
};

// ==================== INSTRUCTOR DASHBOARD STATS ====================

// Get instructor dashboard stats
export const getInstructorDashboardStats = async () => {
  try {
    const response = await api.get("/instructor/dashboard");
    return response;
  } catch (error) {
    console.error("Error fetching instructor dashboard stats:", error);
    throw error;
  }
};

// ✅ Get recent activity
export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await api.get(`/instructor/activity/recent?limit=${limit}`);
    return response;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

// ==================== INSTRUCTOR MEDIA MANAGEMENT ====================

// Get home video (instructor view)
export const getInstructorHomeVideo = async () => {
  try {
    const response = await api.get("/instructor/home-video");
    return response;
  } catch (error) {
    console.error("Error fetching instructor home video:", error);
    throw error;
  }
};

// Update home video URL (instructor view)
export const updateInstructorHomeVideoUrl = async (videoUrl) => {
  try {
    const response = await api.patch("/instructor/home-video", { videoUrl });
    return response;
  } catch (error) {
    console.error("Error updating instructor home video:", error);
    throw error;
  }
};

// ==================== INSTRUCTOR PROFILE MANAGEMENT ====================

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

// Update instructor profile
export const updateInstructorProfile = async (profileData) => {
  try {
    const response = await api.put("/instructor/profile", profileData);
    return response;
  } catch (error) {
    console.error("Error updating instructor profile:", error);
    throw error;
  }
};

// ==================== INSTRUCTOR ANALYTICS ====================

// Get instructor analytics
export const getInstructorAnalytics = async () => {
  try {
    const response = await api.get("/instructor/analytics");
    return response;
  } catch (error) {
    console.error("Error fetching instructor analytics:", error);
    throw error;
  }
};

// Get instructor revenue stats
export const getInstructorRevenueStats = async () => {
  try {
    const response = await api.get("/instructor/revenue");
    return response;
  } catch (error) {
    console.error("Error fetching instructor revenue stats:", error);
    throw error;
  }
};

// Get instructor course performance
export const getInstructorCoursePerformance = async (courseId) => {
  try {
    const response = await api.get(`/instructor/courses/${courseId}/performance`);
    return response;
  } catch (error) {
    console.error("Error fetching instructor course performance:", error);
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

const instructorApi = {
  // Course Management
  getInstructorCourses,
  getAllCourses,
  getAvailableCourses, // ✅ Added
  createInstructorCourse,
  updateInstructorCourse,
  deleteInstructorCourse,
  getInstructorCourseDetails,
  assignCourseToInstructor, // ✅ Added
  
  // Student Management
  getInstructorStudents,
  searchInstructorStudentsByName,
  getInstructorStudentDetails,
  
  // Enrollment Management
  getInstructorEnrollments,
  updateInstructorEnrollmentStatus,
  
  // Dashboard
  getInstructorDashboardStats,
  getRecentActivity, // ✅ Added
  
  // Media
  getInstructorHomeVideo,
  updateInstructorHomeVideoUrl,
  
  // Profile
  getInstructorProfile,
  updateInstructorProfile,
  
  // Analytics
  getInstructorAnalytics,
  getInstructorRevenueStats,
  getInstructorCoursePerformance,
  
  // Test
  testInstructorApi,
  testInstructorAuth,
};

export default instructorApi;