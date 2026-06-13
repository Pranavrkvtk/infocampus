// src/components/PdfUpload.jsx
import React, { useState, useRef } from 'react';
import { uploadPdf, generateCourseStructure } from '../api/courseApi';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

// API helpers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const api = {
  upload: (url, formData) => fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: formData,
  }).then(async r => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }),
};

const clr = {
  border: '#e4e7ec',
  accent: '#4f46e5',
  accentLight: '#eef2ff',
  text: '#0f172a',
  muted: '#64748b',
  faint: '#f1f5f9',
  success: '#16a34a',
  successLight: '#f0fdf4',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
};

const SectionHead = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', borderBottom: `1px solid ${clr.border}` }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span style={{ fontSize: 14, fontWeight: 700, color: clr.text }}>{title}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PDF UPLOAD PANEL - WORKING VERSION
// // ═══════════════════════════════════════════════════════════════════════════════
// function PdfUploadPanel({ courseId, onStructureGenerated, toast }) {
//   const [file, setFile] = useState(null);
//   const [dragging, setDragging] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const inputRef = useRef();

//   const handleFile = f => {
//     if (f?.type === 'application/pdf') setFile(f);
//     else toast.show('Only PDF files allowed', 'error');
//   };

//   const handleUpload = async () => {
//     if (!file) return;
//     setUploading(true);
//     setProgress(0);
//     const iv = setInterval(() => setProgress(p => Math.min(p + 8, 88)), 400);
//     try {
//       const fd = new FormData();
//       fd.append('file', file);
//       fd.append('courseId', courseId);
      
//       console.log(`[PdfUploadPanel] Uploading PDF for courseId: ${courseId}`);
      
//       const response = await fetch(`${API_BASE}/admin/pdfs/upload`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//         body: fd,
//       });
      
//       const data = await response.json();
//       console.log('[PdfUploadPanel] Upload response:', data);
//       clearInterval(iv);
//       setProgress(100);
      
//       if (response.ok && data.id) {
//         toast.show(`✓ PDF "${file.name}" uploaded successfully! Extracted ${data.pageCount || 0} pages, ${data.imageCount || 0} images.`, 'success');
        
//         // Give backend time to process and save to database
//         await new Promise(resolve => setTimeout(resolve, 2000));
        
//         // Reload topics to show generated structure (reset to first page)
//         console.log('[PdfUploadPanel] Reloading topics for course:', courseId);
//         onStructureGenerated(courseId);
//         setFile(null);
//       } else {
//         throw new Error(data.error || data.message || 'Upload failed');
//       }
      
//     } catch (e) {
//       clearInterval(iv);
//       setProgress(0);
//       console.error('[PdfUploadPanel] Upload error:', e);
//       toast.show(e.message, 'error');
//     } finally {
//       setUploading(false);
//       setTimeout(() => setProgress(0), 1200);
//     }
//   };

//   return (
//     <Card>
//       <SectionHead icon="📄" title="Upload PDF — auto-extract course structure" />
//       <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
//         <div
//           style={{ 
//             border: `2px dashed ${dragging ? clr.accent : file ? clr.success : clr.border}`, 
//             borderRadius: 12, 
//             padding: '20px 16px', 
//             textAlign: 'center', 
//             background: dragging ? clr.accentLight : file ? clr.successLight : clr.faint, 
//             cursor: 'pointer', 
//             transition: 'all 0.2s' 
//           }}
//           onClick={() => inputRef.current.click()}
//           onDragOver={e => { e.preventDefault(); setDragging(true); }}
//           onDragLeave={() => setDragging(false)}
//           onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
//         >
//           <div style={{ fontSize: 32, marginBottom: 6 }}>{file ? '✅' : '📄'}</div>
//           <div style={{ fontSize: 13, fontWeight: 600, color: file ? clr.success : clr.text }}>
//             {file ? file.name : 'Drop PDF here or click to browse'}
//           </div>
//           <div style={{ fontSize: 11, color: clr.muted, marginTop: 3 }}>
//             PDF will be processed and course structure auto-generated
//           </div>
//           <input 
//             ref={inputRef} 
//             type="file" 
//             accept=".pdf" 
//             style={{ display: 'none' }} 
//             onChange={e => handleFile(e.target.files[0])} 
//           />
//         </div>

//         {uploading && (
//           <div>
//             <div style={{ height: 4, borderRadius: 99, background: clr.border, overflow: 'hidden' }}>
//               <div style={{ 
//                 height: '100%', 
//                 width: `${progress}%`, 
//                 background: `linear-gradient(90deg, ${clr.accent}, #818cf8)`, 
//                 transition: 'width 0.3s', 
//                 borderRadius: 99 
//               }} />
//             </div>
//             <div style={{ fontSize: 11, textAlign: 'right', marginTop: 4, color: clr.muted }}>
//               {progress}% - Processing PDF...
//             </div>
//           </div>
//         )}

//         <Btn 
//           onClick={handleUpload} 
//           disabled={!file || uploading} 
//           variant="primary" 
//           style={{ justifyContent: 'center' }}
//         >
//           {uploading ? '⏳ Uploading & Processing...' : '📤 Upload PDF'}
//         </Btn>
        
