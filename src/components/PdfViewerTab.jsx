// src/components/PdfViewerTab.jsx
import React, { useState, useEffect } from 'react';
import { getAllPdfs, getPdfText, getPdfImages, formatFileSize, formatDate } from '../api/pdfApi';
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
};

const PdfViewerTab = ({ onViewCourse }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [extractedText, setExtractedText] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    setLoading(true);
    console.log("=== FETCHING PDFS ===");
    console.log("Token exists:", !!localStorage.getItem('token'));
    console.log("Token:", localStorage.getItem('token')?.substring(0, 50) + "...");
    
    try {
      const response = await getAllPdfs();
      console.log("Response status:", response.status);
      console.log("PDFs found:", response.data?.length || 0);
      setPdfs(response.data || []);
    } catch (error) {
      console.error("=== ERROR FETCHING PDFS ===");
      console.error("Error message:", error.message);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Full error:", error);
      
      if (error.message === "Network Error") {
        Swal.fire({
          title: "Connection Error",
          text: "Cannot connect to backend server. Make sure it's running on port 8080",
          icon: "error"
        });
      } else if (error.response?.status === 403) {
        Swal.fire({
          title: "Access Denied",
          text: "Please login again",
          icon: "error"
        }).then(() => {
          localStorage.clear();
          window.location.href = "/login";
        });
      } else if (error.response?.status === 401) {
        Swal.fire({
          title: "Session Expired",
          text: "Please login again",
          icon: "error"
        }).then(() => {
          localStorage.clear();
          window.location.href = "/login";
        });
      } else {
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to load PDFs",
          icon: "error"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = async (pdf) => {
    setSelectedPdf(pdf);
    setActiveTab('details');
    setLoading(true);
    
    try {
      const textResponse = await getPdfText(pdf.id);
      setExtractedText(textResponse.data.text || 'No text extracted');
      
      const imagesResponse = await getPdfImages(pdf.id);
      setImages(imagesResponse.data.images || []);
    } catch (error) {
      console.error("Error fetching PDF details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAsCourse = (pdf) => {
    if (onViewCourse) {
      onViewCourse(pdf);
    } else {
      // Fallback: show alert if callback not provided
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
  };

  const getImageUrl = (pdfId, imageId) => {
    return `http://localhost:8080/api/admin/pdfs/${pdfId}/images/${imageId}`;
  };

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
                <p><strong>File Size:</strong> {formatFileSize(selectedPdf.fileSize)}</p>
                <p><strong>Uploaded:</strong> {formatDate(selectedPdf.uploadedAt)}</p>
                <p><strong>Status:</strong> {selectedPdf.isProcessed ? '✅ Processed' : '⏳ Processing'}</p>
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
                    <div key={image.id} style={styles.imageCard}>
                      <img 
                        src={getImageUrl(selectedPdf.id, image.id)} 
                        alt={`Page ${image.pageNumber}, Image ${index + 1}`}
                        style={styles.image}
                        onError={(e) => {
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
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewerTab;