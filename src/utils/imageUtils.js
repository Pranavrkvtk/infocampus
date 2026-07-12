const API_BASE_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:8082/api").replace(/\/$/, "");

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:image/")
  ) {
    return imagePath;
  }

  let path = imagePath.trim();

  // If DB stores "/uploads/..."
  if (path.startsWith("/uploads/")) {
    return `http://localhost:8082${path}`;
  }

  // If DB stores "uploads/..."
  if (path.startsWith("uploads/")) {
    return `http://localhost:8082/${path}`;
  }

  // Otherwise use API base
  path = path.replace(/^\/?api\//, "");
  path = path.replace(/^\/+/, "");

  return `${API_BASE_URL}/${path}`;
};