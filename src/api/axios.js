// src/api/axios.js
import axios from "axios";

// ✅ Get API URL from environment, with fallback for local development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,  // Note: /api is appended here
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

export default api;