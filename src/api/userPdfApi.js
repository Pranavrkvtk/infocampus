import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getUserPdfs, 
  getUserPdfDetails, 
  getUserPdfText, 
  getUserPdfImages,
  getUserImageUrl,
  formatFileSize,
  extractSectionsFromText,
  generateDefaultSections
} from '../api/userPdfApi';
import Swal from 'sweetalert2';

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
  const [sections, setSections] = useState([]);
  const [images, setImages] = useState([]);
  const [imagesByPage, setImagesByPage] = useState({});
  const [contentLoading, setContentLoading] = useState(false);
  const [pdfData, setPdfData] = useState(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/enrollments/user/${userId}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const handleCourseClick = async (course) => {
    setSelectedCourse(course);
    setContentLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // First, get all PDFs the user has access to
      const pdfsResponse = await getUserPdfs();
      const pdfs = pdfsResponse.data;
      
      // Find PDF related to this course (by title match)
      const relatedPdf = pdfs.find(pdf => 
        pdf.fileName?.toLowerCase().includes(course.title?.toLowerCase()) ||
        course.title?.toLowerCase().includes(pdf.fileName?.toLowerCase())
      );
      
      if (relatedPdf) {
        // Get detailed PDF content
        const pdfDetailResponse = await getUserPdfDetails(relatedPdf.id);
        const pdfDetail = pdfDetailResponse.data;
        
        setPdfData(pdfDetail);
        
        // Extract sections from PDF text
        const extractedSections = extractSectionsFromText(pdfDetail.extractedText || '', course.title);
        setSections(extractedSections);
        
        // Get images
        const imagesResponse = await getUserPdfImages(relatedPdf.id);
        const imageList = imagesResponse.data.images || [];
        setImages(imageList);
        
        // Group images by page
        const groupedByPage = {};
        imageList.forEach(img => {
          if (!groupedByPage[img.pageNumber]) {
            groupedByPage[img.pageNumber] = [];
          }
          groupedByPage[img.pageNumber].push(img);
        });
        setImagesByPage(groupedByPage);
      } else {
        // No PDF found, generate default content
        setSections(generateDefaultSections(course.title));
        setImages([]);
        setImagesByPage({});
        setPdfData(null);
      }
      
      // Load saved progress from localStorage
      const savedCompleted = localStorage.getItem(`course_completed_${course.id}`);
      const totalSections = sections.length || 6;
      
      if (savedCompleted) {
        const completed = JSON.parse(savedCompleted);
        setCompletedSections(completed);
        const savedProgress = (completed.length / totalSections) * 100;
        setProgress(savedProgress);
      } else {
        setCompletedSections([]);
        setProgress(course.progress || 0);
      }
    } catch (error) {
      console.error('Error loading course content:', error);
      setSections(generateDefaultSections(course.title));
      Swal.fire('Error', 'Failed to load course content', 'error');
    } finally {
      setContentLoading(false);
    }
    setActiveSection(0);
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setSections([]);
    setImages([]);
    setPdfData(null);
  };

  const updateProgressOnServer = async (progressPercent, completedLessons) => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      await fetch(`/api/enrollments/user/${userId}/course/${selectedCourse.id}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          progress: Math.round(progressPercent),
          completedLessons: completedLessons
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const markSectionComplete = (index) => {
    let newCompleted = [...completedSections];
    if (!newCompleted.includes(index)) {
      newCompleted.push(index);
      setCompletedSections(newCompleted);
      localStorage.setItem(`course_completed_${selectedCourse.id}`, JSON.stringify(newCompleted));
      const newProgress = (newCompleted.length / sections.length) * 100;
      setProgress(newProgress);
      
      updateProgressOnServer(newProgress, newCompleted.length);
      
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
        updateProgressOnServer(0, 0);
        Swal.fire('Reset!', 'Your progress has been reset.', 'success');
      }
    });
  };

  const getProgressForCourse = (course) => {
    return course.progress || 0;
  };

  const getCourseIcon = (title) => {
    const courseTitle = title?.toLowerCase() || '';
    if (courseTitle.includes('ccna')) return '🌐';
    if (courseTitle.includes('ccnp')) return '🚀';
    if (courseTitle.includes('ccie')) return '🔐';
    if (courseTitle.includes('security')) return '🛡️';
    if (courseTitle.includes('linux')) return '🐧';
    if (courseTitle.includes('python')) return '🐍';
    return '📚';
  };

  const getGradient = (title) => {
    const courseTitle = title?.toLowerCase() || '';
    if (courseTitle.includes('ccna')) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (courseTitle.includes('ccnp')) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (courseTitle.includes('ccie')) return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (courseTitle.includes('security')) return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    if (courseTitle.includes('linux')) return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
    return 'linear-gradient(135deg, #5E5BFF 0%, #4a47d1 100%)';
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f5f7fa',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    header: {
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      color: 'white',
      padding: isMobile ? '40px 20px' : '60px 40px',
      textAlign: 'center',
      position: 'relative',
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(255,255,255,0.1)',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '8px 16px',
      borderRadius: '8px',
      transition: 'background 0.2s',
    },
    title: {
      fontSize: isMobile ? '28px' : '36px',
      fontWeight: '700',
      marginBottom: '12px',
    },
    subtitle: {
      fontSize: isMobile ? '14px' : '16px',
      opacity: 0.8,
    },
    statsRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: isMobile ? '20px' : '40px',
      marginTop: '30px',
      flexWrap: 'wrap',
    },
    statItem: {
      textAlign: 'center',
    },
    statNumber: {
      fontSize: isMobile ? '24px' : '32px',
      fontWeight: '700',
      color: '#5E5BFF',
    },
    statLabel: {
      fontSize: '12px',
      opacity: 0.7,
    },
    controls: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      marginBottom: '30px',
      flexWrap: 'wrap',
      padding: '20px',
    },
    controlBtn: (active) => ({
      padding: '10px 24px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      background: active ? '#5E5BFF' : '#e5e7eb',
      color: active ? 'white' : '#374151',
      transition: 'transform 0.2s',
    }),
    searchBar: {
      position: 'relative',
      maxWidth: '500px',
      margin: '0 auto 30px',
    },
    searchInput: {
      width: '100%',
      padding: '12px 20px 12px 45px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '14px',
      background: 'white',
    },
    searchIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '18px',
    },
    coursesGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '24px',
      padding: isMobile ? '20px' : '20px 40px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    courseCard: {
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    courseHeader: (gradient) => ({
      height: isMobile ? '140px' : '160px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }),
    courseIcon: {
      fontSize: isMobile ? '56px' : '64px',
    },
    completedBadge: {
      position: 'absolute',
      bottom: '12px',
      right: '12px',
      background: '#22c55e',
      color: 'white',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
    },
    courseBody: {
      padding: '20px',
    },
    courseTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1a1a2e',
      marginBottom: '8px',
    },
    courseInstructor: {
      fontSize: '13px',
      color: '#6b7280',
      marginBottom: '16px',
    },
    progressSection: {
      marginBottom: '16px',
    },
    progressBar: {
      background: '#e5e7eb',
      borderRadius: '10px',
      height: '6px',
      overflow: 'hidden',
    },
    progressFill: (progress, isCompleted) => ({
      width: `${progress}%`,
      height: '100%',
      background: isCompleted ? '#22c55e' : '#5E5BFF',
      borderRadius: '10px',
      transition: 'width 0.3s',
    }),
    progressText: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '6px',
    },
    continueBtn: (isCompleted) => ({
      width: '100%',
      padding: '10px',
      background: isCompleted ? '#22c55e' : '#5E5BFF',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background 0.2s',
    }),
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
      background: 'white',
      borderRadius: '16px',
      maxWidth: '500px',
      margin: '40px auto',
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1a1a2e',
      marginBottom: '8px',
    },
    emptyText: {
      color: '#6b7280',
      marginBottom: '24px',
    },
    browseBtn: {
      padding: '12px 24px',
      background: '#5E5BFF',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: '500',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '60px',
      color: '#5E5BFF',
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: '4px solid #e5e7eb',
      borderTopColor: '#5E5BFF',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px',
    },
    footer: {
      textAlign: 'center',
      padding: '30px',
      color: '#9ca3af',
      fontSize: '12px',
    },
    // Course Detail View Styles
    courseDetailContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile ? '20px' : '40px',
    },
    backToCourses: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: 'none',
      color: '#5E5BFF',
      cursor: 'pointer',
      fontSize: '14px',
      marginBottom: '20px',
      padding: '8px 16px',
      borderRadius: '8px',
      transition: 'background 0.2s',
    },
    courseHero: {
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      color: 'white',
      padding: isMobile ? '30px' : '40px',
      borderRadius: '20px',
      marginBottom: '30px',
    },
    courseHeroTitle: {
      fontSize: isMobile ? '24px' : '32px',
      fontWeight: '700',
      marginBottom: '15px',
    },
    courseHeroStats: {
      display: 'flex',
      justifyContent: 'center',
      gap: isMobile ? '20px' : '40px',
      margin: '20px 0',
      fontSize: isMobile ? '12px' : '14px',
      opacity: 0.9,
    },
    progressBarLarge: {
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '10px',
      height: '8px',
      overflow: 'hidden',
      maxWidth: '400px',
      margin: '20px auto 0',
    },
    progressFillLarge: {
      background: '#5E5BFF',
      height: '100%',
      borderRadius: '10px',
      transition: 'width 0.3s',
    },
    progressTextLarge: {
      display: 'block',
      marginTop: '8px',
      fontSize: '12px',
      opacity: 0.8,
    },
    viewControls: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      marginBottom: '30px',
      flexWrap: 'wrap',
    },
    splitView: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
      gap: '30px',
    },
    tocPanel: {
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      position: isMobile ? 'relative' : 'sticky',
      top: '20px',
      height: isMobile ? 'auto' : 'calc(100vh - 100px)',
      overflowY: 'auto',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    tocTitle: {
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '20px',
      color: '#1a1a2e',
      borderBottom: '2px solid #5E5BFF',
      paddingBottom: '10px',
    },
    tocList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    tocItem: (isActive, isCompleted) => ({
      padding: '12px 15px',
      cursor: 'pointer',
      borderRadius: '10px',
      fontSize: '14px',
      transition: 'all 0.2s',
      color: '#374151',
      marginBottom: '6px',
      border: '1px solid transparent',
      background: isActive ? '#5E5BFF' : isCompleted ? '#f0fdf4' : 'transparent',
      color: isActive ? 'white' : isCompleted ? '#16a34a' : '#374151',
      borderColor: isActive ? '#5E5BFF' : isCompleted ? '#bbf7d0' : 'transparent',
    }),
    sectionBadge: {
      fontSize: '11px',
      marginLeft: '8px',
      opacity: 0.7,
    },
    contentPanel: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '20px' : '30px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      maxHeight: isMobile ? 'auto' : 'calc(100vh - 100px)',
      overflowY: 'auto',
    },
    currentSectionHeader: {
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #5E5BFF',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px',
    },
    currentSectionTitle: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '700',
      color: '#5E5BFF',
    },
    sectionProgress: {
      fontSize: '13px',
      color: '#6b7280',
      background: '#f8f9fa',
      padding: '6px 12px',
      borderRadius: '20px',
    },
    paragraphText: {
      lineHeight: '1.8',
      marginBottom: '16px',
      color: '#374151',
      fontSize: '15px',
    },
    completeBtn: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      marginTop: '20px',
      transition: 'background 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
    },
    resetBtn: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background 0.2s',
    },
    galleryContainer: {
      background: 'white',
      borderRadius: '16px',
      padding: isMobile ? '20px' : '30px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    galleryTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#1a1a2e',
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
    },
    imageCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    image: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
    },
    imageInfo: {
      padding: '8px',
      fontSize: '12px',
      textAlign: 'center',
      background: '#f8f9fa',
      color: '#6b7280',
    },
    emptySection: {
      textAlign: 'center',
      padding: '40px',
      color: '#9ca3af',
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your courses...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Course Detail View
  if (selectedCourse) {
    if (contentLoading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading course content...</p>
        </div>
      );
    }
    
    const section = sections[activeSection];
    const isCompleted = completedSections.includes(activeSection);
    const totalPages = pdfData?.pageCount || sections.length;
    const totalImages = images.length;
    const fileSize = pdfData?.fileSize || 0;
    
    return (
      <div style={styles.container}>
        <div style={styles.courseDetailContainer}>
          <button 
            style={styles.backToCourses}
            onClick={handleBack}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0ff'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            ← Back to My Courses
          </button>

          <div style={styles.courseHero}>
            <h1 style={styles.courseHeroTitle}>{selectedCourse.title}</h1>
            <div style={styles.courseHeroStats}>
              <span>📄 {totalPages} pages</span>
              <span>🖼️ {totalImages} images</span>
              <span>💾 {formatFileSize(fileSize)}</span>
            </div>
            <div style={styles.progressBarLarge}>
              <div style={{ ...styles.progressFillLarge, width: `${progress}%` }}></div>
            </div>
            <span style={styles.progressTextLarge}>{Math.round(progress)}% Complete</span>
          </div>

          <div style={styles.viewControls}>
            <button 
              style={styles.controlBtn(activeView === 'split')} 
              onClick={() => setActiveView('split')}
            >
              📚 Course View
            </button>
            <button 
              style={styles.controlBtn(activeView === 'gallery')} 
              onClick={() => setActiveView('gallery')}
            >
              🖼️ Image Gallery ({totalImages} images)
            </button>
            <button 
              style={styles.resetBtn} 
              onClick={resetProgress}
            >
              ⟳ Reset Progress
            </button>
          </div>

          {activeView === 'split' && (
            <div style={styles.splitView}>
              <div style={styles.tocPanel}>
                <h3 style={styles.tocTitle}>📑 Course Content</h3>
                <ul style={styles.tocList}>
                  {sections.map((section, idx) => {
                    const isActive = activeSection === idx;
                    const isSectionCompleted = completedSections.includes(idx);
                    return (
                      <li 
                        key={idx} 
                        style={styles.tocItem(isActive, isSectionCompleted)}
                        onClick={() => setActiveSection(idx)}
                        onMouseEnter={(e) => {
                          if (!isActive && !isSectionCompleted) {
                            e.currentTarget.style.background = '#f0f0ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive && !isSectionCompleted) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{section.title}</span>
                          {isSectionCompleted && <span style={styles.sectionBadge}>✓</span>}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                          {section.paragraphs || 5} paragraphs
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              <div style={styles.contentPanel}>
                <div style={styles.currentSectionHeader}>
                  <h2 style={styles.currentSectionTitle}>{section?.title}</h2>
                  {isCompleted && (
                    <span style={styles.sectionProgress}>✅ Completed</span>
                  )}
                </div>
                
                <div>
                  {section?.content ? (
                    section.content.map((para, idx) => (
                      <p key={idx} style={styles.paragraphText}>{para}</p>
                    ))
                  ) : (
                    [...Array(section?.paragraphs || 5)].map((_, i) => (
                      <p key={i} style={styles.paragraphText}>
                        This is the content for <strong>{section?.title}</strong> - paragraph {i + 1}.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    ))
                  )}
                </div>
                
                <button 
                  style={styles.completeBtn}
                  onClick={() => markSectionComplete(activeSection)}
                  disabled={isCompleted}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#16a34a'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#22c55e'}
                >
                  {isCompleted ? '✓ Section Completed' : '✓ Mark Section Complete'}
                </button>
              </div>
            </div>
          )}

        {activeView === 'gallery' && (
  <div style={styles.galleryContainer}>
    <h2 style={styles.galleryTitle}>📸 Course Images & Diagrams</h2>
    {images.length === 0 ? (
      <p>No images available for this course</p>
    ) : (
      <div style={styles.imageGrid}>
        {images.map((img, idx) => (
          <div 
            key={img.id} 
            style={styles.imageCard}
            onClick={() => window.open(`/user/pdfs/${selectedPdf.id}/images/${img.id}`, '_blank')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img 
              src={`/user/pdfs/${selectedPdf.id}/images/${img.id}`}
              alt={`Course illustration ${idx + 1}`}
              style={styles.image}
              onError={(e) => {
                console.error('Failed to load image:', e.target.src);
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/200x150?text=Image+Not+Found';
              }}
            />
            <div style={styles.imageInfo}>
              <strong>Page {img.pageNumber}</strong> • {img.width}x{img.height}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
        </div>
      </div>
    );
  }

  // Course List View
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const progress = getProgressForCourse(course);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'in-progress') return matchesSearch && progress > 0 && progress < 100;
    if (activeTab === 'completed') return matchesSearch && progress === 100;
    return matchesSearch;
  });

  const stats = {
    total: courses.length,
    completed: courses.filter(c => getProgressForCourse(c) === 100).length,
    inProgress: courses.filter(c => getProgressForCourse(c) > 0 && getProgressForCourse(c) < 100).length,
    avgProgress: courses.length ? Math.floor(courses.reduce((sum, c) => sum + getProgressForCourse(c), 0) / courses.length) : 0
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/')}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          ← Back to Home
        </button>
        <h1 style={styles.title}>My Courses</h1>
        <p style={styles.subtitle}>Continue where you left off and master networking skills</p>
        
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.total}</div>
            <div style={styles.statLabel}>Total Enrolled</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.inProgress}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.completed}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.avgProgress}%</div>
            <div style={styles.statLabel}>Avg Progress</div>
          </div>
        </div>
      </div>

      <div style={styles.controls}>
        <button 
          style={styles.controlBtn(activeTab === 'all')} 
          onClick={() => setActiveTab('all')}
        >
          📚 All Courses
        </button>
        <button 
          style={styles.controlBtn(activeTab === 'in-progress')} 
          onClick={() => setActiveTab('in-progress')}
        >
          🚀 In Progress
        </button>
        <button 
          style={styles.controlBtn(activeTab === 'completed')} 
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed
        </button>
      </div>

      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search your courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📚</div>
          <h3 style={styles.emptyTitle}>No courses yet</h3>
          <p style={styles.emptyText}>Start your learning journey by enrolling in a course</p>
          <button 
            style={styles.browseBtn}
            onClick={() => navigate('/browse-courses')}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4a47d1'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#5E5BFF'}
          >
            Browse Courses →
          </button>
        </div>
      ) : (
        <div style={styles.coursesGrid}>
          {filteredCourses.map((course) => {
            const progress = getProgressForCourse(course);
            const isCompleted = progress === 100;
            
            return (
              <div 
                key={course.id} 
                style={styles.courseCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
                onClick={() => handleCourseClick(course)}
              >
                <div style={styles.courseHeader(getGradient(course.title))}>
                  <span style={styles.courseIcon}>{getCourseIcon(course.title)}</span>
                  {isCompleted && (
                    <div style={styles.completedBadge}>✓ Completed</div>
                  )}
                </div>
                
                <div style={styles.courseBody}>
                  <h3 style={styles.courseTitle}>{course.title}</h3>
                  <p style={styles.courseInstructor}>{course.instructor || 'Cisco Networking Academy'}</p>
                  
                  <div style={styles.progressSection}>
                    <div style={styles.progressBar}>
                      <div style={styles.progressFill(progress, isCompleted)}></div>
                    </div>
                    <div style={styles.progressText}>{progress}% complete</div>
                  </div>
                  
                  <button 
                    style={styles.continueBtn(isCompleted)}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course);
                    }}
                  >
                    {isCompleted ? '📖 Review Course' : '▶ Continue Learning'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.footer}>
        <p>Click on any course to continue learning</p>
        <p style={{ fontSize: '11px', marginTop: '8px' }}>
          ✓ Completed courses are marked with a green badge • Track your progress as you learn
        </p>
      </div>
    </div>
  );
}

export default MyCoursesPage;