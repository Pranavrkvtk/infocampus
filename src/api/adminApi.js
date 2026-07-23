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
  return api.get("/admin/courses");
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

// ==================== COURSE SEARCH & FILTERS ====================

/**
 * Search courses by keyword in title, description, and details
 * GET /api/admin/courses/search?keyword=java
 */
export const searchCourses = (keyword) => {
  return api.get(`/admin/courses/search`, { params: { keyword } });
};

/**
 * Search courses with pagination
 * GET /api/admin/courses/search-paginated?keyword=java&page=0&size=10
 */
export const searchCoursesPaginated = (keyword, page = 0, size = 10) => {
  return api.get(`/admin/courses/search-paginated`, { 
    params: { keyword, page, size } 
  });
};

/**
 * Get courses by status
 * GET /api/admin/courses/status/PUBLISHED
 */
export const getCoursesByStatus = (status) => {
  return api.get(`/admin/courses/status/${status}`);
};

/**
 * Get courses by level
 * GET /api/admin/courses/level/Beginner
 */
export const getCoursesByLevel = (level) => {
  return api.get(`/admin/courses/level/${level}`);
};

/**
 * Get courses by category
 * GET /api/admin/courses/category/Programming
 */
export const getCoursesByCategory = (category) => {
  return api.get(`/admin/courses/category/${category}`);
};

/**
 * Get recent courses
 * GET /api/admin/courses/recent?limit=5
 */
export const getRecentCourses = (limit = 5) => {
  return api.get(`/admin/courses/recent`, { params: { limit } });
};

/**
 * Get course statistics
 * GET /api/admin/courses/stats
 */
export const getCourseStats = () => {
  return api.get(`/admin/courses/stats`);
};

/**
 * Get courses with details
 * GET /api/admin/courses/with-details
 */
export const getCoursesWithDetails = () => {
  return api.get(`/admin/courses/with-details`);
};

/**
 * Get courses without details
 * GET /api/admin/courses/without-details
 */
export const getCoursesWithoutDetails = () => {
  return api.get(`/admin/courses/without-details`);
};

/**
 * Get course by ID with details
 * GET /api/admin/courses/{id}/with-details
 */
