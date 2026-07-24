// src/components/MyCoursesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseDetailView from './CourseDetailView';
import Swal from 'sweetalert2';
import {
  getEnrolledCourses,
  getSubtopicImages,
  getPublicCourses,
  getCoursePageSettings,
  getPublicHomeImages,
} from '../api/UserApi';

// ─── Material UI Icons ──────────────────────────────────────────────────
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SchoolIcon from '@mui/icons-material/School';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import GridViewIcon from '@mui/icons-material/GridView';
import AppsIcon from '@mui/icons-material/Apps';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

// ─── Hero Button Icon Resolver ──────────────────────────────────────
const getHeroButtonIcon = (iconName) => {
  const iconStyle = { fontSize: '18px' };
  const icons = {
    whatshot: <WhatshotIcon style={iconStyle} />,
    school: <SchoolIcon style={iconStyle} />,
    menuBook: <MenuBookIcon style={iconStyle} />,
    autoStories: <AutoStoriesIcon style={iconStyle} />,
    workspacePremium: <WorkspacePremiumIcon style={iconStyle} />,
    none: null,
  };
  return icons[iconName] !== undefined ? icons[iconName] : icons.whatshot;
};

// ─── Section Icons Mapping ──────────────────────────────────────────
const getSectionIcon = (iconName, iconColor = '#714B67') => {
  const iconStyle = { fontSize: '28px', color: iconColor };
  const icons = {
    grid: <GridViewIcon style={iconStyle} />,
    apps: <AppsIcon style={iconStyle} />,
    dashboard: <DashboardIcon style={iconStyle} />,
    module: <ViewModuleIcon style={iconStyle} />,
    list: <ViewListIcon style={iconStyle} />,
    carousel: <ViewCarouselIcon style={iconStyle} />,
    quilt: <ViewQuiltIcon style={iconStyle} />,
    stream: <ViewStreamIcon style={iconStyle} />,
    agenda: <ViewAgendaIcon style={iconStyle} />,
    compact: <ViewCompactIcon style={iconStyle} />,
    day: <ViewDayIcon style={iconStyle} />,
    week: <ViewWeekIcon style={iconStyle} />,
  };
  return icons[iconName] || icons.grid;
};

// ─── DEFAULT CONFIG (Fallback if API fails) ──────────────────────────
const DEFAULT_CONFIG = {
  heroEyebrow: "Networking & Security Academy",
  heroTitle: "Knowledge is a superpower",
  heroText: "Level up your networking and skills — from CCNA fundamentals to CCIE expert tracks. Your next certification starts here.",
  heroButtonText: "Pick a course →",
  heroButtonIcon: "whatshot",
  heroBgStart: "#3B2340",
  heroBgMid: "#5B3A63",
  heroBgEnd: "#83698A",
  sectionTitleMy: "My Courses",
  sectionTitleAll: "All Courses",
  myCoursesTabText: "My Courses",
  allCoursesTabText: "All Courses",
  searchPlaceholder: "Search courses...",
  cardDurationLabel: "⏱",
  enrolledBadgeText: "Enrolled",
  viewCourseButtonText: "View Course",
  continueLearningButtonText: "Continue Learning",
  emptyStateLoginTitle: "Login to see your courses",
  emptyStateLoginText: "Sign in to view your enrolled courses and track progress.",
  emptyStateLoginButton: "Sign In",
  emptyStateNoCoursesTitle: "No courses yet",
  emptyStateNoCoursesText: "Browse all courses and enroll to start learning.",
  emptyStateNoCoursesButton: "Browse All Courses",
  emptyStateNoAvailableTitle: "No courses available",
  emptyStateNoAvailableText: "Check back later for new courses.",
  footerText: "Browse our course catalog. Sign in to enroll and track progress.",
  sectionIcon: "grid",
  heroBtnBg: "#4f46e5",
  heroBtnTextColor: "#ffffff",
  heroBtnHoverBg: "#4338ca",
  primaryColor: "#4f46e5",
  iconColor: "#714B67",
  tabActiveBg: "#714B67",
  tabActiveText: "#ffffff",
  tabInactiveText: "#6B6470",
  categoryActiveBg: "#714B67",
  categoryActiveText: "#ffffff",
  categoryBorderColor: "#E8E3EA",
  viewBtnBg: "#ffffff",
  viewBtnText: "#714B67",
  viewBtnBorder: "#714B67",
  continueBtnBg: "#714B67",
  continueBtnText: "#ffffff",
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

// ─── Top Bar Colors (matching CourseDetailView) ────────────────────
const TOPBAR = {
  bg: '#2C3540',
  bgGradient: 'linear-gradient(180deg, #2C3540 0%, #1F2933 100%)',
  bgActive: '#1A232E',
  bgHover: '#3A4553',
  border: '#3E4A58',
  text: '#FFFFFF',
  muted: '#C9D2DC',
  lessonsColor: '#47525f',
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
  error: '#DC2626',
  sidebarBg: '#F1F5F9',
  sidebarBorder: '#E2E8F0',
  sidebarText: '#475569',
};

// ─── Course Image Mapping ────────────────────
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

// ─── Helper: Get API URL ──────────────────────────────────────────────
const getApiUrl = () => {
  return process.env.REACT_APP_API_URL || "http://localhost:8082/api";
};

// ─── Helper: Resolve Image URL ──────────────────────────────────────
const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  if (
    imageUrl.startsWith("data:image/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  const API_URL = getApiUrl();
  const BASE_URL = API_URL.replace(/\/api\/?$/, '');
  let normalizedPath = imageUrl;

  if (normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.substring(4);
  }
  if (normalizedPath.startsWith('api/')) {
    normalizedPath = normalizedPath.substring(4);
  }
  
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }

  if (!normalizedPath.includes('/')) {
    normalizedPath = `uploads/${normalizedPath}`;
  }

  return `${BASE_URL}/${normalizedPath}`;
};

// ─── Helper: Clean Hero Text ──────────────────────────────────────────
const cleanHeroText = (text) => {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const uniqueSentences = [];
  const seen = new Set();
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      uniqueSentences.push(trimmed);
    }
  }
  return uniqueSentences.join(' ');
};

