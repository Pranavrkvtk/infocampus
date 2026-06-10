// src/components/CourseViewTab.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getPdfText, getPdfImages, formatFileSize } from '../api/pdfApi';
import Swal from 'sweetalert2';

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
    transition: 'background 0.2s',
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
    transition: 'transform 0.2s',
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
  tocItem: {
    padding: '12px 15px',
    cursor: 'pointer',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'all 0.2s',
    color: '#374151',
    marginBottom: '6px',
    border: '1px solid transparent',
  },
  tocItemActive: {
    background: '#5E5BFF',
    color: 'white',
    border: '1px solid #5E5BFF',
    boxShadow: '0 2px 8px rgba(94, 91, 255, 0.2)',
  },
  tocItemCompleted: {
    background: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
  },
  sectionBadge: {
    fontSize: '11px',
    marginLeft: '8px',
    opacity: 0.7,
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
    position: 'relative',
  },
  inlineImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
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
    transition: 'background 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
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
    transition: 'transform 0.2s, box-shadow 0.2s',
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
};

const CourseViewTab = ({ pdf, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [activeView, setActiveView] = useState('split');
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState([]);
  const [imagesByPage, setImagesByPage] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const contentRef = useRef(null);

  // Define loadCourseContent with useCallback to fix dependency warning
  const loadCourseContent = useCallback(async () => {
    setLoading(true);
    try {
      const textResponse = await getPdfText(pdf.id);
      const fullText = textResponse.data.text || '';

      const imagesResponse = await getPdfImages(pdf.id);
      const imageList = imagesResponse.data.images || [];
      setImages(imageList);
      
      const groupedByPage = {};
      imageList.forEach(img => {
        if (!groupedByPage[img.pageNumber]) {
          groupedByPage[img.pageNumber] = [];
        }
        groupedByPage[img.pageNumber].push(img);
      });
      setImagesByPage(groupedByPage);

      const extractedSections = extractSections(fullText);
      setSections(extractedSections);

      // Load saved progress
      const savedCompleted = localStorage.getItem(`course_completed_${pdf.id}`);
      if (savedCompleted) {
        const completed = JSON.parse(savedCompleted);
        setCompletedSections(completed);
        const savedProgress = (completed.length / extractedSections.length) * 100;
        setProgress(savedProgress);
      }

    } catch (error) {
      console.error("Error loading course content:", error);
      Swal.fire("Error", "Failed to load course content", "error");
    } finally {
      setLoading(false);
    }
  }, [pdf]); // Added pdf as dependency

  useEffect(() => {
    if (pdf) {
      loadCourseContent();
    }
  }, [pdf, loadCourseContent]); // Added loadCourseContent to dependencies

  const extractSections = (text) => {
    const lines = text.split('\n');
    const sectionsArray = [];
    let currentSection = { title: 'Introduction', content: [] };
    
    for (const line of lines) {
      const trimmed = line.trim();
      if ((trimmed.toUpperCase() === trimmed && trimmed.length > 5 && trimmed.length < 100 && !trimmed.includes('.')) ||
          (trimmed.length < 60 && (trimmed.endsWith(':') || /^\d+\./.test(trimmed)))) {
        if (currentSection.content.length > 0) {
          sectionsArray.push(currentSection);
        }
        currentSection = { title: trimmed, content: [] };
      } else if (trimmed && trimmed.length > 20) {
        currentSection.content.push(trimmed);
      }
    }
    if (currentSection.content.length > 0) sectionsArray.push(currentSection);
    
    return sectionsArray.slice(0, 50);
  };

  const markSectionComplete = (index) => {
    let newCompleted = [...completedSections];
    if (!newCompleted.includes(index)) {
      newCompleted.push(index);
      setCompletedSections(newCompleted);
      localStorage.setItem(`course_completed_${pdf.id}`, JSON.stringify(newCompleted));
      const newProgress = (newCompleted.length / sections.length) * 100;
      setProgress(newProgress);
      localStorage.setItem(`course_progress_${pdf.id}`, newProgress);
      
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
        localStorage.removeItem(`course_completed_${pdf.id}`);
        localStorage.removeItem(`course_progress_${pdf.id}`);
        setCompletedSections([]);
        setProgress(0);
        Swal.fire('Reset!', 'Your progress has been reset.', 'success');
      }
    });
  };

