// src/api/UserApi.js
import api from "./axios";

// =========================================================================
//  PUBLIC ENDPOINTS (No Auth Required)
// =========================================================================

/**
 * Get all courses (public)
 * No authentication required
 */
export const getPublicCourses = async () => {
  try {
    const response = await api.get("/public/courses");
    return response.data;
  } catch (error) {
    console.error('Error fetching public courses:', error);
    throw error;
  }
};

/**
 * Get single course details (public) with first topic free
 * No authentication required
 */
export const getPublicCourseById = async (courseId) => {
  try {
    const response = await api.get(`/public/courses/${courseId}`);
    console.log('📥 Public course data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching public course:', error);
    throw error;
  }
};

/**
 * Get public course data with topics (first topic full, others limited)
 * No authentication required
 */
export const getPublicCourseData = async (courseId) => {
  try {
    const response = await api.get(`/public/courses/${courseId}`);
    console.log('📥 Public course data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching public course data:', error);
    throw error;
  }
};

/**
 * Get home video (public)
 */
export const getHomeVideo = async () => {
  try {
    const response = await api.get("/public/home-video");
    return response.data;
  } catch (error) {
    console.error('Error fetching home video:', error);
    return { videoUrl: null };
  }
};

/**
 * Get subtopic images (public)
 */
export const getPublicSubtopicImages = async (subtopicId) => {
  try {
    const response = await api.get(`/public/subtopics/${subtopicId}/images`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public subtopic images:', error);
    return [];
  }
};

// =========================================================================
//  COURSE CATALOG
// =========================================================================

/**
 * Get courses - attempts authenticated first, falls back to public
 */
export const getCourses = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // Try authenticated endpoint first
      const response = await api.get("/users/courses");
      return response.data;
    }
  } catch (error) {
    console.log('Falling back to public courses');
  }
  
  // Fallback to public endpoint
  return getPublicCourses();
};

/**
 * Get courses with images (alias for getCourses)
 */
export const getCoursesWithImages = async () => {
  return getCourses();
};

// =========================================================================
//  COURSE DATA WITH AUTO-DETECTED AUTHENTICATION
// =========================================================================

/**
 * ✅ NEW: Get course data with auto-detected authentication
 * This endpoint handles both authenticated and guest users automatically
 * GET /api/users/courses/{courseId}
 * 
 * - If authenticated: Returns FULL content for all topics
 * - If guest: Returns LIMITED content (only first topic free)
 */
export const getCourseData = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('📥 Fetching course data for ID:', courseId, 'Token:', !!token);
    
    const response = await api.get(`/users/courses/${courseId}`, { headers });
    console.log('📥 Course data response:', response.data);
    
    // Handle response format
    if (response.data && response.data.success) {
      return response.data.data || response.data;
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching course data:', error);
    
    // If authenticated request fails, try public endpoint as fallback
    if (localStorage.getItem('token')) {
      console.log('⚠️ Auth endpoint failed, falling back to public');
      try {
        return await getPublicCourseData(courseId);
      } catch (publicError) {
        console.error('Public fallback also failed:', publicError);
        throw publicError;
      }
    }
    throw error;
  }
};

/**
 * Get course details - attempts authenticated first, falls back to public
 */
export const getCourseDetails = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // Authenticated endpoint with enrollment info
      const response = await api.get(`/users/courses/${courseId}/details`);
      console.log('📥 Course details response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }
      return response.data;
    } else {
      // Public endpoint
      return getPublicCourseData(courseId);
    }
  } catch (error) {
    console.error('Error fetching course details:', error);
    // If authenticated fails, try public
    if (localStorage.getItem('token')) {
      try {
        return getPublicCourseData(courseId);
      } catch (publicError) {
        console.error('Public fallback also failed:', publicError);
        throw publicError;
      }
    }
    throw error;
  }
};

// =========================================================================
//  COURSE IMAGE UPLOAD (Admin Only)
// =========================================================================

/**
 * Upload course image - requires admin authentication
 */