function MyCoursesPage() {
  const navigate = useNavigate();
  
  // ─── State ──────────────────────────────────────────────────────────
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  // ─── Home Images State ──────────────────────────────────────────────
  const [homeImages, setHomeImages] = useState([]);
  const [loadingHomeImages, setLoadingHomeImages] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
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
  const [apiError, setApiError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('all');

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isSmallDesktop = window.innerWidth >= 1024 && window.innerWidth < 1280;

  const isLoggedIn = !!localStorage.getItem('token');

  // ─── LOAD HOME IMAGES ──────────────────────────────────────────────
  const loadHomeImages = useCallback(async () => {
    try {
      setLoadingHomeImages(true);
      const data = await getPublicHomeImages();
      console.log('📸 Home images loaded:', data);
      
      if (data && data.success && data.images) {
        setHomeImages(data.images);
      } else if (Array.isArray(data)) {
        setHomeImages(data);
      } else {
        setHomeImages([]);
      }
    } catch (error) {
      console.error('❌ Error loading home images:', error);
      setHomeImages([]);
    } finally {
      setLoadingHomeImages(false);
    }
  }, []);

  // ─── Auto-rotate hero images ──────────────────────────────────────
  useEffect(() => {
    if (homeImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % homeImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [homeImages.length]);

  // ─── Get home image URL ────────────────────────────────────────────
  const getHomeImageUrl = useCallback((image) => {
    if (!image?.imageUrl) return null;
    return resolveImageUrl(image.imageUrl);
  }, []);

  // ─── LOAD SETTINGS FROM API ──────────────────────────────────────
  const loadSettings = useCallback(async () => {
    try {
      const response = await getCoursePageSettings();
      console.log('📥 Settings API response:', response);
      
      if (response && response.success !== false) {
        const data = response.settings || response;
        
        let trackIcons = { ...DEFAULT_CONFIG.trackIcons };
        let trackColors = { ...DEFAULT_CONFIG.trackColors };
        
        if (data.trackIcons) {
          try {
            const parsed = typeof data.trackIcons === 'string' 
              ? JSON.parse(data.trackIcons) 
              : data.trackIcons;
            if (parsed && typeof parsed === 'object') {
              trackIcons = { ...DEFAULT_CONFIG.trackIcons, ...parsed };
            }
          } catch (e) {
            console.warn('Failed to parse track icons:', e);
          }
        }
        
        if (data.trackColors) {
          try {
            const parsed = typeof data.trackColors === 'string' 
              ? JSON.parse(data.trackColors) 
              : data.trackColors;
            if (parsed && typeof parsed === 'object') {
              trackColors = { ...DEFAULT_CONFIG.trackColors, ...parsed };
            }
          } catch (e) {
            console.warn('Failed to parse track colors:', e);
          }
        }
        
        const newConfig = {
          heroEyebrow: data.heroEyebrow || DEFAULT_CONFIG.heroEyebrow,
          heroTitle: data.heroTitle || DEFAULT_CONFIG.heroTitle,
          heroText: data.heroText || DEFAULT_CONFIG.heroText,
          heroButtonText: data.heroButtonText || DEFAULT_CONFIG.heroButtonText,
          heroButtonIcon: data.heroButtonIcon || DEFAULT_CONFIG.heroButtonIcon,
          heroBgStart: data.heroBgStart || DEFAULT_CONFIG.heroBgStart,
          heroBgMid: data.heroBgMid || DEFAULT_CONFIG.heroBgMid,
          heroBgEnd: data.heroBgEnd || DEFAULT_CONFIG.heroBgEnd,
          sectionTitleMy: data.sectionTitleMy || DEFAULT_CONFIG.sectionTitleMy,
          sectionTitleAll: data.sectionTitleAll || DEFAULT_CONFIG.sectionTitleAll,
          myCoursesTabText: data.tabMyText || data.myCoursesTabText || DEFAULT_CONFIG.myCoursesTabText,
          allCoursesTabText: data.tabAllText || data.allCoursesTabText || DEFAULT_CONFIG.allCoursesTabText,
          searchPlaceholder: data.searchPlaceholder || DEFAULT_CONFIG.searchPlaceholder,
          cardDurationLabel: data.cardDurationLabel || DEFAULT_CONFIG.cardDurationLabel,
          enrolledBadgeText: data.enrolledBadgeText || DEFAULT_CONFIG.enrolledBadgeText,
          viewCourseButtonText: data.viewCourseButtonText || DEFAULT_CONFIG.viewCourseButtonText,
          continueLearningButtonText: data.continueLearningButtonText || DEFAULT_CONFIG.continueLearningButtonText,
          emptyStateLoginTitle: data.emptyStateLoginTitle || DEFAULT_CONFIG.emptyStateLoginTitle,
          emptyStateLoginText: data.emptyStateLoginText || DEFAULT_CONFIG.emptyStateLoginText,
          emptyStateLoginButton: data.emptyStateLoginButton || DEFAULT_CONFIG.emptyStateLoginButton,
          emptyStateNoCoursesTitle: data.emptyStateNoCoursesTitle || DEFAULT_CONFIG.emptyStateNoCoursesTitle,
          emptyStateNoCoursesText: data.emptyStateNoCoursesText || DEFAULT_CONFIG.emptyStateNoCoursesText,
          emptyStateNoCoursesButton: data.emptyStateNoCoursesButton || DEFAULT_CONFIG.emptyStateNoCoursesButton,
          emptyStateNoAvailableTitle: data.emptyStateNoAvailableTitle || DEFAULT_CONFIG.emptyStateNoAvailableTitle,
          emptyStateNoAvailableText: data.emptyStateNoAvailableText || DEFAULT_CONFIG.emptyStateNoAvailableText,
          footerText: data.footerText || DEFAULT_CONFIG.footerText,
          sectionIcon: data.sectionIcon || DEFAULT_CONFIG.sectionIcon,
          heroBtnBg: data.heroBtnBg || DEFAULT_CONFIG.heroBtnBg,
          heroBtnTextColor: data.heroBtnTextColor || DEFAULT_CONFIG.heroBtnTextColor,
          heroBtnHoverBg: data.heroBtnHoverBg || DEFAULT_CONFIG.heroBtnHoverBg,
          primaryColor: data.primaryColor || DEFAULT_CONFIG.primaryColor,
          iconColor: data.iconColor || DEFAULT_CONFIG.iconColor,
          tabActiveBg: data.tabActiveBg || DEFAULT_CONFIG.tabActiveBg,
          tabActiveText: data.tabActiveText || DEFAULT_CONFIG.tabActiveText,
          tabInactiveText: data.tabInactiveText || DEFAULT_CONFIG.tabInactiveText,
          categoryActiveBg: data.categoryActiveBg || DEFAULT_CONFIG.categoryActiveBg,
          categoryActiveText: data.categoryActiveText || DEFAULT_CONFIG.categoryActiveText,
          categoryBorderColor: data.categoryBorderColor || DEFAULT_CONFIG.categoryBorderColor,
          viewBtnBg: data.viewBtnBg || DEFAULT_CONFIG.viewBtnBg,
          viewBtnText: data.viewBtnText || DEFAULT_CONFIG.viewBtnText,
          viewBtnBorder: data.viewBtnBorder || DEFAULT_CONFIG.viewBtnBorder,
          continueBtnBg: data.continueBtnBg || DEFAULT_CONFIG.continueBtnBg,
          continueBtnText: data.continueBtnText || DEFAULT_CONFIG.continueBtnText,
          trackIcons: trackIcons,
          trackColors: trackColors,
        };
        
        setConfig(newConfig);
        console.log('✅ Loaded settings from database:', newConfig);
      } else {
        console.log('⚠️ No valid settings found, using defaults');
        setConfig(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error('❌ Failed to load settings, using defaults:', error);
      setConfig(DEFAULT_CONFIG);
    } finally {
      setSettingsLoaded(true);
    }
  }, []);

  // ─── Handle Share ──────────────────────────────────────────────────
  const handleShare = async () => {
    const shareData = {
      title: 'NetLearn - Networking & Security Academy',
      text: 'Check out NetLearn - Your networking and security learning platform!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        Swal.fire({
          title: 'Link Copied!',
          text: 'Course link copied to clipboard.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Clipboard error:', error);
      }
    }
  };

  // ─── Handle Logout ──────────────────────────────────────────────────
  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      confirmButtonColor: '#dc2626',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    });
  };

  // ─── Handle Login ──────────────────────────────────────────────────
  const handleLogin = () => {
    window.location.href = '/login';
  };

  // ─── Get Course Image ────────────────────────────────────────────
  const getCourseImage = useCallback((course) => {
    if (course?.imageUrl) {
      const resolved = resolveImageUrl(course.imageUrl);
      if (resolved) return resolved;
    }

    const name = course?.title?.toLowerCase() || '';
    for (const [key, url] of Object.entries(COURSE_IMAGES)) {
      if (name.includes(key)) return url;
    }

    return COURSE_IMAGES.default;
  }, []);

  // ─── Get Subtopic Image URL ───────────────────────────────────────
  const getSubtopicImageUrl = useCallback((subtopicId, fileName) => {
    if (!subtopicId || !fileName) return FALLBACK_IMAGE;

    if (
      fileName.startsWith('http://') || 
      fileName.startsWith('https://') || 
      fileName.startsWith('data:image/')
    ) {
      return fileName;
    }

    return resolveImageUrl(fileName);
  }, []);

  // ✅ Fetch Enrolled Courses (only if logged in)
  const fetchEnrolledCourses = useCallback(async () => {
    if (!isLoggedIn) {
      setEnrolledCourses([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setLoadingError(null);
      
      const data = await getEnrolledCourses();
      console.log('📚 Enrolled courses data:', data);
      
      if (data && data.error) {
        console.error('API returned error:', data.error);
        setLoadingError(data.error);
        setEnrolledCourses([]);
        return;
      }
      
      let enrolledCoursesData = [];
      if (Array.isArray(data)) {
        enrolledCoursesData = data;
      } else if (data && data.courses) {
        enrolledCoursesData = data.courses;
      } else if (data && data.data) {
        enrolledCoursesData = Array.isArray(data.data) ? data.data : [];
      } else if (data && data.enrollments) {
        enrolledCoursesData = data.enrollments
          .filter(e => e.course)
          .map(e => e.course);
      }
      
      console.log('📚 Processed enrolled courses:', enrolledCoursesData);
      setEnrolledCourses(enrolledCoursesData);
      
      if (Array.isArray(enrolledCoursesData)) {
        enrolledCoursesData.forEach(course => {
          if (course.imageUrl) {
            const img = new Image();
            img.src = getCourseImage(course);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error fetching enrolled courses:', error);
      setEnrolledCourses([]);
      setLoadingError(error.message || 'Failed to load enrolled courses');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, getCourseImage]);

  // ─── Fetch All Courses (always accessible) ──────────────────────────
  const fetchAllCourses = useCallback(async () => {
    setLoadingAllCourses(true);
    setApiError(null);
    
    try {
      const data = await getPublicCourses();
      console.log('📚 All courses data:', data);
      
      if (data && data.error) {
        console.error('API returned error:', data.error);
        setApiError(data.error);
        setAllCourses([]);
        return;
      }
      
      const coursesData = Array.isArray(data) ? data : [];
      setAllCourses(coursesData);
      
      if (coursesData.length > 0) {
        coursesData.forEach(course => {
          const img = new Image();
          img.src = getCourseImage(course);
        });
      }
    } catch (error) {
      console.error('Error fetching public courses:', error);
      setAllCourses([]);
      setApiError('Unable to load courses. Please try again later.');
    } finally {
      setLoadingAllCourses(false);
    }
  }, [getCourseImage]);

  // ─── Load Subtopic Images ──────────────────────────────────────────
  const loadSubtopicImages = async (subtopicId) => {
    try {
      const data = await getSubtopicImages(subtopicId);
      setImages(data);
    } catch (error) {
      console.error('Error loading subtopic images:', error);
      setImages([]);
    }
  };

  // ✅ Check if Course is Enrolled (only if logged in)
  const isCourseEnrolled = (courseId) => {
    if (!isLoggedIn) return false;
    const coursesArray = Array.isArray(enrolledCourses) ? enrolledCourses : [];
    return coursesArray.some((ec) => ec.id === courseId);
  };

  // ─── Handle View Course ────────────────────────────────────────────
  const handleViewCourse = (course) => {
    console.log('📤 Viewing course:', course);
    
    const formattedCourse = {
      id: course.id,
      title: course.title || 'Course',
      description: course.description || 'No description available',
      level: course.level || 'All Levels',
      imageUrl: course.imageUrl || '',
      duration: course.duration || 'Self-paced',
      price: course.price || 49,
      instructor: course.instructor || 'Expert Instructor',
      members: course.members || 0,
      language: course.language || 'English',
      color: course.color || '#3abf94',
      icon: course.icon || '📚',
      lastUpdate: course.lastUpdate || course.updatedAt || new Date().toLocaleDateString(),
    };
    
    const enrolled = isCourseEnrolled(course.id);
    
    if (enrolled && isLoggedIn) {
      navigate(`/course/${course.id}`, { 
        state: { 
          course: formattedCourse,
          isEnrolled: true,
          from: 'my-courses'
        } 
      });
    } else {
      navigate(`/enrollments/${course.id}`, { 
        state: { 
          course: formattedCourse,
          isEnrolled: false,
          from: 'my-courses'
        } 
      });
    }
  };

  // ─── Handle Continue Learning ───────────────────────────────────────
  const handleContinueLearning = (course) => {
    if (!isLoggedIn) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to continue learning.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    
    const formattedCourse = {
      id: course.id,
      title: course.title || 'Course',
      description: course.description || 'No description available',
      level: course.level || 'All Levels',
      imageUrl: course.imageUrl || '',
      duration: course.duration || 'Self-paced',
      price: course.price || 49,
      instructor: course.instructor || 'Expert Instructor',
      members: course.members || 0,
      language: course.language || 'English',
      color: course.color || '#3abf94',
      icon: course.icon || '📚',
      lastUpdate: course.lastUpdate || course.updatedAt || new Date().toLocaleDateString(),
    };
    
    navigate(`/course/${course.id}`, { 
      state: { 
        course: formattedCourse,
        isEnrolled: true,
        from: 'my-courses'
      } 
    });
  };

  // ─── Handle Back to Catalog ────────────────────────────────────────
  const handleBackToCatalog = () => {
    setSelectedCourse(null);
    setActiveView('catalog');
    setTopics([]);
    setSubtopics([]);
    setImages([]);
    setImageErrors({});
    setCurrentSubtopic(null);
    navigate('/my-courses');
  };

  // ─── Mark Section Complete ─────────────────────────────────────────
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

  // ─── Reset Progress ────────────────────────────────────────────────
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

  // ─── Handle Image Error ────────────────────────────────────────────
  const handleImageError = (id) => {
    if (!imageErrors[id]) setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // ─── Get Image Source ──────────────────────────────────────────────
  const getImageSrc = (sid, fn, id) => {
    if (imageErrors[id]) return FALLBACK_IMAGE;
    if (fn) {
      return getSubtopicImageUrl(sid, fn);
    }
    return FALLBACK_IMAGE;
  };

  // ─── Load settings on mount ──────────────────────────────────────
  useEffect(() => {
    loadSettings();
    loadHomeImages();
  }, [loadSettings, loadHomeImages]);

  useEffect(() => {
    fetchAllCourses();
    
    if (isLoggedIn) {
      fetchEnrolledCourses();
    } else {
      setLoading(false);
      setActiveTab('all');
    }
  }, [fetchEnrolledCourses, fetchAllCourses, isLoggedIn]);

  // ─── Get unique categories from courses ──────────────────────────
  const getCategories = () => {
    const cats = new Set();
    const coursesArray = Array.isArray(allCourses) ? allCourses : [];
    coursesArray.forEach(course => {
      const category = course.category || course.track || '';
      if (category && category !== 'General' && category !== 'general' && category !== '') {
        cats.add(category);
      }
    });
    return ['all', ...Array.from(cats)];
  };

  const categories = getCategories();

  // ✅ Get displayed courses based on active tab
  const getDisplayedCourses = () => {
    if (activeTab === 'my' && isLoggedIn) {
      return enrolledCourses;
    }
    return allCourses;
  };

  // ─── Filter courses by category and search ──────────────────────
  const getFilteredCourses = () => {
    const coursesArray = Array.isArray(getDisplayedCourses()) ? getDisplayedCourses() : [];
    
    let filtered = coursesArray;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(course => {
        const category = course.category || course.track || '';
        return category === activeCategory;
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter((c) => 
        c.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const visibleCourses = getFilteredCourses();

  // ─── Get grid columns based on screen size ──────────────────────
  const getGridColumns = () => {
    if (isMobile) return '1fr';
    if (isTablet) return '2fr';
    if (isSmallDesktop) return '3fr';
    return 'repeat(4, 1fr)';
  };

  // ─── Get track icon and color for course ──────────────────────────
  const getTrackInfo = (courseTitle) => {
    const title = courseTitle?.toLowerCase() || '';
    const trackKeys = Object.keys(config.trackIcons);
    
    for (const key of trackKeys) {
      if (title.includes(key) && key !== 'default') {
        return {
          icon: config.trackIcons[key] || '📄',
          color: config.trackColors[key] || '#F2F1F6'
        };
      }
    }
    
    return {
      icon: config.trackIcons.default || '📄',
      color: config.trackColors.default || '#F2F1F6'
    };
  };

  // ─── Render Empty State ──────────────────────────────────────────
  const renderEmptyState = () => {
    if (!isLoggedIn) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔒</div>
          <h3 style={styles.emptyTitle}>{config.emptyStateLoginTitle}</h3>
          <p style={styles.emptyText}>{config.emptyStateLoginText}</p>
          <button 
            onClick={handleLogin}
            style={{
              ...styles.heroBtn,
              marginTop: '8px',
            }}
          >
            {config.emptyStateLoginButton}
          </button>
        </div>
      );
    }

    if (activeTab === 'my' && enrolledCourses.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>{config.emptyStateNoCoursesTitle}</h3>
          <p style={styles.emptyText}>{config.emptyStateNoCoursesText}</p>
          <button 
            onClick={() => setActiveTab('all')}
            style={{
              ...styles.heroBtn,
              marginTop: '8px',
            }}
          >
            {config.emptyStateNoCoursesButton}
          </button>
        </div>
      );
    }

    if (allCourses.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>{config.emptyStateNoAvailableTitle}</h3>
          <p style={styles.emptyText}>{config.emptyStateNoAvailableText}</p>
          {apiError && (
            <button 
              onClick={() => fetchAllCourses()}
              style={{
                ...styles.heroBtn,
                marginTop: '8px',
              }}
            >
              🔄 Retry
            </button>
          )}
        </div>
      );
    }

    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🔍</div>
        <h3 style={styles.emptyTitle}>No results found</h3>
        <p style={styles.emptyText}>Try adjusting your search or filter.</p>
      </div>
    );
  };

  // ─── Get current hero image ──────────────────────────────────────────
  const currentHeroImage = homeImages.length > 0 
    ? getHomeImageUrl(homeImages[heroImageIndex]) 
    : null;

  // ─── Styles ──────────────────────────────────────────────────────
  const styles = {
    page: { 
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      background: COLORS.canvas, 
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
      color: COLORS.ink,
      overflow: "hidden",
      margin: 0,
      padding: 0,
    },

    topBar: {
      height: isMobile ? '28px' : '32px',
      background: TOPBAR.bgGradient,
      borderBottom: "none",
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'flex-end',
      padding: 0,
      color: TOPBAR.text,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      flexShrink: 0,
      zIndex: 10,
      position: 'relative',
    },
    topBarRight: {
      display: 'flex',
      alignItems: 'stretch',
      gap: '0px',
      height: '100%',
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '2px' : '10px',
      padding: isMobile ? '0 6px' : '0 24px',
      fontSize: isMobile ? '10px' : '15px',
      fontWeight: 600,
      border: 'none',
      borderLeft: `1px solid ${TOPBAR.border}`,
      cursor: 'pointer',
      transition: 'background 0.15s',
      background: TOPBAR.bgActive,
      color: TOPBAR.text,
      height: '100%',
      borderRadius: 0,
    },

    scrollableContent: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: 0,
      margin: 0,
    },

    // ─── HERO WITH IMAGE ON RIGHT ───────────────────────────────────
    hero: { 
      position: 'relative', 
      overflow: 'hidden', 
      background: `linear-gradient(135deg, ${config.heroBgStart} 0%, ${config.heroBgMid} 55%, ${config.heroBgEnd} 100%)`, 
      padding: isMobile ? '40px 20px' : '60px 70px', 
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: isMobile ? 'auto' : '340px',
      gap: '40px',
    },
    heroContent: {
      flex: 1,
      maxWidth: currentHeroImage ? '700px' : '100%',
      zIndex: 2,
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
      lineHeight: 1.8, 
      opacity: 0.88, 
      maxWidth: '600px',
      width: '100%',
      marginBottom: '28px' 
    },
    heroBtn: { 
      background: config.heroBtnBg || '#4f46e5',
      color: config.heroBtnTextColor || '#ffffff',
      border: 'none', 
      borderRadius: '8px', 
      padding: '12px 24px', 
      fontWeight: 700, 
      fontSize: '14px', 
      cursor: 'pointer', 
      boxShadow: '0 10px 25px -8px rgba(0,0,0,0.4)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
    },
    heroImageCard: {
      flex: '0 0 520px',
      maxWidth: '520px',
      width: '100%',
      height: isMobile ? '240px' : '360px',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.15)',
      position: 'relative',
      zIndex: 2,
      background: '#ffffff',
    },
    heroImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'left center',
      display: 'block',
      transition: 'opacity 1s ease-in-out',
    },
    heroImageIndicator: {
      position: 'absolute',
      bottom: '12px',
      right: '16px',
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      padding: '4px 12px',
      borderRadius: '16px',
      zIndex: 3,
    },
    heroImageDot: (active) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: active ? '#ffffff' : 'rgba(255,255,255,0.4)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    }),
    heroImageCounter: {
      fontSize: '10px',
      color: 'rgba(255,255,255,0.7)',
      marginLeft: '4px',
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
      color: COLORS.ink,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
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
      color: COLORS.slate,
      pointerEvents: 'none',
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
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },

    tabContainer: {
      display: 'flex',
      gap: '4px',
      padding: isMobile ? '12px 16px 0' : '16px 40px 0',
      maxWidth: '1440px',
      margin: '0 auto',
    },
    tabButton: (active) => ({
      padding: '8px 20px',
      borderRadius: '10px',
      border: 'none',
      background: active ? (config.tabActiveBg || COLORS.accent) : 'transparent',
      color: active ? (config.tabActiveText || '#fff') : (config.tabInactiveText || COLORS.slate),
      fontSize: '14px',
      fontWeight: active ? 700 : 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }),

    categoryTabs: {
      display: 'flex',
      gap: '8px',
      padding: isMobile ? '8px 16px 0' : '8px 40px 0',
      maxWidth: '1440px',
      margin: '0 auto',
      overflowX: 'auto',
      flexWrap: isMobile ? 'nowrap' : 'wrap',
    },
    categoryTab: (active) => ({
      padding: '6px 16px',
      borderRadius: '8px',
      border: `2px solid ${active ? (config.categoryActiveBg || COLORS.accent) : (config.categoryBorderColor || COLORS.line)}`,
      background: active ? (config.categoryActiveBg || COLORS.accent) : COLORS.paper,
      color: active ? (config.categoryActiveText || '#fff') : COLORS.slate,
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }),

    grid: { 
      display: 'grid', 
      gridTemplateColumns: getGridColumns(),
      gap: '20px', 
      padding: isMobile ? '20px 16px 48px' : '24px 40px 64px', 
      maxWidth: '1440px', 
      margin: '0 auto' 
    },

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
      fontSize: '14px',
      color: COLORS.slate,
    },
    cardFooter: { 
      padding: '0 16px 14px',
      marginTop: '2px',
    },
    viewBtn: { 
      width: '100%', 
      padding: '10px', 
      background: config.viewBtnBg || '#ffffff',
      color: config.viewBtnText || COLORS.accent,
      border: `2px solid ${config.viewBtnBorder || COLORS.accent}`,
      borderRadius: '10px', 
      fontWeight: 600, 
      fontSize: '13px', 
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    },
    continueBtn: { 
      width: '100%', 
      padding: '10px', 
      background: config.continueBtnBg || COLORS.accent,
      color: config.continueBtnText || '#ffffff',
      border: 'none', 
      borderRadius: '10px', 
      fontWeight: 600, 
      fontSize: '13px', 
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
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
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
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

  // ─── Loading State ──────────────────────────────────────────────────
  if (loading || loadingAllCourses || !settingsLoaded) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>{!settingsLoaded ? 'Loading settings...' : (isLoggedIn ? 'Loading your courses...' : 'Loading courses...')}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
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
  const sectionIcon = getSectionIcon(config.sectionIcon, config.iconColor);
  const heroIcon = getHeroButtonIcon(config.heroButtonIcon);

  const formatCategoryName = (cat) => {
    if (cat === 'all') return 'All';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const cleanedHeroText = cleanHeroText(config.heroText);

  return (
    <div style={styles.page}>
      {/* ─── TOP NAVIGATION BAR ────────────────────────────────────── */}
      <div style={styles.topBar}>
        <div style={styles.topBarRight}>
          <button
            onClick={handleShare}
            className="action-btn"
            style={styles.actionButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.bgActive;
            }}
          >
            <ShareOutlinedIcon style={{ fontSize: isMobile ? '11px' : '20px' }} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Share</span>
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="action-btn"
              style={{
                ...styles.actionButton,
                color: '#ff6b6b',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TOPBAR.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = TOPBAR.bgActive;
              }}
            >
              <LogoutRoundedIcon style={{ fontSize: isMobile ? '11px' : '20px' }} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="action-btn"
              style={{
                ...styles.actionButton,
                color: '#F7C948',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TOPBAR.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = TOPBAR.bgActive;
              }}
            >
              <LoginRoundedIcon style={{ fontSize: isMobile ? '11px' : '20px' }} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── SCROLLABLE CONTENT ────────────────────────────────────── */}
      <div style={styles.scrollableContent}>
        {/* Hero Section - WITH IMAGE ON RIGHT (Conditional) */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.heroEyebrow}>{config.heroEyebrow}</div>
            <h1 style={styles.heroTitle}>{config.heroTitle}</h1>
            <p style={styles.heroText}>
              {cleanedHeroText}
            </p>
            <button 
              style={styles.heroBtn} 
              onClick={() => {
                document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = config.heroBtnHoverBg || '#4338ca';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = config.heroBtnBg || '#4f46e5';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {heroIcon}
              {config.heroButtonText}
            </button>
          </div>

          {/* ─── HOME IMAGE ON RIGHT SIDE - CONDITIONAL RENDERING ───────────── */}
          {currentHeroImage && (
            <div style={styles.heroImageCard}>
              <img 
                src={currentHeroImage} 
                alt="Home page banner"
                style={styles.heroImage}
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              {homeImages.length > 1 && (
                <div style={styles.heroImageIndicator}>
                  {homeImages.map((_, index) => (
                    <div
                      key={index}
                      style={styles.heroImageDot(index === heroImageIndex)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroImageIndex(index);
                      }}
                    />
                  ))}
                  <span style={styles.heroImageCounter}>
                    {heroImageIndex + 1}/{homeImages.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section Bar */}
        <div style={styles.sectionBar} id="courses-section">
          <div style={styles.sectionTitle}>
            {sectionIcon}
            <span style={{ marginLeft: '8px' }}>
              {activeTab === 'my' && isLoggedIn ? config.sectionTitleMy : config.sectionTitleAll}
            </span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 400, 
              color: COLORS.slate,
              marginLeft: '12px',
              background: COLORS.line,
              padding: '2px 12px',
              borderRadius: '20px',
            }}>
              {visibleCourses.length}
            </span>
          </div>
          <div style={styles.searchWrap}>
            <SearchIcon style={styles.searchIcon} />
            <input
              type="text"
              placeholder={config.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* ─── TABS - WRAPPED WITH isLoggedIn CHECK ─────────────────── */}
        {isLoggedIn && (
          <div style={styles.tabContainer}>
            <button
              style={styles.tabButton(activeTab === 'my')}
              onClick={() => {
                setActiveTab('my');
                setActiveCategory('all');
                setSearchTerm('');
              }}
            >
              {config.myCoursesTabText}
              {enrolledCourses.length > 0 && (
                <span style={{
                  fontSize: '11px',
                  background: activeTab === 'my' ? 'rgba(255,255,255,0.2)' : COLORS.line,
                  padding: '1px 8px',
                  borderRadius: '10px',
                }}>
                  {enrolledCourses.length}
                </span>
              )}
            </button>
            <button
              style={styles.tabButton(activeTab === 'all')}
              onClick={() => {
                setActiveTab('all');
                setActiveCategory('all');
                setSearchTerm('');
              }}
            >
              {config.allCoursesTabText}
              {allCourses.length > 0 && (
                <span style={{
                  fontSize: '11px',
                  background: activeTab === 'all' ? 'rgba(255,255,255,0.2)' : COLORS.line,
                  padding: '1px 8px',
                  borderRadius: '10px',
                }}>
                  {allCourses.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Category Tabs */}
        {activeTab === 'all' && categories.length > 1 && (
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
        )}

        {/* Courses Grid */}
        {visibleCourses.length === 0 ? (
          renderEmptyState()
        ) : (
          <div style={styles.grid}>
            {visibleCourses.map((course) => {
              const isEnrolled = isLoggedIn && isCourseEnrolled(course.id);
              const imageUrl = getCourseImage(course);
              
              return (
                <div key={course.id} style={styles.card}>
                  <div style={styles.cardImageWrapper}>
                    <img 
                      src={imageUrl} 
                      alt={course.title}
                      style={styles.cardImage}
                      onError={(e) => {
                        const name = course?.title?.toLowerCase() || '';
                        let fallback = COURSE_IMAGES.default;
                        for (const [key, url] of Object.entries(COURSE_IMAGES)) {
                          if (name.includes(key)) {
                            fallback = url;
                            break;
                          }
                        }
                        e.target.src = fallback;
                      }}
                    />
                    {isEnrolled && (
                      <span style={styles.enrolledBadge}>
                        <BookmarkIcon style={{ fontSize: '12px' }} />
                        {config.enrolledBadgeText}
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
                        <AccessTimeIcon style={styles.metaIcon} />
                        {course.duration || '—'}
                      </span>
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
                        <PlayArrowIcon style={{ fontSize: '16px' }} />
                        {config.continueLearningButtonText}
                      </button>
                    ) : (
                      <button
                        style={styles.viewBtn}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleViewCourse(course); 
                        }}
                      >
                        <ArrowBackIcon style={{ fontSize: '16px', transform: 'rotate(180deg)' }} />
                        {isLoggedIn ? config.viewCourseButtonText : 'View Details'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={styles.footer}>
          <p>{config.footerText}</p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default MyCoursesPage;