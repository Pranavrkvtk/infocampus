import api from "./axios";

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

// Create new course
export const createAdminCourse = (courseData) => {
  return api.post("/admin/courses", courseData);
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

// Delete instructor
export const deleteInstructor = (instructorId) => {
  return api.delete(`/admin/instructors/${instructorId}`);
};

// Update instructor status (ACTIVE, INACTIVE)
export const updateInstructorStatus = (instructorId, status) => {
  return api.patch(`/admin/instructors/${instructorId}/status`, null, {
    params: { status }
  });
};

// Get courses taught by instructor
export const getInstructorCourses = (instructorId) => {
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