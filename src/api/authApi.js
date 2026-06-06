import api from "./axios";

export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

export const loginUser = (loginData) => {
  return api.post("/auth/login", loginData).then((response) => {
    // Store the token and user data after successful login
    const { token, userId, role, name } = response.data;
    
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);
      
      console.log("Login successful - Data stored:", {
        tokenExists: !!token,
        userId: userId,
        role: role,
        name: name
      });
    }
    
    return response;
  });
};

// Add this to authApi.js
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  window.location.href = "/login";
};

// Optional: Check if user is logged in
export const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  return !!(token && userId);
};

// Optional: Get current user info
export const getCurrentUser = () => {
  return {
    userId: localStorage.getItem("userId"),
    role: localStorage.getItem("role"),
    name: localStorage.getItem("name"),
    isAuthenticated: !!localStorage.getItem("token")
  };
};