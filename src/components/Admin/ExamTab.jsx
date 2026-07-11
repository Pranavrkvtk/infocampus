// src/components/Admin/ExamTab.jsx
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

function DocumentUploadButton({ subtopicId, uploading, onFileSelected }) {
  const inputId = `exam-doc-upload-${subtopicId}`;
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
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
          {uploading ? '📎 Uploading document...' : '📎 Upload Document (PDF/DOC/DOCX)'}
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

const ExamTab = ({ subtopicId, subtopic, onUpdate, toast, initialData }) => {
  // Handle null values - convert null to empty string
  const getContent = (data) => data?.examContent || '';
  
  const [examContent, setExamContent] = useState(getContent(initialData));
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  
  // Use refs to prevent infinite loop
  const hasLoaded = useRef(false);
  const isUpdatingFromParent = useRef(false);
  const isSavingRef = useRef(false);

  // ─── Load exam content ──────────────────────────────────────
  const loadExamContent = useCallback(async () => {
    if (!subtopicId) return;
    if (hasLoaded.current) return;
    
    try {
      const data = await api.get(`/admin/subtopics/${subtopicId}/exam-content`);
      const content = data.examContent || '';
      
      setExamContent(content);
      hasLoaded.current = true;
      
      onUpdate?.({ examContent: content });
    } catch (error) {
      console.error('Failed to load exam content:', error);
      if (toast) toast.show('Failed to load exam content', 'error');
    }
  }, [subtopicId, onUpdate, toast]);

  // ─── Load on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!hasLoaded.current && !initialData?.examContent && subtopicId) {
      loadExamContent();
    }
  }, [subtopicId, initialData?.examContent, loadExamContent]);

  // ─── Sync with initialData changes (but prevent loops) ────
  useEffect(() => {
    const newContent = initialData?.examContent || '';
    
    // Only update if content actually changed and it's not a save operation
    if (newContent !== examContent && !isUpdatingFromParent.current && !isSavingRef.current) {
      isUpdatingFromParent.current = true;
      setExamContent(newContent);
      setTimeout(() => {
        isUpdatingFromParent.current = false;
      }, 0);
    }
  }, [initialData?.examContent, examContent]);

  // ─── Clear exam content ─────────────────────────────────────
  const clearExamContent = async () => {
    if (!window.confirm('Are you sure you want to clear all exam content?')) return;
    
    setSaving(true);
    isSavingRef.current = true;
    try {
      await api.put(`/admin/subtopics/${subtopicId}/exam-content`, { 
        content: ''
      });
      
      // ✅ Clear local state immediately
      setExamContent('');
      
      // ✅ Notify parent with empty content
      onUpdate?.({ examContent: '' });
      
      // ✅ Reset hasLoaded to allow reload if needed
      hasLoaded.current = false;
      
      if (toast) toast.show('Exam content cleared successfully!', 'success');
    } catch (error) {
      console.error('🔴 Clear error:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to clear exam content';
      if (toast) toast.show(msg, 'error');
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  // ─── Save exam content ──────────────────────────────────────
  const saveExamContent = async () => {
    setSaving(true);
    isSavingRef.current = true;
    try {
      // ✅ Save the content
      await api.put(`/admin/subtopics/${subtopicId}/exam-content`, { 
        content: examContent
      });
      
      // ✅ Notify parent with the current content (NO extra GET)
      onUpdate?.({ examContent: examContent });
      
      if (toast) toast.show('Exam content saved successfully!', 'success');
    } catch (error) {
      console.error('🔴 Save error:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to save exam content';
      if (toast) toast.show(msg, 'error');
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  // ─── Upload document ────────────────────────────────────────
  const uploadDocument = async (file) => {
    if (!file) return;
    
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      if (toast) toast.show('Only PDF, DOC and DOCX files are allowed', 'error');
      return;
    }

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post(
        `/admin/subtopics/${subtopicId}/upload-exam-pdf`,
        formData
      );
      const data = response.data;
      
      // ✅ Fetch fresh content after upload (this is needed)
      const freshData = await api.get(`/admin/subtopics/${subtopicId}/exam-content`);
      const freshContent = freshData.examContent || '';
      
      setExamContent(freshContent);
      onUpdate?.({ examContent: freshContent });
      hasLoaded.current = true;
      
      if (toast) toast.show(`✅ Document processed: ${data.imageCount ?? 0} image(s) extracted.`, 'success');
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Upload failed';
      if (toast) toast.show(msg, 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  // ─── Search/Highlight functionality ────────────────────────
  useEffect(() => {
    if (!searchTerm.trim()) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }
    const regex = new RegExp(searchTerm, 'gi');
    const found = [];
    let match;
    while ((match = regex.exec(examContent)) !== null) {
      found.push({ start: match.index, end: match.index + match[0].length });
    }
    setMatches(found);
    setCurrentMatchIndex(found.length > 0 ? 0 : -1);
  }, [searchTerm, examContent]);

  const goToMatch = (index) => {
    if (index < 0 || index >= matches.length) return;
    const match = matches[index];
    setCurrentMatchIndex(index);
    const textarea = document.getElementById('exam-editor');
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
    <div style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Lbl>📋 Exam Content (Admin Editable)</Lbl>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn size="sm" onClick={clearExamContent} disabled={saving || !examContent} variant="danger">
            {saving ? 'Clearing…' : '🗑️ Clear Content'}
          </Btn>
          <Btn size="sm" onClick={saveExamContent} disabled={saving} variant="success">
            {saving ? 'Saving…' : '💾 Save Exam Content'}
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
          placeholder="Search exam content..."
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
          id="exam-editor"
          value={examContent}
          onChange={(e) => {
            const newContent = e.target.value;
            setExamContent(newContent);
            // ❌ DO NOT call onUpdate here - let save button handle it
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
          placeholder="Enter exam content here... You can also upload a PDF or DOCX document above."
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
            {highlightText(examContent)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ExamTab;