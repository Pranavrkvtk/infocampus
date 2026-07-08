// src/components/CourseDetailView.jsx
// Odoo-style learning UI - Sidebar + Full Content

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSubtopicInterviewQuestions,
  getSubtopicExamQuestions,
  getSubtopicLabs,
} from '../api/UserApi';

// ─── API Base ──────────────────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

// ─── Design tokens ─────────────────────────────────────────────────────
const C = {
  // Grey sidebar colors
  sidebarBg: '#F1F5F9',
  sidebarBgAlt: '#E8EDF5',
  sidebarLine: '#E2E8F0',
  sidebarText: '#475569',
  sidebarTextDim: '#94A3B8',
  sidebarActive: '#DBEAFE',
  sidebarHover: '#E8EDF5',
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
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    const response = await fetch(cleanUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
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
  let cleanSrc = src;
  if (cleanSrc.startsWith('/api/')) cleanSrc = cleanSrc.substring(4);
  if (cleanSrc.startsWith('api/')) cleanSrc = cleanSrc.substring(4);
  if (!cleanSrc.startsWith('/')) cleanSrc = '/' + cleanSrc;
  let url = `${API_BASE}${cleanSrc}`;
  url = url.replace(/([^:]\/)\/+/g, "$1");
  return url;
};

const buildImageTag = (alt, src) => {
  const imgSrc = buildImgSrc(src);
  return `<img src="${imgSrc}" alt="${alt}" class="note-image" loading="lazy" />`;
};

const inlineFormat = (str) => {
  let out = str;
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => buildImageTag(alt, src));
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => 
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="note-link">${text}</a>`
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code class="note-code">$1</code>');
  return out;
};

// ─── Odoo-style Markdown Renderer ────────────────────────────────────

const renderOdooContent = (text) => {
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

  const processLine = (line) => {
    // Main heading (# Getting Started)
    const mainHeading = line.match(/^#\s+(.+)$/);
    if (mainHeading) {
      closeList();
      html += `<h1 class="odoo-main-heading">${inlineFormat(mainHeading[1])}</h1>`;
      return true;
    }

    // Sub heading (## USING ODOO)
    const subHeading = line.match(/^##\s+(.+)$/);
    if (subHeading) {
      closeList();
      html += `<h2 class="odoo-sub-heading">${inlineFormat(subHeading[1])}</h2>`;
      return true;
    }

    // Numbered question (# 1. Where can...)
    const question = line.match(/^#\s+(\d+)\.\s+(.*)$/);
    if (question) {
      closeList();
      html += `<div class="odoo-question-wrapper">`;
      html += `<div class="odoo-question-number">${question[1]}.</div>`;
      html += `<div class="odoo-question-text">${inlineFormat(question[2])}</div>`;
      html += `</div>`;
      return true;
    }

    // Bold list item (- GETTING STARTED with children)
    const boldListItem = line.match(/^-\s+\*\*(.+)\*\*$/);
    if (boldListItem) {
      closeList();
      html += `<div class="odoo-section-header">${inlineFormat(boldListItem[1])}</div>`;
      return true;
    }

    // Indented list item (  - Create an Odoo Database)
    const indentListItem = line.match(/^\s{2,}-\s+(.+)$/);
    if (indentListItem) {
      if (listType !== 'ul') {
        closeList();
        html += '<ul class="odoo-list">';
        listType = 'ul';
      }
      html += `<li class="odoo-list-item">${inlineFormat(indentListItem[1])}</li>`;
      return true;
    }

    // Regular list item (- something)
    const listItem = line.match(/^-\s+(.+)$/);
    if (listItem) {
      if (listType !== 'ul') {
        closeList();
        html += '<ul class="odoo-list">';
        listType = 'ul';
      }
      html += `<li class="odoo-list-item">${inlineFormat(listItem[1])}</li>`;
      return true;
    }

    // Bold text (**Sign in and join...**)
    const boldText = line.match(/^\*\*(.+)\*\*$/);
    if (boldText) {
      closeList();
      html += `<div class="odoo-signin-text">${inlineFormat(boldText[1])}</div>`;
      return true;
    }

    // XP badge (+40 XP)
    const xpMatch = line.match(/^\+(\d+)\s+XP$/);
    if (xpMatch) {
      closeList();
      html += `<div class="odoo-xp-badge">+${xpMatch[1]} XP</div>`;
      return true;
    }

    // Horizontal rule (---)
    if (line.match(/^---$/)) {
      closeList();
      html += '<hr class="odoo-divider" />';
      return true;
    }

    // Regular paragraph
    closeList();
    if (line.trim()) {
      html += `<p class="odoo-paragraph">${inlineFormat(line)}</p>`;
    }
    return true;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '') {
      closeList();
      continue;
    }
    processLine(line);
  }

  closeList();
  return html;
};

// ─── Odoo Content Styles ─────────────────────────────────────────────

const ODOO_STYLES = `
  /* Content container */
  .odoo-content {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1E1B24;
    font-size: 16px;
    line-height: 1.8;
    padding: 4px 0;
    max-width: 100%;
  }

  /* Main heading (# Getting Started) */
  .odoo-main-heading {
    font-size: 28px;
    font-weight: 700;
    color: #0F172A;
    margin: 0 0 20px 0;
    padding: 0;
    line-height: 1.3;
    letter-spacing: -0.3px;
  }

  /* Sub heading (## USING ODOO) */
  .odoo-sub-heading {
    font-size: 22px;
    font-weight: 700;
    color: #0F172A;
    margin: 28px 0 16px 0;
    padding: 0;
    line-height: 1.4;
    letter-spacing: -0.2px;
  }

  /* Section headers (- GETTING STARTED) */
  .odoo-section-header {
    font-size: 15px;
    font-weight: 700;
    color: #1E293B;
    margin: 16px 0 6px 0;
    padding: 0;
    letter-spacing: 0.3px;
  }

  /* Lists */
  .odoo-list {
    margin: 4px 0 16px 0;
    padding-left: 0;
    list-style: none;
  }

  .odoo-list-item {
    padding: 4px 0 4px 24px;
    position: relative;
    font-size: 15px;
    color: #1E293B;
    line-height: 1.7;
  }

  .odoo-list-item::before {
    content: "•";
    position: absolute;
    left: 4px;
    color: #8B5FBF;
    font-weight: 700;
    font-size: 18px;
  }

  /* Quiz question wrapper */
  .odoo-question-wrapper {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin: 24px 0 12px 0;
    padding: 0;
  }

  .odoo-question-number {
    font-size: 16px;
    font-weight: 700;
    color: #0F172A;
    min-width: 28px;
    flex-shrink: 0;
  }

  .odoo-question-text {
    font-size: 16px;
    font-weight: 600;
    color: #0F172A;
    line-height: 1.6;
  }

  /* Sign-in text */
  .odoo-signin-text {
    font-size: 15px;
    font-weight: 500;
    color: #4A4458;
    margin: 16px 0 8px 0;
    padding: 0;
    text-align: center;
  }

  /* XP Badge */
  .odoo-xp-badge {
    display: inline-block;
    background: #8B5FBF;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    padding: 4px 16px;
    border-radius: 20px;
    margin: 4px 0;
  }

  /* Divider */
  .odoo-divider {
    border: none;
    border-top: 1px solid #EEECF3;
    margin: 16px 0;
  }

  /* Paragraph */
  .odoo-paragraph {
    font-size: 15px;
    color: #1E293B;
    line-height: 1.8;
    margin: 0 0 16px 0;
  }

  /* Links */
  .note-link {
    color: #8B5FBF;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .note-link:hover {
    color: #6B4A8A;
  }

  /* Code */
  .note-code {
    background: #F1F0F4;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 14px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* Images */
  .note-image {
    max-width: 100%;
    border-radius: 12px;
    margin: 16px 0;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    display: block;
  }

  /* Animations */
  .fade-in {
    animation: odooFadeIn 0.5s ease-out;
  }
  @keyframes odooFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Prevent selection */
  .odoo-content,
  .odoo-content * {
    user-select: none !important;
    -webkit-user-select: none !important;
  }

  /* Scrollbar */
  .odoo-content::-webkit-scrollbar {
    width: 6px;
  }
  .odoo-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .odoo-content::-webkit-scrollbar-thumb {
    background: #D5D0DE;
    border-radius: 3px;
  }
  .odoo-content::-webkit-scrollbar-thumb:hover {
    background: #BDB8C9;
  }
`;

// ─── Sidebar config ──────────────────────────────────────────────────

const CONTENT_TYPES = [
  { key: 'video',     icon: '🎬', label: 'Video Tutorial', color: '#8B5FBF' },
  { key: 'notes',     icon: '📄', label: 'Tutorial', color: '#3B82F6' },
  { key: 'interview', icon: '🎤', label: 'Interview Qs', color: '#F59E0B' },
  { key: 'exam',      icon: '📝', label: 'Exam Question', color: '#EF4444' },
  { key: 'labs',      icon: '🧪', label: 'Lab Exercise', color: '#10B981' },
];

// ─── Tab Components ──────────────────────────────────────────────────

function NotesTab({ content }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!content) {
    return <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>📝 No notes for this section.</div>;
  }

  const html = renderOdooContent(content);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div
        className="odoo-content fade-in"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          padding: isMobile ? '12px 8px 60px 8px' : '16px 24px 80px 24px',
          overflowY: 'visible',
          overflowX: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        onSelect={(e) => e.preventDefault()}
      />
      <style>{ODOO_STYLES}</style>
    </div>
  );
}

function VideoTab({ videoUrls }) {
  const [currentVideo, setCurrentVideo] = useState(0);
  const urls = Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : []);

  if (urls.length === 0) {
    return <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>🎬 No video for this section.</div>;
  }

  const currentUrl = urls[currentVideo];
  const embed = getEmbedUrl(currentUrl);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {urls.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {urls.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentVideo(idx)}
              style={{
                padding: '6px 16px',
                borderRadius: '16px',
                border: idx === currentVideo ? '2px solid #8B5FBF' : '1px solid #E2E8F0',
                background: idx === currentVideo ? '#EDE7F6' : '#fff',
                color: idx === currentVideo ? '#8B5FBF' : '#475569',
                fontWeight: idx === currentVideo ? 600 : 500,
                fontSize: '12px',
                cursor: 'pointer',
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
          borderRadius: '12px', 
          background: '#000' 
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
    </div>
  );
}

function InterviewTab({ questions }) {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  if (!questions || questions.length === 0) {
    return <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>🎤 No interview questions.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="🔍 Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '14px',
            outline: 'none',
            background: '#fff',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {questions.map((q, idx) => (
          <div
            key={q.id}
            style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                color: '#1E1B24',
              }}
            >
              <span>
                <span style={{ color: '#94a3b8', marginRight: '8px' }}>{idx + 1}.</span>
                {q.question}
              </span>
              <span style={{ fontSize: '16px', color: '#94a3b8' }}>
                {expanded[q.id] ? '▼' : '▶'}
              </span>
            </div>
            {expanded[q.id] && (
              <div style={{
                padding: '14px 18px',
                borderTop: '1px solid #E2E8F0',
                background: '#FAF9FC',
                color: '#4A4458',
                lineHeight: '1.8',
                fontSize: '14px',
              }}>
                {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamTab({ questions, onScoreUpdate }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  if (!questions || questions.length === 0) {
    return <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>📝 No MCQ questions.</div>;
  }

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    setScore({ correct, total: questions.length });
    setSubmitted(true);
    if (onScoreUpdate) onScoreUpdate(correct, questions.length);
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#F8F7FA',
        borderRadius: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#0F172A' }}>
          📝 MCQ Quiz
        </span>
        {!submitted && (
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 20px',
              background: '#8B5FBF',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Submit Quiz
          </button>
        )}
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} style={{
          padding: '18px',
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          marginBottom: '12px',
        }}>
          <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '15px', color: '#0F172A' }}>
            <span style={{ color: '#94a3b8', marginRight: '8px' }}>{idx + 1}.</span>
            {q.question}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    gap: '12px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: isSelected ? '#EDE7F6' : 'transparent',
                    border: isSelected ? '1px solid #8B5FBF' : '1px solid transparent',
                    cursor: submitted ? 'default' : 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    checked={isSelected}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                    disabled={submitted}
                    style={{ accentColor: '#8B5FBF' }}
                  />
                  <span style={{ fontSize: '14px' }}>
                    <strong style={{ color: '#475569', marginRight: '4px' }}>{opt}.</strong>
                    {optText}
                  </span>
                </label>
              );
            })}
          </div>
          {submitted && (
            <div style={{
              marginTop: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: answers[q.id] === q.correctAnswer ? '#DFF3E8' : '#FDE8E8',
              fontSize: '13px',
            }}>
              {answers[q.id] === q.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
            </div>
          )}
        </div>
      ))}

      {submitted && score && (
        <div style={{
          padding: '16px',
          background: '#F8F7FA',
          borderRadius: '12px',
          textAlign: 'center',
          marginTop: '8px',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
            {score.correct} / {score.total}
          </div>
          <div style={{ fontSize: '13px', color: '#475569' }}>
            {Math.round((score.correct / score.total) * 100)}% correct
          </div>
        </div>
      )}
    </div>
  );
}

function LabsTab({ labs }) {
  const [completed, setCompleted] = useState({});
  const [activeLab, setActiveLab] = useState(null);

  if (!labs || labs.length === 0) {
    return <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>🧪 No lab exercises.</div>;
  }

  return (
    <div>
      {labs.map((lab, idx) => (
        <div
          key={lab.id}
          style={{
            background: '#fff',
            borderRadius: '12px',
            border: completed[lab.id] ? '1px solid #2E9B6C' : '1px solid #E2E8F0',
            padding: '16px 20px',
            marginBottom: '10px',
            cursor: 'pointer',
          }}
          onClick={() => setActiveLab(activeLab === lab.id ? null : lab.id)}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <span style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A' }}>
              {idx + 1}. {lab.title}
            </span>
            {!completed[lab.id] && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCompleted((prev) => ({ ...prev, [lab.id]: true }));
                }}
                style={{
                  padding: '4px 14px',
                  background: '#2E9B6C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✓ Mark Complete
              </button>
            )}
            {completed[lab.id] && (
              <span style={{ fontSize: '13px', color: '#2E9B6C', fontWeight: 600 }}>✅ Done</span>
            )}
          </div>
          {activeLab === lab.id && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #E2E8F0',
              fontSize: '14px',
              color: '#4A4458',
              lineHeight: '1.8',
            }}>
              {lab.instructions}
            </div>
          )}
        </div>
      ))}
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
  const [authImageUrls, setAuthImageUrls] = useState({});
  const authImageUrlsRef = useRef({});

  const currentSub = subtopics[activeSection];
  const isCompleted = completedSections.includes(activeSection);

  // ─── Effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) navbar.style.display = 'none';
    document.body.style.paddingTop = '0';
    return () => {
      const navbar = document.querySelector('nav');
      if (navbar) navbar.style.display = '';
      document.body.style.paddingTop = '';
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
    const loadImagesWithAuth = async () => {
      const newAuthUrls = {};
      for (const img of images) {
        const safeId = img.subTopicId || img.subtopicId;
        if (!safeId) continue;
        const url = `/admin/uploads/subtopic_${safeId}/images/${img.fileName}`;
        const blobUrl = await fetchImageWithAuth(url);
        if (blobUrl) newAuthUrls[img.id] = blobUrl;
      }
      setAuthImageUrls(newAuthUrls);
      authImageUrlsRef.current = newAuthUrls;
    };
    if (images.length > 0) loadImagesWithAuth();
    return () => {
      Object.values(authImageUrlsRef.current).forEach(url => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
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

  const availableTypes = (() => {
    const out = [];
    if (videoUrls.length > 0) out.push('video');
    if (currentSub?.content) out.push('notes');
    if (interviewQuestions.length > 0) out.push('interview');
    if (examQuestions.length > 0) out.push('exam');
    if (labs.length > 0) out.push('labs');
    return out;
  })();

  useEffect(() => {
    if (loadingData) return;
    if (availableTypes.length > 0) {
      const preferred = availableTypes.includes('notes') ? 'notes' : availableTypes[0];
      if (!availableTypes.includes(activeContentType)) setActiveContentType(preferred);
    }
  }, [loadingData, availableTypes, activeContentType]);

  const toggleTopic = (topicId) => setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));

  const selectSubtopic = async (sub, globalIndex) => {
    setActiveSection(globalIndex);
    setCurrentSubtopic(sub);
    await loadSubtopicImages(sub.id);
    if (isMobile) setShowSidebar(false);
    if (sub?.content) setActiveContentType('notes');
  };

  const filteredTopics = searchQuery
    ? topics.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (topic.subtopics || []).some(sub => sub.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : topics;

  const typeMeta = CONTENT_TYPES.find((t) => t.key === activeContentType) || CONTENT_TYPES[0];

  const renderPanelContent = () => {
    if (!currentSub) return <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>Select a section from the sidebar to begin</div>;
    if (loadingData) return <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>Loading content…</div>;
    if (availableTypes.length === 0) return <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>No content has been added for this section yet.</div>;

    switch (activeContentType) {
      case 'video': return <VideoTab videoUrls={videoUrls} />;
      case 'notes': return <NotesTab content={currentSub.content} />;
      case 'interview': return <InterviewTab questions={interviewQuestions} />;
      case 'exam': return <ExamTab questions={examQuestions} onScoreUpdate={() => {}} />;
      case 'labs': return <LabsTab labs={labs} />;
      default: return null;
    }
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  if (contentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#8B5FBF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: '#94a3b8', fontSize: '15px' }}>Loading course content…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Styles ──────────────────────────────────────────────────────────

  const isMobileDevice = window.innerWidth < 768;

  const styles = {
    page: {
      background: '#F5F4F8',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
      paddingTop: '0',
    },
    shell: {
      display: 'flex',
      height: '100%',
      width: '100%',
    },
    sidebar: {
      width: '320px',
      minWidth: '320px',
      background: '#F1F5F9', // Grey sidebar
      borderRight: '1px solid #E2E8F0', // Grey border
      height: '100vh',
      overflowY: 'auto',
      flexShrink: 0,
    },
    sidebarOpen: { left: '0' },
    sidebarHeader: {
      padding: '0 16px 12px 16px',
      borderBottom: '1px solid #E2E8F0',
      marginBottom: '8px',
    },
    sidebarTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#0F172A',
    },
    sidebarSubtitle: {
      fontSize: '12px',
      color: '#475569',
      marginTop: '2px',
    },
    topicItem: {
      borderBottom: '1px solid #E2E8F0',
    },
    topicHeader: (isOpen) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      color: isOpen ? '#0F172A' : '#475569',
      background: isOpen ? '#E8EDF5' : 'transparent',
      transition: 'all 0.15s',
    }),
    subtopicItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 16px 6px 28px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: isActive ? 600 : 400,
      color: isActive ? '#0F172A' : '#475569',
      background: isActive ? '#DBEAFE' : 'transparent',
      borderLeft: isActive ? '3px solid #8B5FBF' : '3px solid transparent',
      transition: 'all 0.15s',
    }),
    leafItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 16px 4px 44px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: isActive ? 600 : 400,
      color: isActive ? '#8B5FBF' : '#94A3B8',
      background: isActive ? 'rgba(139,95,191,0.06)' : 'transparent',
      borderLeft: isActive ? '2px solid #8B5FBF' : '2px solid transparent',
      transition: 'all 0.15s',
    }),
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#F5F4F8',
      overflow: 'hidden',
      padding: '20px',
    },
    contentHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: isMobileDevice ? '8px 4px 12px 4px' : '8px 0 16px 0',
      flexWrap: 'wrap',
      position: 'sticky',
      top: 0,
      zIndex: 5,
      background: '#F5F4F8',
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      padding: '6px 14px',
      fontSize: '13px',
      fontWeight: 600,
      color: '#475569',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    contentTitle: {
      fontSize: isMobileDevice ? '16px' : '20px',
      fontWeight: 700,
      color: '#0F172A',
      flex: 1,
    },
    doneBadge: {
      fontSize: '12px',
      background: '#DFF3E8',
      color: '#1E7A4C',
      padding: '2px 12px',
      borderRadius: '20px',
      fontWeight: 600,
    },
    contentPanel: {
      flex: 1,
      background: '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    contentBody: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
    },
    mobileOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.3)',
      zIndex: 999,
      display: isMobileDevice && showSidebar ? 'block' : 'none',
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        * { -webkit-touch-callout: none !important; -webkit-user-select: none !important; user-select: none !important; }
        input, textarea, select { -webkit-user-select: auto !important; user-select: auto !important; }
        body { overscroll-behavior: none; touch-action: pan-y; margin: 0; padding: 0; }
        .odoo-content { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {activeView === 'split' && (
        <div style={styles.shell}>
          {isMobile && showSidebar && <div style={styles.mobileOverlay} onClick={() => setShowSidebar(false)} />}

          {/* ─── Sidebar ────────────────────────────────────────────── */}
          {(!isSidebarCollapsed || isMobile) && (
            <aside id="mobile-sidebar" style={{ ...styles.sidebar, ...(isMobile && showSidebar ? styles.sidebarOpen : {}) }}>
              <div style={styles.sidebarHeader}>
                <div style={styles.sidebarTitle}>{selectedCourse?.title || 'Course'}</div>
                <div style={styles.sidebarSubtitle}>Course Content</div>
              </div>

              {/* ─── Search ──────────────────────────────────────────── */}
              <div style={{ padding: '0 12px 10px 12px' }}>
                <input
                  type="text"
                  placeholder="🔍 Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    background: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                    color: '#0F172A',
                  }}
                />
              </div>

              {/* ─── Topics ───────────────────────────────────────────── */}
              <div>
                {filteredTopics.map((topic) => {
                  const topicSubs = topic.subtopics || [];
                  const isOpen = !!expandedTopics[topic.id];
                  return (
                    <div key={topic.id} style={styles.topicItem}>
                      <div style={styles.topicHeader(isOpen)} onClick={() => toggleTopic(topic.id)}>
                        <span>{topic.title}</span>
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{isOpen ? '▼' : '▶'}</span>
                      </div>
                      {isOpen && topicSubs.map((sub) => {
                        const globalIndex = subtopics.findIndex((s) => String(s.id) === String(sub.id));
                        if (globalIndex === -1) return null;
                        const isActive = activeSection === globalIndex;
                        const isDone = completedSections.includes(globalIndex);
                        const hasVideo = getVideoUrls(sub).length > 0;
                        return (
                          <div key={sub.id}>
                            <div style={styles.subtopicItem(isActive)} onClick={() => selectSubtopic(sub, globalIndex)}>
                              <span style={{ fontSize: '10px', color: hasVideo ? '#8B5FBF' : '#94A3B8' }}>{hasVideo ? '▶' : '●'}</span>
                              <span style={{ flex: 1 }}>{sub.title}</span>
                              {isDone && <span style={{ fontSize: '10px', color: '#2E9B6C' }}>✓</span>}
                            </div>
                            {isActive && (
                              <div>
                                {loadingData ? (
                                  <div style={{ padding: '4px 16px 4px 44px', fontSize: '11px', color: '#94A3B8' }}>Loading…</div>
                                ) : (
                                  CONTENT_TYPES.filter((t) => availableTypes.includes(t.key)).map((t) => (
                                    <div
                                      key={t.key}
                                      style={styles.leafItem(activeContentType === t.key)}
                                      onClick={() => setActiveContentType(t.key)}
                                    >
                                      <span>{t.icon}</span>
                                      <span>{t.label}</span>
                                    </div>
                                  ))
                                )}
                                {!loadingData && availableTypes.length === 0 && (
                                  <div style={{ padding: '4px 16px 4px 44px', fontSize: '11px', color: '#94A3B8' }}>No content</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {filteredTopics.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    No topics match your search.
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* ─── Main Content ───────────────────────────────────────── */}
          <main style={styles.mainContent}>
            {/* ─── Header ────────────────────────────────────────────── */}
            <div style={styles.contentHeader}>
              <button
                onClick={handleBack}
                style={styles.backBtn}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E8EDF5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                ← Back
              </button>

              <span style={styles.contentTitle}>
                {currentSub ? currentSub.title : 'Select a section'}
              </span>

              {isCompleted && <span style={styles.doneBadge}>✅ Done</span>}

              {isMobile && (
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  style={{
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  ☰
                </button>
              )}
            </div>

            {/* ─── Content Panel ────────────────────────────────────── */}
            <div style={styles.contentPanel}>
              <div style={styles.contentBody} className="fade-in">
                {renderPanelContent()}
              </div>
            </div>
          </main>
        </div>
      )}

      {activeView === 'gallery' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', margin: '16px 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>📸 All Course Images ({images.length})</h2>
          {images.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No images yet</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {images.map((img) => {
                const safeId = img.subTopicId || img.subtopicId;
                if (!safeId) return null;
                const imageUrl = authImageUrls[img.id] || `/admin/uploads/subtopic_${safeId}/images/${img.fileName}`;
                return (
                  <div
                    key={img.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => window.open(imageUrl, '_blank')}
                  >
                    <img
                      src={imageUrl}
                      alt={`Page ${img.pageNumber}`}
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      onError={() => handleImageError?.(img.id)}
                      loading="lazy"
                    />
                    <div style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'center', background: '#F8F7FA', color: '#475569' }}>
                      Page {img.pageNumber}
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