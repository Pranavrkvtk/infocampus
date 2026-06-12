// src/components/CourseViewTab.jsx - UPDATED VERSION
import React, { useState, useEffect, useRef } from 'react';
// At the top of CourseViewTab.jsx
import { 
  getPdfImages, 
  getCourseStructure, 
  generateCourseStructure, 
  autoFixPdf, 
  updateSubtopicContent, 
  deleteCourseStructure 
} from '../api/pdfApi';
import Swal from 'sweetalert2';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

const styles = {
  container: {
    padding: '0',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#fff',
    minHeight: '100vh',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: '#5E5BFF',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '16px 24px',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  courseHero: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: 'white',
    padding: '48px',
    marginBottom: '0',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  stats: {
    display: 'flex',
    gap: '30px',
    marginTop: '24px',
    fontSize: '14px',
    opacity: 0.9,
    flexWrap: 'wrap',
  },
  progressSection: {
    marginTop: '24px',
    maxWidth: '400px',
  },
  progressBar: {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    height: '8px',
    overflow: 'hidden',
  },
  progressFill: {
    background: '#22c55e',
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.3s',
  },
  progressText: {
    display: 'block',
    marginTop: '8px',
    fontSize: '12px',
    opacity: 0.8,
  },
  controls: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap',
  },
  controlBtn: (active) => ({
    padding: '8px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    background: active ? '#5E5BFF' : '#f3f4f6',
    color: active ? 'white' : '#374151',
  }),
  resetBtn: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    background: '#ef4444',
    color: 'white',
  },
  generateBtn: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    background: '#8b5cf6',
    color: 'white',
  },
  fixBtn: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    background: '#10b981',
    color: 'white',
  },
  layout: {
    display: 'flex',
    gap: '0',
    minHeight: 'calc(100vh - 280px)',
  },
  sidebar: {
    width: '320px',
    background: '#fafbfc',
    borderRight: '1px solid #e5e7eb',
    overflowY: 'auto',
    height: 'calc(100vh - 200px)',
    position: 'sticky',
    top: '60px',
  },
  contentArea: {
    flex: 1,
    padding: '32px 48px',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
    background: '#fff',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    background: '#fff',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  sidebarSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  categoryItem: {
    borderBottom: '1px solid #e5e7eb',
  },
  categoryHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    background: '#fff',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
  },
  categoryHeaderActive: {
    background: '#f0f0ff',
    borderLeft: '3px solid #5E5BFF',
  },
  categoryTitle: {
    flex: 1,
  },
  chevron: {
    fontSize: '16px',
    color: '#9ca3af',
    transition: 'transform 0.2s',
  },
  lessonList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    background: '#fafbfc',
  },
  lessonItem: {
    padding: '10px 20px 10px 40px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#4b5563',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonItemActive: {
    background: '#ede9fe',
    color: '#5E5BFF',
    borderLeft: '3px solid #5E5BFF',
  },
  lessonItemCompleted: {
    color: '#10b981',
  },
  checkIcon: {
    color: '#10b981',
    fontSize: '14px',
  },
  contentHeader: {
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  breadcrumb: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  lessonTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  completionBadge: {
    display: 'inline-block',
    background: '#f0fdf4',
    color: '#16a34a',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    marginLeft: '12px',
  },
  contentBody: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: '#374151',
  },
  noteBox: {
    background: '#fefce8',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #fef08a',
  },
  noteTitle: {
    fontWeight: '600',
    color: '#854d0e',
    marginBottom: '8px',
  },
  noteText: {
    color: '#713f12',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  emptyNote: {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#6b7280',
  },
  completeBtn: {
    background: '#22c55e',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '32px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  editBtn: {
    background: '#5E5BFF',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: '12px',
  },
  galleryContainer: {
    padding: '32px',
  },
  galleryTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  imageCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'white',
  },
  image: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
  },
  imageInfo: {
    padding: '12px',
    fontSize: '12px',
    textAlign: 'center',
    background: '#f8f9fa',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '16px',
    color: '#5E5BFF',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#9ca3af',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    padding: '24px',
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
};