export const getCourseWithDetails = (id) => {
  return api.get(`/admin/courses/${id}/with-details`);
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

// ✅ Search users by phone number (partial match)
export const searchUsersByPhone = (phone) => {
  const token = localStorage.getItem("token");

  return api.get("/admin/users/search-by-phone", {
    params: { phone },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// ✅ Search users by phone number with pagination
export const searchUsersByPhonePaginated = (phone, page = 0, size = 10) => {
  const token = localStorage.getItem("token");

  return api.get("/admin/users/search-by-phone-paginated", {
    params: { phone, page, size },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// ✅ Get user by exact phone number
export const getUserByPhoneExact = (phone) => {
  const token = localStorage.getItem("token");

  return api.get("/admin/users/by-phone-exact", {
    params: { phone },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// ✅ Advanced search with multiple filters
export const searchUsersAdvanced = (filters = {}, page = 0, size = 20) => {
  const token = localStorage.getItem("token");
  const params = {
    ...filters,
    page,
    size
  };

  return api.get("/admin/users/search-advanced", {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// ✅ NEW: Search users by email (partial match)
export const searchUsersByEmail = (email) => {
  const token = localStorage.getItem("token");

  return api.get("/admin/users/search-by-email", {
    params: { email },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// ✅ NEW: Search users by email with pagination
export const searchUsersByEmailPaginated = (email, page = 0, size = 10) => {
  const token = localStorage.getItem("token");

  return api.get("/admin/users/search-by-email-paginated", {
    params: { email, page, size },
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// ✅ NEW: Get user by exact email
export const getUserByEmailExact = (email) => {
  const token = localStorage.getItem("token");

  return api.get("/admin/users/by-email-exact", {
    params: { email },
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

// ✅ DELETE USER - Hard delete (permanent deletion) with force parameter
export const deleteUser = (id, force = false) => {
  return api.delete(`/admin/users/${id}/hard-delete?force=${force}`);
};

// ✅ Soft delete user (sets status to DELETED)
export const softDeleteUser = (id) => {
  return api.patch(`/admin/users/${id}/soft-delete`);
};

// ✅ Restore user (sets status to ACTIVE)
export const restoreUser = (id) => {
  return api.patch(`/admin/users/${id}/restore`);
};

// ✅ Delete user by phone number
export const deleteUserByPhone = (phone) => {
  return api.delete(`/admin/users/by-phone/${encodeURIComponent(phone)}`);
};

// ✅ NEW: Delete user completely (handles soft delete if needed)
export const deleteUserCompletely = async (id) => {
  try {
    // Try hard delete with force=true first
    await deleteUser(id, true);
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    // If error is about soft delete first, do soft delete then hard delete
    if (error.response?.data?.error?.includes('soft deleted first')) {
      try {
        await softDeleteUser(id);
        await deleteUser(id, true);
        return { success: true, message: 'User deleted successfully (soft deleted first)' };
      } catch (retryError) {
        throw retryError;
      }
    }
    throw error;
  }
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

// ==================== HOME IMAGE MANAGEMENT APIs ====================

/**
 * Get all home images (Admin)
 * GET /api/admin/home-images
 */
export const getHomeImages = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.get('/admin/home-images', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching home images:', error);
    throw error;
  }
};

/**
 * Get home image by ID (Admin)
 * GET /api/admin/home-images/{id}
 */
export const getHomeImageById = async (id) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.get(`/admin/home-images/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching home image:', error);
    throw error;
  }
};

/**
 * Create a new home image (Admin)
 * POST /api/admin/home-images
 * @param {Object} imageData - { imageUrl: string }
 */
export const createHomeImage = async (imageData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.post('/admin/home-images', imageData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating home image:', error);
    throw error;
  }
};

/**
 * Upload a home image file (Admin)
 * POST /api/admin/home-images/upload
 * @param {File} file - The image file to upload
 * @param {Function} onUploadProgress - Optional progress callback
 */
export const uploadHomeImage = async (file, onUploadProgress) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/admin/home-images/upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress,
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading home image:', error);
    throw error;
  }
};

/**
 * Update a home image (Admin)
 * PUT /api/admin/home-images/{id}
 * @param {number|string} id - The image ID
 * @param {Object} imageData - { imageUrl: string }
 */
export const updateHomeImage = async (id, imageData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.put(`/admin/home-images/${id}`, imageData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating home image:', error);
    throw error;
  }
};

/**
 * Delete a home image (Admin)
 * DELETE /api/admin/home-images/{id}
 */
export const deleteHomeImage = async (id) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.delete(`/admin/home-images/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting home image:', error);
    throw error;
  }
};

/**
 * Get public home images (No authentication required)
 * GET /api/public/home-images
 */
export const getPublicHomeImages = async () => {
  try {
    const response = await api.get('/api/public/home-images');
    return response.data;
  } catch (error) {
    console.error('Error fetching public home images:', error);
    throw error;
  }
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

// ==================== LABS CONTENT MANAGEMENT APIs ====================

/**
 * Get labs content for a specific subtopic
 * @param {number|string} subtopicId - The ID of the subtopic
 * @returns {Promise} - Returns the labs content
 */
export const getLabsContent = (subtopicId) => {
  return api.get(`/admin/subtopics/${subtopicId}/labs-content`);
};

/**
 * Save/update labs content for a specific subtopic
 * @param {number|string} subtopicId - The ID of the subtopic
 * @param {string} content - The labs content in markdown format
 * @returns {Promise} - Returns the updated content
 */
export const saveLabsContent = (subtopicId, content) => {
  return api.put(`/admin/subtopics/${subtopicId}/labs-content`, { content });
};

/**
 * Upload a PDF document for labs content (PDF ONLY)
 * @param {number|string} subtopicId - The ID of the subtopic
 * @param {File} file - The PDF file to upload
 * @param {Function} onUploadProgress - Optional progress callback
 * @returns {Promise} - Returns upload result with image count
 */
export const uploadLabsPdf = (subtopicId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(`/admin/subtopics/${subtopicId}/upload-labs-pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onUploadProgress,
  });
};

/**
 * Clear labs content for a specific subtopic
 * @param {number|string} subtopicId - The ID of the subtopic
 * @returns {Promise} - Returns success response
 */
export const clearLabsContent = (subtopicId) => {
  return api.delete(`/admin/subtopics/${subtopicId}/labs-content`);
};

// ==================== LABS STATISTICS APIs ====================

/**
 * Get labs completion statistics for a course or subtopic
 * @param {number|string} subtopicId - Optional subtopic ID for specific stats
 * @returns {Promise} - Returns lab completion stats
 */
export const getLabsStats = (subtopicId = null) => {
  const params = subtopicId ? { subtopicId } : {};
  return api.get('/admin/labs/stats', { params });
};

/**
 * Get labs progress for a specific student
 * @param {number|string} studentId - The ID of the student
 * @returns {Promise} - Returns student's lab progress
 */
export const getStudentLabsProgress = (studentId) => {
  return api.get(`/admin/labs/students/${studentId}/progress`);
};

/**
 * Get all labs for a course
 * @param {number|string} courseId - The ID of the course
 * @returns {Promise} - Returns list of labs in the course
 */
export const getCourseLabs = (courseId) => {
  return api.get(`/admin/labs/courses/${courseId}`);
};

// ==================== COURSE PAGE SETTINGS MANAGEMENT APIs ====================

/**
 * Get course page settings (Admin only)
 * GET /api/admin/course-page-settings
 * @returns {Promise} - Returns the course page settings
 */
export const getCoursePageSettings = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.get('/admin/course-page-settings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching course page settings:', error);
    throw error;
  }
};

/**
 * Update course page settings (Admin only)
 * PUT /api/admin/course-page-settings
 * @param {Object} settings - The settings object to update
 * @returns {Promise} - Returns the updated settings
 */
export const updateCoursePageSettings = async (settings) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.put('/admin/course-page-settings', settings, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating course page settings:', error);
    throw error;
  }
};

/**
 * Initialize course page settings with defaults (Admin only)
 * POST /api/admin/course-page-settings/initialize
 * @returns {Promise} - Returns the initialized settings
 */
export const initializeCoursePageSettings = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  try {
    const response = await api.post('/admin/course-page-settings/initialize', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error initializing course page settings:', error);
    throw error;
  }
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
  uploadCourseImage,
  updateAdminCourse,
  deleteAdminCourse,
  updateCourseStatus,
  getAdminCoursesSimple,
  
  // Course Search & Filters
  searchCourses,
  searchCoursesPaginated,
  getCoursesByStatus,
  getCoursesByLevel,
  getCoursesByCategory,
  getRecentCourses,
  getCourseStats,
  getCoursesWithDetails,
  getCoursesWithoutDetails,
  getCourseWithDetails,
  
  // Course Management - Instructor
  getInstructorCourses,
  createInstructorCourse,
  uploadInstructorCourseImage,
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
  searchUsersByPhone,
  searchUsersByPhonePaginated,
  getUserByPhoneExact,
  searchUsersAdvanced,
  searchUsersByEmail,
  searchUsersByEmailPaginated,
  getUserByEmailExact,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  softDeleteUser,
  restoreUser,
  deleteUserByPhone,
  deleteUserCompletely,
  
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
  
  // Home Image Management
  getHomeImages,
  getHomeImageById,
  createHomeImage,
  uploadHomeImage,
  updateHomeImage,
  deleteHomeImage,
  getPublicHomeImages,
  
  // Statistics
  getLabCompletionStats,
  getEnrollmentTrends,
  
  // Labs Management
  getLabsContent,
  saveLabsContent,
  uploadLabsPdf,
  clearLabsContent,
  
  // Labs Statistics
  getLabsStats,
  getStudentLabsProgress,
  getCourseLabs,
  
  // Course Page Settings
  getCoursePageSettings,
  updateCoursePageSettings,
  initializeCoursePageSettings,
  
  // Utility
  checkAdminRole,
  getAdminAuthHeaders,
};

// Export the named object as default
export default adminApi;