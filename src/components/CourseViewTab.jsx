// src/components/Student/CourseDetailView.jsx
import React, { useState, useEffect, useCallback } from 'react';
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

// ✅ Fixed: Build full image URL
const buildFullImageUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  const cleanPath = cleanImagePath(src);
  return `${API_BASE}${cleanPath}`;
};

// Helper: convert YouTube URL to embed URL
const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
  return url;
};

// ─── Improved Markdown renderer with copy protection ─────────────────────
const renderMarkdownImages = (text) => {
  if (!text) return '';

  // 1. Process images: ![alt](src)
  let html = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    // ✅ Use the fixed helper
    const fullSrc = buildFullImageUrl(src);
    return `<img src="${fullSrc}" alt="${alt}" 
      style="max-width:100%; border-radius:12px; margin:16px 0; box-shadow:0 4px 12px rgba(0,0,0,0.1); display:block;" 
      onerror="this.style.border='2px dashed #dc2626'; this.alt='Failed: ${fullSrc}';"
    />`;
  });

  // 2. Markdown headings
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;margin:20px 0 8px;color:#1e293b;">$1</h3>');
  html = html.replace(/^## (.+)$/gm,  '<h2 style="font-size:18px;font-weight:700;margin:24px 0 10px;color:#1e293b;">$1</h2>');
  html = html.replace(/^# (.+)$/gm,   '<h1 style="font-size:22px;font-weight:800;margin:28px 0 12px;color:#0f172a;">$1</h1>');

  // 3. Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g,     '<em>$1</em>');

  // 4. Newlines to <br/>
  html = html.replace(/\n/g, '<br/>');
  return html;
};

// ─── Tab Components ──────────────────────────────────────────────────────
function NotesTab({ content }) {
  if (!content) return <div className="empty-state">No notes for this section.</div>;
  const html = renderMarkdownImages(content);
  return (
    <div
      className="notes-content"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        lineHeight: '1.8',
        color: '#334155',
        fontSize: '15px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      onCopy={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}

function ImagesTab({ images, subtopicId, getImageSrc, getImageUrl, handleImageError }) {
  if (!subtopicId) return <div className="empty-state">Invalid subtopic ID.</div>;
  if (images.length === 0) return <div className="empty-state">No images for this section.</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
      {images.map(img => (
        <div
          key={img.id}
          onClick={() => window.open(getImageUrl(subtopicId, img.fileName), '_blank')}
          style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
        >
          <img
            src={getImageSrc(subtopicId, img.fileName, img.id)}
            alt={`Page ${img.pageNumber}`}
            style={{ width: '100%', height: '140px', objectFit: 'cover' }}
            onError={() => handleImageError(img.id)}
          />
          <div style={{ padding: '8px', fontSize: '11px', textAlign: 'center', color: '#64748b' }}>
            Page {img.pageNumber} · {img.width}×{img.height}
          </div>
        </div>
      ))}
    </div>
  );
}

function VideoTab({ videoUrl }) {
  const embed = getEmbedUrl(videoUrl);
  if (!videoUrl) return <div className="empty-state">No video for this section.</div>;
  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '16px', marginBottom: '16px' }}>
      <iframe src={embed} title="Video" frameBorder="0" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
    </div>
  );
}

