// src/api/courseApi.js
import api from "./axios";

// Course APIs
export const getCourses = () => {
  return api.get("/courses");
};

export const getCourseById = (id) => {
  return api.get(`/courses/${id}`);
};

export const deleteCourse = (id) => {
  return api.delete(`/courses/${id}`);
};

export const createCourse = (data) => {
  return api.post("/courses", data);
};

export const updateCourse = (id, data) => {
  return api.put(`/courses/${id}`, data);
};

// Enrollment APIs
export const enrollInCourse = (courseId) => {
  const userId = localStorage.getItem("userId");
  
  console.log("=== DEBUG ENROLLMENT ===");
  console.log("Course ID:", courseId);
  console.log("User ID from localStorage:", userId);
  console.log("Full URL:", `/enrollments/enroll/${courseId}/${userId}`);
  console.log("========================");
  
  if (!userId) {
    throw new Error("User not logged in. Please create a user first.");
  }

  return api.post(`/enrollments/enroll/${courseId}/${userId}`);
};

export const getUserEnrollments = (userId) => {
  const id = parseInt(userId);
  console.log("Calling API with userId:", id);
  return api.get(`/enrollments/user/${id}`);
};

export const getAllEnrollments = () => {
  return api.get("/enrollments");
};

export const watchCourse = (courseId) => {
  return api.get(`/enrollments/${courseId}/watch`);
};

export const deleteEnrollment = async (enrollmentId) => {
  try {
    console.log("=== DEBUG DELETE ENROLLMENT ===");
    console.log("Enrollment ID:", enrollmentId);
    console.log("Full URL:", `/enrollments/${enrollmentId}`);
    console.log("========================");
    
    if (!enrollmentId) {
      throw new Error("No enrollment ID provided");
    }
    
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    console.log("Delete successful:", response);
    return response;
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    throw error;
  }
};

