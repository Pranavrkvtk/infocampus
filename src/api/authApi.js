// src/api/authApi.js
import api from "./axios";

// ==================== AUTHENTICATION APIs ====================

// Register a new user
export const register = (userData) => {
  return api.post("/auth/register", userData);
};

// ✅ FIXED: Login user with proper data storage
export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    
    console.log('🔍 Login Response:', response.data);
    
    const data = response.data;
    
    // ✅ Store token
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    
    // ✅ Store individual fields
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
    
    // ✅ CRITICAL: Store complete user object with role
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

// ✅ FIXED: Logout user with complete cleanup
export const logout = () => {
  // ✅ Clear all auth-related items
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userStatus");
  localStorage.removeItem("user"); // ✅ Important: Remove the user object
  
  // ✅ Optional: Clear other app-specific items if needed
  // localStorage.removeItem("recentColors");
  // localStorage.removeItem("myCoursesConfig");
  // localStorage.removeItem("homeConfig");
  
  return api.post("/auth/logout").catch(() => {
    // Ignore logout endpoint errors - just clear local storage
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

// ✅ NEW: Get full user object
export const getUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// ✅ NEW: Get user name
export const getUserName = () => {
  return localStorage.getItem("userName") || "User";
};

// ✅ NEW: Get user email
export const getUserEmail = () => {
  return localStorage.getItem("userEmail") || "";
};

// ✅ NEW: Update user in localStorage
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

// ✅ NEW: Check if user has specific role
export const hasRole = (role) => {
  const userRole = localStorage.getItem("role");
  if (!userRole) return false;
  return userRole.toUpperCase() === role.toUpperCase();
};

// ✅ NEW: Check if user is admin
export const isAdmin = () => {
  const role = localStorage.getItem("role");
  return role === "ADMIN" || role === "SUPER_ADMIN";
};

// ✅ NEW: Check if user is instructor
export const isInstructor = () => {
  const role = localStorage.getItem("role");
  return role === "INSTRUCTOR";
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
  getUser,           // ✅ Added
  getUserName,       // ✅ Added
  getUserEmail,      // ✅ Added
  updateUser,        // ✅ Added
  hasRole,           // ✅ Added
  isAdmin,           // ✅ Added
  isInstructor,      // ✅ Added
};

export default authApi;