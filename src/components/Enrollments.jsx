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
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
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

// ─── Odoo Palette ──────────────────────────────────────────────────
const COLORS = {
  pageBg: '#f0eeee',
  cardBg: '#ffffff',
  textDark: '#1a1a2e',
  textMuted: '#6b7280',
  border: '#d9d9d9',
  purpleText: '#5b21b6',
  green: '#12b76a',
  greenBg: '#e7f9ef',
  heroGradFrom: '#3d2b52',
  heroGradTo: '#2a2438',
  titleBar: '#7c4a72',
  titleBarDark: '#6b3f63',
};

// ✅ Currency symbol helper - INR as default
const getCurrencySymbol = (currencyCode) => {
  const currencyMap = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    BRL: 'R$',
    CNY: '¥',
    KRW: '₩'
  };
  const code = currencyCode || 'INR';
  return currencyMap[code] || '₹';
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
        // Navigate directly to course page without showing success screen
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

  // ─── Handle Logout with SweetAlert2 Popup ──────────────────────────
  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6B6470',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          navigate('/login');
        });
      }
    });
  };

  const handleLogin = () => navigate('/login');

  // ─── REMOVED: Success screen is now removed ────────────────────
  // The if (isEnrolled && !enrolling) block has been removed

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: '20px', background: "#ffffff"
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
        minHeight: '100vh', padding: '20px', textAlign: 'center', background: "#ffffff"
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
        minHeight: '100vh', padding: '20px', textAlign: 'center', background: "#ffffff"
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
  const currency = course.currency || 'INR';
  const isMobileDevice = isMobile || window.innerWidth < 768;
  const members = course.members || course.students || 100908;

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

  // Format content with proper paragraphs - Odoo style
  const formatContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '4px',
            paddingLeft: '0px',
          }}>
            <span style={{ color: COLORS.purpleText, fontWeight: 'bold', fontSize: '14px' }}>•</span>
            <span style={{ fontSize: '14px', lineHeight: '1.6', color: '#4c4c4c' }}>{trimmed.substring(1).trim()}</span>
          </div>
        );
      }
      return (
        <p key={index} style={{
          margin: '0 0 10px 0',
          lineHeight: '1.6',
          fontSize: '14px',
          color: '#4c4c4c',
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
      fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      background: "#ffffff",
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

      {/* ─── MAIN CONTENT - ODOO SINGLE GRID ──────────────────────── */}
      <div style={{
        flex: 1,
        width: '100%',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        background: COLORS.pageBg,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobileDevice ? '1fr' : '245px 1fr',
          gridTemplateRows: isMobileDevice ? 'auto auto auto' : '110px 1fr',
          height: '100%',
          background: '#ffffff',
        }}>

          {/* ════════════════════════════════════════════════════════ */}
          {/* ROW 1, COL 1: Image - Flush with header                */}
          {/* ════════════════════════════════════════════════════════ */}
          <div style={{
            gridColumn: '1',
            gridRow: '1',
            padding: 0,
            margin: 0,
            height: '110px',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${COLORS.titleBar} 0%, ${COLORS.heroGradTo} 100%)`,
          }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={course.title}
                style={{
                  width: '100%',
                  height: '110px',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;height:110px;font-size:36px;background:linear-gradient(135deg, ${COLORS.titleBar} 0%, ${COLORS.heroGradTo} 100%);color:rgba(255,255,255,0.3);">
                      📚
                    </div>
                  `;
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '110px',
                fontSize: '36px',
                background: `linear-gradient(135deg, ${COLORS.titleBar} 0%, ${COLORS.heroGradTo} 100%)`,
                color: 'rgba(255,255,255,0.3)',
              }}>
                📚
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════ */}
          {/* ROW 1, COL 2: Purple Header - Odoo height 110px        */}
          {/* ════════════════════════════════════════════════════════ */}
          <div style={{
            gridColumn: '2',
            gridRow: '1',
            background: `linear-gradient(135deg, ${COLORS.titleBar} 0%, ${COLORS.heroGradTo} 100%)`,
            height: '110px',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '34px',
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '-0.5px',
                lineHeight: '1.2',
                fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
              }}>
                {course.title}
              </h1>
              {course.subtitle && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 400,
                }}>
                  {course.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════ */}
          {/* ROW 2, COL 1: Sidebar Card - No gap, no border-radius  */}
          {/* ════════════════════════════════════════════════════════ */}
          <div style={{
            gridColumn: '1',
            gridRow: '2',
            padding: 0,
            margin: 0,
            background: '#ffffff',
            borderRight: `1px solid ${COLORS.border}`,
          }}>
            <div style={{
              border: `1px solid ${COLORS.border}`,
              borderTop: 'none',
              borderRadius: 0,
              boxShadow: 'none',
              margin: 0,
              padding: 0,
              background: '#ffffff',
              height: '100%',
            }}>
              {/* Odoo-style Join Button */}
              <button
                onClick={handleMainAction}
                disabled={enrolling}
                style={{
                  display: "block",
                  width: "calc(100% - 24px)",
                  margin: "14px 12px 12px 12px",
                  padding: "10px 14px",
                  background: isEnrolled ? "#2e7d32" : COLORS.titleBar,
                  color: "#fff",
                  border: "none",
                  borderRadius: "3px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".4px",
                  cursor: enrolling ? "not-allowed" : "pointer",
                  transition: "all .2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
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
                  ? "✓ joined"
                  : "Join This Course"}
              </button>

              <div style={{ padding: '0 12px 12px 12px' }}>
                {/* Last Update */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontSize: '12px'
                }}>
                  <span style={{ color: COLORS.textMuted }}>Last Update</span>
                  <span style={{ fontWeight: 600, color: COLORS.textDark }}>
                    {formatDate(course.updatedAt)}
                  </span>
                </div>

                {/* Completion Time */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontSize: '12px'
                }}>
                  <span style={{ color: COLORS.textMuted }}>Completion Time</span>
                  <span style={{ fontWeight: 600, color: COLORS.textDark }}>
                    {course.duration || '2 hours 40 minutes'}
                  </span>
                </div>

                {/* Members */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontSize: '12px'
                }}>
                  <span style={{ color: COLORS.textMuted }}>Members</span>
                  <span style={{ fontWeight: 600, color: COLORS.textDark }}>
                    <PeopleAltOutlinedIcon style={{ fontSize: '13px', marginRight: '3px', verticalAlign: 'middle' }} />
                    {members.toLocaleString()}
                  </span>
                </div>

                {/* Price with Currency */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  fontSize: '12px'
                }}>
                  <span style={{ color: COLORS.textMuted }}>Price</span>
                  <span style={{ fontWeight: 700, color: COLORS.purpleText, fontSize: '13px' }}>
                    {getCurrencySymbol(currency)}{price} / {period}
                  </span>
                </div>

                {/* Share button */}
                <div style={{
                  marginTop: '8px',
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
                      padding: '3px 0',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      justifyContent: 'center',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = COLORS.titleBar}
                    onMouseLeave={(e) => e.currentTarget.style.color = COLORS.textMuted}
                  >
                    <ShareOutlinedIcon style={{ fontSize: '14px' }} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════ */}
          {/* ROW 2, COL 2: PURPLE Tab Bar + WHITE Course Tab        */}
          {/* ════════════════════════════════════════════════════════ */}
          <div style={{
            gridColumn: '2',
            gridRow: '2',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}>
            {/* ─── Purple Tab Bar Background ── */}
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.titleBar} 0%, ${COLORS.heroGradTo} 100%)`,
              padding: '0 16px',
              borderBottom: `1px solid ${COLORS.titleBarDark}`,
              display: 'flex',
              alignItems: 'flex-end',
              height: '31px',
              flexShrink: 0,
            }}>
              {/* ─── White Course Tab ── */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#ffffff',
                color: '#333',
                padding: '0 14px',
                height: '31px',
                fontSize: '12px',
                fontWeight: 600,
                border: `1px solid ${COLORS.border}`,
                borderBottom: 'none',
                borderRadius: '2px 2px 0 0',
                marginBottom: '-1px',
                fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
              }}>
                <HomeOutlinedIcon style={{ fontSize: '12px', color: COLORS.titleBar }} />
                Course
              </div>
            </div>

            {/* ─── Description Content - Odoo padding ── */}
            <div style={{
              padding: '18px 28px',
              overflowY: 'auto',
              flex: 1,
              background: '#ffffff',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              {courseDetails ? (
                <div style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#4c4c4c',
                  maxWidth: '100%',
                  width: '100%',
                  boxSizing: 'border-box',
                  fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
                }}>
                  {formatContent(courseDetails)}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: COLORS.textMuted,
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>📝</div>
                  <p style={{ fontSize: '14px' }}>No course details available.</p>
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