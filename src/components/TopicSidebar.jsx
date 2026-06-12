// src/components/TopicSidebar.jsx
import React, { useState } from 'react';
import { createTopic, updateTopic, deleteTopic, createSubtopic, updateSubtopic, deleteSubtopic } from '../api/courseApi';

const clr = {
  border: '#e4e7ec',
  accent: '#4f46e5',
  accentLight: '#eef2ff',
  accentText: '#3730a3',
  text: '#0f172a',
  muted: '#64748b',
  faint: '#f1f5f9',
  danger: '#dc2626',
  white: '#ffffff',
};

const Card = ({ children }) => (
  <div style={{ background: clr.white, borderRadius: 12, border: `1px solid ${clr.border}` }}>
    {children}
  </div>
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

const Lbl = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: clr.muted, display: 'block', marginBottom: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
    {children}
  </label>
);

const Inp = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value || ''}
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
    }}
    onFocus={e => e.target.style.borderColor = clr.accent}
    onBlur={e => e.target.style.borderColor = clr.border}
  />
);

const Btn = ({ children, onClick, disabled, variant = 'primary', size = 'sm' }) => {
  const sizes = { sm: { padding: '5px 12px', fontSize: 12 } };
  const variants = {
    primary: { background: clr.accent, color: '#fff' },
    ghost: { background: clr.faint, color: clr.muted, border: `1px solid ${clr.border}` },
    dashed: { background: clr.accentLight, color: clr.accentText, border: `1.5px dashed ${clr.accent}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        fontFamily: 'inherit',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
        ...sizes[size],
        ...variants[variant],
      }}
    >
      {children}
    </button>
  );
};

const Modal = ({ title, onClose, children, width = 520 }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div
      style={{
        background: clr.white,
        borderRadius: 16,
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${clr.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: clr.text }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: clr.muted, lineHeight: 1 }}>
          ×
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
    </div>
  </div>
);

function TopicManager({ courseId, topics, setTopics, activeTopicId, setActiveTopicId, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openAdd = () => {
    setForm({ title: '' });
    setEditId(null);
    setModal('add');
  };
  const openEdit = (t) => {
    setForm({ title: t.title });
    setEditId(t.id);
    setModal('edit');
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await updateTopic(editId, { title: form.title });
        setTopics(ts => ts.map(t => (t.id === editId ? { ...t, title: form.title } : t)));
        toast.show('Topic updated');
      } else {
        const data = await createTopic(courseId, { title: form.title });
        const newTopic = { id: data.topicId || data.topic?.id, title: form.title, subtopics: [] };
        setTopics(ts => [...ts, newTopic]);
        toast.show('Topic created');
      }
      setModal(null);
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this topic and all its subtopics?')) return;
    setDeletingId(id);
    try {
      await deleteTopic(id);
      setTopics(ts => ts.filter(t => t.id !== id));
      if (activeTopicId === id) setActiveTopicId(null);
      toast.show('Topic deleted');
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Card>
        <SectionHead
          icon="📚"
          title="Topics"
          count={topics.length}
          action={<Btn size="sm" variant="dashed" onClick={openAdd}>＋ Add topic</Btn>}
        />
        <div style={{ padding: '8px 0' }}>
          {topics.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: clr.muted, fontSize: 13 }}>
              No topics yet. Add one above or upload a PDF.
            </div>
          )}
          {topics.map((t, i) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                background: activeTopicId === t.id ? clr.accentLight : 'transparent',
                borderLeft: activeTopicId === t.id ? `3px solid ${clr.accent}` : '3px solid transparent',
                cursor: 'pointer',
                borderBottom: `1px solid ${clr.border}`,
              }}
              onClick={() => setActiveTopicId(t.id)}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: clr.accentLight,
                  color: clr.accentText,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: activeTopicId === t.id ? 600 : 400,
                  color: activeTopicId === t.id ? clr.accentText : clr.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.title}
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: clr.muted, background: clr.faint, padding: '2px 7px', borderRadius: 10 }}>
                  {t.subtopics?.length || 0} subs
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    openEdit(t);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.muted, fontSize: 14, padding: '2px 5px' }}
                >
                  ✏
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    del(t.id);
                  }}
                  disabled={deletingId === t.id}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.danger, fontSize: 14, padding: '2px 5px' }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {modal && (
        <Modal title={modal === 'add' ? 'Add topic' : 'Edit topic'} onClose={() => setModal(null)}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Lbl>Topic title</Lbl>
              <Inp value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Network Fundamentals" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn variant="ghost" onClick={() => setModal(null)}>
                Cancel
              </Btn>
              <Btn onClick={save} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving…' : modal === 'add' ? 'Create topic' : 'Save changes'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function SubtopicManager({ topic, subtopics, setSubtopics, activeSubId, setActiveSubId, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '', notes: '', videoUrl: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openAdd = () => {
    setForm({ title: '', notes: '', videoUrl: '' });
    setEditId(null);
    setModal('form');
  };
  const openEdit = (s) => {
    setForm({ title: s.title, notes: s.notes || '', videoUrl: s.videoUrl || '' });
    setEditId(s.id);
    setModal('form');
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await updateSubtopic(editId, form);
        setSubtopics(ss => ss.map(s => (s.id === editId ? { ...s, ...form } : s)));
        toast.show('Subtopic updated');
      } else {
        const data = await createSubtopic(topic.id, form);
        const newSub = { id: data.subtopicId || data.subtopic?.id, ...form, interviewQuestions: [], examQuestions: [], labExercises: [] };
        setSubtopics(ss => [...ss, newSub]);
        toast.show('Subtopic created');
      }
      setModal(null);
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this subtopic and all its content?')) return;
    setDeletingId(id);
    try {
      await deleteSubtopic(id);
      setSubtopics(ss => ss.filter(s => s.id !== id));
      if (activeSubId === id) setActiveSubId(null);
      toast.show('Subtopic deleted');
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const Txta = ({ value, onChange, placeholder, rows = 4 }) => (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '10px 12px',
        fontSize: 13,
        border: `1px solid ${clr.border}`,
        borderRadius: 8,
        outline: 'none',
        resize: 'vertical',
        background: clr.white,
        color: clr.text,
        fontFamily: 'inherit',
        lineHeight: 1.6,
        boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = clr.accent}
      onBlur={e => e.target.style.borderColor = clr.border}
    />
  );

  return (
    <>
      <Card>
        <SectionHead
          icon="📑"
          title={`Subtopics — ${topic.title}`}
          count={subtopics.length}
          action={<Btn size="sm" variant="dashed" onClick={openAdd}>＋ Add subtopic</Btn>}
        />
        <div style={{ padding: '8px 0' }}>
          {subtopics.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: clr.muted, fontSize: 13 }}>No subtopics yet.</div>
          )}
          {subtopics.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                background: activeSubId === s.id ? clr.accentLight : 'transparent',
                borderLeft: activeSubId === s.id ? `3px solid ${clr.accent}` : '3px solid transparent',
                cursor: 'pointer',
                borderBottom: `1px solid ${clr.border}`,
              }}
              onClick={() => setActiveSubId(s.id)}
            >
              <span style={{ fontSize: 11, color: clr.muted, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
              <div
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: activeSubId === s.id ? 600 : 400,
                  color: activeSubId === s.id ? clr.accentText : clr.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.title || 'Untitled'}
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                {s.notes && <span title="Has notes" style={{ fontSize: 11 }}>📝</span>}
                {s.videoUrl && <span title="Has video" style={{ fontSize: 11 }}>🎬</span>}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    openEdit(s);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.muted, fontSize: 13 }}
                >
                  ✏
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    del(s.id);
                  }}
                  disabled={deletingId === s.id}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.danger, fontSize: 13 }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {modal && (
        <Modal title={editId ? 'Edit subtopic' : 'Add subtopic'} onClose={() => setModal(null)} width={600}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Lbl>Title</Lbl>
              <Inp value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. OSI Model" />
            </div>
            <div>
              <Lbl>Initial notes (optional)</Lbl>
              <Txta value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Lesson notes…" rows={4} />
            </div>
            <div>
              <Lbl>Video URL (optional)</Lbl>
              <Inp value={form.videoUrl} onChange={v => setForm(f => ({ ...f, videoUrl: v }))} placeholder="https://youtube.com/watch?v=…" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Btn variant="ghost" onClick={() => setModal(null)}>
                Cancel
              </Btn>
              <Btn onClick={save} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving…' : editId ? 'Save changes' : 'Create subtopic'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// Export both components
export { TopicManager, SubtopicManager };
