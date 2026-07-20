// src/components/Enrollments.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UpdateIcon from '@mui/icons-material/Update';
import { getImageUrl } from '../utils/imageUtils';

// ─── Top Bar Colors ────────────────────────────────────────────────
const TOPBAR = {
  bg: '#2C3540',
  bgGradient: 'linear-gradient(180deg, #2C3540 0%, #1F2933 100%)',
  bgActive: '#1A232E',
  bgHover: '#3A4553',
  border: '#3E4A58',
  text: '#FFFFFF',
  muted: '#C9D2DC',
};

// ─── Palette ──────────────────────────────────────────────────────────
const COLORS = {
  pageBg: '#f0f2f5',
  cardBg: '#ffffff',
  textDark: '#1a1a2e',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  purpleText: '#5b21b6',
  green: '#12b76a',
  greenBg: '#e7f9ef',
  heroGradFrom: '#3d2b52',
  heroGradTo: '#2a2438',
  heroBlob: 'rgba(255,255,255,0.06)',
  purpleCard: 'linear-gradient(160deg, #2C3540 0%, #1A232E 100%)',
};

const formatDate = (d) => {
  try {
    return new Date(d || Date.now()).toLocaleDateString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric'
    });
  } catch {
    return '';
  }
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

  const isLoggedIn = !!localStorage.getItem('token');

  // ─── Fetch Course Details ──────────────────────────────────────────
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
  }, [courseId]);

  // ─── Check Enrollment Status ──────────────────────────────────────
  const checkEnrollmentStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const result = await checkEnrollment(courseId);
      if (result && result.enrolled) setIsEnrolled(true);
    } catch (err) {
      console.error('Error checking enrollment status:', err);
    }
  }, [courseId]);

  // ─── useEffect ────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    setCourse(null);
    setIsEnrolled(false);
    setEnrolling(false);

    if (courseId) {
      const stateCourse = location.state?.course;

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
  }, [courseId, location.state?.course, location.state?.isEnrolled, fetchCourseDetails, checkEnrollmentStatus]);

  // ✅ Handle free preview
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

  // ✅ Handle enroll
  const handleEnroll = async () => {
    if (isEnrolled) {
      navigate(`/course/${courseId}`);
      return;
    }

    setEnrolling(true);
    try {
      const response = await enrollInCourse(courseId);

      if (response && response.success !== false) {
        setIsEnrolled(true);
        navigate(`/course/${courseId}`);
      } else {
        throw new Error(response?.message || 'Enrollment failed');
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to enroll in course';

      if (errorMsg.toLowerCase().includes('already enrolled')) {
        setIsEnrolled(true);
        navigate(`/course/${courseId}`);
      } else {
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

  // ✅ Handle main action
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
  const isMobileDevice = isMobile || window.innerWidth < 768;

  // ✅ Get the image URL using the utility - support both image and imageUrl fields
  const getCourseImage = () => {
    if (course.image) {
      return getImageUrl(course.image);
    }
    if (course.imageUrl) {
      return getImageUrl(course.imageUrl);
    }
    return null;
  };

  const imageUrl = getCourseImage();

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: "100vh", background: COLORS.pageBg }}>

      {/* ─── TOP NAVIGATION BAR ────────────────────────────────────── */}
      <div style={{
        height: isMobileDevice ? '28px' : '32px',
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
              gap: isMobileDevice ? '2px' : '10px',
              padding: isMobileDevice ? '0 6px' : '0 24px',
              fontSize: isMobileDevice ? '10px' : '15px',
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
            <ShareOutlinedIcon style={{ fontSize: isMobileDevice ? '11px' : '20px' }} />
            <span style={{ display: isMobileDevice ? 'none' : 'inline' }}>Share</span>
          </button>

          <button
            onClick={handleHomeClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobileDevice ? '2px' : '10px',
              padding: isMobileDevice ? '0 6px' : '0 24px',
              fontSize: isMobileDevice ? '10px' : '15px',
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
            <HomeOutlinedIcon style={{ fontSize: isMobileDevice ? '11px' : '20px' }} />
            <span style={{ display: isMobileDevice ? 'none' : 'inline' }}>Home</span>
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobileDevice ? '2px' : '10px',
                padding: isMobileDevice ? '0 6px' : '0 24px',
                fontSize: isMobileDevice ? '10px' : '15px',
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
              <LogoutRoundedIcon style={{ fontSize: isMobileDevice ? '11px' : '20px' }} />
              <span style={{ display: isMobileDevice ? 'none' : 'inline' }}>Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobileDevice ? '2px' : '10px',
                padding: isMobileDevice ? '0 6px' : '0 24px',
                fontSize: isMobileDevice ? '10px' : '15px',
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
              <LoginRoundedIcon style={{ fontSize: isMobileDevice ? '11px' : '20px' }} />
              <span style={{ display: isMobileDevice ? 'none' : 'inline' }}>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── HERO / HEADER with Image ──────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.heroGradFrom} 0%, ${COLORS.heroGradTo} 100%)`,
        padding: isMobileDevice ? '32px 20px' : '48px 40px',
        color: '#fff',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobileDevice ? '1fr' : '1fr 280px',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobileDevice ? '28px' : '38px', 
              fontWeight: 700,
              letterSpacing: '-0.5px',
              marginBottom: '8px'
            }}>
              {course.title}
            </h1>
            <p style={{ 
              color: '#b8b0c9', 
              fontSize: isMobileDevice ? '14px' : '16px',
              marginBottom: '24px'
            }}>
              {course.subtitle || 'Join this course'}
            </p>

            {/* Course Stats */}
            <div style={{
              display: 'flex',
              gap: isMobileDevice ? '16px' : '32px',
              flexWrap: 'wrap',
              fontSize: isMobileDevice ? '13px' : '15px',
              color: '#d4cfe0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UpdateIcon style={{ fontSize: '18px' }} />
                <span>Last Update: {formatDate(course.updatedAt)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AccessTimeIcon style={{ fontSize: '18px' }} />
                <span>Completion: {course.duration || '2 hours 40 minutes'}</span>
              </div>
            </div>
          </div>

          {/* Course Image */}
          <div style={{
            width: '100%',
            height: isMobileDevice ? '160px' : '200px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={course.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="font-size:64px;opacity:0.3;">🖼️</div>';
                }}
              />
            ) : (
              <div style={{
                fontSize: '64px',
                opacity: 0.3,
              }}>
                🖼️
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ────────────────────────────────────────── */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobileDevice ? '24px 16px 60px' : '32px 40px 80px' 
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobileDevice ? '1fr' : '300px 1fr', 
          gap: '32px', 
          alignItems: 'start' 
        }}>

          {/* ── Left: Enroll Card ── */}
          <div style={{
            background: COLORS.purpleCard,
            borderRadius: '16px',
            padding: '24px',
            color: '#fff',
            position: isMobileDevice ? 'static' : 'sticky',
            top: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              marginTop: 0, 
              marginBottom: '20px',
              color: '#fff'
            }}>
              Join This Course
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontSize: '14px'
              }}>
                <span style={{ opacity: 0.7 }}>Price</span>
                <span style={{ fontWeight: 600 }}>${price}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                fontSize: '14px'
              }}>
                <span style={{ opacity: 0.7 }}>Period</span>
                <span style={{ fontWeight: 600 }}>{period}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 0',
                fontSize: '14px'
              }}>
                <span style={{ opacity: 0.7 }}>Access</span>
                <span style={{ fontWeight: 600, color: COLORS.green }}>Lifetime</span>
              </div>
            </div>

            <button
              onClick={handleMainAction}
              disabled={enrolling}
              style={{
                width: '100%',
                background: isEnrolled ? '#2e7d32' : '#fff',
                color: isEnrolled ? '#fff' : '#1A232E',
                border: 'none',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: enrolling ? 'not-allowed' : 'pointer',
                opacity: enrolling ? 0.7 : 1,
                transition: 'all 0.2s',
                marginBottom: '12px'
              }}
              onMouseEnter={(e) => {
                if (!enrolling && !isEnrolled) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {enrolling ? 'Processing…' : 
               isEnrolled ? '✅ Enrolled' : 
               isLoggedIn ? 'Enroll Now' : 
               'Join Free'}
            </button>

            {!isLoggedIn && !isEnrolled && (
              <button
                onClick={() => navigate('/login', { state: { from: `/enrollments/${courseId}` } })}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              >
                Sign in to enroll
              </button>
            )}

            <button
              onClick={handleShare}
              style={{
                width: '100%',
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ShareOutlinedIcon style={{ fontSize: '18px' }} />
              Share
            </button>
          </div>

          {/* ── Right: Course Description ── */}
          <div style={{
            background: COLORS.cardBg,
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{
              color: COLORS.textDark,
              fontSize: '15px',
              lineHeight: 1.8,
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {course.description || 'No description available for this course.'}
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Enrollments;