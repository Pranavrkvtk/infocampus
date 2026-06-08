import api from "./axios";

// Course APIs
export const getCourses = () => {
  return api.get("/courses");
};

export const getCourseById = (id) => {
  return api.get(`/courses/${id}`);
};

export const deleteCourse = (id) => {
  return api.delete(`/courses/${id}`);
};

export const createCourse = (data) => {
  return api.post("/courses", data);
};

export const updateCourse = (id, data) => {
  return api.put(`/courses/${id}`, data);
};

// Enrollment APIs
export const enrollInCourse = (courseId) => {
  const userId = localStorage.getItem("userId");
  
  console.log("=== DEBUG ENROLLMENT ===");
  console.log("Course ID:", courseId);
  console.log("User ID from localStorage:", userId);
  console.log("Full URL:", `/enrollments/enroll/${courseId}/${userId}`);
  console.log("========================");
  
  // Add this check
  if (!userId) {
    throw new Error("User not logged in. Please create a user first.");
  }

  return api.post(`/enrollments/enroll/${courseId}/${userId}`);
};

export const getUserEnrollments = (userId) => {
  // Make sure userId is a number
  const id = parseInt(userId);
  console.log("Calling API with userId:", id);
  return api.get(`/enrollments/user/${id}`);
};

export const getAllEnrollments = () => {
  return api.get("/enrollments");
};

export const watchCourse = (courseId) => {
  return api.get(`/enrollments/${courseId}/watch`);
};

// ✅ FIXED: Delete enrollment using courseId and userId (matching backend)
// In courseApi.js - REPLACE your deleteEnrollment function with this:

// ✅ FIXED: Delete by enrollment ID (not courseId + userId)
export const deleteEnrollment = async (enrollmentId) => {
  try {
    console.log("=== DEBUG DELETE ENROLLMENT ===");
    console.log("Enrollment ID:", enrollmentId);
    console.log("Full URL:", `/enrollments/${enrollmentId}`);
    console.log("========================");
    
    if (!enrollmentId) {
      throw new Error("No enrollment ID provided");
    }
    
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    console.log("Delete successful:", response);
    return response;
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    throw error;
  }
};
// ✅ OPTIONAL: Keep this if you want to also support deletion by enrollment ID
// Alternative name - make sure it's consistent
export const deleteEnrollmentById = async (enrollmentId) => {
  return deleteEnrollment(enrollmentId);
};