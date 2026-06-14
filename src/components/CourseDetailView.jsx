import React, { useState, useEffect, useCallback } from 'react';
import {
  getSubtopicImages,
  getSubtopicInterviewQuestions,
  getSubtopicExamQuestions,
  getSubtopicLabs,
} from '../api/UserApi';

// Helper: convert YouTube URL to embed URL
const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
  return url;
};

// Helper: render Markdown images inside notes (simple regex)
const renderMarkdownImages = (text) => {
  if (!text) return '';
  return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    return `<img src="${src}" alt="${alt}" style="max-width:100%; border-radius:16px; margin:20px 0; box-shadow:0 8px 20px rgba(0,0,0,0.1);" />`;
  });
};

// ─── Tab Components (with modern styling) ─────────────────────────────────
function NotesTab({ content }) {
  if (!content) return <div className="empty-state">📝 No notes for this section.</div>;
  const html = renderMarkdownImages(content).replace(/\n/g, '<br/>');

  // Prevent copy, cut, and right-click
  const handleCopy = (e) => e.preventDefault();
  const handleCut = (e) => e.preventDefault();
  const handleContextMenu = (e) => e.preventDefault();

  return (
    <div
      className="notes-content"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        lineHeight: '1.8',
        color: '#1e293b',
        fontSize: '16px',
        fontFamily: 'Inter, system-ui, sans-serif',
        maxWidth: '100%',
        overflowX: 'auto',
        userSelect: 'none', // CSS fallback
      }}
      onCopy={handleCopy}
      onCut={handleCut}
      onContextMenu={handleContextMenu}
    />
  );
}

