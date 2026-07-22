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
  titleBar: '#7c4a72',
  titleBarDark: '#6b3f63',
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
        justifyContent: 'center', minHeight: '100vh', padding: '20px', background: COLORS.pageBg
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
        minHeight: '100vh', padding: '20px', textAlign: 'center', background: COLORS.pageBg
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
        minHeight: '100vh', padding: '20px', textAlign: 'center', background: COLORS.pageBg
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

  // ✅ Get the image URL using the utility
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

  // ✅ Get details from course
  const courseDetails = course.details || '';

  // Format content with proper paragraphs
  const formatContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;
      // Check if line is a bullet point
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '6px',
            paddingLeft: '4px',
          }}>
            <span style={{ color: COLORS.purpleText, fontWeight: 'bold' }}>•</span>
            <span>{trimmed.substring(1).trim()}</span>
          </div>
        );
      }
      // Regular paragraph
      return (
        <p key={index} style={{
          margin: '0 0 12px 0',
          lineHeight: '1.8',
          fontSize: '16px',
          color: '#3f3f46',
        }}>
          {trimmed}
        </p>
      );
    }).filter(Boolean);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
      background: COLORS.pageBg,
      overflow: "hidden",
      margin: 0,
      padding: 0,
    }}>

      {/* ─── TOP NAVIGATION BAR ────────────────────────────────────── */}
      <div style={{
        height: isMobileDevice ? '28px' : '32px',
        width: '100%',
        background: TOPBAR.bgGradient,
        borderBottom: "none",
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        margin: 0,
        padding: 0,
        color: TOPBAR.text,
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        flexShrink: 0,
        zIndex: 10,
        position: 'relative',
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

      {/* ─── MAIN CONTENT - FULL WIDTH, SCROLLS INDEPENDENTLY ───────── */}
      <div style={{
        flex: 1,
        width: '100%',
        overflow: 'auto',
        margin: 0,
        padding: 0,
      }}>
        <div style={{
          border: "none",
          borderRadius: 0,
          overflow: 'hidden',
          boxShadow: "none",
          background: COLORS.cardBg,
        }}>

          {/* Row 1: Image + Title bar - Odoo style with purple background behind image */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobileDevice ? '1fr' : '280px 1fr',
            background: `linear-gradient(135deg, ${COLORS.titleBar} 0%, ${COLORS.heroGradTo} 100%)`,
          }}>
            {/* Image Container - sits on top of purple background */}
            <div style={{
              width: '100%',
              padding: '16px 16px 16px 16px',
              background: 'transparent',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: isMobileDevice ? '190px' : '230px',
                borderRadius: '6px',
                background: '#e5e7eb',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                {/* Small floating icon, top-left of the image, Odoo-style */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  zIndex: 1,
                }}>
                  <HomeOutlinedIcon style={{ fontSize: '18px', color: '#fff' }} />
                </div>

                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={course.title}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:48px;background:linear-gradient(135deg, #6b3f63 0%, #2a2438 100%);color:#fff;">
                          🖼️
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%', 
                    fontSize: '48px',
                    background: 'linear-gradient(135deg, #6b3f63 0%, #2a2438 100%)',
                    color: 'rgba(255,255,255,0.5)'
                  }}>
                    🖼️
                  </div>
                )}
              </div>
            </div>

            {/* Title Container - purple background */}
            <div style={{
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              padding: isMobileDevice ? '16px 20px 20px 20px' : '16px 32px 16px 0',
              minHeight: isMobileDevice ? 'auto' : 'auto',
            }}>
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: isMobileDevice ? '28px' : '38px',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.5px',
                  lineHeight: '1.2',
                }}>
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p style={{
                    margin: '8px 0 0 0',
                    fontSize: isMobileDevice ? '14px' : '17px',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 400,
                  }}>
                    {course.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Tab bar — thin purple strip, tab hugs the sidebar edge */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobileDevice ? '1fr' : '280px 1fr',
          }}>
            <div style={{ display: isMobileDevice ? 'none' : 'block' }} />
            <div style={{
              background: COLORS.titleBarDark,
              padding: '3px 24px 0',
            }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fff',
                  color: '#333',
                  padding: '5px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid #d9d9d9',
                  borderBottom: 'none',
                  borderRadius: '3px 3px 0 0',
                }}
              >
                <HomeOutlinedIcon
                  style={{
                    fontSize: '13px',
                    color: '#000000'
                  }}
                />
                Course
              </span>
            </div>
          </div>

          {/* Row 3: Sidebar + Description */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobileDevice ? '1fr' : '280px 1fr',
            borderTop: `1px solid ${COLORS.border}`,
          }}>

            {/* Sidebar — Odoo style with minimal spacing */}
            <div style={{
              alignSelf: 'start',
              padding: isMobileDevice ? '8px' : '0px',
              background: 'transparent',
            }}>
              <div style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: '4px',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                margin: isMobileDevice ? '0px' : '4px 8px 8px 8px',
                width: isMobileDevice ? '100%' : 'calc(100% - 16px)',
              }}>
                {/* Odoo-style button - centered with margins */}
                <button
                  onClick={handleMainAction}
                  disabled={enrolling}
                  style={{
                    display: "block",
                    width: "calc(100% - 32px)",
                    margin: "12px 16px",
                    padding: "10px 14px",
                    background: isEnrolled ? "#2e7d32" : COLORS.titleBar,
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.15)",
                    borderRadius: "3px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".3px",
                    cursor: enrolling ? "not-allowed" : "pointer",
                    transition: "all .2s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,.15)"
                  }}
                  onMouseEnter={(e) => {
                    if (!enrolling && !isEnrolled) {
                      e.currentTarget.style.background = COLORS.titleBarDark;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!enrolling && !isEnrolled) {
                      e.currentTarget.style.background = COLORS.titleBar;
                    }
                  }}
                >
                  {enrolling
                    ? "Processing..."
                    : isEnrolled
                    ? "Enrolled"
                    : "Join This Course"}
                </button>

                <div style={{ padding: '0 16px 12px 16px' }}>
                  {/* Last Update */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '7px 0',
                    borderBottom: `1px solid ${COLORS.border}`,
                    fontSize: '13px'
                  }}>
                    <span style={{ color: COLORS.textMuted }}>Last Update</span>
                    <span style={{ fontWeight: 600, color: COLORS.textDark }}>{formatDate(course.updatedAt)}</span>
                  </div>

                  {/* Completion Time */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '7px 0',
                    borderBottom: `1px solid ${COLORS.border}`,
                    fontSize: '13px'
                  }}>
                    <span style={{ color: COLORS.textMuted }}>Completion Time</span>
                    <span style={{ fontWeight: 600, color: COLORS.textDark }}>{course.duration || '2 hours 40 minutes'}</span>
                  </div>

                  {/* Price */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '7px 0',
                    fontSize: '13px'
                  }}>
                    <span style={{ color: COLORS.textMuted }}>Price</span>
                    <span style={{ fontWeight: 700, color: COLORS.purpleText }}>${price} / {period}</span>
                  </div>

                  {/* Share button */}
                  <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: `1px solid ${COLORS.border}`,
                  }}>
                    <button
                      onClick={handleShare}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        color: COLORS.textMuted,
                        border: 'none',
                        padding: '4px 0',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = COLORS.textDark}
                      onMouseLeave={(e) => e.currentTarget.style.color = COLORS.textMuted}
                    >
                      <ShareOutlinedIcon style={{ fontSize: '16px' }} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{
              padding: isMobileDevice ? '20px' : '32px 40px',
              overflowY: 'auto',
              background: '#ffffff',
            }}>
              {courseDetails ? (
                <div style={{
                  fontSize: '16px',
                  lineHeight: '1.9',
                  color: '#1a1a2e',
                  maxWidth: '100%',
                }}>
                  {formatContent(courseDetails)}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: COLORS.textMuted,
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <p style={{ fontSize: '15px' }}>No course details available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Enrollments;