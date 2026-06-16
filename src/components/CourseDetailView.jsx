// src/components/CourseDetailView.jsx – Tighter left sidebar
import React, { useState, useEffect, useCallback } from 'react';
import {
  getSubtopicImages,
  getSubtopicInterviewQuestions,
  getSubtopicExamQuestions,
  getSubtopicLabs,
} from '../api/UserApi';

const API_BASE = 'http://localhost:8082/api';

// Helper: convert YouTube URL to embed URL
const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
  return url;
};

// Helper: render Markdown images with absolute URLs (strip /admin)
const renderMarkdownImages = (text) => {
  if (!text) return '';
  return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    let cleanSrc = src;
    if (cleanSrc.startsWith('/admin/')) cleanSrc = cleanSrc.slice(6);
    const fullSrc = `${API_BASE}${cleanSrc}`;
    return `<img src="${fullSrc}" alt="${alt}" style="max-width:100%; border-radius:12px; margin:20px 0; box-shadow:0 4px 12px rgba(0,0,0,0.08);" />`;
  });
};

// ─── Tab Components (unchanged) ──────────────────────────────────────────
function NotesTab({ content }) {
  if (!content) return <div className="empty-state">📝 No notes for this section.</div>;
  const html = renderMarkdownImages(content).replace(/\n/g, '<br/>');

  const handleCopy = (e) => e.preventDefault();
  const handleCut = (e) => e.preventDefault();
  const handleContextMenu = (e) => e.preventDefault();

  return (
    <div
      className="notes-content"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        lineHeight: '1.7',
        color: '#1e293b',
        fontSize: '16px',
        fontFamily: 'Inter, system-ui, sans-serif',
        maxWidth: '100%',
        overflowX: 'auto',
        userSelect: 'none',
      }}
      onCopy={handleCopy}
      onCut={handleCut}
      onContextMenu={handleContextMenu}
    />
  );
}

function VideoTab({ videoUrl }) {
  const embed = getEmbedUrl(videoUrl);
  if (!videoUrl) return <div className="empty-state">🎬 No video for this section.</div>;
  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '16px', marginTop: '16px', background: '#000' }}>
      <iframe src={embed} title="Video" frameBorder="0" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
    </div>
  );
}

