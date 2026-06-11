// src/components/PdfViewerTab.jsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { getAllPdfs, getPdfText, getPdfImages, getOrderedPdfContent, formatFileSize, formatDate, getAllPdfsEnriched } from '../api/pdfApi';
import Swal from 'sweetalert2';

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  pdfGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  pdfCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  pdfIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  pdfName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pdfMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '12px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    background: '#5E5BFF',
    color: '#fff',
  },
  buttonSecondary: {
    background: '#e5e7eb',
    color: '#374151',
  },
  buttonCourse: {
    background: '#f59e0b',
    color: '#fff',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '80vh',
    overflow: 'auto',
    padding: '24px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
  },
  tabButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tabButton: (active) => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    background: active ? '#5E5BFF' : '#e5e7eb',
    color: active ? '#fff' : '#374151',
    fontWeight: '500',
    transition: 'all 0.2s',
  }),
  textContainer: {
    background: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    maxHeight: '400px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  imageCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  image: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
  },
  imageInfo: {
    padding: '6px',
    fontSize: '10px',
    color: '#6b7280',
    textAlign: 'center',
  },
  orderedContentContainer: {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '12px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  orderedPageNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '12px',
    background: '#f0f0ff',
    borderRadius: '8px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  navButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  },
  heading: {
    marginTop: '20px',
    marginBottom: '10px',
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  paragraph: {
    marginBottom: '12px',
    lineHeight: '1.7',
    color: '#374151',
  },
  imageWrapper: {
    margin: '24px auto',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  imageDisplay: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  imageCaption: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
  },
  loadingSpinner: {
    textAlign: 'center',
    padding: '40px',
    color: '#5E5BFF',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#9ca3af',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    marginLeft: '8px',
  },
  badgeText: {
    background: '#e0e7ff',
    color: '#4338ca',
  },
  badgeImage: {
    background: '#fef3c7',
    color: '#d97706',
  },
};

const PdfViewerTab = ({ onViewCourse }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [extractedText, setExtractedText] = useState('');
  const [images, setImages] = useState([]);
  const [orderedContent, setOrderedContent] = useState([]);
  const [pages, setPages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState({});

  const getBaseUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

  const getImageUrl = (pdfId, imageId) => {
    return `${getBaseUrl()}/user/pdfs/${pdfId}/images/${imageId}`;
  };

  const handleImageError = (imageId) => {
    if (!imageErrors[imageId]) {
      setImageErrors(prev => ({ ...prev, [imageId]: true }));
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      // Try enriched endpoint first (if available)
      let response;
      try {
        const enrichedModule = await import('../api/pdfApi');
        if (enrichedModule.getAllPdfsEnriched) {
          response = await enrichedModule.getAllPdfsEnriched();
          console.log("Enriched PDFs response:", response.data);
        } else {
          throw new Error('getAllPdfsEnriched not available');
        }
      } catch (err) {
        console.log("Enriched endpoint not available, using regular endpoint");
        response = await getAllPdfs();
      }
      
      const pdfList = (response.data || []).map(pdf => ({
        id: pdf.id,
        name: pdf.fileName,
        fileName: pdf.fileName,
        type: "Course",
        pages: pdf.pageCount || 0,
        images: pdf.imageCount || 0,
        status: pdf.isProcessed ? "Completed" : "Processing",
        date: pdf.uploadedAt,
        fileSize: pdf.fileSize,
        pageCount: pdf.pageCount,
        imageCount: pdf.imageCount,
        isProcessed: pdf.isProcessed,
        uploadedAt: pdf.uploadedAt,
        courseId: pdf.courseId || pdf.course?.id || null,
        courseTitle: pdf.courseTitle || pdf.course?.title || "Not assigned",
        course: pdf.course || (pdf.courseId ? { id: pdf.courseId, title: pdf.courseTitle } : null),
      }));
      
      console.log("Processed PDFs with course mapping:", pdfList);
      setPdfs(pdfList);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      Swal.fire("Error", "Failed to load PDFs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = async (pdf) => {
    console.log("PDF object received:", pdf);
    
    // Make sure we preserve the course info
    const pdfWithCourse = {
      ...pdf,
      courseId: pdf.courseId || pdf.course?.id || null,
      courseTitle: pdf.courseTitle || pdf.course?.title || null,
      course: pdf.course || null
    };
    
    setSelectedPdf(pdfWithCourse);
    setActiveTab('details');
    setLoading(true);
    
    try {
      const textResponse = await getPdfText(pdf.id);
      setExtractedText(textResponse.data.text || 'No text extracted');
      
      const imagesResponse = await getPdfImages(pdf.id);
      setImages(imagesResponse.data.images || []);
      
      // Fetch ordered content
      const orderedResponse = await getOrderedPdfContent(pdf.id);
      const orderedContentData = orderedResponse.data.content || orderedResponse.data.orderedContent || [];
      setOrderedContent(orderedContentData);
      
      // Group by page
      const groupedByPage = {};
      orderedContentData.forEach(item => {
        const pageNum = item.pageNumber || 1;
        if (!groupedByPage[pageNum]) {
          groupedByPage[pageNum] = [];
        }
        groupedByPage[pageNum].push(item);
      });
      setPages(groupedByPage);
      setCurrentPage(1);
      
    } catch (error) {
      console.error("Error fetching PDF details:", error);
      Swal.fire("Error", "Failed to load PDF details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAsCourse = (pdf) => {
    if (onViewCourse) {
      onViewCourse(pdf);
    } else {
      Swal.fire({
        title: "Course View",
        text: `Opening "${pdf.fileName}" as a course...`,
        icon: "info",
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const closeModal = () => {
    setSelectedPdf(null);
    setExtractedText('');
    setImages([]);
    setOrderedContent([]);
    setPages({});
    setCurrentPage(1);
    setImageErrors({});
  };

  const renderOrderedContentItem = (item, index) => {
    if (item.type === 'TEXT') {
      const isHeading = item.fontSize > 16 || (item.content && item.content.length < 50 && !item.content.endsWith('.'));
      
      if (isHeading) {
        return (
          <h3 key={index} style={{ ...styles.heading, fontSize: `${Math.min(item.fontSize || 18, 28)}px` }}>
            {item.content}
          </h3>
        );
      } else {
        return (
          <p key={index} style={{ ...styles.paragraph, fontSize: `${item.fontSize || 14}px` }}>
            {item.content}
          </p>
        );
      }
    } else if (item.type === 'IMAGE') {
      return (
        <div key={index} style={styles.imageWrapper}>
          <img 
            src={getImageUrl(selectedPdf.id, item.imageId)} 
            alt={`Content illustration`}
            style={styles.imageDisplay}
            onClick={() => window.open(getImageUrl(selectedPdf.id, item.imageId), '_blank')}
            onError={() => handleImageError(item.imageId)}
          />
          {item.width && item.height && (
            <div style={styles.imageCaption}>
              {item.width} x {item.height} pixels
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderOrderedPage = () => {
    const pageContent = pages[currentPage];
    if (!pageContent) {
      return <div style={styles.emptyState}>No content on this page</div>;
    }
    
    return (
      <div style={styles.orderedContentContainer}>
        {pageContent.map((item, idx) => renderOrderedContentItem(item, idx))}
      </div>
    );
  };

  const totalPages = Object.keys(pages).length;

  if (loading && pdfs.length === 0) {
    return <div style={styles.loadingSpinner}>Loading PDFs...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>PDF Library</h1>
        <p style={styles.subtitle}>View all uploaded PDFs, extracted text, and images. Click "View as Course" to convert any PDF into an interactive learning experience.</p>
      </div>

      {pdfs.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p>No PDFs uploaded yet</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Upload your first PDF to get started</p>
        </div>
      ) : (
        <div style={styles.pdfGrid}>
          {pdfs.map((pdf) => (
            <div key={pdf.id} style={styles.pdfCard}>
              <div style={styles.pdfIcon}>📄</div>
              <div style={styles.pdfName} title={pdf.fileName}>
                {pdf.fileName}
              </div>
              <div style={styles.pdfMeta}>
                <span>{pdf.pageCount || 0} pages</span>
                <span>{pdf.imageCount || 0} images</span>
                <span>{formatFileSize(pdf.fileSize)}</span>
              </div>
              {pdf.courseTitle && pdf.courseTitle !== "Not assigned" && (
                <div style={{ fontSize: '11px', color: '#16a34a', marginBottom: '8px' }}>
                  🎓 Course: {pdf.courseTitle}
                </div>
              )}
              <div style={styles.buttonGroup}>
                <button 
                  style={{...styles.button, ...styles.buttonPrimary}}
                  onClick={() => handleViewPdf(pdf)}
                >
                  View Details
                </button>
                <button 
                  style={{...styles.button, ...styles.buttonCourse}}
                  onClick={() => handleViewAsCourse(pdf)}
                >
                  📖 View as Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for PDF Details */}
      {selectedPdf && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>{selectedPdf.fileName}</h3>
              <button style={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            
            <div style={styles.tabButtons}>
              <button style={styles.tabButton(activeTab === 'details')} onClick={() => setActiveTab('details')}>
                Details
              </button>
              <button style={styles.tabButton(activeTab === 'text')} onClick={() => setActiveTab('text')}>
                Text ({extractedText?.length || 0} chars)
              </button>
              <button style={styles.tabButton(activeTab === 'images')} onClick={() => setActiveTab('images')}>
                Images ({images.length})
              </button>
              <button style={styles.tabButton(activeTab === 'ordered')} onClick={() => setActiveTab('ordered')}>
                📖 Read in Order ({orderedContent.length} items)
              </button>
              <button 
                style={{...styles.tabButton(false), background: '#f59e0b', color: '#fff'}}
                onClick={() => {
                  closeModal();
                  handleViewAsCourse(selectedPdf);
                }}
              >
                📖 View as Course
              </button>
            </div>

            {activeTab === 'details' && (
              <div>
                <p><strong>File Name:</strong> {selectedPdf.fileName}</p>
                <p><strong>Pages:</strong> {selectedPdf.pageCount || 0}</p>
                <p><strong>Images Extracted:</strong> {selectedPdf.imageCount || 0}</p>
                <p><strong>Ordered Items:</strong> {orderedContent.length} (text + images in correct order)</p>
                <p><strong>Text Blocks:</strong> {orderedContent.filter(i => i.type === 'TEXT').length}</p>
                <p><strong>Images in Order:</strong> {orderedContent.filter(i => i.type === 'IMAGE').length}</p>
                <p><strong>File Size:</strong> {formatFileSize(selectedPdf.fileSize)}</p>
                <p><strong>Uploaded:</strong> {formatDate(selectedPdf.uploadedAt)}</p>
                <p><strong>Status:</strong> {selectedPdf.isProcessed ? '✅ Processed' : '⏳ Processing'}</p>
                {selectedPdf.courseTitle && selectedPdf.courseTitle !== "Not assigned" && (
                  <p><strong>Course:</strong> 🎓 {selectedPdf.courseTitle}</p>
                )}
                <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '13px' }}>
                  ✓ Content is displayed in correct reading order (top to bottom of each page)
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div style={styles.textContainer}>
                {extractedText || 'No text extracted from this PDF'}
              </div>
            )}

            {activeTab === 'images' && (
              <div style={styles.imageGrid}>
                {images.length === 0 ? (
                  <div style={styles.emptyState}>No images extracted from this PDF</div>
                ) : (
                  images.map((image, index) => (
                    <div 
                      key={image.id} 
                      style={styles.imageCard}
                      onClick={() => window.open(getImageUrl(selectedPdf.id, image.id), '_blank')}
                    >
                      <img 
                        src={getImageUrl(selectedPdf.id, image.id)} 
                        alt={`Page ${image.pageNumber}, figure ${index + 1}`}
                        style={styles.image}
                        onError={(e) => {
                          console.error('Failed to load image:', e.target.src);
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150x120?text=Image+Not+Found';
                        }}
                      />
                      <div style={styles.imageInfo}>
                        Page {image.pageNumber} • {image.width}x{image.height}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'ordered' && (
              <div>
                {totalPages > 1 && (
                  <div style={styles.orderedPageNav}>
                    <button
                      style={{...styles.navButton, background: currentPage === 1 ? '#e5e7eb' : '#5E5BFF', color: currentPage === 1 ? '#9ca3af' : 'white'}}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ← Previous Page
                    </button>
                    <span style={{ fontWeight: '500' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      style={{...styles.navButton, background: currentPage === totalPages ? '#e5e7eb' : '#5E5BFF', color: currentPage === totalPages ? '#9ca3af' : 'white'}}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next Page →
                    </button>
                  </div>
                )}
                {renderOrderedPage()}
                <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280', textAlign: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
                  ✓ Content displayed in correct reading order (top to bottom of each page)
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewerTab;