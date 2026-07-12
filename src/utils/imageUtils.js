const API_BASE_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:8082/api").replace(/\/$/, "");

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

  // ✅ FIX: If DB stores "/api/subtopic-images/..." - keep as is
  if (path.startsWith("/api/subtopic-images/")) {
    return `${API_BASE_URL}${path.replace("/api", "")}`;
  }

  // ✅ FIX: If DB stores "api/subtopic-images/..." 
  if (path.startsWith("api/subtopic-images/")) {
    return `${API_BASE_URL}/${path}`;
  }

  // ✅ FIX: If DB stores "/subtopic-images/..." (without /api)
  if (path.startsWith("/subtopic-images/")) {
    return `${API_BASE_URL}${path}`;
  }

  // ✅ FIX: If DB stores "subtopic-images/..."
  if (path.startsWith("subtopic-images/")) {
    return `${API_BASE_URL}/${path}`;
  }

  // ✅ FIX: If DB stores "uploads/subtopic_images/..."
  if (path.includes("uploads/subtopic_images/")) {
    // Convert to /api/subtopic-images/{subtopicId}/{filename}
    const match = path.match(/subtopic_images\/(\d+)\/(.+)$/);
    if (match) {
      const subtopicId = match[1];
      const filename = match[2];
      return `${API_BASE_URL}/subtopic-images/${subtopicId}/${filename}`;
    }
  }

  // ✅ FIX: If DB stores "/uploads/subtopic_images/..."
  if (path.includes("/uploads/subtopic_images/")) {
    const match = path.match(/subtopic_images\/(\d+)\/(.+)$/);
    if (match) {
      const subtopicId = match[1];
      const filename = match[2];
      return `${API_BASE_URL}/subtopic-images/${subtopicId}/${filename}`;
    }
  }

  // ✅ FIX: If DB stores "/uploads/..." (course images)
  if (path.startsWith("/uploads/")) {
    return `http://localhost:8082${path}`;
  }

  // ✅ FIX: If DB stores "uploads/..." (course images)
  if (path.startsWith("uploads/")) {
    return `http://localhost:8082/${path}`;
  }

  // ✅ FIX: If DB stores "/api/admin/uploads/subtopic_..." (old format)
  if (path.includes("/api/admin/uploads/subtopic_")) {
    const match = path.match(/subtopic_(\d+)\/images\/(.+)$/);
    if (match) {
      const subtopicId = match[1];
      const filename = match[2];
      return `${API_BASE_URL}/subtopic-images/${subtopicId}/${filename}`;
    }
  }

  // Otherwise use API base
  path = path.replace(/^\/?api\//, "");
  path = path.replace(/^\/+/, "");

  return `${API_BASE_URL}/${path}`;
};

export default getImageUrl;