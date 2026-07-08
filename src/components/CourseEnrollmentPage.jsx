// src/components/CourseEnrollmentPage.jsx
// Course enrollment page with course details and stats

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

  const isMobile = window.innerWidth < 768;

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

  // ─── Build Course Data ──────────────────────────────────────────────

  const buildCourseData = () => {
    // If we have API data, use it
    if (courseDetails && courseDetails.course) {
      const apiCourse = courseDetails.course;
      const topics = courseDetails.topics || [];

      // Build syllabus from topics
      const syllabus = topics.map(topic => ({
        title: topic.title || 'Untitled Topic',
        duration: `${topic.subtopics?.length || 0} lessons`,
        lessons: topic.subtopics?.length || 0,
      }));

      // Build objectives from topics and subtopics
      const objectives = [];
      topics.forEach(topic => {
        objectives.push(`Understand ${topic.title}`);
        (topic.subtopics || []).forEach(sub => {
          objectives.push(`- ${sub.title}`);
        });
      });

      // Use actual enrollment count from API
      const students = enrollmentCount || 0;

      return {
        id: apiCourse.id,
        title: apiCourse.title || 'Course',
        subtitle: apiCourse.description?.substring(0, 100) || 'Learn with expert instructors',
        rating: apiCourse.rating || 4.8,
        reviews: apiCourse.reviews || 1247,
        students: students,
        lastUpdate: apiCourse.updatedAt ? new Date(apiCourse.updatedAt).toLocaleDateString() : '06/05/2026',
        duration: apiCourse.duration || '5 hours 48 minutes',
        level: apiCourse.level || 'Intermediate',
        language: 'English',
        certificate: 'Yes',
        price: apiCourse.price || 49.99,
        image: apiCourse.imageUrl || '',
        description: apiCourse.description || 'Master networking fundamentals with this comprehensive course.',
        objectives: objectives.length > 0 ? objectives : [
          'Understand network fundamentals and OSI model',
          'Configure and troubleshoot IPv4 addressing',
          'Master Ethernet fundamentals and switching',
        ],
        syllabus: syllabus.length > 0 ? syllabus : [
          { title: 'Network Fundamentals', duration: '1h 20m', lessons: 12 },
          { title: 'Network Access', duration: '1h 15m', lessons: 10 },
        ],
        requirements: [
          'Basic understanding of computer networks',
          'Familiarity with networking concepts',
        ],
        targetAudience: [
          'Aspiring network engineers',
          'IT professionals seeking certification',
        ],
        topics: topics,
      };
    }

    // Fallback to provided course prop
    return course || {
      id: 1,
      title: 'CCNA 200-301',
      subtitle: 'Cisco Certified Network Associate',
      rating: 4.8,
      reviews: 1247,
      students: enrollmentCount || 0,
      lastUpdate: '06/05/2026',
      duration: '5 hours 48 minutes',
      level: 'Intermediate',
      language: 'English',
      certificate: 'Yes',
      price: 49.99,
      description: 'Master the fundamentals of networking with this comprehensive CCNA 200-301 course.',
      objectives: [
        'Understand network fundamentals and OSI model',
        'Configure and troubleshoot IPv4 addressing',
        'Master Ethernet fundamentals and switching',
      ],
      syllabus: [
        { title: 'Network Fundamentals', duration: '1h 20m', lessons: 12 },
        { title: 'Network Access', duration: '1h 15m', lessons: 10 },
      ],
      requirements: [
        'Basic understanding of computer networks',
        'Familiarity with networking concepts',
      ],
      targetAudience: [
        'Aspiring network engineers',
        'IT professionals seeking CCNA certification',
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
    topStrip: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '14px 16px' : '14px 28px',
      background: COLORS.paper,
      borderBottom: `1px solid ${COLORS.line}`,
    },
    backBtn: {
      background: 'transparent',
      border: `1px solid ${COLORS.line}`,
      padding: '7px 16px',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      color: COLORS.slate,
      transition: 'all 0.2s',
      '&:hover': {
        background: COLORS.canvas,
      },
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '32px',
    },
    hero: {
      background: `linear-gradient(135deg, ${COLORS.plumDark}, ${COLORS.plumMid})`,
      borderRadius: '20px',
      padding: isMobile ? '24px' : '40px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '32px',
    },
    heroContent: {
      position: 'relative',
      zIndex: 2,
    },
    breadcrumb: {
      fontSize: '13px',
      opacity: 0.7,
      marginBottom: '16px',
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    heroTitle: {
      fontSize: isMobile ? '28px' : '42px',
      fontWeight: 800,
      marginBottom: '8px',
      letterSpacing: '-0.5px',
    },
    heroSubtitle: {
      fontSize: isMobile ? '16px' : '20px',
      opacity: 0.8,
      marginBottom: '16px',
    },
    heroRating: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
      flexWrap: 'wrap',
    },
    stars: {
      color: COLORS.gold,
      fontSize: '18px',
      letterSpacing: '2px',
    },
    ratingText: {
      fontSize: '14px',
      opacity: 0.8,
    },
    heroStats: {
      display: 'flex',
      gap: isMobile ? '16px' : '32px',
      flexWrap: 'wrap',
      marginTop: '16px',
    },
    heroStat: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      opacity: 0.85,
    },
    heroBadge: {
      background: 'rgba(255,255,255,0.15)',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '32px',
    },
    leftColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    rightColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    card: {
      background: COLORS.paper,
      borderRadius: '16px',
      padding: isMobile ? '20px' : '28px',
      border: `1px solid ${COLORS.line}`,
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: COLORS.ink,
      marginBottom: '16px',
    },
    tabs: {
      display: 'flex',
      gap: '4px',
      borderBottom: `2px solid ${COLORS.line}`,
      marginBottom: '24px',
      overflowX: 'auto',
    },
    tab: (active) => ({
      padding: '12px 20px',
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
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: COLORS.ink,
      marginBottom: '12px',
    },
    paragraph: {
      color: COLORS.slate,
      lineHeight: 1.7,
      fontSize: '15px',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    listItem: {
      padding: '8px 0',
      paddingLeft: '24px',
      position: 'relative',
      color: COLORS.slate,
      fontSize: '14px',
      lineHeight: 1.6,
      borderBottom: `1px solid ${COLORS.line}`,
    },
    listItemBullet: {
      position: 'absolute',
      left: 0,
      color: COLORS.accent,
      fontWeight: 'bold',
    },
    syllabusItem: {
      padding: '14px 0',
      borderBottom: `1px solid ${COLORS.line}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px',
    },
    syllabusTitle: {
      fontWeight: 600,
      color: COLORS.ink,
      fontSize: '14px',
    },
    syllabusMeta: {
      display: 'flex',
      gap: '16px',
      fontSize: '13px',
      color: COLORS.slate,
    },
    priceCard: {
      background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.plumMid})`,
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
    },
    price: {
      fontSize: '32px',
      fontWeight: 800,
      marginBottom: '4px',
    },
    priceSub: {
      fontSize: '14px',
      opacity: 0.8,
      marginBottom: '20px',
    },
    enrollBtn: {
      width: '100%',
      padding: '14px',
      background: '#fff',
      color: COLORS.accent,
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'transform 0.2s, opacity 0.2s',
      opacity: 1,
      '&:hover': {
        transform: 'scale(1.02)',
      },
    },
    enrollBtnDisabled: {
      width: '100%',
      padding: '14px',
      background: '#ccc',
      color: '#666',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'not-allowed',
    },
    shareBtn: {
      width: '100%',
      padding: '12px',
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'background 0.2s',
      '&:hover': {
        background: 'rgba(255,255,255,0.1)',
      },
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
      marginTop: '10px',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.02)',
      },
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: `1px solid ${COLORS.line}`,
      fontSize: '14px',
    },
    infoLabel: {
      color: COLORS.slate,
    },
    infoValue: {
      fontWeight: 600,
      color: COLORS.ink,
    },
    loginPrompt: {
      background: COLORS.paper,
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      border: `2px dashed ${COLORS.accent}`,
    },
    loginBtn: {
      padding: '12px 32px',
      background: COLORS.accent,
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: '12px',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.05)',
      },
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '40px',
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
      transition: 'background 0.2s',
      '&:hover': {
        background: COLORS.canvas,
      },
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
      transition: 'transform 0.2s',
      minWidth: '140px',
      '&:hover': {
        transform: 'scale(1.05)',
      },
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
      transition: 'all 0.2s',
      minWidth: '140px',
      '&:hover': {
        background: COLORS.canvas,
      },
    },
  };

  if (loadingDetails || loadingEnrollmentCount) {
    return (
      <div style={styles.page}>
        <div style={styles.topStrip}>
          <button style={styles.backBtn} onClick={onBack}>← Back</button>
        </div>
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

  // ─── Tab Content ──────────────────────────────────────────────────

  const renderOverview = () => (
    <>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Course Description</h3>
        <p style={styles.paragraph}>{courseData.description}</p>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>What You'll Learn</h3>
        <ul style={styles.list}>
          {courseData.objectives.map((item, idx) => (
            <li key={idx} style={styles.listItem}>
              <span style={styles.listItemBullet}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Course Syllabus</h3>
        {courseData.syllabus.map((item, idx) => (
          <div key={idx} style={styles.syllabusItem}>
            <div>
              <div style={styles.syllabusTitle}>{idx + 1}. {item.title}</div>
              <div style={{ fontSize: '12px', color: COLORS.slate, marginTop: '2px' }}>
                {item.lessons} lessons
              </div>
            </div>
            <div style={styles.syllabusMeta}>
              <span>⏱ {item.duration}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Requirements</h3>
        <ul style={styles.list}>
          {courseData.requirements.map((item, idx) => (
            <li key={idx} style={styles.listItem}>
              <span style={styles.listItemBullet}>•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Target Audience</h3>
        <ul style={styles.list}>
          {courseData.targetAudience.map((item, idx) => (
            <li key={idx} style={styles.listItem}>
              <span style={styles.listItemBullet}>•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
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
        {/* ─── Top Bar ───────────────────────────────────────────────── */}
        <div style={styles.topStrip}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={styles.backBtn} onClick={onBack}>← Back</button>
            <span style={{ fontSize: '14px', color: COLORS.slate }}>/</span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: COLORS.ink }}>
              {courseData.title}
            </span>
          </div>
          <button style={styles.backBtn} onClick={onBack}>← Back to Courses</button>
        </div>

        <div style={styles.container}>
          {/* ─── Hero Banner ────────────────────────────────────────── */}
          <div style={styles.hero}>
            <div style={styles.heroContent}>
              <div style={styles.breadcrumb}>
                <span>Courses</span>
                <span>/</span>
                <span>Getting Started</span>
                <span>/</span>
                <span style={{ opacity: 1, fontWeight: 600 }}>{courseData.title}</span>
              </div>

              <h1 style={styles.heroTitle}>{courseData.title}</h1>
              <div style={styles.heroSubtitle}>{courseData.subtitle}</div>

              <div style={styles.heroRating}>
                <span style={styles.stars}>★★★★★</span>
                <span style={styles.ratingText}>
                  {courseData.rating} ({courseData.reviews.toLocaleString()} reviews)
                </span>
                <span style={styles.heroBadge}>{courseData.level}</span>
                <span style={styles.heroBadge}>📜 {courseData.certificate}</span>
              </div>

              <div style={styles.heroStats}>
                <span style={styles.heroStat}>📅 Last Update {courseData.lastUpdate}</span>
                <span style={styles.heroStat}>⏱ Completion {courseData.duration}</span>
                <span style={styles.heroStat}>👥 Members {courseData.students.toLocaleString()}</span>
                <span style={styles.heroStat}>🌐 {courseData.language}</span>
              </div>
            </div>
          </div>

          {/* ─── Main Content ────────────────────────────────────────── */}
          <div style={styles.mainLayout}>
            {/* ─── Left Column ───────────────────────────────────────── */}
            <div style={styles.leftColumn}>
              {/* Price / Enroll Card - Now on the left */}
              <div style={styles.priceCard}>
                <div style={styles.price}>${courseData.price}</div>
                <div style={styles.priceSub}>
                  {isEnrolled ? 'You are enrolled! 🎉' : 'One-time payment • Full access'}
                </div>

                {isEnrolled ? (
                  <>
                    <button style={styles.startBtn} onClick={handleStartLearning}>
                      🚀 Start Learning
                    </button>
                    <button style={styles.shareBtn} onClick={handleShare}>
                      📤 Share this course
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      style={isEnrolling || loading ? styles.enrollBtnDisabled : styles.enrollBtn}
                      onClick={handleEnrollClick}
                      disabled={isEnrolling || loading}
                    >
                      {isEnrolling || loading ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                    {!isLoggedIn && (
                      <div style={{ 
                        marginTop: '12px', 
                        fontSize: '12px', 
                        opacity: 0.8,
                        textAlign: 'center'
                      }}>
                        🔒 Login required to enroll
                      </div>
                    )}
                    <button style={styles.shareBtn} onClick={handleShare}>
                      📤 Share this course
                    </button>
                  </>
                )}

                {isEnrolled && enrollmentDate && (
                  <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.7 }}>
                    Enrolled on {new Date(enrollmentDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Course Information - Now on the left */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Course Information</h3>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Last Update</span>
                  <span style={styles.infoValue}>{courseData.lastUpdate}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Completion Time</span>
                  <span style={styles.infoValue}>{courseData.duration}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Total Students</span>
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

            {/* ─── Right Column ──────────────────────────────────────── */}
            <div style={styles.rightColumn}>
              {/* ─── Tabs ────────────────────────────────────────────── */}
              <div style={styles.card}>
                <div style={styles.tabs}>
                  <button
                    style={styles.tab(activeTab === 'overview')}
                    onClick={() => setActiveTab('overview')}
                  >
                    📖 Overview
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
}