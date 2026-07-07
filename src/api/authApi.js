// src/api/authApi.js
import api from "./axios";

// ==================== AUTHENTICATION APIs ====================

// Register a new user
export const register = (userData) => {
  return api.post("/auth/register", userData);
};

// Login user
export const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

// Logout user
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  return api.post("/auth/logout");
};

// Get current user profile
export const getCurrentUser = () => {
  return api.get("/auth/me");
};

// Update user profile
export const updateProfile = (userData) => {
  return api.put("/auth/profile", userData);
};

// Change password
export const changePassword = (passwordData) => {
  return api.put("/auth/change-password", passwordData);
};

// Request password reset
export const requestPasswordReset = (email) => {
  return api.post("/auth/request-password-reset", { email });
};

// Reset password with token
export const resetPassword = (token, newPassword) => {
  return api.post(`/auth/reset-password/${token}`, { newPassword });
};

// Verify email
export const verifyEmail = (token) => {
  return api.get(`/auth/verify-email/${token}`);
};

// Refresh token
export const refreshToken = () => {
  return api.post("/auth/refresh-token");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Get user role
export const getUserRole = () => {
  return localStorage.getItem("role");
};

// Get user ID
export const getUserId = () => {
  return localStorage.getItem("userId");
};

// ==================== EXPORT ALL ====================

const authApi = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  refreshToken,
  isAuthenticated,
  getUserRole,
  getUserId,
};

export default authApi;