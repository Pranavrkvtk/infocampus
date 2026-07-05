// src/components/CourseDetailView.jsx
// Odoo-style learning UI: dark sidebar tree (Topic → Subtopic → Content type),
// with a single themed content panel on the right that swaps between
// Video / Notes / Interview Qs / Exam / Labs depending on what's selected.
// Supports multiple video URLs (videoUrls array); falls back to single videoUrl.

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
  playerHeaderFrom: '#2E1F35',
  playerHeaderTo: '#4A2F52',
  accent: '#8B5FBF',
  accentSoft: '#EDE7F6',
  gold: '#E8B84B',
  paper: '#FFFFFF',
  canvas: '#F5F4F8',
  ink: '#1E1B24',
  slate: '#6B6478',
};

// ─── Helpers ───────────────────────────────────────────────────────────

const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
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
  `<img src="${buildImgSrc(src)}" alt="${alt}" class="note-image" />`;

const inlineFormat = (str) => {
  let out = str;
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => buildImageTag(alt, src));
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (m, text, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="note-link">${text}</a>`
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
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
      html += `<div class="note-tip">${inlineFormat(quote[1])}</div>`;
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

// ─── Split content into pages based on headings ──────────────────────
const splitIntoPages = (content) => {
  if (!content) return [{ title: 'No Content', content: '' }];

  const lines = content.split('\n');
  const pages = [];
  let currentPage = [];
  let currentTitle = 'Introduction';
  let hasHeading = false;

  lines.forEach((line) => {
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      // Save previous page if it has content
      if (currentPage.length > 0) {
        pages.push({
          title: currentTitle,
          content: currentPage.join('\n')
        });
      }
      currentTitle = headingMatch[2];
      currentPage = [line];
      hasHeading = true;
    } else {
      currentPage.push(line);
    }
  });

  // Push the last page
  if (currentPage.length > 0) {
    pages.push({
      title: currentTitle,
      content: currentPage.join('\n')
    });
  }

  // If no headings were found, create a single page
  if (!hasHeading && pages.length === 0) {
    pages.push({
      title: 'Content',
      content: content
    });
  }

  return pages;
};

const NOTE_STYLES = `
  .notes-content { color: #1e293b; font-family: Inter, system-ui, sans-serif; }
  .notes-content .note-h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 8px 0 18px; line-height: 1.3; }
  .notes-content .note-h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 32px 0 14px; line-height: 1.35; padding-top: 4px; }
  .notes-content .note-h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin: 24px 0 10px; }
  .notes-content .note-paragraph { margin: 0 0 16px; line-height: 1.75; font-size: 16px; }
  .notes-content .note-list { margin: 0 0 16px; padding-left: 22px; line-height: 1.75; font-size: 16px; }
  .notes-content .note-list li { margin-bottom: 6px; }
  .notes-content .note-tip { background: #fef9e7; border-left: 4px solid #f5b942; padding: 14px 18px; border-radius: 8px; margin: 18px 0; font-size: 15px; color: #7a5c00; line-height: 1.6; }
  .notes-content .note-link { color: #4f46e5; text-decoration: underline; text-decoration-color: #c7d2fe; }
  .notes-content .note-image { max-width: 100%; border-radius: 12px; margin: 22px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block; }
  
  .page-slide-in { animation: slideIn 0.3s ease-out; }
  @keyframes slideIn {
    from { opacity: 0.5; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

// ─── Sidebar leaf-type config (order, icon, label) ────────────────────
const CONTENT_TYPES = [
  { key: 'video',     icon: '🎬', label: 'Video Tutorial' },
  { key: 'notes',     icon: '📄', label: 'Tutorial' },
  { key: 'interview', icon: '🎤', label: 'Interview Qs' },
  { key: 'exam',      icon: '📝', label: 'Exam Question' },
  { key: 'labs',      icon: '🧪', label: 'Lab Exercise' },
];

// ─── Section components ───────────────────────────────────────────────

// ─── NotesTab with Pagination ──────────────────────────────────────────
function NotesTab({ content }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (content) {
      const splitPages = splitIntoPages(content);
      setPages(splitPages);
      setCurrentPage(0);
    }
  }, [content]);

  const totalPages = pages.length;

  const nextPage = useCallback(() => {
    setCurrentPage((p) => (p < totalPages - 1 ? p + 1 : p));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((p) => (p > 0 ? p - 1 : p));
  }, []);

  // Keyboard navigation — declared unconditionally, before any early return,
  // so this hook always runs in the same order regardless of `content`.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);

  if (!content || pages.length === 0) {
    return <div className="empty-state">📝 No notes for this section.</div>;
  }

  const currentPageData = pages[currentPage] || { title: 'Content', content: '' };
  const html = renderRichContent(currentPageData.content);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    setTouchDeltaX(diff);

    // Only prevent scroll if horizontal swipe detected
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    const SWIPE_THRESHOLD = 50;
    if (isDragging && Math.abs(touchDeltaX) > SWIPE_THRESHOLD) {
      if (touchDeltaX < 0 && currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      } else if (touchDeltaX > 0 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsDragging(false);
  };

  const goToPage = (index) => {
    if (index >= 0 && index < totalPages) {
      setCurrentPage(index);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Page Title */}
      <div style={{
        fontSize: '16px',
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: '16px',
        padding: '10px 14px',
        background: '#f8fafc',
        borderRadius: '8px',
        borderLeft: '4px solid #8B5FBF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>{currentPageData.title}</span>
        <span style={{
          fontSize: '12px',
          color: '#94a3b8',
          fontWeight: 500,
        }}>
          {totalPages > 1 ? `Page ${currentPage + 1} of ${totalPages}` : ''}
        </span>
      </div>

      {/* Content */}
      <div
        className={`notes-content ${totalPages > 1 ? 'page-slide-in' : ''}`}
        key={currentPage}
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          maxWidth: '100%',
          overflowX: 'auto',
          userSelect: 'none',
          minHeight: '200px',
        }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ marginTop: '24px' }}>
          {/* Progress Dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}>
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                style={{
                  width: index === currentPage ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
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

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}>
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: '1px solid #e2e8f0',
                background: currentPage === 0 ? '#f1f5f9' : '#fff',
                color: currentPage === 0 ? '#cbd5e1' : '#334155',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                transition: 'all 0.2s',
                flex: 1,
                maxWidth: '140px',
              }}
            >
              ← Previous
            </button>

            <span style={{
              fontSize: '13px',
              color: '#94a3b8',
              fontWeight: 500,
            }}>
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: '1px solid #e2e8f0',
                background: currentPage === totalPages - 1 ? '#f1f5f9' : '#8B5FBF',
                color: currentPage === totalPages - 1 ? '#cbd5e1' : '#fff',
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                transition: 'all 0.2s',
                flex: 1,
                maxWidth: '140px',
              }}
            >
              Next →
            </button>
          </div>

          {/* Swipe hint */}
          <p style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '12px',
          }}>
            👆 Swipe left/right to navigate pages
          </p>
        </div>
      )}
    </div>
  );
}

