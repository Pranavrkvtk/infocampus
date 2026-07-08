// src/utils/imageUtils.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove any duplicate /api prefix and leading slashes
  let cleanPath = imagePath;
  
  // Remove /api/ prefix if present
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4); // Remove '/api'
  }
  
  // Remove /api prefix if present
  if (cleanPath.startsWith('api/')) {
    cleanPath = cleanPath.substring(3); // Remove 'api/'
  }
  
  // Remove any leading slashes
  while (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Ensure path starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Return the full URL without duplicating /api
  return `${API_BASE_URL}${cleanPath}`;
};

export const getApiUrl = (endpoint) => {
  // Remove any duplicate /api prefix
  let cleanEndpoint = endpoint;
  
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }
  
  if (cleanEndpoint.startsWith('api/')) {
    cleanEndpoint = cleanEndpoint.substring(3);
  }
  
  // Remove any leading slashes
  while (cleanEndpoint.startsWith('/')) {
    cleanEndpoint = cleanEndpoint.substring(1);
  }
  
  // Ensure it starts with /
  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = '/' + cleanEndpoint;
  }
  
  return cleanEndpoint;
};

// Add a function to clean course image paths
export const getCourseImageUrl = (course) => {
  if (!course) return null;
  
  // Try different possible image fields
  const imagePath = course.imagePath || course.imageUrl || course.image || course.thumbnail || course.thumbnailUrl;
  
  if (!imagePath) return null;
  
  return getImageUrl(imagePath);
};

// Add a fallback image URL
export const getFallbackImage = () => {
  return '/default-course-image.jpg';
};

// Add a function to handle image loading errors
export const handleImageError = (e) => {
  e.target.src = getFallbackImage();
  e.target.onerror = null; // Prevent infinite loop
};