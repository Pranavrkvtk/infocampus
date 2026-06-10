// ✅ Correct import - both files are in the same 'api' folder
import api from "./axios";

export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

export const loginUser = (loginData) => {
  return api.post("/auth/login", loginData).then((response) => {
    const { token, userId, role, name } = response.data;
    
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);
      
      console.log("Login successful:", { userId, role, name });
    }
    
    return response;
  });
};

export const logoutUser = () => {
  localStorage.clear();
  window.location.href = "/login";
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

export const getCurrentUser = () => {
  return {
    userId: localStorage.getItem("userId"),
    role: localStorage.getItem("role"),
    name: localStorage.getItem("name"),
    isAuthenticated: !!localStorage.getItem("token")
  };
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  isLoggedIn,
  getCurrentUser
};