import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseDetailView from './CourseDetailView';
import Swal from 'sweetalert2';
import {
  getEnrolledCourses,
  getCourseDetails,
  getSubtopicImages,
  getCourses,
  enrollInCourse,
} from '../api/UserApi';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

function MyCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeView, setActiveView] = useState('split');
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [currentSubtopic, setCurrentSubtopic] = useState(null);
  const [images, setImages] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [courseDetails, setCourseDetails] = useState(null);

  const [allCourses, setAllCourses] = useState([]);
  const [loadingAllCourses, setLoadingAllCourses] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  const isMobile = window.innerWidth < 768;
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

  // API calls (same as before)
  const fetchEnrolledCourses = async () => {
    try {
      const data = await getEnrolledCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      Swal.fire('Error', 'Could not load your courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    setLoadingAllCourses(true);
    try {
      const data = await getCourses();
      setAllCourses(data);
    } catch (error) {
      console.error('Error fetching all courses:', error);
      Swal.fire('Error', 'Could not load course catalog', 'error');
    } finally {
      setLoadingAllCourses(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrollingCourseId(courseId);
    try {
      await enrollInCourse(courseId);
      await fetchEnrolledCourses();
      Swal.fire('Enrolled!', 'You have successfully enrolled in the course.', 'success');
    } catch (error) {
      console.error('Enrollment failed:', error);
      Swal.fire('Error', 'Could not enroll. Please try again.', 'error');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const loadCourseDetails = async (courseId) => {
    setContentLoading(true);
    try {
      const data = await getCourseDetails(courseId);
      setCourseDetails(data.course);
      const allTopics = data.topics || [];

      const allSubtopics = [];
      allTopics.forEach(topic => {
        (topic.subTopics || []).forEach(sub => {
          allSubtopics.push({
            id: sub.id,
            title: sub.title,
            topicTitle: topic.title,
            content: sub.content,
            videoUrl: sub.videoUrl
          });
        });
      });
      setSubtopics(allSubtopics);
      setTopics(allTopics);

      const savedCompleted = localStorage.getItem(`course_completed_${courseId}`);
      if (savedCompleted) {
        const completed = JSON.parse(savedCompleted);
        setCompletedSections(completed);
        const newProgress = (completed.length / allSubtopics.length) * 100;
        setProgress(newProgress);
      } else {
        setCompletedSections([]);
        setProgress(0);
      }
      setActiveSection(0);
      if (allSubtopics.length > 0) {
        await loadSubtopicImages(allSubtopics[0].id);
        setCurrentSubtopic(allSubtopics[0]);
      }
    } catch (error) {
      console.error('Error loading course details:', error);
      Swal.fire('Error', 'Could not load course content', 'error');
    } finally {
      setContentLoading(false);
    }
  };

  const loadSubtopicImages = async (subtopicId) => {
    try {
      const data = await getSubtopicImages(subtopicId);
      setImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
      setImages([]);
    }
  };

  const handleCourseClick = async (course) => {
    setSelectedCourse(course);
    await loadCourseDetails(course.id);
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setTopics([]);
    setSubtopics([]);
    setImages([]);
    setImageErrors({});
    setCourseDetails(null);
    setCurrentSubtopic(null);
  };

  const markSectionComplete = (index) => {
    if (!selectedCourse) return;
    if (!completedSections.includes(index)) {
      const newCompleted = [...completedSections, index];
      setCompletedSections(newCompleted);
      localStorage.setItem(`course_completed_${selectedCourse.id}`, JSON.stringify(newCompleted));
      const newProgress = (newCompleted.length / subtopics.length) * 100;
      setProgress(newProgress);
      Swal.fire({
        title: 'Section Completed! 🎉',
        text: `${Math.round(newProgress)}% of the course complete`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

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
        Swal.fire('Reset!', 'Your progress has been reset.', 'success');
      }
    });
  };

  const getCourseIcon = (title) => {
    const name = title?.toLowerCase() || '';
    if (name.includes('ccna')) return '🌐';
    if (name.includes('ccnp')) return '🚀';
    if (name.includes('ccie')) return '🔐';
    if (name.includes('security')) return '🛡️';
    if (name.includes('linux')) return '🐧';
    if (name.includes('python')) return '🐍';
    return '📄';
  };

  const getGradient = (title) => {
    const name = title?.toLowerCase() || '';
    if (name.includes('ccna')) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (name.includes('ccnp')) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (name.includes('ccie')) return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (name.includes('security')) return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    if (name.includes('linux')) return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
    return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
  };

  const getImageUrl = (subtopicId, fileName) => {
    return `${API_BASE}/admin/subtopic-images/${subtopicId}/${fileName}`;
  };

  const handleImageError = (imageId) => {
    if (!imageErrors[imageId]) {
      setImageErrors(prev => ({ ...prev, [imageId]: true }));
    }
  };

  const getImageSrc = (subtopicId, fileName, imageId) => {
    return imageErrors[imageId] ? FALLBACK_IMAGE : getImageUrl(subtopicId, fileName);
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (activeTab === 'all' && allCourses.length === 0 && !loadingAllCourses) {
      fetchAllCourses();
    }
  }, [activeTab, allCourses.length, loadingAllCourses]);

  // Enhanced modern styles
  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%)', fontFamily: "'Inter', system-ui, sans-serif" },
    header: { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', color: 'white', padding: isMobile ? '40px 20px' : '60px 40px', textAlign: 'center', position: 'relative', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
    backButton: { position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', padding: '8px 16px', borderRadius: '40px', transition: 'all 0.2s', '&:hover': { background: 'rgba(255,255,255,0.3)' } },
    title: { fontSize: isMobile ? '28px' : '42px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' },
    subtitle: { fontSize: isMobile ? '14px' : '18px', opacity: 0.9 },
    statsRow: { display: 'flex', justifyContent: 'center', gap: isMobile ? '20px' : '40px', marginTop: '30px', flexWrap: 'wrap' },
    statItem: { textAlign: 'center', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '15px 25px', borderRadius: '20px' },
    statNumber: { fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: '#c7d2fe' },
    statLabel: { fontSize: '13px', opacity: 0.9, marginTop: '5px' },
    controls: { display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap', padding: '20px' },
    controlBtn: (active) => ({ padding: '12px 28px', border: 'none', borderRadius: '40px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', background: active ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#ffffff', color: active ? 'white' : '#4b5563', boxShadow: active ? '0 4px 15px rgba(99,102,241,0.4)' : '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s' }),
    searchBar: { position: 'relative', maxWidth: '500px', margin: '0 auto 40px' },
    searchInput: { width: '100%', padding: '14px 20px 14px 50px', border: 'none', borderRadius: '50px', fontSize: '15px', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s', outline: 'none', '&:focus': { boxShadow: '0 4px 20px rgba(99,102,241,0.15)' } },
    searchIcon: { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#9ca3af' },
    pdfsGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px', padding: isMobile ? '20px' : '20px 40px', maxWidth: '1400px', margin: '0 auto' },
    pdfCard: { background: 'white', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 20px 35px -10px rgba(0,0,0,0.1)' } },
    pdfHeader: (gradient) => ({ height: isMobile ? '140px' : '180px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }),
    pdfIcon: { fontSize: isMobile ? '56px' : '72px', filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.1))' },
    pdfBody: { padding: '24px' },
    pdfTitle: { fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '10px', wordBreak: 'break-word' },
    pdfMeta: { display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b', marginBottom: '20px', flexWrap: 'wrap' },
    viewBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '40px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.9 } },
    emptyState: { textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '32px', maxWidth: '500px', margin: '40px auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' },
    emptyIcon: { fontSize: '72px', marginBottom: '20px' },
    emptyTitle: { fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' },
    emptyText: { color: '#64748b', marginBottom: '30px' },
    loadingContainer: { textAlign: 'center', padding: '80px', color: '#6366f1' },
    spinner: { width: '60px', height: '60px', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' },
    footer: { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px', borderTop: '1px solid #e2e8f0', marginTop: '40px' },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your learning journey...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (selectedCourse) {
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
        handleBack={handleBack}
        setActiveView={setActiveView}
        setActiveSection={setActiveSection}
        setCurrentSubtopic={setCurrentSubtopic}
        loadSubtopicImages={loadSubtopicImages}
        resetProgress={resetProgress}
        markSectionComplete={markSectionComplete}
        getImageSrc={getImageSrc}
        getImageUrl={getImageUrl}
        handleImageError={handleImageError}
        styles={styles}
      />
    );
  }

  // Course list view
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/')}>← Back to Home</button>
        <h1 style={styles.title}>My Learning</h1>
        <p style={styles.subtitle}>Continue your journey or discover new horizons</p>
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{courses.length}</div>
            <div style={styles.statLabel}>Enrolled Courses</div>
          </div>
        </div>
      </div>

      <div style={styles.controls}>
        <button style={styles.controlBtn(activeTab === 'my')} onClick={() => setActiveTab('my')}>
          📘 My Courses
        </button>
        <button style={styles.controlBtn(activeTab === 'all')} onClick={() => setActiveTab('all')}>
          🗂️ All Courses
        </button>
      </div>

      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {activeTab === 'my' && (
        <>
          {courses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📚</div>
              <h3 style={styles.emptyTitle}>No courses yet</h3>
              <p style={styles.emptyText}>Enroll in a course to start learning!</p>
              <button onClick={() => setActiveTab('all')} style={styles.viewBtn}>
                Browse All Courses
              </button>
            </div>
          ) : (
            <div style={styles.pdfsGrid}>
              {courses.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(course => (
                <div key={course.id} style={styles.pdfCard} onClick={() => handleCourseClick(course)}>
                  <div style={styles.pdfHeader(getGradient(course.title))}>
                    <span style={styles.pdfIcon}>{getCourseIcon(course.title)}</span>
                  </div>
                  <div style={styles.pdfBody}>
                    <h3 style={styles.pdfTitle}>{course.title}</h3>
                    <div style={styles.pdfMeta}>
                      <span>⭐ {course.rating || '4.8'}</span>
                      <span>⏱ {course.duration || '40h'}</span>
                      <span>👥 {course.members || '5k+'}</span>
                    </div>
                    <button style={styles.viewBtn} onClick={(e) => { e.stopPropagation(); handleCourseClick(course); }}>
                      📖 Continue Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'all' && (
        <>
          {loadingAllCourses ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading course catalog...</p>
            </div>
          ) : allCourses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <h3 style={styles.emptyTitle}>No courses available</h3>
              <p style={styles.emptyText}>Check back later for new courses.</p>
            </div>
          ) : (
            <div style={styles.pdfsGrid}>
              {allCourses.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(course => {
                const isEnrolled = courses.some(ec => ec.id === course.id);
                return (
                  <div key={course.id} style={styles.pdfCard}>
                    <div style={styles.pdfHeader(getGradient(course.title))}>
                      <span style={styles.pdfIcon}>{getCourseIcon(course.title)}</span>
                    </div>
                    <div style={styles.pdfBody}>
                      <h3 style={styles.pdfTitle}>{course.title}</h3>
                      <div style={styles.pdfMeta}>
                        <span>⭐ {course.rating || '4.8'}</span>
                        <span>⏱ {course.duration || '40h'}</span>
                        <span>👥 {course.members || '5k+'}</span>
                      </div>
                      {isEnrolled ? (
                        <button style={{ ...styles.viewBtn, background: '#10b981' }} onClick={() => handleCourseClick(course)}>
                          📖 Continue Learning
                        </button>
                      ) : (
                        <button style={styles.viewBtn} onClick={(e) => { e.stopPropagation(); handleEnroll(course.id); }} disabled={enrollingCourseId === course.id}>
                          {enrollingCourseId === course.id ? 'Enrolling...' : '➕ Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div style={styles.footer}>
        <p>✨ Click any course to resume learning | Progress saved automatically ✨</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default MyCoursesPage;