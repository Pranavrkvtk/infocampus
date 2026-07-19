// src/components/Admin/InterviewTab.jsx
// Complete fixed version with PDF-only upload and progress modal

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getImageUrl } from '../../utils/imageUtils';
import axiosInstance from '../../api/axios';

// Thin wrapper for axios
const api = {
  get: (url) => axiosInstance.get(url).then(r => r.data),
  post: (url, body) => axiosInstance.post(url, body).then(r => r.data),
  put: (url, body) => axiosInstance.put(url, body).then(r => r.data),
  delete: (url) => axiosInstance.delete(url).then(r => r.data),
};

const clr = {
  bg: '#f8f9fb', white: '#ffffff', border: '#e4e7ec', borderActive: '#4f46e5',
  text: '#0f172a', muted: '#64748b', faint: '#f1f5f9', accent: '#4f46e5',
  accentLight: '#eef2ff', accentText: '#3730a3', success: '#16a34a',
  successLight: '#f0fdf4', danger: '#dc2626', dangerLight: '#fef2f2',
};

const Lbl = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: clr.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>
    {children}
  </label>
);

const Btn = ({ children, onClick, variant = 'primary', size = 'md', disabled, style: extra }) => {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', borderRadius: 8, fontWeight: 600, opacity: disabled ? 0.5 : 1 };
  const sizes = { sm: { padding: '5px 12px', fontSize: 12 }, md: { padding: '8px 16px', fontSize: 13 } };
  const variants = {
    primary: { background: clr.accent, color: '#fff' },
    success: { background: clr.success, color: '#fff' },
    danger: { background: clr.dangerLight, color: clr.danger },
    ghost: { background: clr.faint, color: clr.muted, border: `1px solid ${clr.border}` },
    dashed: { background: clr.accentLight, color: clr.accentText, border: `1.5px dashed ${clr.accent}` },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}>{children}</button>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT UPLOAD BUTTON - UPDATED: PDF ONLY
// ═══════════════════════════════════════════════════════════════════════════════
function DocumentUploadButton({ subtopicId, uploading, onFileSelected }) {
  const inputId = `interview-doc-upload-${subtopicId}`;
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="file"
        accept=".pdf,application/pdf"
        id={inputId}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onFileSelected(file);
          e.target.value = '';
        }}
      />
      <label htmlFor={inputId} style={{ display: 'inline-block' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.5 : 1,
          padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 8,
          background: clr.accentLight, color: clr.accentText,
          border: `1.5px dashed ${clr.accent}`,
        }}>
          {uploading ? '📎 Uploading PDF...' : '📎 Upload PDF Only'}
        </span>
      </label>
    </div>
  );
}