function InterviewTab({ questions }) {
  const [expanded, setExpanded] = useState({});
  if (!questions || questions.length === 0) return <div className="empty-state">🎤 No interview questions.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
      {questions.map((q, idx) => (
        <div key={q.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
          <div
            onClick={() => setExpanded(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
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

  const handleAnswer = (qId, answer) => setAnswers(prev => ({ ...prev, [qId]: answer }));
  const handleSubmit = () => {
    let correct = 0;
    questions.forEach(q => {
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
            {['A', 'B', 'C', 'D'].map(opt => {
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
            marginTop: '24px',
            padding: '12px 28px',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '40px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          Submit Answers
        </button>
      )}
      {submitted && score && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#eef2ff', borderRadius: '16px', textAlign: 'center', fontWeight: 600, color: '#4f46e5' }}>
          🎉 Score: {score.correct} / {score.total} ({Math.round((score.correct/score.total)*100)}%)
        </div>
      )}
    </div>
  );
}

function LabsTab({ labs }) {
  const [completed, setCompleted] = useState({});
  if (!labs || labs.length === 0) return <div className="empty-state">🧪 No lab exercises.</div>;

  const markComplete = (labId) => setCompleted(prev => ({ ...prev, [labId]: true }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
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

// ─── Main CourseDetailView – Tighter left sidebar ────────────────────────
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
  const [activeContentTab, setActiveContentTab] = useState('notes');
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const isMobile = window.innerWidth < 768;

  const currentSub = subtopics[activeSection];
  const isCompleted = completedSections.includes(activeSection);

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

  useEffect(() => setActiveContentTab('notes'), [activeSection]);

  const toggleTopic = (topicId) => setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));

  if (contentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p>Loading course content…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Helper for gallery image URLs
  const buildImageUrl = (subId, fileName) => `${API_BASE}/subtopic-images/${subId}/${fileName}`;

  // ─── Styles with tighter left sidebar ──────────────────────────────────
  const styles = {
    container: { background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
    detailContainer: { maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '20px' : '32px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
    backButton: { background: '#fff', border: '1px solid #e2e8f0', padding: '8px 20px', borderRadius: '40px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#4f46e5', transition: 'all 0.2s', ':hover': { background: '#f1f5f9' } },
    courseTitle: { fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#0f172a', margin: 0 },
    controls: { display: 'flex', gap: '12px' },
    controlBtn: (active) => ({
      padding: '8px 20px',
      border: '1px solid #e2e8f0',
      borderRadius: '40px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      background: active ? '#4f46e5' : '#fff',
      color: active ? '#fff' : '#475569',
      transition: 'all 0.2s',
    }),
    progressCard: { background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eef2f6' },
    progressLabel: { fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '12px' },
    progressBar: { background: '#e2e8f0', borderRadius: '20px', height: '8px', overflow: 'hidden' },
    progressFill: { background: '#4f46e5', height: '100%', borderRadius: '20px', width: `${progress}%`, transition: 'width 0.3s' },
    progressStats: { display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px', color: '#64748b' },
splitLayout: { 
  display: 'grid', 
  gridTemplateColumns: isMobile ? '1fr' : '1fr 280px',  // content first, then sidebar
  gap: '32px' 
},    sidebar: { background: '#fff', borderRadius: '20px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eef2f6', position: isMobile ? 'relative' : 'sticky', top: '24px', height: isMobile ? 'auto' : 'calc(100vh - 100px)', overflowY: 'auto' },
    sidebarTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', borderBottom: '2px solid #4f46e5', display: 'inline-block', paddingBottom: '4px' }, // slightly smaller
    topicItem: { marginBottom: '6px' },
    topicHeader: { display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', fontWeight: '600', fontSize: '13px', color: '#1e293b', transition: 'background 0.2s', ':hover': { background: '#f1f5f9' } }, // tighter padding
    subtopicList: { listStyle: 'none', padding: '0', margin: '0 0 0 8px' }, // less left margin
    subtopicItem: (isActive, isCompleted) => ({
      padding: '6px 10px 6px 20px', // reduced vertical and horizontal padding
      cursor: 'pointer',
      borderRadius: '8px',
      fontSize: '13px', // slightly smaller
      marginBottom: '2px',
      borderLeft: `3px solid ${isActive ? '#4f46e5' : (isCompleted ? '#10b981' : '#e2e8f0')}`,
      background: isActive ? '#eef2ff' : (isCompleted ? '#f0fdf4' : 'transparent'),
      color: isActive ? '#4f46e5' : (isCompleted ? '#059669' : '#475569'),
      fontWeight: isActive ? '500' : 'normal',
      transition: 'all 0.2s',
      ':hover': { background: '#f1f5f9' },
    }),
    contentPanel: { background: '#fff', borderRadius: '24px', padding: isMobile ? '24px' : '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eef2f6', maxHeight: isMobile ? 'auto' : 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    sectionHeader: { marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #eef2f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', position: 'sticky', top: 0, background: '#fff', zIndex: 10 },
    sectionTitle: { fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: '#0f172a' },
    completedBadge: { fontSize: '13px', background: '#d1fae5', color: '#059669', padding: '4px 12px', borderRadius: '40px' },
    tabsContainer: { display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '28px', flexWrap: 'wrap', position: 'sticky', top: '70px', background: '#fff', zIndex: 9, paddingBottom: '8px' },
    tabButton: (active) => ({
      padding: '8px 18px',
      background: 'none',
      border: 'none',
      fontSize: '14px',
      fontWeight: active ? 600 : 500,
      color: active ? '#4f46e5' : '#64748b',
      borderBottom: active ? '2px solid #4f46e5' : '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    scrollableContent: { overflowY: 'auto', paddingRight: '8px', maxHeight: isMobile ? 'auto' : 'calc(100vh - 280px)' },
    completeButton: { background: '#22c55e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '40px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '32px', width: '100%', transition: 'opacity 0.2s', ':disabled': { background: '#d1fae5', cursor: 'not-allowed' } },
    resetButton: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 20px', borderRadius: '40px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
    emptyState: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.detailContainer}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={handleBack}>← Back to Courses</button>
          <h1 style={styles.courseTitle}>{selectedCourse.title}</h1>
    
        </div>
    

      {activeView === 'split' && (
  <div style={styles.splitLayout}>
    {/* Content panel (left) */}
    <div style={styles.contentPanel}>
      {!currentSub ? (
        <div style={styles.emptyState}>Select a section from the sidebar to begin</div>
      ) : (
        <>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>{currentSub.title}</h2>
            {isCompleted && <span style={styles.completedBadge}>✅ Completed</span>}
          </div>

          <div style={styles.tabsContainer}>
            {['notes', 'video', 'interview', 'exam', 'labs'].map(tab => (
              <button
                key={tab}
                style={styles.tabButton(activeContentTab === tab)}
                onClick={() => setActiveContentTab(tab)}
              >
                {tab === 'notes' && '📄 Notes'}
                {tab === 'video' && '🎥 Video'}
                {tab === 'interview' && '❓ Interview'}
                {tab === 'exam' && '📝 MCQ'}
                {tab === 'labs' && '🧪 Labs'}
              </button>
            ))}
          </div>

          <div style={styles.scrollableContent}>
            {loadingData && activeContentTab !== 'notes' && activeContentTab !== 'video' && (
              <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div>
            )}

            {activeContentTab === 'notes' && <NotesTab content={currentSub.content} />}
            {activeContentTab === 'video' && <VideoTab videoUrl={currentSub.videoUrl} />}
            {activeContentTab === 'interview' && <InterviewTab questions={interviewQuestions} />}
            {activeContentTab === 'exam' && <ExamTab questions={examQuestions} />}
            {activeContentTab === 'labs' && <LabsTab labs={labs} />}

            <button
              style={styles.completeButton}
              onClick={() => markSectionComplete(activeSection)}
              disabled={isCompleted}
            >
              {isCompleted ? '✓ Section Completed' : '✓ Mark Complete'}
            </button>
          </div>
        </>
      )}
    </div>

    {/* Sidebar (right) */}
    <div style={styles.sidebar}>
      <h3 style={styles.sidebarTitle}>📖 Course Content</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {topics.map(topic => {
          const topicSubs = topic.subtopics || [];
          const isExpanded = expandedTopics[topic.id];
          return (
            <li key={topic.id} style={styles.topicItem}>
              <div style={styles.topicHeader} onClick={() => toggleTopic(topic.id)}>
                <span style={{ marginRight: '8px', fontSize: '12px' }}>{isExpanded ? '▼' : '▶'}</span>
                <span>{topic.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: '10px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '20px' }}>
                  {topicSubs.length}
                </span>
              </div>
              {isExpanded && (
                <ul style={styles.subtopicList}>
                  {topicSubs.map(sub => {
                    const globalIndex = subtopics.findIndex(s => String(s.id) === String(sub.id));
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{sub.title}</span>
                          {isSecCompleted && <span style={{ fontSize: '11px', color: '#10b981' }}>✓</span>}
                        </div>
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
                {images.map(img => {
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