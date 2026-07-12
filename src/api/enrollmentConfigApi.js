// src/api/enrollmentConfigApi.js
import api from './axios';

// ============ PUBLIC ENDPOINTS ============
export const getPublicEnrollmentConfig = async (courseId) => {
  try {
    if (!courseId || courseId === 'undefined' || isNaN(courseId)) {
      console.warn('Invalid course ID:', courseId);
      return getDefaultConfig();
    }
    
    const response = await api.get(`/enrollment-config/public/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment config:', error);
    return getDefaultConfig();
  }
};

// ============ ADMIN ENDPOINTS ============
export const createEnrollmentConfig = async (configData) => {
  try {
    const response = await api.post('/enrollment-config/admin', configData);
    return response.data;
  } catch (error) {
    console.error('Error creating enrollment config:', error);
    throw error;
  }
};

export const updateEnrollmentConfig = async (courseId, configData) => {
  try {
    const response = await api.put(`/enrollment-config/admin/${courseId}`, configData);
    return response.data;
  } catch (error) {
    console.error('Error updating enrollment config:', error);
    throw error;
  }
};

export const getAllEnrollmentConfigs = async () => {
  try {
    const response = await api.get('/enrollment-config/admin/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all configs:', error);
    throw error;
  }
};

export const getEnrollmentConfigById = async (courseId) => {
  try {
    if (!courseId || courseId === 'undefined' || isNaN(courseId)) {
      console.warn('Invalid course ID:', courseId);
      throw new Error('Invalid course ID');
    }
    
    const response = await api.get(`/enrollment-config/admin/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching config by ID:', error);
    throw error;
  }
};

export const deleteEnrollmentConfig = async (courseId) => {
  try {
    const response = await api.delete(`/enrollment-config/admin/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting enrollment config:', error);
    throw error;
  }
};

export const getDefaultEnrollmentConfig = async (courseId) => {
  try {
    const response = await api.get(`/enrollment-config/admin/default/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching default config:', error);
    return getDefaultConfig();
  }
};

// ============ LOCAL DEFAULT CONFIG ============
export const getDefaultConfig = () => {
  return {
    joinButtonText: "Join This Course",
    shareButtonText: "Share",
    primaryColor: "#3abf94",
    secondaryColor: "#1a1a2e",
    descriptionTitle: "About This Course",
    lessonsTitle: "Course Content",
    showRating: true,
    showMembers: true,
    showLastUpdate: true,
    customCss: "",
    layoutStyle: "default"
  };
};