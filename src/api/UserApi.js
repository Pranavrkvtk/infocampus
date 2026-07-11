// src/api/UserApi.js
import api from "./axios";

// ========== PUBLIC ENDPOINTS (no auth required) ==========

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
 * Get single course details (public)
 * No authentication required
 */
export const getPublicCourseById = async (courseId) => {
  try {
    const response = await api.get(`/public/courses/${courseId}`);
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
    const response = await api.get(`/public/courses/${courseId}/public`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public course data:', error);
    throw error;
  }
};

/**
 * Get home video (public)
 * No authentication required
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
 * No authentication required
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

// ========== COURSE CATALOG ==========

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

// ========== GET COURSES WITH IMAGES (Alias for getCourses) ==========
export const getCoursesWithImages = async () => {
  return getCourses();
};

// ========== COURSE IMAGE UPLOAD (Admin) ==========
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

// ========== ENROLLMENT ==========

/**
 * Get enrolled courses - requires login
 * Returns empty array if not logged in
 */
export const getEnrolledCourses = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }
    const response = await api.get("/users/enrollments");
    return response.data;
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
};

/**
 * Enroll in course - requires login
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

// ========== ENROLLMENT COUNT ==========
export const getEnrollmentCount = async (courseId) => {
  try {
    const response = await api.get(`/users/courses/${courseId}/enrollment-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment count:', error);
    return 0;
  }
};

// ========== INSTRUCTOR APIs ==========

// Get instructor details for a specific course
export const getCourseInstructor = async (courseId) => {
  try {
    const response = await api.get(`/users/courses/${courseId}/instructor`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course instructor:', error);
    return null;
  }
};

// Get all instructors
export const getAllInstructors = async () => {
  try {
    const response = await api.get("/users/instructors");
    return response.data;
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }
};

// Get instructor by ID
export const getInstructorById = async (instructorId) => {
  try {
    const response = await api.get(`/users/instructors/${instructorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching instructor:', error);
    return null;
  }
};

// Get courses by instructor
export const getInstructorCourses = async (instructorId) => {
  try {
    const response = await api.get(`/users/instructors/${instructorId}/courses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    return [];
  }
};

// ========== COURSE CONTENT ==========

/**
 * Get course details - attempts authenticated first, falls back to public
 */
export const getCourseDetails = async (courseId) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      // Authenticated endpoint with enrollment info
      const response = await api.get(`/users/courses/${courseId}/details`);
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

export const getSubtopicInterviewQuestions = async (subtopicId) => {
  try {
    const response = await api.get(`/users/subtopics/${subtopicId}/interview-questions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching interview questions:', error);
    return [];
  }
};

export const getSubtopicExamQuestions = async (subtopicId) => {
  try {
    const response = await api.get(`/users/subtopics/${subtopicId}/exam-questions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exam questions:', error);
    return [];
  }
};

export const getSubtopicLabs = async (subtopicId) => {
  try {
    const response = await api.get(`/users/subtopics/${subtopicId}/labs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching labs:', error);
    return [];
  }
};

export const getTopicSubtopics = async (topicId) => {
  try {
    const response = await api.get(`/users/topics/${topicId}/subtopics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching topic subtopics:', error);
    return [];
  }
};

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

// ========== PROGRESS TRACKING (requires login) ==========
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

// ========== DEFAULT EXPORT ==========
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
  
  // Enrollment
  getEnrolledCourses,
  enrollInCourse,
  getEnrollmentCount,
  
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
  
  // Progress
  updateProgress,
};

export default userApi;