import api from "./axios";

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

export const watchCourse = (id) => {
  return api.get(`/courses/${id}/watch`);
};