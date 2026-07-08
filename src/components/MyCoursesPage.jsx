import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseDetailView from './CourseDetailView';
import CourseEnrollmentPage from './CourseEnrollmentPage';
import Swal from 'sweetalert2';
import {
  getEnrolledCourses,
  getCourseDetails,
  getSubtopicImages,
  getCourses,
  enrollInCourse,
} from '../api/UserApi';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

// ─── Get My Courses Configuration from localStorage ────────────────────
const getMyCoursesConfig = () => {
  const saved = localStorage.getItem('myCoursesConfig');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

// ─── Default My Courses Configuration ──────────────────────────────────
const DEFAULT_MY_COURSES_CONFIG = {
  heroEyebrow: "Networking & Security Academy",
  heroTitle: "Knowledge is a superpower",
  heroText: "Level up your networking and security skills — from CCNA fundamentals to CCIE expert tracks. Your next certification starts here.",
  heroButtonText: "Pick a course →",
  heroBgStart: "#3B2340",
  heroBgMid: "#5B3A63",
  heroBgEnd: "#83698A",
  heroDecor: "🎓",
  sectionTitleMy: "My Courses",
  sectionTitleAll: "All Courses",
  myCoursesTabText: "My Courses",
  allCoursesTabText: "All Courses",
  searchPlaceholder: "Search courses...",
  cardDurationLabel: "⏱",
  cardStepsLabel: "📋",
  cardStepsText: "steps",
  enrolledBadgeText: "Enrolled",
  viewCourseButtonText: "View Course",
  continueLearningButtonText: "Continue Learning",
  emptyStateLoginTitle: "Login required",
  emptyStateLoginText: "Please log in to see your enrolled courses.",
  emptyStateLoginButton: "Go to Login",
  emptyStateNoCoursesTitle: "No courses yet",
  emptyStateNoCoursesText: "Enroll in a course to start learning.",
  emptyStateNoCoursesButton: "Browse All Courses",
  emptyStateNoAvailableTitle: "No courses available",
  emptyStateNoAvailableText: "Check back later for new courses.",
  footerText: "Click any course to view details — enrolled courses can be resumed anytime.",
  trackIcons: {
    ccna: "🌐",
    ccnp: "🚀",
    ccie: "🔐",
    security: "🛡️",
    linux: "🐧",
    python: "🐍",
    fortinet: "🧱",
    aws: "☁️",
    azure: "💠",
    devops: "⚡",
    default: "📄"
  },
  trackColors: {
    ccna: "#EAF6F1",
    ccnp: "#FDF3E7",
    ccie: "#FBEAEA",
    security: "#F1EAFB",
    linux: "#E7F6FA",
    python: "#EAF6EF",
    fortinet: "#EFF1FB",
    aws: "#E8F4FD",
    azure: "#E3F2FD",
    devops: "#FFF3E0",
    default: "#F2F1F6"
  }
};

// ─── Design tokens ───────────────────────────────────────────────
const COLORS = {
  plumDark: '#3B2340',
  plumMid: '#5B3A63',
  plumLight: '#83698A',
  accent: '#714B67',
  ink: '#1F1B24',
  slate: '#6B6470',
  line: '#E8E3EA',
  paper: '#FFFFFF',
  canvas: '#FAF9FB',
  tagBg: '#F1E9F0',
  tagText: '#714B67',
  success: '#2E8B57',
  // Grey sidebar colors
  sidebarBg: '#F1F5F9',
  sidebarBorder: '#E2E8F0',
  sidebarText: '#475569',
};

// ─── Course Image Mapping (Fallback images) ────────────────────
const COURSE_IMAGES = {
  'ccna': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop',
  'ccnp': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
  'ccie': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
  'security': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop',
  'linux': 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=250&fit=crop',
  'python': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
  'fortinet': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
  'aws': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
  'azure': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop',
  'devops': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=250&fit=crop',
  'default': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop'
};

function MyCoursesPage() {
  const navigate = useNavigate();
  
  // ✅ Get config from localStorage
  const myCoursesConfig = getMyCoursesConfig() || DEFAULT_MY_COURSES_CONFIG;
  
  // ✅ Build TRACKS from config
  const TRACKS = Object.entries(myCoursesConfig.trackIcons).map(([key, icon]) => ({
    match: key,
    icon: icon,
    tint: myCoursesConfig.trackColors[key] || myCoursesConfig.trackColors.default || '#F2F1F6'
  }));
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeView, setActiveView] = useState('catalog');
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [currentSubtopic, setCurrentSubtopic] = useState(null);
  const [images, setImages] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const [allCourses, setAllCourses] = useState([]);
  const [loadingAllCourses, setLoadingAllCourses] = useState(false);

  const isMobile = window.innerWidth < 768;
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

  const isLoggedIn = !!localStorage.getItem('token');

  // ─── HIDE NAVBAR WHEN VIEWING COURSE DETAILS ──────────────────────────
  useEffect(() => {
    if (activeView === 'split' || activeView === 'enrollment') {
      document.body.classList.add('hide-main-navbar');
    } else {
      document.body.classList.remove('hide-main-navbar');
    }
    return () => {
      document.body.classList.remove('hide-main-navbar');
    };
  }, [activeView]);

  // ─── ✅ FIXED: Get course image from admin uploads ──────────────────
  const getCourseImage = (course) => {
    if (!course.imageUrl) {
      const name = course.title?.toLowerCase() || '';
      for (const [key, url] of Object.entries(COURSE_IMAGES)) {
        if (name.includes(key)) return url;
      }
      return COURSE_IMAGES.default;
    }

    const imageUrl = course.imageUrl;

    // Already absolute or data URI
    if (imageUrl.startsWith('data:image/') || 
        imageUrl.startsWith('http://') || 
        imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // ✅ Admin-uploaded images start with /uploads/ – need to add /admin
    if (imageUrl.startsWith('/uploads/')) {
      return `${API_BASE}/admin${imageUrl}`;
    }

    if (imageUrl.startsWith('/api/')) {
      const baseUrl = API_BASE.replace('/api', '');
      return `${baseUrl}${imageUrl}`;
    }

    if (imageUrl.startsWith('uploads/')) {
      return `${API_BASE}/admin/${imageUrl}`;
    }

    return `${API_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  // ─── ✅ FIXED: Get subtopic image from admin uploads ────────────────
  const getSubtopicImageUrl = (subtopicId, fileName) => {
    if (!subtopicId || !fileName) return FALLBACK_IMAGE;

    if (fileName.startsWith('http://') || fileName.startsWith('https://') || fileName.startsWith('data:image/')) {
      return fileName;
    }

    if (fileName.startsWith('/uploads/')) {
      return `${API_BASE}/admin${fileName}`;
    }
    if (fileName.startsWith('uploads/')) {
      return `${API_BASE}/admin/${fileName}`;
    }

    return `${API_BASE}/admin/uploads/${fileName}`;
  };

  // ─── API calls ─────────────────────────────────────────────────────────
  const fetchEnrolledCourses = async () => {
    if (!isLoggedIn) {
      setCourses([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getEnrolledCourses();
      setCourses(data);
      
      data.forEach(course => {
        if (course.imageUrl) {
          const img = new Image();
          img.src = getCourseImage(course);
        }
      });
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      Swal.fire('Error', 'Could not load your courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    setLoadingAllCourses(true);
    try {
      const data = await getCourses();
      setAllCourses(data);
      
      data.forEach(course => {
        if (course.imageUrl && !course.imageUrl.startsWith('data:image/')) {
          const img = new Image();
          img.src = getCourseImage(course);
        }
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      Swal.fire('Error', 'Could not load course catalog', 'error');
    } finally {
      setLoadingAllCourses(false);
    }
  };

  // ─── Enroll Handler ──────────────────────────────────────────────────
  const handleEnroll = async (courseId) => {
    if (!isLoggedIn) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to enroll in courses',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Go to Login',
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
      return;
    }
    try {
      await enrollInCourse(courseId);
      await fetchEnrolledCourses();
      
      const enrolledCourse = allCourses.find(c => c.id === courseId);
      if (enrolledCourse) {
        setSelectedCourse(enrolledCourse);
        await loadCourseDetails(courseId);
        setActiveView('split');
      }
      
      Swal.fire({
        title: 'Enrolled! 🎉',
        text: 'You are now enrolled in this course. Start learning now!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire('Error', 'Could not enroll. Please try again.', 'error');
    }
  };

  const loadCourseDetails = async (courseId) => {
    setContentLoading(true);
    try {
      const data = await getCourseDetails(courseId);
      const allTopics = data.topics || [];

      const allSubtopics = [];
      allTopics.forEach(topic => {
        (topic.subtopics || []).forEach(sub => {
          allSubtopics.push({
            id: sub.id,
            title: sub.title,
            topicTitle: topic.title,
            content: sub.content,
            videoUrl: sub.videoUrl,
            videoUrls: sub.videoUrls || [],
            imageUrl: sub.imageUrl,
            ...sub
          });
        });
      });
      setSubtopics(allSubtopics);
      setTopics(allTopics);

      const savedCompleted = localStorage.getItem(`course_completed_${courseId}`);
      if (savedCompleted) {
        const completed = JSON.parse(savedCompleted);
        setCompletedSections(completed);
        setProgress((completed.length / allSubtopics.length) * 100);
      } else {
        setCompletedSections([]);
        setProgress(0);
      }
      setActiveSection(0);
      if (allSubtopics.length > 0) {
        await loadSubtopicImages(allSubtopics[0].id);
        setCurrentSubtopic(allSubtopics[0]);
      }
    } catch (error) {
      console.error('Error loading course details:', error);
      Swal.fire('Error', 'Could not load course content', 'error');
    } finally {
      setContentLoading(false);
    }
  };

  const loadSubtopicImages = async (subtopicId) => {
    try {
      const data = await getSubtopicImages(subtopicId);
      setImages(data);
    } catch (error) {
      console.error('Error loading subtopic images:', error);
      setImages([]);
    }
  };

  // ─── Course Selection Handlers ──────────────────────────────────────
  const handleViewCourse = async (course) => {
    setSelectedCourse(course);
    setActiveView('enrollment');
    try {
      await loadCourseDetails(course.id);
    } catch (error) {
      console.error('Error pre-loading course:', error);
    }
  };

  const handleContinueLearning = async (course) => {
    setSelectedCourse(course);
    setActiveView('split');
    try {
      await loadCourseDetails(course.id);
    } catch (error) {
      console.error('Error loading course:', error);
      Swal.fire('Error', 'Could not load course content', 'error');
    }
  };

  const handleStartLearning = async () => {
    if (!isCourseEnrolled(selectedCourse?.id)) {
      Swal.fire({
        title: 'Not Enrolled',
        text: 'Please enroll in this course first to start learning.',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }
    setActiveView('split');
    if (selectedCourse) {
      await loadCourseDetails(selectedCourse.id);
    }
  };

  const handleBackToCatalog = () => {
    setSelectedCourse(null);
    setActiveView('catalog');
    setTopics([]);
    setSubtopics([]);
    setImages([]);
    setImageErrors({});
    setCurrentSubtopic(null);
  };

  const handleBackFromEnrollment = () => {
    handleBackToCatalog();
  };

  const markSectionComplete = (index) => {
    if (!selectedCourse) return;
    if (!completedSections.includes(index)) {
      const newCompleted = [...completedSections, index];
      setCompletedSections(newCompleted);
      localStorage.setItem(`course_completed_${selectedCourse.id}`, JSON.stringify(newCompleted));
      setProgress((newCompleted.length / subtopics.length) * 100);
      Swal.fire({
        title: 'Section Completed! 🎉',
        text: `${Math.round((newCompleted.length / subtopics.length) * 100)}% complete`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const resetProgress = () => {
    if (!selectedCourse) return;
    Swal.fire({
      title: 'Reset Progress?',
      text: 'This will clear all your completed sections.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(`course_completed_${selectedCourse.id}`);
        setCompletedSections([]);
        setProgress(0);
        Swal.fire('Reset!', 'Progress reset.', 'success');
      }
    });
  };

  // ─── Helper: Determine if course is enrolled ──────────────────────────
  const isCourseEnrolled = (courseId) => {
    return courses.some((ec) => ec.id === courseId);
  };

  // ✅ Updated: Get track from config
  const getTrack = (title) => {
    const name = title?.toLowerCase() || '';
    for (const track of TRACKS) {
      if (name.includes(track.match)) return track;
    }
    return { 
      icon: myCoursesConfig.trackIcons.default || '📄', 
      tint: myCoursesConfig.trackColors.default || '#F2F1F6' 
    };
  };

  // ─── Image handling functions ────────────────────────────────────────
  const handleImageError = (id) => {
    if (!imageErrors[id]) setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const getImageSrc = (sid, fn, id) => {
    if (imageErrors[id]) return FALLBACK_IMAGE;
    if (fn) {
      return getSubtopicImageUrl(sid, fn);
    }
    return FALLBACK_IMAGE;
  };

  // Effects
  useEffect(() => {
    fetchEnrolledCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'all' && allCourses.length === 0 && !loadingAllCourses) {
      fetchAllCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, allCourses.length, loadingAllCourses]);

  useEffect(() => {
    if (!isLoggedIn && activeTab === 'my') {
      setActiveTab('all');
    }
  }, [isLoggedIn, activeTab]);

  // ─── Styles ─────────────────────────────────────────────────────────────
  const styles = {
    page: { minHeight: '100vh', background: COLORS.canvas, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: COLORS.ink },

    // ─── Navbar ──────────────────────────────────────────────────────
    nav: { 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: isMobile ? '16px 20px' : '18px 40px', 
      borderBottom: `1px solid ${COLORS.line}`, 
      background: COLORS.paper 
    },
    navLeft: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    logoMark: { 
      width: '30px', 
      height: '30px', 
      borderRadius: '8px', 
      background: `linear-gradient(135deg, ${COLORS.plumMid}, ${COLORS.accent})`, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: '#fff', 
      fontWeight: 800, 
      fontSize: '15px' 
    },
    logoText: { fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px', color: COLORS.ink },
    navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
    navGhostBtn: { 
      background: 'transparent', 
      border: 'none', 
      color: COLORS.ink, 
      fontWeight: 600, 
      fontSize: '14px', 
      cursor: 'pointer', 
      padding: '8px 4px' 
    },
    navPrimaryBtn: { 
      background: COLORS.accent, 
      color: '#fff', 
      border: 'none', 
      borderRadius: '8px', 
      padding: '10px 18px', 
      fontWeight: 600, 
      fontSize: '14px', 
      cursor: 'pointer' 
    },

    // ✅ Hero - Using config
    hero: { 
      position: 'relative', 
      overflow: 'hidden', 
      background: `linear-gradient(120deg, ${myCoursesConfig.heroBgStart} 0%, ${myCoursesConfig.heroBgMid} 55%, ${myCoursesConfig.heroBgEnd} 100%)`, 
      padding: isMobile ? '44px 24px' : '64px 60px', 
      color: '#fff' 
    },
    heroInner: { maxWidth: '760px' },
    heroEyebrow: { fontSize: '13px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.75, marginBottom: '14px' },
    heroTitle: { fontSize: isMobile ? '32px' : '48px', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.5px', marginBottom: '18px' },
    heroText: { fontSize: isMobile ? '15px' : '17px', lineHeight: 1.6, opacity: 0.88, maxWidth: '520px', marginBottom: '28px' },
    heroBtn: { 
      background: '#fff', 
      color: COLORS.accent, 
      border: 'none', 
      borderRadius: '8px', 
      padding: '13px 26px', 
      fontWeight: 700, 
      fontSize: '15px', 
      cursor: 'pointer', 
      boxShadow: '0 10px 25px -8px rgba(0,0,0,0.4)' 
    },
    heroDecor: { 
      position: 'absolute', 
      right: isMobile ? '-60px' : '20px', 
      top: '50%', 
      transform: 'translateY(-50%)', 
      fontSize: isMobile ? '100px' : '160px', 
      opacity: 0.12, 
      lineHeight: 1 
    },

    // ─── Section Bar ─────────────────────────────────────────────────
    sectionBar: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      alignItems: isMobile ? 'stretch' : 'center', 
      justifyContent: 'space-between', 
      gap: '18px', 
      padding: isMobile ? '28px 20px 0' : '40px 60px 0', 
      maxWidth: '1320px', 
      margin: '0 auto' 
    },
    sectionTitle: { fontSize: '24px', fontWeight: 800, letterSpacing: '-0.3px', color: COLORS.ink },
    tabRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    tabPill: (active) => ({ 
      padding: '9px 18px', 
      borderRadius: '999px', 
      border: `1px solid ${active ? COLORS.accent : COLORS.line}`, 
      background: active ? COLORS.accent : COLORS.paper, 
      color: active ? '#fff' : COLORS.slate, 
      fontSize: '14px', 
      fontWeight: 600, 
      cursor: 'pointer', 
      transition: 'all 0.15s' 
    }),
    searchWrap: { position: 'relative', width: isMobile ? '100%' : '280px' },
    searchIcon: { 
      position: 'absolute', 
      left: '14px', 
      top: '50%', 
      transform: 'translateY(-50%)', 
      fontSize: '15px', 
      color: COLORS.slate 
    },
    searchInput: { 
      width: '100%', 
      boxSizing: 'border-box', 
      padding: '10px 14px 10px 38px', 
      border: `1px solid ${COLORS.line}`, 
      borderRadius: '999px', 
      fontSize: '14px', 
      outline: 'none', 
      background: COLORS.paper, 
      color: COLORS.ink 
    },

    // ─── Course Grid ─────────────────────────────────────────────────
    grid: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '28px', 
      padding: isMobile ? '24px 20px 60px' : '28px 60px 80px', 
      maxWidth: '1320px', 
      margin: '0 auto' 
    },
    card: { 
      background: COLORS.paper, 
      borderRadius: '16px', 
      overflow: 'hidden', 
      cursor: 'pointer', 
      transition: 'transform 0.2s, box-shadow 0.2s', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    cardImage: {
      width: '100%',
      height: '180px',
      objectFit: 'cover',
      background: '#f0f0f0',
    },
    cardBody: { 
      padding: '18px 20px 16px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '8px', 
      flex: 1 
    },
    cardTitle: { 
      fontSize: '17px', 
      fontWeight: 700, 
      color: COLORS.ink, 
      lineHeight: 1.35,
      marginBottom: '4px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    cardMetaRow: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '16px', 
      fontSize: '12.5px', 
      color: COLORS.slate,
      marginTop: 'auto',
      paddingTop: '4px',
      flexWrap: 'wrap',
    },
    cardFooter: { padding: '0 20px 18px' },
    enrollBtn: { 
      width: '100%', 
      padding: '11px', 
      background: COLORS.accent, 
      color: '#fff', 
      border: 'none', 
      borderRadius: '10px', 
      fontWeight: 700, 
      fontSize: '13.5px', 
      cursor: 'pointer',
    },
    viewBtn: { 
      width: '100%', 
      padding: '11px', 
      background: '#fff', 
      color: COLORS.accent, 
      border: `2px solid ${COLORS.accent}`, 
      borderRadius: '10px', 
      fontWeight: 700, 
      fontSize: '13.5px', 
      cursor: 'pointer',
    },
    continueBtn: { 
      width: '100%', 
      padding: '11px', 
      background: COLORS.accent, 
      color: '#fff', 
      border: 'none', 
      borderRadius: '10px', 
      fontWeight: 700, 
      fontSize: '13.5px', 
      cursor: 'pointer',
    },

    emptyState: { 
      textAlign: 'center', 
      padding: '70px 20px', 
      background: COLORS.paper, 
      border: `1px solid ${COLORS.line}`, 
      borderRadius: '16px', 
      maxWidth: '480px', 
      margin: '40px auto' 
    },
    emptyIcon: { fontSize: '56px', marginBottom: '16px' },
    emptyTitle: { fontSize: '20px', fontWeight: 800, color: COLORS.ink, marginBottom: '8px' },
    emptyText: { color: COLORS.slate, marginBottom: '24px', fontSize: '14px' },

    loadingContainer: { textAlign: 'center', padding: '90px 20px', color: COLORS.accent },
    spinner: { 
      width: '46px', 
      height: '46px', 
      border: `4px solid ${COLORS.line}`, 
      borderTopColor: COLORS.accent, 
      borderRadius: '50%', 
      animation: 'spin 0.9s linear infinite', 
      margin: '0 auto 18px' 
    },

    footer: { 
      textAlign: 'center', 
      padding: '30px', 
      color: COLORS.slate, 
      fontSize: '13px', 
      borderTop: `1px solid ${COLORS.line}` 
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your learning journey...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Render: Enrollment Page (View-Only) ──────────────────────────────
  if (selectedCourse && activeView === 'enrollment') {
    const enrollmentCourseData = {
      id: selectedCourse.id,
      title: selectedCourse.title || 'Course',
      subtitle: selectedCourse.subtitle || 'Learn with expert instructors',
      rating: selectedCourse.rating || 4.8,
      reviews: selectedCourse.reviews || 1247,
      students: selectedCourse.students || 168902,
      lastUpdate: selectedCourse.lastUpdate || '06/05/2026',
      duration: selectedCourse.duration || '5 hours 48 minutes',
      level: selectedCourse.level || 'Intermediate',
      language: selectedCourse.language || 'English',
      certificate: selectedCourse.certificate || 'Yes',
      price: selectedCourse.price || 49.99,
      image: getCourseImage(selectedCourse),
      description: selectedCourse.description || 'Master networking fundamentals with this comprehensive course.',
      objectives: selectedCourse.objectives || [],
      trainer: selectedCourse.trainer || {
        name: 'Expert Instructor',
        title: 'Senior Network Engineer',
        bio: 'Experienced network engineer with years of industry expertise.',
        avatar: '',
        experience: '10+ years',
        certifications: ['CCNA', 'CCNP', 'CCIE'],
        company: 'Cisco Systems',
        students: 45000,
        courses: 12,
        rating: 4.9,
      },
      syllabus: selectedCourse.syllabus || [],
      requirements: selectedCourse.requirements || [],
      targetAudience: selectedCourse.targetAudience || [],
    };

    const isEnrolled = isCourseEnrolled(selectedCourse.id);

    return (
      <CourseEnrollmentPage
        course={enrollmentCourseData}
        isEnrolled={isEnrolled}
        onEnroll={() => handleEnroll(selectedCourse.id)}
        onBack={handleBackFromEnrollment}
        onStartLearning={handleStartLearning}
        viewOnly={!isEnrolled}
        isLoggedIn={isLoggedIn}
      />
    );
  }

  // ─── Render: Course Detail View ──────────────────────────────────────
  if (selectedCourse && activeView === 'split') {
    return (
      <CourseDetailView
        selectedCourse={selectedCourse}
        topics={topics}
        subtopics={subtopics}
        images={images}
        progress={progress}
        activeView={activeView}
        activeSection={activeSection}
        completedSections={completedSections}
        currentSubtopic={currentSubtopic}
        contentLoading={contentLoading}
        handleBack={handleBackToCatalog}
        setActiveView={setActiveView}
        setActiveSection={setActiveSection}
        setCurrentSubtopic={setCurrentSubtopic}
        loadSubtopicImages={loadSubtopicImages}
        resetProgress={resetProgress}
        markSectionComplete={markSectionComplete}
        getImageSrc={getImageSrc}
        getImageUrl={getSubtopicImageUrl}
        handleImageError={handleImageError}
        styles={styles}
      />
    );
  }

  // ─── Render: Course Catalog ───────────────────────────────────────────
  const visibleCourses = (activeTab === 'my' ? courses : allCourses)
    .filter((c) => c.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.page}>
      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <div style={styles.hero}>
        <span style={styles.heroDecor}>{myCoursesConfig.heroDecor}</span>
        <div style={styles.heroInner}>
          <div style={styles.heroEyebrow}>{myCoursesConfig.heroEyebrow}</div>
          <h1 style={styles.heroTitle}>{myCoursesConfig.heroTitle}</h1>
          <p style={styles.heroText}>{myCoursesConfig.heroText}</p>
          <button style={styles.heroBtn} onClick={() => setActiveTab('all')}>{myCoursesConfig.heroButtonText}</button>
        </div>
      </div>

      {/* ─── Section bar: title, tabs, search ───────────────────────────── */}
      <div style={styles.sectionBar}>
        <div style={styles.sectionTitle}>
          {activeTab === 'my' ? myCoursesConfig.sectionTitleMy : myCoursesConfig.sectionTitleAll}
        </div>
        <div style={styles.tabRow}>
          {isLoggedIn && (
            <button style={styles.tabPill(activeTab === 'my')} onClick={() => setActiveTab('my')}>
              {myCoursesConfig.myCoursesTabText}
            </button>
          )}
          <button style={styles.tabPill(activeTab === 'all')} onClick={() => setActiveTab('all')}>
            {myCoursesConfig.allCoursesTabText}
          </button>
        </div>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder={myCoursesConfig.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* ─── My Courses ──────────────────────────────────────────────── */}
      {activeTab === 'my' && (
        <>
          {!isLoggedIn ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔐</div>
              <h3 style={styles.emptyTitle}>{myCoursesConfig.emptyStateLoginTitle}</h3>
              <p style={styles.emptyText}>{myCoursesConfig.emptyStateLoginText}</p>
              <button onClick={() => navigate('/login')} style={styles.enrollBtn}>{myCoursesConfig.emptyStateLoginButton}</button>
            </div>
          ) : courses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📚</div>
              <h3 style={styles.emptyTitle}>{myCoursesConfig.emptyStateNoCoursesTitle}</h3>
              <p style={styles.emptyText}>{myCoursesConfig.emptyStateNoCoursesText}</p>
              <button onClick={() => setActiveTab('all')} style={styles.enrollBtn}>{myCoursesConfig.emptyStateNoCoursesButton}</button>
            </div>
          ) : (
            <div style={styles.grid}>
              {visibleCourses.map((course) => {
                const track = getTrack(course.title);
                const imageUrl = getCourseImage(course);
                
                return (
                  <div key={course.id} style={styles.card}>
                    <img 
                      src={imageUrl} 
                      alt={course.title}
                      style={styles.cardImage}
                      onError={(e) => {
                        e.target.src = COURSE_IMAGES.default;
                      }}
                    />
                    <div style={styles.cardBody}>
                      <div style={styles.cardTitle}>{course.title}</div>
                      <div style={styles.cardMetaRow}>
                        <span>{myCoursesConfig.cardDurationLabel} {course.duration || '—'}</span>
                        <span>{myCoursesConfig.cardStepsLabel} {course.steps || course.subtopicCount || '—'} {myCoursesConfig.cardStepsText}</span>
                        <span>{track.icon}</span>
                      </div>
                    </div>
                    <div style={styles.cardFooter}>
                      <button 
                        style={styles.continueBtn} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleContinueLearning(course); 
                        }}
                      >
                        {myCoursesConfig.continueLearningButtonText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── All Courses ─────────────────────────────────────────────── */}
      {activeTab === 'all' && (
        <>
          {loadingAllCourses ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading course catalog...</p>
            </div>
          ) : allCourses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <h3 style={styles.emptyTitle}>{myCoursesConfig.emptyStateNoAvailableTitle}</h3>
              <p style={styles.emptyText}>{myCoursesConfig.emptyStateNoAvailableText}</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {visibleCourses.map((course) => {
                const track = getTrack(course.title);
                const isEnrolled = isLoggedIn && courses.some((ec) => ec.id === course.id);
                const imageUrl = getCourseImage(course);
                
                return (
                  <div
                    key={course.id}
                    style={styles.card}
                  >
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={imageUrl} 
                        alt={course.title}
                        style={styles.cardImage}
                        onError={(e) => {
                          e.target.src = COURSE_IMAGES.default;
                        }}
                      />
                      {isEnrolled && (
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: COLORS.success,
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '999px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}>
                          {myCoursesConfig.enrolledBadgeText}
                        </span>
                      )}
                    </div>
                    <div style={styles.cardBody}>
                      <div style={styles.cardTitle}>{course.title}</div>
                      <div style={styles.cardMetaRow}>
                        <span>{myCoursesConfig.cardDurationLabel} {course.duration || '—'}</span>
                        <span>{myCoursesConfig.cardStepsLabel} {course.steps || course.subtopicCount || '—'} {myCoursesConfig.cardStepsText}</span>
                        <span>{track.icon}</span>
                      </div>
                    </div>
                    <div style={styles.cardFooter}>
                      {isEnrolled ? (
                        <button 
                          style={styles.continueBtn} 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleContinueLearning(course); 
                          }}
                        >
                          {myCoursesConfig.continueLearningButtonText}
                        </button>
                      ) : (
                        <button
                          style={styles.viewBtn}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleViewCourse(course); 
                          }}
                        >
                          {myCoursesConfig.viewCourseButtonText}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div style={styles.footer}>
        <p>{myCoursesConfig.footerText}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default MyCoursesPage;