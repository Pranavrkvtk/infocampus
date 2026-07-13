// src/utils/imageUtils.js
import { API_ROOT_URL } from '../api/axios';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL with http/https or data URL
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:image/")
  ) {
    return imagePath;
  }

  let path = imagePath.trim();

  // ✅ Remove leading slash if present (fix for existing data)
  if (path.startsWith('/')) {
    path = path.substring(1);
  }

  // ✅ Remove any /api/ prefix if present
  if (path.startsWith('api/')) {
    path = path.substring(4);
  }

  // ✅ Remove any /admin/ prefix if present
  if (path.startsWith('admin/')) {
    path = path.substring(6);
  }

  // If it already has the correct format (uploads/ or subtopic-images/)
  if (path.startsWith('uploads/') || path.startsWith('subtopic-images/')) {
    return `${API_ROOT_URL}/${path}`;
  }

  // If it's just a filename, assume it's in uploads/courses/
  if (!path.includes('/') && path.includes('.')) {
    return `${API_ROOT_URL}/uploads/courses/${path}`;
  }

  // Fallback: assume it's in uploads/
  return `${API_ROOT_URL}/uploads/${path}`;
};

export default getImageUrl;