function ImagesTab({ images, subtopicId, getImageUrl, handleImageError }) {
  if (!subtopicId) return <div className="empty-state">🖼️ Invalid subtopic ID.</div>;
  if (images.length === 0) return <div className="empty-state">🖼️ No images for this section.</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '16px' }}>
      {images.map(img => {
        const imageUrl = getImageUrl(subtopicId, img.fileName);
        return (
          <div
            key={img.id}
            onClick={() => window.open(imageUrl, '_blank')}
            style={{
              background: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #eef2f6',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
          >
            <img
              src={imageUrl}
              alt={`Page ${img.pageNumber}`}
              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              onError={() => handleImageError(img.id)}
            />
            <div style={{ padding: '10px', fontSize: '12px', textAlign: 'center', color: '#475569', background: '#f8fafc' }}>
              Page {img.pageNumber} · {img.width}×{img.height}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VideoTab({ videoUrl }) {
  const embed = getEmbedUrl(videoUrl);
  if (!videoUrl) return <div className="empty-state">🎬 No video for this section.</div>;
  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '20px', marginTop: '16px', background: '#000' }}>
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
        <div key={q.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eef2f6', overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
          <div
            onClick={() => setExpanded(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              background: '#fafcff',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#0f172a',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#fafcff'}
          >
            <span>{idx + 1}. {q.question}</span>
            <span style={{ fontSize: '14px', color: '#64748b' }}>{expanded[q.id] ? '▲' : '▼'}</span>
          </div>
          {expanded[q.id] && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #eef2f6', background: '#fff', color: '#334155', lineHeight: '1.6' }}>
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
        <div key={q.id} style={{ padding: '20px', background: '#fff', borderRadius: '20px', border: '1px solid #eef2f6', marginBottom: '20px' }}>
          <p style={{ fontWeight: 700, marginBottom: '16px', fontSize: '16px', color: '#0f172a' }}>{idx + 1}. {q.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['A', 'B', 'C', 'D'].map(opt => {
              const optText = q[`option${opt}`];
              if (!optText) return null;
              return (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 12px', borderRadius: '12px', transition: 'background 0.2s' }}>
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
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            color: '#fff',
            border: 'none',
            borderRadius: '40px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(79,70,229,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
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
        <div key={lab.id} style={{ background: '#fff', borderRadius: '20px', border: '1px solid #eef2f6', padding: '20px', transition: 'box-shadow 0.2s' }}>
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
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                ✓ Mark Complete
              </button>
            )}
            {completed[lab.id] && <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600, background: '#d1fae5', padding: '4px 12px', borderRadius: '30px' }}>✓ Completed</span>}
          </div>
          <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{lab.instructions}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main CourseDetailView (with enhanced modern styles) ─────────────────
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
  styles,
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
  const subtopicImages = images;

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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading course content…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Enhanced modern styles (overrides the basic ones from parent)
  const detailStyles = {
    ...styles,
    container: { ...styles.container, background: '#f8fafc' },
    courseDetailContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile ? '20px' : '40px',
    },
    backToCourses: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: '#fff',
      border: '1px solid #e2e8f0',
      color: '#4f46e5',
      cursor: 'pointer',
      fontSize: '14px',
      marginBottom: '24px',
      padding: '10px 24px',
      borderRadius: '40px',
      fontWeight: '500',
      transition: 'all 0.2s',
      ':hover': { background: '#f1f5f9', borderColor: '#cbd5e1' },
    },
    courseHero: {
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      color: 'white',
      padding: isMobile ? '32px' : '48px',
      borderRadius: '32px',
      marginBottom: '32px',
      textAlign: 'center',
      boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)',
    },
    courseHeroTitle: { fontSize: isMobile ? '28px' : '38px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.02em' },
    courseHeroStats: {
      display: 'inline-flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: isMobile ? '16px' : '24px',
      margin: '24px 0 16px',
      fontSize: isMobile ? '13px' : '14px',
      background: 'rgba(255,255,255,0.12)',
      padding: '10px 24px',
      borderRadius: '60px',
      backdropFilter: 'blur(4px)',
    },
    progressBarLarge: {
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '20px',
      height: '8px',
      overflow: 'hidden',
      maxWidth: '360px',
      margin: '20px auto 0',
    },
    progressFillLarge: { background: '#a5b4fc', height: '100%', borderRadius: '20px', transition: 'width 0.3s ease' },
    progressTextLarge: { display: 'block', marginTop: '12px', fontSize: '14px', fontWeight: '500', opacity: 0.9 },
    viewControls: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginBottom: '32px',
      flexWrap: 'wrap',
    },
    splitView: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
      gap: '32px',
    },
    tocPanel: {
      background: '#fff',
      borderRadius: '24px',
      padding: '20px',
      position: isMobile ? 'relative' : 'sticky',
      top: '24px',
      height: isMobile ? 'auto' : 'calc(100vh - 120px)',
      overflowY: 'auto',
      boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
      border: '1px solid #eef2f6',
    },
    tocTitle: {
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '20px',
      color: '#0f172a',
      borderBottom: '2px solid #4f46e5',
      paddingBottom: '12px',
      display: 'inline-block',
    },
    topicHeader: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '12px 16px',
      background: '#f8fafc',
      borderRadius: '14px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px',
      transition: 'all 0.2s',
      ':hover': { background: '#f1f5f9', transform: 'translateX(4px)' },
    },
    subtopicItem: (isActive, isCompleted) => ({
      padding: '10px 16px 10px 32px',
      cursor: 'pointer',
      borderRadius: '12px',
      fontSize: '14px',
      marginBottom: '6px',
      marginLeft: '12px',
      borderLeft: `3px solid ${isActive ? '#4f46e5' : (isCompleted ? '#10b981' : '#e2e8f0')}`,
      background: isActive ? '#eef2ff' : (isCompleted ? '#f0fdf4' : 'transparent'),
      color: isActive ? '#4f46e5' : (isCompleted ? '#059669' : '#475569'),
      fontWeight: isActive ? '500' : 'normal',
      transition: 'all 0.2s',
      ':hover': { background: '#f1f5f9', transform: 'translateX(4px)' },
    }),
    contentPanel: {
      background: '#fff',
      borderRadius: '24px',
      padding: isMobile ? '24px' : '32px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
      border: '1px solid #eef2f6',
      maxHeight: isMobile ? 'auto' : 'calc(100vh - 120px)',
      overflowY: 'auto',
    },
    currentSectionHeader: {
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #eef2f6',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
    },
    currentSectionTitle: { fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: '#0f172a' },
    tabsContainer: {
      display: 'flex',
      gap: '6px',
      borderBottom: '1px solid #e2e8f0',
      marginBottom: '28px',
      flexWrap: 'wrap',
    },
    tabButton: (active) => ({
      padding: '10px 20px',
      background: 'none',
      border: 'none',
      fontSize: '14px',
      fontWeight: active ? 600 : 500,
      color: active ? '#4f46e5' : '#64748b',
      borderBottom: active ? '2px solid #4f46e5' : '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s',
      borderRadius: '0',
    }),
    completeBtn: {
      background: '#22c55e',
      color: 'white',
      border: 'none',
      padding: '12px 28px',
      borderRadius: '40px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      marginTop: '32px',
      width: '100%',
      transition: 'all 0.2s',
      ':hover': { background: '#16a34a', transform: 'scale(1.02)' },
    },
    resetBtn: {
      background: '#fee2e2',
      color: '#dc2626',
      border: 'none',
      padding: '8px 20px',
      borderRadius: '40px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.2s',
      ':hover': { background: '#fecaca' },
    },
    galleryContainer: {
      background: '#fff',
      borderRadius: '24px',
      padding: isMobile ? '24px' : '32px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
      border: '1px solid #eef2f6',
    },
    galleryTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: '#0f172a' },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '20px',
    },
    imageCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': { transform: 'scale(1.02)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' },
    },
    image: { width: '100%', height: '160px', objectFit: 'cover', background: '#f1f5f9' },
    imageInfo: {
      padding: '10px',
      fontSize: '12px',
      textAlign: 'center',
      background: '#f8fafc',
      color: '#64748b',
    },
    emptyState: { textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '15px' },
    sectionBadge: { fontSize: '12px', marginLeft: '8px', color: '#10b981' },
    sectionProgress: { fontSize: '12px', color: '#059669', background: '#d1fae5', padding: '4px 12px', borderRadius: '20px' },
    controlBtn: (active) => ({
      padding: '10px 24px',
      border: '1px solid #e2e8f0',
      borderRadius: '40px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      background: active ? '#4f46e5' : '#fff',
      color: active ? '#fff' : '#1e293b',
      transition: 'all 0.2s',
      ':hover': { background: active ? '#4338ca' : '#f8fafc' },
    }),
  };

  return (
    <div style={detailStyles.container}>
      <div style={detailStyles.courseDetailContainer}>
        <button style={detailStyles.backToCourses} onClick={handleBack}>← Back to Courses</button>

        {/* Hero section */}
        <div style={detailStyles.courseHero}>
          <h1 style={detailStyles.courseHeroTitle}>{selectedCourse.title}</h1>
          <div style={detailStyles.courseHeroStats}>
            <span>📚 {topics.length} topics</span>
            <span>📑 {subtopics.length} sections</span>
            <span>🖼️ {images.length} images</span>
          </div>
          <div style={detailStyles.progressBarLarge}>
            <div style={{ ...detailStyles.progressFillLarge, width: `${progress}%` }} />
          </div>
          <span style={detailStyles.progressTextLarge}>{Math.round(progress)}% Complete</span>
        </div>

        <div style={detailStyles.viewControls}>
          <button style={detailStyles.controlBtn(activeView === 'split')} onClick={() => setActiveView('split')}>
            📚 Course View
          </button>
         
          <button style={detailStyles.resetBtn} onClick={resetProgress}>⟳ Reset Progress</button>
        </div>

        {activeView === 'split' && (
          <div style={detailStyles.splitView}>
            {/* Sidebar */}
            <div style={detailStyles.tocPanel}>
              <h3 style={detailStyles.tocTitle}>📑 Course Content</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topics.map(topic => {
                  const topicSubs = topic.subtopics || [];
                  const isExpanded = expandedTopics[topic.id];
                  return (
                    <li key={topic.id} style={{ marginBottom: '8px' }}>
                      <div style={detailStyles.topicHeader} onClick={() => toggleTopic(topic.id)}>
                        <span style={{ marginRight: '10px', fontSize: '14px' }}>{isExpanded ? '▼' : '▶'}</span>
                        <span>{topic.title}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '20px', color: '#475569' }}>
                          {topicSubs.length}
                        </span>
                      </div>
                      {isExpanded && (
                        <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '4px' }}>
                          {topicSubs.map(sub => {
                            const globalIndex = subtopics.findIndex(s => String(s.id) === String(sub.id));
                            if (globalIndex === -1) return null;
                            const isActive = activeSection === globalIndex;
                            const isSecCompleted = completedSections.includes(globalIndex);
                            return (
                              <li
                                key={sub.id}
                                style={detailStyles.subtopicItem(isActive, isSecCompleted)}
                                onClick={async () => {
                                  setActiveSection(globalIndex);
                                  setCurrentSubtopic(sub);
                                  await loadSubtopicImages(sub.id);
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{sub.title}</span>
                                  {isSecCompleted && <span style={detailStyles.sectionBadge}>✓</span>}
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

            {/* Content panel */}
            <div style={detailStyles.contentPanel}>
              {!currentSub ? (
                <div style={detailStyles.emptyState}>Select a section from the sidebar to begin</div>
              ) : (
                <>
                  <div style={detailStyles.currentSectionHeader}>
                    <h2 style={detailStyles.currentSectionTitle}>{currentSub.title}</h2>
                    {isCompleted && <span style={detailStyles.sectionProgress}>✅ Completed</span>}
                  </div>

                  <div style={detailStyles.tabsContainer}>
                    {['notes', 'images', 'video', 'interview', 'exam', 'labs'].map(tab => (
                      <button
                        key={tab}
                        style={detailStyles.tabButton(activeContentTab === tab)}
                        onClick={() => setActiveContentTab(tab)}
                      >
                        {tab === 'notes' && '📄 Notes'}
                        {tab === 'images' && '🖼️ Images'}
                        {tab === 'video' && '🎥 Video'}
                        {tab === 'interview' && '❓ Interview Qs'}
                        {tab === 'exam' && '📝 MCQ Test'}
                        {tab === 'labs' && '🧪 Labs'}
                      </button>
                    ))}
                  </div>

                  {loadingData && activeContentTab !== 'notes' && activeContentTab !== 'images' && activeContentTab !== 'video' && (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading...</div>
                  )}

                  {activeContentTab === 'notes' && <NotesTab content={currentSub.content} />}
                  {activeContentTab === 'images' && currentSub?.id && (
                    <ImagesTab
                      images={subtopicImages}
                      subtopicId={currentSub.id}
                      getImageUrl={getImageUrl}
                      handleImageError={handleImageError}
                    />
                  )}
                  {activeContentTab === 'video' && <VideoTab videoUrl={currentSub.videoUrl} />}
                  {activeContentTab === 'interview' && <InterviewTab questions={interviewQuestions} />}
                  {activeContentTab === 'exam' && <ExamTab questions={examQuestions} />}
                  {activeContentTab === 'labs' && <LabsTab labs={labs} />}

                  <button
                    style={detailStyles.completeBtn}
                    onClick={() => markSectionComplete(activeSection)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? '✓ Section Completed' : '✓ Mark Complete'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeView === 'gallery' && (
          <div style={detailStyles.galleryContainer}>
            <h2 style={detailStyles.galleryTitle}>📸 All Course Images ({images.length})</h2>
            {images.length === 0 ? <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No images yet</p> : (
              <div style={detailStyles.imageGrid}>
                {images.map(img => {
                  const imageUrl = getImageUrl(img.subTopicId || img.subtopicId, img.fileName);
                  if (!imageUrl) return null;
                  return (
                    <div key={img.id} style={detailStyles.imageCard} onClick={() => window.open(imageUrl, '_blank')}>
                      <img src={imageUrl} alt={`Page ${img.pageNumber}`} style={detailStyles.image} onError={() => handleImageError(img.id)} />
                      <div style={detailStyles.imageInfo}>Page {img.pageNumber} · {img.width}×{img.height}</div>
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