export const deleteEnrollmentById = async (enrollmentId) => {
  return deleteEnrollment(enrollmentId);
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN COURSE MANAGEMENT APIs
// ═══════════════════════════════════════════════════════════════════════════════

// Get admin courses list
export const getAdminCourses = () => {
  return api.get('/admin/courses');
};

// ─── TOPIC APIs ───────────────────────────────────────────────────────────────
export const getCourseTopics = (courseId) => {
  return api.get(`/admin/courses/${courseId}/topics`);
};

export const createTopic = (courseId, topicData) => {
  return api.post(`/admin/courses/${courseId}/topics`, topicData);
};

export const updateTopic = (topicId, topicData) => {
  return api.put(`/admin/topics/${topicId}`, topicData);
};

export const deleteTopic = (topicId) => {
  return api.delete(`/admin/topics/${topicId}`);
};

// ─── SUBTOPIC APIs ────────────────────────────────────────────────────────────
export const createSubtopic = (topicId, subtopicData) => {
  return api.post(`/admin/topics/${topicId}/subtopics`, subtopicData);
};

export const updateSubtopic = (subtopicId, subtopicData) => {
  return api.put(`/admin/subtopics/${subtopicId}`, subtopicData);
};

export const updateSubtopicNotes = (subtopicId, notes) => {
  return api.put(`/admin/subtopics/${subtopicId}/notes`, { notes });
};

export const updateSubtopicVideo = (subtopicId, videoUrl) => {
  return api.put(`/admin/subtopics/${subtopicId}/video`, { videoUrl });
};

export const deleteSubtopic = (subtopicId) => {
  return api.delete(`/admin/subtopics/${subtopicId}`);
};

// ─── IMAGE APIs ───────────────────────────────────────────────────────────────
export const getSubtopicImages = (subtopicId) => {
  return api.get(`/admin/subtopic-images/subtopic/${subtopicId}`);
};

export const deleteImage = (imageId) => {
  return api.delete(`/admin/subtopic-images/${imageId}`);
};

// ─── INTERVIEW QUESTION APIs ──────────────────────────────────────────────────
export const createInterviewQuestion = (subtopicId, questionData) => {
  return api.post(`/admin/subtopics/${subtopicId}/interview-questions`, questionData);
};

export const updateInterviewQuestion = (questionId, questionData) => {
  return api.put(`/admin/interview-questions/${questionId}`, questionData);
};

export const deleteInterviewQuestion = (questionId) => {
  return api.delete(`/admin/interview-questions/${questionId}`);
};

// ─── EXAM QUESTION APIs ────────────────────────────────────────────────────────
export const createExamQuestion = (subtopicId, questionData) => {
  return api.post(`/admin/subtopics/${subtopicId}/exam-questions`, questionData);
};

export const updateExamQuestion = (questionId, questionData) => {
  return api.put(`/admin/exam-questions/${questionId}`, questionData);
};

export const deleteExamQuestion = (questionId) => {
  return api.delete(`/admin/exam-questions/${questionId}`);
};

// ─── LAB EXERCISE APIs ─────────────────────────────────────────────────────────
export const createLabExercise = (subtopicId, labData) => {
  return api.post(`/admin/subtopics/${subtopicId}/labs`, labData);
};

export const updateLabExercise = (labId, labData) => {
  return api.put(`/admin/labs/${labId}`, labData);
};

export const deleteLabExercise = (labId) => {
  return api.delete(`/admin/labs/${labId}`);
};

// ─── PDF Upload APIs ───────────────────────────────────────────────────────────
export const uploadPdf = async (formData) => {
  const token = localStorage.getItem('token');
  
  // For FormData, we need to use fetch directly because axios can have issues with multipart/form-data
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
  
  try {
    const response = await fetch(`${API_BASE}/admin/pdfs/upload`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }
    
    const data = await response.json();
    console.log('Upload response:', data);
    return { data };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const generateCourseStructure = async (pdfId) => {
  try {
    const response = await api.post(`/admin/pdfs/${pdfId}/generate-structure`, {});
    console.log('Generate structure response:', response.data);
    return response;
  } catch (error) {
    console.error('Generate structure error:', error);
    throw error;
  }
};

// ─── PDF IMAGE APIs ────────────────────────────────────────────────────────────
export const getPdfImages = async (pdfId) => {
  try {
    const response = await api.get(`/admin/pdfs/${pdfId}/images`);
    return response;
  } catch (error) {
    console.error('Get PDF images error:', error);
    throw error;
  }
};

// ─── COMPLETE SUBTOPIC API ─────────────────────────────────────────────────────
export const getCompleteSubtopic = async (subtopicId) => {
  try {
    const response = await api.get(`/admin/subtopics/${subtopicId}`);
    return response;
  } catch (error) {
    console.error('Get complete subtopic error:', error);
    throw error;
  }
};

// ─── ADD SAMPLE DATA HELPERS ───────────────────────────────────────────────────
export const addSampleInterviewQuestions = async (subtopicId) => {
  const sampleQuestions = [
    {
      question: "What is the OSI model and why is it important?",
      answer: "The OSI (Open Systems Interconnection) model is a conceptual framework that standardizes the functions of a telecommunication or computing system into seven layers. It's important because it helps network professionals understand how different network protocols interact and work together."
    },
    {
      question: "Explain the difference between TCP and UDP.",
      answer: "TCP is connection-oriented, reliable, and guarantees delivery with sequence numbers and acknowledgments. UDP is connectionless, faster, but does not guarantee delivery. TCP is used for HTTP, FTP, email. UDP is used for streaming, DNS, VoIP."
    }
  ];
  
  for (const q of sampleQuestions) {
    await createInterviewQuestion(subtopicId, q);
  }
};

export const addSampleExamQuestions = async (subtopicId) => {
  const sampleQuestions = [
    {
      question: "Which layer of the OSI model is responsible for routing?",
      optionA: "Layer 1 - Physical",
      optionB: "Layer 2 - Data Link",
      optionC: "Layer 3 - Network",
      optionD: "Layer 4 - Transport",
      correctAnswer: "C"
    },
    {
      question: "What does the acronym TCP stand for?",
      optionA: "Transmission Control Protocol",
      optionB: "Transfer Control Protocol",
      optionC: "Transport Communication Protocol",
      optionD: "Transmission Connection Protocol",
      correctAnswer: "A"
    }
  ];
  
  for (const q of sampleQuestions) {
    await createExamQuestion(subtopicId, q);
  }
};

export const addSampleLabExercises = async (subtopicId) => {
  const sampleLabs = [
    {
      title: "OSI Model Layer Identification Lab",
      instructions: "1. Open a web browser\n2. Navigate to any website\n3. Open Developer Tools (F12)\n4. Identify which OSI layers are involved in the process\n5. Document each layer's role in the network communication\n6. Submit your findings"
    },
    {
      title: "Protocol Analysis with Wireshark",
      instructions: "1. Install Wireshark on your computer\n2. Start a packet capture\n3. Visit a website\n4. Stop the capture\n5. Identify TCP and UDP packets\n6. Analyze the three-way handshake\n7. Write a report on your findings"
    }
  ];
  
  for (const lab of sampleLabs) {
    await createLabExercise(subtopicId, lab);
  }
};

export const addAllSampleData = async (subtopicId) => {
  await addSampleInterviewQuestions(subtopicId);
  await addSampleExamQuestions(subtopicId);
  await addSampleLabExercises(subtopicId);
};