// ─── VideoTab ──────────────────────────────────────────────────────────
function VideoTab({ videoUrls }) {
  const urls = Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : []);
  if (urls.length === 0) return <div className="empty-state">🎬 No video for this section.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {urls.map((url, idx) => {
        const embed = getEmbedUrl(url);
        if (!embed) return null;
        return (
          <div key={idx}>
            {urls.length > 1 && (
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#C9C5D6', marginBottom: '8px' }}>
                Video {idx + 1} of {urls.length}
              </div>
            )}
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', background: '#000' }}>
              <iframe src={embed} title={`Video ${idx + 1}`} frameBorder="0" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BackToTop({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', margin: '20px auto 0', background: 'transparent',
        border: '1px solid #d8d4e0', padding: '6px 16px', borderRadius: '30px',
        cursor: 'pointer', fontSize: '13px', color: '#6B6478', fontWeight: 500,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#F0EDF6')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      ⬆ Back to Top
    </button>
  );
}

function InterviewTab({ questions, onBackToTop }) {
  const [expanded, setExpanded] = useState({});
  if (!questions || questions.length === 0) return <div className="empty-state">🎤 No interview questions.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {questions.map((q, idx) => (
        <div key={q.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E7E3EE', overflow: 'hidden' }}>
          <div
            onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', background: '#FAF9FC', cursor: 'pointer',
              fontWeight: 600, color: '#1E1B24',
            }}
          >
            <span>{idx + 1}. {q.question}</span>
            <span style={{ fontSize: '14px', color: '#8B7FA0' }}>{expanded[q.id] ? '▲' : '▼'}</span>
          </div>
          {expanded[q.id] && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E7E3EE', background: '#fff', color: '#3A3548', lineHeight: '1.6' }}>
              {q.answer}
            </div>
          )}
        </div>
      ))}
      <BackToTop onClick={onBackToTop} />
    </div>
  );
}

function ExamTab({ questions, onScoreUpdate, onBackToTop }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  if (!questions || questions.length === 0) return <div className="empty-state">📝 No MCQ questions.</div>;

  const handleAnswer = (qId, answer) => setAnswers((prev) => ({ ...prev, [qId]: answer }));
  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    const total = questions.length;
    setScore({ correct, total });
    setSubmitted(true);
    if (onScoreUpdate) onScoreUpdate(correct, total);
  };

  return (
    <div>
      {questions.map((q, idx) => (
        <div key={q.id} style={{ padding: '20px', background: '#fff', borderRadius: '16px', border: '1px solid #E7E3EE', marginBottom: '16px' }}>
          <p style={{ fontWeight: 700, marginBottom: '16px', fontSize: '16px', color: '#1E1B24' }}>{idx + 1}. {q.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optText = q[`option${opt}`];
              if (!optText) return null;
              return (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 12px', borderRadius: '10px' }}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleAnswer(q.id, opt)}
                    disabled={submitted}
                    style={{ accentColor: C.accent, width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '14px' }}><strong>{opt}:</strong> {optText}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <button
          onClick={handleSubmit}
          style={{ marginTop: '4px', padding: '12px 28px', background: C.accent, color: '#fff', border: 'none', borderRadius: '40px', fontWeight: 600, cursor: 'pointer' }}
        >
          Submit Answers
        </button>
      )}
      {submitted && score && (
        <div style={{ marginTop: '4px', padding: '16px', background: C.accentSoft, borderRadius: '14px', textAlign: 'center', fontWeight: 600, color: C.accent }}>
          🎉 Score: {score.correct} / {score.total} ({Math.round((score.correct / score.total) * 100)}%)
        </div>
      )}
      <BackToTop onClick={onBackToTop} />
    </div>
  );
}

function LabsTab({ labs, onBackToTop }) {
  const [completed, setCompleted] = useState({});
  if (!labs || labs.length === 0) return <div className="empty-state">🧪 No lab exercises.</div>;

  const markComplete = (labId) => setCompleted((prev) => ({ ...prev, [labId]: true }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {labs.map((lab, idx) => (
        <div key={lab.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E7E3EE', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <strong style={{ fontSize: '17px', color: '#1E1B24' }}>{idx + 1}. {lab.title}</strong>
            {!completed[lab.id] && (
              <button
                onClick={() => markComplete(lab.id)}
                style={{ padding: '6px 14px', background: '#2E9B6C', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                ✓ Mark Complete
              </button>
            )}
            {completed[lab.id] && <span style={{ fontSize: '13px', color: '#2E9B6C', fontWeight: 600 }}>✓ Completed</span>}
          </div>
          <div style={{ fontSize: '14px', color: '#4A4458', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{lab.instructions}</div>
        </div>
      ))}
      <BackToTop onClick={onBackToTop} />
    </div>
  );
}

// ─── Main CourseDetailView ────────────────────────────────────────────────
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

  const currentSub = subtopics[activeSection];
  const isCompleted = completedSections.includes(activeSection);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingData, currentSub]);

  const toggleTopic = (topicId) => setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));

  const selectSubtopic = async (sub, globalIndex) => {
    setActiveSection(globalIndex);
    setCurrentSubtopic(sub);
    await loadSubtopicImages(sub.id);
    if (isMobile) setShowSidebar(false);
  };

  const handleBackToTop = () => {
    const el = document.getElementById('cdv-scroll-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (contentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p>Loading course content…</p>
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
      padding: isMobile ? '12px 16px' : '14px 28px', 
      background: C.paper, 
      borderBottom: '1px solid #E7E3EE',
      flexWrap: 'wrap',
      gap: '8px',
    },
    courseName: { fontSize: isMobile ? '14px' : '15px', fontWeight: 800, color: C.ink, letterSpacing: '-0.2px' },
    topStripRight: { display: 'flex', alignItems: 'center', gap: '10px' },
    backBtn: { 
      background: 'transparent', 
      border: '1px solid #D8D4E0', 
      padding: isMobile ? '6px 14px' : '7px 16px', 
      borderRadius: '30px', 
      cursor: 'pointer', 
      fontSize: isMobile ? '12px' : '13px', 
      fontWeight: 600, 
      color: C.slate 
    },
    menuBtn: {
      background: 'transparent',
      border: '1px solid #D8D4E0',
      padding: isMobile ? '6px 12px' : '7px 16px',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: isMobile ? '18px' : '16px',
      color: C.slate,
      display: isMobile ? 'block' : 'none',
    },

    shell: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', 
      minHeight: 'calc(100vh - 53px)' 
    },

    // ── Mobile overlay ──
    mobileOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 999,
      display: isMobile && showSidebar ? 'block' : 'none',
    },

    // ── Sidebar ──
    sidebar: { 
      background: C.sidebarBg, 
      color: C.sidebarText, 
      padding: '18px 0', 
      overflowY: 'auto',
      maxHeight: isMobile ? '100vh' : 'calc(100vh - 53px)',
      position: isMobile ? 'fixed' : 'sticky',
      top: isMobile ? '0' : '53px',
      left: isMobile ? '-100%' : 'auto',
      width: isMobile ? '300px' : 'auto',
      height: isMobile ? '100vh' : 'auto',
      zIndex: 1000,
      transition: isMobile ? 'left 0.3s ease-in-out' : 'none',
      boxShadow: isMobile ? '4px 0 20px rgba(0,0,0,0.3)' : 'none',
    },
    sidebarOpen: {
      left: '0',
    },
    sidebarCloseBtn: {
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 18px 12px',
      borderBottom: `1px solid ${C.sidebarLine}`,
      marginBottom: '8px',
    },
    sidebarCourseTitle: { 
      fontSize: isMobile ? '14px' : '15px', 
      fontWeight: 800, 
      color: '#fff', 
      padding: isMobile ? '0' : '0 18px 16px', 
      borderBottom: isMobile ? 'none' : `1px solid ${C.sidebarLine}`,
      marginBottom: isMobile ? '0' : '8px',
    },
    topicHeader: (isOpen) => ({ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: isMobile ? '10px 18px' : '11px 18px', 
      cursor: 'pointer', 
      fontSize: isMobile ? '12px' : '13px', 
      fontWeight: 700, 
      color: isOpen ? '#fff' : C.sidebarText, 
      background: isOpen ? C.sidebarBgAlt : 'transparent' 
    }),
    topicChevron: { fontSize: '11px', color: C.sidebarTextDim, transition: 'transform 0.15s' },
    subtopicRow: (isActive) => ({
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      padding: isMobile ? '8px 18px 8px 26px' : '9px 18px 9px 30px', 
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '12.5px', 
      fontWeight: isActive ? 700 : 500,
      color: isActive ? '#fff' : C.sidebarText,
      background: isActive ? C.sidebarActive : 'transparent',
      borderLeft: isActive ? `3px solid ${C.accent}` : '3px solid transparent',
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
      gap: '9px', 
      padding: isMobile ? '6px 18px 6px 44px' : '7px 18px 7px 52px', 
      cursor: 'pointer',
      fontSize: isMobile ? '10.5px' : '11.5px', 
      fontWeight: isActive ? 700 : 500, 
      letterSpacing: '0.02em', 
      textTransform: 'uppercase',
      color: isActive ? C.gold : C.sidebarTextDim,
      background: isActive ? 'rgba(232,184,75,0.08)' : 'transparent',
    }),
    leafLoading: { 
      padding: isMobile ? '6px 18px 6px 44px' : '7px 18px 7px 52px', 
      fontSize: isMobile ? '10.5px' : '11.5px', 
      color: C.sidebarTextDim, 
      fontStyle: 'italic' 
    },

    // ── Main panel ──
    main: { 
      padding: isMobile ? '16px' : '28px 32px', 
      maxWidth: '980px', 
      margin: '0 auto', 
      width: '100%' 
    },
    progressRow: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      marginBottom: isMobile ? '14px' : '18px' 
    },
    progressBarOuter: { flex: 1, background: '#E7E3EE', borderRadius: '20px', height: '6px', overflow: 'hidden' },
    progressBarInner: { background: C.accent, height: '100%', width: `${progress}%`, transition: 'width 0.3s' },
    progressPct: { fontSize: isMobile ? '11px' : '12px', fontWeight: 700, color: C.slate, whiteSpace: 'nowrap' },

    playerFrame: { 
      borderRadius: isMobile ? '14px' : '18px', 
      overflow: 'hidden', 
      background: `linear-gradient(160deg, ${C.playerHeaderFrom}, ${C.playerHeaderTo})`, 
      boxShadow: '0 20px 40px -20px rgba(46,31,53,0.5)' 
    },
    playerHeader: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: isMobile ? '14px 16px' : '16px 22px', 
      color: '#fff',
      flexWrap: 'wrap',
      gap: '8px',
    },
    playerHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    playerHeaderIcon: { 
      width: isMobile ? '28px' : '32px', 
      height: isMobile ? '28px' : '32px', 
      borderRadius: '8px', 
      background: 'rgba(255,255,255,0.14)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: isMobile ? '14px' : '16px' 
    },
    playerHeaderTitle: { fontSize: isMobile ? '14px' : '15px', fontWeight: 700 },
    playerHeaderSubtitle: { fontSize: isMobile ? '11px' : '12px', opacity: 0.7, marginTop: '2px' },
    playerHeaderIcons: { display: 'flex', gap: '14px', fontSize: '15px', opacity: 0.8, alignItems: 'center' },

    playerBody: { 
      background: C.paper, 
      padding: isMobile ? '16px' : '28px 30px', 
      minHeight: isMobile ? '280px' : '340px' 
    },
    breadcrumb: { 
      display: 'flex', 
      flexWrap: 'wrap', 
      alignItems: 'center', 
      gap: '6px', 
      fontSize: isMobile ? '11px' : '12.5px', 
      color: '#A79FBC', 
      marginBottom: isMobile ? '2px' : '4px' 
    },
    breadcrumbSep: { color: '#5A5468' },

    completeButton: { 
      background: '#2E9B6C', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '10px 20px' : '12px 24px', 
      borderRadius: '40px', 
      fontSize: isMobile ? '13px' : '14px', 
      fontWeight: '600', 
      cursor: 'pointer', 
      marginTop: '20px', 
      width: '100%' 
    },
    completedBadge: { 
      fontSize: isMobile ? '10px' : '12px', 
      background: '#DFF3E8', 
      color: '#1E7A4C', 
      padding: '4px 10px', 
      borderRadius: '40px', 
      whiteSpace: 'nowrap', 
      fontWeight: 700 
    },

    emptyState: { 
      textAlign: 'center', 
      padding: isMobile ? '30px 16px' : '50px 20px', 
      color: '#A79FBC',
      fontSize: isMobile ? '14px' : '16px',
    },
  };

  const typeMeta = CONTENT_TYPES.find((t) => t.key === activeContentType) || CONTENT_TYPES[0];

  const renderPanelContent = () => {
    if (!currentSub) return <div style={styles.emptyState}>Select a section from the sidebar to begin</div>;
    if (loadingData) return <div style={{ textAlign: 'center', padding: '40px', color: C.slate, fontSize: '14px' }}>Loading content…</div>;
    if (availableTypes.length === 0) return <div style={styles.emptyState}>No content has been added for this section yet.</div>;

    switch (activeContentType) {
      case 'video': return <VideoTab videoUrls={videoUrls} />;
      case 'notes': return <NotesTab content={currentSub.content} />;
      case 'interview': return <InterviewTab questions={interviewQuestions} onBackToTop={handleBackToTop} />;
      case 'exam': return <ExamTab questions={examQuestions} onScoreUpdate={() => {}} onBackToTop={handleBackToTop} />;
      case 'labs': return <LabsTab labs={labs} onBackToTop={handleBackToTop} />;
      default: return null;
    }
  };

  return (
    <div style={styles.page}>
      <style>{NOTE_STYLES}</style>
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
          {/* Mobile Overlay */}
          {isMobile && showSidebar && (
            <div style={styles.mobileOverlay} onClick={() => setShowSidebar(false)} />
          )}

          <div style={styles.shell}>
            {/* ─── Sidebar: Topic → Subtopic → Content type ───────────────── */}
            <aside 
              id="mobile-sidebar" 
              style={{ 
                ...styles.sidebar, 
                ...(isMobile && showSidebar ? styles.sidebarOpen : {}) 
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
                      padding: '4px 8px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              {!isMobile && <div style={styles.sidebarCourseTitle}>{selectedCourse.title}</div>}
              <div>
                {topics.map((topic) => {
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
              </div>
            </aside>

            {/* ─── Main content panel ──────────────────────────────────────── */}
            <main style={styles.main}>
              <div style={styles.progressRow}>
                <div style={styles.progressBarOuter}>
                  <div style={styles.progressBarInner} />
                </div>
                <span style={styles.progressPct}>{Math.round(progress)}% complete</span>
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
                <div style={styles.playerBody}>
                  {renderPanelContent()}
                </div>
              </div>

              {currentSub && (
                <button style={styles.completeButton} onClick={() => markSectionComplete(activeSection)} disabled={isCompleted}>
                  {isCompleted ? '✓ Section Completed' : '✓ Mark Complete'}
                </button>
              )}
            </main>
          </div>
        </>
      )}

      {activeView === 'gallery' && (
        <div style={{ background: '#fff', borderRadius: '24px', padding: isMobile ? '16px' : '24px', margin: isMobile ? '16px' : '24px 32px' }}>
          <h2 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: '700', marginBottom: '24px' }}>📸 All Course Images ({images.length})</h2>
          {images.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No images yet</p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))', 
              gap: isMobile ? '12px' : '20px' 
            }}>
              {images.map((img) => {
                const safeId = img.subTopicId || img.subtopicId;
                if (!safeId) return null;
                const imageUrl = buildImageUrl(safeId, img.fileName);
                return (
                  <div key={img.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => window.open(imageUrl, '_blank')}>
                    <img src={imageUrl} alt={`Page ${img.pageNumber}`} style={{ width: '100%', height: isMobile ? '120px' : '160px', objectFit: 'cover' }} onError={() => handleImageError(img.id)} />
                    <div style={{ padding: '10px', fontSize: isMobile ? '11px' : '12px', textAlign: 'center', background: '#f8fafc', color: '#64748b' }}>Page {img.pageNumber} · {img.width}×{img.height}</div>
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