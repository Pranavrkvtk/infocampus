// src/components/CourseDetailView.jsx
// Premium Odoo-style learning UI - Dark Sidebar + White Content

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSubtopicInterviewQuestions,
  getSubtopicExamQuestions,
  getSubtopicLabs,
} from '../api/UserApi';
import { getCourseDetailConfig } from './Admin/CourseDetailEditorTab';

// ─── API Base ──────────────────────────────────────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

// ─── Dark Theme Colors for Sidebar ────────────────────────────────────
const DARK = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  border: '#334155',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textLight: '#f1f5f9',
  accent: '#4f46e5',
  accentSoft: '#312e81',
  success: '#22c55e',
  successBg: '#052e16',
  hover: '#1e293b',
  cardBg: '#1e293b',
  inputBg: '#0f172a',
};

// ─── Light Theme Colors for Content ──────────────────────────────────
const LIGHT = {
  bg: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  textLight: '#1e293b',
  hover: '#f1f5f9',
  accent: '#4f46e5',
  accentSoft: '#eef2ff',
  success: '#22c55e',
  successBg: '#dcfce7',
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
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => buildImageTag(alt, url));
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => 
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="note-link">${text}</a>`
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code class="note-code">$1</code>');
  return out;
};

// ─── Odoo-style Markdown Renderer (Light Theme Content) ──────────────

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
    const mainHeading = line.match(/^#\s+(.+)$/);
    if (mainHeading) {
      closeList();
      html += `<h1 class="odoo-main-heading">${inlineFormat(mainHeading[1])}</h1>`;
      return true;
    }

    const subHeading = line.match(/^##\s+(.+)$/);
    if (subHeading) {
      closeList();
      html += `<h2 class="odoo-sub-heading">${inlineFormat(subHeading[1])}</h2>`;
      return true;
    }

    const question = line.match(/^#\s+(\d+)\.\s+(.*)$/);
    if (question) {
      closeList();
      html += `<div class="odoo-question-wrapper">`;
      html += `<div class="odoo-question-number">${question[1]}.</div>`;
      html += `<div class="odoo-question-text">${inlineFormat(question[2])}</div>`;
      html += `</div>`;
      return true;
    }

    const boldListItem = line.match(/^-\s+\*\*(.+)\*\*$/);
    if (boldListItem) {
      closeList();
      html += `<div class="odoo-section-header">${inlineFormat(boldListItem[1])}</div>`;
      return true;
    }

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

    const boldText = line.match(/^\*\*(.+)\*\*$/);
    if (boldText) {
      closeList();
      html += `<div class="odoo-signin-text">${inlineFormat(boldText[1])}</div>`;
      return true;
    }

    const xpMatch = line.match(/^\+(\d+)\s+XP$/);
    if (xpMatch) {
      closeList();
      html += `<div class="odoo-xp-badge">+${xpMatch[1]} XP</div>`;
      return true;
    }

    if (line.match(/^---$/)) {
      closeList();
      html += '<hr class="odoo-divider" />';
      return true;
    }

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

// ─── Odoo Content Styles (Light Theme) ──────────────────────────────

const buildOdooStyles = (colors) => `
  .odoo-content {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: ${LIGHT.text};
    font-size: 16px;
    line-height: 1.8;
    padding: 4px 0;
    max-width: 100%;
  }
  .odoo-main-heading {
    font-size: 32px;
    font-weight: 800;
    color: ${LIGHT.textLight};
    margin: 0 0 24px 0;
    padding: 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  .odoo-sub-heading {
    font-size: 24px;
    font-weight: 700;
    color: ${LIGHT.textLight};
    margin: 32px 0 16px 0;
    padding: 0;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .odoo-section-header {
    font-size: 15px;
    font-weight: 700;
    color: #64748B;
    margin: 20px 0 8px 0;
    padding: 0;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .odoo-list {
    margin: 4px 0 20px 0;
    padding-left: 0;
    list-style: none;
  }
  .odoo-list-item {
    padding: 6px 0 6px 28px;
    position: relative;
    font-size: 15px;
    color: ${LIGHT.text};
    line-height: 1.7;
  }
  .odoo-list-item::before {
    content: "●";
    position: absolute;
    left: 4px;
    color: ${colors.accent || '#4f46e5'};
    font-weight: 700;
    font-size: 12px;
  }
  .odoo-question-wrapper {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin: 28px 0 12px 0;
    padding: 16px 20px;
    background: ${LIGHT.hover};
    border-radius: 12px;
    border-left: 4px solid ${colors.accent || '#4f46e5'};
  }
  .odoo-question-number {
    font-size: 16px;
    font-weight: 700;
    color: ${LIGHT.textLight};
    min-width: 28px;
    flex-shrink: 0;
  }
  .odoo-question-text {
    font-size: 16px;
    font-weight: 600;
    color: ${LIGHT.textLight};
    line-height: 1.6;
  }
  .odoo-signin-text {
    font-size: 15px;
    font-weight: 500;
    color: ${LIGHT.textMuted};
    margin: 20px 0 10px 0;
    padding: 0;
    text-align: center;
  }
  .odoo-xp-badge {
    display: inline-block;
    background: ${colors.accent || '#4f46e5'};
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    padding: 6px 20px;
    border-radius: 20px;
    margin: 4px 0;
  }
  .odoo-divider {
    border: none;
    border-top: 1px solid ${LIGHT.border};
    margin: 24px 0;
  }
  .odoo-paragraph {
    font-size: 15px;
    color: ${LIGHT.text};
    line-height: 1.8;
    margin: 0 0 18px 0;
  }
  .note-link {
    color: ${colors.accent || '#4f46e5'};
    text-decoration: underline;
    text-underline-offset: 2px;
    font-weight: 500;
  }
  .note-link:hover {
    color: ${colors.accentDark || '#818cf8'};
  }
  .note-code {
    background: ${LIGHT.hover};
    padding: 2px 10px;
    border-radius: 6px;
    font-size: 14px;
    font-family: 'JetBrains Mono', monospace;
    color: ${LIGHT.textLight};
  }
  .note-image {
    max-width: 100%;
    border-radius: 12px;
    margin: 20px 0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    display: block;
  }
  .fade-in {
    animation: odooFadeIn 0.5s ease-out;
  }
  @keyframes odooFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .odoo-content,
  .odoo-content * {
    user-select: none !important;
    -webkit-user-select: none !important;
  }
  .odoo-content::-webkit-scrollbar {
    width: 6px;
  }
  .odoo-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .odoo-content::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 3px;
  }
  .odoo-content::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
  }
`;

// ─── Tab Components (Light Theme) ──────────────────────────────────

function NotesTab({ content, config }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!content) {
    return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>{config.emptyStates?.notes || 'No notes available'}</div>;
  }

  const html = renderOdooContent(content);
  const styleTag = buildOdooStyles(config.colors);

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
      <style>{styleTag}</style>
    </div>
  );
}

function VideoTab({ videoUrls, config }) {
  const [currentVideo, setCurrentVideo] = useState(0);
  const urls = Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : []);

  if (urls.length === 0) {
    return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>{config.emptyStates?.video || 'No videos available'}</div>;
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
                border: idx === currentVideo ? `2px solid ${config.colors?.accent || '#4f46e5'}` : `1px solid ${LIGHT.border}`,
                background: idx === currentVideo ? (config.colors?.accent || '#4f46e5') : 'transparent',
                color: idx === currentVideo ? '#fff' : LIGHT.textMuted,
                fontWeight: idx === currentVideo ? 600 : 500,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ▶ Video {idx + 1}
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

function InterviewTab({ questions, config }) {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  if (!questions || questions.length === 0) {
    return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>{config.emptyStates?.interview || 'No interview questions available'}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder={config.labels?.searchQuestionsPlaceholder || 'Search questions...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            border: `1px solid ${LIGHT.border}`,
            fontSize: '14px',
            outline: 'none',
            background: LIGHT.bg,
            color: LIGHT.text,
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {questions.map((q, idx) => (
          <div
            key={q.id}
            style={{
              background: LIGHT.surface,
              borderRadius: '12px',
              border: `1px solid ${LIGHT.border}`,
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
                color: LIGHT.text,
              }}
            >
              <span>
                <span style={{ color: LIGHT.textMuted, marginRight: '8px' }}>{idx + 1}.</span>
                {q.question}
              </span>
              <span style={{ fontSize: '16px', color: LIGHT.textMuted }}>
                {expanded[q.id] ? '▼' : '▶'}
              </span>
            </div>
            {expanded[q.id] && (
              <div style={{
                padding: '14px 18px',
                borderTop: `1px solid ${LIGHT.border}`,
                background: LIGHT.hover,
                color: LIGHT.text,
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

function ExamTab({ questions, config, onScoreUpdate }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  if (!questions || questions.length === 0) {
    return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>{config.emptyStates?.exam || 'No exam questions available'}</div>;
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
        background: LIGHT.hover,
        borderRadius: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: LIGHT.textLight }}>
          {config.labels?.quizTitleText || 'Quiz'}
        </span>
        {!submitted && (
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 20px',
              background: config.colors?.accent || '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {config.labels?.submitQuizText || 'Submit Quiz'}
          </button>
        )}
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} style={{
          padding: '18px',
          background: LIGHT.surface,
          borderRadius: '12px',
          border: `1px solid ${LIGHT.border}`,
          marginBottom: '12px',
        }}>
          <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '15px', color: LIGHT.textLight }}>
            <span style={{ color: LIGHT.textMuted, marginRight: '8px' }}>{idx + 1}.</span>
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
                    background: isSelected ? LIGHT.accentSoft : 'transparent',
                    border: isSelected ? `1px solid ${config.colors?.accent || '#4f46e5'}` : `1px solid transparent`,
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
                    style={{ accentColor: config.colors?.accent || '#4f46e5' }}
                  />
                  <span style={{ fontSize: '14px', color: LIGHT.text }}>
                    <strong style={{ color: LIGHT.textMuted, marginRight: '4px' }}>{opt}.</strong>
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
              background: answers[q.id] === q.correctAnswer ? LIGHT.successBg : '#fee2e2',
              fontSize: '13px',
              color: answers[q.id] === q.correctAnswer ? LIGHT.success : '#dc2626',
            }}>
              {answers[q.id] === q.correctAnswer ? (config.labels?.correctText || '✅ Correct!') : (config.labels?.incorrectText || '❌ Incorrect')}
            </div>
          )}
        </div>
      ))}

      {submitted && score && (
        <div style={{
          padding: '16px',
          background: LIGHT.hover,
          borderRadius: '12px',
          textAlign: 'center',
          marginTop: '8px',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: LIGHT.textLight }}>
            {score.correct} / {score.total}
          </div>
          <div style={{ fontSize: '13px', color: LIGHT.textMuted }}>
            {Math.round((score.correct / score.total) * 100)}% correct
          </div>
        </div>
      )}
    </div>
  );
}

function LabsTab({ labs, config }) {
  const [completed, setCompleted] = useState({});
  const [activeLab, setActiveLab] = useState(null);

  if (!labs || labs.length === 0) {
    return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>{config.emptyStates?.labs || 'No labs available'}</div>;
  }

  return (
    <div>
      {labs.map((lab, idx) => (
        <div
          key={lab.id}
          style={{
            background: LIGHT.surface,
            borderRadius: '12px',
            border: completed[lab.id] ? `1px solid ${LIGHT.success}` : `1px solid ${LIGHT.border}`,
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
            <span style={{ fontWeight: 600, fontSize: '15px', color: LIGHT.textLight }}>
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
                  background: LIGHT.success,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {config.labels?.markCompleteText || 'Mark Complete'}
              </button>
            )}
            {completed[lab.id] && (
              <span style={{ fontSize: '13px', color: LIGHT.success, fontWeight: 600 }}>{config.labels?.doneBadgeText || '✅ Done'}</span>
            )}
          </div>
          {activeLab === lab.id && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: `1px solid ${LIGHT.border}`,
              fontSize: '14px',
              color: LIGHT.text,
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
  // ─── Load config ─────────────────────────────────────────────────────
  const config = getCourseDetailConfig();

  // ─── Define the display order of content types ──────────────────────
  const typeOrder = ['notes', 'video', 'interview', 'exam', 'labs'];

  // ─── Build content types from config in the desired order ──────────
  const CONTENT_TYPES = typeOrder.map((key) => ({
    key,
    icon: config.contentTypes?.[key]?.icon || key,
    label: config.contentTypes?.[key]?.label || key,
    color: config.contentTypes?.[key]?.color || '#000',
  }));

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
      Object.values(authImageUrlsRef.current).forEach((url) => {
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

  // ─── Determine available types and sort them according to typeOrder ─
  const availableTypes = (() => {
    const out = [];
    if (videoUrls.length > 0) out.push('video');
    if (currentSub?.content) out.push('notes');
    if (interviewQuestions.length > 0) out.push('interview');
    if (examQuestions.length > 0) out.push('exam');
    if (labs.length > 0) out.push('labs');
    out.sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));
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
    ? topics.filter((topic) =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (topic.subtopics || []).some((sub) => sub.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : topics;

  const typeMeta = CONTENT_TYPES.find((t) => t.key === activeContentType) || CONTENT_TYPES[0];

  const renderPanelContent = () => {
    if (!currentSub) return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>{config.labels?.selectSectionText || 'Select a section'}</div>;
    if (loadingData) return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>{config.labels?.loadingContentText || 'Loading...'}</div>;
    if (availableTypes.length === 0) return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>{config.labels?.noContentText || 'No content available'}</div>;

    switch (activeContentType) {
      case 'video': return <VideoTab videoUrls={videoUrls} config={config} />;
      case 'notes': return <NotesTab content={currentSub.content} config={config} />;
      case 'interview': return <InterviewTab questions={interviewQuestions} config={config} />;
      case 'exam': return <ExamTab questions={examQuestions} config={config} />;
      case 'labs': return <LabsTab labs={labs} config={config} />;
      default: return null;
    }
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  if (contentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: DARK.bg, minHeight: '100vh' }}>
        <div style={{ width: '40px', height: '40px', border: `3px solid ${DARK.border}`, borderTopColor: config.colors?.accent || '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: DARK.textMuted, fontSize: '15px' }}>{config.labels?.loadingCourseText || 'Loading course...'}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Dark Sidebar + Light Content Styles ────────────────────────────

  const isMobileDevice = window.innerWidth < 768;

  const styles = {
    page: {
      background: LIGHT.bg,
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
      background: DARK.bg,
      borderRight: `1px solid ${DARK.border}`,
      height: '100vh',
      overflowY: 'auto',
      flexShrink: 0,
    },
    sidebarOpen: { left: '0' },
    sidebarHeader: {
      padding: '20px',
      borderBottom: `1px solid ${DARK.border}`,
      background: DARK.surface,
    },
    sidebarTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: DARK.textLight,
      lineHeight: '1.3',
    },
    sidebarSubtitle: {
      fontSize: '13px',
      color: DARK.textMuted,
      marginTop: '6px',
    },
    topicItem: {
      margin: '10px',
      borderRadius: '12px',
      overflow: 'hidden',
      border: `1px solid ${DARK.border}`,
      background: DARK.surface,
    },
    topicHeader: (isOpen) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '15px',
      color: isOpen ? (config.colors?.accent || '#4f46e5') : DARK.text,
      background: isOpen ? DARK.accentSoft : 'transparent',
      transition: '0.25s',
      borderBottom: isOpen ? `1px solid ${DARK.border}` : 'none',
    }),
    subtopicItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 18px 12px 32px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: isActive ? '600' : '500',
      color: isActive ? '#fff' : DARK.text,
      background: isActive ? (config.colors?.accent || '#4f46e5') : 'transparent',
      borderLeft: isActive ? `4px solid ${config.colors?.accent || '#4f46e5'}` : '4px solid transparent',
      transition: '0.2s',
    }),
    leafItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 18px 10px 52px',
      fontSize: '13px',
      cursor: 'pointer',
      borderRadius: '8px',
      margin: '4px 10px',
      color: isActive ? '#fff' : DARK.textMuted,
      background: isActive ? (config.colors?.accent || '#4f46e5') : 'transparent',
      transition: '0.2s',
      fontWeight: isActive ? 600 : 500,
    }),
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: LIGHT.bg,
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
      background: LIGHT.bg,
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: LIGHT.surface,
      border: `1px solid ${LIGHT.border}`,
      borderRadius: '8px',
      padding: '6px 14px',
      fontSize: '13px',
      fontWeight: 600,
      color: LIGHT.text,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    contentTitle: {
      fontSize: isMobileDevice ? '16px' : '20px',
      fontWeight: 700,
      color: LIGHT.textLight,
      flex: 1,
    },
    doneBadge: {
      fontSize: '12px',
      background: LIGHT.successBg,
      color: LIGHT.success,
      padding: '2px 12px',
      borderRadius: '20px',
      fontWeight: 600,
    },
    contentPanel: {
      flex: 1,
      background: LIGHT.surface,
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${LIGHT.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    contentBody: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
    },
    mobileOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 999,
      display: isMobileDevice && showSidebar ? 'block' : 'none',
    },
  };

  // ─── Handlers to prevent copying ────────────────────────────────────
  const preventCopy = (e) => {
    e.preventDefault();
    return false;
  };

  return (
    <div style={styles.page}>
      <style>{`
        * { -webkit-touch-callout: none !important; -webkit-user-select: none !important; user-select: none !important; }
        input, textarea, select { -webkit-user-select: auto !important; user-select: auto !important; }
        body { overscroll-behavior: none; touch-action: pan-y; margin: 0; padding: 0; background: ${LIGHT.bg}; }
        .odoo-content { font-family: 'Inter', system-ui, sans-serif; }
        
        /* Premium scrollbar - light */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${LIGHT.hover}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: ${LIGHT.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${LIGHT.textMuted}; }
      `}</style>

      {activeView === 'split' && (
        <div style={styles.shell}>
          {isMobile && showSidebar && <div style={styles.mobileOverlay} onClick={() => setShowSidebar(false)} />}

          {/* ─── Sidebar (DARK) ────────────────────────────────────── */}
          {(!isSidebarCollapsed || isMobile) && (
            <aside id="mobile-sidebar" style={{ ...styles.sidebar, ...(isMobile && showSidebar ? styles.sidebarOpen : {}) }}>
              <div style={styles.sidebarHeader}>
                <div style={styles.sidebarTitle}>{selectedCourse?.title || 'Course'}</div>
                <div style={styles.sidebarSubtitle}>{subtopics.length} {config.labels?.lessonsSuffix || 'lessons'}</div>
              </div>

              {/* ─── Search ──────────────────────────────────────────── */}
              <div style={{ padding: '10px 12px' }}>
                <input
                  type="text"
                  placeholder={config.labels?.searchTopicsPlaceholder || 'Search topics...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: `1px solid ${DARK.border}`,
                    background: DARK.inputBg,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    color: DARK.text,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = config.colors?.accent || '#4f46e5';
                    e.target.style.boxShadow = `0 0 0 3px ${config.colors?.accent || '#4f46e5'}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = DARK.border;
                    e.target.style.boxShadow = 'none';
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
                        <span style={{ color: DARK.text }}>📚 {topic.title}</span>
                        <span style={{ fontSize: '12px', color: isOpen ? (config.colors?.accent || '#4f46e5') : DARK.textMuted }}>
                          {isOpen ? '▼' : '▶'}
                        </span>
                      </div>
                      {isOpen && topicSubs.map((sub) => {
                        const globalIndex = subtopics.findIndex((s) => String(s.id) === String(sub.id));
                        if (globalIndex === -1) return null;
                        const isActive = activeSection === globalIndex;
                        const isDone = completedSections.includes(globalIndex);
                        const hasVideo = getVideoUrls(sub).length > 0;
                        return (
                          <div key={sub.id}>
                            <div 
                              style={styles.subtopicItem(isActive)} 
                              onClick={() => selectSubtopic(sub, globalIndex)}
                              onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.background = DARK.surfaceLight;
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <span style={{ fontSize: '12px', color: hasVideo ? (config.colors?.accent || '#4f46e5') : DARK.textMuted }}>
                                {hasVideo ? '▶' : '●'}
                              </span>
                              <span style={{ flex: 1, color: isActive ? '#fff' : DARK.text }}>{sub.title}</span>
                              {isDone && <span style={{ fontSize: '12px', color: DARK.success }}>✓</span>}
                            </div>
                            {isActive && (
                              <div>
                                {loadingData ? (
                                  <div style={{ padding: '4px 16px 4px 44px', fontSize: '11px', color: DARK.textMuted }}>Loading…</div>
                                ) : (
                                  CONTENT_TYPES.filter((t) => availableTypes.includes(t.key)).map((t) => (
                                    <div
                                      key={t.key}
                                      style={styles.leafItem(activeContentType === t.key)}
                                      onClick={() => setActiveContentType(t.key)}
                                      onMouseEnter={(e) => {
                                        if (activeContentType !== t.key) {
                                          e.currentTarget.style.background = DARK.surfaceLight;
                                          e.currentTarget.style.color = DARK.textLight;
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (activeContentType !== t.key) {
                                          e.currentTarget.style.background = 'transparent';
                                          e.currentTarget.style.color = DARK.textMuted;
                                        }
                                      }}
                                    >
                                      <span>{t.icon}</span>
                                      <span>{t.label}</span>
                                    </div>
                                  ))
                                )}
                                {!loadingData && availableTypes.length === 0 && (
                                  <div style={{ padding: '4px 16px 4px 44px', fontSize: '11px', color: DARK.textMuted }}>{config.labels?.noSectionDataText || 'No content'}</div>
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
                  <div style={{ padding: '20px', textAlign: 'center', color: DARK.textMuted, fontSize: '13px' }}>
                    No topics match your search.
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* ─── Main Content (LIGHT) ────────────────────────────────── */}
          <main style={styles.mainContent}>
            {/* ─── Header ────────────────────────────────────────────── */}
            <div style={styles.contentHeader}>
              <button
                onClick={handleBack}
                style={styles.backBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = LIGHT.hover;
                  e.currentTarget.style.borderColor = LIGHT.textMuted;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = LIGHT.surface;
                  e.currentTarget.style.borderColor = LIGHT.border;
                }}
              >
                {config.labels?.backButtonText || '← Back'}
              </button>

              <span style={styles.contentTitle}>
                {currentSub ? currentSub.title : 'Select a section'}
              </span>

              {isCompleted && <span style={styles.doneBadge}>{config.labels?.doneBadgeText || '✅ Done'}</span>}

              {isMobile && (
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  style={{
                    background: LIGHT.surface,
                    border: `1px solid ${LIGHT.border}`,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: LIGHT.text,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = LIGHT.hover;
                    e.currentTarget.style.borderColor = LIGHT.textMuted;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = LIGHT.surface;
                    e.currentTarget.style.borderColor = LIGHT.border;
                  }}
                >
                  ☰
                </button>
              )}
            </div>

            {/* ─── Content Panel ────────────────────────────────────── */}
            <div style={styles.contentPanel}>
              <div
                style={styles.contentBody}
                className="fade-in"
                onCopy={preventCopy}
                onCut={preventCopy}
                onContextMenu={preventCopy}
                onSelectStart={preventCopy}
              >
                {renderPanelContent()}
              </div>
            </div>
          </main>
        </div>
      )}

      {activeView === 'gallery' && (
        <div style={{ background: LIGHT.surface, borderRadius: '16px', padding: '20px', margin: '16px 24px', border: `1px solid ${LIGHT.border}` }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: LIGHT.textLight }}>📸 All Course Images ({images.length})</h2>
          {images.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: LIGHT.textMuted }}>No images yet</p>
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
                      border: `1px solid ${LIGHT.border}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      background: LIGHT.surface,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
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
                    <div style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'center', background: LIGHT.bg, color: LIGHT.textMuted }}>
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