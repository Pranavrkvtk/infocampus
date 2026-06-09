// src/components/ExactPdfViewer.jsx
import React, { useState, useEffect } from 'react';
import { getPdfText, getPdfImages, formatFileSize } from '../api/pdfApi';

const ExactPdfViewer = ({ pdf }) => {
  const [loading, setLoading] = useState(true);
  const [textContent, setTextContent] = useState('');
  const [imagesByPage, setImagesByPage] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(pdf.pageCount || 0);

  useEffect(() => {
    loadContent();
  }, [pdf]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const textResponse = await getPdfText(pdf.id);
      setTextContent(textResponse.data.text || '');
      
      const imagesResponse = await getPdfImages(pdf.id);
      const images = imagesResponse.data.images || [];
      
      // Group images by page
      const grouped = {};
      images.forEach(img => {
        if (!grouped[img.pageNumber]) {
          grouped[img.pageNumber] = [];
        }
        grouped[img.pageNumber].push(img);
      });
      setImagesByPage(grouped);
    } catch (error) {
      console.error("Error loading PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageId) => {
    return `http://localhost:8080/api/admin/pdfs/${pdf.id}/images/${imageId}`;
  };

  // Parse text into lines with approximate page breaks
  const getTextForPage = (pageNum) => {
    const lines = textContent.split('\n');
    const linesPerPage = Math.ceil(lines.length / totalPages);
    const start = (pageNum - 1) * linesPerPage;
    const end = start + linesPerPage;
    return lines.slice(start, end);
  };

  // Render a page with images at exact positions
  const renderPage = (pageNum) => {
    const pageImages = imagesByPage[pageNum] || [];
    const textLines = getTextForPage(pageNum);
    
    return (
      <div 
        key={pageNum}
        style={{
          position: 'relative',
          minHeight: '900px',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          marginBottom: '30px',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Page number header */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '20px',
          fontSize: '12px',
          color: '#9ca3af',
          zIndex: 20,
          background: 'rgba(255,255,255,0.9)',
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          Page {pageNum}
        </div>
        
        {/* Images at exact positions */}
        {pageImages.map(img => {
          // Calculate percentage positions for responsive layout
          const leftPercent = img.xPosition && img.pageWidth ? (img.xPosition / img.pageWidth) * 100 : 50;
          const topPercent = img.yPosition && img.pageHeight ? (img.yPosition / img.pageHeight) * 100 : 50;
          const widthPercent = img.imageWidth && img.pageWidth ? (img.imageWidth / img.pageWidth) * 100 : 30;
          
          return (
            <div
              key={img.id}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                cursor: 'pointer'
              }}
            >
              <img 
                src={getImageUrl(img.id)} 
                alt={`Image on page ${pageNum}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
                onClick={() => window.open(getImageUrl(img.id), '_blank')}
              />
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                {img.width}x{img.height}
              </div>
            </div>
          );
        })}
        
        {/* Text content */}
        <div style={{
          padding: '60px 30px 30px 30px',
          position: 'relative',
          zIndex: 1,
          lineHeight: '1.6'
        }}>
          {textLines.map((line, idx) => (
            <p key={idx} style={{ marginBottom: '10px' }}>{line}</p>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#5E5BFF' }}>Loading PDF content...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        color: 'white',
        padding: '30px',
        borderRadius: '16px',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>{pdf.fileName.replace('.pdf', '')}</h1>
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px', opacity: 0.9 }}>
          <span>📄 {totalPages} pages</span>
          <span>🖼️ {Object.values(imagesByPage).flat().length} images</span>
          <span>💾 {formatFileSize(pdf.fileSize)}</span>
        </div>
      </div>

      {/* Page navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '24px',
        position: 'sticky',
        top: '10px',
        zIndex: 100,
        background: 'white',
        padding: '10px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '8px 20px',
            background: currentPage === 1 ? '#e5e7eb' : '#5E5BFF',
            color: currentPage === 1 ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Previous
        </button>
        <span style={{ padding: '8px 20px', background: '#f8f9fa', borderRadius: '8px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 20px',
            background: currentPage === totalPages ? '#e5e7eb' : '#5E5BFF',
            color: currentPage === totalPages ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Next →
        </button>
      </div>

      {/* Current page */}
      {renderPage(currentPage)}

      {/* Progress indicator */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          📖 Page {currentPage} of {totalPages} • {Math.round((currentPage / totalPages) * 100)}% complete
        </div>
      </div>
    </div>
  );
};

export default ExactPdfViewer;