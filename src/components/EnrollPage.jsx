// src/components/EnrollPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import CourseDetailView from './CourseDetailView';
import userApi from '../api/UserApi';

// ─── Material UI Icons ──────────────────────────────────────────────────
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

// ─── Design tokens ───────────────────────────────────────────────────────
const COLORS = {
  plumDark: '#2D1B33',
  plumMid: '#4A2D54',
  plumLight: '#7A5A84',
  accent: '#8B5CF6',
  accentLight: '#A78BFA',
  accentDark: '#6D28D9',
  ink: '#1A1A2E',
  slate: '#6B7280',
  line: '#E5E7EB',
  paper: '#FFFFFF',
  canvas: '#F8FAFC',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gold: '#FCD34D',
};

const TOPBAR = {
  bgGradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
  bgActive: '#1E293B',
  bgHover: '#334155',
  border: '#334155',
  text: '#FFFFFF',
};

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

// ─── Date Formatting Helpers ────────────────────────────────────────────
const formatDate = (dateString, format = 'long') => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    switch (format) {
      case 'long':
        return date.toLocaleDateString('en-US', options);
      case 'short':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      case 'medium':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      case 'full':
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'relative':
        return getRelativeTime(date);
      case 'iso':
        return date.toISOString().split('T')[0];
      default:
        return date.toLocaleDateString('en-US', options);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const getRelativeTime = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const formatDateField = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// ─── Helper ──────────────────────────────────────────────────────────────
const getApiUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('data:image/') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const API_URL = getApiUrl();
  const BASE_URL = API_URL.replace(/\/api\/?$/, '');
  let normalizedPath = imageUrl;
  if (normalizedPath.startsWith('/api/')) normalizedPath = normalizedPath.substring(4);
  if (normalizedPath.startsWith('api/')) normalizedPath = normalizedPath.substring(4);
  if (normalizedPath.startsWith('/')) normalizedPath = normalizedPath.substring(1);
  if (!normalizedPath.includes('/')) normalizedPath = `uploads/${normalizedPath}`;
  return `${BASE_URL}/${normalizedPath}`;
};

