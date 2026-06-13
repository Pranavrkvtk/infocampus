// src/components/CourseViewTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  getPdfImages, 
  getCourseTopics,
  getCompleteSubtopic,
  generateCourseStructure, 
  updateSubtopicContent,
  updateSubtopicVideo,
  addInterviewQuestion,
  updateInterviewQuestion,
  deleteInterviewQuestion,
  addExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
  addLabExercise,
  updateLabExercise,
  deleteLabExercise
} from '../api/pdfApi';
import Swal from 'sweetalert2';

// Add API helpers here
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const api = {
  get: (url) => fetch(`${API_BASE}${url}`, { headers: authHeaders() }).then(r => r.json()),
  post: (url, body) => fetch(`${API_BASE}${url}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  put: (url, body) => fetch(`${API_BASE}${url}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  delete: (url) => fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: authHeaders() }).then(r => r.json()),
};

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

// Modern color palette
const colors = {
  primary: '#0066CC',
  primaryDark: '#004C99',
  secondary: '#00A86B',
  accent: '#FF6B35',
  dark: '#1A1A2E',
  light: '#F8FAFC',
  gray: '#64748B',
  grayLight: '#E2E8F0',
  white: '#FFFFFF',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  purple: '#8B5CF6',
};

const styles = {
  container: {
    background: colors.light,
    minHeight: '100vh',
  },
  header: {
    background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primaryDark} 100%)`,
    color: colors.white,
    padding: '40px 48px',
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: colors.white,
    cursor: 'pointer',
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    transition: 'all 0.3s',
  },
  courseTitle: {
    fontSize: '42px',
    fontWeight: '800',
    marginBottom: '12px',
    letterSpacing: '-0.02em',
  },
  courseBadge: {
    display: 'inline-block',
    background: colors.accent,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  statsRow: {
    display: 'flex',
    gap: '32px',
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    opacity: 0.9,
  },
  progressSection: {
    marginTop: '24px',
    maxWidth: '400px',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '8px',
  },
  progressBar: {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    height: '8px',
    overflow: 'hidden',
  },
  progressFill: {
    background: colors.secondary,
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.3s',
  },
  toolbar: {
    background: colors.white,
    borderBottom: `1px solid ${colors.grayLight}`,
    padding: '16px 48px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  btn: (bg, color = colors.white) => ({
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    background: bg,
    color: color,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  }),
  layout: {
    display: 'flex',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 280px)',
  },
  sidebar: {
    width: '320px',
    background: colors.white,
    borderRight: `1px solid ${colors.grayLight}`,
    overflowY: 'auto',
    height: 'calc(100vh - 220px)',
    position: 'sticky',
    top: '72px',
  },
  contentArea: {
    flex: 1,
    padding: '32px 48px',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 220px)',
    background: colors.light,
  },
  topicItem: {
    borderBottom: `1px solid ${colors.grayLight}`,
  },
  topicHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: colors.white,
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: '600',
    color: colors.dark,
    transition: 'all 0.2s',
  },
  topicHeaderActive: {
    background: `linear-gradient(90deg, ${colors.primary}10, transparent)`,
    borderLeft: `3px solid ${colors.primary}`,
  },
  subtopicList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    background: colors.light,
  },
  subtopicItem: {
    padding: '12px 20px 12px 40px',
    cursor: 'pointer',
    fontSize: '13px',
    color: colors.gray,
    borderTop: `1px solid ${colors.grayLight}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  subtopicItemActive: {
    background: `linear-gradient(90deg, ${colors.primary}15, transparent)`,
    color: colors.primary,
    fontWeight: '600',
  },
  completedIcon: {
    color: colors.success,
    fontSize: '14px',
  },
  contentCard: {
    background: colors.white,
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  contentHeader: {
    padding: '24px 32px',
    borderBottom: `1px solid ${colors.grayLight}`,
    background: colors.white,
  },
  breadcrumb: {
    fontSize: '12px',
    color: colors.gray,
    marginBottom: '8px',
  },
  lessonTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.dark,
  },
  completionBadge: {
    display: 'inline-block',
    background: `${colors.success}15`,
    color: colors.success,
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '12px',
  },
  tabsContainer: {
    display: 'flex',
    gap: '4px',
    padding: '0 32px',
    background: colors.white,
    borderBottom: `1px solid ${colors.grayLight}`,
    flexWrap: 'wrap',
  },
  tab: (active) => ({
    padding: '14px 24px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? '600' : '500',
    color: active ? colors.primary : colors.gray,
    borderBottom: active ? `2px solid ${colors.primary}` : '2px solid transparent',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  tabContent: {
    padding: '32px',
  },
  notesContent: {
    background: colors.light,
    padding: '24px',
    borderRadius: '12px',
    lineHeight: '1.8',
    fontSize: '15px',
    color: colors.dark,
    whiteSpace: 'pre-wrap',
  },
  editButton: {
    background: colors.primary,
    color: colors.white,
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  videoContainer: {
    position: 'relative',
    paddingBottom: '56.25%',
    height: 0,
    overflow: 'hidden',
    borderRadius: '12px',
    marginTop: '16px',
  },
  videoIframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  questionCard: {
    background: colors.light,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  },
  questionText: {
    fontSize: '16px',
    fontWeight: '600',
    color: colors.dark,
    marginBottom: '12px',
  },
  optionsList: {
    display: 'grid',
    gap: '8px',
    marginTop: '12px',
  },
  optionItem: {
    padding: '8px 12px',
    background: colors.white,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  correctBadge: {
    background: colors.success,
    color: colors.white,
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  labStep: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    padding: '16px',
    background: colors.light,
    borderRadius: '12px',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    background: colors.primary,
    color: colors.white,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    flexShrink: 0,
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  },
  imageCard: {
    background: colors.light,
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: colors.gray,
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: colors.white,
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    padding: '24px',
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${colors.grayLight}`,
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid ${colors.grayLight}`,
    fontSize: '14px',
    marginBottom: '12px',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  addButton: {
    background: colors.secondary,
    color: colors.white,
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.gray,
    fontSize: '16px',
    padding: '4px 8px',
  },
};

const CourseViewTab = ({ pdf, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [activeView, setActiveView] = useState('notes');
  const [progress, setProgress] = useState(0);
  const [courseStructure, setCourseStructure] = useState(null);
  const [openTopicId, setOpenTopicId] = useState(null);
  const [activeSubtopicId, setActiveSubtopicId] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [pdfData, setPdfData] = useState(pdf);
  const [videoUrl, setVideoUrl] = useState('');
  const [editingVideo, setEditingVideo] = useState(false);
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [showAddLab, setShowAddLab] = useState(false);
  const [newInterview, setNewInterview] = useState({ question: '', answer: '' });
  const [newExam, setNewExam] = useState({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
  const [newLab, setNewLab] = useState({ title: '', instructions: '' });
  const [subtopicDataCache, setSubtopicDataCache] = useState({});
  const contentRef = useRef(null);

  const getBaseUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
  
  // Fixed: Updated to serve images from file system
  const getImageUrl = (imagePath) => {
    if (!imagePath) return FALLBACK_IMAGE;
    // Extract filename from path (e.g., "/uploads/images/page_123.png" -> "page_123.png")
    const filename = imagePath.split('/').pop();
    return `${getBaseUrl()}/admin/images/${filename}`;
  };
  
  const getImageSrc = (image) => {
    if (!image) return FALLBACK_IMAGE;
    const url = getImageUrl(image.imagePath);
    return imageErrors[url] ? FALLBACK_IMAGE : url;
  };
  
  const handleImageError = (imagePath) => { 
    if (!imageErrors[imagePath]) {
      setImageErrors(prev => ({ ...prev, [imagePath]: true }));
    }
  };

  const normalizeCourseStructure = (data) => {
    if (!data) return null;
    
    const topicsArray = Array.isArray(data) ? data : [];
    if (topicsArray.length === 0) return null;
    
    return {
      topics: topicsArray.map(topic => ({
        id: topic.id,
        title: topic.title,
        displayOrder: topic.displayOrder,
        subtopics: (topic.subTopics || topic.subtopics || []).map(sub => ({
          id: sub.id,
          title: sub.title,
          content: sub.content || sub.notes || '',
          videoUrl: sub.videoUrl || '',
          displayOrder: sub.displayOrder || 0,
          interviewQuestions: sub.interviewQuestions || [],
          examQuestions: sub.examQuestions || [],
          labExercises: sub.labExercises || [],
          images: sub.images || []
        }))
      }))
    };
  };
  
  // Load detailed subtopic content with caching
  const loadSubtopicDetails = async (subtopicId) => {
    if (!subtopicId) return null;
    
    if (subtopicDataCache[subtopicId]) {
      console.log("Using cached data for subtopic:", subtopicId);
      return subtopicDataCache[subtopicId];
    }
    
    try {
      const response = await getCompleteSubtopic(subtopicId);
      console.log("Subtopic details loaded:", response.data);
      
      // Fetch images for this subtopic
      const imagesResponse = await api.get(`/subtopic-images/subtopic/${subtopicId}`);
      const images = Array.isArray(imagesResponse) ? imagesResponse : [];
      
      const subtopicData = {
        ...response.data,
        images: images
      };
      
      setSubtopicDataCache(prev => ({ ...prev, [subtopicId]: subtopicData }));
      return subtopicData;
    } catch (error) {
      console.error("Error loading subtopic details:", error);
      return null;
    }
  };

  // Handle subtopic click - loads detailed data
  const handleSubtopicClick = async (topicId, subtopicId) => {
    setOpenTopicId(topicId);
    setActiveSubtopicId(subtopicId);
    
    const details = await loadSubtopicDetails(subtopicId);
    if (details) {
      setCourseStructure(prev => {
        if (!prev) return prev;
        const newTopics = prev.topics.map(topic => {
          if (topic.id === topicId) {
            return {
              ...topic,
              subtopics: topic.subtopics.map(sub => {
                if (sub.id === subtopicId) {
                  return {
                    ...sub,
                    content: details.content || sub.content,
                    videoUrl: details.videoUrl || sub.videoUrl,
                    interviewQuestions: details.interviewQuestions || [],
                    examQuestions: details.examQuestions || [],
                    labExercises: details.labExercises || [],
                    images: details.images || []
                  };
                }
                return sub;
              })
            };
          }
          return topic;
        });
        return { ...prev, topics: newTopics };
      });
    }
    
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const loadCourseStructure = async (courseId) => {
    if (!courseId) {
      console.log("No courseId provided to loadCourseStructure");
      return;
    }
    
    try {
      console.log(`Loading course structure for courseId: ${courseId}`);
      const response = await getCourseTopics(courseId);
      console.log("Course topics response:", response.data);
      
      const normalizedData = normalizeCourseStructure(response.data);
      console.log("Normalized data:", normalizedData);
      
      if (!normalizedData || !normalizedData.topics?.length) {
        console.log("No topics found in course structure");
        setCourseStructure(null);
        return;
      }
      
      setCourseStructure(normalizedData);
      
      const savedCompleted = localStorage.getItem(`lessons_completed_${courseId}`);
      if (savedCompleted) setCompletedLessons(JSON.parse(savedCompleted));
      
      if (normalizedData.topics.length > 0) {
        const firstTopicId = normalizedData.topics[0].id;
        setOpenTopicId(firstTopicId);
        
        const firstSubtopic = normalizedData.topics[0].subtopics?.[0];
        if (firstSubtopic) {
          setActiveSubtopicId(firstSubtopic.id);
          const details = await loadSubtopicDetails(firstSubtopic.id);
          if (details && normalizedData.topics[0].subtopics[0]) {
            normalizedData.topics[0].subtopics[0].interviewQuestions = details.interviewQuestions || [];
            normalizedData.topics[0].subtopics[0].examQuestions = details.examQuestions || [];
            normalizedData.topics[0].subtopics[0].labExercises = details.labExercises || [];
            normalizedData.topics[0].subtopics[0].images = details.images || [];
            setCourseStructure({ ...normalizedData });
          }
        }
      }
      
      const totalLessons = normalizedData.topics?.reduce((sum, t) => sum + (t.subtopics?.length || 0), 0) || 0;
      const completed = savedCompleted ? JSON.parse(savedCompleted).length : 0;
      setProgress(totalLessons > 0 ? (completed / totalLessons) * 100 : 0);
    } catch (error) {
      console.error("Error loading course structure:", error);
    }
  };

  const loadImages = async (pdfId) => {
    if (!pdfId) return;
    try {
      const response = await getPdfImages(pdfId);
      setImages(response.data.images || []);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  useEffect(() => {
    if (pdf) {
      setPdfData(pdf);
      loadImages(pdf.id);
      if (pdf.courseId) {
        loadCourseStructure(pdf.courseId);
      }
      setLoading(false);
    }
  }, [pdf]);

  const handleGenerateStructure = async () => {
    if (!pdfData?.id) {
      Swal.fire({ 
        title: 'Missing PDF ID', 
        text: 'PDF information is not available.', 
        icon: 'error' 
      });
      return;
    }

    setGenerating(true);
    
    Swal.fire({ 
      title: 'Generating Course Structure...', 
      text: 'Analyzing PDF content and creating topics. This may take a moment...', 
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false
    });
    
    try {
      console.log(`Generating structure for PDF ID: ${pdfData.id}`);
      const response = await generateCourseStructure(pdfData.id);
      console.log("Generate structure response:", response.data);
      
      if (response.data && (response.data.success === true || response.data.topicsCount !== undefined)) {
        const topicsCount = response.data.topicsCount || 0;
        const subtopicsCount = response.data.subtopicsCount || 0;
        
        Swal.fire({ 
          title: 'Success!', 
          text: `Generated ${topicsCount} topics and ${subtopicsCount} subtopics from your PDF.`, 
          icon: 'success', 
          timer: 3000,
          showConfirmButton: true
        });
        
        const courseId = response.data.courseId || pdfData.courseId;
        
        if (courseId) {
          if (!pdfData.courseId) {
            setPdfData(prev => ({ ...prev, courseId: courseId }));
          }
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          await loadCourseStructure(courseId);
        } else {
          console.warn("No courseId returned from generate endpoint");
          Swal.fire({ 
            title: 'Warning', 
            text: 'Structure generated but unable to reload course data.', 
            icon: 'warning' 
          });
        }
      } else {
        throw new Error(response.data?.error || 'Failed to generate structure');
      }
    } catch (error) {
      console.error("Generate error:", error);
      Swal.fire({ 
        title: 'Generation Failed', 
        text: error.response?.data?.error || error.message || 'Unable to generate course structure. Please check if the PDF contains readable text.', 
        icon: 'error' 
      });
    } finally {
      setGenerating(false);
    }
  };

  // Add sample data for testing
  const addSampleData = async () => {
    if (!activeSubtopicId) {
      Swal.fire({ title: 'No Lesson Selected', text: 'Please select a lesson first', icon: 'warning' });
      return;
    }
    
    try {
      await addInterviewQuestion(activeSubtopicId, 
        "What is the OSI model and why is it important?",
        "The OSI (Open Systems Interconnection) model is a conceptual framework that standardizes the functions of a telecommunication or computing system into seven layers. It's important because it helps network professionals understand how different network protocols interact and work together."
      );
      
      await addInterviewQuestion(activeSubtopicId,
        "Explain the difference between TCP and UDP.",
        "TCP is connection-oriented, reliable, and guarantees delivery with sequence numbers and acknowledgments. UDP is connectionless, faster, but does not guarantee delivery. TCP is used for HTTP, FTP, email. UDP is used for streaming, DNS, VoIP."
      );
      
      await addExamQuestion(activeSubtopicId,
        "Which layer of the OSI model is responsible for routing?",
        "Layer 1 - Physical",
        "Layer 2 - Data Link", 
        "Layer 3 - Network",
        "Layer 4 - Transport",
        "C"
      );
      
      await addExamQuestion(activeSubtopicId,
        "What does the acronym TCP stand for?",
        "Transmission Control Protocol",
        "Transfer Control Protocol",
        "Transport Communication Protocol",
        "Transmission Connection Protocol",
        "A"
      );
      
      await addLabExercise(activeSubtopicId,
        "OSI Model Layer Identification Lab",
        "1. Open a web browser\n2. Navigate to any website\n3. Open Developer Tools (F12)\n4. Identify which OSI layers are involved in the process\n5. Document each layer's role in the network communication\n6. Submit your findings"
      );
      
      await addLabExercise(activeSubtopicId,
        "Protocol Analysis with Wireshark",
        "1. Install Wireshark on your computer\n2. Start a packet capture\n3. Visit a website\n4. Stop the capture\n5. Identify TCP and UDP packets\n6. Analyze the three-way handshake\n7. Write a report on your findings"
      );
      
      if (pdfData?.courseId) {
        await loadCourseStructure(pdfData.courseId);
      }
      
      Swal.fire("Success!", "Sample questions and labs added!", "success");
    } catch (error) {
      console.error("Error adding sample data:", error);
      Swal.fire("Error", "Failed to add sample data: " + error.message, "error");
    }
  };

  const handleUpdateVideo = async () => {
    if (!activeSubtopicId) return;
    try {
      await updateSubtopicVideo(activeSubtopicId, videoUrl);
      setEditingVideo(false);
      if (pdfData?.courseId) {
        await loadCourseStructure(pdfData.courseId);
      }
      Swal.fire("Success", "Video URL saved!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to save video URL", "error");
    }
  };

  const handleAddInterview = async () => {
    if (!activeSubtopicId || !newInterview.question) return;
    try {
      await addInterviewQuestion(activeSubtopicId, newInterview.question, newInterview.answer);
      setShowAddInterview(false);
      setNewInterview({ question: '', answer: '' });
      if (pdfData?.courseId) {
        await loadCourseStructure(pdfData.courseId);
      }
      Swal.fire("Success", "Interview question added!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to add question", "error");
    }
  };

  const handleDeleteInterview = async (questionId) => {
    const result = await Swal.fire({ title: 'Delete?', text: 'Remove this question?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await deleteInterviewQuestion(questionId);
        if (pdfData?.courseId) {
          await loadCourseStructure(pdfData.courseId);
        }
        Swal.fire("Deleted", "Question removed", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete question", "error");
      }
    }
  };

  const handleAddExam = async () => {
    if (!activeSubtopicId || !newExam.question) return;
    try {
      await addExamQuestion(activeSubtopicId, newExam.question, newExam.optionA, newExam.optionB, newExam.optionC, newExam.optionD, newExam.correctAnswer);
      setShowAddExam(false);
      setNewExam({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
      if (pdfData?.courseId) {
        await loadCourseStructure(pdfData.courseId);
      }
      Swal.fire("Success", "Exam question added!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to add question", "error");
    }
  };

  const handleDeleteExam = async (questionId) => {
    const result = await Swal.fire({ title: 'Delete?', text: 'Remove this question?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await deleteExamQuestion(questionId);
        if (pdfData?.courseId) {
          await loadCourseStructure(pdfData.courseId);
        }
        Swal.fire("Deleted", "Question removed", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete question", "error");
      }
    }
  };

  const handleAddLab = async () => {
    if (!activeSubtopicId || !newLab.title) return;
    try {
      await addLabExercise(activeSubtopicId, newLab.title, newLab.instructions);
      setShowAddLab(false);
      setNewLab({ title: '', instructions: '' });
      if (pdfData?.courseId) {
        await loadCourseStructure(pdfData.courseId);
      }
      Swal.fire("Success", "Lab exercise added!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to add lab", "error");
    }
  };

  const handleDeleteLab = async (labId) => {
    const result = await Swal.fire({ title: 'Delete?', text: 'Remove this lab?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await deleteLabExercise(labId);
        if (pdfData?.courseId) {
          await loadCourseStructure(pdfData.courseId);
        }
        Swal.fire("Deleted", "Lab removed", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete lab", "error");
      }
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setEditContent(lesson.content || '');
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    try {
      await updateSubtopicContent(editingLesson.id, editContent);
      setEditingLesson(null);
      if (pdfData?.courseId) {
        await loadCourseStructure(pdfData.courseId);
      }
      Swal.fire("Success", "Notes saved!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to save notes", "error");
    }
  };

  const markLessonComplete = (lessonId) => {
    let newCompleted = completedLessons.includes(lessonId) 
      ? completedLessons.filter(id => id !== lessonId) 
      : [...completedLessons, lessonId];
    setCompletedLessons(newCompleted);
    const totalLessons = courseStructure?.topics?.reduce((sum, t) => sum + (t.subtopics?.length || 0), 0) || 0;
    const newProgress = totalLessons > 0 ? (newCompleted.length / totalLessons) * 100 : 0;
    setProgress(newProgress);
    localStorage.setItem(`lessons_completed_${pdfData?.courseId}`, JSON.stringify(newCompleted));
  };

  const getSelectedLesson = () => {
    if (!courseStructure || !activeSubtopicId) return null;
    for (const topic of courseStructure.topics) {
      const subtopic = topic.subtopics?.find(s => s.id === activeSubtopicId);
      if (subtopic) return { topic, subtopic };
    }
    return null;
  };

  const selected = getSelectedLesson();

  if (loading) return <div style={{ ...styles.emptyState, padding: '100px' }}>Loading course content...</div>;

  const totalLessons = courseStructure?.topics?.reduce((sum, t) => sum + (t.subtopics?.length || 0), 0) || 0;
  const totalTopics = courseStructure?.topics?.length || 0;

  // Get images for current subtopic
  const currentSubtopicImages = selected?.subtopic?.images || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={onBack}>← Back to PDF List</button>
          <div style={styles.courseBadge}>Course Content</div>
          <h1 style={styles.courseTitle}>{pdfData?.fileName?.replace('.pdf', '') || 'Course Content'}</h1>
          <div style={styles.statsRow}>
            <div style={styles.statItem}>📄 {pdfData?.pageCount || 0} pages</div>
            <div style={styles.statItem}>🖼️ {images.length} images</div>
            <div style={styles.statItem}>📚 {totalTopics} topics</div>
            <div style={styles.statItem}>📝 {totalLessons} lessons</div>
          </div>
          {totalLessons > 0 && (
            <div style={styles.progressSection}>
              <div style={styles.progressLabel}>
                <span>Course Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            style={styles.btn(colors.purple)} 
            onClick={handleGenerateStructure} 
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '🔧 Generate Course Structure'}
          </button>
          
          {activeSubtopicId && (
            <button style={styles.btn(colors.secondary)} onClick={addSampleData}>
              📝 Add Sample Data
            </button>
          )}
          
          {totalLessons > 0 && (
            <button style={styles.btn(colors.gray, colors.dark)} onClick={() => {
              Swal.fire({ title: 'Reset Progress?', text: 'Clear all completed lessons?', icon: 'warning', showCancelButton: true }).then(result => {
                if (result.isConfirmed) { 
                  setCompletedLessons([]); 
                  setProgress(0); 
                  localStorage.removeItem(`lessons_completed_${pdfData?.courseId}`); 
                  Swal.fire("Reset", "Progress has been reset", "success");
                }
              });
            }}>⟳ Reset Progress</button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div style={styles.layout}>
        {/* Sidebar - Course Topics & Subtopics */}
        <div style={styles.sidebar}>
          {!courseStructure?.topics?.length ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <p>No course structure found.</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>
                Click <strong style={{ color: colors.purple }}>"Generate Course Structure"</strong> to automatically create topics and lessons from your PDF content.
              </p>
            </div>
          ) : (
            <>
              <div style={{ padding: '20px', borderBottom: `1px solid ${colors.grayLight}` }}>
                <div style={{ fontWeight: '700', fontSize: '16px', color: colors.dark }}>📚 Course Topics</div>
                <div style={{ fontSize: '12px', color: colors.gray, marginTop: '4px' }}>{totalTopics} topics • {totalLessons} lessons</div>
              </div>
              {courseStructure.topics.map((topic) => {
                const isOpen = openTopicId === topic.id;
                const lessons = topic.subtopics ?? [];
                const completedCount = lessons.filter(l => completedLessons.includes(l.id)).length;
                return (
                  <div key={topic.id} style={styles.topicItem}>
                    <button 
                      style={{ ...styles.topicHeader, ...(isOpen ? styles.topicHeaderActive : {}) }} 
                      onClick={() => setOpenTopicId(isOpen ? null : topic.id)}
                    >
                      <span>
                        {topic.title} 
                        {completedCount > 0 && <span style={{ fontSize: '11px', color: colors.success, marginLeft: '8px' }}>({completedCount}/{lessons.length})</span>}
                      </span>
                      <span style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                    </button>
                    {isOpen && (
                      <ul style={styles.subtopicList}>
                        {lessons.map((subtopic, idx) => {
                          const isActive = activeSubtopicId === subtopic.id;
                          const isCompleted = completedLessons.includes(subtopic.id);
                          return (
                            <li 
                              key={subtopic.id} 
                              style={{ ...styles.subtopicItem, ...(isActive ? styles.subtopicItemActive : {}) }} 
                              onClick={() => handleSubtopicClick(topic.id, subtopic.id)}
                            >
                              <span>{idx + 1}. {subtopic.title}</span>
                              {isCompleted && <span style={styles.completedIcon}>✓</span>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Content Area */}
        <div style={styles.contentArea} ref={contentRef}>
          {!selected ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
              <p>Select a lesson from the sidebar to begin learning</p>
              {!courseStructure?.topics?.length && (
                <p style={{ fontSize: '13px', marginTop: '8px' }}>
                  👆 Click "Generate Course Structure" first to create lessons from your PDF
                </p>
              )}
            </div>
          ) : (
            <div style={styles.contentCard}>
              {/* Header */}
              <div style={styles.contentHeader}>
                <div style={styles.breadcrumb}>
                  {selected.topic.title} / {selected.subtopic.title}
                </div>
                <div style={styles.lessonTitle}>
                  {selected.subtopic.title}
                  {completedLessons.includes(selected.subtopic.id) && <span style={styles.completionBadge}>✓ Completed</span>}
                </div>
              </div>

              {/* Tabs */}
              <div style={styles.tabsContainer}>
                <button style={styles.tab(activeView === 'notes')} onClick={() => setActiveView('notes')}>📝 Notes</button>
                <button style={styles.tab(activeView === 'images')} onClick={() => setActiveView('images')}>🖼️ Images</button>
                <button style={styles.tab(activeView === 'video')} onClick={() => setActiveView('video')}>🎬 Video</button>
                <button style={styles.tab(activeView === 'interview')} onClick={() => setActiveView('interview')}>🎤 Interview Qs</button>
                <button style={styles.tab(activeView === 'exam')} onClick={() => setActiveView('exam')}>📋 Exam Qs</button>
                <button style={styles.tab(activeView === 'lab')} onClick={() => setActiveView('lab')}>🧪 Lab Exercises</button>
              </div>

              {/* Tab Content */}
              <div style={styles.tabContent}>
                {/* Notes Tab */}
                {activeView === 'notes' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                      <button style={styles.editButton} onClick={() => handleEditLesson(selected.subtopic)}>✏️ Edit Notes</button>
                    </div>
                    <div style={styles.notesContent}>
                      {selected.subtopic.content || `📖 ${selected.subtopic.title}\n\nThis section covers ${selected.subtopic.title}.`}
                    </div>
                    <button 
                      style={{ ...styles.btn(completedLessons.includes(selected.subtopic.id) ? colors.success : colors.primary), marginTop: '24px', width: '100%' }} 
                      onClick={() => markLessonComplete(selected.subtopic.id)}
                    >
                      {completedLessons.includes(selected.subtopic.id) ? '✓ Marked as Complete' : '✓ Mark as Complete'}
                    </button>
                  </div>
                )}

                {/* Images Tab - Fixed to show images from current subtopic */}
                {activeView === 'images' && (
                  <div>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>📸 Images from this Section</h3>
                    {currentSubtopicImages.length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                        <p>No images extracted for this section</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>Images will appear here when you upload a PDF that contains images.</p>
                      </div>
                    ) : (
                      <div style={styles.imageGrid}>
                        {currentSubtopicImages.map((img, idx) => (
                          <div key={img.id || idx} style={styles.imageCard} onClick={() => window.open(getImageUrl(img.imagePath), '_blank')}>
                            <img 
                              src={getImageSrc(img)} 
                              alt={`Page ${img.pageNumber || idx + 1}`} 
                              style={styles.image} 
                              onError={() => handleImageError(img.imagePath)} 
                            />
                            <div style={{ padding: '8px', fontSize: '11px', textAlign: 'center', color: colors.gray }}>
                              {img.pageNumber ? `Page ${img.pageNumber}` : `Image ${idx + 1}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Video Tab */}
                {activeView === 'video' && (
                  <div>
                    {editingVideo ? (
                      <div>
                        <input 
                          type="text" 
                          style={styles.input} 
                          placeholder="Enter YouTube/Video URL (e.g., https://www.youtube.com/watch?v=...)" 
                          value={videoUrl} 
                          onChange={e => setVideoUrl(e.target.value)} 
                        />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                          <button style={styles.btn(colors.gray, colors.dark)} onClick={() => setEditingVideo(false)}>Cancel</button>
                          <button style={styles.btn(colors.primary)} onClick={handleUpdateVideo}>Save Video URL</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {selected.subtopic.videoUrl ? (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                              <button style={styles.editButton} onClick={() => { setVideoUrl(selected.subtopic.videoUrl); setEditingVideo(true); }}>✏️ Edit Video URL</button>
                            </div>
                            <div style={styles.videoContainer}>
                              <iframe 
                                style={styles.videoIframe} 
                                src={selected.subtopic.videoUrl.replace('watch?v=', 'embed/')} 
                                title="Video" 
                                frameBorder="0" 
                                allowFullScreen 
                              />
                            </div>
                          </div>
                        ) : (
                          <div style={styles.emptyState}>
                            <p>No video added for this lesson yet.</p>
                            <button style={styles.addButton} onClick={() => setEditingVideo(true)}>➕ Add Video</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Questions Tab */}
                {activeView === 'interview' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                      {!showAddInterview && <button style={styles.addButton} onClick={() => setShowAddInterview(true)}>➕ Add Interview Question</button>}
                    </div>
                    {showAddInterview && (
                      <div style={{ background: colors.light, padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                        <input style={styles.input} placeholder="Question" value={newInterview.question} onChange={e => setNewInterview({ ...newInterview, question: e.target.value })} />
                        <textarea style={styles.textarea} placeholder="Answer" rows={3} value={newInterview.answer} onChange={e => setNewInterview({ ...newInterview, answer: e.target.value })} />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                          <button style={styles.btn(colors.gray, colors.dark)} onClick={() => setShowAddInterview(false)}>Cancel</button>
                          <button style={styles.btn(colors.primary)} onClick={handleAddInterview}>Add Question</button>
                        </div>
                      </div>
                    )}
                    {(!selected.subtopic.interviewQuestions || selected.subtopic.interviewQuestions.length === 0) && !showAddInterview ? (
                      <div style={styles.emptyState}>
                        <p>No interview questions yet.</p>
                      </div>
                    ) : (
                      selected.subtopic.interviewQuestions?.map((q, i) => (
                        <div key={q.id} style={styles.questionCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '600' }}>Q{i + 1}</span>
                            <button style={styles.deleteButton} onClick={() => handleDeleteInterview(q.id)}>🗑</button>
                          </div>
                          <div style={styles.questionText}>{q.question || q.q}</div>
                          <div style={{ color: colors.gray, marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.grayLight}` }}>
                            <strong>Answer:</strong> {q.answer || q.a}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Exam Questions Tab */}
                {activeView === 'exam' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                      {!showAddExam && <button style={styles.addButton} onClick={() => setShowAddExam(true)}>➕ Add Exam Question</button>}
                    </div>
                    {showAddExam && (
                      <div style={{ background: colors.light, padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                        <textarea style={styles.textarea} placeholder="Question" rows={2} value={newExam.question} onChange={e => setNewExam({ ...newExam, question: e.target.value })} />
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <input key={opt} style={styles.input} placeholder={`Option ${opt}`} value={newExam[`option${opt}`]} onChange={e => setNewExam({ ...newExam, [`option${opt}`]: e.target.value })} />
                        ))}
                        <select style={styles.input} value={newExam.correctAnswer} onChange={e => setNewExam({ ...newExam, correctAnswer: e.target.value })}>
                          <option value="A">Correct Answer: A</option>
                          <option value="B">Correct Answer: B</option>
                          <option value="C">Correct Answer: C</option>
                          <option value="D">Correct Answer: D</option>
                        </select>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                          <button style={styles.btn(colors.gray, colors.dark)} onClick={() => setShowAddExam(false)}>Cancel</button>
                          <button style={styles.btn(colors.primary)} onClick={handleAddExam}>Add Question</button>
                        </div>
                      </div>
                    )}
                    {(!selected.subtopic.examQuestions || selected.subtopic.examQuestions.length === 0) && !showAddExam ? (
                      <div style={styles.emptyState}>
                        <p>No exam questions yet.</p>
                      </div>
                    ) : (
                      selected.subtopic.examQuestions?.map((q, i) => (
                        <div key={q.id} style={styles.questionCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '600' }}>MCQ {i + 1}</span>
                            <button style={styles.deleteButton} onClick={() => handleDeleteExam(q.id)}>🗑</button>
                          </div>
                          <div style={styles.questionText}>{q.question || q.text}</div>
                          <div style={styles.optionsList}>
                            {['A', 'B', 'C', 'D'].map((opt, idx) => {
                              const optionText = q[`option${opt}`];
                              if (!optionText) return null;
                              const isCorrect = q.correctAnswer === opt;
                              return (
                                <div key={opt} style={{ ...styles.optionItem, background: isCorrect ? `${colors.success}20` : colors.white }}>
                                  <span style={{ fontWeight: '600', width: '24px' }}>{opt}.</span>
                                  <span style={{ flex: 1 }}>{optionText}</span>
                                  {isCorrect && <span style={styles.correctBadge}>✓ Correct</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Lab Exercises Tab */}
                {activeView === 'lab' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                      {!showAddLab && <button style={styles.addButton} onClick={() => setShowAddLab(true)}>➕ Add Lab Exercise</button>}
                    </div>
                    {showAddLab && (
                      <div style={{ background: colors.light, padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                        <input style={styles.input} placeholder="Lab Title" value={newLab.title} onChange={e => setNewLab({ ...newLab, title: e.target.value })} />
                        <textarea style={styles.textarea} placeholder="Instructions" rows={4} value={newLab.instructions} onChange={e => setNewLab({ ...newLab, instructions: e.target.value })} />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                          <button style={styles.btn(colors.gray, colors.dark)} onClick={() => setShowAddLab(false)}>Cancel</button>
                          <button style={styles.btn(colors.primary)} onClick={handleAddLab}>Add Lab</button>
                        </div>
                      </div>
                    )}
                    {(!selected.subtopic.labExercises || selected.subtopic.labExercises.length === 0) && !showAddLab ? (
                      <div style={styles.emptyState}>
                        <p>No lab exercises yet.</p>
                      </div>
                    ) : (
                      selected.subtopic.labExercises?.map((lab, i) => (
                        <div key={lab.id} style={styles.labStep}>
                          <div style={styles.stepNumber}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <strong style={{ fontSize: '16px' }}>{lab.title}</strong>
                              <button style={styles.deleteButton} onClick={() => handleDeleteLab(lab.id)}>🗑</button>
                            </div>
                            <div style={{ color: colors.gray, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{lab.instructions}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Notes Modal */}
      {editingLesson && (
        <div style={styles.modal} onClick={() => setEditingLesson(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>Edit Notes: {editingLesson.title}</h3>
            <textarea 
              value={editContent} 
              onChange={e => setEditContent(e.target.value)} 
              style={styles.textarea} 
              rows={10} 
              placeholder="Add your notes here..." 
            />
            <div style={styles.modalButtons}>
              <button style={styles.btn(colors.gray, colors.dark)} onClick={() => setEditingLesson(null)}>Cancel</button>
              <button style={styles.btn(colors.primary)} onClick={handleSaveLesson}>Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseViewTab;