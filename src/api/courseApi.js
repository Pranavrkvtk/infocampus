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