export const uploadCourseImage = async (courseId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post(`/admin/courses/${courseId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// =========================================================================
//  ENROLLMENT (✅ FIXED - Using correct endpoints)
// =========================================================================

/**
 * ✅ FIXED: Get enrolled courses - uses the correct endpoint
 * GET /api/users/enrolled-courses
 */
export const getEnrolledCourses = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }
    
    const response = await api.get("/users/enrolled-courses");
    console.log('📚 Enrolled courses response:', response.data);
    
    // Handle different response formats
    if (response.data && response.data.success) {
      // If response has success flag, extract courses
      if (response.data.courses) {
        return response.data.courses;
      }
      // If response has data field
      if (response.data.data) {
        return response.data.data;
      }
      // If response has enrollments field
      if (response.data.enrollments) {
        return response.data.enrollments.map(e => e.course).filter(Boolean);
      }
    }
    
    // If response is directly an array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // If response has courses array directly
    if (response.data && Array.isArray(response.data.courses)) {
      return response.data.courses;
    }
    
    // Fallback: try to extract from enrollments
    if (response.data && Array.isArray(response.data.enrollments)) {
      return response.data.enrollments.map(e => e.course).filter(Boolean);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
    }
    return [];
  }
};

/**
 * ✅ FIXED: Get my enrollments with full details
 * GET /api/users/my-enrollments
 */
export const getMyEnrollments = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }
    
    const response = await api.get("/users/my-enrollments");
    console.log('📋 My enrollments response:', response.data);
    
    if (response.data && response.data.success) {
      return response.data.enrollments || [];
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching my enrollments:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return [];
  }
};

/**
 * Enroll in course - requires login
 * POST /api/users/enroll/{courseId}
 */
export const enrollInCourse = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Login required to enroll');
    }
    const response = await api.post(`/users/enroll/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

/**
 * ✅ FIXED: Check if the current user is enrolled in a specific course
 * GET /api/users/courses/{courseId}/is-enrolled
 */
export const checkEnrollment = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { enrolled: false };
    }

    const response = await api.get(`/users/courses/${courseId}/is-enrolled`);
    console.log('📥 Check enrollment response:', response.data);
    
    if (response.data && response.data.success) {
      return { 
        enrolled: response.data.isEnrolled === true,
        enrollmentId: response.data.enrollmentId,
        status: response.data.status,
        progress: response.data.progress
      };
    }
    
    return { enrolled: false };
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return { enrolled: false };
  }
};

/**
 * Update enrollment progress
 * PATCH /api/users/enrollment/progress
 */
export const updateEnrollmentProgress = async (courseId, progress) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Login required to update progress');
    }
    
    const response = await api.patch(`/users/enrollment/progress?courseId=${courseId}&progress=${progress}`);
    return response.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

/**
 * Update enrollment status
 * PATCH /api/users/enrollment/status
 */
export const updateEnrollmentStatus = async (courseId, status) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Login required to update status');
    }
    
    const response = await api.patch(`/users/enrollment/status?courseId=${courseId}&status=${status}`);
    return response.data;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

/**
 * Unenroll from a course
 * DELETE /api/users/unenroll/{courseId}
 */
export const unenrollFromCourse = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Login required to unenroll');
    }
    
    const response = await api.delete(`/users/unenroll/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error unenrolling:', error);
    throw error;
  }
};

/**
 * Get enrollment count for a course
 */
export const getEnrollmentCount = async (courseId) => {
  try {
    const response = await api.get(`/users/courses/${courseId}/enrollment-count`);
    if (response.data && response.data.success) {
      return response.data.total || 0;
    }
    return response.data || 0;
  } catch (error) {
    console.error('Error fetching enrollment count:', error);
    return 0;
  }
};

/**
 * Check if user has any enrolled courses
 */
export const hasEnrolledCourses = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { hasEnrolledCourses: false, enrollmentCount: 0 };
    }
    
    const response = await api.get("/users/has-enrolled-courses");
    if (response.data && response.data.success) {
      return {
        hasEnrolledCourses: response.data.hasEnrolledCourses,
        enrollmentCount: response.data.enrollmentCount || 0
      };
    }
    return { hasEnrolledCourses: false, enrollmentCount: 0 };
  } catch (error) {
    console.error('Error checking enrolled courses:', error);
    return { hasEnrolledCourses: false, enrollmentCount: 0 };
  }
};

// =========================================================================
//  INSTRUCTOR APIs
// =========================================================================

/**
 * Get instructor details for a specific course
 */
export const getCourseInstructor = async (courseId) => {
  try {
    const response = await api.get(`/users/courses/${courseId}/instructor`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course instructor:', error);
    return null;
  }
};

/**
 * Get all instructors
 */
export const getAllInstructors = async () => {
  try {
    const response = await api.get("/users/instructors");
    return response.data;
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }
};

/**
 * Get instructor by ID
 */
export const getInstructorById = async (instructorId) => {
  try {
    const response = await api.get(`/users/instructors/${instructorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching instructor:', error);
    return null;
  }
};

