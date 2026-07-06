// src/components/CourseDetailView.jsx
// Enhanced Odoo-style learning UI with improved UX, animations, and features

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSubtopicImages,
  getSubtopicInterviewQuestions,
  getSubtopicExamQuestions,
  getSubtopicLabs,
} from '../api/UserApi';

const API_BASE = 'http://localhost:8082/api';

// ─── Design tokens ─────────────────────────────────────────────────────
const C = {
  sidebarBg: '#15131C',
  sidebarBgAlt: '#1D1A26',
  sidebarLine: '#2A2733',
  sidebarText: '#C9C5D6',
  sidebarTextDim: '#7C7791',
  sidebarActive: '#2A2440',
  sidebarHover: '#242033',
  playerHeaderFrom: '#2E1F35',
  playerHeaderTo: '#4A2F52',
  accent: '#8B5FBF',
  accentLight: '#A78BCC',
  accentDark: '#6B4A8A',
  accentSoft: '#EDE7F6',
  gold: '#E8B84B',
  goldLight: '#F5D98A',
  paper: '#FFFFFF',
  canvas: '#F5F4F8',
  ink: '#1E1B24',
  slate: '#6B6478',
  slateLight: '#A79FBC',
  success: '#2E9B6C',
  successLight: '#DFF3E8',
  error: '#DC3545',
  errorLight: '#FDE8E8',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
};

// ─── Helpers ───────────────────────────────────────────────────────────

const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
  if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/');
  return url;
};

const buildImgSrc = (src) => {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/api/admin/')) return `http://localhost:8082${src}`;
  if (src.startsWith('/api/')) return `http://localhost:8082${src}`;
  if (src.startsWith('/uploads/')) return `http://localhost:8082/api/admin${src}`;
  return `${API_BASE}${src}`;
};

const buildImageTag = (alt, src) =>
  `<img src="${buildImgSrc(src)}" alt="${alt}" class="note-image" loading="lazy" style="max-width:100%;border-radius:14px;margin:24px 0;box-shadow:0 6px 24px rgba(0,0,0,0.1);" />`;