//         {!file && !uploading && (
//           <div style={{ fontSize: 11, color: clr.muted, textAlign: 'center', padding: '8px' }}>
//             Supports PDF files only. Max size: 10MB
//           </div>
//         )}
//       </div>
//     </Card>
//   );
// }

const Btn = ({ children, onClick, disabled, variant = 'primary', style: extra }) => {
  const variants = {
    primary: { background: clr.accent, color: '#fff' },
    success: { background: clr.success, color: '#fff' },
    danger: { background: clr.danger, color: '#fff' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        fontFamily: 'inherit',
        opacity: disabled ? 0.5 : 1,
        flex: 1,
        padding: '8px 16px',
        fontSize: 13,
        ...variants[variant],
        ...extra,
      }}
    >
      {children}
    </button>
  );
};

const Card = ({ children }) => (
  <div style={{ background: '#ffffff', borderRadius: 12, border: `1px solid ${clr.border}` }}>
    {children}
  </div>
);

function PdfUploadPanel({ courseId, onStructureGenerated, toast }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfId, setPdfId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const inputRef = useRef();

  const handleFile = f => {
    if (f?.type === 'application/pdf') {
      setFile(f);
      setPdfId(null); // Reset pdfId when new file is selected
    } else {
      toast.show('Only PDF files allowed', 'error');
    }
  };


  const handleGenerate = async () => {
    if (!pdfId) {
      toast.show('No PDF ID available. Please upload a PDF first.', 'error');
      return;
    }
    
    setGenerating(true);
    
    try {
      console.log(`[PdfUploadPanel] Generating structure for PDF #${pdfId}`);
      const data = await generateCourseStructure(pdfId);
      console.log('[PdfUploadPanel] Generate response:', data);
      
      // Check for success in response
      if (data && (data.success === true || data.topicsCount !== undefined || data.message === "Structure generated successfully")) {
        const topicCount = data.topicsCount || 0;
        const subtopicCount = data.subtopicsCount || 0;
        
        toast.show(`✓ Structure generated — ${topicCount} topics, ${subtopicCount} subtopics`, 'success');
        
        // Small delay to ensure backend has finished processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get the course ID from response or use the provided courseId
        const targetCourseId = data.courseId || courseId;
        
        if (targetCourseId && onStructureGenerated) {
          console.log('[PdfUploadPanel] Triggering reload for courseId:', targetCourseId);
          onStructureGenerated(targetCourseId);
        } else {
          console.warn('[PdfUploadPanel] No courseId available for reload');
          toast.show('Structure generated but unable to reload content', 'warning');
        }
      } else {
        throw new Error(data?.error || 'Generation failed - invalid response');
      }
    } catch (e) {
      console.error('[PdfUploadPanel] Generation error:', e);
      toast.show(e.message || 'Failed to generate structure', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <SectionHead icon="📄" title="Upload PDF — auto-extract structure" />
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Drop Zone */}
        <div
          style={{
            border: `2px dashed ${dragging ? clr.accent : file ? clr.success : clr.border}`,
            borderRadius: 12,
            padding: '20px 16px',
            textAlign: 'center',
            background: dragging ? clr.accentLight : file ? clr.successLight : clr.faint,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => inputRef.current.click()}
          onDragOver={e => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 6 }}>{file ? '✅' : '📄'}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: file ? clr.success : clr.text }}>
            {file ? file.name : 'Drop PDF here or click to browse'}
          </div>
          <div style={{ fontSize: 11, color: clr.muted, marginTop: 3 }}>
            Extracts text, images and auto-creates topics
          </div>
          <input 
            ref={inputRef} 
            type="file" 
            accept=".pdf" 
            style={{ display: 'none' }} 
            onChange={e => handleFile(e.target.files[0])} 
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div>
            <div style={{ height: 4, borderRadius: 99, background: clr.border, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${clr.accent}, #818cf8)`,
                  transition: 'width 0.3s',
                  borderRadius: 99,
                }}
              />
            </div>
            <div style={{ fontSize: 11, textAlign: 'right', marginTop: 4, color: clr.muted }}>
              {progress}%
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn 
            onClick={handleUpload} 
            disabled={!file || uploading} 
            variant="primary"
          >
            {uploading ? '⏳ Uploading…' : '📤 Upload PDF'}
          </Btn>
          
          {pdfId && (
            <Btn 
              onClick={handleGenerate} 
              disabled={generating} 
              variant="success"
            >
              {generating ? '⏳ Generating…' : '🏗 Generate Structure'}
            </Btn>
          )}
        </div>

        {/* Status Messages */}
        {pdfId && (
          <div style={{ 
            fontSize: 12, 
            color: clr.success, 
            background: clr.successLight, 
            padding: '8px 12px', 
            borderRadius: 8, 
            border: `1px solid #bbf7d0` 
          }}>
            ✓ PDF #{pdfId} ready — click "Generate Structure" to create topics from the PDF content
          </div>
        )}
        
        {!pdfId && file && !uploading && (
          <div style={{ 
            fontSize: 12, 
            color: clr.accent, 
            background: clr.accentLight, 
            padding: '8px 12px', 
            borderRadius: 8, 
            border: `1px solid ${clr.accent}` 
          }}>
            📄 File selected: {file.name} — click "Upload PDF" to proceed
          </div>
        )}
      </div>
    </Card>
  );
}

export default PdfUploadPanel;  