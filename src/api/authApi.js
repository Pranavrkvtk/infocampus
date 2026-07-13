// src/api/authApi.js
import api, { API_ROOT_URL } from "./axios";

// ==================== AUTHENTICATION APIs ====================

// Register a new user
export const register = (userData) => {
  return api.post("/auth/register", userData);
};

// Login user with proper data storage
export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    
    console.log('🔍 Login Response:', response.data);
    
    const data = response.data;
    
    // Store token
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    // Store individual fields
    const role = data.role || "USER";
    const userId = data.userId || data.id;
    const name = data.name || "User";
    const email = data.email || credentials.email;
    const status = data.status || "ACTIVE";
    
    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userStatus", status);
    
    // Store complete user object with role
    const userData = {
      id: userId,
      userId: userId,
      email: email,
      name: name,
      role: role,
      status: status,
      token: data.token
    };
    
    localStorage.setItem("user", JSON.stringify(userData));
    
    console.log('✅ User data stored:', userData);
    console.log('✅ Role stored:', localStorage.getItem('role'));
    console.log('✅ User object:', JSON.parse(localStorage.getItem('user')));
    
    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

// Logout user with complete cleanup
export const logout = () => {
  // Clear all auth-related items
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userStatus");
  localStorage.removeItem("user");
  
  return api.post("/auth/logout").catch(() => {
    console.log("Logout successful (local)");
  });
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

// ==================== AUTH STATE HELPERS ====================

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

// Get full user object
export const getUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Get user name
export const getUserName = () => {
  return localStorage.getItem("userName") || "User";
};

// Get user email
export const getUserEmail = () => {
  return localStorage.getItem("userEmail") || "";
};

// Update user in localStorage
export const updateUser = (userData) => {
  const currentUser = getUser() || {};
  const updatedUser = { ...currentUser, ...userData };
  localStorage.setItem("user", JSON.stringify(updatedUser));
  
  // Update individual fields
  if (userData.role) localStorage.setItem("role", userData.role);
  if (userData.name) localStorage.setItem("userName", userData.name);
  if (userData.email) localStorage.setItem("userEmail", userData.email);
  if (userData.status) localStorage.setItem("userStatus", userData.status);
  
  return updatedUser;
};

// Check if user has specific role
export const hasRole = (role) => {
  const userRole = localStorage.getItem("role");
  if (!userRole) return false;
  return userRole.toUpperCase() === role.toUpperCase();
};

// Check if user is admin
export const isAdmin = () => {
  const role = localStorage.getItem("role");
  return role === "ADMIN" || role === "SUPER_ADMIN";
};

// Check if user is instructor
export const isInstructor = () => {
  const role = localStorage.getItem("role");
  return role === "INSTRUCTOR";
};

// ==================== ASSET URL HELPERS (using API_ROOT_URL) ====================

// Generic asset URL builder
export const getAssetUrl = (path) => {
  if (!path) return null;
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_ROOT_URL}/${cleanPath}`;
};

// Get profile image URL
export const getProfileImageUrl = (filename) => {
  if (!filename) return null;
  return getAssetUrl(`uploads/profile/${filename}`);
};

// Get course image URL
export const getCourseImageUrl = (filename) => {
  if (!filename) return null;
  return getAssetUrl(`uploads/courses/${filename}`);
};

// Get document URL
export const getDocumentUrl = (filename) => {
  if (!filename) return null;
  return getAssetUrl(`uploads/documents/${filename}`);
};

// Get redirect URL (for OAuth, etc.)
export const getRedirectUrl = (path) => {
  return getAssetUrl(path);
};

// ==================== EXPORT ALL ====================

const authApi = {
  // Auth functions
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
  
  // Auth state helpers
  isAuthenticated,
  getUserRole,
  getUserId,
  getUser,
  getUserName,
  getUserEmail,
  updateUser,
  hasRole,
  isAdmin,
  isInstructor,
  
  // Asset URL helpers
  getAssetUrl,
  getProfileImageUrl,
  getCourseImageUrl,
  getDocumentUrl,
  getRedirectUrl,
};

export default authApi;