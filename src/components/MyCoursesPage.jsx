// src/components/MyCoursesPage.jsx
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
  heroImageUrl: '',
  sectionTitle: "All Courses",
  searchPlaceholder: "Search courses...",
  cardDurationLabel: "⏱",
  cardStepsLabel: "📋",
  cardStepsText: "steps",
  enrolledBadgeText: "Enrolled",
  viewCourseButtonText: "View Course",
  continueLearningButtonText: "Continue Learning",
  emptyStateTitle: "No courses available",
  emptyStateText: "Check back later for new courses.",
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

// ─── Helper: Resolve image URL ──────────────────────────────────────
const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (
    imageUrl.startsWith("data:image/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8082/api";
  if (imageUrl.startsWith("/uploads/")) return `${API_BASE}/admin${imageUrl}`;
  if (imageUrl.startsWith("uploads/")) return `${API_BASE}/admin/${imageUrl}`;
  return `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

function MyCoursesPage() {
  const navigate = useNavigate();
  
  const myCoursesConfig = getMyCoursesConfig() || DEFAULT_MY_COURSES_CONFIG;
  
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
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [currentSubtopic, setCurrentSubtopic] = useState(null);
  const [images, setImages] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const [allCourses, setAllCourses] = useState([]);
  const [loadingAllCourses, setLoadingAllCourses] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isSmallDesktop = window.innerWidth >= 1024 && window.innerWidth < 1280;
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

  const isLoggedIn = !!localStorage.getItem('token');

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

  const getCourseImage = (course) => {
    if (!course.imageUrl) {
      const name = course.title?.toLowerCase() || '';
      for (const [key, url] of Object.entries(COURSE_IMAGES)) {
        if (name.includes(key)) return url;
      }
      return COURSE_IMAGES.default;
    }

    const imageUrl = course.imageUrl;

    if (imageUrl.startsWith('data:image/') || 
        imageUrl.startsWith('http://') || 
        imageUrl.startsWith('https://')) {
      return imageUrl;
    }

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

  const isCourseEnrolled = (courseId) => {
    return courses.some((ec) => ec.id === courseId);
  };

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

  useEffect(() => {
    fetchEnrolledCourses();
    fetchAllCourses();
  }, []);

  // ─── Get unique categories from courses ──────────────────────────
  const getCategories = () => {
    const cats = new Set();
    allCourses.forEach(course => {
      if (course.category) {
        cats.add(course.category);
      }
    });
    return ['all', ...Array.from(cats)];
  };

  const categories = getCategories();

  // ─── Filter courses by category ──────────────────────────────────
  const getFilteredCourses = () => {
    if (activeCategory === 'all') {
      return allCourses;
    }
    return allCourses.filter(course => course.category === activeCategory);
  };

  const filteredCourses = getFilteredCourses();
  const visibleCourses = filteredCourses.filter((c) => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Get grid columns based on screen size ──────────────────────
  const getGridColumns = () => {
    if (isMobile) return '1fr';
    if (isTablet) return '2fr';
    if (isSmallDesktop) return '3fr';
    return 'repeat(4, 1fr)';
  };

  // ─── Styles ──────────────────────────────────────────────────────
  const styles = {
    page: { 
      minHeight: '100vh', 
      background: COLORS.canvas, 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      color: COLORS.ink 
    },

    hero: { 
      position: 'relative', 
      overflow: 'hidden', 
      background: `linear-gradient(120deg, ${myCoursesConfig.heroBgStart} 0%, ${myCoursesConfig.heroBgMid} 55%, ${myCoursesConfig.heroBgEnd} 100%)`, 
      padding: isMobile ? '40px 20px' : '56px 48px', 
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: isMobile ? 'auto' : '280px',
    },
    heroInner: { 
      maxWidth: '680px',
      flex: 1,
    },
    heroEyebrow: { 
      fontSize: '12px', 
      fontWeight: 700, 
      letterSpacing: '1.5px', 
      textTransform: 'uppercase', 
      opacity: 0.75, 
      marginBottom: '10px' 
    },
    heroTitle: { 
      fontSize: isMobile ? '28px' : '40px', 
      fontWeight: 800, 
      lineHeight: 1.08, 
      letterSpacing: '-0.5px', 
      marginBottom: '14px' 
    },
    heroText: { 
      fontSize: isMobile ? '14px' : '16px', 
      lineHeight: 1.6, 
      opacity: 0.88, 
      maxWidth: '480px', 
      marginBottom: '22px' 
    },
    heroBtn: { 
      background: '#fff', 
      color: COLORS.accent, 
      border: 'none', 
      borderRadius: '8px', 
      padding: '12px 24px', 
      fontWeight: 700, 
      fontSize: '14px', 
      cursor: 'pointer', 
      boxShadow: '0 10px 25px -8px rgba(0,0,0,0.4)' 
    },
    heroImage: {
      width: isMobile ? '100%' : '260px',
      height: isMobile ? '180px' : '260px',
      objectFit: 'cover',
      borderRadius: '14px',
      marginLeft: isMobile ? '0' : '32px',
      marginTop: isMobile ? '16px' : '0',
      boxShadow: '0 16px 32px rgba(0,0,0,0.2)',
    },

    sectionBar: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      alignItems: isMobile ? 'stretch' : 'center', 
      justifyContent: 'space-between', 
      gap: '14px', 
      padding: isMobile ? '20px 16px 0' : '28px 40px 0', 
      maxWidth: '1440px', 
      margin: '0 auto' 
    },
    sectionTitle: { 
      fontSize: '24px', 
      fontWeight: 800, 
      letterSpacing: '-0.3px', 
      color: COLORS.ink 
    },
    searchWrap: { 
      position: 'relative', 
      width: isMobile ? '100%' : '280px' 
    },
    searchIcon: { 
      position: 'absolute', 
      left: '14px', 
      top: '50%', 
      transform: 'translateY(-50%)', 
      fontSize: '14px', 
      color: COLORS.slate 
    },
    searchInput: { 
      width: '100%', 
      boxSizing: 'border-box', 
      padding: '10px 14px 10px 40px', 
      border: `2px solid ${COLORS.line}`, 
      borderRadius: '10px', 
      fontSize: '14px', 
      outline: 'none', 
      background: COLORS.paper, 
      color: COLORS.ink,
      transition: 'border-color 0.2s',
      '&:focus': {
        borderColor: COLORS.accent,
      }
    },

    // ─── Category Tabs ──────────────────────────────────────────────
    categoryTabs: {
      display: 'flex',
      gap: '8px',
      padding: isMobile ? '12px 16px 0' : '16px 40px 0',
      maxWidth: '1440px',
      margin: '0 auto',
      overflowX: 'auto',
      flexWrap: isMobile ? 'nowrap' : 'wrap',
    },
    categoryTab: (active) => ({
      padding: '8px 20px',
      borderRadius: '10px',
      border: `2px solid ${active ? COLORS.accent : COLORS.line}`,
      background: active ? COLORS.accent : COLORS.paper,
      color: active ? '#fff' : COLORS.slate,
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      '&:hover': {
        transform: 'scale(1.02)',
      }
    }),

    // ─── Grid - 4 columns ──────────────────────────────────────────
    grid: { 
      display: 'grid', 
      gridTemplateColumns: getGridColumns(),
      gap: '20px', 
      padding: isMobile ? '20px 16px 48px' : '24px 40px 64px', 
      maxWidth: '1440px', 
      margin: '0 auto' 
    },

    // ─── Compact Odoo-style Card ──────────────────────────────────
    card: { 
      background: COLORS.paper, 
      borderRadius: '16px', 
      overflow: 'hidden', 
      cursor: 'pointer', 
      transition: 'transform 0.25s ease, box-shadow 0.25s ease', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.04)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
      }
    },
    cardImageWrapper: {
      position: 'relative',
      paddingBottom: '56.25%',
      background: '#f5f5f5',
      overflow: 'hidden',
    },
    cardImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'scale(1.02)',
      }
    },
    cardBody: { 
      padding: '14px 16px 10px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px', 
      flex: 1,
      minHeight: '90px',
    },
    cardTitle: { 
      fontSize: '16px', 
      fontWeight: 700, 
      color: COLORS.ink, 
      lineHeight: 1.3,
      marginBottom: '2px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: '42px',
    },
    cardDescription: {
      fontSize: '13px',
      color: COLORS.slate,
      lineHeight: 1.4,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: '36px',
      marginBottom: '2px',
    },
    cardMetaRow: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      fontSize: '12px', 
      color: COLORS.slate,
      paddingTop: '6px',
      borderTop: `1px solid ${COLORS.line}`,
      marginTop: 'auto',
      flexWrap: 'wrap',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    metaIcon: {
      fontSize: '12px',
    },
    cardFooter: { 
      padding: '0 16px 14px',
      marginTop: '2px',
    },
    viewBtn: { 
      width: '100%', 
      padding: '10px', 
      background: '#fff', 
      color: COLORS.accent, 
      border: `2px solid ${COLORS.accent}`, 
      borderRadius: '10px', 
      fontWeight: 600, 
      fontSize: '13px', 
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: COLORS.accent,
        color: '#fff',
        boxShadow: '0 4px 12px rgba(113, 75, 103, 0.25)',
      }
    },
    continueBtn: { 
      width: '100%', 
      padding: '10px', 
      background: COLORS.accent, 
      color: '#fff', 
      border: 'none', 
      borderRadius: '10px', 
      fontWeight: 600, 
      fontSize: '13px', 
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: COLORS.plumDark,
        boxShadow: '0 4px 12px rgba(113, 75, 103, 0.3)',
      }
    },

    enrolledBadge: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: COLORS.success,
      color: '#fff',
      fontSize: '10px',
      fontWeight: 700,
      padding: '4px 12px',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(46, 139, 87, 0.35)',
      zIndex: 1,
      letterSpacing: '0.3px',
    },

    categoryTag: {
      position: 'absolute',
      bottom: '12px',
      left: '12px',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)',
      color: '#fff',
      fontSize: '10px',
      fontWeight: 600,
      padding: '3px 12px',
      borderRadius: '16px',
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
    },

    emptyState: { 
      textAlign: 'center', 
      padding: '60px 20px', 
      background: COLORS.paper, 
      border: `2px dashed ${COLORS.line}`, 
      borderRadius: '16px', 
      maxWidth: '480px', 
      margin: '32px auto' 
    },
    emptyIcon: { fontSize: '48px', marginBottom: '12px' },
    emptyTitle: { fontSize: '20px', fontWeight: 800, color: COLORS.ink, marginBottom: '6px' },
    emptyText: { color: COLORS.slate, marginBottom: '20px', fontSize: '14px' },

    loadingContainer: { textAlign: 'center', padding: '80px 20px', color: COLORS.accent },
    spinner: { 
      width: '40px', 
      height: '40px', 
      border: `4px solid ${COLORS.line}`, 
      borderTopColor: COLORS.accent, 
      borderRadius: '50%', 
      animation: 'spin 0.9s linear infinite', 
      margin: '0 auto 16px' 
    },

    footer: { 
      textAlign: 'center', 
      padding: '24px', 
      color: COLORS.slate, 
      fontSize: '13px', 
      borderTop: `1px solid ${COLORS.line}` 
    },
  };

  if (loading || loadingAllCourses) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading courses...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Render: Enrollment Page ──────────────────────────────────────────
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
  const heroImageUrl = myCoursesConfig.heroImageUrl ? resolveImageUrl(myCoursesConfig.heroImageUrl) : null;

  const formatCategoryName = (cat) => {
    if (cat === 'all') return 'All Courses';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div style={styles.page}>
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroEyebrow}>{myCoursesConfig.heroEyebrow}</div>
          <h1 style={styles.heroTitle}>{myCoursesConfig.heroTitle}</h1>
          <p style={styles.heroText}>{myCoursesConfig.heroText}</p>
          <button style={styles.heroBtn} onClick={() => {
            document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            {myCoursesConfig.heroButtonText}
          </button>
        </div>
        {heroImageUrl && (
          <img 
            src={heroImageUrl} 
            alt="Hero" 
            style={styles.heroImage}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* ─── Section Bar ──────────────────────────────────────────────── */}
      <div style={styles.sectionBar} id="courses-section">
        <div style={styles.sectionTitle}>
          {myCoursesConfig.sectionTitle}
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

      {/* ─── Category Tabs ────────────────────────────────────────────── */}
      <div style={styles.categoryTabs}>
        {categories.map((cat) => (
          <button
            key={cat}
            style={styles.categoryTab(activeCategory === cat)}
            onClick={() => setActiveCategory(cat)}
          >
            {formatCategoryName(cat)}
          </button>
        ))}
      </div>

      {/* ─── Courses Grid ────────────────────────────────────────────── */}
      {visibleCourses.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>
            {allCourses.length === 0 ? myCoursesConfig.emptyStateTitle : 'No courses in this category'}
          </h3>
          <p style={styles.emptyText}>
            {allCourses.length === 0 ? myCoursesConfig.emptyStateText : 'Try selecting a different category.'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {visibleCourses.map((course) => {
            const isEnrolled = isLoggedIn && courses.some((ec) => ec.id === course.id);
            const imageUrl = getCourseImage(course);
            
            return (
              <div key={course.id} style={styles.card}>
                <div style={styles.cardImageWrapper}>
                  <img 
                    src={imageUrl} 
                    alt={course.title}
                    style={styles.cardImage}
                    onError={(e) => {
                      e.target.src = COURSE_IMAGES.default;
                    }}
                  />
                  {isEnrolled && (
                    <span style={styles.enrolledBadge}>
                      {myCoursesConfig.enrolledBadgeText}
                    </span>
                  )}
                  {course.category && (
                    <span style={styles.categoryTag}>
                      {course.category}
                    </span>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTitle}>{course.title}</div>
                  {course.description && (
                    <div style={styles.cardDescription}>{course.description}</div>
                  )}
                  <div style={styles.cardMetaRow}>
                    <span style={styles.metaItem}>
                      <span style={styles.metaIcon}>⏱</span>
                      {course.duration || '—'}
                    </span>
                    <span style={styles.metaItem}>
                      <span style={styles.metaIcon}>📋</span>
                      {course.steps || course.subtopicCount || '—'} {myCoursesConfig.cardStepsText}
                    </span>
                    {course.level && (
                      <span style={styles.metaItem}>
                        <span style={styles.metaIcon}>📊</span>
                        {course.level}
                      </span>
                    )}
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

      <div style={styles.footer}>
        <p>{myCoursesConfig.footerText}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default MyCoursesPage;