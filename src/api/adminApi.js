// src/api/adminApi.js
import api from "./axios";

// Get the base URL from the axios instance

// ==================== DASHBOARD APIs ====================

// Get dashboard KPIs (total students, active courses, completion rate, etc.)
export const getDashboardKPIs = () => {
  return api.get("/admin/dashboard/kpis");
};

// Get top enrolled courses
export const getTopEnrolledCourses = () => {
  return api.get("/admin/dashboard/top-courses");
};

// Get recent activities
export const getRecentActivities = () => {
  return api.get("/admin/dashboard/recent-activities");
};

// Get top performing students
export const getTopPerformingStudents = () => {
  return api.get("/admin/dashboard/top-students");
};

// Get simple dashboard stats (legacy)
export const getDashboardStats = () => {
  return api.get("/admin/dashboard");
};

// ==================== COURSE MANAGEMENT APIs ====================

// Get all courses for admin (with full details)
export const getAdminCourses = () => {
  return api.get("/admin/courses/all");
};

// Get course by ID for admin
export const getAdminCourseById = (id) => {
  return api.get(`/admin/courses/${id}`);
};

// ✅ CREATE COURSE AS JSON (for text data only)
export const createAdminCourse = async (courseData) => {
  const token = localStorage.getItem('token');
  
  // Check if token exists
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.post('/admin/courses', courseData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Admin course creation error:', error);
    throw error;
  }
};

// ✅ UPLOAD COURSE IMAGE (separate endpoint)
export const uploadCourseImage = async (courseId, imageFile) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await api.post(`/admin/courses/${courseId}/upload-image`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it with boundary for FormData
      }
    });
    return response.data;
  } catch (error) {
    console.error('Course image upload error:', error);
    throw error;
  }
};

// Update course
export const updateAdminCourse = (id, courseData) => {
  return api.put(`/admin/courses/${id}`, courseData);
};

// Delete course
export const deleteAdminCourse = (id) => {
  return api.delete(`/admin/courses/${id}`);
};

// Update course status (PUBLISHED, DRAFT, ARCHIVED)
export const updateCourseStatus = (id, status) => {
  return api.patch(`/admin/courses/${id}/status`, null, {
    params: { status }
  });
};

// Get simple course list for admin (legacy)
export const getAdminCoursesSimple = () => {
  return api.get("/admin/courses");
};

// ==================== INSTRUCTOR COURSE MANAGEMENT ====================

// Get instructor's courses (for instructor dashboard)
export const getInstructorCourses = async () => {
  try {
    const response = await api.get("/admin/instructor/courses");
    return response;
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    throw error;
  }
};

// ✅ CREATE INSTRUCTOR COURSE AS JSON
export const createInstructorCourse = async (courseData) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.post('/admin/instructor/courses', courseData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Instructor course creation error:', error);
    throw error;
  }
};

// ✅ UPLOAD INSTRUCTOR COURSE IMAGE
export const uploadInstructorCourseImage = async (courseId, imageFile) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await api.post(`/admin/instructor/courses/${courseId}/upload-image`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Instructor course image upload error:', error);
    throw error;
  }
};

// Update instructor's course
export const updateInstructorCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/admin/instructor/courses/${courseId}`, courseData);
    return response;
  } catch (error) {
    console.error("Error updating instructor course:", error);
    throw error;
  }
};

// Delete instructor's course
export const deleteInstructorCourse = async (courseId) => {
  try {
    const response = await api.delete(`/admin/instructor/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error("Error deleting instructor course:", error);
    throw error;
  }
};

