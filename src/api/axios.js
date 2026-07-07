// src/api/axios.js
import axios from "axios";

// ✅ Use process.env for Create React App (NOT import.meta.env — that's Vite)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

// Root origin with no /api suffix (e.g. https://backendrender-3-3pdg.onrender.com).
// Needed anywhere the app builds a direct asset URL — course images, uploaded
// document previews, markdown-embedded images — since those live outside /api.
export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');
export { API_BASE_URL };

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  // No default Content-Type header here on purpose: axios auto-sets
  // 'application/json' for plain object bodies and the correct
  // 'multipart/form-data; boundary=...' for FormData bodies. Hardcoding
  // 'application/json' as a default breaks every file upload request.
});

// Add token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;