function InterviewTab({ questions }) {
  const [expanded, setExpanded] = useState({});
  if (!questions || questions.length === 0) return <div className="empty-state">No interview questions.</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {questions.map((q, idx) => (
        <div key={q.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div
            onClick={() => setExpanded(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', cursor: 'pointer', fontWeight: 500 }}
          >
            <span>{idx + 1}. {q.question}</span>
            <span style={{ fontSize: '12px' }}>{expanded[q.id] ? '▲' : '▼'}</span>
          </div>
          {expanded[q.id] && (
            <div style={{ padding: '14px 18px', borderTop: '1px solid #e2e8f0', background: '#fff', color: '#475569', lineHeight: '1.6' }}>
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
  if (!questions || questions.length === 0) return <div className="empty-state">No MCQ questions.</div>;

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
        <div key={q.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '16px' }}>
          <p><strong>{idx + 1}. {q.question}</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {['A', 'B', 'C', 'D'].map(opt => {
              const optText = q[`option${opt}`];
              if (!optText) return null;
              return (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleAnswer(q.id, opt)}
                    disabled={submitted}
                  />
                  <span><strong>{opt}:</strong> {optText}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <button onClick={handleSubmit} style={{ marginTop: '20px', padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '40px', fontWeight: 600, cursor: 'pointer' }}>
          Submit Answers
        </button>
      )}
      {submitted && score && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#eef2ff', borderRadius: '12px', textAlign: 'center', fontWeight: 600 }}>
          Score: {score.correct} / {score.total} ({Math.round((score.correct/score.total)*100)}%)
        </div>
      )}
    </div>
  );
}

function LabsTab({ labs }) {
  const [completed, setCompleted] = useState({});
  if (!labs || labs.length === 0) return <div className="empty-state">No lab exercises.</div>;

  const markComplete = (labId) => setCompleted(prev => ({ ...prev, [labId]: true }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {labs.map((lab, idx) => (
        <div key={lab.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <strong style={{ fontSize: '16px' }}>{idx + 1}. {lab.title}</strong>
            {!completed[lab.id] && (
              <button onClick={() => markComplete(lab.id)} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>
                ✓ Mark Complete
              </button>
            )}
            {completed[lab.id] && <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>✓ Completed</span>}
          </div>
          <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{lab.instructions}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main CourseDetailView ───────────────────────────────────────────────
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

  // Extend styles with tab‑specific styles
  const detailStyles = {
    ...styles,
    courseDetailContainer: { ...styles.courseDetailContainer, maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '20px' : '40px' },
    backToCourses: { ...styles.backToCourses, marginBottom: '20px' },
    splitView: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: '30px' },
    tocPanel: { ...styles.tocPanel, background: 'white', borderRadius: '20px', padding: '20px' },
    contentPanel: { ...styles.contentPanel, background: 'white', borderRadius: '20px', padding: isMobile ? '20px' : '28px', overflowY: 'auto' },
    subtopicItem: (isActive, isCompleted) => ({
      padding: '10px 16px 10px 28px',
      cursor: 'pointer',
      borderRadius: '12px',
      fontSize: '14px',
      marginBottom: '6px',
      marginLeft: '12px',
      borderLeft: `3px solid ${isActive ? '#6366f1' : (isCompleted ? '#10b981' : '#e2e8f0')}`,
      background: isActive ? '#eef2ff' : (isCompleted ? '#f0fdf4' : 'transparent'),
      color: isActive ? '#4f46e5' : (isCompleted ? '#059669' : '#475569'),
      fontWeight: isActive ? '500' : 'normal',
      transition: 'all 0.2s',
      '&:hover': { background: '#f1f5f9', transform: 'translateX(4px)' }
    }),
    sectionBadge: { fontSize: '12px', marginLeft: '8px', color: '#10b981' },
    tabsContainer: { display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap' },
    tabButton: (active) => ({
      padding: '10px 18px',
      background: 'none',
      border: 'none',
      fontSize: '14px',
      fontWeight: active ? 600 : 500,
      color: active ? '#4f46e5' : '#64748b',
      borderBottom: active ? '2px solid #4f46e5' : '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    emptyState: { textAlign: 'center', padding: '48px', color: '#94a3b8' },
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
          <button style={detailStyles.controlBtn(activeView === 'split')} onClick={() => setActiveView('split')}>📚 Course View</button>
          <button style={detailStyles.resetBtn} onClick={resetProgress}>⟳ Reset Progress</button>
        </div>

        {activeView === 'split' && (
          <div style={detailStyles.splitView}>
            {/* Sidebar */}
            <div style={detailStyles.tocPanel}>
              <h3 style={detailStyles.tocTitle}>📑 Course Content</h3>
              <ul style={detailStyles.tocList}>
                {topics.map(topic => {
                  const topicSubs = topic.subtopics || [];
                  const isExpanded = expandedTopics[topic.id];
                  return (
                    <li key={topic.id} style={{ marginBottom: '8px' }}>
                      <div style={detailStyles.topicHeader} onClick={() => toggleTopic(topic.id)}>
                        <span style={{ marginRight: '10px', fontSize: '14px' }}>{isExpanded ? '▼' : '▶'}</span>
                        <span>{topic.title}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '12px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '20px' }}>
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
                      getImageSrc={getImageSrc}
                      getImageUrl={getImageUrl}
                      handleImageError={handleImageError}
                    />
                  )}
                  {activeContentTab === 'video' && <VideoTab videoUrl={currentSub.videoUrl} />}
                  {activeContentTab === 'interview' && <InterviewTab questions={interviewQuestions} />}
                  {activeContentTab === 'exam' && <ExamTab questions={examQuestions} />}
                  {activeContentTab === 'labs' && <LabsTab labs={labs} />}

                  <button
                    style={{ ...detailStyles.completeBtn, marginTop: '32px' }}
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
            {images.length === 0 ? <p>No images yet</p> : (
              <div style={detailStyles.imageGrid}>
                {images.map(img => {
                  const safeId = img.subTopicId || img.subtopicId;
                  if (!safeId) return null;
                  return (
                    <div key={img.id} style={detailStyles.imageCard} onClick={() => window.open(getImageUrl(safeId, img.fileName), '_blank')}>
                      <img src={getImageSrc(safeId, img.fileName, img.id)} alt={`Page ${img.pageNumber}`} style={detailStyles.image} onError={() => handleImageError(img.id)} />
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