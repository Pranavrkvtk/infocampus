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

  // ============================================================
  // PDF EXTRACTED IMAGES (SUPTOPIC IMAGES)
  // ============================================================

  // If DB stores "/api/subtopic-images/..."
  if (path.startsWith("/api/subtopic-images/")) {
    return `${API_ROOT_URL}${path}`;
  }

  // If DB stores "api/subtopic-images/..."
  if (path.startsWith("api/subtopic-images/")) {
    return `${API_ROOT_URL}/${path}`;
  }

  // If DB stores "/subtopic-images/..." (without /api)
  if (path.startsWith("/subtopic-images/")) {
    return `${API_ROOT_URL}${path}`;
  }

  // If DB stores "subtopic-images/..."
  if (path.startsWith("subtopic-images/")) {
    return `${API_ROOT_URL}/${path}`;
  }

  // If DB stores "uploads/subtopic_images/..." (old format)
  if (path.includes("uploads/subtopic_images/")) {
    const match = path.match(/subtopic_images\/(\d+)\/(.+)$/);
    if (match) {
      const subtopicId = match[1];
      const filename = match[2];
      return `${API_ROOT_URL}/api/subtopic-images/${subtopicId}/${filename}`;
    }
  }

  // If DB stores "/uploads/subtopic_images/..." (old format)
  if (path.includes("/uploads/subtopic_images/")) {
    const match = path.match(/subtopic_images\/(\d+)\/(.+)$/);
    if (match) {
      const subtopicId = match[1];
      const filename = match[2];
      return `${API_ROOT_URL}/api/subtopic-images/${subtopicId}/${filename}`;
    }
  }

  // If DB stores "/api/admin/uploads/subtopic_..." (very old format)
  if (path.includes("/api/admin/uploads/subtopic_")) {
    const match = path.match(/subtopic_(\d+)\/images\/(.+)$/);
    if (match) {
      const subtopicId = match[1];
      const filename = match[2];
      return `${API_ROOT_URL}/api/subtopic-images/${subtopicId}/${filename}`;
    }
  }

  // ============================================================
  // COURSE IMAGES
  // ============================================================

  // If DB stores "/uploads/..." (course images)
  if (path.startsWith("/uploads/")) {
    return `${API_ROOT_URL}${path}`;
  }

  // If DB stores "uploads/..." (course images)
  if (path.startsWith("uploads/")) {
    return `${API_ROOT_URL}/${path}`;
  }

  // ============================================================
  // FALLBACK
  // ============================================================

  // Otherwise use API base
  path = path.replace(/^\/?api\//, "");
  path = path.replace(/^\/+/, "");

  return `${API_ROOT_URL}/${path}`;
};

export default getImageUrl;