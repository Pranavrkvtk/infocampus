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

// ─── Design tokens ───────────────────────────────────────────────────────
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
  success: '#2E8B57',
};

const TOPBAR = {
  bgGradient: 'linear-gradient(180deg, #2C3540 0%, #1F2933 100%)',
  bgActive: '#1A232E',
  bgHover: '#3A4553',
  border: '#3E4A58',
  text: '#FFFFFF',
};

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

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
  const [activeView, setActiveView] = useState('split');
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [images, setImages] = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentSubtopic, setCurrentSubtopic] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

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

        // 1. Get course from state
        if (state?.course) {
          courseData = state.course;
        } else {
          const savedCourse = localStorage.getItem('lastViewedCourse');
          if (savedCourse) {
            try {
              courseData = JSON.parse(savedCourse);
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

        // 2. Fetch course content from API - use public endpoint
        const apiData = await userApi.getPublicCourseById(courseData.id);
        console.log('📥 Course data loaded:', apiData);

        // 3. Format course data
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
          category: apiData.category || courseData.category || 'General',
          color: courseData.color || '#714B67',
          icon: courseData.icon || '📚',
          lastUpdate: apiData.lastUpdate || courseData.lastUpdate || new Date().toLocaleDateString(),
          certificate: apiData.certificate ?? courseData.certificate ?? true,
        };

        setCourse(formattedCourse);

        // 4. Process topics - CRITICAL for first topic free
        let rawTopics = apiData.topics || [];
        
        console.log('📚 Raw topics from API:', rawTopics);
        console.log('📚 Topics count:', rawTopics?.length || 0);

        // Ensure rawTopics is an array
        if (!Array.isArray(rawTopics)) {
          if (typeof rawTopics === 'object' && rawTopics !== null) {
            rawTopics = Object.values(rawTopics);
          } else {
            rawTopics = [];
          }
        }

        const allSubtopics = [];
        const normalizedTopics = rawTopics.map((topic, idx) => {
          // Handle both 'subTopics' and 'subtopics' field names
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

        console.log('📚 Normalized topics (for CourseDetailView):', normalizedTopics);
        console.log('📚 All subtopics:', allSubtopics);

        // ✅ Set topics state - this is what gets passed to CourseDetailView
        setTopics(normalizedTopics);
        setSubtopics(allSubtopics);

        // Auto-select first subtopic
        if (allSubtopics.length > 0) {
          setActiveSection(0);
          setCurrentSubtopic(allSubtopics[0]);
          
          // Load images for first subtopic
          try {
            const imagesData = await userApi.getSubtopicImages(allSubtopics[0].id);
            setImages(imagesData);
          } catch (imgError) {
            console.warn('Could not load images:', imgError);
          }
        }

        // Always show learning view
        setActiveView('split');

        // If no topics, show message
        if (rawTopics.length === 0) {
          setError('No lessons available yet');
        }

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
        window.location.href = '/login';
      }
    });
  };

  // ─── Handle login ──────────────────────────────────────────────────
  const handleLogin = () => {
    navigate('/login');
  };

  // ─── Top bar ──────────────────────────────────────────────────────────
  const TopBar = () => {
    const actionButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '0 24px',
      fontSize: '15px',
      fontWeight: 600,
      border: 'none',
      borderLeft: `1px solid ${TOPBAR.border}`,
      cursor: 'pointer',
      background: TOPBAR.bgActive,
      color: TOPBAR.text,
      height: '100%',
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
              style={{ ...actionButtonStyle, color: '#ff6b6b' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = TOPBAR.bgHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = TOPBAR.bgActive)}
            >
              <LogoutRoundedIcon style={{ fontSize: '20px' }} />
              {!isMobile && <span>Logout</span>}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              style={{ ...actionButtonStyle, color: '#F7C948' }}
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
  if (loading || contentLoading) {
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
          <div style={{ color: COLORS.slate }}>
            {contentLoading ? 'Loading course content...' : 'Loading course details...'}
          </div>
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

  // ─── Pass topics to CourseDetailView ──────────────────────────────────
  return (
    <CourseDetailView
      selectedCourse={course}
      topics={topics}           // ✅ This is the key - passing topics
      subtopics={subtopics}
      images={images}
      progress={progress}
      activeView={activeView}
      activeSection={activeSection}
      completedSections={completedSections}
      currentSubtopic={currentSubtopic}
      contentLoading={contentLoading}
      handleBack={() => navigate('/my-courses')}
      setActiveView={setActiveView}
      setActiveSection={setActiveSection}
      setCurrentSubtopic={setCurrentSubtopic}
      loadSubtopicImages={loadSubtopicImagesData}
      resetProgress={resetProgress}
      markSectionComplete={markSectionComplete}
      getImageSrc={getImageSrc}
      getImageUrl={getSubtopicImageUrl}
      handleImageError={handleImageError}
    />
  );
}