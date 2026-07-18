// src/components/Enrollments.jsx
import React, { useState, useEffect, useCallback } from 'react'; // ✅ Added useCallback
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  enrollInCourse,
  getPublicCourseById,
  checkEnrollment
} from '../api/UserApi';
import Swal from 'sweetalert2';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LockIcon from '@mui/icons-material/Lock';

// ─── Top Bar Colors (same as MyCoursesPage) ──────────────────────────────────────────────────
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

// ─── Palette ──────────────────────────────────────────────────────────
const COLORS = {
  navBg: '#161522',
  navBorder: '#2b2a3c',
  navHover: '#242335',
  heroGradFrom: '#3d2b52',
  heroGradTo: '#2a2438',
  heroBlob: 'rgba(255,255,255,0.06)',
  purpleCard: 'linear-gradient(160deg, #7c3aed 0%, #5b21b6 100%)',
  purpleText: '#5b21b6',
  pageBg: '#f4f5f8',
  cardBg: '#ffffff',
  textDark: '#1a1a2e',
  textMuted: '#6b7280',
  border: '#eef0f3',
  green: '#12b76a',
  greenBg: '#e7f9ef',
};

const formatDate = (d) => {
  try {
    return new Date(d || Date.now()).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  } catch {
    return '';
  }
};

// ─── Derive topic/lesson structure from whatever the course object has ──
const getTopics = (course) => {
  if (Array.isArray(course?.topics) && course.topics.length > 0) {
    return course.topics.map((t, i) => ({
      id: t.id || `topic-${i}`,
      title: t.title || `Topic ${i + 1}`,
      isFreePreview: !!t.isFreePreview || i === 0,
      lessons: Array.isArray(t.lessons) && t.lessons.length > 0
        ? t.lessons.map((l, j) => ({
            id: l.id || `lesson-${i}-${j}`,
            title: l.title || `Lesson ${j + 1}`,
            isFree: !!l.isFree || (i === 0 && j === 0),
          }))
        : [{ id: `lesson-${i}-0`, title: 'Lesson 1', isFree: i === 0 }],
    }));
  }

  const lessonCount = course?.lessonCount || 1;
  return [{
    id: 'topic-1',
    title: course?.title ? `Intro to ${course.title}` : 'Getting Started',
    isFreePreview: true,
    lessons: Array.from({ length: lessonCount }).map((_, i) => ({
      id: `lesson-${i}`,
      title: `Lesson ${i + 1}`,
      isFree: i === 0,
    })),
  }];
};

