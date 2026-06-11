// src/components/CourseViewTab.jsx - UPDATED WITH TOPICS/SUBTOPICS DISPLAY
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getPdfText, getPdfImages, formatFileSize, getCourseStructure, generateCourseStructure, autoFixPdf, updateSubtopicContent } from '../api/pdfApi';
import Swal from 'sweetalert2';

// Local SVG fallback image
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
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
    marginBottom: '20px',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  courseHero: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    color: 'white',
    padding: '40px',
    borderRadius: '20px',
    marginBottom: '30px',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '15px',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    margin: '20px 0',
    fontSize: '14px',
    opacity: 0.9,
    flexWrap: 'wrap',
  },
  progressSection: {
    marginTop: '20px',
    maxWidth: '400px',
    margin: '20px auto 0',
  },
  progressBar: {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    height: '8px',
    overflow: 'hidden',
  },
  progressFill: {
    background: '#5E5BFF',
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
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
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
  }),
  resetBtn: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    background: '#ef4444',
    color: 'white',
  },
  generateBtn: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    background: '#8b5cf6',
    color: 'white',
  },
  fixBtn: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    background: '#10b981',
    color: 'white',
  },
  splitView: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '30px',
  },
  tocPanel: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    position: 'sticky',
    top: '20px',
    height: 'calc(100vh - 100px)',
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
  topicItem: {
    marginBottom: '16px',
  },
  topicHeader: {
    padding: '12px 15px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
    background: '#f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtopicList: {
    listStyle: 'none',
    paddingLeft: '20px',
    marginTop: '8px',
  },
  subtopicItem: {
    padding: '10px 15px',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '13px',
    transition: 'all 0.2s',
    color: '#374151',
    marginBottom: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtopicItemActive: {
    background: '#e0e7ff',
    color: '#5E5BFF',
    fontWeight: '500',
  },
  subtopicItemCompleted: {
    background: '#f0fdf4',
    color: '#16a34a',
  },
  checkIcon: {
    color: '#16a34a',
    fontSize: '16px',
  },
  contentPanel: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    maxHeight: 'calc(100vh - 100px)',
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
    fontSize: '24px',
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
  sectionContent: {
    lineHeight: '1.8',
  },
  paragraph: {
    lineHeight: '1.8',
    marginBottom: '16px',
    color: '#374151',
    fontSize: '15px',
  },
  imageWrapper: {
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  inlineImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  imageCaption: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
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
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  editBtn: {
    background: '#5E5BFF',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: '10px',
  },
  galleryContainer: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
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
  footer: {
    textAlign: 'center',
    padding: '30px',
    marginTop: '30px',
    color: '#9ca3af',
    fontSize: '12px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
    color: '#5E5BFF',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#9ca3af',
  },
  emptySection: {
    textAlign: 'center',
    padding: '40px',
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
};

const CourseViewTab = ({ pdf, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [images, setImages] = useState([]);
  const [activeView, setActiveView] = useState('split');
  const [progress, setProgress] = useState(0);
  const [courseStructure, setCourseStructure] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [activeSubtopicId, setActiveSubtopicId] = useState(null);
  const [completedSubtopics, setCompletedSubtopics] = useState([]);
  const [editingSubtopic, setEditingSubtopic] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const contentRef = useRef(null);

  const getBaseUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

  const getImageUrl = (imageId) => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/user/pdfs/${pdf.id}/images/${imageId}`;
  };

  const handleImageError = (imageId) => {
    if (!imageErrors[imageId]) {
      setImageErrors(prev => ({ ...prev, [imageId]: true }));
    }
  };

  const getImageSrc = (imageId) => {
    return imageErrors[imageId] ? FALLBACK_IMAGE : getImageUrl(imageId);
  };

  const loadCourseStructure = async () => {
    if (!pdf.courseId) return;
    
    try {
      const response = await getCourseStructure(pdf.courseId);
      console.log("Course structure:", response.data);
      setCourseStructure(response.data);
      
      // Load completed subtopics from localStorage
      const savedCompleted = localStorage.getItem(`subtopics_completed_${pdf.courseId}`);
      if (savedCompleted) {
        setCompletedSubtopics(JSON.parse(savedCompleted));
      }
      
      // Calculate progress
      if (response.data.topics && response.data.topics.length > 0) {
        const totalSubtopics = response.data.topics.reduce(
          (sum, topic) => sum + (topic.subtopics?.length || 0), 0
        );
        const completed = savedCompleted ? JSON.parse(savedCompleted).length : 0;
        setProgress(totalSubtopics > 0 ? (completed / totalSubtopics) * 100 : 0);
      }
      
      // Set first subtopic as active
      if (response.data.topics && response.data.topics.length > 0) {
        const firstTopic = response.data.topics[0];
        setActiveTopicId(firstTopic.id);
        if (firstTopic.subtopics && firstTopic.subtopics.length > 0) {
          setActiveSubtopicId(firstTopic.subtopics[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading course structure:", error);
    }
  };

  const loadImages = async () => {
    try {
      const imagesResponse = await getPdfImages(pdf.id);
      setImages(imagesResponse.data.images || []);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  useEffect(() => {
    if (pdf) {
      loadImages();
      if (pdf.courseId) {
        loadCourseStructure();
      }
      setLoading(false);
    }
  }, [pdf]);

  const handleGenerateStructure = async () => {
    setGenerating(true);
    Swal.fire({
      title: 'Generating Course Structure...',
      text: 'Parsing PDF content to create topics and subtopics',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await generateCourseStructure(pdf.id);
      console.log("Generation response:", response.data);
      
      Swal.fire({
        title: 'Success!',
        text: `Generated ${response.data.topicsCount} topics and ${response.data.subtopicsCount} subtopics`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      if (pdf.courseId) {
        await loadCourseStructure();
      }
    } catch (error) {
      console.error("Generation error:", error);
      Swal.fire({
        title: 'Generation Failed',
        text: error.response?.data?.error || 'Failed to generate structure. Make sure PDF has extractable text.',
        icon: 'error'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAutoFix = async () => {
    setGenerating(true);
    Swal.fire({
      title: 'Auto-Fixing PDF...',
      text: 'Creating course from filename and generating structure',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await autoFixPdf(pdf.id);
      console.log("Auto-fix response:", response.data);
      
      Swal.fire({
        title: 'Success!',
        text: `Course "${response.data.courseTitle}" created and structure generated!`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      pdf.courseId = response.data.courseId;
      pdf.courseTitle = response.data.courseTitle;
      await loadCourseStructure();
      
    } catch (error) {
      console.error("Auto-fix error:", error);
      Swal.fire({
        title: 'Fix Failed',
        text: error.response?.data?.error || 'Failed to auto-fix PDF',
        icon: 'error'
      });
    } finally {
      setGenerating(false);
    }
  };

  const markSubtopicComplete = (subtopicId) => {
    let newCompleted;
    if (completedSubtopics.includes(subtopicId)) {
      newCompleted = completedSubtopics.filter(id => id !== subtopicId);
    } else {
      newCompleted = [...completedSubtopics, subtopicId];
    }
    setCompletedSubtopics(newCompleted);
    
    const totalSubtopics = courseStructure.topics.reduce(
      (sum, topic) => sum + (topic.subtopics?.length || 0), 0
    );
    const percentComplete = totalSubtopics > 0 ? (newCompleted.length / totalSubtopics) * 100 : 0;
    setProgress(percentComplete);
    
    localStorage.setItem(`subtopics_completed_${pdf.courseId}`, JSON.stringify(newCompleted));
    
    Swal.fire({
      title: newCompleted.includes(subtopicId) ? '✅ Great!' : '⏳ Unmarked',
      text: newCompleted.includes(subtopicId) ? 'Keep up the good work!' : 'You can mark it complete again later.',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    });
  };

  const resetProgress = () => {
    Swal.fire({
      title: 'Reset Progress?',
      text: 'Clear all completed sections?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        setCompletedSubtopics([]);
        setProgress(0);
        localStorage.removeItem(`subtopics_completed_${pdf.courseId}`);
        Swal.fire('Reset!', 'Progress reset successfully.', 'success');
      }
    });
  };

  const handleSubtopicClick = (topicId, subtopicId) => {
    setActiveTopicId(topicId);
    setActiveSubtopicId(subtopicId);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  const handleEditSubtopic = (subtopic) => {
    setEditingSubtopic(subtopic);
    setEditContent(subtopic.content || '');
  };

  const handleSaveSubtopic = async () => {
    if (!editingSubtopic) return;
    
    try {
      await updateSubtopicContent(editingSubtopic.id, editContent);
      setEditingSubtopic(null);
      setEditContent('');
      await loadCourseStructure();
      Swal.fire("Success", "Subtopic notes saved!", "success");
    } catch (error) {
      console.error("Error saving subtopic:", error);
      Swal.fire("Error", "Failed to save notes", "error");
    }
  };

  const getSelectedSubtopic = () => {
    if (!courseStructure || !activeSubtopicId) return null;
    
    for (const topic of courseStructure.topics) {
      const subtopic = topic.subtopics?.find(s => s.id === activeSubtopicId);
      if (subtopic) {
        return { topic, subtopic };
      }
    }
    return null;
  };

  const renderSelectedSubtopic = () => {
    const selected = getSelectedSubtopic();
    if (!selected) {
      return (
        <div style={styles.emptySection}>
          <p>Select a topic from the sidebar to begin learning</p>
        </div>
      );
    }

    const { topic, subtopic } = selected;
    const isCompleted = completedSubtopics.includes(subtopic.id);
    
    return (
      <div>
        <div style={styles.currentSectionHeader}>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              {topic.title}
            </div>
            <h2 style={styles.currentSectionTitle}>{subtopic.title}</h2>
          </div>
          <div>
            {isCompleted && <span style={styles.sectionProgress}>✅ Completed</span>}
            <button 
              style={styles.editBtn}
              onClick={() => handleEditSubtopic(subtopic)}
            >
              ✏️ Add Notes
            </button>
          </div>
        </div>

        <div style={styles.sectionContent}>
          {subtopic.content && (
            <div style={{ 
              background: '#fefce8', 
              padding: '16px', 
              borderRadius: '12px', 
              marginBottom: '24px',
              border: '1px solid #fef08a'
            }}>
              <strong style={{ color: '#854d0e' }}>📝 Content:</strong>
              <p style={{ marginTop: '8px', color: '#713f12' }}>{subtopic.content}</p>
            </div>
          )}
          
          {!subtopic.content && (
            <div style={{ 
              background: '#eff6ff', 
              padding: '16px', 
              borderRadius: '12px', 
              marginBottom: '24px',
              border: '1px solid #bfdbfe'
            }}>
              <p>No content available for this subtopic yet.</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Click "Add Notes" to add your own notes or content.</p>
            </div>
          )}
        </div>

        <button
          style={styles.completeBtn}
          onClick={() => markSubtopicComplete(subtopic.id)}
        >
          {isCompleted ? '✓ Completed' : '✓ Mark Complete'}
        </button>
      </div>
    );
  };

  const renderTopicTree = () => {
    if (!courseStructure || !courseStructure.topics || courseStructure.topics.length === 0) {
      return (
        <div style={styles.emptyState}>
          <p>No course structure found.</p>
          <p style={{ fontSize: '13px', marginTop: '10px' }}>
            {pdf.courseId ? 'Click "Generate Structure" button to create topics from this PDF!' : 'Click "Auto-Fix" button to create a course and generate structure!'}
          </p>
        </div>
      );
    }

    return (
      <ul style={styles.tocList}>
        {courseStructure.topics.map((topic) => (
          <li key={topic.id} style={styles.topicItem}>
            <div style={styles.topicHeader}>
              <span>{topic.title}</span>
              <span style={{ fontSize: '11px', opacity: 0.7 }}>
                {topic.subtopics?.filter(s => completedSubtopics.includes(s.id)).length || 0}/{topic.subtopics?.length || 0}
              </span>
            </div>
            <ul style={styles.subtopicList}>
              {topic.subtopics?.map((subtopic) => {
                const isActive = activeSubtopicId === subtopic.id;
                const isCompleted = completedSubtopics.includes(subtopic.id);
                return (
                  <li
                    key={subtopic.id}
                    style={{
                      ...styles.subtopicItem,
                      ...(isActive ? styles.subtopicItemActive : {}),
                      ...(isCompleted && !isActive ? styles.subtopicItemCompleted : {}),
                    }}
                    onClick={() => handleSubtopicClick(topic.id, subtopic.id)}
                  >
                    <span>
                      {subtopic.displayOrder}. {subtopic.title}
                    </span>
                    {isCompleted && <span style={styles.checkIcon}>✓</span>}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return <div style={styles.loadingContainer}>Loading course content...</div>;
  }

  if (!pdf) {
    return (
      <div style={styles.emptyState}>
        <p>No course selected. Please go back and select a PDF to view.</p>
        <button onClick={onBack} style={styles.controlBtn(false)}>Back to PDF List</button>
      </div>
    );
  }

  const hasCourse = !!pdf.courseId;
  const totalSubtopics = courseStructure?.topics?.reduce(
    (sum, topic) => sum + (topic.subtopics?.length || 0), 0
  ) || 0;

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        ← Back to PDF List
      </button>

      <div style={styles.courseHero}>
        <h1 style={styles.title}>{pdf.fileName?.replace('.pdf', '') || 'Course Content'}</h1>
        <div style={styles.stats}>
          <span>📄 {pdf.pageCount || 0} pages</span>
          <span>🖼️ {images.length} images</span>
          <span>📚 {courseStructure?.totalTopics || 0} Topics</span>
          <span>📝 {totalSubtopics} Subtopics</span>
          <span>💾 {formatFileSize(pdf.fileSize)}</span>
        </div>
        {totalSubtopics > 0 && (
          <div style={styles.progressSection}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <span style={styles.progressText}>{Math.round(progress)}% Complete ({completedSubtopics.length}/{totalSubtopics} subtopics)</span>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <button style={styles.controlBtn(activeView === 'split')} onClick={() => setActiveView('split')}>
          📚 Course View
        </button>
        <button style={styles.controlBtn(activeView === 'gallery')} onClick={() => setActiveView('gallery')}>
          🖼️ Image Gallery ({images.length})
        </button>
        
        {hasCourse && (
          <button 
            style={styles.generateBtn} 
            onClick={handleGenerateStructure}
            disabled={generating}
          >
            {generating ? '⏳ Generating...' : '🔧 Generate Structure'}
          </button>
        )}
        
        {!hasCourse && (
          <button 
            style={styles.fixBtn} 
            onClick={handleAutoFix}
            disabled={generating}
          >
            {generating ? '⏳ Fixing...' : '🔧 Auto-Fix (Create Course)'}
          </button>
        )}
        
        {totalSubtopics > 0 && (
          <button style={styles.resetBtn} onClick={resetProgress}>
            ⟳ Reset Progress
          </button>
        )}
      </div>

      {activeView === 'split' && (
        <div style={styles.splitView}>
          <div style={styles.tocPanel}>
            <h3 style={styles.tocTitle}>📑 Course Content</h3>
            {renderTopicTree()}
          </div>

          <div style={styles.contentPanel} ref={contentRef}>
            {renderSelectedSubtopic()}
          </div>
        </div>
      )}

      {activeView === 'gallery' && (
        <div style={styles.galleryContainer}>
          <h2 style={styles.galleryTitle}>📸 Course Images ({images.length})</h2>
          {images.length === 0 ? (
            <p>No images found in this PDF</p>
          ) : (
            <div style={styles.imageGrid}>
              {images.map((img, idx) => (
                <div key={img.id || idx} style={styles.imageCard}>
                  <img 
                    src={getImageSrc(img.id)} 
                    alt={`Course illustration ${idx + 1}`}
                    style={styles.image}
                    onError={() => handleImageError(img.id)}
                  />
                  <div style={styles.imageInfo}>
                    Page {img.pageNumber} • {img.width}x{img.height}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingSubtopic && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: '16px' }}>
              Edit Notes: {editingSubtopic.title}
            </h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={styles.textarea}
              placeholder="Add detailed notes, code examples, key takeaways, or additional resources for this subtopic..."
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingSubtopic(null)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubtopic}
                style={{
                  padding: '10px 20px',
                  background: '#5E5BFF',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <p>Generated from PDF: {pdf.fileName}</p>
        <p>Click on any subtopic to view its content • Mark as complete when done</p>
      </div>
    </div>
  );
};

export default CourseViewTab;