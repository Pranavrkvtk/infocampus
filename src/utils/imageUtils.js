// src/utils/imageUtils.js

const API_BASE_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:8082/api").replace(/\/$/, "");

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Already full URL
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:image/")
  ) {
    return imagePath;
  }

  let path = imagePath.trim();

  // Remove duplicate prefixes
  path = path.replace(/^\/?api\//, "");
  path = path.replace(/^\/+/, "");

  // uploads/...  -> admin/uploads/...
  if (path.startsWith("uploads/")) {
    path = "admin/" + path;
  }

  // admin/uploads/... -> keep
  else if (path.startsWith("admin/uploads/")) {
    // do nothing
  }

  // /uploads/... -> admin/uploads/...
  else if (imagePath.startsWith("/uploads/")) {
    path = "admin/" + imagePath.replace(/^\/+/, "");
  }

  // api/admin/... -> admin/...
  else if (path.startsWith("api/admin/")) {
    path = path.replace(/^api\//, "");
  }

  return `${API_BASE_URL}/${path}`;
};

export const getApiUrl = (endpoint = "") => {
  if (!endpoint) return API_BASE_URL;

  let path = endpoint.trim();

  path = path.replace(/^\/?api\//, "");
  path = path.replace(/^\/+/, "");

  return `${API_BASE_URL}/${path}`;
};

export const getCourseImageUrl = (course) => {
  if (!course) return null;

  const image =
    course.imageUrl ||
    course.imagePath ||
    course.image ||
    course.thumbnail ||
    course.thumbnailUrl;

  return getImageUrl(image);
};

export const getFallbackImage = () =>
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23eeeeee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

export const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = getFallbackImage();
};

export default getImageUrl;