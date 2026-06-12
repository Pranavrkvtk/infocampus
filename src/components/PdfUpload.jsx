// src/components/PdfUpload.jsx
import React, { useState, useRef } from 'react';
import { uploadPdf, generateCourseStructure } from '../api/courseApi';

const clr = {
  border: '#e4e7ec',
  accent: '#4f46e5',
  accentLight: '#eef2ff',
  text: '#0f172a',
  muted: '#64748b',
  faint: '#f1f5f9',
  success: '#16a34a',
  successLight: '#f0fdf4',
};

const SectionHead = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', borderBottom: `1px solid ${clr.border}` }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span style={{ fontSize: 14, fontWeight: 700, color: clr.text }}>{title}</span>
  </div>
);

const Btn = ({ children, onClick, disabled, variant = 'primary', style: extra }) => {
  const variants = {
    primary: { background: clr.accent, color: '#fff' },
    success: { background: clr.success, color: '#fff' },
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
    if (f?.type === 'application/pdf') setFile(f);
    else toast.show('Only PDF files allowed', 'error');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const iv = setInterval(() => setProgress(p => Math.min(p + 8, 88)), 400);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (courseId) fd.append('courseId', courseId);
      const data = await uploadPdf(fd);
      clearInterval(iv);
      setProgress(100);
      if (data.pdfId) {
        setPdfId(data.pdfId);
        toast.show(`PDF uploaded — ${data.imageCount || 0} images extracted`);
        setFile(null);
      } else throw new Error(data.error || 'Upload failed');
    } catch (e) {
      clearInterval(iv);
      setProgress(0);
      toast.show(e.message, 'error');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const handleGenerate = async () => {
    if (!pdfId) return;
    setGenerating(true);
    try {
      const data = await generateCourseStructure(pdfId);
      if (data.success) {
        toast.show(`Structure generated — ${data.topicsCount} topics, ${data.subtopicsCount} subtopics`);
        onStructureGenerated(data.courseId);
      } else throw new Error(data.error || 'Generation failed');
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <SectionHead icon="📄" title="Upload PDF — auto-extract structure" />
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
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
          <div style={{ fontSize: 11, color: clr.muted, marginTop: 3 }}>Extracts text, images and auto-creates topics</div>
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>

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
            <div style={{ fontSize: 11, textAlign: 'right', marginTop: 4, color: clr.muted }}>{progress}%</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={handleUpload} disabled={!file || uploading} variant="primary">
            {uploading ? '⏳ Uploading…' : '📤 Upload PDF'}
          </Btn>
          {pdfId && (
            <Btn onClick={handleGenerate} disabled={generating} variant="success">
              {generating ? '⏳ Generating…' : '🏗 Generate'}
            </Btn>
          )}
        </div>
        {pdfId && (
          <div style={{ fontSize: 12, color: clr.success, background: clr.successLight, padding: '8px 12px', borderRadius: 8, border: `1px solid #bbf7d0` }}>
            ✓ PDF #{pdfId} ready — click "Generate" to create topics from the PDF content
          </div>
        )}
      </div>
    </Card>
  );
}

export default PdfUploadPanel;