// Get instructor course details
export const getInstructorCourseDetails = async (courseId) => {
  try {
    const response = await api.get(`/admin/instructor/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error("Error fetching instructor course details:", error);
    throw error;
  }
};

// ==================== INSTRUCTOR STUDENT MANAGEMENT ====================

// Get instructor's students
export const getInstructorStudents = async () => {
  try {
    const response = await api.get("/admin/instructor/students");
    return response;
  } catch (error) {
    console.error("Error fetching instructor students:", error);
    throw error;
  }
};

// Search students by name (within instructor's courses)
export const searchInstructorStudentsByName = async (name) => {
  try {
    const response = await api.get("/admin/instructor/students/search", {
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
    const response = await api.get(`/admin/instructor/students/${studentId}`);
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
    const response = await api.get("/admin/instructor/enrollments");
    return response;
  } catch (error) {
    console.error("Error fetching instructor enrollments:", error);
    throw error;
  }
};

// Update enrollment status (within instructor's courses)
export const updateInstructorEnrollmentStatus = async (enrollmentId, status) => {
  try {
    const response = await api.patch(`/admin/instructor/enrollments/${enrollmentId}/status`, { status });
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
    const response = await api.get("/admin/instructor/dashboard/stats");
    return response;
  } catch (error) {
    console.error("Error fetching instructor dashboard stats:", error);
    throw error;
  }
};

// ==================== INSTRUCTOR MEDIA MANAGEMENT ====================

// Get home video (instructor view)
export const getInstructorHomeVideo = async () => {
  try {
    const response = await api.get("/admin/instructor/home-video");
    return response;
  } catch (error) {
    console.error("Error fetching instructor home video:", error);
    throw error;
  }
};

// Update home video URL (instructor view)
export const updateInstructorHomeVideoUrl = async (videoUrl) => {
  try {
    const response = await api.put("/admin/instructor/home-video", { videoUrl });
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
    const response = await api.get("/admin/instructor/profile");
    return response;
  } catch (error) {
    console.error("Error fetching instructor profile:", error);
    throw error;
  }
};

// Update instructor profile
export const updateInstructorProfile = async (profileData) => {
  try {
    const response = await api.put("/admin/instructor/profile", profileData);
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
    const response = await api.get("/admin/instructor/analytics");
    return response;
  } catch (error) {
    console.error("Error fetching instructor analytics:", error);
    throw error;
  }
};

// Get instructor revenue stats
export const getInstructorRevenueStats = async () => {
  try {
    const response = await api.get("/admin/instructor/revenue");
    return response;
  } catch (error) {
    console.error("Error fetching instructor revenue stats:", error);
    throw error;
  }
};

// Get instructor course performance
export const getInstructorCoursePerformance = async (courseId) => {
  try {
    const response = await api.get(`/admin/instructor/courses/${courseId}/performance`);
    return response;
  } catch (error) {
    console.error("Error fetching instructor course performance:", error);
    throw error;
  }
};

// ==================== USER MANAGEMENT APIs ====================

// Search users by name
export const searchUsersByName = (name) => {
  const token = localStorage.getItem("token");

  return api.get("/admin/users/search", {
    params: { name },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Get all users
export const getAllUsers = () => {
  return api.get("/admin/users");
};

// Get user by ID
export const getUserById = (id) => {
  return api.get(`/admin/users/${id}`);
};

// Update user role
export const updateUserRole = (id, role) => {
  return api.put(`/admin/users/${id}/role`, null, {
    params: { role: role }
  });
};

// Update user status
export const updateUserStatus = (id, status) => {
  return api.put(`/admin/users/${id}/status`, null, {
    params: { status: status }
  });
};

// Delete user
export const deleteUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};

// ==================== STUDENT MANAGEMENT APIs ====================

export const getAllStudents = () => {
  const token = localStorage.getItem("token");

  return api.get("/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Get student by ID
export const getStudentById = (id) => {
  return api.get(`/admin/students/${id}`);
};

// Get student progress details
export const getStudentProgress = (id) => {
  return api.get(`/admin/students/${id}/progress`);
};

// Update student status
export const updateStudentStatusById = (id, status) => {
  return api.put(`/admin/students/${id}/status`, null, {
    params: { status }
  });
};

// Get student statistics
export const getStudentStats = () => {
  return api.get("/admin/students/stats");
};

// Get simple student list (legacy)
export const getAdminStudents = () => {
  return api.get("/admin/students");
};

// ==================== INSTRUCTOR MANAGEMENT APIs ====================

// Get all instructors
export const getAllInstructors = () => {
  return api.get("/admin/instructors");
};

// Get instructor by ID
export const getInstructorById = (instructorId) => {
  return api.get(`/admin/instructors/${instructorId}`);
};

// Create new instructor
export const createInstructor = (instructorData) => {
  return api.post("/admin/instructors", instructorData);
};

// Update instructor
export const updateInstructor = (instructorId, instructorData) => {
  return api.put(`/admin/instructors/${instructorId}`, instructorData);
};

// Soft delete (deactivate) - existing
export const deleteInstructor = (instructorId) => {
  return api.delete(`/admin/instructors/${instructorId}`);
};

// Hard delete (permanent deletion)
export const hardDeleteInstructor = (instructorId) => {
  return api.delete(`/admin/instructors/${instructorId}/hard-delete`);
};

// Update instructor status (ACTIVE, INACTIVE)
export const updateInstructorStatus = (instructorId, status) => {
  return api.patch(`/admin/instructors/${instructorId}/status`, null, {
    params: { status }
  });
};

// Reactivate instructor
export const reactivateInstructor = (instructorId) => {
  return api.patch(`/admin/instructors/${instructorId}/reactivate`);
};

// Get courses taught by instructor
export const getInstructorCoursesByAdmin = (instructorId) => {
  return api.get(`/admin/instructors/${instructorId}/courses`);
};

// Assign course to instructor
export const assignCourseToInstructor = (instructorId, courseId) => {
  return api.post(`/admin/instructors/${instructorId}/courses/${courseId}`);
};

// Remove course from instructor
export const removeCourseFromInstructor = (instructorId, courseId) => {
  return api.delete(`/admin/instructors/${instructorId}/courses/${courseId}`);
};

// Get instructor statistics
export const getInstructorStats = (instructorId) => {
  return api.get(`/admin/instructors/${instructorId}/stats`);
};

// ==================== ENROLLMENT MANAGEMENT APIs ====================

// Get all enrollments
export const getAllEnrollments = () => {
  return api.get("/admin/enrollments");
};

// Get enrollment by ID
export const getEnrollmentById = (enrollmentId) => {
  return api.get(`/admin/enrollments/${enrollmentId}`);
};

// Delete enrollment by ID (Admin only)
export const deleteEnrollmentById = (enrollmentId) => {
  return api.delete(`/admin/enrollments/${enrollmentId}`);
};

// Get enrollment statistics
export const getEnrollmentStats = () => {
  return api.get("/admin/enrollments/stats");
};

// Get enrollments by course
export const getEnrollmentsByCourse = (courseId) => {
  return api.get(`/admin/enrollments/course/${courseId}`);
};

// Get enrollments by user
export const getEnrollmentsByUser = (userId) => {
  return api.get(`/admin/enrollments/user/${userId}`);
};

// Get user's enrolled courses with details
export const getUserEnrolledCourses = (userId) => {
  return api.get(`/admin/enrollments/user/${userId}/courses`);
};

// Enroll in course
export const enrollInCourse = (courseId, userId) => {
  return api.post(`/admin/enrollments/enroll/${courseId}/${userId}`);
};

// Cancel enrollment
export const cancelEnrollment = (courseId, userId) => {
  return api.delete(`/admin/enrollments/enroll/${courseId}/${userId}`);
};

// ==================== MEDIA MANAGEMENT APIs ====================

// Get current home video URL (public endpoint, but we'll call via admin for consistency)
export const getHomeVideo = () => {
  return api.get("/admin/home-video");
};

// Upload a new home video (multipart/form-data)
export const uploadHomeVideo = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/admin/home-video/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Delete the home video
export const deleteHomeVideo = () => {
  return api.delete("/admin/home-video");
};

// Update home video URL directly (without uploading a file)
export const updateHomeVideoUrl = (videoUrl) => {
  return api.patch("/admin/home-video", { videoUrl });
};

// ==================== STATISTICS APIs ====================

// Get lab completion statistics
export const getLabCompletionStats = () => {
  return api.get("/admin/stats/lab-completion");
};

// Get enrollment trends (monthly/yearly)
export const getEnrollmentTrends = (period = "monthly", year = null) => {
  return api.get("/admin/stats/enrollment-trends", {
    params: { period, year }
  });
};

// ==================== AUTHENTICATION & UTILITY ====================

// Check if user is admin
export const checkAdminRole = () => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  return role === "ADMIN" && token;
};

// Get auth headers for admin requests
export const getAdminAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// ==================== EXPORT ALL ====================

// Create the adminApi object
const adminApi = {
  // Dashboard
  getDashboardKPIs,
  getTopEnrolledCourses,
  getRecentActivities,
  getTopPerformingStudents,
  getDashboardStats,
  
  // Course Management - Admin
  getAdminCourses,
  getAdminCourseById,
  createAdminCourse,
  uploadCourseImage, // ✅ Added image upload
  updateAdminCourse,
  deleteAdminCourse,
  updateCourseStatus,
  getAdminCoursesSimple,
  
  // Course Management - Instructor
  getInstructorCourses,
  createInstructorCourse,
  uploadInstructorCourseImage, // ✅ Added instructor image upload
  updateInstructorCourse,
  deleteInstructorCourse,
  getInstructorCourseDetails,
  
  // Instructor Dashboard
  getInstructorDashboardStats,
  
  // Instructor Students
  getInstructorStudents,
  searchInstructorStudentsByName,
  getInstructorStudentDetails,
  
  // Instructor Enrollments
  getInstructorEnrollments,
  updateInstructorEnrollmentStatus,
  
  // Instructor Media
  getInstructorHomeVideo,
  updateInstructorHomeVideoUrl,
  
  // Instructor Profile
  getInstructorProfile,
  updateInstructorProfile,
  
  // Instructor Analytics
  getInstructorAnalytics,
  getInstructorRevenueStats,
  getInstructorCoursePerformance,
  
  // User Management
  searchUsersByName,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  
  // Student Management
  getAllStudents,
  getStudentById,
  getStudentProgress,
  updateStudentStatusById,
  getStudentStats,
  getAdminStudents,
  
  // Instructor Management
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  hardDeleteInstructor,
  updateInstructorStatus,
  reactivateInstructor,
  getInstructorCoursesByAdmin,
  assignCourseToInstructor,
  removeCourseFromInstructor,
  getInstructorStats,
  
  // Enrollment Management
  getAllEnrollments,
  getEnrollmentById,
  deleteEnrollmentById,
  getEnrollmentStats,
  getEnrollmentsByCourse,
  getEnrollmentsByUser,
  getUserEnrolledCourses,
  enrollInCourse,
  cancelEnrollment,
  
  // Media Management
  getHomeVideo,
  uploadHomeVideo,
  deleteHomeVideo,
  updateHomeVideoUrl,
  
  // Statistics
  getLabCompletionStats,
  getEnrollmentTrends,
  
  // Utility
  checkAdminRole,
  getAdminAuthHeaders,
};

// Export the named object as default
export default adminApi;