const Enrollments = ({ isMobile, onBack }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({ 'topic-1': true });

  const isLoggedIn = !!localStorage.getItem('token');

  // ─── Fetch Course Details ──────────────────────────────────────────
  // ✅ FIX: Wrap in useCallback to stabilize the function reference
  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPublicCourseById(courseId);

      let courseData = null;
      if (response) {
        if (response.course) courseData = response.course;
        else if (response.data?.course) courseData = response.data.course;
        else if (response.data) courseData = response.data;
        else if (response.id) courseData = response;
      }

      if (courseData && courseData.id) {
        setCourse(courseData);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError(err.response?.data?.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  }, [courseId]); // ✅ Depends only on courseId

  // ─── Check Enrollment Status ──────────────────────────────────────
  // ✅ FIX: Wrap in useCallback to stabilize the function reference
  const checkEnrollmentStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const result = await checkEnrollment(courseId);
      if (result && result.enrolled) setIsEnrolled(true);
    } catch (err) {
      console.error('Error checking enrollment status:', err);
    }
  }, [courseId]); // ✅ Depends only on courseId

  // ─── ✅ FIXED: useEffect with all dependencies properly included ──
  useEffect(() => {
    setLoading(true);
    setError(null);
    setCourse(null);
    setIsEnrolled(false);
    setEnrolling(false);

    if (courseId) {
      const stateCourse = location.state?.course;

      // ✅ FIX: Use === instead of ==
      if (stateCourse && stateCourse.id === courseId) {
        setCourse(stateCourse);
        if (location.state?.isEnrolled) setIsEnrolled(true);
        setLoading(false);
        checkEnrollmentStatus();
      } else {
        fetchCourseDetails();
        checkEnrollmentStatus();
      }
    } else {
      setLoading(false);
      setError('No course ID provided');
    }
  }, [courseId, location.state?.course, location.state?.isEnrolled, fetchCourseDetails, checkEnrollmentStatus]); // ✅ All dependencies included

  // ✅ Handle free preview - NO POPUP, directly navigate with isPreview flag
  const handleFreePreview = () => {
    navigate(`/course/${courseId}`, { 
      state: { 
        course: course,
        isPreview: true,
        isEnrolled: false,
        from: 'enrollments'
      } 
    });
  };

  // ✅ Handle enroll - NO POPUP, just navigate directly to course
  const handleEnroll = async () => {
    // If already enrolled, go to course directly (no popup)
    if (isEnrolled) {
      navigate(`/course/${courseId}`);
      return;
    }

    // User should be logged in at this point
    setEnrolling(true);
    try {
      const response = await enrollInCourse(courseId);

      if (response && response.success !== false) {
        setIsEnrolled(true);
        // ✅ NO POPUP - just navigate directly to course
        navigate(`/course/${courseId}`);
      } else {
        throw new Error(response?.message || 'Enrollment failed');
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to enroll in course';

      if (errorMsg.toLowerCase().includes('already enrolled')) {
        setIsEnrolled(true);
        // ✅ Direct navigation for already enrolled (no popup)
        navigate(`/course/${courseId}`);
      } else {
        // ✅ Show error popup only for actual failures
        Swal.fire({
          icon: 'error',
          title: 'Enrollment Failed',
          text: errorMsg,
          confirmButtonText: 'Try Again',
          confirmButtonColor: COLORS.purpleText
        });
      }
    } finally {
      setEnrolling(false);
    }
  };

  // ✅ Handle main button click - decide between preview or enroll
  const handleMainAction = () => {
    if (isLoggedIn) {
      handleEnroll();
    } else {
      handleFreePreview();
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/my-courses');
  };

  const handleShare = async () => {
    const shareData = {
      title: course?.title || 'Course',
      text: `Check out this course: ${course?.title || 'Course'}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        Swal.fire({
          title: 'Link Copied!',
          text: 'Course link copied to clipboard.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (clipError) {
          console.error('Failed to copy:', clipError);
        }
      }
    }
  };

  const handleHomeClick = () => navigate('/my-courses');

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

  const handleLogin = () => navigate('/login');

  const toggleTopic = (id) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Success screen ──────────────────────────────────────────────
  if (isEnrolled && !enrolling) {
    return (
      <div style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        minHeight: "100vh",
        background: COLORS.pageBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          textAlign: "center",
          padding: "48px 40px",
          background: "#fff",
          borderRadius: "24px",
          maxWidth: "520px",
          margin: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🎉</div>
          <h2 style={{ color: "#2e7d32", marginBottom: "16px", fontSize: "26px" }}>
            Successfully Enrolled!
          </h2>
          <p style={{ color: "#666", marginBottom: "8px", fontSize: "15px" }}>
            You now have full access to <strong>{course?.title}</strong>.
          </p>
          <p style={{ color: "#888", marginBottom: "32px", fontSize: "14px" }}>Start learning today!</p>
          <button
            onClick={() => navigate("/my-courses")}
            style={{
              background: COLORS.purpleText,
              color: "#fff",
              border: "none",
              borderRadius: "40px",
              padding: "14px 36px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              width: "100%"
            }}
          >
            Go to My Learning →
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', padding: '20px', background: COLORS.pageBg
      }}>
        <div style={{
          width: '50px', height: '50px', border: '4px solid #e5e7eb',
          borderTop: `4px solid ${COLORS.purpleText}`, borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading course details...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '20px', textAlign: 'center', background: COLORS.pageBg
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#dc2626', marginBottom: '8px' }}>Error</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
        <button
          onClick={handleBack}
          style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: COLORS.purpleText, color: '#fff', cursor: 'pointer', fontWeight: '600' }}
        >
          ← Browse Courses
        </button>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '20px', textAlign: 'center', background: COLORS.pageBg
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Course Not Found</h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>The course you're looking for doesn't exist.</p>
        <button
          onClick={handleBack}
          style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: COLORS.purpleText, color: '#fff', cursor: 'pointer', fontWeight: '600' }}
        >
          ← Browse Courses
        </button>
      </div>
    );
  }

  const price = course.price ?? 299;
  const period = course.pricePeriod || 'lifetime';
  const rating = course.rating || 4.5;
  const fullStars = Math.round(rating);
  const topics = getTopics(course);
  const totalLessons = topics.reduce((sum, t) => sum + t.lessons.length, 0);

  // ✅ Check if first topic has free lessons
  const hasFreeContent = topics.length > 0 && topics[0].lessons.some(l => l.isFree);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: "100vh", background: COLORS.pageBg }}>

      {/* ─── TOP NAVIGATION BAR (Same style as MyCoursesPage) ──────────────────────────────────── */}
      <div style={{
        height: '64px',
        background: TOPBAR.bgGradient,
        borderBottom: `1px solid ${TOPBAR.border}`,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        padding: 0,
        color: TOPBAR.text,
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: '0px',
          height: '100%',
        }}>
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0 24px',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              borderLeft: `1px solid ${TOPBAR.border}`,
              cursor: 'pointer',
              transition: 'background 0.15s',
              background: TOPBAR.bgActive,
              color: TOPBAR.text,
              height: '100%',
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.bgActive;
            }}
          >
            <ShareOutlinedIcon style={{ fontSize: '20px' }} />
            <span>Share</span>
          </button>

          <button
            onClick={handleHomeClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0 24px',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              borderLeft: `1px solid ${TOPBAR.border}`,
              cursor: 'pointer',
              transition: 'background 0.15s',
              background: TOPBAR.bgActive,
              color: TOPBAR.text,
              height: '100%',
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.bgActive;
            }}
          >
            <HomeOutlinedIcon style={{ fontSize: '20px' }} />
            <span>Home</span>
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 24px',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                borderLeft: `1px solid ${TOPBAR.border}`,
                cursor: 'pointer',
                transition: 'background 0.15s',
                background: TOPBAR.bgActive,
                color: '#ff6b6b',
                height: '100%',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TOPBAR.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = TOPBAR.bgActive;
              }}
            >
              <LogoutRoundedIcon style={{ fontSize: '20px' }} />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 24px',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                borderLeft: `1px solid ${TOPBAR.border}`,
                cursor: 'pointer',
                transition: 'background 0.15s',
                background: TOPBAR.bgActive,
                color: '#F7C948',
                height: '100%',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TOPBAR.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = TOPBAR.bgActive;
              }}
            >
              <LoginRoundedIcon style={{ fontSize: '20px' }} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${COLORS.heroGradFrom} 0%, ${COLORS.heroGradTo} 100%)`,
        padding: isMobile ? '40px 20px' : '56px 40px',
        color: '#fff',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '360px', height: '360px', borderRadius: '50%',
          background: COLORS.heroBlob, pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={pillStyle()}>{(course.level || 'All Levels').toUpperCase()}</span>
            <span style={pillStyle()}>Updated: {formatDate(course.updatedAt)}</span>
          </div>

          <h1 style={{ margin: 0, fontSize: isMobile ? '32px' : '44px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            {course.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0' }}>
            <span style={{ color: '#f59e0b', fontSize: '18px', letterSpacing: '2px' }}>
              {'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)}
            </span>
            <span style={{ color: '#d8d3e0', fontSize: '14px' }}>
              {rating} ({course.reviewCount || 1200} reviews)
            </span>
          </div>

          {course.description && (
            <p style={{ color: '#cdc4d9', fontSize: '15px', maxWidth: '640px', marginBottom: '20px', lineHeight: 1.6 }}>
              {course.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: '#e4dfeb' }}>
            <span>🕐 {course.duration || '6-10 hours'}</span>
            <span>🎓 {totalLessons} Lesson{totalLessons !== 1 ? 's' : ''}</span>
            <span>🌐 {course.language || 'English'}</span>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ────────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '28px 20px 60px' : '40px 40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '340px 1fr', gap: '28px', alignItems: 'start' }}>

          {/* ── Left: Price card ── */}
          <div style={{
            background: COLORS.purpleCard,
            borderRadius: '20px',
            padding: '28px',
            color: '#fff',
            position: isMobile ? 'static' : 'sticky',
            top: '24px',
            boxShadow: '0 20px 40px rgba(91,33,182,0.25)'
          }}>
            <p style={{ opacity: 0.8, fontSize: '13px', marginBottom: '4px', letterSpacing: '0.5px' }}>PRICE</p>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '38px', fontWeight: 800 }}>${price}</span>
              <span style={{ fontSize: '15px', opacity: 0.85 }}> / {period}</span>
            </div>

            {/* ✅ SINGLE BUTTON - "Join Free" for non-logged-in, "Enroll Now" for logged-in */}
            <button
              onClick={handleMainAction}
              disabled={enrolling}
              style={{
                width: '100%',
                background: '#fff',
                color: COLORS.purpleText,
                border: 'none',
                borderRadius: '50px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: enrolling ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: enrolling ? 0.7 : 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {enrolling ? 'Processing…' : 
               isEnrolled ? '✅ Already Enrolled' : 
               isLoggedIn ? '🎯 Enroll Now' : 
               '🚀 Join Free'}
            </button>

            {/* ✅ Login hint for non-logged-in users */}
            {!isLoggedIn && !isEnrolled && (
              <div style={{
                marginTop: '12px',
                textAlign: 'center',
                fontSize: '12px',
                opacity: 0.7,
                color: '#fff',
              }}>
                <span>🔓 First topic is free • </span>
                <span 
                  style={{ 
                    textDecoration: 'underline', 
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => navigate('/login', { state: { from: `/enrollments/${courseId}` } })}
                >
                  Sign In for full access
                </span>
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', margin: '20px 0', paddingTop: '16px', fontSize: '13px', opacity: 0.9 }}>
              🎓 {topics.length} Topic{topics.length !== 1 ? 's' : ''} · {totalLessons} Lesson{totalLessons !== 1 ? 's' : ''}
              {!isLoggedIn && hasFreeContent && (
                <span style={{ display: 'block', marginTop: '4px', fontSize: '12px', opacity: 0.8 }}>
                  🔓 First topic is free to preview
                </span>
              )}
            </div>

            <button
              onClick={handleShare}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <ShareOutlinedIcon style={{ fontSize: '16px' }} />
              Share this course
            </button>
          </div>

          {/* ── Right: Course content ── */}
          <div style={{ background: COLORS.cardBg, borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`
            }}>
              <span style={{ color: COLORS.purpleText, fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px' }}>
                COURSE CONTENT
              </span>
              <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>
                {topics.length} TOPIC{topics.length !== 1 ? 'S' : ''} · {totalLessons} LESSON{totalLessons !== 1 ? 'S' : ''}
              </span>
            </div>

            {topics.map((topic, i) => {
              const isOpen = !!expandedTopics[topic.id];
              const isFirstTopic = i === 0;
              const hasFreeLessons = topic.lessons.some(l => l.isFree);
              const isFreeTopic = isFirstTopic && hasFreeLessons;

              return (
                <div key={topic.id} style={{ borderBottom: i < topics.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
                  <div
                    onClick={() => toggleTopic(topic.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px 24px', cursor: 'pointer',
                      background: isOpen ? '#faf8fd' : '#fff',
                    }}
                  >
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      background: isFreeTopic ? COLORS.green : COLORS.purpleText,
                      color: '#fff', fontSize: '13px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontWeight: 600, color: COLORS.textDark, fontSize: '14px', flex: 1 }}>
                      {topic.title}
                    </span>
                    {isFreeTopic && (
                      <span style={{
                        background: COLORS.greenBg, color: COLORS.green, fontSize: '11px', fontWeight: 700,
                        padding: '3px 10px', borderRadius: '20px'
                      }}>
                        🔓 Free Preview
                      </span>
                    )}
                    {!isFirstTopic && !isLoggedIn && (
                      <LockIcon style={{ fontSize: '14px', color: COLORS.textMuted }} />
                    )}
                    <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>
                      {topic.lessons.length} lesson{topic.lessons.length !== 1 ? 's' : ''}
                    </span>
                    <ExpandMoreIcon style={{
                      color: COLORS.textMuted, fontSize: '20px',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'
                    }} />
                  </div>

                  {isOpen && (
                    <div style={{ background: '#faf8fd' }}>
                      {topic.lessons.map((lesson, idx) => {
                        const isFreeLesson = lesson.isFree || (isFirstTopic && idx === 0);
                        const isLocked = !isLoggedIn && !isFreeLesson;

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => {
                              if (isLocked) {
                                // ✅ Show login prompt only for locked lessons
                                Swal.fire({
                                  icon: 'info',
                                  title: 'Sign In Required',
                                  text: 'Please sign in to access this lesson.',
                                  confirmButtonText: 'Sign In',
                                  confirmButtonColor: COLORS.purpleText
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    navigate('/login', { state: { from: `/enrollments/${courseId}` } });
                                  }
                                });
                                return;
                              }
                              // ✅ Navigate directly for free lessons (no popup)
                              navigate(`/course/${courseId}`, { 
                                state: { 
                                  course: course,
                                  lessonId: lesson.id,
                                  isPreview: !isLoggedIn && isFreeLesson,
                                  isEnrolled: isLoggedIn && isEnrolled,
                                  from: 'enrollments'
                                } 
                              });
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              padding: '12px 24px 12px 56px',
                              cursor: isLocked ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              color: isLocked ? COLORS.textMuted : COLORS.textDark,
                              opacity: isLocked ? 0.7 : 1,
                              borderBottom: idx < topic.lessons.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                            }}
                          >
                            <PlayArrowIcon style={{ 
                              fontSize: '16px', 
                              color: isFreeLesson ? COLORS.green : COLORS.purpleText 
                            }} />
                            <span style={{ flex: 1 }}>{lesson.title}</span>
                            {isFreeLesson ? (
                              <span style={{
                                background: COLORS.greenBg, 
                                color: COLORS.green, 
                                fontSize: '11px', 
                                fontWeight: 700,
                                padding: '3px 10px', 
                                borderRadius: '20px'
                              }}>
                                Free
                              </span>
                            ) : isLoggedIn ? (
                              <span style={{
                                fontSize: '11px',
                                color: COLORS.textMuted,
                              }}>
                                {isEnrolled ? 'Available' : '🔒 Locked'}
                              </span>
                            ) : (
                              <LockIcon style={{ fontSize: '14px', color: COLORS.textMuted }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── shared inline style helpers ─────────────────────────────────────
const pillStyle = () => ({
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  padding: '5px 14px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.5px',
});

export default Enrollments;