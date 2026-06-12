// src/pages/AdminCourseManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PdfUploadPanel from '../components/PdfUpload';
import { TopicManager, SubtopicManager } from '../components/TopicSidebar';
import SubtopicEditor from '../components/SubtopicEditor';
import { getAdminCourses, getCourseTopics } from '../api/courseApi';

// ─── Toast hook ────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = 'success') => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return { toasts, show };
}

const ToastContainer = ({ toasts }) => (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
    {toasts.map(t => (
      <div
        key={t.id}
        style={{
          padding: '10px 18px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          background:
            t.type === 'success'
              ? '#f0fdf4'
              : t.type === 'error'
              ? '#fef2f2'
              : '#fffbeb',
          color:
            t.type === 'success'
              ? '#16a34a'
              : t.type === 'error'
              ? '#dc2626'
              : '#d97706',
          border:
            t.type === 'success'
              ? '1px solid #bbf7d0'
              : t.type === 'error'
              ? '1px solid #fecaca'
              : '1px solid #fde68a',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.2s ease',
        }}
      >
        {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : '⚠ '}
        {t.msg}
      </div>
    ))}
  </div>
);

// ─── Color palette ────────────────────────────────────────────────────────────
const clr = {
  bg: '#f8f9fb',
  white: '#ffffff',
  border: '#e4e7ec',
  text: '#0f172a',
  muted: '#64748b',
  faint: '#f1f5f9',
  accent: '#4f46e5',
  accentLight: '#eef2ff',
  sidebar: '#1e1b4b',
  sidebarText: '#c7d2fe',
};