const CourseViewTab = ({ pdf, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [activeView, setActiveView] = useState('split');
  const [progress, setProgress] = useState(0);
  const [courseStructure, setCourseStructure] = useState(null);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [pdfData, setPdfData] = useState(pdf);
  const contentRef = useRef(null);

  const getBaseUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
  const getImageUrl = (imageId) => `${getBaseUrl()}/user/pdfs/${pdfData?.id}/images/${imageId}`;
  const getImageSrc = (imageId) => imageErrors[imageId] ? FALLBACK_IMAGE : getImageUrl(imageId);
  const handleImageError = (imageId) => { if (!imageErrors[imageId]) setImageErrors(prev => ({ ...prev, [imageId]: true })); };

  // Normalize course structure data (handles subTopics vs subtopics)
  const normalizeCourseStructure = (data) => {
    if (!data) return data;
    
    return {
      ...data,
      topics: (data.topics || []).map(topic => ({
        ...topic,
        // Handle both subTopics (Java) and subtopics (JavaScript)
        subtopics: (topic.subTopics || topic.subtopics || []).map(sub => ({
          id: sub.id,
          title: sub.title,
          content: sub.content || '',
          displayOrder: sub.displayOrder || 0
        }))
      }))
    };
  };

  const loadCourseStructure = async (courseId) => {
    if (!courseId) return;
    try {
      console.log("Loading course structure for courseId:", courseId);
      const response = await getCourseStructure(courseId);
      console.log("Raw API response:", response.data);
      
      // ✅ Normalize the data
      const normalizedData = normalizeCourseStructure(response.data);
      console.log("Normalized data:", normalizedData);
      console.log("First topic subtopics:", normalizedData.topics?.[0]?.subtopics);
      
      setCourseStructure(normalizedData);
      
      const savedCompleted = localStorage.getItem(`lessons_completed_${courseId}`);
      if (savedCompleted) {
        setCompletedLessons(JSON.parse(savedCompleted));
      }
      
      // Auto-select first topic and lesson
      if (normalizedData.topics && normalizedData.topics.length > 0) {
        const firstTopicId = normalizedData.topics[0].id;
        setOpenCategoryId(firstTopicId);
        
        const firstSubtopic = normalizedData.topics[0].subtopics?.[0];
        if (firstSubtopic) {
          setActiveLessonId(firstSubtopic.id);
        }
      }
      
      const totalLessons = normalizedData.topics?.reduce((sum, t) => sum + (t.subtopics?.length || 0), 0) || 0;
      const completed = savedCompleted ? JSON.parse(savedCompleted).length : 0;
      setProgress(totalLessons > 0 ? (completed / totalLessons) * 100 : 0);
      
    } catch (error) {
      console.error("Error loading course structure:", error);
      console.error("Error details:", error.response?.data);
    }
  };

  const loadImages = async (pdfId) => {
    if (!pdfId) return;
    try {
      const response = await getPdfImages(pdfId);
      setImages(response.data.images || []);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  useEffect(() => {
    if (pdf) {
      console.log("PDF Data received:", pdf);
      setPdfData(pdf);
      loadImages(pdf.id);
      if (pdf.courseId) {
        loadCourseStructure(pdf.courseId);
      }
      setLoading(false);
    }
  }, [pdf]);

  const handleGenerateStructure = async () => {
    if (!pdfData?.courseId) {
      Swal.fire({ 
        title: 'Missing Course', 
        text: 'This PDF is not yet linked to a course. Click "Auto-Fix" first.', 
        icon: 'warning' 
      });
      return;
    }

    const hasStructure = courseStructure?.topics?.length > 0;
    const confirmText = hasStructure
      ? 'A structure already exists. Regenerating will replace existing categories and lessons.'
      : 'Generate a course structure from the PDF content?';

    const result = await Swal.fire({
      title: hasStructure ? 'Regenerate Course Structure?' : 'Generate Course Structure?',
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: hasStructure ? 'Regenerate' : 'Generate',
    });

    if (!result.isConfirmed) return;

    setGenerating(true);
    Swal.fire({ 
      title: hasStructure ? 'Regenerating Course...' : 'Generating Course...', 
      text: 'Parsing PDF content...', 
      didOpen: () => Swal.showLoading() 
    });
    
    try {
      if (hasStructure) {
        await deleteCourseStructure(pdfData.courseId);
      }

      const response = await generateCourseStructure(pdfData.id);
      Swal.fire({ 
        title: 'Success!', 
        text: `Generated ${response.data.topicsCount} categories`, 
        icon: 'success', 
        timer: 2000 
      });
      
      if (pdfData.courseId) {
        await loadCourseStructure(pdfData.courseId);
      }
    } catch (error) {
      console.error("Generate error:", error);
      Swal.fire({ 
        title: 'Failed', 
        text: error.response?.data?.error || 'Unable to generate course structure', 
        icon: 'error' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAutoFix = async () => {
    setGenerating(true);
    Swal.fire({ 
      title: 'Auto-Fixing...', 
      text: 'Creating course from filename...', 
      didOpen: () => Swal.showLoading() 
    });
    
    try {
      const response = await autoFixPdf(pdfData?.id);
      console.log("Auto-fix response:", response.data);
      
      Swal.fire({ 
        title: 'Success!', 
        text: `Course created!`, 
        icon: 'success', 
        timer: 2000 
      });
      
      const courseId = response.data.courseId;
      setPdfData(prev => ({ ...prev, courseId }));
      await loadCourseStructure(courseId);
      
    } catch (error) {
      console.error("Auto-fix error:", error);
      Swal.fire({ 
        title: 'Failed', 
        text: error.response?.data?.error || 'Unable to auto-fix PDF', 
        icon: 'error' 
      });
    } finally { 
      setGenerating(false); 
    }
  };

  const toggleCategory = (categoryId) => {
    setOpenCategoryId(prev => (prev === categoryId ? null : categoryId));
  };

  const markLessonComplete = (lessonId) => {
    let newCompleted = completedLessons.includes(lessonId) 
      ? completedLessons.filter(id => id !== lessonId) 
      : [...completedLessons, lessonId];
    
    setCompletedLessons(newCompleted);
    
    const totalLessons = courseStructure?.topics?.reduce((sum, t) => sum + (t.subtopics?.length || 0), 0) || 0;
    const newProgress = totalLessons > 0 ? (newCompleted.length / totalLessons) * 100 : 0;
    setProgress(newProgress);
    
    localStorage.setItem(`lessons_completed_${pdfData.courseId}`, JSON.stringify(newCompleted));
    
    Swal.fire({
      title: newCompleted.includes(lessonId) ? '✓ Lesson Completed!' : 'Lesson Unmarked',
      text: newCompleted.includes(lessonId) ? 'Great job! Keep going!' : 'Lesson marked as incomplete.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleLessonClick = (categoryId, lessonId) => {
    setOpenCategoryId(categoryId);
    setActiveLessonId(lessonId);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setEditContent(lesson.content || '');
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;
    try {
      await updateSubtopicContent(editingLesson.id, editContent);
      setEditingLesson(null);
      await loadCourseStructure(pdfData?.courseId);
      Swal.fire("Success", "Notes saved!", "success");
    } catch (error) {
      console.error("Save error:", error);
      Swal.fire("Error", "Failed to save notes", "error");
    }
  };

  const getSelectedLesson = () => {
    if (!courseStructure || !activeLessonId) return null;
    for (const category of courseStructure.topics) {
      const lesson = category.subtopics?.find(l => l.id === activeLessonId);
      if (lesson) return { category, lesson };
    }
    return null;
  };

  const resetProgress = () => {
    const courseId = pdfData?.courseId;
    Swal.fire({ 
      title: 'Reset Progress?', 
      text: 'Clear all completed lessons?', 
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, reset'
    }).then(result => { 
      if (result.isConfirmed) { 
        setCompletedLessons([]); 
        setProgress(0); 
        if (courseId) localStorage.removeItem(`lessons_completed_${courseId}`);
        Swal.fire('Reset', 'Progress has been reset', 'success');
      } 
    });
  };

  const renderSidebar = () => {
    if (!courseStructure?.topics?.length) {
      return (
        <div style={styles.emptyState}>
          <p>No course structure found.</p>
          {!pdfData?.courseId && <p>Click "Auto-Fix" to create a course.</p>}
          {pdfData?.courseId && <p>Click "Generate" to create structure.</p>}
        </div>
      );
    }

    const totalLessons = courseStructure.topics.reduce((sum, t) => sum + (t.subtopics?.length || 0), 0);
    const totalTopics = courseStructure.topics.length;

    return (
      <>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarTitle}>📚 Course Contents</div>
          <div style={styles.sidebarSubtitle}>{totalTopics} categories • {totalLessons} lessons</div>
        </div>
        {courseStructure.topics.map((category) => {
          const isOpen = openCategoryId === category.id;
          const lessons = category.subtopics ?? [];
          const completedCount = lessons.filter(l => completedLessons.includes(l.id)).length;

          return (
            <div key={category.id} style={styles.categoryItem}>
              <button 
                style={{ ...styles.categoryHeader, ...(isOpen ? styles.categoryHeaderActive : {}) }}
                onClick={() => toggleCategory(category.id)}
              >
                <span style={styles.categoryTitle}>
                  {category.title}
                  {completedCount > 0 && (
                    <span style={{ fontSize: '11px', marginLeft: '8px', color: '#10b981' }}>
                      ✓ {completedCount}/{lessons.length}
                    </span>
                  )}
                </span>
                <span style={{ ...styles.chevron, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
              </button>
              
              {isOpen && (
                <ul style={styles.lessonList}>
                  {lessons.map((lesson, idx) => {
                    const isActive = activeLessonId === lesson.id;
                    const isCompleted = completedLessons.includes(lesson.id);
                    return (
                      <li
                        key={lesson.id}
                        style={{
                          ...styles.lessonItem,
                          ...(isActive ? styles.lessonItemActive : {}),
                        }}
                        onClick={() => handleLessonClick(category.id, lesson.id)}
                      >
                        <span style={isCompleted ? styles.lessonItemCompleted : {}}>
                          {idx + 1}. {lesson.title}
                        </span>
                        {isCompleted && <span style={styles.checkIcon}>✓</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </>
    );
  };
const renderContent = () => {
  const selected = getSelectedLesson();
  if (!selected) {
    return (
      <div style={styles.emptyState}>
        <p>Select a lesson from the sidebar to begin learning</p>
      </div>
    );
  }

  const { category, lesson } = selected;
  const isCompleted = completedLessons.includes(lesson.id);
  
  // Use title as fallback content if content is empty
  const displayContent = lesson.content && lesson.content !== lesson.title 
    ? lesson.content 
    : `📖 ${lesson.title}\n\nThis section covers ${lesson.title}. Click "Add Notes" to add your own study notes.`;

  return (
    <>
      <div style={styles.contentHeader}>
        <div>
          <div style={styles.breadcrumb}>{category.title}</div>
          <div style={styles.lessonTitle}>
            {lesson.title}
            {isCompleted && <span style={styles.completionBadge}>✓ Completed</span>}
          </div>
        </div>
        <button style={styles.editBtn} onClick={() => handleEditLesson(lesson)}>
          ✏️ Add Notes
        </button>
      </div>

      <div style={styles.contentBody}>
        <div style={styles.noteBox}>
          <div style={styles.noteTitle}>📝 Lesson Content</div>
          <div style={styles.noteText} style={{ whiteSpace: 'pre-wrap' }}>
            {displayContent}
          </div>
        </div>
      </div>

      <button 
        style={{ ...styles.completeBtn, background: isCompleted ? '#10b981' : '#22c55e' }}
        onClick={() => markLessonComplete(lesson.id)}
      >
        {isCompleted ? '✓ Completed' : '✓ Mark as Complete'}
      </button>
    </>
  );
};

  if (loading) return <div style={styles.loadingContainer}>Loading course content...</div>;

  const totalLessons = courseStructure?.topics?.reduce((sum, t) => sum + (t.subtopics?.length || 0), 0) || 0;
  const totalTopics = courseStructure?.topics?.length || 0;

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        ← Back to PDF List
      </button>

      <div style={styles.courseHero}>
        <h1 style={styles.title}>{pdfData?.fileName?.replace('.pdf', '') || 'Course Content'}</h1>
        <div style={styles.stats}>
          <span>📄 {pdfData?.pageCount || 0} pages</span>
          <span>🖼️ {images.length} images</span>
          <span>📚 {totalTopics} categories</span>
          <span>📝 {totalLessons} lessons</span>
        </div>
        {totalLessons > 0 && (
          <div style={styles.progressSection}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <span style={styles.progressText}>
              {Math.round(progress)}% complete ({completedLessons.length}/{totalLessons} lessons)
            </span>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <button 
          style={styles.controlBtn(activeView === 'split')} 
          onClick={() => setActiveView('split')}
        >
          📚 Course Content
        </button>
        <button 
          style={styles.controlBtn(activeView === 'gallery')} 
          onClick={() => setActiveView('gallery')}
        >
          🖼️ Images ({images.length})
        </button>
        {pdfData?.courseId && (
          <button 
            style={styles.generateBtn} 
            onClick={handleGenerateStructure} 
            disabled={generating}
          >
            {generating ? '⏳...' : '🔧 Generate'}
          </button>
        )}
        {!pdfData?.courseId && (
          <button 
            style={styles.fixBtn} 
            onClick={handleAutoFix} 
            disabled={generating}
          >
            {generating ? '⏳...' : '🔧 Auto-Fix'}
          </button>
        )}
        {totalLessons > 0 && (
          <button style={styles.resetBtn} onClick={resetProgress}>
            ⟳ Reset Progress
          </button>
        )}
      </div>

      {activeView === 'split' && (
        <div style={styles.layout}>
          <div style={styles.sidebar}>{renderSidebar()}</div>
          <div style={styles.contentArea} ref={contentRef}>{renderContent()}</div>
        </div>
      )}

      {activeView === 'gallery' && (
        <div style={styles.galleryContainer}>
          <h2 style={styles.galleryTitle}>📸 Course Images ({images.length})</h2>
          <div style={styles.imageGrid}>
            {images.map((img, idx) => (
              <div 
                key={img.id || idx} 
                style={styles.imageCard} 
                onClick={() => window.open(getImageUrl(img.id), '_blank')}
              >
                <img 
                  src={getImageSrc(img.id)} 
                  alt={`Course image ${idx + 1}`} 
                  style={styles.image} 
                  onError={() => handleImageError(img.id)} 
                />
                <div style={styles.imageInfo}>
                  Page {img.pageNumber} • {img.width}×{img.height}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingLesson && (
        <div style={styles.modal} onClick={() => setEditingLesson(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Edit Notes: {editingLesson.title}</h3>
            <textarea 
              value={editContent} 
              onChange={e => setEditContent(e.target.value)} 
              style={styles.textarea} 
              placeholder="Add your notes here..." 
            />
            <div style={styles.modalButtons}>
              <button onClick={() => setEditingLesson(null)}>Cancel</button>
              <button onClick={handleSaveLesson}>Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseViewTab;