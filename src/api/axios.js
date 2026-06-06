// axios.js
import axios from "axios";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Important: Use the exact format your backend expects
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url} - Token added`);
    } else {
      console.warn(`[API Request] ${config.method.toUpperCase()} ${config.url} - No token found`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Token expired or invalid. Please login again.");
      // Clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      console.error("You don't have permission to access this resource.");
    }
    return Promise.reject(error);
  }
);

export default api;