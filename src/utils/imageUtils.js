// src/utils/imageUtils.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove any duplicate /api prefix
  let cleanPath = imagePath;
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4); // Remove '/api'
  }
  
  // Ensure it starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  return `${API_BASE_URL}/api${cleanPath}`;
};

export const getApiUrl = (endpoint) => {
  // Remove any duplicate /api prefix
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }
  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = '/' + cleanEndpoint;
  }
  return cleanEndpoint;
};