const getImageUrl = (imageId) => {
  return `http://localhost:8080/api/user/pdfs/${pdf.id}/images/${imageId}`;
};
  const handleSectionClick = (index) => {
    setActiveSection(index);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  // Get images that belong to a specific section (based on page number)
  const getImagesForSection = (sectionIndex) => {
    const estimatedPage = Math.floor(sectionIndex / 3) + 1;
    return imagesByPage[estimatedPage] || [];
  };

  // Render the selected section content
  const renderSelectedSection = () => {
    const section = sections[activeSection];
    if (!section) {
      return (
        <div style={styles.emptySection}>
          <p>Select a section from the sidebar to view its content</p>
        </div>
      );
    }
    
    const sectionImages = getImagesForSection(activeSection);
    const isCompleted = completedSections.includes(activeSection);
    
    return (
      <div>
        <div style={styles.currentSectionHeader}>
          <h2 style={styles.currentSectionTitle}>{section.title}</h2>
          {isCompleted && (
            <span style={styles.sectionProgress}>✅ Completed</span>
          )}
        </div>
        
        <div style={styles.sectionContent}>
          {/* Images at exact positions related to this section */}
          {sectionImages.map((img, imgIdx) => (
            <div key={img.id} style={styles.imageWrapper}>
              <img 
                src={getImageUrl(img.id)} 
                alt={`Illustration ${imgIdx + 1}`}
                style={styles.inlineImage}
                onClick={() => window.open(getImageUrl(img.id), '_blank')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={styles.imageCaption}>
                Page {img.pageNumber} • {img.width}x{img.height}
              </div>
            </div>
          ))}
          
          {/* Section content paragraphs */}
          {section.content.map((para, pIdx) => (
            <p key={pIdx} style={styles.paragraph}>{para}</p>
          ))}
        </div>
        
        <button 
          style={styles.completeBtn}
          onClick={() => markSectionComplete(activeSection)}
          disabled={isCompleted}
        >
          {isCompleted ? '✓ Section Completed' : '✓ Mark Section Complete'}
        </button>
      </div>
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

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={onBack}>
        ← Back to PDF List
      </button>

      <div style={styles.courseHero}>
        <h1 style={styles.title}>{pdf.fileName.replace('.pdf', '')}</h1>
        <div style={styles.stats}>
          <span>📄 {pdf.pageCount} pages</span>
          <span>🖼️ {pdf.imageCount} images</span>
          <span>💾 {formatFileSize(pdf.fileSize)}</span>
        </div>
        <div style={styles.progressSection}>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${progress}%`}}></div>
          </div>
          <span style={styles.progressText}>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <div style={styles.controls}>
        <button style={styles.controlBtn(activeView === 'split')} onClick={() => setActiveView('split')}>
          📚 Course View
        </button>
        <button style={styles.controlBtn(activeView === 'gallery')} onClick={() => setActiveView('gallery')}>
          🖼️ Image Gallery ({images.length} images)
        </button>
        <button style={styles.resetBtn} onClick={resetProgress}>
          ⟳ Reset Progress
        </button>
      </div>

      {activeView === 'split' && (
        <div style={styles.splitView}>
          {/* Left Panel - Table of Contents (Click to navigate) */}
          <div style={styles.tocPanel}>
            <h3 style={styles.tocTitle}>📑 Course Content</h3>
            <ul style={styles.tocList}>
              {sections.map((section, idx) => {
                const isActive = activeSection === idx;
                const isCompleted = completedSections.includes(idx);
                return (
                  <li 
                    key={idx} 
                    style={{
                      ...styles.tocItem,
                      ...(isActive ? styles.tocItemActive : {}),
                      ...(isCompleted && !isActive ? styles.tocItemCompleted : {})
                    }}
                    onClick={() => handleSectionClick(idx)}
                    onMouseEnter={(e) => {
                      if (!isActive && !isCompleted) {
                        e.currentTarget.style.background = '#f0f0ff';
                        e.currentTarget.style.borderColor = '#5E5BFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive && !isCompleted) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{section.title}</span>
                      {isCompleted && <span style={styles.sectionBadge}>✓</span>}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                      {section.content.length} paragraphs
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Panel - Selected Section Content */}
          <div style={styles.contentPanel} ref={contentRef}>
            {renderSelectedSection()}
          </div>
        </div>
      )}

      {activeView === 'gallery' && (
        <div style={styles.galleryContainer}>
          <h2 style={styles.galleryTitle}>📸 Course Images & Diagrams</h2>
          {images.length === 0 ? (
            <p>No images extracted from this PDF</p>
          ) : (
            <div style={styles.imageGrid}>
              {images.map((img, idx) => (
                <div 
                  key={img.id} 
                  style={styles.imageCard}
                  onClick={() => window.open(getImageUrl(img.id), '_blank')}
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
                    src={getImageUrl(img.id)} 
                    alt={`Course illustration ${idx + 1}`}
                    style={styles.image}
                    onError={(e) => {
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

      <div style={styles.footer}>
        <p>Generated from PDF: {pdf.fileName}</p>
        <p>Click on any section in the sidebar to view its content</p>
        <p style={{ fontSize: '11px', marginTop: '8px' }}>
          ✓ Completed sections are marked in green • Click "Mark Section Complete" when done
        </p>
      </div>
    </div>
  );
};

export default CourseViewTab;