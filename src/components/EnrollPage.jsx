// src/components/EnrollPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

// ─── Material UI Icons ──────────────────────────────────────────────────
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

// ─── Design tokens (shared with MyCoursesPage) ──────────────────────────
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

export default function EnrollPage({ isMobile: isMobileProp, onBack }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openTopics, setOpenTopics] = useState({});

  const isMobile = typeof isMobileProp === 'boolean' ? isMobileProp : window.innerWidth < 768;

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!token && !!userId);
  }, []);

  // Load course data
  useEffect(() => {
    const loadCourse = () => {
      setLoading(true);
      setError(null);

      try {
        let courseData = null;

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

        if (courseData) {
          const formattedCourse = {
            id: courseData.id || 0,
            title: courseData.title || 'Course',
            description: courseData.description || 'No description available',
            level: courseData.level || 'All Levels',
            duration: courseData.duration || 'Self-paced',
            price: courseData.price || 49,
            imageUrl: courseData.imageUrl || '',
            instructor: courseData.instructor || 'Expert Instructor',
            members: courseData.members || 0,
            language: courseData.language || 'English',
            category: courseData.category || 'General',
            color: courseData.color || COLORS.plumMid,
            icon: courseData.icon || '📚',
            lastUpdate: courseData.lastUpdate || new Date().toLocaleDateString(),
            certificate: courseData.certificate ?? true,
            topics: courseData.topics || courseData.subTopics || [],
          };

          setCourse(formattedCourse);

          // Default-open the first topic
          if (formattedCourse.topics.length > 0) {
            setOpenTopics({ 0: true });
          }
        } else {
          setError('No course data found. Please go back and select a course.');
        }
      } catch (err) {
        console.error('❌ Error loading course:', err);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [state, courseId]);

  // Handle enroll
  const handleEnroll = () => {
    if (!isLoggedIn) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to enroll in this course.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
      return;
    }

    Swal.fire({
      title: 'Enroll Now',
      text: `You are about to enroll in "${course?.title}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enroll',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Enrolled! 🎉',
          text: 'You are now enrolled in this course!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Handle share
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

  // Handle home
  const handleHome = () => {
    navigate('/my-courses');
  };

  // Handle logout
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

  const toggleTopic = (idx) => {
    setOpenTopics((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // ─── Top bar (shared look with MyCoursesPage) ─────────────────────────
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
              onClick={() => navigate('/login')}
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px', color: COLORS.ink }}>
              {error || 'Course not found'}
            </h2>
            <p style={{ fontSize: '16px', color: COLORS.slate, marginBottom: '24px' }}>
              Please go back and select a course from the catalog.
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

  const topics = course.topics || [];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: COLORS.canvas }}>
      <TopBar />

      {/* ─── Hero / breadcrumb ─────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(120deg, ${COLORS.plumDark} 0%, ${COLORS.plumMid} 55%, ${COLORS.plumLight} 100%)`,
          padding: isMobile ? '48px 20px' : '64px 48px',
          minHeight: isMobile ? '180px' : '280px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? '26px' : '36px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            margin: 0,
            marginBottom: '10px',
          }}
        >
          {course.title}
        </h1>
        <div style={{ fontSize: '14px', opacity: 0.85 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/my-courses')}>
            Courses
          </span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{course.title}</span>
        </div>
      </div>

      {/* ─── Body ───────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '24px 16px 48px' : '32px 40px 64px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '340px 1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Join card */}
          <div
            style={{
              background: COLORS.accent,
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 12px 28px -12px rgba(59,35,64,0.5)',
            }}
          >
            <button
              onClick={handleEnroll}
              disabled={!isLoggedIn}
              style={{
                width: '100%',
                background: '#fff',
                color: !isLoggedIn ? COLORS.slate : COLORS.accent,
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                cursor: !isLoggedIn ? 'not-allowed' : 'pointer',
                marginBottom: '10px',
              }}
            >
              {!isLoggedIn ? 'Login to Enroll' : 'Join This Course'}
            </button>

            {!isLoggedIn && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginBottom: '12px',
                }}
              >
                <LockRoundedIcon style={{ fontSize: '14px' }} />
                Login required to enroll
              </div>
            )}

            <button
              onClick={handleShare}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '10px',
                padding: '10px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Share this course
            </button>
          </div>

          {/* Course information card */}
          <div
            style={{
              background: COLORS.paper,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: `1px solid ${COLORS.line}`,
            }}
          >
            <h3 style={{ margin: 0, marginBottom: '14px', fontSize: '16px', color: COLORS.ink }}>
              Course Information
            </h3>
            <InfoRow label="Last Update" value={course.lastUpdate} />
            <InfoRow label="Completion" value={course.duration} />
            <InfoRow label="Members" value={course.members} />
            <InfoRow label="Level" value={course.level} />
            <InfoRow label="Language" value={course.language} />
            <InfoRow label="Certificate" value={course.certificate ? 'Yes' : 'No'} last />
          </div>
        </div>

        {/* Right column */}
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
            }}
          >
            Overview
          </div>

          <h4 style={{ fontSize: '14px', fontWeight: 700, color: COLORS.ink, marginBottom: '8px' }}>
            Course Description
          </h4>
          <p style={{ color: COLORS.slate, lineHeight: 1.6, marginBottom: '28px', fontSize: '14px' }}>
            {course.description}
          </p>

          <h4 style={{ fontSize: '14px', fontWeight: 700, color: COLORS.ink, marginBottom: '14px' }}>
            Lessons · {topics.length} {topics.length === 1 ? 'lesson' : 'lessons'}
          </h4>

          {topics.length === 0 ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: COLORS.slate,
                fontSize: '13px',
                background: COLORS.canvas,
                borderRadius: '10px',
                border: `1px dashed ${COLORS.line}`,
              }}
            >
              No lessons available yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topics.map((topic, idx) => {
                const subs = topic.subTopics || topic.subtopics || [];
                const isOpen = !!openTopics[idx];
                return (
                  <div
                    key={topic.id || idx}
                    style={{ border: `1px solid ${COLORS.line}`, borderRadius: '10px', overflow: 'hidden' }}
                  >
                    <div
                      onClick={() => toggleTopic(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        background: COLORS.canvas,
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS.ink }}>
                        #{idx + 1} {topic.title || `Topic ${idx + 1}`}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: COLORS.slate }}>
                          {subs.length} {subs.length === 1 ? 'lesson' : 'lessons'}
                        </span>
                        <ExpandMoreRoundedIcon
                          style={{
                            fontSize: '18px',
                            color: COLORS.slate,
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                          }}
                        />
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ padding: subs.length ? '6px 16px 12px' : '0 16px 12px' }}>
                        {subs.length === 0 ? (
                          <div style={{ fontSize: '13px', color: COLORS.slate, padding: '6px 0' }}>
                            No lessons available yet
                          </div>
                        ) : (
                          subs.map((sub) => (
                            <div
                              key={sub.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 0',
                                borderTop: `1px solid ${COLORS.line}`,
                                fontSize: '13px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.ink }}>
                                {sub.completed ? (
                                  <CheckCircleRoundedIcon style={{ fontSize: '16px', color: COLORS.success }} />
                                ) : (
                                  <RadioButtonUncheckedRoundedIcon style={{ fontSize: '16px', color: COLORS.line }} />
                                )}
                                {sub.title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: COLORS.slate }}>
                                {sub.preview && (
                                  <span style={{ color: COLORS.accent, fontWeight: 600, fontSize: '12px' }}>
                                    Preview
                                  </span>
                                )}
                                {sub.xp && <span style={{ fontSize: '12px' }}>{sub.xp} XP</span>}
                              </div>
                            </div>
                          ))
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

// ─── Small row helper for the Course Information card ─────────────────────
function InfoRow({ label, value, last }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '9px 0',
        borderBottom: last ? 'none' : `1px solid ${COLORS.line}`,
        fontSize: '13px',
      }}
    >
      <span style={{ color: COLORS.slate }}>{label}</span>
      <span style={{ color: COLORS.ink, fontWeight: 600 }}>{value}</span>
    </div>
  );
}