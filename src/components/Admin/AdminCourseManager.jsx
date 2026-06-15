// src/components/Admin/AdminCourseManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

const API_BASE = 'http://localhost:8082/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const api = {
  get: (url) => fetch(`${API_BASE}${url}`, { headers: authHeaders() }).then(r => r.json()),
  post: (url, body) => fetch(`${API_BASE}${url}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  put: (url, body) => fetch(`${API_BASE}${url}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
  delete: (url) => fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: authHeaders() }).then(r => r.json()),
};

const clr = {
  bg: '#f8f9fb', white: '#ffffff', border: '#e4e7ec', borderActive: '#4f46e5',
  text: '#0f172a', muted: '#64748b', faint: '#f1f5f9', accent: '#4f46e5',
  accentLight: '#eef2ff', accentText: '#3730a3', success: '#16a34a',
  successLight: '#f0fdf4', danger: '#dc2626', dangerLight: '#fef2f2',
  sidebar: '#1e1b4b', sidebarText: '#c7d2fe',
};

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = 'success') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return { toasts, show };
}

function ToastContainer({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: t.type === 'success' ? clr.successLight : t.type === 'error' ? clr.dangerLight : '#fffbeb',
          color: t.type === 'success' ? clr.success : t.type === 'error' ? clr.danger : '#b45309',
          border: `1px solid ${t.type === 'success' ? '#bbf7d0' : t.type === 'error' ? '#fecaca' : '#fde68a'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✕ ' : '⚠ '}{t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: clr.white, borderRadius: 16, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${clr.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: clr.text }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: clr.muted, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form components ──────────────────────────────────────────────────────────
const Lbl = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: clr.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase' }}>
    {children}
  </label>
);

const Inp = ({ value, onChange, placeholder, type = 'text', onKeyDown, onBlur }) => (
  <input
    type={type}
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    onKeyDown={onKeyDown}
    onBlur={onBlur}
    style={{ width: '100%', padding: '8px 11px', fontSize: 13, border: `1px solid ${clr.border}`, borderRadius: 8, outline: 'none', background: clr.white, color: clr.text }}
  />
);

const Txta = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: `1px solid ${clr.border}`, borderRadius: 8, outline: 'none', resize: 'vertical', background: clr.white, color: clr.text, fontFamily: 'inherit', lineHeight: 1.6 }}
  />
);

const Btn = ({ children, onClick, variant = 'primary', size = 'md', disabled, style: extra, as: Component = 'button' }) => {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer', border: 'none', borderRadius: 8, fontWeight: 600, opacity: disabled ? 0.5 : 1 };
  const sizes = { sm: { padding: '5px 12px', fontSize: 12 }, md: { padding: '8px 16px', fontSize: 13 } };
  const variants = {
    primary: { background: clr.accent, color: '#fff' },
    success: { background: clr.success, color: '#fff' },
    danger: { background: clr.dangerLight, color: clr.danger },
    ghost: { background: clr.faint, color: clr.muted, border: `1px solid ${clr.border}` },
    dashed: { background: clr.accentLight, color: clr.accentText, border: `1.5px dashed ${clr.accent}` },
  };
  return <Component onClick={disabled ? undefined : onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}>{children}</Component>;
};

const Card = ({ children }) => (
  <div style={{ background: clr.white, borderRadius: 12, border: `1px solid ${clr.border}` }}>{children}</div>
);

const SectionHead = ({ icon, title, count, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${clr.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: clr.text }}>{title}</span>
      {count !== undefined && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: clr.accentLight, color: clr.accentText, fontWeight: 600 }}>{count}</span>}
    </div>
    {action}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PDF UPLOAD BUTTON
// ═══════════════════════════════════════════════════════════════════════════════
function PdfUploadButton({ subtopicId, uploadingPdf, onFileSelected }) {
  const inputId = `pdf-upload-${subtopicId}`;
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="file"
        accept=".pdf"
        id={inputId}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onFileSelected(file);
          e.target.value = '';
        }}
      />
      <label htmlFor={inputId} style={{ display: 'inline-block' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          cursor: uploadingPdf ? 'not-allowed' : 'pointer',
          opacity: uploadingPdf ? 0.5 : 1,
          padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 8,
          background: clr.accentLight, color: clr.accentText,
          border: `1.5px dashed ${clr.accent}`,
        }}>
          {uploadingPdf ? '📎 Uploading PDF...' : '📎 Upload PDF to this subtopic'}
        </span>
      </label>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COURSE SELECTOR
// ═══════════════════════════════════════════════════════════════════════════════
function CourseSelector({ selectedCourse, onSelect, toast }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', instructor: '', level: 'Beginner', duration: '', price: 0 });
  const [creating, setCreating] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCourses(); }, []);

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) { toast.show('Please enter a course title', 'error'); return; }
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE}/admin/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newCourse),
      });
      if (response.ok) {
        const newCourseData = await response.json();
        await loadCourses();
        setNewCourse({ title: '', description: '', instructor: '', level: 'Beginner', duration: '', price: 0 });
        setShowCreateModal(false);
        onSelect(newCourseData);
        toast.show(`Course "${newCourse.title}" created!`);
      } else throw new Error('Failed to create course');
    } catch (error) { toast.show(error.message, 'error'); }
    finally { setCreating(false); }
  };

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Lbl>Select course to manage</Lbl>
          <Btn size="sm" variant="dashed" onClick={() => setShowCreateModal(true)}>+ Create New Course</Btn>
        </div>
        <Inp value={search} onChange={setSearch} placeholder="Search courses…" />
        <div style={{ marginTop: 12 }}>
          {loading
            ? <div style={{ padding: 24, textAlign: 'center', color: clr.muted }}>Loading courses…</div>
            : filtered.length === 0
              ? <div style={{ padding: 24, textAlign: 'center', color: clr.muted }}>No courses yet.</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                  {filtered.map(c => (
                    <div key={c.id} onClick={() => onSelect(c)} style={{
                      padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      background: selectedCourse?.id === c.id ? clr.accentLight : clr.faint,
                      border: `1.5px solid ${selectedCourse?.id === c.id ? clr.accent : 'transparent'}`,
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: clr.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                        {c.title?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: clr.muted }}>ID: {c.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
          }
        </div>
      </div>
      {showCreateModal && (
        <Modal title="Create New Course" onClose={() => setShowCreateModal(false)} width={600}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><Lbl>Course Title *</Lbl><Inp value={newCourse.title} onChange={v => setNewCourse({ ...newCourse, title: v })} /></div>
            <div><Lbl>Description</Lbl><Txta value={newCourse.description} onChange={v => setNewCourse({ ...newCourse, description: v })} rows={3} /></div>
            <div><Lbl>Instructor</Lbl><Inp value={newCourse.instructor} onChange={v => setNewCourse({ ...newCourse, instructor: v })} /></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Lbl>Level</Lbl><Inp value={newCourse.level} onChange={v => setNewCourse({ ...newCourse, level: v })} /></div>
              <div style={{ flex: 1 }}><Lbl>Duration</Lbl><Inp value={newCourse.duration} onChange={v => setNewCourse({ ...newCourse, duration: v })} /></div>
            </div>
            <div><Lbl>Price</Lbl><Inp type="number" value={newCourse.price} onChange={v => setNewCourse({ ...newCourse, price: parseFloat(v) || 0 })} /></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Btn>
              <Btn onClick={handleCreateCourse} disabled={creating || !newCourse.title.trim()}>{creating ? 'Creating...' : 'Create Course'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOPIC MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
function TopicManager({ courseId, topics, setTopics, activeTopicId, setActiveTopicId, toast, pagination, onPageChange }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openAdd = () => { setForm({ title: '' }); setEditId(null); setModal('add'); };
  const openEdit = (t) => { setForm({ title: t.title }); setEditId(t.id); setModal('edit'); };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/topics/${editId}`, { title: form.title });
        setTopics(ts => ts.map(t => t.id === editId ? { ...t, title: form.title } : t));
        toast.show('Topic updated');
      } else {
        const data = await api.post(`/admin/courses/${courseId}/topics`, { title: form.title });
        const newTopic = { id: data.topicId || data.topic?.id, title: form.title, subtopics: [] };
        setTopics(ts => [...ts, newTopic]);
        toast.show('Topic created');
        onPageChange(pagination.currentPage);
      }
      setModal(null);
    } catch (e) { toast.show(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this topic and all its subtopics?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/topics/${id}`);
      setTopics(ts => ts.filter(t => t.id !== id));
      if (activeTopicId === id) setActiveTopicId(null);
      toast.show('Topic deleted');
      onPageChange(pagination.currentPage);
    } catch (e) { toast.show(e.message, 'error'); }
    finally { setDeletingId(null); }
  };

  return (
    <>
      <Card>
        <SectionHead icon="📚" title="Topics" count={pagination.totalItems} action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="ghost" onClick={() => onPageChange(pagination.currentPage)}>⟳ Refresh</Btn>
            <Btn size="sm" variant="dashed" onClick={openAdd}>＋ Add Topic</Btn>
          </div>
        } />
        <div style={{ padding: '8px 0' }}>
          {topics.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: clr.muted, fontSize: 13 }}>No topics yet. Click "Add Topic" to create one.</div>
          )}
          {topics.map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              background: activeTopicId === t.id ? clr.accentLight : 'transparent',
              borderLeft: activeTopicId === t.id ? `3px solid ${clr.accent}` : '3px solid transparent',
              cursor: 'pointer', borderBottom: `1px solid ${clr.border}`,
            }} onClick={() => setActiveTopicId(t.id)}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: clr.accentLight, color: clr.accentText, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i + 1 + (pagination.currentPage * pagination.pageSize)}
              </div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: activeTopicId === t.id ? 600 : 400 }}>{t.title}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ fontSize: 11, color: clr.muted, background: clr.faint, padding: '2px 7px', borderRadius: 10 }}>{t.subtopics?.length || 0}</span>
                <button onClick={e => { e.stopPropagation(); openEdit(t); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.muted }}>✏</button>
                <button onClick={e => { e.stopPropagation(); del(t.id); }} disabled={deletingId === t.id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.danger }}>🗑</button>
              </div>
            </div>
          ))}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px', borderTop: `1px solid ${clr.border}` }}>
              <button onClick={() => onPageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevious}
                style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, border: `1px solid ${clr.border}`, background: clr.white, cursor: pagination.hasPrevious ? 'pointer' : 'not-allowed', opacity: pagination.hasPrevious ? 1 : 0.5 }}>
                ← Previous
              </button>
              <span style={{ fontSize: 12, padding: '6px 12px', color: clr.muted }}>Page {pagination.currentPage + 1} of {pagination.totalPages}</span>
              <button onClick={() => onPageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext}
                style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, border: `1px solid ${clr.border}`, background: clr.white, cursor: pagination.hasNext ? 'pointer' : 'not-allowed', opacity: pagination.hasNext ? 1 : 0.5 }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </Card>
      {modal && (
        <Modal title={modal === 'add' ? 'Add Topic' : 'Edit Topic'} onClose={() => setModal(null)}>
          <div style={{ padding: 24 }}>
            <Lbl>Topic Title</Lbl>
            <Inp
              value={form.title}
              onChange={v => setForm(f => ({ ...f, title: v }))}
              placeholder="e.g., INTRODUCTION TO NETWORKING"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setForm(f => ({ ...f, title: f.title.toUpperCase() })); } }}
              onBlur={() => setForm(f => ({ ...f, title: f.title.toUpperCase() }))}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn onClick={save} disabled={saving || !form.title.trim()}>{saving ? 'Saving…' : 'Save'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBTOPIC MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
function SubtopicManager({ topic, subtopics, setSubtopics, activeSubId, setActiveSubId, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openAdd = () => { setForm({ title: '' }); setEditId(null); setModal(true); };
  const openEdit = (s) => { setForm({ title: s.title }); setEditId(s.id); setModal(true); };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/subtopics/${editId}`, { title: form.title });
        setSubtopics(ss => ss.map(s => s.id === editId ? { ...s, title: form.title } : s));
        toast.show('Subtopic updated');
      } else {
        const data = await api.post(`/admin/topics/${topic.id}/subtopics`, { title: form.title });
        const newSub = { id: data.subtopicId || data.subtopic?.id, title: form.title, content: '', videoUrl: '' };
        setSubtopics(ss => [...ss, newSub]);
        toast.show('Subtopic created');
      }
      setModal(null);
    } catch (e) { toast.show(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this subtopic?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/subtopics/${id}`);
      setSubtopics(ss => ss.filter(s => s.id !== id));
      if (activeSubId === id) setActiveSubId(null);
      toast.show('Subtopic deleted');
    } catch (e) { toast.show(e.message, 'error'); }
    finally { setDeletingId(null); }
  };

  return (
    <>
      <Card>
        <SectionHead icon="📑" title={`Subtopics - ${topic.title}`} count={subtopics.length} action={
          <Btn size="sm" variant="dashed" onClick={openAdd}>＋ Add Subtopic</Btn>
        } />
        <div style={{ padding: '8px 0' }}>
          {subtopics.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: clr.muted, fontSize: 13 }}>No subtopics yet.</div>
          )}
          {subtopics.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              background: activeSubId === s.id ? clr.accentLight : 'transparent',
              borderLeft: activeSubId === s.id ? `3px solid ${clr.accent}` : '3px solid transparent',
              cursor: 'pointer', borderBottom: `1px solid ${clr.border}`,
            }} onClick={() => setActiveSubId(s.id)}>
              <span style={{ fontSize: 11, color: clr.muted, width: 24 }}>{i + 1}</span>
              <div style={{ flex: 1, fontSize: 13 }}>{s.title}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={e => { e.stopPropagation(); openEdit(s); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.muted }}>✏</button>
                <button onClick={e => { e.stopPropagation(); del(s.id); }} disabled={deletingId === s.id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.danger }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {modal && (
        <Modal title={editId ? 'Edit Subtopic' : 'Add Subtopic'} onClose={() => setModal(null)}>
          <div style={{ padding: 24 }}>
            <Lbl>Subtopic Title</Lbl>
            <Inp
              value={form.title}
              onChange={v => setForm(f => ({ ...f, title: v }))}
              placeholder="e.g., WHAT IS A COMPUTER NETWORK?"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setForm(f => ({ ...f, title: f.title.toUpperCase() })); } }}
              onBlur={() => setForm(f => ({ ...f, title: f.title.toUpperCase() }))}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn onClick={save} disabled={saving || !form.title.trim()}>{saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Subtopic'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERVIEW QUESTIONS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function InterviewTab({ subtopicId, toast, onUpdate, initialData }) {
  const [questions, setQuestions] = useState(initialData || []);
  const [addForm, setAddForm] = useState({ question: '', answer: '' });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!subtopicId) return;
    api.get(`/admin/subtopics/${subtopicId}/interview-questions`)
      .then(data => { const arr = Array.isArray(data) ? data : []; setQuestions(arr); onUpdate({ interviewQuestions: arr }); })
      .catch(console.error);
  }, [subtopicId]);

  const addQ = async () => {
    if (!addForm.question.trim()) return;
    setAdding(true);
    try {
      const data = await api.post(`/admin/subtopics/${subtopicId}/interview-questions`, addForm);
      const updated = [...questions, { id: data.questionId, ...addForm }];
      setQuestions(updated); onUpdate({ interviewQuestions: updated });
      setAddForm({ question: '', answer: '' }); setShowAdd(false);
      toast.show('Interview question added');
    } catch (e) { toast.show(e.message, 'error'); }
    finally { setAdding(false); }
  };

  const delQ = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/admin/interview-questions/${id}`);
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated); onUpdate({ interviewQuestions: updated });
      toast.show('Question deleted');
    } catch (e) { toast.show(e.message, 'error'); }
  };

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn size="sm" variant="dashed" onClick={() => setShowAdd(true)} disabled={!subtopicId}>＋ Add Question</Btn>
      </div>
      {showAdd && (
        <div style={{ background: clr.faint, borderRadius: 10, padding: 16 }}>
          <div><Lbl>Question</Lbl><Inp value={addForm.question} onChange={v => setAddForm(f => ({ ...f, question: v }))} placeholder="e.g. Explain OSPF?" /></div>
          <div style={{ marginTop: 10 }}><Lbl>Answer</Lbl><Txta value={addForm.answer} onChange={v => setAddForm(f => ({ ...f, answer: v }))} rows={3} /></div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <Btn size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn size="sm" onClick={addQ} disabled={adding || !addForm.question.trim()}>{adding ? '…' : 'Add'}</Btn>
          </div>
        </div>
      )}
      {questions.length === 0 && !showAdd && <div style={{ textAlign: 'center', color: clr.muted, fontSize: 13, padding: 24 }}>No interview questions yet.</div>}
      {questions.map((q, i) => (
        <div key={q.id} style={{ background: clr.faint, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: clr.muted }}>Q{i + 1}</span>
            <Btn size="sm" variant="danger" onClick={() => delQ(q.id)}>🗑</Btn>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{q.question}</div>
          <div style={{ fontSize: 13, color: clr.muted }}>{q.answer}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXAM QUESTIONS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ExamTab({ subtopicId, toast, onUpdate, initialData }) {
  const [questions, setQuestions] = useState(initialData || []);
  const [addForm, setAddForm] = useState({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!subtopicId) return;
    api.get(`/admin/subtopics/${subtopicId}/exam-questions`)
      .then(data => { const arr = Array.isArray(data) ? data : []; setQuestions(arr); onUpdate({ examQuestions: arr }); })
      .catch(console.error);
  }, [subtopicId]);

  const addQ = async () => {
    if (!addForm.question.trim()) return;
    setAdding(true);
    try {
      const data = await api.post(`/admin/subtopics/${subtopicId}/exam-questions`, addForm);
      const updated = [...questions, { id: data.questionId, ...addForm }];
      setQuestions(updated); onUpdate({ examQuestions: updated });
      setAddForm({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
      setShowAdd(false); toast.show('MCQ added');
    } catch (e) { toast.show(e.message, 'error'); }
    finally { setAdding(false); }
  };

  const delQ = async (id) => {
    if (!window.confirm('Delete this MCQ?')) return;
    try {
      await api.delete(`/admin/exam-questions/${id}`);
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated); onUpdate({ examQuestions: updated });
      toast.show('MCQ deleted');
    } catch (e) { toast.show(e.message, 'error'); }
  };

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn size="sm" variant="dashed" onClick={() => setShowAdd(true)} disabled={!subtopicId}>＋ Add MCQ</Btn>
      </div>
      {showAdd && (
        <div style={{ background: clr.faint, borderRadius: 10, padding: 16 }}>
          <div><Lbl>Question</Lbl><Txta value={addForm.question} onChange={v => setAddForm(f => ({ ...f, question: v }))} rows={2} placeholder="Enter MCQ question" /></div>
          {['A', 'B', 'C', 'D'].map(opt => (
            <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input type="radio" name={`correct-${subtopicId}`} checked={addForm.correctAnswer === opt} onChange={() => setAddForm(f => ({ ...f, correctAnswer: opt }))} style={{ accentColor: clr.success }} />
              <Inp value={addForm[`option${opt}`]} onChange={v => setAddForm(f => ({ ...f, [`option${opt}`]: v }))} placeholder={`Option ${opt}`} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <Btn size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn size="sm" onClick={addQ} disabled={adding || !addForm.question.trim()}>{adding ? '…' : 'Add'}</Btn>
          </div>
        </div>
      )}
      {questions.length === 0 && !showAdd && <div style={{ textAlign: 'center', color: clr.muted, fontSize: 13, padding: 24 }}>No exam questions yet.</div>}
      {questions.map((q, i) => (
        <div key={q.id} style={{ background: clr.faint, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: clr.muted }}>MCQ {i + 1}</span>
            <Btn size="sm" variant="danger" onClick={() => delQ(q.id)}>🗑</Btn>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{q.question}</div>
          {['A', 'B', 'C', 'D'].map(opt => (
            <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '4px 8px', background: q.correctAnswer === opt ? clr.successLight : 'transparent', borderRadius: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, width: 20 }}>{opt}.</span>
              <span style={{ fontSize: 13 }}>{q[`option${opt}`]}</span>
              {q.correctAnswer === opt && <span style={{ fontSize: 11, color: clr.success, marginLeft: 'auto' }}>✓ Correct</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAB EXERCISES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function LabTab({ subtopicId, toast, onUpdate, initialData }) {
  const [labs, setLabs] = useState(initialData || []);
  const [addForm, setAddForm] = useState({ title: '', instructions: '' });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!subtopicId) return;
    api.get(`/admin/subtopics/${subtopicId}/labs`)
      .then(data => { const arr = Array.isArray(data) ? data : []; setLabs(arr); onUpdate({ labExercises: arr }); })
      .catch(console.error);
  }, [subtopicId]);

  const addLab = async () => {
    if (!addForm.title.trim()) return;
    setAdding(true);
    try {
      const data = await api.post(`/admin/subtopics/${subtopicId}/labs`, addForm);
      const updated = [...labs, { id: data.labId, ...addForm }];
      setLabs(updated); onUpdate({ labExercises: updated });
      setAddForm({ title: '', instructions: '' }); setShowAdd(false);
      toast.show('Lab step added');
    } catch (e) { toast.show(e.message, 'error'); }
    finally { setAdding(false); }
  };

  const delLab = async (id) => {
    if (!window.confirm('Delete this lab step?')) return;
    try {
      await api.delete(`/admin/labs/${id}`);
      const updated = labs.filter(l => l.id !== id);
      setLabs(updated); onUpdate({ labExercises: updated });
      toast.show('Lab step deleted');
    } catch (e) { toast.show(e.message, 'error'); }
  };

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn size="sm" variant="dashed" onClick={() => setShowAdd(true)} disabled={!subtopicId}>＋ Add Lab Step</Btn>
      </div>
      {showAdd && (
        <div style={{ background: clr.faint, borderRadius: 10, padding: 16 }}>
          <div><Lbl>Step Title</Lbl><Inp value={addForm.title} onChange={v => setAddForm(f => ({ ...f, title: v }))} placeholder="e.g. Configure VLAN" /></div>
          <div style={{ marginTop: 10 }}><Lbl>Instructions</Lbl><Txta value={addForm.instructions} onChange={v => setAddForm(f => ({ ...f, instructions: v }))} rows={4} /></div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <Btn size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn size="sm" onClick={addLab} disabled={adding || !addForm.title.trim()}>{adding ? '…' : 'Add'}</Btn>
          </div>
        </div>
      )}
      {labs.length === 0 && !showAdd && <div style={{ textAlign: 'center', color: clr.muted, fontSize: 13, padding: 24 }}>No lab exercises yet.</div>}
      {labs.map((lab, i) => (
        <div key={lab.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: clr.accentLight, color: clr.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1, background: clr.faint, borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{lab.title}</span>
              <Btn size="sm" variant="danger" onClick={() => delLab(lab.id)}>🗑</Btn>
            </div>
            <div style={{ fontSize: 13, color: clr.muted }}>{lab.instructions}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBTOPIC CONTENT EDITOR – always preview mode, with copy protection
// ═══════════════════════════════════════════════════════════════════════════════
function SubtopicContentEditor({ sub, subtopicId, toast, onUpdate }) {
  const [notes, setNotes] = useState(sub.content || '');
  const [videoUrl, setVideoUrl] = useState(sub.videoUrl || '');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [interviewQuestions, setInterviewQuestions] = useState(sub.interviewQuestions || []);
  const [examQuestions, setExamQuestions] = useState(sub.examQuestions || []);
  const [labExercises, setLabExercises] = useState(sub.labExercises || []);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    setNotes(sub.content || '');
    setVideoUrl(sub.videoUrl || '');
    setInterviewQuestions(sub.interviewQuestions || []);
    setExamQuestions(sub.examQuestions || []);
    setLabExercises(sub.labExercises || []);
  }, [sub]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/subtopics/${subtopicId}`, { content: notes });
      onUpdate({ content: notes });
      toast.show('Notes saved');
    } catch (e) { toast.show(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const saveVideo = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/subtopics/${subtopicId}/video`, { videoUrl });
      onUpdate({ videoUrl });
      toast.show('Video URL saved');
    } catch (e) { toast.show(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleTabUpdate = (patch) => {
    if (patch.interviewQuestions !== undefined) setInterviewQuestions(patch.interviewQuestions);
    if (patch.examQuestions !== undefined) setExamQuestions(patch.examQuestions);
    if (patch.labExercises !== undefined) setLabExercises(patch.labExercises);
    onUpdate(patch);
  };

  const uploadPdfToSubtopic = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.show('Only PDF files allowed', 'error');
      return;
    }
    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_BASE}/admin/subtopics/${subtopicId}/upload-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `HTTP ${response.status}`);
      }
      const data = await response.json();
      const refreshedSub = await api.get(`/admin/subtopics/${subtopicId}`);
      setNotes(refreshedSub.content || '');
      setVideoUrl(refreshedSub.videoUrl || '');
      onUpdate(refreshedSub);
      toast.show(`✅ PDF processed: ${data.imageCount || 0} images extracted.`, 'success');
    } catch (err) {
      console.error('Upload error:', err);
      toast.show(err.message || 'Upload failed', 'error');
    } finally {
      setUploadingPdf(false);
    }
  };

  const embedUrl = videoUrl?.includes('watch?v=')
    ? videoUrl.replace('watch?v=', 'embed/')
    : videoUrl?.includes('youtu.be/')
      ? videoUrl.replace('youtu.be/', 'youtube.com/embed/')
      : null;

  const tabs = [
    { key: 'notes', label: '📝 Notes' },
    { key: 'video', label: '🎬 Video' },
    { key: 'interview', label: '🎤 Interview Qs' },
    { key: 'exam', label: '📋 Exam Qs' },
    { key: 'lab', label: '🧪 Lab Steps' },
  ];

  return (
    <Card>
      <div style={{ borderBottom: `1px solid ${clr.border}`, display: 'flex', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: activeTab === tab.key ? clr.accent : clr.muted,
            borderBottom: activeTab === tab.key ? `2px solid ${clr.accent}` : '2px solid transparent',
            fontWeight: activeTab === tab.key ? 600 : 400, whiteSpace: 'nowrap',
          }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
        {activeTab === 'notes' && (
          <div style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Lbl>Notes / Content</Lbl>
              <Btn size="sm" onClick={saveNotes} disabled={saving} variant="success">
                {saving ? 'Saving…' : '💾 Save Notes'}
              </Btn>
            </div>
            <PdfUploadButton
              subtopicId={subtopicId}
              uploadingPdf={uploadingPdf}
              onFileSelected={uploadPdfToSubtopic}
            />
            <div
              style={{
                border: `1px solid ${clr.border}`,
                borderRadius: 8,
                padding: 16,
                background: clr.white,
                minHeight: 300,
                overflowY: 'auto',
                fontSize: 13,
                lineHeight: 1.6,
                userSelect: 'none',            // prevent text selection
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
              }}
              onCopy={(e) => e.preventDefault()}    // block copy event
            >
              <ReactMarkdown
                components={{
                  img: ({ src, alt }) => {
                    if (!src) return null;
                    let cleanSrc = src;
                    if (cleanSrc.startsWith('/admin/')) cleanSrc = cleanSrc.slice(6);
                    const fullSrc = `${API_BASE}${cleanSrc}`;
                    return <img src={fullSrc} alt={alt} style={{ maxWidth: '100%', height: 'auto', margin: '12px 0', borderRadius: 8 }} />;
                  }
                }}
              >
                {notes}
              </ReactMarkdown>
            </div>
          </div>
        )}
        {activeTab === 'video' && (
          <div style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Lbl>Video URL</Lbl>
              <Btn size="sm" onClick={saveVideo} disabled={saving} variant="success">{saving ? 'Saving…' : '💾 Save Video'}</Btn>
            </div>
            <Inp value={videoUrl} onChange={setVideoUrl} placeholder="https://youtube.com/watch?v=..." />
            {embedUrl && <iframe width="100%" height="400" src={embedUrl} frameBorder="0" allowFullScreen style={{ marginTop: 16, borderRadius: 8 }} />}
          </div>
        )}
        {activeTab === 'interview' && <InterviewTab subtopicId={subtopicId} toast={toast} onUpdate={handleTabUpdate} initialData={interviewQuestions} />}
        {activeTab === 'exam' && <ExamTab subtopicId={subtopicId} toast={toast} onUpdate={handleTabUpdate} initialData={examQuestions} />}
        {activeTab === 'lab' && <LabTab subtopicId={subtopicId} toast={toast} onUpdate={handleTabUpdate} initialData={labExercises} />}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminCourseManager() {
  const toast = useToast();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [activeSubId, setActiveSubId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('course');
  const [pagination, setPagination] = useState({
    currentPage: 0, totalPages: 0, totalItems: 0,
    pageSize: 50, hasNext: false, hasPrevious: false,
  });

  const activeTopic = topics.find(t => t.id === activeTopicId);
  const subtopics = activeTopic?.subtopics || [];
  const activeSub = subtopics.find(s => s.id === activeSubId);

  const loadTopics = useCallback(async (courseId, page = 0) => {
    if (!courseId) return;
    setLoading(true);
    try {
      const data = await api.get(`/admin/courses/${courseId}/topics?page=${page}&size=50&sortBy=displayOrder`);
      if (data.content && Array.isArray(data.content)) {
        setTopics(data.content);
        setPagination({
          currentPage: data.currentPage, totalPages: data.totalPages,
          totalItems: data.totalItems, pageSize: data.pageSize,
          hasNext: data.hasNext, hasPrevious: data.hasPrevious,
        });
        if (data.content.length > 0 && !activeTopicId) {
          setActiveTopicId(data.content[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
      toast.show('Failed to load topics', 'error');
    } finally { setLoading(false); }
  }, [toast]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      loadTopics(selectedCourse?.id, newPage);
      setActiveTopicId(null); setActiveSubId(null);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setTopics([]); setActiveTopicId(null); setActiveSubId(null);
    setView('manage');
    loadTopics(course.id, 0);
  };

  const setSubtopics = (topicId, updater) => {
    setTopics(ts => ts.map(t => t.id === topicId
      ? { ...t, subtopics: typeof updater === 'function' ? updater(t.subtopics || []) : updater }
      : t));
  };

  const updateActiveSub = (patch) => {
    setTopics(ts => ts.map(t => ({
      ...t,
      subtopics: (t.subtopics || []).map(s => s.id === activeSubId ? { ...s, ...patch } : s),
    })));
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: clr.text, background: clr.bg, minHeight: '100vh' }}>
      <style>{`* { box-sizing: border-box; } button { font-family: inherit; }`}</style>
      <div style={{ background: clr.sidebar, padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>🏫 Course Manager</div>
        {selectedCourse && (
          <>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ fontSize: 13, color: clr.sidebarText }}>{selectedCourse.title}</div>
            <div style={{ fontSize: 11, color: clr.sidebarText, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 12 }}>
              {pagination.totalItems} topics
            </div>
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button onClick={() => setView('course')} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 7, border: 'none', cursor: 'pointer', background: view === 'course' ? clr.accent : 'rgba(255,255,255,0.1)', color: '#fff' }}>🏠 Courses</button>
          {selectedCourse && <button onClick={() => setView('manage')} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 7, border: 'none', cursor: 'pointer', background: view === 'manage' ? clr.accent : 'rgba(255,255,255,0.1)', color: '#fff' }}>✏ Manage Content</button>}
        </div>
      </div>
      {view === 'course' && (
        <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 24px' }}>
          <Card>
            <SectionHead icon="🎓" title="Select a course to manage" />
            <CourseSelector selectedCourse={selectedCourse} onSelect={handleCourseSelect} toast={toast} />
          </Card>
        </div>
      )}
      {view === 'manage' && selectedCourse && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, minHeight: 'calc(100vh - 57px)' }}>
          <div style={{ borderRight: `1px solid ${clr.border}`, background: clr.white, overflowY: 'auto' }}>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loading ? (
                <div style={{ padding: 24, textAlign: 'center', color: clr.muted }}>Loading...</div>
              ) : (
                <TopicManager
                  courseId={selectedCourse.id}
                  topics={topics}
                  setTopics={setTopics}
                  activeTopicId={activeTopicId}
                  setActiveTopicId={(id) => { setActiveTopicId(id); setActiveSubId(null); }}
                  toast={toast}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              )}
              {activeTopic && (
                <SubtopicManager
                  topic={activeTopic}
                  subtopics={subtopics}
                  setSubtopics={(updater) => setSubtopics(activeTopicId, updater)}
                  activeSubId={activeSubId}
                  setActiveSubId={setActiveSubId}
                  toast={toast}
                />
              )}
            </div>
          </div>
          <div style={{ overflowY: 'auto', padding: 20 }}>
            {activeSub ? (
              <SubtopicContentEditor key={activeSub.id} sub={activeSub} subtopicId={activeSub.id} toast={toast} onUpdate={updateActiveSub} />
            ) : (
              <div style={{ textAlign: 'center', color: clr.muted, padding: 60 }}>
                {activeTopic ? 'Select a subtopic to edit its content' : 'Select a topic first, then choose a subtopic'}
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}