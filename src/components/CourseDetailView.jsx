// src/components/CourseDetailView.jsx
// Updated to support multiple video URLs (videoUrls array) from the admin panel.
// Falls back to the old single videoUrl if videoUrls is not present.

import React, { useState, useEffect, useCallback } from 'react';
import {
  getSubtopicImages,
  getSubtopicInterviewQuestions,
  getSubtopicExamQuestions,
  getSubtopicLabs,
} from '../api/UserApi';

const API_BASE = 'http://localhost:8082/api';

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
`;

// ─── Section components ───────────────────────────────────────────────

function NotesTab({ content }) {
  if (!content) return <div className="empty-state">📝 No notes for this section.</div>;
  const html = renderRichContent(content);
  return (
    <>
      <style>{NOTE_STYLES}</style>
      <div
        className="notes-content"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ maxWidth: '100%', overflowX: 'auto', userSelect: 'none' }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      />
    </>
  );
}

// ─── Updated VideoTab to accept an array of URLs ──────────────────────
function VideoTab({ videoUrls }) {
  // If videoUrls is a string, convert to array (legacy support)
  const urls = Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : []);

  if (urls.length === 0) return <div className="empty-state">🎬 No video for this section.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {urls.map((url, idx) => {
        const embed = getEmbedUrl(url);
        if (!embed) return null;
        return (
          <div key={idx}>
            {urls.length > 1 && (
              <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a', marginBottom: '8px' }}>
                Video {idx + 1}
              </div>
            )}
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '16px', background: '#000' }}>
              <iframe src={embed} title={`Video ${idx + 1}`} frameBorder="0" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Other tabs (unchanged) ──────────────────────────────────────────
function InterviewTab({ questions }) {
  const [expanded, setExpanded] = useState({});
  if (!questions || questions.length === 0) return <div className="empty-state">🎤 No interview questions.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {questions.map((q, idx) => (
        <div key={q.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div
            onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              background: '#f8fafc',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#0f172a',
            }}
          >
            <span>{idx + 1}. {q.question}</span>
            <span style={{ fontSize: '14px', color: '#64748b' }}>{expanded[q.id] ? '▲' : '▼'}</span>
          </div>
          {expanded[q.id] && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#fff', color: '#334155', lineHeight: '1.6' }}>
              {q.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExamTab({ questions, onScoreUpdate }) {
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
        <div key={q.id} style={{ padding: '20px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <p style={{ fontWeight: 700, marginBottom: '16px', fontSize: '16px', color: '#0f172a' }}>{idx + 1}. {q.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optText = q[`option${opt}`];
              if (!optText) return null;
              return (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 12px', borderRadius: '12px' }}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleAnswer(q.id, opt)}
                    disabled={submitted}
                    style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }}
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
          style={{
            marginTop: '8px',
            padding: '12px 28px',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '40px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Submit Answers
        </button>
      )}
      {submitted && score && (
        <div style={{ marginTop: '8px', padding: '16px', background: '#eef2ff', borderRadius: '16px', textAlign: 'center', fontWeight: 600, color: '#4f46e5' }}>
          🎉 Score: {score.correct} / {score.total} ({Math.round((score.correct / score.total) * 100)}%)
        </div>
      )}
    </div>
  );
}

function LabsTab({ labs }) {
  const [completed, setCompleted] = useState({});
  if (!labs || labs.length === 0) return <div className="empty-state">🧪 No lab exercises.</div>;

  const markComplete = (labId) => setCompleted((prev) => ({ ...prev, [labId]: true }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {labs.map((lab, idx) => (
        <div key={lab.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <strong style={{ fontSize: '18px', color: '#0f172a' }}>{idx + 1}. {lab.title}</strong>
            {!completed[lab.id] && (
              <button
                onClick={() => markComplete(lab.id)}
                style={{
                  padding: '6px 14px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✓ Mark Complete
              </button>
            )}
            {completed[lab.id] && <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>✓ Completed</span>}
          </div>
          <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{lab.instructions}</div>
        </div>
      ))}
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
  const [expandedTopics, setExpandedTopics] = useState({});
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const isMobile = window.innerWidth < 768;

  const currentSub = subtopics[activeSection];
  const isCompleted = completedSections.includes(activeSection);

  // ── Compute video URLs array ──────────────────────────────────────
  // Support both the new 'videoUrls' array and the old 'videoUrl' string
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

  const toggleTopic = (topicId) => setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));

  const scrollToSection = (anchorId) => {
    const el = document.getElementById(anchorId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (contentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p>Loading course content…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Section list – now uses videoUrls.length > 0 instead of !!videoUrl
  const sectionList = [
    { key: 'video', label: '🎥 Video', anchor: 'section-video', available: videoUrls.length > 0 },
    { key: 'notes', label: '📄 Notes', anchor: 'section-notes', available: !!currentSub?.content },
    { key: 'interview', label: '❓ Interview Questions', anchor: 'section-interview', available: interviewQuestions.length > 0 },
    { key: 'exam', label: '📝 MCQ Practice', anchor: 'section-exam', available: examQuestions.length > 0 },
    { key: 'labs', label: '🧪 Labs', anchor: 'section-labs', available: labs.length > 0 },
  ].filter((s) => s.available);

  const buildImageUrl = (subId, fileName) => `${API_BASE}/subtopic-images/${subId}/${fileName}`;

  // ─── Styles ─────────────────────────────────────────────────────────
  const styles = {
    container: { background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
    detailContainer: { maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '20px' : '32px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
    backButton: { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '40px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#4f46e5' },
    courseTitle: { fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#0f172a', margin: 0 },

    progressCard: { background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' },
    progressLabel: { fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '12px' },
    progressBar: { background: '#e2e8f0', borderRadius: '20px', height: '8px', overflow: 'hidden' },
    progressFill: { background: '#4f46e5', height: '100%', borderRadius: '20px', width: `${progress}%`, transition: 'width 0.3s' },
    progressStats: { display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px', color: '#64748b' },

    splitLayout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 280px',
      gap: '32px',
    },

    sidebar: { background: '#fff', borderRadius: '20px', padding: '18px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eef2f6', position: isMobile ? 'relative' : 'sticky', top: '24px', height: isMobile ? 'auto' : 'calc(100vh - 48px)', overflowY: 'auto' },
    sidebarTitle: { fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', letterSpacing: '0.01em' },
    topicItem: { marginBottom: '4px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' },
    topicHeader: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 2px', fontWeight: '600', fontSize: '13px', color: '#1e293b' },
    topicIcon: { width: '15px', height: '15px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '3px' },
    topicCount: { marginLeft: 'auto', fontSize: '10px', color: '#94a3b8', fontWeight: 500 },
    subtopicList: { listStyle: 'none', padding: 0, margin: '2px 0 8px 23px', display: 'flex', flexDirection: 'column', gap: '1px' },
    subtopicItem: (isActive, isSecCompleted) => ({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 8px',
      cursor: 'pointer',
      borderRadius: '6px',
      fontSize: '13px',
      color: isActive ? '#4f46e5' : (isSecCompleted ? '#0f172a' : '#64748b'),
      fontWeight: isActive ? 700 : 400,
      background: isActive ? '#eef2ff' : 'transparent',
    }),

    contentPanel: { background: '#fff', borderRadius: '24px', padding: isMobile ? '24px' : '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' },
    breadcrumb: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8', marginBottom: '14px' },
    breadcrumbSep: { color: '#cbd5e1' },
    breadcrumbActive: { color: '#475569', fontWeight: 600 },
    sectionTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' },
    sectionTitle: { fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.25 },
    completedBadge: { fontSize: '13px', background: '#d1fae5', color: '#059669', padding: '4px 12px', borderRadius: '40px', whiteSpace: 'nowrap' },

    lessonBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 22px', marginBottom: '36px' },
    lessonBoxTitle: { fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' },
    lessonBoxList: { margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' },
    lessonBoxLink: { color: '#4f46e5', fontSize: '14px', fontWeight: 500, textDecoration: 'none', cursor: 'pointer' },

    contentSection: { marginBottom: '44px', paddingBottom: '4px', scrollMarginTop: '24px' },
    contentSectionHeading: { fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #eef2f6' },

    completeButton: { background: '#22c55e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '40px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '12px', width: '100%' },
    emptyState: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.detailContainer}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={handleBack}>← Back to Courses</button>
        </div>

        {activeView === 'split' && (
          <div style={styles.splitLayout}>
            {/* Article (left) */}
            <div style={styles.contentPanel}>
              {!currentSub ? (
                <div style={styles.emptyState}>Select a section from the sidebar to begin</div>
              ) : (
                <>
                  {/* Breadcrumb */}
                  <div style={styles.breadcrumb}>
                    <span>Home</span>
                    <span style={styles.breadcrumbSep}>›</span>
                    <span>{selectedCourse.title}</span>
                    {currentTopic && (
                      <>
                        <span style={styles.breadcrumbSep}>›</span>
                        <span>{currentTopic.title}</span>
                      </>
                    )}
                    <span style={styles.breadcrumbSep}>›</span>
                    <span style={styles.breadcrumbActive}>{currentSub.title}</span>
                  </div>

                  <div style={styles.sectionTitleRow}>
                    <h2 style={styles.sectionTitle}>{currentSub.title}</h2>
                    {isCompleted && <span style={styles.completedBadge}>✅ Completed</span>}
                  </div>

                  {/* Lesson Contents jump box */}
                  {sectionList.length > 0 && (
                    <div style={styles.lessonBox}>
                      <div style={styles.lessonBoxTitle}>Lesson Contents</div>
                      <ol style={styles.lessonBoxList}>
                        {sectionList.map((s) => (
                          <li key={s.key}>
                            <a
                              href={`#${s.anchor}`}
                              style={styles.lessonBoxLink}
                              onClick={(e) => {
                                e.preventDefault();
                                scrollToSection(s.anchor);
                              }}
                            >
                              {s.label}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* ─── Stacked sections ──────────────────────────── */}
                  {videoUrls.length > 0 && (
                    <section id="section-video" style={styles.contentSection}>
                      <h3 style={styles.contentSectionHeading}>🎥 Video</h3>
                      <VideoTab videoUrls={videoUrls} />
                    </section>
                  )}

                  {currentSub.content && (
                    <section id="section-notes" style={styles.contentSection}>
                      <h3 style={styles.contentSectionHeading}>📄 Notes</h3>
                      <NotesTab content={currentSub.content} />
                    </section>
                  )}

                  {loadingData && (
                    <div style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: '14px' }}>
                      Loading interview, exam, and lab content…
                    </div>
                  )}

                  {interviewQuestions.length > 0 && (
                    <section id="section-interview" style={styles.contentSection}>
                      <h3 style={styles.contentSectionHeading}>❓ Interview Questions</h3>
                      <InterviewTab questions={interviewQuestions} />
                    </section>
                  )}

                  {examQuestions.length > 0 && (
                    <section id="section-exam" style={styles.contentSection}>
                      <h3 style={styles.contentSectionHeading}>📝 MCQ Practice</h3>
                      <ExamTab questions={examQuestions} />
                    </section>
                  )}

                  {labs.length > 0 && (
                    <section id="section-labs" style={styles.contentSection}>
                      <h3 style={styles.contentSectionHeading}>🧪 Labs</h3>
                      <LabsTab labs={labs} />
                    </section>
                  )}

                  {sectionList.length === 0 && !loadingData && (
                    <div style={styles.emptyState}>No content has been added for this section yet.</div>
                  )}

                  <button
                    style={styles.completeButton}
                    onClick={() => markSectionComplete(activeSection)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? '✓ Section Completed' : '✓ Mark Complete'}
                  </button>
                </>
              )}
            </div>

            {/* Sidebar (right) */}
            <div style={styles.sidebar}>
              <h3 style={styles.sidebarTitle}>Course Contents</h3>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                {selectedCourse.title}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topics.map((topic) => {
                  const topicSubs = topic.subtopics || [];
                  const isExpanded = expandedTopics[topic.id];
                  return (
                    <li key={topic.id} style={styles.topicItem}>
                      <div style={styles.topicHeader} onClick={() => toggleTopic(topic.id)}>
                        <span style={styles.topicIcon}>{isExpanded ? '−' : '+'}</span>
                        <span>{topic.title}</span>
                        <span style={styles.topicCount}>{topicSubs.length}</span>
                      </div>
                      {isExpanded && (
                        <ul style={styles.subtopicList}>
                          {topicSubs.map((sub) => {
                            const globalIndex = subtopics.findIndex((s) => String(s.id) === String(sub.id));
                            if (globalIndex === -1) return null;
                            const isActive = activeSection === globalIndex;
                            const isSecCompleted = completedSections.includes(globalIndex);
                            return (
                              <li
                                key={sub.id}
                                style={styles.subtopicItem(isActive, isSecCompleted)}
                                onClick={async () => {
                                  setActiveSection(globalIndex);
                                  setCurrentSubtopic(sub);
                                  await loadSubtopicImages(sub.id);
                                }}
                              >
                                <span>{sub.title}</span>
                                {isSecCompleted && <span style={{ fontSize: '11px', color: '#10b981' }}>✓</span>}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {activeView === 'gallery' && (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', marginTop: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>📸 All Course Images ({images.length})</h2>
            {images.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No images yet</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {images.map((img) => {
                  const safeId = img.subTopicId || img.subtopicId;
                  if (!safeId) return null;
                  const imageUrl = buildImageUrl(safeId, img.fileName);
                  return (
                    <div key={img.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => window.open(imageUrl, '_blank')}>
                      <img src={imageUrl} alt={`Page ${img.pageNumber}`} style={{ width: '100%', height: '160px', objectFit: 'cover' }} onError={() => handleImageError(img.id)} />
                      <div style={{ padding: '10px', fontSize: '12px', textAlign: 'center', background: '#f8fafc', color: '#64748b' }}>Page {img.pageNumber} · {img.width}×{img.height}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}