// ─── Course Selector ──────────────────────────────────────────────────────────
const CourseSelector = ({ selectedCourse, onSelect, courses, loading, toast }) => {
  const [search, setSearch] = useState('');

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  const Card = ({ children }) => (
    <div style={{ background: clr.white, borderRadius: 12, border: `1px solid ${clr.border}` }}>
      {children}
    </div>
  );

  const Inp = ({ value, onChange, placeholder }) => (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '8px 11px',
        fontSize: 13,
        border: `1px solid ${clr.border}`,
        borderRadius: 8,
        outline: 'none',
        background: clr.white,
        color: clr.text,
        boxSizing: 'border-box',
        marginBottom: 12,
      }}
      onFocus={e => e.target.style.borderColor = clr.accent}
      onBlur={e => e.target.style.borderColor = clr.border}
    />
  );

  return (
    <Card>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: clr.muted, display: 'block', marginBottom: 5 }}>
            SELECT COURSE TO MANAGE
          </label>
        </div>
        <Inp value={search} onChange={setSearch} placeholder="Search courses…" />
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: clr.muted }}>Loading courses…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: clr.muted }}>
            {search ? 'No matching courses found' : 'No courses yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
            {filtered.map(c => (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: selectedCourse?.id === c.id ? clr.accentLight : clr.faint,
                  border: `1.5px solid ${selectedCourse?.id === c.id ? clr.accent : 'transparent'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: clr.accent,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {c.title?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: clr.text }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: clr.muted }}>ID: {c.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminCourseManager() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [activeSubId, setActiveSubId] = useState(null);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [view, setView] = useState('course');

  const activeTopic = topics.find(t => t.id === activeTopicId);
  const subtopics = activeTopic?.subtopics || [];
  const activeSub = subtopics.find(s => s.id === activeSubId);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const data = await getAdminCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.show('Failed to load courses', 'error');
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadTopics = useCallback(
    async (courseId) => {
      setTopicsLoading(true);
      try {
        const data = await getCourseTopics(courseId);
        const ts = Array.isArray(data) ? data : [];
        setTopics(ts);
        if (ts.length > 0) {
          setActiveTopicId(ts[0].id);
          if (ts[0].subtopics?.length > 0) setActiveSubId(ts[0].subtopics[0].id);
        } else {
          setActiveTopicId(null);
          setActiveSubId(null);
        }
      } catch (e) {
        toast.show('Failed to load topics', 'error');
      } finally {
        setTopicsLoading(false);
      }
    },
    [toast]
  );

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setTopics([]);
    setActiveTopicId(null);
    setActiveSubId(null);
    setView('manage');
    loadTopics(course.id);
  };

  const setSubtopics = (topicId, updater) => {
    setTopics(ts =>
      ts.map(t =>
        t.id === topicId
          ? {
              ...t,
              subtopics: typeof updater === 'function' ? updater(t.subtopics || []) : updater,
            }
          : t
      )
    );
  };

  const updateActiveSub = (patch) => {
    setTopics(ts =>
      ts.map(t => ({
        ...t,
        subtopics: (t.subtopics || []).map(s => (s.id === activeSubId ? { ...s, ...patch } : s)),
      }))
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: clr.text, background: clr.bg, minHeight: '100vh' }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>

      {/* Top bar */}
      <div style={{ background: clr.sidebar, padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🏫</span> Course Manager
        </div>
        {selectedCourse && (
          <>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ fontSize: 13, color: clr.sidebarText }}>{selectedCourse.title}</div>
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button
            onClick={() => setView('course')}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              background: view === 'course' ? clr.accent : 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            🏠 Courses
          </button>
          {selectedCourse && (
            <button
              onClick={() => setView('manage')}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: view === 'manage' ? clr.accent : 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontWeight: 600,
              }}
            >
              ✏ Manage
            </button>
          )}
        </div>
      </div>

      {/* Course Selection View */}
      {view === 'course' && (
        <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 24px' }}>
          <CourseSelector selectedCourse={selectedCourse} onSelect={handleCourseSelect} courses={courses} loading={coursesLoading} toast={toast} />
        </div>
      )}

      {/* Content Management View */}
      {view === 'manage' && selectedCourse && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, minHeight: 'calc(100vh - 57px)' }}>
          {/* LEFT SIDEBAR */}
          <div style={{ borderRight: `1px solid ${clr.border}`, background: clr.white, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <PdfUploadPanel courseId={selectedCourse.id} toast={toast} onStructureGenerated={(cid) => loadTopics(cid || selectedCourse.id)} />
              {topicsLoading ? (
                <div style={{ padding: 24, textAlign: 'center', color: clr.muted }}>Loading…</div>
              ) : (
                <>
                  <TopicManager
                    courseId={selectedCourse.id}
                    topics={topics}
                    setTopics={setTopics}
                    activeTopicId={activeTopicId}
                    setActiveTopicId={id => {
                      setActiveTopicId(id);
                      setActiveSubId(null);
                    }}
                    toast={toast}
                  />
                  {activeTopic && (
                    <SubtopicManager
                      topic={activeTopic}
                      subtopics={subtopics}
                      setSubtopics={updater => setSubtopics(activeTopicId, updater)}
                      activeSubId={activeSubId}
                      setActiveSubId={setActiveSubId}
                      toast={toast}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT CONTENT EDITOR */}
          <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeSub ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: clr.muted, marginBottom: 2 }}>{activeTopic?.title}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: clr.text }}>{activeSub.title}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    {activeSub.notes && (
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: clr.faint, color: clr.muted }}>
                        📝 Has notes
                      </span>
                    )}
                    {activeSub.videoUrl && (
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: clr.faint, color: clr.muted }}>
                        🎬 Has video
                      </span>
                    )}
                  </div>
                </div>
                <SubtopicEditor sub={activeSub} subtopicId={activeSub.id} toast={toast} onUpdate={updateActiveSub} />
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: clr.muted, padding: 60 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>{activeTopic ? '👆' : '👈'}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: clr.text, marginBottom: 8 }}>
                  {activeTopic ? 'Select a subtopic' : 'Select a topic first'}
                </div>
                <div style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.7 }}>
                  {activeTopic
                    ? 'Choose a subtopic from the list to edit its notes, images, exam questions, interview questions, and lab steps.'
                    : 'Pick a topic from the left panel, then choose a subtopic to begin editing its content.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}