export default function EnrollPage({ isMobile: isMobileProp, onBack }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ─── Learning view state ──────────────────────────────────────────────
  const [activeView, setActiveView] = useState('landing');
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [images, setImages] = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentSubtopic, setCurrentSubtopic] = useState(null);
  // ✅ REMOVED: setContentLoading is not used - removed from state
  const [imageErrors, setImageErrors] = useState({});
  const [openTopics, setOpenTopics] = useState({});

  const isMobile = typeof isMobileProp === 'boolean' ? isMobileProp : window.innerWidth < 768;

  // ─── Check login status ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!token && !!userId);
  }, []);

  // ─── Load course data ────────────────────────────────────────────────
  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      setError(null);

      try {
        let courseData = null;

        if (state?.course) {
          courseData = state.course;
          console.log('📥 Course from state:', courseData);
        } else if (courseId) {
          console.log('📥 Fetching course by ID:', courseId);
          try {
            const apiData = await userApi.getPublicCourseById(courseId);
            console.log('📥 API response:', apiData);
            
            courseData = {
              id: apiData.id,
              title: apiData.title || 'Course',
              description: apiData.description || 'No description available',
              level: apiData.level || 'All Levels',
              duration: apiData.duration || 'Self-paced',
              price: apiData.price || 49,
              imageUrl: apiData.imageUrl || '',
              instructor: apiData.instructor || 'Expert Instructor',
              members: apiData.members || 0,
              language: apiData.language || 'English',
              category: apiData.category || '',
              color: '#714B67',
              icon: '📚',
              lastUpdate: formatDateField(apiData.lastUpdate || apiData.updatedAt || apiData.createdAt),
              createdAt: apiData.createdAt,
              updatedAt: apiData.updatedAt,
            };
          } catch (fetchError) {
            console.error('Error fetching course:', fetchError);
            setError('Could not load course data');
            setLoading(false);
            return;
          }
        } else {
          const savedCourse = localStorage.getItem('lastViewedCourse');
          if (savedCourse) {
            try {
              courseData = JSON.parse(savedCourse);
              console.log('📥 Course from localStorage:', courseData);
            } catch (e) {
              console.error('Failed to parse saved course:', e);
            }
          }
        }

        if (!courseData) {
          setError('No course data found. Please go back and select a course.');
          setLoading(false);
          return;
        }

        console.log('📥 Fetching full course content for ID:', courseData.id);
        const apiData = await userApi.getPublicCourseById(courseData.id);
        console.log('📥 Course content loaded:', apiData);

        const formattedCourse = {
          id: apiData.id || courseData.id || 0,
          title: apiData.title || courseData.title || 'Course',
          description: apiData.description || courseData.description || 'No description available',
          level: apiData.level || courseData.level || 'All Levels',
          duration: apiData.duration || courseData.duration || 'Self-paced',
          price: apiData.price || courseData.price || 49,
          imageUrl: apiData.imageUrl || courseData.imageUrl || '',
          instructor: apiData.instructor || courseData.instructor || 'Expert Instructor',
          members: apiData.members || courseData.members || 0,
          language: apiData.language || courseData.language || 'English',
          category: '',
          color: courseData.color || '#714B67',
          icon: courseData.icon || '📚',
          lastUpdate: formatDateField(apiData.lastUpdate || apiData.updatedAt || apiData.createdAt || courseData.lastUpdate),
          createdAt: apiData.createdAt || courseData.createdAt,
          updatedAt: apiData.updatedAt || courseData.updatedAt,
        };

        setCourse(formattedCourse);

        let rawTopics = apiData.topics || [];
        
        console.log('📚 Raw topics from API:', rawTopics);
        console.log('📚 Topics count:', rawTopics?.length || 0);

        if (!Array.isArray(rawTopics)) {
          if (typeof rawTopics === 'object' && rawTopics !== null) {
            rawTopics = Object.values(rawTopics);
          } else {
            rawTopics = [];
          }
        }

        const allSubtopics = [];
        const normalizedTopics = rawTopics.map((topic, idx) => {
          const subs = topic.subTopics || topic.subtopics || [];
          const subsArray = Array.isArray(subs) ? subs : [];
          
          subsArray.forEach((sub) => {
            allSubtopics.push({
              id: sub.id,
              title: sub.title || 'Untitled',
              topicTitle: topic.title || `Topic ${idx + 1}`,
              content: sub.content || '',
              videoUrl: sub.videoUrl || '',
              videoUrls: sub.videoUrls || [],
              imageUrl: sub.imageUrl || '',
              images: sub.images || [],
              isFree: sub.isFree || topic.isFirstTopic || idx === 0,
              ...sub,
            });
          });
          
          return {
            id: topic.id || idx,
            title: topic.title || `Topic ${idx + 1}`,
            displayOrder: topic.displayOrder || idx,
            isFirstTopic: topic.isFirstTopic || idx === 0,
            subtopics: subsArray,
          };
        });

        console.log('📚 Normalized topics:', normalizedTopics);
        console.log('📚 All subtopics:', allSubtopics);

        setTopics(normalizedTopics);
        setSubtopics(allSubtopics);

        if (normalizedTopics.length > 0) {
          setOpenTopics({ 0: true });
        }

        if (allSubtopics.length > 0) {
          setActiveSection(0);
          setCurrentSubtopic(allSubtopics[0]);
          try {
            const imagesData = await userApi.getSubtopicImages(allSubtopics[0].id);
            setImages(imagesData);
          } catch (imgError) {
            console.warn('Could not load images:', imgError);
          }
        }

        if (rawTopics.length === 0) {
          setError('No lessons available yet');
        }

        setActiveView('landing');

      } catch (err) {
        console.error('❌ Error loading course:', err);
        setError(err.message || 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [state, courseId]);

  // ─── Resolve subtopic image URL ─────────────────────────────────────
  const getSubtopicImageUrl = useCallback((subtopicId, fileName) => {
    if (!subtopicId || !fileName) return FALLBACK_IMAGE;
    if (fileName.startsWith('http://') || fileName.startsWith('https://') || fileName.startsWith('data:image/')) {
      return fileName;
    }
    return resolveImageUrl(fileName);
  }, []);

  const getImageSrc = useCallback(
    (sid, fn, id) => {
      if (imageErrors[id]) return FALLBACK_IMAGE;
      if (fn) return getSubtopicImageUrl(sid, fn);
      return FALLBACK_IMAGE;
    },
    [imageErrors, getSubtopicImageUrl]
  );

  const handleImageError = useCallback((id) => {
    setImageErrors((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  // ─── Load subtopic images ────────────────────────────────────────────
  const loadSubtopicImagesData = useCallback(async (subtopicId) => {
    try {
      const data = await userApi.getSubtopicImages(subtopicId);
      setImages(data);
    } catch (err) {
      console.error('Error loading subtopic images:', err);
      setImages([]);
    }
  }, []);

  // ─── Mark section complete ─────────────────────────────────────────
  const markSectionComplete = (index) => {
    if (!course) return;
    if (!completedSections.includes(index)) {
      const newCompleted = [...completedSections, index];
      setCompletedSections(newCompleted);
      localStorage.setItem(`course_completed_${course.id}`, JSON.stringify(newCompleted));
      setProgress(subtopics.length ? (newCompleted.length / subtopics.length) * 100 : 0);
      Swal.fire({
        title: 'Section Completed! 🎉',
        text: `${Math.round((newCompleted.length / subtopics.length) * 100)}% complete`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // ─── Reset progress ────────────────────────────────────────────────
  const resetProgress = () => {
    if (!course) return;
    Swal.fire({
      title: 'Reset Progress?',
      text: 'This will clear all your completed sections.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(`course_completed_${course.id}`);
        setCompletedSections([]);
        setProgress(0);
        Swal.fire('Reset!', 'Progress reset.', 'success');
      }
    });
  };

  // ─── Handle Join Free ──────────────────────────────────────────────
  const handleJoinFree = () => {
    setActiveView('split');
  };

  // ─── Handle share ─────────────────────────────────────────────────
  const handleShare = () => {
    const shareData = {
      title: course?.title || 'Course',
      text: `Check out this course: ${course?.title}`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      Swal.fire({
        title: 'Link Copied!',
        text: 'Course link copied to clipboard.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  // ─── Handle home ────────────────────────────────────────────────────
  const handleHome = () => navigate('/my-courses');

  // ─── Handle logout ──────────────────────────────────────────────────
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
        navigate('/login');
      }
    });
  };

  // ─── Handle login ──────────────────────────────────────────────────
  const handleLogin = () => {
    navigate('/login');
  };

  const toggleTopic = (idx) => {
    setOpenTopics((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // ─── Top bar ──────────────────────────────────────────────────────────
  const TopBar = () => {
    const actionButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '0 24px',
      fontSize: '14px',
      fontWeight: 600,
      border: 'none',
      borderLeft: `1px solid ${TOPBAR.border}`,
      cursor: 'pointer',
      background: TOPBAR.bgActive,
      color: TOPBAR.text,
      height: '100%',
      transition: 'all 0.2s ease',
    };

    return (
      <div
        style={{
          height: '64px',
          background: TOPBAR.bgGradient,
          borderBottom: `1px solid ${TOPBAR.border}`,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'flex-end',
          color: TOPBAR.text,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
          <button
            onClick={handleShare}
            style={actionButtonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = TOPBAR.bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = TOPBAR.bgActive)}
          >
            <ShareOutlinedIcon style={{ fontSize: '20px' }} />
            {!isMobile && <span>Share</span>}
          </button>

          <button
            onClick={handleHome}
            style={actionButtonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = TOPBAR.bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = TOPBAR.bgActive)}
          >
            <HomeRoundedIcon style={{ fontSize: '20px' }} />
            {!isMobile && <span>Home</span>}
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{ ...actionButtonStyle, color: '#ef4444' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = TOPBAR.bgHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = TOPBAR.bgActive)}
            >
              <LogoutRoundedIcon style={{ fontSize: '20px' }} />
              {!isMobile && <span>Logout</span>}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              style={{ ...actionButtonStyle, color: '#FCD34D' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = TOPBAR.bgHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = TOPBAR.bgActive)}
            >
              <LoginRoundedIcon style={{ fontSize: '20px' }} />
              {!isMobile && <span>Sign In</span>}
            </button>
          )}
        </div>
      </div>
    );
  };

  // ─── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.canvas }}>
        <TopBar />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 64px)',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${COLORS.line}`,
              borderTopColor: COLORS.accent,
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <div style={{ color: COLORS.slate }}>Loading course details...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────
  if (error || !course) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.canvas }}>
        <TopBar />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {error === 'No lessons available yet' ? '📚' : '🔍'}
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px', color: COLORS.ink }}>
              {error || 'Course not found'}
            </h2>
            <p style={{ fontSize: '16px', color: COLORS.slate, marginBottom: '24px' }}>
              {error === 'No lessons available yet' 
                ? 'This course has no lessons yet. Check back later!' 
                : 'Please go back and select a course from the catalog.'}
            </p>
            <button
              onClick={() => navigate('/my-courses')}
              style={{
                background: COLORS.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Go to My Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Learning View (CourseDetailView) ─────────────────────────────────
  if (activeView === 'split') {
    return (
      <CourseDetailView
        selectedCourse={course}
        topics={topics}
        subtopics={subtopics}
        images={images}
        progress={progress}
        activeView={activeView}
        activeSection={activeSection}
        completedSections={completedSections}
        currentSubtopic={currentSubtopic}
        contentLoading={false}
        handleBack={() => setActiveView('landing')}
        setActiveView={setActiveView}
        setActiveSection={setActiveSection}
        setCurrentSubtopic={setCurrentSubtopic}
        loadSubtopicImages={loadSubtopicImagesData}
        resetProgress={resetProgress}
        markSectionComplete={markSectionComplete}
        getImageSrc={getImageSrc}
        getImageUrl={getSubtopicImageUrl}
        handleImageError={handleImageError}
        isGuest={!isLoggedIn}
      />
    );
  }

  // ─── Landing Page (Enroll Page UI) ──────────────────────────────────
  const hasTopics = topics && topics.length > 0;
  const totalLessons = subtopics.length;

  // Get the display date for the course
  const displayDate = course.lastUpdate || 
                     formatDateField(course.updatedAt) || 
                     formatDateField(course.createdAt) || 
                     'N/A';

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: COLORS.canvas }}>
      <TopBar />

      {/* ─── Hero Section ───────────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.plumDark} 0%, ${COLORS.plumMid} 50%, ${COLORS.plumLight} 100%)`,
          padding: isMobile ? '40px 20px' : '64px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span 
              style={{ 
                fontSize: '12px', 
                fontWeight: 600, 
                letterSpacing: '1px', 
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.1)',
                padding: '4px 16px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              {course.level || 'All Levels'}
            </span>
            {course.lastUpdate && (
              <span 
                style={{ 
                  fontSize: '12px', 
                  fontWeight: 500, 
                  color: 'rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                Updated: {course.lastUpdate}
              </span>
            )}
          </div>
          
          <h1
            style={{
              fontSize: isMobile ? '28px' : '44px',
              fontWeight: 800,
              letterSpacing: '-1px',
              margin: 0,
              marginBottom: '12px',
              color: '#FFFFFF',
              lineHeight: 1.1,
            }}
          >
            {course.title}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[...Array(5)].map((_, i) => (
                <StarRoundedIcon
                  key={i}
                  style={{
                    fontSize: '18px',
                    color: i < 4 ? COLORS.gold : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginLeft: '4px' }}>
                4.5 (1.2k reviews)
              </span>
            </div>
          </div>
          
          <p style={{ 
            fontSize: isMobile ? '14px' : '18px', 
            color: 'rgba(255,255,255,0.85)',
            maxWidth: '600px',
            lineHeight: 1.6,
            marginBottom: '20px',
          }}>
            {course.description}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              <AccessTimeRoundedIcon style={{ fontSize: '18px' }} />
              <span>{course.duration || 'Self-paced'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              <SchoolRoundedIcon style={{ fontSize: '18px' }} />
              <span>{totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              <LanguageRoundedIcon style={{ fontSize: '18px' }} />
              <span>{course.language || 'English'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body ───────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '24px 16px 48px' : '32px 40px 64px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 2.5fr',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left column - Join Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 12px 40px -12px rgba(139, 92, 246, 0.4)',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>Price</div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>
              ${course.price || 49}
              <span style={{ fontSize: '16px', fontWeight: 400, opacity: 0.7 }}> / lifetime</span>
            </div>
            
            <button
              onClick={handleJoinFree}
              style={{
                width: '100%',
                background: '#fff',
                color: COLORS.accent,
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🎯 Join Free
            </button>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', opacity: 0.9, marginBottom: '6px' }}>
                <SchoolRoundedIcon style={{ fontSize: '18px' }} />
                <span>{topics.length} Topics · {totalLessons} Lessons</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '12px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
            >
              <ShareOutlinedIcon style={{ fontSize: '18px' }} />
              Share this course
            </button>
          </div>

          {/* Course Information with Formatted Dates */}
          <div
            style={{
              background: COLORS.paper,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: `1px solid ${COLORS.line}`,
            }}
          >
            <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '14px', fontWeight: 700, color: COLORS.ink, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Course Information
            </h3>
            <InfoRow 
              icon={<EventNoteRoundedIcon />} 
              label="Last Update" 
              value={displayDate}
            />
            <InfoRow 
              icon={<AccessTimeRoundedIcon />} 
              label="Duration" 
              value={course.duration || 'Self-paced'} 
            />
            <InfoRow 
              icon={<SchoolRoundedIcon />} 
              label="Level" 
              value={course.level || 'All Levels'} 
            />
            <InfoRow 
              icon={<LanguageRoundedIcon />} 
              label="Language" 
              value={course.language || 'English'} 
              last={true}
            />
          </div>

          {/* Created/Updated Dates (Optional additional info) */}
          {(course.createdAt || course.updatedAt) && (
            <div
              style={{
                background: COLORS.paper,
                borderRadius: '16px',
                padding: '16px 20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: `1px solid ${COLORS.line}`,
                fontSize: '12px',
                color: COLORS.slate,
              }}
            >
              {course.createdAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Created:</span>
                  <span style={{ fontWeight: 500, color: COLORS.ink }}>
                    {formatDate(course.createdAt, 'full')}
                  </span>
                </div>
              )}
              {course.updatedAt && course.updatedAt !== course.createdAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Last Updated:</span>
                  <span style={{ fontWeight: 500, color: COLORS.ink }}>
                    {formatDate(course.updatedAt, 'full')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column - Topics Preview */}
        <div
          style={{
            background: COLORS.paper,
            borderRadius: '16px',
            padding: isMobile ? '20px' : '28px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: `1px solid ${COLORS.line}`,
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              color: COLORS.accent,
              paddingBottom: '12px',
              marginBottom: '20px',
              borderBottom: `2px solid ${COLORS.line}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Course Content</span>
            <span style={{ fontSize: '12px', color: COLORS.slate, fontWeight: 400 }}>
              {topics.length} {topics.length === 1 ? 'Topic' : 'Topics'} · {totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'}
            </span>
          </div>

          {!hasTopics ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: COLORS.slate,
                fontSize: '14px',
                background: COLORS.canvas,
                borderRadius: '10px',
                border: `1px dashed ${COLORS.line}`,
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>No lessons available yet</div>
              <div style={{ fontSize: '13px', color: COLORS.slate }}>
                This course is being prepared. Check back soon!
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topics.map((topic, idx) => {
                const subs = topic.subtopics || [];
                const isOpen = !!openTopics[idx];
                const isFirst = idx === 0;
                const isLocked = !isFirst;
                
                return (
                  <div
                    key={topic.id || idx}
                    style={{ 
                      border: `1px solid ${isLocked ? COLORS.line : isFirst ? COLORS.accent + '40' : COLORS.line}`, 
                      borderRadius: '12px', 
                      overflow: 'hidden',
                      background: isLocked ? 'rgba(0,0,0,0.02)' : 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      onClick={() => toggleTopic(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        cursor: 'pointer',
                        background: isFirst ? COLORS.accent + '10' : COLORS.canvas,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isFirst ? COLORS.accent : COLORS.line,
                          color: isFirst ? '#fff' : COLORS.slate,
                          fontSize: '12px',
                          fontWeight: 700,
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.ink }}>
                          {topic.title || `Topic ${idx + 1}`}
                        </span>
                        {isFirst && (
                          <span style={{ 
                            fontSize: '10px', 
                            background: COLORS.success, 
                            color: '#fff', 
                            padding: '2px 12px', 
                            borderRadius: '12px',
                            fontWeight: 600,
                          }}>
                            Free Preview
                          </span>
                        )}
                        {isLocked && (
                          <LockRoundedIcon style={{ fontSize: '16px', color: COLORS.slate }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: COLORS.slate }}>
                          {subs.length} {subs.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                        <ExpandMoreRoundedIcon
                          style={{
                            fontSize: '20px',
                            color: COLORS.slate,
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ padding: subs.length ? '4px 20px 16px' : '0 20px 16px' }}>
                        {subs.length === 0 ? (
                          <div style={{ fontSize: '13px', color: COLORS.slate, padding: '8px 0 4px 40px' }}>
                            No lessons available yet
                          </div>
                        ) : (
                          subs.map((sub, subIdx) => {
                            const isFree = sub.isFree || isFirst;
                            return (
                              <div
                                key={sub.id || subIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 0 10px 40px',
                                  borderTop: subIdx > 0 ? `1px solid ${COLORS.line}` : 'none',
                                  fontSize: '13px',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: COLORS.ink }}>
                                  {isFree ? (
                                    <PlayArrowRoundedIcon style={{ fontSize: '18px', color: COLORS.accent }} />
                                  ) : (
                                    <LockRoundedIcon style={{ fontSize: '16px', color: COLORS.slate }} />
                                  )}
                                  <span>{sub.title}</span>
                                  {isFree && (
                                    <span style={{ 
                                      fontSize: '9px', 
                                      background: '#D1FAE5', 
                                      color: '#065F46', 
                                      padding: '1px 8px', 
                                      borderRadius: '10px',
                                      fontWeight: 600,
                                    }}>
                                      Free
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: COLORS.slate, fontSize: '12px' }}>
                                  {sub.xp && <span>{sub.xp} XP</span>}
                                  {sub.duration && <span>{sub.duration}</span>}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── InfoRow component with date formatting ──────────────────────────────────
function InfoRow({ icon, label, value, last }) {
  // Check if the value is a date string that needs formatting
  const isDateValue = value && typeof value === 'string' && 
    (value.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(value));
  
  // Format the value if it's a date
  const displayValue = isDateValue ? formatDate(value, 'long') : value;
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: last ? 'none' : `1px solid ${COLORS.line}`,
        fontSize: '13px',
        gap: '12px',
      }}
    >
      <span style={{ color: COLORS.slate, display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      <span style={{ color: COLORS.slate, flex: 1 }}>{label}</span>
      <span style={{ color: COLORS.ink, fontWeight: 600 }}>{displayValue}</span>
    </div>
  );
}