function MarkdownImage({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  if (!src) return null;

  const fullSrc = getImageUrl(src);

  if (hasError) {
    return (
      <div style={{
        padding: '16px',
        textAlign: 'center',
        color: '#dc2626',
        fontSize: '13px',
        background: '#fef2f2',
        borderRadius: '8px',
        border: '2px dashed #dc2626',
        margin: '12px 0',
      }}>
        ⚠️ Image not found: {alt || 'image'}
      </div>
    );
  }

  return (
    <img
      src={fullSrc}
      alt={alt || 'image'}
      style={{ maxWidth: '100%', height: 'auto', margin: '12px 0', borderRadius: 8, display: 'block' }}
      onError={() => {
        console.error('❌ Markdown image load error:', fullSrc);
        setHasError(true);
      }}
    />
  );
}

// ─── PDF Upload Progress Modal ──────────────────────────────────────────────
function PdfUploadProgress({ progress, fileName, onCancel }) {
  // Get status message based on progress
  const getStatusMessage = () => {
    if (progress === 100) return '✅ Upload Complete!';
    if (progress < 30) return '📤 Preparing upload...';
    if (progress < 60) return '📄 Uploading PDF...';
    if (progress < 90) return '🔄 Processing document...';
    if (progress < 100) return '📝 Finalizing...';
    return '✅ Complete!';
  };

  // Get emoji based on progress
  const getEmoji = () => {
    if (progress === 100) return '✅';
    if (progress < 30) return '📤';
    if (progress < 60) return '📄';
    if (progress < 90) return '🔄';
    return '📝';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.6)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: clr.white,
        borderRadius: 16,
        padding: 32,
        width: 420,
        maxWidth: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: clr.text, marginBottom: 8 }}>
            {getEmoji()} {progress === 100 ? 'Upload Complete!' : 'Uploading PDF'}
          </div>
          <div style={{ fontSize: 13, color: clr.muted }}>
            {fileName || 'Processing document...'}
          </div>
        </div>

        {/* Progress Bar with Percentage */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            fontWeight: 600,
            color: clr.text,
            marginBottom: 4,
          }}>
            <span>Progress</span>
            <span style={{ color: clr.accent }}>{progress}%</span>
          </div>
          <div style={{
            width: '100%',
            height: 10,
            background: clr.faint,
            borderRadius: 5,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${clr.accent}, #818cf8)`,
              borderRadius: 5,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Status Message */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          padding: '10px 14px',
          background: clr.faint,
          borderRadius: 8,
          fontSize: 13,
          color: clr.text,
        }}>
          <span style={{ fontSize: 18 }}>{getEmoji()}</span>
          <span>{getStatusMessage()}</span>
        </div>

        {/* Additional info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
          fontSize: 11,
          color: clr.muted,
        }}>
          <span>⏱️ Please wait...</span>
          <span>{progress === 100 ? '🎉 Done!' : `${progress}% complete`}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={onCancel}
            disabled={progress === 100}
            style={{
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: progress === 100 ? clr.success : clr.dangerLight,
              color: progress === 100 ? '#fff' : clr.danger,
              cursor: progress === 100 ? 'default' : 'pointer',
              opacity: progress === 100 ? 0.7 : 1,
            }}
          >
            {progress === 100 ? '✓ Completed' : '✕ Cancel Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

const InterviewTab = ({ subtopicId, subtopic, onUpdate, toast, initialData }) => {
  // Handle null values - convert null to empty string
  const getContent = (data) => data?.interviewContent || '';
  
  const [interviewContent, setInterviewContent] = useState(getContent(initialData));
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  
  // PDF Upload Progress State
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const cancelRef = useRef(false);
  
  // Use refs to prevent infinite loop
  const hasLoaded = useRef(false);
  const isUpdatingFromParent = useRef(false);
  const isSavingRef = useRef(false);
  const contentBeforeSave = useRef('');

  // ─── Load interview content ────────────────────────────────────
  const loadInterviewContent = useCallback(async () => {
    if (!subtopicId) return;
    if (hasLoaded.current) return;
    
    try {
      const data = await api.get(`/admin/subtopics/${subtopicId}/interview-content`);
      const content = data.interviewContent || '';
      
      console.log('📥 Loaded interview content:', content ? 'Content present' : 'Empty');
      setInterviewContent(content);
      hasLoaded.current = true;
      
      onUpdate?.({ interviewContent: content });
    } catch (error) {
      console.error('Failed to load interview content:', error);
      if (toast) toast.show('Failed to load interview content', 'error');
    }
  }, [subtopicId, onUpdate, toast]);

  // ─── Load on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!hasLoaded.current && !initialData?.interviewContent && subtopicId) {
      loadInterviewContent();
    }
  }, [subtopicId, initialData?.interviewContent, loadInterviewContent]);

  // ─── Sync with initialData changes (but prevent loops) ──────
  useEffect(() => {
    const newContent = initialData?.interviewContent || '';
    
    // Only update if content actually changed and it's not a save operation
    if (newContent !== interviewContent && !isUpdatingFromParent.current && !isSavingRef.current) {
      console.log('🔄 Syncing from parent, new content length:', newContent.length);
      isUpdatingFromParent.current = true;
      setInterviewContent(newContent);
      setTimeout(() => {
        isUpdatingFromParent.current = false;
      }, 0);
    }
  }, [initialData?.interviewContent, interviewContent]);

  // ─── Clear interview content ────────────────────────────────────
  const clearInterviewContent = async () => {
    if (!window.confirm('Are you sure you want to clear all interview content?')) return;
    
    setSaving(true);
    isSavingRef.current = true;
    try {
      await api.put(`/admin/subtopics/${subtopicId}/interview-content`, { 
        content: ''
      });
      
      setInterviewContent('');
      onUpdate?.({ interviewContent: '' });
      hasLoaded.current = false;
      
      if (toast) toast.show('Interview content cleared successfully!', 'success');
    } catch (error) {
      console.error('🔴 Clear error:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to clear interview content';
      if (toast) toast.show(msg, 'error');
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  // ─── Save interview content ────────────────────────────────────
  const saveInterviewContent = async () => {
    // ✅ Save the current content to a ref before saving
    contentBeforeSave.current = interviewContent;
    console.log('💾 Saving interview content, length:', interviewContent.length);
    
    setSaving(true);
    isSavingRef.current = true;
    try {
      const response = await api.put(`/admin/subtopics/${subtopicId}/interview-content`, { 
        content: interviewContent
      });
      
      console.log('✅ Save response:', response);
      
      // ✅ Notify parent with the current content
      if (interviewContent) {
        onUpdate?.({ interviewContent: interviewContent });
        if (toast) toast.show('Interview content saved successfully!', 'success');
      } else {
        // If content is empty, clear it
        onUpdate?.({ interviewContent: '' });
        if (toast) toast.show('Interview content cleared!', 'success');
      }
    } catch (error) {
      console.error('🔴 Save error:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to save interview content';
      if (toast) toast.show(msg, 'error');
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  // ─── Upload document - UPDATED: PDF ONLY WITH PROGRESS ──────
  const uploadDocument = async (file) => {
    if (!file) return;
    
    // ✅ Check if file is PDF by MIME type
    if (file.type !== 'application/pdf') {
      if (toast) toast.show('❌ Only PDF files are allowed. DOC and DOCX are not supported.', 'error');
      return;
    }
    
    // ✅ Additional safety check for file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'pdf') {
      if (toast) toast.show('❌ Only PDF files are allowed. Please select a PDF file.', 'error');
      return;
    }

    // Reset cancel flag and show progress
    cancelRef.current = false;
    setFileName(file.name);
    setProgress(0);
    setShowProgress(true);
    setUploadingDoc(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress from 0 to 100
      const progressInterval = setInterval(() => {
        if (cancelRef.current) {
          clearInterval(progressInterval);
          return;
        }
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          // Random increment based on current progress
          let increment;
          if (prev < 30) increment = Math.floor(Math.random() * 8) + 3;
          else if (prev < 60) increment = Math.floor(Math.random() * 5) + 2;
          else increment = Math.floor(Math.random() * 3) + 1;
          return Math.min(prev + increment, 95);
        });
      }, 400);

      const response = await axiosInstance.post(
        `/admin/subtopics/${subtopicId}/upload-interview-pdf`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (cancelRef.current) return;
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(Math.min(percentCompleted, 98));
            }
          }
        }
      );
      
      // Clear the interval
      clearInterval(progressInterval);
      
      // Check if cancelled
      if (cancelRef.current) {
        setShowProgress(false);
        setUploadingDoc(false);
        if (toast) toast.show('Upload cancelled', 'error');
        return;
      }
      
      const data = response.data;
      
      // Fetch fresh content after upload
      const freshData = await api.get(`/admin/subtopics/${subtopicId}/interview-content`);
      const freshContent = freshData.interviewContent || '';
      
      console.log('📤 Upload complete, new content length:', freshContent.length);
      setProgress(100);
      setInterviewContent(freshContent);
      onUpdate?.({ interviewContent: freshContent });
      hasLoaded.current = true;
      
      // Hide progress after a moment
      setTimeout(() => {
        setShowProgress(false);
        setUploadingDoc(false);
        if (toast) toast.show(`✅ Document processed: ${data.imageCount ?? 0} image(s) extracted.`, 'success');
      }, 800);
      
    } catch (err) {
      console.error('Upload error:', err);
      setShowProgress(false);
      setUploadingDoc(false);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Upload failed';
      if (toast) toast.show(msg, 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleCancelUpload = () => {
    cancelRef.current = true;
    setShowProgress(false);
    setUploadingDoc(false);
    if (toast) toast.show('Upload cancelled', 'error');
  };

  // ─── Search/Highlight functionality ────────────────────────────
  useEffect(() => {
    if (!searchTerm.trim()) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }
    const regex = new RegExp(searchTerm, 'gi');
    const found = [];
    let match;
    while ((match = regex.exec(interviewContent)) !== null) {
      found.push({ start: match.index, end: match.index + match[0].length });
    }
    setMatches(found);
    setCurrentMatchIndex(found.length > 0 ? 0 : -1);
  }, [searchTerm, interviewContent]);

  const goToMatch = (index) => {
    if (index < 0 || index >= matches.length) return;
    const match = matches[index];
    setCurrentMatchIndex(index);
    const textarea = document.getElementById('interview-editor');
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(match.start, match.end);
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const lines = textarea.value.substring(0, match.start).split('\n').length;
      textarea.scrollTop = (lines - 3) * lineHeight;
    }
  };

  const markdownComponents = {
    img: ({ src, alt }) => <MarkdownImage src={src} alt={alt} />,
  };

  const highlightText = (text) => {
    if (!searchTerm.trim()) return text;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark style="background:#fde047;color:#1e293b;padding:0 2px;border-radius:2px;">$1</mark>');
  };

  return (
    <>
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Lbl>🎤 Interview Content (Admin )</Lbl>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" onClick={clearInterviewContent} disabled={saving || !interviewContent} variant="danger">
              {saving ? 'Clearing…' : '🗑️ Clear Content'}
            </Btn>
            <Btn size="sm" onClick={saveInterviewContent} disabled={saving} variant="success">
              {saving ? 'Saving…' : '💾 Save Interview Content'}
            </Btn>
          </div>
        </div>

        <DocumentUploadButton
          subtopicId={subtopicId}
          uploading={uploadingDoc}
          onFileSelected={uploadDocument}
        />

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Search interview content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              border: `1px solid ${clr.border}`,
              borderRadius: '6px',
              outline: 'none',
              fontSize: '13px',
              background: clr.white,
              color: clr.text,
            }}
          />
          {matches.length > 0 && (
            <span style={{ fontSize: '12px', color: clr.muted, minWidth: '60px' }}>
              {currentMatchIndex + 1} of {matches.length}
            </span>
          )}
          <button
            onClick={() => goToMatch(currentMatchIndex - 1)}
            disabled={matches.length === 0}
            style={{
              background: matches.length ? clr.accentLight : clr.faint,
              border: `1px solid ${clr.border}`,
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: matches.length ? 'pointer' : 'not-allowed',
              color: matches.length ? clr.accentText : clr.muted,
            }}
          >
            ↑
          </button>
          <button
            onClick={() => goToMatch(currentMatchIndex + 1)}
            disabled={matches.length === 0}
            style={{
              background: matches.length ? clr.accentLight : clr.faint,
              border: `1px solid ${clr.border}`,
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: matches.length ? 'pointer' : 'not-allowed',
              color: matches.length ? clr.accentText : clr.muted,
            }}
          >
            ↓
          </button>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                color: clr.muted,
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <textarea
            id="interview-editor"
            value={interviewContent}
            onChange={(e) => {
              const newContent = e.target.value;
              console.log('✏️ Editor change, new length:', newContent.length);
              setInterviewContent(newContent);
            }}
            rows={12}
            style={{
              width: '100%',
              fontFamily: 'monospace',
              fontSize: 13,
              padding: 12,
              border: `1px solid ${clr.border}`,
              borderRadius: 8,
              outline: 'none',
              background: clr.white,
              color: clr.text,
              resize: 'vertical',
            }}
            placeholder="Enter interview content here... You can also upload a PDF document above."
          />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: clr.muted }}>
            📄 Preview (Students will see this with copy protection) – <mark style={{ background: '#fde047', padding: '0 4px', borderRadius: '2px' }}>yellow</mark> highlights matches
          </div>
          <div
            style={{
              border: `1px solid ${clr.border}`,
              borderRadius: 8,
              padding: 16,
              background: clr.white,
              minHeight: 200,
              overflowY: 'auto',
              fontSize: 13,
              lineHeight: 1.6,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
            }}
            onCopy={(e) => e.preventDefault()}
          >
            <ReactMarkdown
              components={markdownComponents}
              rehypePlugins={[rehypeRaw]}
            >
              {highlightText(interviewContent)}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* PDF Upload Progress Modal */}
      {showProgress && (
        <PdfUploadProgress
          progress={progress}
          fileName={fileName}
          onCancel={handleCancelUpload}
        />
      )}
    </>
  );
};

export default InterviewTab;