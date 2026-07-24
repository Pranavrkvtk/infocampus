// src/components/PdfViewerComponent.jsx
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function PdfViewerComponent({ pdfUrl, config }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  }

  if (!pdfUrl) {
    return <div style={{ padding: '20px', color: '#4a5568', textAlign: 'center' }}>No PDF available</div>;
  }

  return (
    <div className="lesson-page-wrapper">
      <div className="lesson-paper" style={{
        padding: isMobile ? '16px' : '32px 48px 60px 48px',
        background: '#ffffff',
        minHeight: '100%',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div className="pdf-container" style={{
          width: '100%',
          background: '#ffffff',
          overflow: 'auto',
          minHeight: isMobile ? '400px' : '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
        }}>
          {loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid #e5e7eb', 
                borderTopColor: '#714b67', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite', 
                margin: '0 auto 16px' 
              }} />
              <p>Loading PDF...</p>
            </div>
          )}

          {error && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
              <p>{error}</p>
            </div>
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={null}
          >
            <Page
              pageNumber={pageNumber}
              width={isMobile ? window.innerWidth - 60 : 900}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>

          {numPages && numPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              background: '#f8fafc',
              borderRadius: '8px',
              marginTop: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
            }}>
              <button
                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                disabled={pageNumber <= 1}
                style={{
                  padding: '6px 16px',
                  background: pageNumber <= 1 ? '#e5e7eb' : '#714b67',
                  color: pageNumber <= 1 ? '#9ca3af' : '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 500 }}>
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                disabled={pageNumber >= numPages}
                style={{
                  padding: '6px 16px',
                  background: pageNumber >= numPages ? '#e5e7eb' : '#714b67',
                  color: pageNumber >= numPages ? '#9ca3af' : '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
        <style>{`
          .pdf-container .react-pdf__Document {
            background: #ffffff !important;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .pdf-container .react-pdf__Page {
            background: #ffffff !important;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06) !important;
            margin: 0 auto 24px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 4px !important;
          }
          .pdf-container .react-pdf__Page canvas {
            display: block;
            margin: auto;
            max-width: 100%;
            height: auto !important;
          }
          .pdf-container .react-pdf__Page .textLayer {
            background: transparent !important;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default PdfViewerComponent;