/**
 * Get courses by instructor
 */
export const getInstructorCourses = async (instructorId) => {
  try {
    const response = await api.get(`/users/instructors/${instructorId}/courses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return [];
  }
};

// =========================================================================
//  COURSE CONTENT
// =========================================================================

/**
 * Get course topics - attempts authenticated first, falls back to public
 */
export const getCourseTopics = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await api.get(`/users/courses/${courseId}/topics`);
      return response.data;
    } else {
      // For public, we use the public course data endpoint
      return getPublicCourseData(courseId);
    }
  } catch (error) {
    console.error('Error fetching course topics:', error);
    throw error;
  }
};

/**
 * Get subtopic interview questions
 */
export const getSubtopicInterviewQuestions = async (subtopicId) => {
  try {
    const response = await api.get(`/users/subtopics/${subtopicId}/interview-questions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching interview questions:', error);
    return [];
  }
};

/**
 * Get subtopic exam questions
 */
export const getSubtopicExamQuestions = async (subtopicId) => {
  try {
    const response = await api.get(`/users/subtopics/${subtopicId}/exam-questions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exam questions:', error);
    return [];
  }
};

/**
 * Get subtopic labs
 */
export const getSubtopicLabs = async (subtopicId) => {
  try {
    const response = await api.get(`/users/subtopics/${subtopicId}/labs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching labs:', error);
    return [];
  }
};

/**
 * Get topic subtopics
 */
export const getTopicSubtopics = async (topicId) => {
  try {
    const response = await api.get(`/users/topics/${topicId}/subtopics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching topic subtopics:', error);
    return [];
  }
};

/**
 * Get subtopic details
 */
export const getSubtopic = async (subtopicId) => {
  try {
    const response = await api.get(`/users/subtopics/${subtopicId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subtopic:', error);
    return null;
  }
};

/**
 * Get subtopic images - attempts authenticated first, falls back to public
 */
export const getSubtopicImages = async (subtopicId) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // Authenticated endpoint
      const response = await api.get(`/users/subtopics/${subtopicId}/images`);
      return response.data;
    } else {
      // Public endpoint
      return getPublicSubtopicImages(subtopicId);
    }
  } catch (error) {
    console.error('Error fetching subtopic images:', error);
    // Try public fallback if authenticated fails
    try {
      return getPublicSubtopicImages(subtopicId);
    } catch (publicError) {
      console.error('Public fallback also failed:', publicError);
      return [];
    }
  }
};

/**
 * Get exam content
 */
export const getExamContent = async (subtopicId) => {
  try {
    const response = await api.get(`/users/subtopics/${subtopicId}/exam-content`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exam content:', error);
    return null;
  }
};

/**
 * Get interview content
 */
export const getInterviewContent = async (subtopicId) => {
  try {
    const response = await api.get(`/users/subtopics/${subtopicId}/interview-content`);
    return response.data;
  } catch (error) {
    console.error('Error fetching interview content:', error);
    return null;
  }
};

// =========================================================================
//  PROGRESS TRACKING (Requires Login)
// =========================================================================

/**
 * Update course progress - requires login
 */
export const updateProgress = async (courseId, completedLessons) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Login required to update progress');
    }
    const response = await api.put(`/users/progress/${courseId}`, { completedLessons });
    return response.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

/**
 * Get course progress - requires login
 */
export const getCourseProgress = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { progress: 0, completedLessons: [] };
    }
    const response = await api.get(`/users/progress/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return { progress: 0, completedLessons: [] };
  }
};

// =========================================================================
//  DEFAULT EXPORT
// =========================================================================

const userApi = {
  // Public endpoints
  getPublicCourses,
  getPublicCourseById,
  getPublicCourseData,
  getHomeVideo,
  getPublicSubtopicImages,
  
  // Course catalog
  getCourses,
  getCoursesWithImages,
  uploadCourseImage,
  
  // ✅ NEW: Auto-detected course data
  getCourseData,
  
  // Enrollment (✅ FIXED)
  getEnrolledCourses,
  getMyEnrollments,
  enrollInCourse,
  checkEnrollment,
  getEnrollmentCount,
  hasEnrolledCourses,
  updateEnrollmentProgress,
  updateEnrollmentStatus,
  unenrollFromCourse,
  
  // Instructor
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
  getExamContent,
  getInterviewContent,
  
  // Progress
  updateProgress,
  getCourseProgress,
};

export default userApi;