// src/components/CourseDetailView.jsx
// Enhanced Odoo-style learning UI - Clean, minimal, no progress bar or complete button

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSubtopicInterviewQuestions,
  getSubtopicExamQuestions,
  getSubtopicLabs,
} from '../api/UserApi';

// ✅ Fixed: Use environment variable with /api
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

// ✅ Helper: Clean image path (remove duplicate /api)
const cleanImagePath = (path) => {
  if (!path) return path;
  let cleanPath = path;
  // Remove duplicate /api prefix
  while (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4);
  }
  while (cleanPath.startsWith('api/')) {
    cleanPath = cleanPath.substring(4);
  }
  // Ensure it starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  return cleanPath;
};

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
  
  if (url.includes('watch?v=') && url.includes('&list=')) {
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      const listMatch = url.match(/[?&]list=([^&]+)/);
      if (listMatch && listMatch[1]) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}?list=${listMatch[1]}`;
      }
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
  }
  
  if (url.includes('watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  if (url.includes('vimeo.com/')) {
    return url.replace('vimeo.com/', 'player.vimeo.com/video/');
  }
  return url;
};

const getVideoUrls = (subtopic) => {
  if (!subtopic) return [];
  if (subtopic.videoUrls && Array.isArray(subtopic.videoUrls) && subtopic.videoUrls.length > 0) {
    return subtopic.videoUrls;
  }
  if (subtopic.videoUrl && subtopic.videoUrl.trim() !== '') {
    return [subtopic.videoUrl];
  }
  return [];
};

const fetchImageWithAuth = async (url) => {
  try {
    const token = localStorage.getItem('token');
    // Clean the URL first
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    const response = await fetch(cleanUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch image');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

const buildImgSrc = (src) => {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  
  let url;
  // Remove /api prefix from src if it exists since API_BASE already has it
  let cleanSrc = src;
  if (cleanSrc.startsWith('/api/')) {
    cleanSrc = cleanSrc.substring(4);
  }
  if (cleanSrc.startsWith('api/')) {
    cleanSrc = cleanSrc.substring(4);
  }
  if (!cleanSrc.startsWith('/')) {
    cleanSrc = '/' + cleanSrc;
  }
  
  url = `${API_BASE}${cleanSrc}`;
  // Remove duplicate slashes
  url = url.replace(/([^:]\/)\/+/g, "$1");
  
  return url;
};
// ✅ Updated: Build image tag with authenticated src
const buildImageTag = (alt, src) => {
  const imgSrc = buildImgSrc(src);
  return `<img src="${imgSrc}" alt="${alt}" class="note-image" loading="lazy" style="max-width:100%;border-radius:14px;margin:24px 0;box-shadow:0 6px 24px rgba(0,0,0,0.1);display:block;height:auto;" />`;
};

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

const NOTE_STYLES = `
  /* Prevent text selection and copying */
  .notes-content, 
  .notes-content *,
  .player-body,
  .player-body *,
  .empty-state,
  .empty-state * {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }
  
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

  .fade-in { animation: fadeIn 0.6s ease-out; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Prevent page swipe on mobile */
  body {
    overscroll-behavior: none;
    touch-action: pan-y;
  }
  
  .notes-content {
    overscroll-behavior: contain;
    touch-action: pan-y;
  }
  
  .player-body {
    overscroll-behavior: contain;
    touch-action: pan-y;
  }
  
  .notes-content::-webkit-scrollbar,
  .player-body::-webkit-scrollbar {
    width: 6px;
  }
  
  .notes-content::-webkit-scrollbar-track,
  .player-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .notes-content::-webkit-scrollbar-thumb,
  .player-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  .notes-content::-webkit-scrollbar-thumb:hover,
  .player-body::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
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

// ─── NotesTab ──────────────────────────────────────────────────────────
// Clean, continuous scrolling with mobile-friendly design
function NotesTab({ content }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check for mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!content) {
    return <div className="empty-state" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>📝 No notes for this section.</div>;
  }

  const html = renderRichContent(content);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div
        ref={containerRef}
        className="notes-content fade-in"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          padding: isMobile ? '20px 16px 80px 16px' : '32px 36px 100px 36px',
          maxHeight: isMobile ? '55vh' : '65vh',
          minHeight: isMobile ? '200px' : '300px',
          overflowY: 'auto',
          overflowX: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          background: '#fff',
          borderRadius: isMobile ? '12px' : '14px',
          border: '1px solid #EEECF3',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          fontSize: isMobile ? '15px' : '18px',
          lineHeight: isMobile ? '1.9' : '2.0',
          transition: 'all 0.3s ease',
        }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        onSelect={(e) => e.preventDefault()}
      />

      <style>{`
        .notes-content {
          transition: all 0.3s ease;
        }
        /* Mobile touch improvements */
        @media (max-width: 768px) {
          .notes-content {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
}

// ─── VideoTab ──────────────────────────────────────────────────────────
function VideoTab({ videoUrls }) {
  const [currentVideo, setCurrentVideo] = useState(0);
  const urls = Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : []);

  if (urls.length === 0) return <div className="empty-state" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>🎬 No video for this section.</div>;

  const currentUrl = urls[currentVideo];
  const embed = getEmbedUrl(currentUrl);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {urls.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '4px',
        }}>
          {urls.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentVideo(idx)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: idx === currentVideo ? '2px solid #8B5FBF' : '1px solid #E7E3EE',
                background: idx === currentVideo ? '#EDE7F6' : '#fff',
                color: idx === currentVideo ? '#8B5FBF' : '#6B6478',
                fontWeight: idx === currentVideo ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              🎬 Video {idx + 1}
            </button>
          ))}
        </div>
      )}

      {embed && (
        <div style={{ 
          position: 'relative', 
          paddingBottom: '56.25%', 
          height: 0, 
          overflow: 'hidden', 
          borderRadius: '14px', 
          background: '#000', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)' 
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

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '13px',
        color: '#94a3b8',
        padding: '4px 0',
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

// ─── InterviewTab ──────────────────────────────────────────────────────
function InterviewTab({ questions }) {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  if (!questions || questions.length === 0) return <div className="empty-state" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>🎤 No interview questions.</div>;

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
    <div style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #E7E3EE',
              fontSize: '15px',
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
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1px solid #E7E3EE',
            background: '#fff',
            fontSize: '13px',
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
            padding: '10px 20px',
            borderRadius: '12px',
            border: '1px solid #E7E3EE',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            color: '#6B6478',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {filteredQuestions.every(q => expanded[q.id]) ? 'Collapse All' : 'Expand All'}
        </button>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          {filteredQuestions.length} of {questions.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            style={{
              background: '#fff',
              borderRadius: '14px',
              border: '1px solid #E7E3EE',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s',
              boxShadow: expanded[q.id] ? '0 4px 16px rgba(139,95,191,0.08)' : 'none',
            }}
          >
            <div
              onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: expanded[q.id] ? '#FAF9FC' : '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#1E1B24',
                transition: 'background 0.2s',
                fontSize: '15px',
              }}
              onMouseEnter={(e) => { if (!expanded[q.id]) e.currentTarget.style.background = '#F8F7FA'; }}
              onMouseLeave={(e) => { if (!expanded[q.id]) e.currentTarget.style.background = '#fff'; }}
            >
              <span>
                <span style={{ color: '#94a3b8', fontWeight: 400, marginRight: '10px' }}>{idx + 1}.</span>
                {q.question}
              </span>
              <span style={{
                fontSize: '20px',
                color: '#8B7FA0',
                transition: 'transform 0.2s',
                transform: expanded[q.id] ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>
                ▼
              </span>
            </div>
            {expanded[q.id] && (
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid #E7E3EE',
                background: '#fff',
                color: '#3A3548',
                lineHeight: '1.8',
                fontSize: '15px',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}>
                {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '15px' }}>
          No questions match your search.
        </div>
      )}
    </div>
  );
}

// ─── ExamTab ──────────────────────────────────────────────────────────
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

  if (!hasQuestions) return <div className="empty-state" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>📝 No MCQ questions.</div>;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (qId, answer) => setAnswers((prev) => ({ ...prev, [qId]: answer }));

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  return (
    <div style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        background: '#f8fafc',
        borderRadius: '14px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            📝 MCQ Quiz
          </span>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{
            fontSize: '16px',
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
                padding: '10px 24px',
                background: '#8B5FBF',
                color: '#fff',
                border: 'none',
                borderRadius: '24px',
                fontWeight: 600,
                fontSize: '14px',
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
          padding: '24px',
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #E7E3EE',
          marginBottom: '14px',
          transition: 'border-color 0.2s',
          borderColor: answers[q.id] ? '#8B5FBF' : '#E7E3EE',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '16px', fontSize: '16px', color: '#1E1B24' }}>
            <span style={{ color: '#94a3b8', fontWeight: 400, marginRight: '10px' }}>{idx + 1}.</span>
            {q.question}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                    gap: '14px',
                    cursor: submitted ? 'default' : 'pointer',
                    padding: '12px 18px',
                    borderRadius: '12px',
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
                    style={{ accentColor: '#8B5FBF', width: '18px', height: '18px', cursor: submitted ? 'default' : 'pointer' }}
                  />
                  <span style={{ fontSize: '15px' }}>
                    <strong style={{ color: '#64748b', marginRight: '6px' }}>{opt}.</strong>
                    {optText}
                  </span>
                </label>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <div style={{
              marginTop: '14px',
              padding: '14px 18px',
              background: answers[q.id] === q.correctAnswer ? '#DFF3E8' : '#FDE8E8',
              borderRadius: '10px',
              fontSize: '14px',
              color: answers[q.id] === q.correctAnswer ? '#1E7A4C' : '#DC3545',
            }}>
              <strong>{answers[q.id] === q.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}</strong>
              <div style={{ marginTop: '2px', color: '#4A4458' }}>{q.explanation}</div>
            </div>
          )}
        </div>
      ))}

      {submitted && score && (
        <div style={{
          marginTop: '8px',
          padding: '24px',
          background: score.correct === score.total ? '#DFF3E8' : '#FDE8E8',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '6px' }}>
            {score.correct === score.total ? '🎉' : '📊'}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: score.correct === score.total ? '#2E9B6C' : '#DC3545' }}>
            {score.correct} / {score.total}
          </div>
          <div style={{ fontSize: '15px', color: '#64748b', marginTop: '6px' }}>
            {Math.round((score.correct / score.total) * 100)}% correct
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LabsTab ──────────────────────────────────────────────────────────
function LabsTab({ labs }) {
  const [completed, setCompleted] = useState({});
  const [activeLab, setActiveLab] = useState(null);

  if (!labs || labs.length === 0) return <div className="empty-state" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>🧪 No lab exercises.</div>;

  const markComplete = (labId) => setCompleted((prev) => ({ ...prev, [labId]: true }));

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalLabs = labs.length;
  const progress = totalLabs > 0 ? Math.round((completedCount / totalLabs) * 100) : 0;

  return (
    <div style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        background: '#f8fafc',
        borderRadius: '14px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
          🧪 Lab Progress
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '140px', height: '8px', background: '#E7E3EE', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#10B981', borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            {completedCount}/{totalLabs}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {labs.map((lab, idx) => {
          const isCompleted = completed[lab.id];
          const isActive = activeLab === lab.id;
          return (
            <div
              key={lab.id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: isCompleted ? '1px solid #10B981' : '1px solid #E7E3EE',
                padding: '24px',
                transition: 'all 0.2s',
                boxShadow: isCompleted ? '0 4px 16px rgba(16,185,129,0.08)' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => setActiveLab(isActive ? null : lab.id)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isActive ? '14px' : '0',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isCompleted ? '#DFF3E8' : '#f1f5f9',
                    fontSize: '18px',
                  }}>
                    {isCompleted ? '✅' : '🧪'}
                  </span>
                  <strong style={{ fontSize: '16px', color: '#1E1B24' }}>
                    {idx + 1}. {lab.title}
                  </strong>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '12px',
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
                        padding: '8px 20px',
                        background: '#10B981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '24px',
                        fontSize: '13px',
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
                    <span style={{ fontSize: '14px', color: '#10B981', fontWeight: 700 }}>
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
              {isActive && (
                <div style={{
                  fontSize: '15px',
                  color: '#4A4458',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                  paddingLeft: '4px',
                  paddingTop: '14px',
                  borderTop: '1px solid #E7E3EE',
                  marginTop: '14px',
                  animation: 'fadeIn 0.3s ease-out',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
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
  const [activeContentType, setActiveContentType] = useState('notes');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // ✅ State for authenticated image URLs (for gallery)
  const [authImageUrls, setAuthImageUrls] = useState({});

  const currentSub = subtopics[activeSection];
  const isCompleted = completedSections.includes(activeSection);

  // ✅ Global copy protection for mobile
  useEffect(() => {
    const preventLongPress = (e) => {
      if (e.target.closest('.notes-content') || e.target.closest('.player-body')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', preventLongPress);
    document.addEventListener('selectstart', preventLongPress);
    
    return () => {
      document.removeEventListener('contextmenu', preventLongPress);
      document.removeEventListener('selectstart', preventLongPress);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(false);
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

  // ─── HIDE NAVBAR IN COURSE DETAIL VIEW ───────────────────────────────
  useEffect(() => {
    // Hide the navbar when this component mounts
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }
    
    // Also remove any padding that might be on the body
    document.body.style.paddingTop = '0';
    
    // Cleanup: show navbar when component unmounts
    return () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        navbar.style.display = '';
      }
      document.body.style.paddingTop = '';
    };
  }, []);

  // ✅ Load images with authentication
  useEffect(() => {
    const loadImagesWithAuth = async () => {
      const newAuthUrls = {};
      for (const img of images) {
        const safeId = img.subTopicId || img.subtopicId;
        if (!safeId) continue;
        const url = buildImageUrl(safeId, img.fileName);
        const blobUrl = await fetchImageWithAuth(url);
        if (blobUrl) {
          newAuthUrls[img.id] = blobUrl;
        }
      }
      setAuthImageUrls(newAuthUrls);
    };
    
    if (images.length > 0) {
      loadImagesWithAuth();
    }
    
    // Cleanup blob URLs
    return () => {
      Object.values(authImageUrls).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  const videoUrls = getVideoUrls(currentSub);

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

  // ✅ Prefer 'notes' when available
  useEffect(() => {
    if (loadingData) return;
    if (availableTypes.length > 0) {
      const preferredType = availableTypes.includes('notes') ? 'notes' : 
                            availableTypes.includes('video') ? 'video' : 
                            availableTypes[0];
      if (!availableTypes.includes(activeContentType)) {
        setActiveContentType(preferredType);
      }
    }
  }, [loadingData, availableTypes, activeContentType]);

  const toggleTopic = (topicId) => setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));

  const selectSubtopic = async (sub, globalIndex) => {
    setActiveSection(globalIndex);
    setCurrentSubtopic(sub);
    await loadSubtopicImages(sub.id);
    if (isMobile) setShowSidebar(false);
    if (sub?.content) {
      setActiveContentType('notes');
    }
  };

  const filteredTopics = searchQuery
    ? topics.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (topic.subtopics || []).some(sub =>
          sub.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : topics;

  // ✅ Early return
  if (contentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading course content…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ✅ Updated: Build image URL without token in query (token will be in header via fetch)
  const buildImageUrl = (subId, fileName) => {
    const cleanPath = cleanImagePath(`/subtopic-images/${subId}/${fileName}`);
    let url = `${API_BASE}${cleanPath}`;
    // Remove duplicate /api in URL
    url = url.replace(/([^:]\/)\/+/g, "$1");
    return url;
  };

  const isMobileDevice = window.innerWidth < 768;

  const styles = {
    page: { 
      background: C.canvas, 
      minHeight: '100vh', 
      fontFamily: 'Inter, system-ui, sans-serif',
      paddingTop: '0',
    },
    shell: {
      display: 'grid',
      gridTemplateColumns: isMobileDevice ? '1fr' : (isSidebarCollapsed ? '1fr' : '320px 1fr'),
      minHeight: 'calc(100vh)',
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
      display: isMobileDevice && showSidebar ? 'block' : 'none',
    },
    sidebar: {
      background: C.sidebarBg,
      color: C.sidebarText,
      padding: '16px 0',
      overflowY: 'auto',
      maxHeight: isMobileDevice ? '100vh' : 'calc(100vh)',
      position: isMobileDevice ? 'fixed' : 'sticky',
      top: isMobileDevice ? '0' : '0',
      left: isMobileDevice ? '-100%' : 'auto',
      width: isMobileDevice ? '300px' : '320px',
      height: isMobileDevice ? '100vh' : 'auto',
      zIndex: 1000,
      transition: isMobileDevice ? 'left 0.3s ease-in-out' : 'none',
      boxShadow: isMobileDevice ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
      display: isSidebarCollapsed && !isMobileDevice ? 'none' : 'block',
    },
    sidebarOpen: {
      left: '0',
    },
    sidebarCloseBtn: {
      display: isMobileDevice ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px 10px',
      borderBottom: `1px solid ${C.sidebarLine}`,
      marginBottom: '6px',
    },
    sidebarCourseTitle: {
      fontSize: isMobileDevice ? '14px' : '15px',
      fontWeight: 800,
      color: '#fff',
      padding: isMobileDevice ? '0' : '0 18px 14px',
      borderBottom: isMobileDevice ? 'none' : `1px solid ${C.sidebarLine}`,
      marginBottom: isMobileDevice ? '0' : '8px',
    },
    topicHeader: (isOpen) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobileDevice ? '10px 18px' : '11px 18px',
      cursor: 'pointer',
      fontSize: isMobileDevice ? '12px' : '13px',
      fontWeight: 700,
      color: isOpen ? '#fff' : C.sidebarText,
      background: isOpen ? C.sidebarBgAlt : 'transparent',
      transition: 'all 0.2s',
    }),
    topicChevron: { fontSize: '11px', color: C.sidebarTextDim, transition: 'transform 0.2s' },
    subtopicRow: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: isMobileDevice ? '8px 18px 8px 24px' : '9px 18px 9px 28px',
      cursor: 'pointer',
      fontSize: isMobileDevice ? '12px' : '13px',
      fontWeight: isActive ? 700 : 500,
      color: isActive ? '#fff' : C.sidebarText,
      background: isActive ? C.sidebarActive : 'transparent',
      borderLeft: isActive ? `3px solid ${C.accent}` : '3px solid transparent',
      transition: 'all 0.2s',
    }),
    subtopicIcon: (hasVideo) => ({
      width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px',
      background: hasVideo ? C.accent : '#3A3648', color: '#fff',
    }),
    leafList: { display: 'flex', flexDirection: 'column' },
    leafRow: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: isMobileDevice ? '6px 18px 6px 44px' : '7px 18px 7px 52px',
      cursor: 'pointer',
      fontSize: isMobileDevice ? '10px' : '11px',
      fontWeight: isActive ? 700 : 500,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: isActive ? C.gold : C.sidebarTextDim,
      background: isActive ? 'rgba(232,184,75,0.08)' : 'transparent',
      transition: 'all 0.2s',
    }),
    leafLoading: {
      padding: isMobileDevice ? '6px 18px 6px 44px' : '7px 18px 7px 52px',
      fontSize: isMobileDevice ? '10px' : '11px',
      color: C.sidebarTextDim,
      fontStyle: 'italic',
    },
    main: {
      padding: isMobileDevice ? '14px' : '24px 28px',
      maxWidth: '100%',
      margin: '0 auto',
      width: '100%',
      overflowY: 'auto',
      maxHeight: 'calc(100vh)',
      overscrollBehavior: 'contain',
    },
    playerFrame: {
      borderRadius: isMobileDevice ? '14px' : '16px',
      overflow: 'hidden',
      background: `linear-gradient(160deg, ${C.playerHeaderFrom}, ${C.playerHeaderTo})`,
      boxShadow: '0 16px 40px -16px rgba(46,31,53,0.4)',
    },
    playerHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobileDevice ? '14px 16px' : '16px 20px',
      color: '#fff',
      flexWrap: 'wrap',
      gap: '6px',
    },
    playerHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    playerHeaderIcon: {
      width: isMobileDevice ? '28px' : '32px',
      height: isMobileDevice ? '28px' : '32px',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobileDevice ? '14px' : '16px',
    },
    playerHeaderTitle: { fontSize: isMobileDevice ? '14px' : '16px', fontWeight: 700 },
    playerHeaderSubtitle: { fontSize: isMobileDevice ? '11px' : '12px', opacity: 0.7, marginTop: '1px' },
    playerHeaderIcons: { display: 'flex', gap: '12px', fontSize: '14px', opacity: 0.8, alignItems: 'center' },
    playerBody: {
      background: C.paper,
      padding: isMobileDevice ? '16px' : '24px 28px',
      minHeight: isMobileDevice ? '260px' : '320px',
      maxHeight: '70vh',
      overflowY: 'auto',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      overscrollBehavior: 'contain',
      touchAction: 'pan-y',
      scrollBehavior: 'smooth',
      WebkitOverflowScrolling: 'touch',
    },
    breadcrumb: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '6px',
      fontSize: isMobileDevice ? '11px' : '13px',
      color: '#A79FBC',
      marginBottom: isMobileDevice ? '4px' : '6px',
    },
    breadcrumbSep: { color: '#5A5468' },
    completedBadge: {
      fontSize: isMobileDevice ? '10px' : '12px',
      background: '#DFF3E8',
      color: '#1E7A4C',
      padding: '3px 10px',
      borderRadius: '30px',
      whiteSpace: 'nowrap',
      fontWeight: 700,
    },
    emptyState: {
      textAlign: 'center',
      padding: isMobileDevice ? '30px 16px' : '40px 20px',
      color: '#A79FBC',
      fontSize: isMobileDevice ? '14px' : '16px',
    },
  };

  const typeMeta = CONTENT_TYPES.find((t) => t.key === activeContentType) || CONTENT_TYPES[0];

  const renderPanelContent = () => {
    if (!currentSub) return <div style={styles.emptyState}>Select a section from the sidebar to begin</div>;
    if (loadingData) return <div style={{ textAlign: 'center', padding: '30px', color: C.slate, fontSize: '14px' }}>Loading content…</div>;
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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div style={styles.page}>
      <style>{NOTE_STYLES}</style>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
        }
        input, textarea, select {
          -webkit-user-select: auto !important;
          user-select: auto !important;
        }
        .notes-content, .notes-content *,
        .player-body, .player-body * {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          pointer-events: auto !important;
        }
        @media (max-width: 768px) {
          .notes-content {
            font-size: 15px !important;
            padding: 16px 18px !important;
          }
          .notes-content .note-h1 {
            font-size: 24px !important;
          }
          .notes-content .note-h2 {
            font-size: 20px !important;
          }
          .notes-content .note-h3 {
            font-size: 17px !important;
          }
          .notes-content .note-paragraph {
            font-size: 15px !important;
          }
          .notes-content .note-list {
            font-size: 15px !important;
          }
        }
        body {
          overscroll-behavior: none;
          touch-action: pan-y;
        }
      `}</style>
      <div id="cdv-scroll-anchor" />

      {activeView === 'split' && (
        <>
          {isMobile && showSidebar && (
            <div style={styles.mobileOverlay} onClick={() => setShowSidebar(false)} />
          )}

          {/* ─── Sidebar Toggle Button ─────────────────────────────────── */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              style={{
                position: 'fixed',
                left: isSidebarCollapsed ? '10px' : '332px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 100,
                background: C.paper,
                border: '1px solid #E7E3EE',
                borderRadius: '24px',
                padding: '8px 6px',
                cursor: 'pointer',
                fontSize: '16px',
                color: C.slate,
                transition: 'left 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
              {isSidebarCollapsed ? '▶' : '◀'}
            </button>
          )}

          <div style={styles.shell}>
            {/* ─── Sidebar ───────────────────────────────────────────────── */}
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
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{selectedCourse.title}</span>
                    <button
                      onClick={() => setShowSidebar(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: C.sidebarText,
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '2px 6px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                {!isMobile && (
                  <div style={{ padding: '0 18px 14px', borderBottom: `1px solid ${C.sidebarLine}` }}>
                    <div style={styles.sidebarCourseTitle}>{selectedCourse.title}</div>
                  </div>
                )}

                <div style={{ padding: '10px 14px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${C.sidebarLine}`,
                      background: C.sidebarBgAlt,
                      color: '#fff',
                      fontSize: '12px',
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
                              const subVideoUrls = getVideoUrls(sub);
                              const hasVideo = subVideoUrls.length > 0;
                              const isSecCompleted = completedSections.includes(globalIndex);

                              return (
                                <div key={sub.id}>
                                  <div style={styles.subtopicRow(isActiveSub)} onClick={() => selectSubtopic(sub, globalIndex)}>
                                    <span style={styles.subtopicIcon(hasVideo)}>{hasVideo ? '▶' : '●'}</span>
                                    <span style={{ flex: 1 }}>{sub.title}</span>
                                    {isSecCompleted && <span style={{ fontSize: '10px', color: '#3FBF7F' }}>✓</span>}
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
                    <div style={{ padding: '20px', textAlign: 'center', color: C.sidebarTextDim, fontSize: '13px' }}>
                      No topics match your search.
                    </div>
                  )}
                </div>
              </aside>
            )}

            {/* ─── Main Content ─────────────────────────────────────────── */}
            <main style={styles.main}>
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
                    {/* ─── BACK BUTTON ─────────────────────────────────── */}
                    <button
                      onClick={handleBack}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: isMobileDevice ? '6px 12px' : '8px 16px',
                        color: '#fff',
                        fontSize: isMobileDevice ? '12px' : '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginRight: '4px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                      }}
                    >
                      <span style={{ fontSize: isMobileDevice ? '14px' : '16px' }}>←</span>
                      <span>Back</span>
                    </button>

                    <div style={styles.playerHeaderIcon}>{typeMeta.icon}</div>
                    <div>
                      <div style={styles.playerHeaderTitle}>{currentSub ? currentSub.title : 'Select a section'}</div>
                      {currentSub && <div style={styles.playerHeaderSubtitle}>{typeMeta.label}{currentTopic ? ` · ${currentTopic.title}` : ''}</div>}
                    </div>
                  </div>
                  <div style={styles.playerHeaderIcons}>
                    {isCompleted && <span style={styles.completedBadge}>✅ Done</span>}
                  </div>
                </div>
                <div style={styles.playerBody} className="fade-in">
                  {renderPanelContent()}
                </div>
              </div>
            </main>
          </div>
        </>
      )}

      {activeView === 'gallery' && (
        <div style={{ background: '#fff', borderRadius: '20px', padding: isMobile ? '14px' : '24px', margin: isMobile ? '14px' : '24px 28px' }}>
          <h2 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: 700, marginBottom: '24px' }}>📸 All Course Images ({images.length})</h2>
          {images.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '15px' }}>No images yet</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: isMobile ? '12px' : '20px',
            }}>
              {images.map((img) => {
                const safeId = img.subTopicId || img.subtopicId;
                if (!safeId) return null;
                const imageUrl = authImageUrls[img.id] || buildImageUrl(safeId, img.fileName);
                return (
                  <div
                    key={img.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    onClick={() => window.open(imageUrl, '_blank')}
                  >
                    <img
                      src={imageUrl}
                      alt={`Page ${img.pageNumber}`}
                      style={{ width: '100%', height: isMobile ? '120px' : '170px', objectFit: 'cover' }}
                      onError={() => handleImageError(img.id)}
                      loading="lazy"
                    />
                    <div style={{ padding: '10px 14px', fontSize: isMobile ? '11px' : '12px', textAlign: 'center', background: '#f8fafc', color: '#64748b', fontWeight: 500 }}>
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