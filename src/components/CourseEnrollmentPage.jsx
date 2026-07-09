// src/components/CourseEnrollmentPage.jsx
// Course enrollment page with JOIN on left, content on right

import React, { useState, useEffect, useCallback } from 'react';
import { 
  getCourseDetails, 
  getEnrollmentCount 
} from '../api/UserApi';

// ─── Design tokens ─────────────────────────────────────────────────────
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
  gold: '#E8B84B',
  error: '#DC3545',
};

// ─── CourseEnrollmentPage Component ──────────────────────────────────

export default function CourseEnrollmentPage({
  course,
  onEnroll,
  onBack,
  onStartLearning,
  isEnrolled = false,
  enrollmentDate = null,
  loading = false,
  viewOnly = false,
  isLoggedIn = false,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loadingEnrollmentCount, setLoadingEnrollmentCount] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [completedLessons, setCompletedLessons] = useState({});

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  // ─── Fetch Functions ──────────────────────────────────────────────

  const fetchCourseDetails = useCallback(async (courseId) => {
    setLoadingDetails(true);
    try {
      const data = await getCourseDetails(courseId);
      console.log('Course details from API:', data);
      setCourseDetails(data);
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const fetchEnrollmentCount = useCallback(async (courseId) => {
    setLoadingEnrollmentCount(true);
    try {
      const data = await getEnrollmentCount(courseId);
      console.log('Enrollment count from API:', data);
      setEnrollmentCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching enrollment count:', error);
      setEnrollmentCount(0);
    } finally {
      setLoadingEnrollmentCount(false);
    }
  }, []);

  // ─── Effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (course?.id) {
      fetchCourseDetails(course.id);
      fetchEnrollmentCount(course.id);
    }
  }, [course?.id, fetchCourseDetails, fetchEnrollmentCount]);

  // ─── Toggle Section ──────────────────────────────────────────────────

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleLessonComplete = (sectionIndex, lessonIndex) => {
    const key = `${sectionIndex}-${lessonIndex}`;
    setCompletedLessons(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ─── Build Course Data ──────────────────────────────────────────────

  const buildCourseData = () => {
    if (courseDetails && courseDetails.course) {
      const apiCourse = courseDetails.course;
      const topics = courseDetails.topics || [];

      const syllabus = topics.map(topic => ({
        title: topic.title || 'Untitled Topic',
        duration: `${topic.subtopics?.length || 0} lessons`,
        lessons: topic.subtopics || [],
      }));

      const students = enrollmentCount || 0;

      return {
        id: apiCourse.id,
        title: apiCourse.title || 'Course',
        subtitle: apiCourse.description?.substring(0, 100) || 'Learn with expert instructors',
        rating: apiCourse.rating || 4.8,
        reviews: apiCourse.reviews || 1247,
        students: students,
        lastUpdate: apiCourse.updatedAt ? new Date(apiCourse.updatedAt).toLocaleDateString() : '7/9/2026',
        duration: apiCourse.duration || '3-5 hours',
        level: apiCourse.level || 'Intermediate',
        language: 'English',
        certificate: 'Yes',
        price: apiCourse.price || 2344,
        image: apiCourse.imageUrl || '',
        description: apiCourse.description || 'Master networking fundamentals with this comprehensive course.',
        syllabus: syllabus.length > 0 ? syllabus : [
          { 
            title: 'OSA', 
            duration: '0 lessons', 
            lessons: [] 
          },
          { 
            title: 'OS2 -2', 
            duration: '1 lesson', 
            lessons: [
              { title: 'SUBTOPIC1', xp: 40 },
            ] 
          },
        ],
        topics: topics,
      };
    }

    return course || {
      id: 1,
      title: 'ccna-302',
      subtitle: 'xhjxx',
      rating: 4.8,
      reviews: 1247,
      students: enrollmentCount || 0,
      lastUpdate: '7/9/2026',
      duration: '3-5 hours',
      level: 'Intermediate',
      language: 'English',
      certificate: 'Yes',
      price: 2344,
      description: 'xhjxx',
      syllabus: [
        { 
          title: 'OSA', 
          duration: '0 lessons', 
          lessons: [] 
        },
        { 
          title: 'OS2 -2', 
          duration: '1 lesson', 
          lessons: [
            { title: 'SUBTOPIC1', xp: 40 },
          ] 
        },
      ],
    };
  };

  const courseData = buildCourseData();

  // ─── Handlers ──────────────────────────────────────────────────────

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    handleEnroll();
  };

  const handleEnroll = async () => {
    if (isEnrolling || loading) return;
    setIsEnrolling(true);
    try {
      await onEnroll();
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (onStartLearning) onStartLearning();
  };

  const handleShare = async () => {
    const shareData = {
      title: courseData.title,
      text: `Check out ${courseData.title} on NetLearn!`,
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
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Clipboard error:', error);
      }
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    window.location.href = '/login';
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  // ─── Styles ──────────────────────────────────────────────────────────

  const styles = {
    page: {
      background: COLORS.canvas,
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px 40px',
    },
    
    // ─── Top Navigation ──────────────────────────────────────────────
    topNav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '12px 0' : '16px 0',
      borderBottom: `1px solid ${COLORS.line}`,
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '12px',
    },
    backLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: COLORS.slate,
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      textDecoration: 'none',
      background: 'transparent',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '8px',
      transition: 'all 0.2s',
    },

    // ─── Main Layout ──────────────────────────────────────────────────
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 2fr',
      gap: '32px',
      alignItems: 'start',
    },
    leftColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: isMobile ? 'static' : 'sticky',
      top: '20px',
    },
    rightColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },

    // ─── Breadcrumb ──────────────────────────────────────────────────
    breadcrumb: {
      fontSize: '13px',
      color: COLORS.slate,
      marginBottom: '8px',
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },

    // ─── Course Header (Right Column) ──────────────────────────────
    courseHeader: {
      background: COLORS.paper,
      borderRadius: '16px',
      padding: isMobile ? '20px' : '24px',
      border: `1px solid ${COLORS.line}`,
    },
    courseTitle: {
      fontSize: isMobile ? '24px' : '28px',
      fontWeight: 800,
      color: COLORS.ink,
      letterSpacing: '-0.5px',
      marginBottom: '4px',
    },
    courseSubtitle: {
      fontSize: isMobile ? '15px' : '17px',
      color: COLORS.slate,
      marginBottom: '8px',
    },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: '8px',
    },
    stars: {
      color: COLORS.gold,
      fontSize: '16px',
      letterSpacing: '1px',
    },
    ratingText: {
      fontSize: '13px',
      color: COLORS.slate,
    },
    enrolledBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(46, 139, 87, 0.15)',
      color: COLORS.success,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
    },
    metaRow: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      fontSize: '13px',
      color: COLORS.slate,
      paddingTop: '8px',
      borderTop: `1px solid ${COLORS.line}`,
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },

    // ─── Tab Navigation ──────────────────────────────────────────────
    tabs: {
      display: 'flex',
      gap: '0',
      borderBottom: `1px solid ${COLORS.line}`,
      marginBottom: '20px',
      overflowX: 'auto',
    },
    tab: (active) => ({
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: active ? 700 : 500,
      color: active ? COLORS.accent : COLORS.slate,
      borderBottom: active ? `3px solid ${COLORS.accent}` : '3px solid transparent',
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }),

    // ─── Description ──────────────────────────────────────────────────
    section: {
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 700,
      color: COLORS.ink,
      marginBottom: '10px',
    },
    paragraph: {
      color: COLORS.slate,
      lineHeight: 1.8,
      fontSize: '15px',
    },

    // ─── Syllabus (Lessons) ──────────────────────────────────────────
    syllabusItem: {
      borderBottom: `1px solid ${COLORS.line}`,
      padding: '10px 0',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    syllabusHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
    },
    syllabusTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: COLORS.ink,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    syllabusTitlePrefix: {
      color: COLORS.slate,
      fontWeight: 400,
      fontSize: '13px',
    },
    syllabusMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '12px',
      color: COLORS.slate,
    },
    syllabusLessons: {
      paddingLeft: '28px',
      marginTop: '6px',
    },
    lessonItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '6px 0',
      fontSize: '13px',
      color: COLORS.slate,
      borderBottom: `1px solid ${COLORS.line}`,
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    lessonCheckbox: {
      width: '18px',
      height: '18px',
      border: `2px solid ${COLORS.line}`,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: COLORS.paper,
    },
    lessonCheckboxCompleted: {
      background: COLORS.success,
      borderColor: COLORS.success,
      color: '#fff',
    },
    lessonName: {
      flex: 1,
      fontSize: '13px',
    },
    lessonPreview: {
      fontSize: '12px',
      color: COLORS.accent,
      fontWeight: 500,
      cursor: 'pointer',
    },
    lessonXP: {
      fontSize: '12px',
      color: COLORS.slate,
      fontWeight: 500,
    },

    // ─── Join Course Card (Left Column) ─────────────────────────────
    joinCard: {
      background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.plumMid})`,
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
    },
    joinCardTitle: {
      fontSize: '16px',
      fontWeight: 700,
      opacity: 0.9,
      marginBottom: '4px',
      letterSpacing: '0.5px',
    },
    joinCardPrice: {
      fontSize: '32px',
      fontWeight: 800,
      marginBottom: '16px',
    },
    joinBtn: {
      width: '100%',
      padding: '14px',
      background: '#fff',
      color: COLORS.accent,
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    joinBtnDisabled: {
      width: '100%',
      padding: '14px',
      background: 'rgba(255,255,255,0.3)',
      color: 'rgba(255,255,255,0.7)',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'not-allowed',
    },
    startBtn: {
      width: '100%',
      padding: '14px',
      background: COLORS.success,
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    shareBtn: {
      width: '100%',
      padding: '10px',
      background: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background 0.2s',
    },

    // ─── Course Info Card (Left Column) ─────────────────────────────
    infoCard: {
      background: COLORS.paper,
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${COLORS.line}`,
    },
    infoCardTitle: {
      fontSize: '14px',
      fontWeight: 700,
      color: COLORS.ink,
      marginBottom: '12px',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: `1px solid ${COLORS.line}`,
      fontSize: '13px',
    },
    infoLabel: {
      color: COLORS.slate,
    },
    infoValue: {
      fontWeight: 600,
      color: COLORS.ink,
    },

    // ─── Loading ──────────────────────────────────────────────────────
    loadingContainer: {
      textAlign: 'center',
      padding: '60px 20px',
      color: COLORS.slate,
    },
    spinner: {
      border: `4px solid ${COLORS.line}`,
      borderTop: `4px solid ${COLORS.accent}`,
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px',
    },

    // ─── Modal ──────────────────────────────────────────────────────
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      background: COLORS.paper,
      borderRadius: '20px',
      padding: '40px',
      maxWidth: '440px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      position: 'relative',
    },
    modalClose: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'transparent',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: COLORS.slate,
      padding: '4px 8px',
      borderRadius: '8px',
    },
    modalIcon: {
      fontSize: '56px',
      marginBottom: '16px',
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 700,
      color: COLORS.ink,
      marginBottom: '8px',
    },
    modalText: {
      color: COLORS.slate,
      fontSize: '15px',
      lineHeight: 1.6,
      marginBottom: '24px',
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    modalBtnPrimary: {
      padding: '12px 32px',
      background: COLORS.accent,
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      minWidth: '140px',
    },
    modalBtnSecondary: {
      padding: '12px 32px',
      background: 'transparent',
      color: COLORS.slate,
      border: `1px solid ${COLORS.line}`,
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      minWidth: '140px',
    },
  };

  if (loadingDetails || loadingEnrollmentCount) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading course details...</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Render Syllabus ──────────────────────────────────────────────

  const renderSyllabus = () => {
    const syllabusItems = courseData.syllabus;
    const totalLessons = syllabusItems.reduce((acc, item) => acc + (item.lessons?.length || 0), 0);

    return (
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Lessons · {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}</h3>
        {syllabusItems.map((item, idx) => {
          const isExpanded = expandedSections[idx] !== false;
          const lessons = item.lessons || [];

          return (
            <div key={idx} style={styles.syllabusItem}>
              <div style={styles.syllabusHeader} onClick={() => toggleSection(idx)}>
                <div style={styles.syllabusTitle}>
                  <span style={styles.syllabusTitlePrefix}>#{idx + 1}</span>
                  {item.title}
                </div>
                <div style={styles.syllabusMeta}>
                  <span>{lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}</span>
                  <span style={{ fontSize: '16px' }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {isExpanded && lessons.length > 0 && (
                <div style={styles.syllabusLessons}>
                  {lessons.map((lesson, lIdx) => {
                    const key = `${idx}-${lIdx}`;
                    const isCompleted = completedLessons[key] || false;

                    return (
                      <div key={lIdx} style={styles.lessonItem}>
                        <span 
                          style={{
                            ...styles.lessonCheckbox,
                            ...(isCompleted ? styles.lessonCheckboxCompleted : {})
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLessonComplete(idx, lIdx);
                          }}
                        >
                          {isCompleted && '✓'}
                        </span>
                        <span style={styles.lessonName}>
                          {lesson.title || `Lesson ${lIdx + 1}`}
                        </span>
                        <span style={styles.lessonPreview}>Preview</span>
                        <span style={styles.lessonXP}>{lesson.xp || 40} XP</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {isExpanded && lessons.length === 0 && (
                <div style={styles.syllabusLessons}>
                  <div style={{ ...styles.lessonItem, borderBottom: 'none', color: COLORS.slate, fontSize: '13px' }}>
                    No lessons available yet
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render Overview ──────────────────────────────────────────────

  const renderOverview = () => (
    <>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Course Description</h3>
        <p style={styles.paragraph}>{courseData.description}</p>
      </div>

      {renderSyllabus()}
    </>
  );

  // ─── Login Modal ──────────────────────────────────────────────────

  const renderLoginModal = () => (
    <div style={styles.modalOverlay} onClick={handleCloseModal}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={handleCloseModal}>✕</button>
        <div style={styles.modalIcon}>🔒</div>
        <h2 style={styles.modalTitle}>Login Required</h2>
        <p style={styles.modalText}>
          You need to be logged in to enroll in this course. 
          Please login or create an account to continue.
        </p>
        <div style={styles.modalButtons}>
          <button style={styles.modalBtnSecondary} onClick={handleCloseModal}>
            Cancel
          </button>
          <button style={styles.modalBtnPrimary} onClick={handleLoginRedirect}>
            Login Now
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <>
      <div style={styles.page}>
        <div style={styles.container}>
          {/* ─── Top Navigation ────────────────────────────────────── */}
          <div style={styles.topNav}>
            <button style={styles.backLink} onClick={onBack}>
              ← Back to Courses
            </button>
          </div>

          {/* ─── Breadcrumb ────────────────────────────────────────── */}
          <div style={styles.breadcrumb}>
            <span>Courses</span>
            <span>/</span>
            <span>Getting Started</span>
          </div>

          {/* ─── Main Layout ────────────────────────────────────────── */}
          <div style={styles.mainLayout}>
            {/* ─── Left Column (Join Card + Info) ──────────────────── */}
            <div style={styles.leftColumn}>
              {/* Join Course Card */}
              <div style={styles.joinCard}>
                <div style={styles.joinCardTitle}>JOIN THIS COURSE</div>
                <div style={styles.joinCardPrice}>${courseData.price}</div>

                {isEnrolled ? (
                  <>
                    <button style={styles.startBtn} onClick={handleStartLearning}>
                      🚀 Start Learning
                    </button>
                    <button style={styles.shareBtn} onClick={handleShare}>
                      Share this course
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      style={isEnrolling || loading ? styles.joinBtnDisabled : styles.joinBtn}
                      onClick={handleEnrollClick}
                      disabled={isEnrolling || loading}
                    >
                      {isEnrolling || loading ? 'Enrolling...' : 'JOIN THIS COURSE'}
                    </button>
                    {!isLoggedIn && (
                      <div style={{ 
                        marginTop: '10px', 
                        fontSize: '12px', 
                        opacity: 0.7,
                        textAlign: 'center'
                      }}>
                        🔒 Login required to enroll
                      </div>
                    )}
                    <button style={styles.shareBtn} onClick={handleShare}>
                      Share this course
                    </button>
                  </>
                )}
              </div>

              {/* Course Information Card */}
              <div style={styles.infoCard}>
                <h4 style={styles.infoCardTitle}>Course Information</h4>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Last Update</span>
                  <span style={styles.infoValue}>{courseData.lastUpdate}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Completion</span>
                  <span style={styles.infoValue}>{courseData.duration}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Members</span>
                  <span style={styles.infoValue}>{courseData.students.toLocaleString()}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Level</span>
                  <span style={styles.infoValue}>{courseData.level}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Language</span>
                  <span style={styles.infoValue}>{courseData.language}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Certificate</span>
                  <span style={styles.infoValue}>{courseData.certificate}</span>
                </div>
              </div>
            </div>

            {/* ─── Right Column (Course Content) ────────────────────── */}
            <div style={styles.rightColumn}>
              {/* Course Header */}
              <div style={styles.courseHeader}>
                <h1 style={styles.courseTitle}>{courseData.title}</h1>
                <div style={styles.courseSubtitle}>{courseData.subtitle}</div>

                <div style={styles.ratingRow}>
                  <span style={styles.stars}>★★★★★</span>
                  <span style={styles.ratingText}>
                    {courseData.rating} ({courseData.reviews} reviews)
                  </span>
                  {isEnrolled && (
                    <span style={styles.enrolledBadge}>✓ Enrolled</span>
                  )}
                </div>

                <div style={styles.metaRow}>
                  <span style={styles.metaItem}>📅 Last Update {courseData.lastUpdate}</span>
                  <span style={styles.metaItem}>⏰ {courseData.duration}</span>
                  <span style={styles.metaItem}>👥 {courseData.students.toLocaleString()} members</span>
                </div>
              </div>

              {/* Tabs and Content */}
              <div style={styles.courseHeader}>
                <div style={styles.tabs}>
                  <button
                    style={styles.tab(activeTab === 'overview')}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                </div>

                {activeTab === 'overview' && renderOverview()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Login Modal ────────────────────────────────────────────── */}
      {showLoginModal && renderLoginModal()}
    </>
  );
} // <-- This is the closing brace for the CourseEnrollmentPage component