const inlineFormat = (str) => {
  let out = str;
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => buildImageTag(alt, src));
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (m, text, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="note-link">${text}</a>`
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code class="note-code">$1</code>');
  return out;
};

const renderRichContent = (text) => {
  if (!text) return '';
  const lines = text.split('\n');
  let html = '';
  let listType = null;

  const closeList = () => {
    if (listType) {
      html += `</${listType}>`;
      listType = null;
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (line === '') {
      closeList();
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html += `<h${level} class="note-h${level}">${inlineFormat(heading[2])}</h${level}>`;
      return;
    }

    const quote = line.match(/^>\s*(.*)$/);
    if (quote) {
      closeList();
      html += `<div class="note-tip">💡 ${inlineFormat(quote[1])}</div>`;
      return;
    }

    const standaloneImage = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (standaloneImage) {
      closeList();
      html += buildImageTag(standaloneImage[1], standaloneImage[2]);
      return;
    }

    const ulItem = line.match(/^[-*]\s+(.*)$/);
    if (ulItem) {
      if (listType !== 'ul') {
        closeList();
        html += '<ul class="note-list">';
        listType = 'ul';
      }
      html += `<li>${inlineFormat(ulItem[1])}</li>`;
      return;
    }

    const olItem = line.match(/^\d+\.\s+(.*)$/);
    if (olItem) {
      if (listType !== 'ol') {
        closeList();
        html += '<ol class="note-list">';
        listType = 'ol';
      }
      html += `<li>${inlineFormat(olItem[1])}</li>`;
      return;
    }

    closeList();
    html += `<p class="note-paragraph">${inlineFormat(line)}</p>`;
  });

  closeList();
  return html;
};

// ─── Split content by sections - MAXIMUM CONTENT PER PAGE ──────────────
const MAX_PAGE_CHARS = 4000;

const splitBySections = (content) => {
  if (!content) return [{ title: 'Content', content: '' }];
  
  const lines = content.split('\n');
  const pages = [];
  let currentPage = [];
  let currentTitle = 'Introduction';
  let hasHeading = false;
  let charCount = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    
    if (headingMatch) {
      if (currentPage.length > 0 && charCount > 400) {
        pages.push({ 
          title: currentTitle, 
          content: currentPage.join('\n'),
          isHeadingPage: hasHeading
        });
        currentPage = [];
        charCount = 0;
      }
      currentTitle = headingMatch[2];
      currentPage = [line];
      charCount = line.length;
      hasHeading = true;
    } else if (trimmed === '') {
      if (currentPage.length > 0 && charCount > MAX_PAGE_CHARS) {
        pages.push({ 
          title: currentTitle, 
          content: currentPage.join('\n'),
          isHeadingPage: hasHeading
        });
        currentPage = [];
        charCount = 0;
      } else {
        currentPage.push(line);
      }
    } else {
      currentPage.push(line);
      charCount += line.length;
      
      if (charCount > MAX_PAGE_CHARS && currentPage.length > 8) {
        pages.push({ 
          title: currentTitle, 
          content: currentPage.join('\n'),
          isHeadingPage: hasHeading
        });
        currentPage = [];
        charCount = 0;
      }
    }
  });

  if (currentPage.length > 0) {
    pages.push({ 
      title: currentTitle, 
      content: currentPage.join('\n'),
      isHeadingPage: hasHeading
    });
  }

  if (pages.length === 0) {
    pages.push({ title: 'Content', content });
  }

  return pages;
};

const splitIntoPages = (content) => {
  if (!content) return [{ title: 'No Content', content: '' }];
  return splitBySections(content);
};

const NOTE_STYLES = `
  .notes-content { 
    color: #1e293b; 
    font-family: 'Inter', system-ui, -apple-system, sans-serif; 
    font-size: 19px;
    line-height: 2.1;
  }
  .notes-content .note-h1 { 
    font-size: 38px; 
    font-weight: 800; 
    color: #0f172a; 
    margin: 0 0 24px; 
    line-height: 1.3; 
    letter-spacing: -0.5px;
  }
  .notes-content .note-h2 { 
    font-size: 30px; 
    font-weight: 700; 
    color: #0f172a; 
    margin: 0 0 18px; 
    line-height: 1.35; 
    border-bottom: 3px solid #f1f5f9; 
    padding-bottom: 12px; 
    letter-spacing: -0.3px;
  }
  .notes-content .note-h3 { 
    font-size: 24px; 
    font-weight: 600; 
    color: #1e293b; 
    margin: 0 0 16px; 
    letter-spacing: -0.2px;
  }
  .notes-content .note-paragraph { 
    margin: 0 0 22px; 
    line-height: 2.1; 
    font-size: 19px; 
    color: #1e293b;
  }
  .notes-content .note-list { 
    margin: 0 0 22px; 
    padding-left: 36px; 
    line-height: 2.1; 
    font-size: 19px; 
  }
  .notes-content .note-list li { 
    margin-bottom: 12px; 
  }
  .notes-content .note-tip { 
    background: #fef9e7; 
    border-left: 5px solid #f5b942; 
    padding: 20px 28px; 
    border-radius: 12px; 
    margin: 24px 0; 
    font-size: 18px; 
    color: #7a5c00; 
    line-height: 1.8; 
  }
  .notes-content .note-link { 
    color: #4f46e5; 
    text-decoration: underline; 
    text-decoration-color: #c7d2fe; 
    text-underline-offset: 3px;
    font-weight: 500;
  }
  .notes-content .note-link:hover { 
    color: #4338ca; 
  }
  .notes-content .note-image { 
    max-width: 100%; 
    border-radius: 16px; 
    margin: 30px 0; 
    box-shadow: 0 8px 32px rgba(0,0,0,0.1); 
    display: block; 
  }
  .notes-content .note-code { 
    background: #f1f5f9; 
    padding: 4px 12px; 
    border-radius: 8px; 
    font-size: 17px; 
    color: #0f172a; 
    font-family: 'JetBrains Mono', 'Fira Code', monospace; 
  }
  .notes-content > *:last-child { 
    margin-bottom: 0; 
  }

  .page-slide-next { animation: slideInNext 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
  .page-slide-prev { animation: slideInPrev 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
  @keyframes slideInNext {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInPrev {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .fade-in { animation: fadeIn 0.6s ease-out; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Sidebar leaf-type config ──────────────────────────────────────────
const CONTENT_TYPES = [
  { key: 'video',     icon: '🎬', label: 'Video Tutorial', color: '#8B5FBF' },
  { key: 'notes',     icon: '📄', label: 'Tutorial', color: '#3B82F6' },
  { key: 'interview', icon: '🎤', label: 'Interview Qs', color: '#F59E0B' },
  { key: 'exam',      icon: '📝', label: 'Exam Question', color: '#EF4444' },
  { key: 'labs',      icon: '🧪', label: 'Lab Exercise', color: '#10B981' },
];

// ─── Section components ───────────────────────────────────────────────

// ─── Progress Ring ──────────────────────────────────────────────────────
function ProgressRing({ progress, size = 48, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E7E3EE"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#8B5FBF"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        fontSize="10"
        fontWeight="700"
        fill="#1E1B24"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

// ─── NotesTab — Maximum content, minimal pagination ──────────────────
function NotesTab({ content }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const [direction, setDirection] = useState('next');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lockAxis = useRef(null);

  useEffect(() => {
    if (content) {
      const splitPages = splitIntoPages(content);
      setPages(splitPages);
      setCurrentPage(0);
    }
  }, [content]);

  const totalPages = pages.length;

  const goNext = useCallback(() => {
    setDirection('next');
    setCurrentPage((p) => (p < totalPages - 1 ? p + 1 : p));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setDirection('prev');
    setCurrentPage((p) => (p > 0 ? p - 1 : p));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  if (!content || pages.length === 0) {
    return <div className="empty-state">📝 No notes for this section.</div>;
  }

  const currentPageData = pages[currentPage] || { title: 'Content', content: '' };
  const html = renderRichContent(currentPageData.content);
  const pageLabel = currentPageData.title;

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    lockAxis.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (lockAxis.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      lockAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (lockAxis.current === 'x') {
      e.preventDefault();
      const atStart = currentPage === 0 && dx > 0;
      const atEnd = currentPage === totalPages - 1 && dx < 0;
      setDragX(atStart || atEnd ? dx * 0.35 : dx);
    }
  };

  const handleTouchEnd = () => {
    const SWIPE_THRESHOLD = 70;
    if (lockAxis.current === 'x') {
      if (dragX < -SWIPE_THRESHOLD && currentPage < totalPages - 1) {
        goNext();
      } else if (dragX > SWIPE_THRESHOLD && currentPage > 0) {
        goPrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    lockAxis.current = null;
    setDragX(0);
    setIsDragging(false);
  };

  const goToPage = (index) => {
    if (index === currentPage) return;
    setDirection(index > currentPage ? 'next' : 'prev');
    setCurrentPage(index);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Page header with controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '14px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          fontSize: '17px',
          fontWeight: 700,
          color: '#0f172a',
          padding: '12px 20px',
          background: '#f8fafc',
          borderRadius: '12px',
          borderLeft: '5px solid #8B5FBF',
          flex: 1,
          minWidth: '180px',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📖 {pageLabel}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              padding: '10px 14px',
              background: 'transparent',
              border: '1px solid #E7E3EE',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#6B6478',
              transition: 'all 0.2s',
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>
          {totalPages > 1 && (
            <span style={{ 
              fontSize: '14px', 
              color: '#94a3b8', 
              fontWeight: 500, 
              padding: '6px 14px',
              background: '#f8fafc',
              borderRadius: '8px',
            }}>
              {currentPage + 1} / {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Content card - large content area */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          touchAction: 'pan-y',
          overflow: 'hidden',
          borderRadius: '18px',
          border: '1px solid #EEECF3',
          background: '#fff',
          boxShadow: isFullscreen ? '0 24px 80px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.3s ease',
          maxHeight: isFullscreen ? '88vh' : '76vh',
          minHeight: '240px',
        }}
      >
        {/* Desktop navigation arrows - larger */}
        {totalPages > 1 && currentPage > 0 && (
          <button
            onClick={goPrev}
            aria-label="Previous page"
            style={{
              position: 'absolute',
              top: '50%',
              left: '14px',
              transform: 'translateY(-50%)',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '1px solid #E7E3EE',
              background: 'rgba(255,255,255,0.95)',
              color: '#6B6478',
              fontSize: '26px',
              cursor: 'pointer',
              zIndex: 5,
              boxShadow: '0 4px 20px rgba(30,27,36,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(30,27,36,0.12)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >
            ‹
          </button>
        )}
        {totalPages > 1 && currentPage < totalPages - 1 && (
          <button
            onClick={goNext}
            aria-label="Next page"
            style={{
              position: 'absolute',
              top: '50%',
              right: '14px',
              transform: 'translateY(-50%)',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: '1px solid #E7E3EE',
              background: 'rgba(255,255,255,0.95)',
              color: '#6B6478',
              fontSize: '26px',
              cursor: 'pointer',
              zIndex: 5,
              boxShadow: '0 4px 20px rgba(30,27,36,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(30,27,36,0.12)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >
            ›
          </button>
        )}

        <div
          className={`notes-content ${!isDragging ? (direction === 'next' ? 'page-slide-next' : 'page-slide-prev') : ''}`}
          key={currentPage}
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            padding: '36px 42px',
            minHeight: '200px',
            maxHeight: isFullscreen ? 'calc(88vh - 80px)' : 'calc(76vh - 80px)',
            overflowY: 'auto',
            userSelect: 'none',
            transform: `translateX(${dragX}px)`,
            transition: isDragging ? 'none' : 'transform 0.25s ease',
            fontSize: '19px',
            lineHeight: '2.1',
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* Simplified navigation - only shown when more than 2 pages */}
      {totalPages > 2 && (
        <div style={{ marginTop: '22px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '14px',
            flexWrap: 'wrap',
          }}>
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                style={{
                  width: index === currentPage ? '40px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: index === currentPage ? '#8B5FBF' : '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
          }}>
            <button
              onClick={goPrev}
              disabled={currentPage === 0}
              style={{
                padding: '10px 24px',
                borderRadius: '30px',
                border: currentPage === 0 ? '1px solid #e2e8f0' : 'none',
                background: currentPage === 0 ? '#f1f5f9' : '#8B5FBF',
                color: currentPage === 0 ? '#cbd5e1' : '#fff',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s',
                minWidth: '120px',
              }}
            >
              ← Previous
            </button>

            <span style={{ 
              fontSize: '13px', 
              color: '#94a3b8', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <span style={{ fontSize: '20px' }}>👆</span> swipe
            </span>

            <button
              onClick={goNext}
              disabled={currentPage === totalPages - 1}
              style={{
                padding: '10px 24px',
                borderRadius: '30px',
                border: currentPage === totalPages - 1 ? '1px solid #e2e8f0' : 'none',
                background: currentPage === totalPages - 1 ? '#f1f5f9' : '#8B5FBF',
                color: currentPage === totalPages - 1 ? '#cbd5e1' : '#fff',
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s',
                minWidth: '120px',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
      
      {/* Reading progress indicator */}
      {totalPages > 1 && (
        <div style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#94a3b8',
        }}>
          <span>📊 Reading progress</span>
          <div style={{
            flex: 1,
            maxWidth: '200px',
            height: '4px',
            background: '#e2e8f0',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${((currentPage + 1) / totalPages) * 100}%`,
              height: '100%',
              background: '#8B5FBF',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span>{Math.round(((currentPage + 1) / totalPages) * 100)}%</span>
        </div>
      )}
    </div>
  );
}

// ─── VideoTab with enhanced controls ──────────────────────────────────
function VideoTab({ videoUrls }) {
  const [currentVideo, setCurrentVideo] = useState(0);
  const urls = Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : []);

  if (urls.length === 0) return <div className="empty-state">🎬 No video for this section.</div>;

  const currentUrl = urls[currentVideo];
  const embed = getEmbedUrl(currentUrl);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Video playlist */}
      {urls.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '8px',
        }}>
          {urls.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentVideo(idx)}
              style={{
                padding: '10px 24px',
                borderRadius: '24px',
                border: idx === currentVideo ? '2px solid #8B5FBF' : '1px solid #E7E3EE',
                background: idx === currentVideo ? '#EDE7F6' : '#fff',
                color: idx === currentVideo ? '#8B5FBF' : '#6B6478',
                fontWeight: idx === currentVideo ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🎬 Video {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Video player */}
      {embed && (
        <div style={{ 
          position: 'relative', 
          paddingBottom: '56.25%', 
          height: 0, 
          overflow: 'hidden', 
          borderRadius: '16px', 
          background: '#000', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)' 
        }}>
          <iframe
            src={embed}
            title={`Video ${currentVideo + 1}`}
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </div>
      )}

      {/* Video controls hint */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        fontSize: '14px',
        color: '#94a3b8',
        padding: '8px 0',
        flexWrap: 'wrap',
      }}>
        <span>▶ Play/Pause</span>
        <span>⏪ Rewind 10s</span>
        <span>⏩ Forward 10s</span>
        <span>🔊 Volume</span>
        <span>⛶ Fullscreen</span>
      </div>
    </div>
  );
}

// ─── InterviewTab with search ──────────────────────────────────────────
function InterviewTab({ questions }) {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  if (!questions || questions.length === 0) return <div className="empty-state">🎤 No interview questions.</div>;

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'answered') {
      return matchesSearch && expanded[q.id];
    } else if (filterType === 'unanswered') {
      return matchesSearch && !expanded[q.id];
    }
    return matchesSearch;
  });

  const toggleAll = () => {
    const allExpanded = filteredQuestions.every(q => expanded[q.id]);
    const newState = {};
    filteredQuestions.forEach(q => {
      newState[q.id] = !allExpanded;
    });
    setExpanded(newState);
  };

  return (
    <div>
      {/* Search and controls */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '14px',
              border: '1px solid #E7E3EE',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
              background: '#fff',
            }}
            onFocus={(e) => e.target.style.borderColor = '#8B5FBF'}
            onBlur={(e) => e.target.style.borderColor = '#E7E3EE'}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '12px 18px',
            borderRadius: '14px',
            border: '1px solid #E7E3EE',
            background: '#fff',
            fontSize: '14px',
            color: '#6B6478',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All Questions</option>
          <option value="answered">Answered</option>
          <option value="unanswered">Unanswered</option>
        </select>
        <button
          onClick={toggleAll}
          style={{
            padding: '12px 24px',
            borderRadius: '14px',
            border: '1px solid #E7E3EE',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 500,
            color: '#6B6478',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {filteredQuestions.every(q => expanded[q.id]) ? 'Collapse All' : 'Expand All'}
        </button>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>
          {filteredQuestions.length} of {questions.length} questions
        </span>
      </div>

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            style={{
              background: '#fff',
              borderRadius: '18px',
              border: '1px solid #E7E3EE',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s',
              boxShadow: expanded[q.id] ? '0 4px 20px rgba(139,95,191,0.1)' : 'none',
            }}
          >
            <div
              onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 24px',
                background: expanded[q.id] ? '#FAF9FC' : '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#1E1B24',
                transition: 'background 0.2s',
                fontSize: '16px',
              }}
              onMouseEnter={(e) => { if (!expanded[q.id]) e.currentTarget.style.background = '#F8F7FA'; }}
              onMouseLeave={(e) => { if (!expanded[q.id]) e.currentTarget.style.background = '#fff'; }}
            >
              <span>
                <span style={{ color: '#94a3b8', fontWeight: 400, marginRight: '12px' }}>{idx + 1}.</span>
                {q.question}
              </span>
              <span style={{
                fontSize: '22px',
                color: '#8B7FA0',
                transition: 'transform 0.2s',
                transform: expanded[q.id] ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>
                ▼
              </span>
            </div>
            {expanded[q.id] && (
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid #E7E3EE',
                background: '#fff',
                color: '#3A3548',
                lineHeight: '1.9',
                fontSize: '16px',
              }}>
                {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontSize: '16px' }}>
          No questions match your search.
        </div>
      )}
    </div>
  );
}

// ─── ExamTab with timer ──────────────────────────────────────────────
function ExamTab({ questions, onScoreUpdate }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [timerActive, setTimerActive] = useState(true);

  const hasQuestions = !!(questions && questions.length > 0);

  const handleSubmit = useCallback(() => {
    if (!hasQuestions) return;
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const total = questions.length;
    setScore({ correct, total });
    setSubmitted(true);
    setTimerActive(false);
    if (onScoreUpdate) onScoreUpdate(correct, total);
  }, [hasQuestions, questions, answers, onScoreUpdate]);

  useEffect(() => {
    if (!hasQuestions || !timerActive || submitted) return undefined;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasQuestions, timerActive, submitted, handleSubmit]);

  if (!hasQuestions) return <div className="empty-state">📝 No MCQ questions.</div>;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (qId, answer) => setAnswers((prev) => ({ ...prev, [qId]: answer }));

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        background: '#f8fafc',
        borderRadius: '16px',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
            📝 MCQ Quiz
          </span>
          <span style={{ fontSize: '15px', color: '#64748b' }}>
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{
            fontSize: '17px',
            fontWeight: 700,
            color: timeLeft < 60 ? '#DC3545' : '#0f172a',
            fontVariantNumeric: 'tabular-nums',
          }}>
            ⏱ {formatTime(timeLeft)}
          </span>
          {!submitted && (
            <button
              onClick={handleSubmit}
              style={{
                padding: '12px 28px',
                background: '#8B5FBF',
                color: '#fff',
                border: 'none',
                borderRadius: '30px',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#7A4FAA'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#8B5FBF'}
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} style={{
          padding: '28px',
          background: '#fff',
          borderRadius: '20px',
          border: '1px solid #E7E3EE',
          marginBottom: '18px',
          transition: 'border-color 0.2s',
          borderColor: answers[q.id] ? '#8B5FBF' : '#E7E3EE',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '18px', fontSize: '17px', color: '#1E1B24' }}>
            <span style={{ color: '#94a3b8', fontWeight: 400, marginRight: '12px' }}>{idx + 1}.</span>
            {q.question}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optText = q[`option${opt}`];
              if (!optText) return null;
              const isSelected = answers[q.id] === opt;
              return (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: submitted ? 'default' : 'pointer',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    background: isSelected ? '#EDE7F6' : 'transparent',
                    border: isSelected ? '1px solid #8B5FBF' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!submitted && !isSelected) e.currentTarget.style.background = '#F8F7FA'; }}
                  onMouseLeave={(e) => { if (!submitted && !isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    checked={isSelected}
                    onChange={() => handleAnswer(q.id, opt)}
                    disabled={submitted}
                    style={{ accentColor: '#8B5FBF', width: '20px', height: '20px', cursor: submitted ? 'default' : 'pointer' }}
                  />
                  <span style={{ fontSize: '16px' }}>
                    <strong style={{ color: '#64748b', marginRight: '8px' }}>{opt}.</strong>
                    {optText}
                  </span>
                </label>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <div style={{
              marginTop: '16px',
              padding: '16px 20px',
              background: answers[q.id] === q.correctAnswer ? '#DFF3E8' : '#FDE8E8',
              borderRadius: '12px',
              fontSize: '15px',
              color: answers[q.id] === q.correctAnswer ? '#1E7A4C' : '#DC3545',
            }}>
              <strong>{answers[q.id] === q.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}</strong>
              <div style={{ marginTop: '4px', color: '#4A4458' }}>{q.explanation}</div>
            </div>
          )}
        </div>
      ))}

      {submitted && score && (
        <div style={{
          marginTop: '10px',
          padding: '28px',
          background: score.correct === score.total ? '#DFF3E8' : '#FDE8E8',
          borderRadius: '18px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>
            {score.correct === score.total ? '🎉' : '📊'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: score.correct === score.total ? '#2E9B6C' : '#DC3545' }}>
            {score.correct} / {score.total}
          </div>
          <div style={{ fontSize: '16px', color: '#64748b', marginTop: '8px' }}>
            {Math.round((score.correct / score.total) * 100)}% correct
          </div>
          <div style={{ fontSize: '15px', color: '#64748b', marginTop: '12px' }}>
            {score.correct === score.total ? '🌟 Perfect score! Excellent work!' :
             score.correct >= score.total * 0.7 ? '💪 Good job! Keep practicing!' :
             '📚 Keep studying and try again!'}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LabsTab with progress ────────────────────────────────────────────
function LabsTab({ labs }) {
  const [completed, setCompleted] = useState({});
  const [activeLab, setActiveLab] = useState(null);

  if (!labs || labs.length === 0) return <div className="empty-state">🧪 No lab exercises.</div>;

  const markComplete = (labId) => setCompleted((prev) => ({ ...prev, [labId]: true }));

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalLabs = labs.length;
  const progress = totalLabs > 0 ? Math.round((completedCount / totalLabs) * 100) : 0;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        background: '#f8fafc',
        borderRadius: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
          🧪 Lab Progress
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '160px', height: '10px', background: '#E7E3EE', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#10B981', borderRadius: '5px', transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
            {completedCount}/{totalLabs}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {labs.map((lab, idx) => {
          const isCompleted = completed[lab.id];
          const isActive = activeLab === lab.id;
          return (
            <div
              key={lab.id}
              style={{
                background: '#fff',
                borderRadius: '20px',
                border: isCompleted ? '1px solid #10B981' : '1px solid #E7E3EE',
                padding: '28px',
                transition: 'all 0.2s',
                boxShadow: isCompleted ? '0 4px 20px rgba(16,185,129,0.1)' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => setActiveLab(isActive ? null : lab.id)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isActive ? '18px' : '0',
                flexWrap: 'wrap',
                gap: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: isCompleted ? '#DFF3E8' : '#f1f5f9',
                    fontSize: '20px',
                  }}>
                    {isCompleted ? '✅' : '🧪'}
                  </span>
                  <strong style={{ fontSize: '18px', color: '#1E1B24' }}>
                    {idx + 1}. {lab.title}
                  </strong>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    transition: 'transform 0.2s',
                    transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>
                    {isActive ? '▲' : '▼'}
                  </span>
                  {!isCompleted && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markComplete(lab.id);
                      }}
                      style={{
                        padding: '10px 24px',
                        background: '#10B981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#0EA37A'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
                    >
                      ✓ Mark Complete
                    </button>
                  )}
                  {isCompleted && (
                    <span style={{ fontSize: '15px', color: '#10B981', fontWeight: 700 }}>
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
              {isActive && (
                <div style={{
                  fontSize: '16px',
                  color: '#4A4458',
                  lineHeight: '1.9',
                  whiteSpace: 'pre-wrap',
                  paddingLeft: '4px',
                  paddingTop: '18px',
                  borderTop: '1px solid #E7E3EE',
                  marginTop: '18px',
                  animation: 'fadeIn 0.3s ease-out',
                }}>
                  {lab.instructions}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main CourseDetailView ────────────────────────────────────────────
export default function CourseDetailView({
  selectedCourse,
  topics,
  subtopics,
  images,
  progress,
  activeView,
  activeSection,
  completedSections,
  currentSubtopic,
  contentLoading,
  handleBack,
  setActiveView,
  setActiveSection,
  setCurrentSubtopic,
  loadSubtopicImages,
  resetProgress,
  markSectionComplete,
  getImageSrc,
  getImageUrl,
  handleImageError,
}) {
  const [expandedTopics, setExpandedTopics] = useState(() => {
    const t = topics.find((tp) => (tp.subtopics || []).some((s, i) => true));
    return t ? { [t.id]: true } : {};
  });
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeContentType, setActiveContentType] = useState('video');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lastVisited, setLastVisited] = useState(null);

  const currentSub = subtopics[activeSection];
  const isCompleted = completedSections.includes(activeSection);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(false);
      if (window.innerWidth < 1024 && !mobile) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && showSidebar) {
      const handleClickOutside = (e) => {
        const sidebar = document.getElementById('mobile-sidebar');
        const menuBtn = document.getElementById('menu-btn');
        if (sidebar && !sidebar.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
          setShowSidebar(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, showSidebar]);

  // Track last visited section
  useEffect(() => {
    if (currentSub) {
      setLastVisited({
        id: currentSub.id,
        title: currentSub.title,
        timestamp: new Date().toLocaleString()
      });
    }
  }, [currentSub]);

  const videoUrls = Array.isArray(currentSub?.videoUrls)
    ? currentSub.videoUrls
    : (currentSub?.videoUrl ? [currentSub.videoUrl] : []);

  const currentTopic = topics.find((t) =>
    (t.subtopics || []).some((s) => String(s.id) === String(currentSub?.id))
  );

  const fetchSubtopicData = useCallback(async (subtopicId) => {
    if (!subtopicId) return;
    setLoadingData(true);
    try {
      const [questions, exams, labList] = await Promise.all([
        getSubtopicInterviewQuestions(subtopicId).catch(() => []),
        getSubtopicExamQuestions(subtopicId).catch(() => []),
        getSubtopicLabs(subtopicId).catch(() => []),
      ]);
      setInterviewQuestions(questions);
      setExamQuestions(exams);
      setLabs(labList);
    } catch (err) {
      console.error('Failed to load subtopic data', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (currentSub?.id) fetchSubtopicData(currentSub.id);
  }, [currentSub, fetchSubtopicData]);

  useEffect(() => {
    if (currentTopic) {
      setExpandedTopics((prev) => (prev[currentTopic.id] ? prev : { ...prev, [currentTopic.id]: true }));
    }
  }, [currentTopic]);

  function availableTypesFor(sub, vUrls, interviewQs, examQs, labList) {
    const out = [];
    if (vUrls.length > 0) out.push('video');
    if (sub?.content) out.push('notes');
    if (interviewQs.length > 0) out.push('interview');
    if (examQs.length > 0) out.push('exam');
    if (labList.length > 0) out.push('labs');
    return out;
  }

  const availableTypes = availableTypesFor(currentSub, videoUrls, interviewQuestions, examQuestions, labs);

  useEffect(() => {
    if (loadingData) return;
    if (availableTypes.length > 0 && !availableTypes.includes(activeContentType)) {
      setActiveContentType(availableTypes[0]);
    }
  }, [loadingData, currentSub]);

  const toggleTopic = (topicId) => setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));

  const selectSubtopic = async (sub, globalIndex) => {
    setActiveSection(globalIndex);
    setCurrentSubtopic(sub);
    await loadSubtopicImages(sub.id);
    if (isMobile) setShowSidebar(false);
  };

  const filteredTopics = searchQuery
    ? topics.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (topic.subtopics || []).some(sub =>
          sub.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : topics;

  if (contentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading course content…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const buildImageUrl = (subId, fileName) => `${API_BASE}/subtopic-images/${subId}/${fileName}`;

  const styles = {
    page: { background: C.canvas, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
    topStrip: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '12px 16px' : '16px 32px',
      background: C.paper,
      borderBottom: '1px solid #E7E3EE',
      flexWrap: 'wrap',
      gap: '8px',
    },
    courseName: { fontSize: isMobile ? '14px' : '16px', fontWeight: 800, color: C.ink, letterSpacing: '-0.3px' },
    topStripRight: { display: 'flex', alignItems: 'center', gap: '12px' },
    backBtn: {
      background: 'transparent',
      border: '1px solid #D8D4E0',
      padding: isMobile ? '6px 14px' : '8px 18px',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: 600,
      color: C.slate,
      transition: 'all 0.2s',
    },
    menuBtn: {
      background: 'transparent',
      border: '1px solid #D8D4E0',
      padding: isMobile ? '6px 12px' : '8px 16px',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: isMobile ? '18px' : '16px',
      color: C.slate,
      display: isMobile ? 'block' : 'none',
    },
    shell: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : (isSidebarCollapsed ? '0px 1fr' : '340px 1fr'),
      minHeight: 'calc(100vh - 60px)',
    },
    mobileOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 999,
      display: isMobile && showSidebar ? 'block' : 'none',
    },
    sidebar: {
      background: C.sidebarBg,
      color: C.sidebarText,
      padding: '20px 0',
      overflowY: 'auto',
      maxHeight: isMobile ? '100vh' : 'calc(100vh - 60px)',
      position: isMobile ? 'fixed' : 'sticky',
      top: isMobile ? '0' : '60px',
      left: isMobile ? '-100%' : 'auto',
      width: isMobile ? '320px' : '340px',
      height: isMobile ? '100vh' : 'auto',
      zIndex: 1000,
      transition: isMobile ? 'left 0.3s ease-in-out' : 'none',
      boxShadow: isMobile ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
    },
    sidebarOpen: {
      left: '0',
    },
    sidebarCloseBtn: {
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px 12px',
      borderBottom: `1px solid ${C.sidebarLine}`,
      marginBottom: '8px',
    },
    sidebarCourseTitle: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: 800,
      color: '#fff',
      padding: isMobile ? '0' : '0 20px 18px',
      borderBottom: isMobile ? 'none' : `1px solid ${C.sidebarLine}`,
      marginBottom: isMobile ? '0' : '10px',
    },
    topicHeader: (isOpen) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '12px 20px' : '13px 20px',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: 700,
      color: isOpen ? '#fff' : C.sidebarText,
      background: isOpen ? C.sidebarBgAlt : 'transparent',
      transition: 'all 0.2s',
    }),
    topicChevron: { fontSize: '12px', color: C.sidebarTextDim, transition: 'transform 0.2s' },
    subtopicRow: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: isMobile ? '10px 20px 10px 28px' : '11px 20px 11px 32px',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: isActive ? 700 : 500,
      color: isActive ? '#fff' : C.sidebarText,
      background: isActive ? C.sidebarActive : 'transparent',
      borderLeft: isActive ? `4px solid ${C.accent}` : '4px solid transparent',
      transition: 'all 0.2s',
    }),
    subtopicIcon: (hasVideo) => ({
      width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
      background: hasVideo ? C.accent : '#3A3648', color: '#fff',
    }),
    leafList: { display: 'flex', flexDirection: 'column' },
    leafRow: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: isMobile ? '8px 20px 8px 48px' : '9px 20px 9px 56px',
      cursor: 'pointer',
      fontSize: isMobile ? '11px' : '12px',
      fontWeight: isActive ? 700 : 500,
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      color: isActive ? C.gold : C.sidebarTextDim,
      background: isActive ? 'rgba(232,184,75,0.1)' : 'transparent',
      transition: 'all 0.2s',
    }),
    leafLoading: {
      padding: isMobile ? '8px 20px 8px 48px' : '9px 20px 9px 56px',
      fontSize: isMobile ? '11px' : '12px',
      color: C.sidebarTextDim,
      fontStyle: 'italic',
    },
    main: {
      padding: isMobile ? '16px' : '32px 36px',
      maxWidth: '1020px',
      margin: '0 auto',
      width: '100%',
    },
    progressRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: isMobile ? '16px' : '20px',
    },
    progressBarOuter: { flex: 1, background: '#E7E3EE', borderRadius: '20px', height: '8px', overflow: 'hidden' },
    progressBarInner: { background: C.accent, height: '100%', width: `${progress}%`, transition: 'width 0.6s ease' },
    progressPct: { fontSize: isMobile ? '12px' : '13px', fontWeight: 700, color: C.slate, whiteSpace: 'nowrap' },
    playerFrame: {
      borderRadius: isMobile ? '16px' : '20px',
      overflow: 'hidden',
      background: `linear-gradient(160deg, ${C.playerHeaderFrom}, ${C.playerHeaderTo})`,
      boxShadow: '0 24px 48px -20px rgba(46,31,53,0.5)',
    },
    playerHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '16px 18px' : '18px 24px',
      color: '#fff',
      flexWrap: 'wrap',
      gap: '8px',
    },
    playerHeaderLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
    playerHeaderIcon: {
      width: isMobile ? '32px' : '36px',
      height: isMobile ? '32px' : '36px',
      borderRadius: '10px',
      background: 'rgba(255,255,255,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '16px' : '18px',
    },
    playerHeaderTitle: { fontSize: isMobile ? '15px' : '17px', fontWeight: 700 },
    playerHeaderSubtitle: { fontSize: isMobile ? '12px' : '13px', opacity: 0.7, marginTop: '2px' },
    playerHeaderIcons: { display: 'flex', gap: '16px', fontSize: '16px', opacity: 0.8, alignItems: 'center' },
    playerBody: {
      background: C.paper,
      padding: isMobile ? '18px' : '28px 32px',
      minHeight: isMobile ? '280px' : '340px',
    },
    breadcrumb: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '8px',
      fontSize: isMobile ? '12px' : '14px',
      color: '#A79FBC',
      marginBottom: isMobile ? '4px' : '6px',
    },
    breadcrumbSep: { color: '#5A5468' },
    completeButton: {
      background: '#2E9B6C',
      color: 'white',
      border: 'none',
      padding: isMobile ? '12px 24px' : '14px 28px',
      borderRadius: '40px',
      fontSize: isMobile ? '14px' : '15px',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '24px',
      width: '100%',
      transition: 'all 0.2s',
    },
    completedBadge: {
      fontSize: isMobile ? '11px' : '13px',
      background: '#DFF3E8',
      color: '#1E7A4C',
      padding: '5px 12px',
      borderRadius: '40px',
      whiteSpace: 'nowrap',
      fontWeight: 700,
    },
    emptyState: {
      textAlign: 'center',
      padding: isMobile ? '40px 20px' : '60px 24px',
      color: '#A79FBC',
      fontSize: isMobile ? '15px' : '17px',
    },
    sidebarToggle: {
      position: 'fixed',
      left: isSidebarCollapsed ? '12px' : '352px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 100,
      background: C.paper,
      border: '1px solid #E7E3EE',
      borderRadius: '30px',
      padding: '10px 8px',
      cursor: 'pointer',
      fontSize: '18px',
      color: C.slate,
      transition: 'left 0.3s ease',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      display: isMobile || !isSidebarCollapsed ? 'none' : 'block',
    },
  };

  const typeMeta = CONTENT_TYPES.find((t) => t.key === activeContentType) || CONTENT_TYPES[0];

  const renderPanelContent = () => {
    if (!currentSub) return <div style={styles.emptyState}>Select a section from the sidebar to begin</div>;
    if (loadingData) return <div style={{ textAlign: 'center', padding: '40px', color: C.slate, fontSize: '15px' }}>Loading content…</div>;
    if (availableTypes.length === 0) return <div style={styles.emptyState}>No content has been added for this section yet.</div>;

    switch (activeContentType) {
      case 'video': return <VideoTab videoUrls={videoUrls} />;
      case 'notes': return <NotesTab content={currentSub.content} />;
      case 'interview': return <InterviewTab questions={interviewQuestions} />;
      case 'exam': return <ExamTab questions={examQuestions} onScoreUpdate={() => {}} />;
      case 'labs': return <LabsTab labs={labs} />;
      default: return null;
    }
  };

  return (
    <div style={styles.page}>
      <style>{NOTE_STYLES}</style>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div id="cdv-scroll-anchor" />
      <div style={styles.topStrip}>
        <div style={styles.courseName}>{selectedCourse.title}</div>
        <div style={styles.topStripRight}>
          <button id="menu-btn" style={styles.menuBtn} onClick={() => setShowSidebar(!showSidebar)}>
            ☰
          </button>
          <button style={styles.backBtn} onClick={handleBack}>← Back</button>
        </div>
      </div>

      {activeView === 'split' && (
        <>
          {isMobile && showSidebar && (
            <div style={styles.mobileOverlay} onClick={() => setShowSidebar(false)} />
          )}

          {!isMobile && isSidebarCollapsed && (
            <button
              style={styles.sidebarToggle}
              onClick={() => setIsSidebarCollapsed(false)}
              title="Show sidebar"
            >
              ▶
            </button>
          )}

          <div style={styles.shell}>
            {(!isSidebarCollapsed || isMobile) && (
              <aside
                id="mobile-sidebar"
                style={{
                  ...styles.sidebar,
                  ...(isMobile && showSidebar ? styles.sidebarOpen : {}),
                }}
              >
                {isMobile && (
                  <div style={styles.sidebarCloseBtn}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{selectedCourse.title}</span>
                    <button
                      onClick={() => setShowSidebar(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: C.sidebarText,
                        fontSize: '22px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                {!isMobile && (
                  <div style={{ padding: '0 20px 18px', borderBottom: `1px solid ${C.sidebarLine}` }}>
                    <div style={styles.sidebarCourseTitle}>{selectedCourse.title}</div>
                  </div>
                )}

                <div style={{ padding: '12px 16px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${C.sidebarLine}`,
                      background: C.sidebarBgAlt,
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.accent}
                    onBlur={(e) => e.target.style.borderColor = C.sidebarLine}
                  />
                </div>

                <div>
                  {filteredTopics.map((topic) => {
                    const topicSubs = topic.subtopics || [];
                    const isTopicOpen = !!expandedTopics[topic.id];
                    return (
                      <div key={topic.id} style={{ borderBottom: `1px solid ${C.sidebarLine}` }}>
                        <div style={styles.topicHeader(isTopicOpen)} onClick={() => toggleTopic(topic.id)}>
                          <span>{topic.title}</span>
                          <span style={{ ...styles.topicChevron, transform: isTopicOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▸</span>
                        </div>

                        {isTopicOpen && (
                          <div>
                            {topicSubs.map((sub) => {
                              const globalIndex = subtopics.findIndex((s) => String(s.id) === String(sub.id));
                              if (globalIndex === -1) return null;
                              const isActiveSub = activeSection === globalIndex;
                              const hasVideo = Array.isArray(sub.videoUrls) ? sub.videoUrls.length > 0 : !!sub.videoUrl;
                              const isSecCompleted = completedSections.includes(globalIndex);

                              return (
                                <div key={sub.id}>
                                  <div style={styles.subtopicRow(isActiveSub)} onClick={() => selectSubtopic(sub, globalIndex)}>
                                    <span style={styles.subtopicIcon(hasVideo)}>{hasVideo ? '▶' : '●'}</span>
                                    <span style={{ flex: 1 }}>{sub.title}</span>
                                    {isSecCompleted && <span style={{ fontSize: '11px', color: '#3FBF7F' }}>✓</span>}
                                  </div>

                                  {isActiveSub && (
                                    <div style={styles.leafList}>
                                      {loadingData ? (
                                        <div style={styles.leafLoading}>Loading contents…</div>
                                      ) : (
                                        CONTENT_TYPES.filter((t) => availableTypes.includes(t.key)).map((t) => (
                                          <div
                                            key={t.key}
                                            style={styles.leafRow(activeContentType === t.key)}
                                            onClick={() => setActiveContentType(t.key)}
                                          >
                                            <span>{t.icon}</span>
                                            <span>{t.label}</span>
                                          </div>
                                        ))
                                      )}
                                      {!loadingData && availableTypes.length === 0 && (
                                        <div style={styles.leafLoading}>No content yet</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredTopics.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: C.sidebarTextDim, fontSize: '14px' }}>
                      No topics match your search.
                    </div>
                  )}
                </div>
              </aside>
            )}

            <main style={styles.main}>
              <div style={styles.progressRow}>
                <div style={styles.progressBarOuter}>
                  <div style={styles.progressBarInner} />
                </div>
                <span style={styles.progressPct}>{Math.round(progress)}% complete</span>
                <ProgressRing progress={progress} size={40} strokeWidth={4} />
              </div>

              {currentSub && (
                <div style={styles.breadcrumb}>
                  <span>{selectedCourse.title}</span>
                  {currentTopic && (<><span style={styles.breadcrumbSep}>›</span><span>{currentTopic.title}</span></>)}
                  <span style={styles.breadcrumbSep}>›</span>
                  <span style={{ color: C.slate, fontWeight: 600 }}>{currentSub.title}</span>
                </div>
              )}

              <div style={styles.playerFrame}>
                <div style={styles.playerHeader}>
                  <div style={styles.playerHeaderLeft}>
                    <div style={styles.playerHeaderIcon}>{typeMeta.icon}</div>
                    <div>
                      <div style={styles.playerHeaderTitle}>{currentSub ? currentSub.title : 'Select a section'}</div>
                      {currentSub && <div style={styles.playerHeaderSubtitle}>{typeMeta.label}{currentTopic ? ` · ${currentTopic.title}` : ''}</div>}
                    </div>
                  </div>
                  <div style={styles.playerHeaderIcons}>
                    {isCompleted && <span style={styles.completedBadge}>✅ Done</span>}
                    <span>⚙</span>
                  </div>
                </div>
                <div style={styles.playerBody} className="fade-in">
                  {renderPanelContent()}
                </div>
              </div>

              {currentSub && (
                <button
                  style={{
                    ...styles.completeButton,
                    opacity: isCompleted ? 0.6 : 1,
                    cursor: isCompleted ? 'default' : 'pointer',
                  }}
                  onClick={() => markSectionComplete(activeSection)}
                  disabled={isCompleted}
                  onMouseEnter={(e) => { if (!isCompleted) e.currentTarget.style.background = '#268A5E'; }}
                  onMouseLeave={(e) => { if (!isCompleted) e.currentTarget.style.background = '#2E9B6C'; }}
                >
                  {isCompleted ? '✓ Section Completed' : '✓ Mark Complete'}
                </button>
              )}
            </main>
          </div>
        </>
      )}

      {activeView === 'gallery' && (
        <div style={{ background: '#fff', borderRadius: '24px', padding: isMobile ? '16px' : '28px', margin: isMobile ? '16px' : '28px 36px' }}>
          <h2 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 700, marginBottom: '28px' }}>📸 All Course Images ({images.length})</h2>
          {images.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '16px' }}>No images yet</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(150px, 1fr))' : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: isMobile ? '14px' : '24px',
            }}>
              {images.map((img) => {
                const safeId = img.subTopicId || img.subtopicId;
                if (!safeId) return null;
                const imageUrl = buildImageUrl(safeId, img.fileName);
                return (
                  <div
                    key={img.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    onClick={() => window.open(imageUrl, '_blank')}
                  >
                    <img
                      src={imageUrl}
                      alt={`Page ${img.pageNumber}`}
                      style={{ width: '100%', height: isMobile ? '140px' : '190px', objectFit: 'cover' }}
                      onError={() => handleImageError(img.id)}
                      loading="lazy"
                    />
                    <div style={{ padding: '12px 16px', fontSize: isMobile ? '12px' : '13px', textAlign: 'center', background: '#f8fafc', color: '#64748b', fontWeight: 500 }}>
                      Page {img.pageNumber} · {img.width}×{img.height}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}