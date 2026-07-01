// src/api/instructorApi.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock data for testing (remove when backend is ready)
const mockStudents = [
  { id: 1, name: "John Doe", email: "john@example.com", enrolledCourses: 2, progress: 75, status: "ACTIVE" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", enrolledCourses: 1, progress: 45, status: "ACTIVE" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", enrolledCourses: 3, progress: 90, status: "ACTIVE" },
  { id: 4, name: "Sarah Williams", email: "sarah@example.com", enrolledCourses: 2, progress: 30, status: "INACTIVE" },
  { id: 5, name: "David Brown", email: "david@example.com", enrolledCourses: 1, progress: 60, status: "ACTIVE" },
];

const mockCourses = [
  { id: 1, title: "React Basics", price: 49, status: "PUBLISHED", level: "Beginner", studentCount: 45, description: "Learn React from scratch" },
  { id: 2, title: "Advanced JavaScript", price: 79, status: "PUBLISHED", level: "Advanced", studentCount: 32, description: "Master JavaScript concepts" },
  { id: 3, title: "Python for Beginners", price: 39, status: "DRAFT", level: "Beginner", studentCount: 0, description: "Introduction to Python" },
  { id: 4, title: "Web Design Fundamentals", price: 59, status: "PUBLISHED", level: "Intermediate", studentCount: 28, description: "Learn HTML, CSS, and design principles" },
  { id: 5, title: "Node.js Backend", price: 89, status: "DRAFT", level: "Advanced", studentCount: 0, description: "Build REST APIs with Node.js" },
];

const mockStats = {
  totalStudents: 156,
  totalCourses: 8,
  totalEnrollments: 234,
  activeStudents: 45,
};

// ===================== DASHBOARD STATS =====================
export const getInstructorDashboardStats = async () => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockStats });
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.get("/instructor/dashboard/stats");
    // return response;
  } catch (error) {
    console.error("Error fetching instructor dashboard stats:", error);
    throw error;
  }
};

// ===================== COURSES =====================
export const getInstructorCourses = async () => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockCourses });
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.get("/instructor/courses");
    // return response;
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    throw error;
  }
};

export const createInstructorCourse = async (courseData) => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCourse = {
          id: mockCourses.length + 1,
          ...courseData,
          studentCount: 0,
          status: "DRAFT",
        };
        mockCourses.push(newCourse);
        resolve({ data: newCourse });
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.post("/instructor/courses", courseData);
    // return response;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
};

export const updateInstructorCourse = async (courseId, courseData) => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCourses.findIndex(c => c.id === courseId);
        if (index !== -1) {
          mockCourses[index] = { ...mockCourses[index], ...courseData };
          resolve({ data: mockCourses[index] });
        } else {
          reject(new Error("Course not found"));
        }
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.put(`/instructor/courses/${courseId}`, courseData);
    // return response;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

export const deleteInstructorCourse = async (courseId) => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCourses.findIndex(c => c.id === courseId);
        if (index !== -1) {
          mockCourses.splice(index, 1);
          resolve({ data: { success: true } });
        } else {
          reject(new Error("Course not found"));
        }
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.delete(`/instructor/courses/${courseId}`);
    // return response;
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

export const getInstructorCourseDetails = async (courseId) => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const course = mockCourses.find(c => c.id === courseId);
        if (course) {
          resolve({ data: course });
        } else {
          reject(new Error("Course not found"));
        }
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.get(`/instructor/courses/${courseId}`);
    // return response;
  } catch (error) {
    console.error("Error fetching course details:", error);
    throw error;
  }
};

// ===================== STUDENTS =====================
export const getInstructorStudents = async () => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockStudents });
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.get("/instructor/students");
    // return response;
  } catch (error) {
    console.error("Error fetching instructor students:", error);
    throw error;
  }
};

export const searchInstructorStudentsByName = async (name) => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockStudents.filter(s => 
          s.name.toLowerCase().includes(name.toLowerCase()) ||
          s.email.toLowerCase().includes(name.toLowerCase())
        );
        resolve({ data: filtered });
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.get(`/instructor/students/search?name=${encodeURIComponent(name)}`);
    // return response;
  } catch (error) {
    console.error("Error searching students:", error);
    throw error;
  }
};

export const getInstructorStudentDetails = async (studentId) => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const student = mockStudents.find(s => s.id === studentId);
        if (student) {
          resolve({ data: student });
        } else {
          reject(new Error("Student not found"));
        }
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.get(`/instructor/students/${studentId}`);
    // return response;
  } catch (error) {
    console.error("Error fetching student details:", error);
    throw error;
  }
};

// ===================== VIDEO =====================
export const getInstructorHomeVideo = async () => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { videoUrl: "" } });
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.get("/instructor/video");
    // return response;
  } catch (error) {
    console.error("Error fetching home video:", error);
    throw error;
  }
};

export const updateInstructorHomeVideoUrl = async (videoUrl) => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { videoUrl } });
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.put("/instructor/video", { videoUrl });
    // return response;
  } catch (error) {
    console.error("Error updating video URL:", error);
    throw error;
  }
};

// ===================== ENROLLMENTS =====================
export const getInstructorEnrollments = async () => {
  try {
    // Comment this out when backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: [] });
      }, 500);
    });
    
    // Uncomment when backend is ready
    // const response = await api.get("/instructor/enrollments");
    // return response;
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    throw error;
  }
};

export const updateInstructorEnrollmentStatus = async (enrollmentId, status) => {
  try {
    // Uncomment when backend is ready
    // const response = await api.put(`/instructor/enrollments/${enrollmentId}`, { status });
    // return response;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true } });
      }, 500);
    });
  } catch (error) {
    console.error("Error updating enrollment status:", error);
    throw error;
  }
};

// ===================== PROGRESS =====================
export const getInstructorStudentProgress = async (studentId) => {
  try {
    // Uncomment when backend is ready
    // const response = await api.get(`/instructor/progress/${studentId}`);
    // return response;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { progress: 75 } });
      }, 500);
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    throw error;
  }
};

export const updateInstructorStudentProgress = async (studentId, progressData) => {
  try {
    // Uncomment when backend is ready
    // const response = await api.put(`/instructor/progress/${studentId}`, progressData);
    // return response;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true } });
      }, 500);
    });
  } catch (error) {
    console.error("Error updating student progress:", error);
    throw error;
  }
};

// ===================== ANALYTICS =====================
export const getInstructorAnalytics = async () => {
  try {
    // Uncomment when backend is ready
    // const response = await api.get("/instructor/analytics");
    // return response;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { revenue: 12450, enrollments: 234 } });
      }, 500);
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
};

export const getInstructorRevenueStats = async () => {
  try {
    // Uncomment when backend is ready
    // const response = await api.get("/instructor/revenue");
    // return response;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { total: 12450, monthly: 1250 } });
      }, 500);
    });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    throw error;
  }
};