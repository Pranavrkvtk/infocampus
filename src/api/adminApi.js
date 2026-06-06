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

// ==================== STUDENT MANAGEMENT APIs ====================

// Get all students with pagination and filters
export const getAllStudents = (search = "", status = "", page = 0, size = 20) => {
  return api.get("/admin/students/all", {
    params: { search, status, page, size }
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
export const updateStudentStatus = (id, status) => {
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