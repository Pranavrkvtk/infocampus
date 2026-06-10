import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Local SVG fallback image (no external dependency)
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";

function MyCoursesPage() {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [activeView, setActiveView] = useState('split');
  const [activeSection, setActiveSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sections, setSections] = useState([]);
  const [images, setImages] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const isMobile = window.innerWidth < 768;

  // Get the base URL from environment or window location
  const getBaseUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  };

  // Fixed getImageUrl function with full URL
  const getImageUrl = (pdfId, imageId) => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/user/pdfs/${pdfId}/images/${imageId}`;
  };

  // Handle image load error with local fallback
  const handleImageError = (imageId) => {
    if (!imageErrors[imageId]) {
      setImageErrors(prev => ({ ...prev, [imageId]: true }));
    }
  };

  // Get the image source (with fallback if error)
  const getImageSrc = (pdfId, imageId) => {
    return imageErrors[imageId] ? FALLBACK_IMAGE : getImageUrl(pdfId, imageId);
  };

  useEffect(() => {
    fetchUserPdfs();
  }, []);

  const fetchUserPdfs = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/user/pdfs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('PDFs found:', data);
      setPdfs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setLoading(false);
    }
  };

  const extractSectionsFromText = (text) => {
    if (!text) return [];

    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const sectionsArray = [];
    let currentSection = { title: 'Introduction', content: [] };

    for (const line of lines) {
      const trimmed = line.trim();
      if ((trimmed.toUpperCase() === trimmed && trimmed.length > 5 && trimmed.length < 100) ||
          (trimmed.endsWith(':') && trimmed.length < 60) ||
          (/^\d+\./.test(trimmed))) {
        if (currentSection.content.length > 0) {
          sectionsArray.push(currentSection);
        }
        currentSection = { title: trimmed.replace(/:/g, ''), content: [] };
      } else if (trimmed.length > 20) {
        currentSection.content.push(trimmed);
      }
    }

    if (currentSection.content.length > 0) sectionsArray.push(currentSection);

    return sectionsArray.length > 0 ? sectionsArray : generateDefaultSections();
  };

  const generateDefaultSections = () => {
    return [
      { title: "Introduction", content: ["Welcome to this course. Click 'Mark Section Complete' when you finish reading."] },
      { title: "Key Concepts", content: ["The main concepts and topics covered in this document."] },
      { title: "Detailed Content", content: ["Detailed explanations and examples from the PDF."] },
      { title: "Summary", content: ["Key takeaways and important points to remember."] }
    ];
  };

  const getImagesForSection = (sectionIndex) => {
    const estimatedPage = Math.floor(sectionIndex / 3) + 1;
    return images.filter(img => img.pageNumber === estimatedPage);
  };

  const handlePdfClick = async (pdf) => {
    setSelectedPdf(pdf);
    setContentLoading(true);
    setImageErrors({}); // Reset image errors for new PDF

    try {
      const token = localStorage.getItem('token');
      const baseUrl = getBaseUrl();

      const textResponse = await fetch(`${baseUrl}/user/pdfs/${pdf.id}/text`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (textResponse.ok) {
        const textData = await textResponse.json();
        const extractedSections = extractSectionsFromText(textData.text || '');
        setSections(extractedSections);
        console.log('Extracted sections:', extractedSections.length);
      } else {
        setSections(generateDefaultSections());
      }

      const imagesResponse = await fetch(`${baseUrl}/user/pdfs/${pdf.id}/images`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        const imageList = imagesData.images || [];
        setImages(imageList);
        console.log('Images found:', imageList.length);
      } else {
        setImages([]);
      }

      const savedCompleted = localStorage.getItem(`pdf_completed_${pdf.id}`);
      const totalSections = sections.length || 4;

      if (savedCompleted) {
        const completed = JSON.parse(savedCompleted);
        setCompletedSections(completed);
        const savedProgress = (completed.length / totalSections) * 100;
        setProgress(savedProgress);
      } else {
        setCompletedSections([]);
        setProgress(0);
      }
    } catch (error) {
      console.error('Error loading PDF content:', error);
      setSections(generateDefaultSections());
    } finally {
      setContentLoading(false);
    }
    setActiveSection(0);
  };

  const handleBack = () => {
    setSelectedPdf(null);
    setSections([]);
    setImages([]);
    setImageErrors({});
  };

  const markSectionComplete = (index) => {
    let newCompleted = [...completedSections];
    if (!newCompleted.includes(index)) {
      newCompleted.push(index);
      setCompletedSections(newCompleted);
      localStorage.setItem(`pdf_completed_${selectedPdf.id}`, JSON.stringify(newCompleted));
      const newProgress = (newCompleted.length / sections.length) * 100;
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
    Swal.fire({
      title: 'Reset Progress?',
      text: 'This will clear all your completed sections.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(`pdf_completed_${selectedPdf.id}`);
        setCompletedSections([]);
        setProgress(0);
        Swal.fire('Reset!', 'Your progress has been reset.', 'success');
      }
    });
  };

  const getPdfIcon = (fileName) => {
    const name = fileName?.toLowerCase() || '';
    if (name.includes('ccna')) return '🌐';
    if (name.includes('ccnp')) return '🚀';
    if (name.includes('ccie')) return '🔐';
    if (name.includes('security')) return '🛡️';
    if (name.includes('linux')) return '🐧';
    if (name.includes('python')) return '🐍';
    return '📄';
  };

  const getGradient = (fileName) => {
    const name = fileName?.toLowerCase() || '';
    if (name.includes('ccna')) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (name.includes('ccnp')) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (name.includes('ccie')) return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (name.includes('security')) return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    if (name.includes('linux')) return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
    return 'linear-gradient(135deg, #5E5BFF 0%, #4a47d1 100%)';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const styles = {
    container: { minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Inter', system-ui, sans-serif" },
    header: { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', padding: isMobile ? '40px 20px' : '60px 40px', textAlign: 'center', position: 'relative' },
    backButton: { position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', padding: '8px 16px', borderRadius: '8px' },
    title: { fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '12px' },
    subtitle: { fontSize: isMobile ? '14px' : '16px', opacity: 0.8 },
    statsRow: { display: 'flex', justifyContent: 'center', gap: isMobile ? '20px' : '40px', marginTop: '30px', flexWrap: 'wrap' },
    statItem: { textAlign: 'center' },
    statNumber: { fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: '#5E5BFF' },
    statLabel: { fontSize: '12px', opacity: 0.7 },
    controls: { display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap', padding: '20px' },
    controlBtn: (active) => ({ padding: '10px 24px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', background: active ? '#5E5BFF' : '#e5e7eb', color: active ? 'white' : '#374151' }),
    searchBar: { position: 'relative', maxWidth: '500px', margin: '0 auto 30px' },
    searchInput: { width: '100%', padding: '12px 20px 12px 45px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', background: 'white' },
    searchIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' },
    pdfsGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px', padding: isMobile ? '20px' : '20px 40px', maxWidth: '1400px', margin: '0 auto' },
    pdfCard: { background: 'white', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    pdfHeader: (gradient) => ({ height: isMobile ? '140px' : '160px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }),
    pdfIcon: { fontSize: isMobile ? '56px' : '64px' },
    pdfBody: { padding: '20px' },
    pdfTitle: { fontSize: '18px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px', wordBreak: 'break-word' },
    pdfMeta: { display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', marginBottom: '16px', flexWrap: 'wrap' },
    viewBtn: { width: '100%', padding: '10px', background: '#5E5BFF', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '500', cursor: 'pointer' },
    emptyState: { textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '16px', maxWidth: '500px', margin: '40px auto' },
    emptyIcon: { fontSize: '64px', marginBottom: '16px' },
    emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' },
    emptyText: { color: '#6b7280', marginBottom: '24px' },
    loadingContainer: { textAlign: 'center', padding: '60px', color: '#5E5BFF' },
    spinner: { width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTopColor: '#5E5BFF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' },
    footer: { textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '12px' },
    courseDetailContainer: { maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '20px' : '40px' },
    backToCourses: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#5E5BFF', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', padding: '8px 16px', borderRadius: '8px' },
    courseHero: { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', padding: isMobile ? '30px' : '40px', borderRadius: '20px', marginBottom: '30px', textAlign: 'center' },
    courseHeroTitle: { fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: '15px', wordBreak: 'break-word' },
    courseHeroStats: { display: 'flex', justifyContent: 'center', gap: isMobile ? '20px' : '40px', margin: '20px 0', fontSize: isMobile ? '12px' : '14px', opacity: 0.9, flexWrap: 'wrap' },
    progressBarLarge: { background: 'rgba(255,255,255,0.2)', borderRadius: '10px', height: '8px', overflow: 'hidden', maxWidth: '400px', margin: '20px auto 0' },
    progressFillLarge: { background: '#5E5BFF', height: '100%', borderRadius: '10px' },
    progressTextLarge: { display: 'block', marginTop: '8px', fontSize: '12px', opacity: 0.8 },
    viewControls: { display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' },
    splitView: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: '30px' },
    tocPanel: { background: 'white', borderRadius: '16px', padding: '20px', position: isMobile ? 'relative' : 'sticky', top: '20px', height: isMobile ? 'auto' : 'calc(100vh - 100px)', overflowY: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    tocTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e', borderBottom: '2px solid #5E5BFF', paddingBottom: '10px' },
    tocList: { listStyle: 'none', padding: 0, margin: 0 },
    tocItem: (isActive, isCompleted) => ({
      padding: '12px 15px',
      cursor: 'pointer',
      borderRadius: '10px',
      fontSize: '14px',
      marginBottom: '6px',
      border: '1px solid transparent',
      background: isActive ? '#5E5BFF' : isCompleted ? '#f0fdf4' : 'transparent',
      color: isActive ? 'white' : isCompleted ? '#16a34a' : '#374151',
    }),
    sectionBadge: { fontSize: '11px', marginLeft: '8px', opacity: 0.7 },
    contentPanel: { background: 'white', borderRadius: '16px', padding: isMobile ? '20px' : '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxHeight: isMobile ? 'auto' : 'calc(100vh - 100px)', overflowY: 'auto' },
    currentSectionHeader: { marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #5E5BFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
    currentSectionTitle: { fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#5E5BFF' },
    sectionProgress: { fontSize: '13px', color: '#6b7280', background: '#f8f9fa', padding: '6px 12px', borderRadius: '20px' },
    paragraphText: { lineHeight: '1.8', marginBottom: '16px', color: '#374151', fontSize: '15px' },
    completeBtn: { background: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' },
    resetBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    galleryContainer: { background: 'white', borderRadius: '16px', padding: isMobile ? '20px' : '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    galleryTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' },
    imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
    imageCard: { border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' },
    image: { width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer', borderRadius: '8px' },
    imageInfo: { padding: '8px', fontSize: '12px', textAlign: 'center', background: '#f8f9fa', color: '#6b7280' },
    emptySection: { textAlign: 'center', padding: '40px', color: '#9ca3af' },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading courses...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Course Detail View (when a PDF is selected)
  if (selectedPdf) {
    if (contentLoading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading course content...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    const section = sections[activeSection];
    const isCompleted = completedSections.includes(activeSection);
    const sectionImages = getImagesForSection(activeSection);

    return (
      <div style={styles.container}>
        <div style={styles.courseDetailContainer}>
          <button style={styles.backToCourses} onClick={handleBack}>← Back to Courses</button>

          <div style={styles.courseHero}>
            <h1 style={styles.courseHeroTitle}>{selectedPdf.fileName?.replace('.pdf', '') || 'Course'}</h1>
            <div style={styles.courseHeroStats}>
              <span>📄 {selectedPdf.pageCount || sections.length} sections</span>
              <span>🖼️ {images.length} images</span>
              <span>💾 {formatFileSize(selectedPdf.fileSize)}</span>
            </div>
            <div style={styles.progressBarLarge}>
              <div style={{ ...styles.progressFillLarge, width: `${progress}%` }}></div>
            </div>
            <span style={styles.progressTextLarge}>{Math.round(progress)}% Complete</span>
          </div>

          <div style={styles.viewControls}>
            <button style={styles.controlBtn(activeView === 'split')} onClick={() => setActiveView('split')}>📚 Course View</button>
            <button style={styles.controlBtn(activeView === 'gallery')} onClick={() => setActiveView('gallery')}>🖼️ Image Gallery ({images.length} images)</button>
            <button style={styles.resetBtn} onClick={resetProgress}>⟳ Reset Progress</button>
          </div>

          {activeView === 'split' && (
            <div style={styles.splitView}>
              <div style={styles.tocPanel}>
                <h3 style={styles.tocTitle}>📑 Course Content</h3>
                <ul style={styles.tocList}>
                  {sections.map((sec, idx) => {
                    const isActive = activeSection === idx;
                    const isSecCompleted = completedSections.includes(idx);
                    return (
                      <li
                        key={idx}
                        style={styles.tocItem(isActive, isSecCompleted)}
                        onClick={() => setActiveSection(idx)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{sec.title}</span>
                          {isSecCompleted && <span style={styles.sectionBadge}>✓</span>}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                          {sec.content?.length || 0} paragraphs
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div style={styles.contentPanel}>
                {section ? (
                  <>
                    <div style={styles.currentSectionHeader}>
                      <h2 style={styles.currentSectionTitle}>{section.title}</h2>
                      {isCompleted && <span style={styles.sectionProgress}>✅ Completed</span>}
                    </div>

                    {/* Display images for this section - FIXED with local fallback */}
                    {sectionImages.map((img, imgIdx) => (
                      <div key={img.id} style={{ margin: '20px 0', textAlign: 'center' }}>
                        <img
                          src={getImageSrc(selectedPdf.id, img.id)}
                          alt={`Course diagram on page ${img.pageNumber}, figure ${imgIdx + 1}`}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                          }}
                          onError={() => handleImageError(img.id)}
                          onClick={() => window.open(getImageUrl(selectedPdf.id, img.id), '_blank')}
                        />
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                          Page {img.pageNumber} • {img.width}x{img.height}
                        </div>
                      </div>
                    ))}

                    {/* Display section content */}
                    <div>
                      {section.content?.map((para, idx) => (
                        <p key={idx} style={styles.paragraphText}>{para}</p>
                      ))}
                    </div>

                    <button
                      style={styles.completeBtn}
                      onClick={() => markSectionComplete(activeSection)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? '✓ Section Completed' : '✓ Mark Section Complete'}
                    </button>
                  </>
                ) : (
                  <div style={styles.emptySection}>Select a section to view its content</div>
                )}
              </div>
            </div>
          )}

          {activeView === 'gallery' && (
            <div style={styles.galleryContainer}>
              <h2 style={styles.galleryTitle}>📸 Course Images ({images.length} images)</h2>
              {images.length === 0 ? (
                <p>No images available for this course</p>
              ) : (
                <div style={styles.imageGrid}>
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      style={styles.imageCard}
                      onClick={() => window.open(getImageUrl(selectedPdf.id, img.id), '_blank')}
                    >
                      <img
                        src={getImageSrc(selectedPdf.id, img.id)}
                        alt={`Course diagram on page ${img.pageNumber}, figure ${idx + 1}`}
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
        </div>
      </div>
    );
  }

  // Filter PDFs
  const filteredPdfs = pdfs.filter(pdf => {
    return pdf.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = {
    total: pdfs.length,
  };

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/')}>← Back to Home</button>
        <h1 style={styles.title}>My Courses</h1>
        <p style={styles.subtitle}>View and learn from uploaded PDF courses</p>
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{stats.total}</div>
            <div style={styles.statLabel}>Total Courses</div>
          </div>
        </div>
      </div>

      <div style={styles.controls}>
        <button style={styles.controlBtn(activeTab === 'all')} onClick={() => setActiveTab('all')}>📚 All Courses</button>
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

      {filteredPdfs.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📚</div>
          <h3 style={styles.emptyTitle}>No courses available</h3>
          <p style={styles.emptyText}>No PDFs have been uploaded yet. Check back later!</p>
        </div>
      ) : (
        <div style={styles.pdfsGrid}>
          {filteredPdfs.map((pdf) => (
            <div key={pdf.id} style={styles.pdfCard} onClick={() => handlePdfClick(pdf)}>
              <div style={styles.pdfHeader(getGradient(pdf.fileName))}>
                <span style={styles.pdfIcon}>{getPdfIcon(pdf.fileName)}</span>
              </div>
              <div style={styles.pdfBody}>
                <h3 style={styles.pdfTitle}>{pdf.fileName?.replace('.pdf', '') || 'Untitled'}</h3>
                <div style={styles.pdfMeta}>
                  <span>📄 {pdf.pageCount || 0} pages</span>
                  <span>🖼️ {pdf.imageCount || 0} images</span>
                  <span>💾 {formatFileSize(pdf.fileSize)}</span>
                </div>
                <button
                  style={styles.viewBtn}
                  onClick={(e) => { e.stopPropagation(); handlePdfClick(pdf); }}
                >
                  📖 View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        <p>Click on any course to start learning</p>
        <p>✓ Track your progress as you complete sections</p>
      </div>
    </div>
  );
}

export default MyCoursesPage;