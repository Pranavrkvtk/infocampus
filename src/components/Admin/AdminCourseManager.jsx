// src/components/Admin/AdminCourseManager.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import AddCourseModal from './AddCourseModal';
import axiosInstance from '../../api/axios';
import { getImageUrl } from '../../utils/imageUtils';
import { DocumentUploadButton } from './Shared/DocumentUploadButton';
import { PdfUploadProgress } from './Shared/PdfUploadProgress';
import { usePdfUpload } from './Shared/usePdfUpload';

import ExamTab from './ExamTab';
import InterviewTab from './InterviewTab';
import LabsTab from './LabsTab';

// Thin wrapper for axios
const api = {
  get: (url) => axiosInstance.get(url).then(r => r.data),
  post: (url, body) => axiosInstance.post(url, body).then(r => r.data),
  put: (url, body) => axiosInstance.put(url, body).then(r => r.data),
  delete: (url) => axiosInstance.delete(url).then(r => r.data),
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
  
  const show = useCallback((msg, type = 'success') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  
  return useMemo(() => ({ toasts, show }), [toasts, show]);
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
// COURSE IMAGE UPLOADER
// ═══════════════════════════════════════════════════════════════════════════════
function CourseImageUploader({ course, onImageUploaded, toast }) {
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.show('Please upload an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.show('Image must be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post(
        `/admin/courses/${course.id}/upload-image`,
        formData
      );

      const updatedCourse = { ...course, imageUrl: response.data.imageUrl };
      onImageUploaded(updatedCourse);
      setImageError(false);
      toast.show('Course image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to upload image';
      toast.show(errorMsg, 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const imageSrc = getImageUrl(course.imageUrl);

  return (
    <div style={{ padding: '16px', background: clr.faint, borderRadius: 10, border: `1px solid ${clr.border}`, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Lbl>Course Image</Lbl>
        <Btn size="sm" variant="dashed" onClick={() => document.getElementById(`image-upload-${course.id}`).click()}>
          {uploading ? '⏳ Uploading...' : '📷 Upload Image'}
        </Btn>
      </div>

      <input
        id={`image-upload-${course.id}`}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
        disabled={uploading}
      />

      {imageSrc && !imageError ? (
        <div style={{ marginTop: 8 }}>
          <img
            src={imageSrc}
            alt={course.title}
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 8, objectFit: 'cover', border: `1px solid ${clr.border}` }}
            onError={() => {
              console.error('❌ Image load error for URL:', imageSrc);
              setImageError(true);
            }}
            onLoad={() => {
              setImageError(false);
            }}
          />
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: clr.muted, border: `2px dashed ${clr.border}`, borderRadius: 8, marginTop: 8 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
          <div style={{ fontSize: 13 }}>
            {imageError ? '⚠️ Image not found or cannot be loaded' : 'No image uploaded. Click "Upload Image" to add one.'}
          </div>
        </div>
      )}
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
  const [imageErrors, setImageErrors] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const hasLoaded = useRef(false);

  const loadCourses = async () => {
    if (hasLoaded.current) {
      console.log('📦 Courses already loaded, skipping API call');
      return;
    }
    
    setLoading(true);
    try {
      console.log('📡 Loading courses (ONCE)');
      const data = await api.get('/admin/courses');
      setCourses(Array.isArray(data) ? data : []);
      hasLoaded.current = true;
    } catch (error) { 
      console.error('Error loading courses:', error);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCourses(); }, []);

  const handleCourseCreated = async () => {
    hasLoaded.current = false;
    await loadCourses();
    toast.show('Course created successfully!', 'success');
  };

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  const handleImageError = (courseId) => {
    setImageErrors(prev => ({ ...prev, [courseId]: true }));
  };

  const getImageUrlForCourse = (course) => {
    return getImageUrl(course.imageUrl);
  };

  return (
    <>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Lbl>Select course to manage</Lbl>
          <Btn size="sm" variant="dashed" onClick={() => setIsAddModalOpen(true)}>
            + Create New Course
          </Btn>
        </div>
        <Inp value={search} onChange={setSearch} placeholder="Search courses…" />
        <div style={{ marginTop: 12 }}>
          {loading
            ? <div style={{ padding: 24, textAlign: 'center', color: clr.muted }}>Loading courses…</div>
            : filtered.length === 0
              ? <div style={{ padding: 24, textAlign: 'center', color: clr.muted }}>No courses yet.</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
                  {filtered.map(c => {
                    const imageUrl = getImageUrlForCourse(c);
                    const hasError = imageErrors[c.id];
                    
                    return (
                      <div key={c.id} onClick={() => onSelect(c)} style={{
                        padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                        background: selectedCourse?.id === c.id ? clr.accentLight : clr.faint,
                        border: `1.5px solid ${selectedCourse?.id === c.id ? clr.accent : 'transparent'}`,
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <div style={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: 8, 
                          background: c.imageUrl && !hasError ? '#f0f0f0' : clr.accent,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                          color: '#fff',
                          fontSize: 18,
                          fontWeight: 700,
                        }}>
                          {c.imageUrl && !hasError ? (
                            <img 
                              src={imageUrl} 
                              alt={c.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={() => {
                                console.error('❌ Failed to load image for course:', c.id, imageUrl);
                                handleImageError(c.id);
                              }}
                            />
                          ) : (
                            <span>{c.title?.[0]?.toUpperCase() || '?'}</span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{c.title}</div>
                          <div style={{ fontSize: 11, color: clr.muted }}>ID: {c.id} {c.imageUrl && !hasError ? '📷' : ''}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
          }
        </div>
      </div>

      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCourseCreated={handleCourseCreated}
        isInstructor={false}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOPIC MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
function TopicManager({
  courseId,
  topics,
  setTopics,
  activeTopicId,
  setActiveTopicId,
  activeSubId,
  setActiveSubId,
  toast,
  pagination,
  onPageChange,
  expandedTopics,
  toggleTopic,
}) {
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
          {topics.map((t, i) => {
            const isExpanded = expandedTopics[t.id] ?? false;
            return (
              <div key={t.id}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                    background: activeTopicId === t.id ? clr.accentLight : 'transparent',
                    borderLeft: activeTopicId === t.id ? `3px solid ${clr.accent}` : '3px solid transparent',
                    cursor: 'pointer', borderBottom: `1px solid ${clr.border}`,
                  }}
                  onClick={() => {
                    toggleTopic(t.id);
                    setActiveTopicId(t.id);
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: clr.accentLight, color: clr.accentText, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i + 1 + (pagination.currentPage * pagination.pageSize)}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: activeTopicId === t.id ? 600 : 400 }}>{t.title}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ fontSize: 11, color: clr.muted, background: clr.faint, padding: '2px 7px', borderRadius: 10 }}>{t.subtopics?.length || 0}</span>
                    <button onClick={e => { e.stopPropagation(); openEdit(t); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.muted }}>✏</button>
                    <button onClick={e => { e.stopPropagation(); del(t.id); }} disabled={deletingId === t.id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.danger }}>🗑</button>
                    <button onClick={e => { e.stopPropagation(); toggleTopic(t.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: clr.muted }}>
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ paddingLeft: '20px' }}>
                    {t.subtopics?.map((sub, idx) => (
                      <div
                        key={sub.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px',
                          background: activeSubId === sub.id ? clr.accentLight : 'transparent',
                          borderLeft: activeSubId === sub.id ? `3px solid ${clr.accent}` : '3px solid transparent',
                          cursor: 'pointer', borderBottom: `1px solid ${clr.border}`,
                        }}
                        onClick={() => {
                          setActiveTopicId(t.id);
                          setActiveSubId(sub.id);
                        }}
                      >
                        <span style={{ fontSize: 11, color: clr.muted, width: 24 }}>{idx + 1}</span>
                        <div style={{ flex: 1, fontSize: 13 }}>{sub.title}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
// MARKDOWN IMAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function MarkdownImage({ src, alt }) {
  if (!src) return null;

  const imageUrl = getImageUrl(src);

  return (
    <img
      src={imageUrl}
      alt={alt || 'image'}
      style={{ 
        maxWidth: '100%', 
        height: 'auto', 
        borderRadius: 8, 
        display: 'block',
        border: '1px solid #e5e7eb',
        padding: '4px',
        background: '#f9fafb',
        margin: '12px 0'
      }}
      onError={() => {
        console.error('❌ Markdown image load error:', imageUrl);
      }}
      onLoad={() => {
        console.log('✅ Image loaded successfully:', imageUrl);
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBTOPIC CONTENT EDITOR - WITH SHARED PDF UPLOAD AND LABS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const SubtopicContentEditor = React.memo(function SubtopicContentEditor({ 
  sub, 
  subtopicId, 
  toast, 
  onUpdate, 
  highlightSearchTerm 
}) {
  const [notes, setNotes] = useState(sub?.content || '');
  const [videoUrl, setVideoUrl] = useState(sub?.videoUrl || '');
  const [examContent, setExamContent] = useState(sub?.examContent || '');
  const [interviewContent, setInterviewContent] = useState(sub?.interviewContent || '');
  const [labsContent, setLabsContent] = useState(sub?.labsContent || '');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');

  // ✅ Use the shared PDF upload hook for Notes
  const {
    uploadingDoc,
    showProgress,
    progress,
    fileName,
    uploadDocument,
    handleCancelUpload,
  } = usePdfUpload({
    subtopicId,
    toast,
    endpoint: `/admin/subtopics/${subtopicId}/upload-pdf`,
    onSuccess: async (data) => {
      const refreshedSub = await api.get(`/admin/subtopics/${subtopicId}`);
      setNotes(refreshedSub.content || '');
      setVideoUrl(refreshedSub.videoUrl || '');
      setExamContent(refreshedSub.examContent || '');
      setInterviewContent(refreshedSub.interviewContent || '');
      setLabsContent(refreshedSub.labsContent || '');
      onUpdate(refreshedSub);
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  useEffect(() => {
    if (sub && sub.id) {
      setNotes(sub.content || '');
      setVideoUrl(sub.videoUrl || '');
      setExamContent(sub.examContent || '');
      setInterviewContent(sub.interviewContent || '');
      setLabsContent(sub.labsContent || '');
    }
  }, [sub]);

  useEffect(() => {
    if (highlightSearchTerm && highlightSearchTerm.trim()) {
      setSearchTerm(highlightSearchTerm);
    } else {
      setSearchTerm('');
    }
  }, [highlightSearchTerm]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }
    const regex = new RegExp(searchTerm, 'gi');
    const text = activeTab === 'notes' ? notes 
      : activeTab === 'exam' ? examContent 
      : activeTab === 'interview' ? interviewContent 
      : activeTab === 'labs' ? labsContent 
      : '';
    const found = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      found.push({ start: match.index, end: match.index + match[0].length });
    }
    setMatches(found);
    setCurrentMatchIndex(found.length > 0 ? 0 : -1);
  }, [searchTerm, notes, examContent, interviewContent, labsContent, activeTab]);

  const goToMatch = (index) => {
    if (index < 0 || index >= matches.length) return;
    const match = matches[index];
    setCurrentMatchIndex(index);
    const editorId = activeTab === 'notes' ? 'notes-editor' 
      : activeTab === 'exam' ? 'exam-editor' 
      : activeTab === 'interview' ? 'interview-editor' 
      : 'labs-editor';
    const textarea = document.getElementById(editorId);
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(match.start, match.end);
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const lines = textarea.value.substring(0, match.start).split('\n').length;
      textarea.scrollTop = (lines - 3) * lineHeight;
    }
  };

  const clearNotes = async () => {
    if (!window.confirm('Are you sure you want to clear all notes content?')) return;
    
    setSaving(true);
    try {
      await api.put(`/admin/subtopics/${subtopicId}`, { content: '' });
      setNotes('');
      onUpdate({ content: '' });
      toast.show('Notes cleared successfully!', 'success');
    } catch (e) {
      console.error('Clear notes error:', e);
      toast.show(e.message || 'Failed to clear notes', 'error');
    } finally {
      setSaving(false);
    }
  };

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
    console.log('🟡 handleTabUpdate received:', patch);
    
    if (patch.examContent !== undefined) {
      setExamContent(patch.examContent);
    }
    if (patch.interviewContent !== undefined) {
      console.log('🟡 Setting interviewContent to:', patch.interviewContent);
      setInterviewContent(patch.interviewContent);
    }
    if (patch.labsContent !== undefined) {
      console.log('🟡 Setting labsContent to:', patch.labsContent);
      setLabsContent(patch.labsContent);
    }
    
    onUpdate(patch);
  };

  const embedUrl = videoUrl?.includes('watch?v=')
    ? videoUrl.replace('watch?v=', 'embed/')
    : videoUrl?.includes('youtu.be/')
      ? videoUrl.replace('youtu.be/', 'youtube.com/embed/')
      : null;

  const tabs = [
    { key: 'notes', label: '📝 Notes' },
    { key: 'video', label: '🎬 Video' },
    { key: 'exam', label: '📋 Exam Content' },
    { key: 'interview', label: '🎤 Interview Qs' },
    { key: 'labs', label: '🧪 Labs' },
  ];

  const markdownComponents = useMemo(() => ({
    img: ({ src, alt }) => <MarkdownImage src={src} alt={alt} />,
  }), []);

  const highlightText = (text) => {
    if (!searchTerm.trim()) return text;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark style="background:#fde047;color:#1e293b;padding:0 2px;border-radius:2px;">$1</mark>');
  };

  return (
    <>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Lbl>📝 Markdown Editor (Admin Editable)</Lbl>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn size="sm" onClick={clearNotes} disabled={saving || !notes} variant="danger">
                    {saving ? 'Clearing…' : '🗑️ Clear Content'}
                  </Btn>
                  <Btn size="sm" onClick={saveNotes} disabled={saving} variant="success">
                    {saving ? 'Saving…' : '💾 Save Notes'}
                  </Btn>
                </div>
              </div>

              {/* ✅ Use shared DocumentUploadButton */}
              <DocumentUploadButton
                uploading={uploadingDoc}
                onFileSelected={uploadDocument}
                toast={toast}
                label="Upload PDF Only"
                buttonId={`notes-upload-${subtopicId}`}
              />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: `1px solid ${clr.border}`,
                    borderRadius: '6px',
                    outline: 'none',
                    fontSize: '13px',
                    background: clr.white,
                    color: clr.text,
                  }}
                />
                {matches.length > 0 && (
                  <span style={{ fontSize: '12px', color: clr.muted, minWidth: '60px' }}>
                    {currentMatchIndex + 1} of {matches.length}
                  </span>
                )}
                <button
                  onClick={() => goToMatch(currentMatchIndex - 1)}
                  disabled={matches.length === 0}
                  style={{
                    background: matches.length ? clr.accentLight : clr.faint,
                    border: `1px solid ${clr.border}`,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: matches.length ? 'pointer' : 'not-allowed',
                    color: matches.length ? clr.accentText : clr.muted,
                  }}
                >
                  ↑
                </button>
                <button
                  onClick={() => goToMatch(currentMatchIndex + 1)}
                  disabled={matches.length === 0}
                  style={{
                    background: matches.length ? clr.accentLight : clr.faint,
                    border: `1px solid ${clr.border}`,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: matches.length ? 'pointer' : 'not-allowed',
                    color: matches.length ? clr.accentText : clr.muted,
                  }}
                >
                  ↓
                </button>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '16px',
                      cursor: 'pointer',
                      color: clr.muted,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <textarea
                  id="notes-editor"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={12}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    padding: 12,
                    border: `1px solid ${clr.border}`,
                    borderRadius: 8,
                    outline: 'none',
                    background: clr.white,
                    color: clr.text,
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, color: clr.muted }}>
                  📄 Preview (Students will see this with copy protection) – <mark style={{ background: '#fde047', padding: '0 4px', borderRadius: '2px' }}>yellow</mark> highlights matches
                </div>
                <div
                  style={{
                    border: `1px solid ${clr.border}`,
                    borderRadius: 8,
                    padding: 16,
                    background: clr.white,
                    minHeight: 200,
                    overflowY: 'auto',
                    fontSize: 13,
                    lineHeight: 1.6,
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                  }}
                  onCopy={(e) => e.preventDefault()}
                >
                  <ReactMarkdown
                    components={markdownComponents}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {highlightText(notes)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Lbl>Video URL</Lbl>
                <Btn size="sm" onClick={saveVideo} disabled={saving} variant="success">
                  {saving ? 'Saving…' : '💾 Save Video'}
                </Btn>
              </div>
              <Inp value={videoUrl} onChange={setVideoUrl} placeholder="https://youtube.com/watch?v=..." />
              {embedUrl && (
                <iframe
                  width="100%"
                  height="400"
                  src={embedUrl}
                  title="Video Preview"
                  frameBorder="0"
                  allowFullScreen
                  style={{ marginTop: 16, borderRadius: 8 }}
                />
              )}
            </div>
          )}

          {activeTab === 'exam' && (
            <ExamTab 
              subtopicId={subtopicId} 
              toast={toast} 
              onUpdate={handleTabUpdate} 
              initialData={{ examContent: examContent }}
            />
          )}

          {activeTab === 'interview' && (
            <InterviewTab 
              subtopicId={subtopicId} 
              toast={toast} 
              onUpdate={handleTabUpdate} 
              initialData={{ interviewContent: interviewContent }}
            />
          )}

          {activeTab === 'labs' && (
            <LabsTab 
              subtopicId={subtopicId} 
              toast={toast} 
              onUpdate={handleTabUpdate} 
              initialData={{ labsContent: labsContent }}
            />
          )}
        </div>
      </Card>

      {/* ✅ Use shared progress modal */}
      {showProgress && (
        <PdfUploadProgress
          progress={progress}
          fileName={fileName}
          onCancel={handleCancelUpload}
        />
      )}
    </>
  );
});

SubtopicContentEditor.displayName = 'SubtopicContentEditor';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminCourseManager() {
  const toast = useToast();
  
  const toastRef = useRef(toast);
  
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);
  
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

  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [highlightSearchTerm, setHighlightSearchTerm] = useState('');
  const [expandedTopics, setExpandedTopics] = useState({});

  const allSubtopics = useMemo(() => {
    const subs = [];
    topics.forEach(topic => {
      (topic.subtopics || []).forEach(sub => {
        subs.push({
          ...sub,
          topicId: topic.id,
          topicTitle: topic.title,
        });
      });
    });
    return subs;
  }, [topics]);

  useEffect(() => {
    if (!courseSearchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const term = courseSearchTerm.toLowerCase().trim();
    const results = allSubtopics
      .map(sub => {
        const content = sub.content || '';
        const title = sub.title || '';
        let match = false;
        let snippet = '';
        let preview = '';
        if (content.toLowerCase().includes(term)) {
          match = true;
          const idx = content.toLowerCase().indexOf(term);
          const start = Math.max(0, idx - 40);
          const end = Math.min(content.length, idx + term.length + 40);
          snippet = (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
          preview = content.substring(Math.max(0, idx - 60), Math.min(content.length, idx + term.length + 60));
        } else if (title.toLowerCase().includes(term)) {
          match = true;
          snippet = title;
          preview = title;
        }
        return match ? { ...sub, snippet, preview } : null;
      })
      .filter(Boolean);
    setSearchResults(results);
    setShowResults(results.length > 0);
  }, [courseSearchTerm, allSubtopics]);

  const navigateToResult = (result) => {
    setActiveTopicId(result.topicId);
    setActiveSubId(result.id);
    setHighlightSearchTerm(courseSearchTerm);
    setExpandedTopics(prev => ({ ...prev, [result.topicId]: true }));
    setCourseSearchTerm('');
    setShowResults(false);
    setSearchResults([]);
  };

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
        const expanded = {};
        data.content.forEach(t => { expanded[t.id] = true; });
        setExpandedTopics(expanded);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
      toast.show('Failed to load topics', 'error');
    } finally { setLoading(false); }
  }, [toast, activeTopicId]);

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

  const handleCourseUpdate = (updatedCourse) => {
    setSelectedCourse(updatedCourse);
  };

  const setSubtopics = (topicId, updater) => {
    setTopics(ts => ts.map(t => t.id === topicId
      ? { ...t, subtopics: typeof updater === 'function' ? updater(t.subtopics || []) : updater }
      : t));
  };

  const updateActiveSub = useCallback((patch) => {
    setTopics(ts => ts.map(t => ({
      ...t,
      subtopics: (t.subtopics || []).map(s => s.id === activeSubId ? { ...s, ...patch } : s),
    })));
  }, [activeSubId]);

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const subtopicEditor = useMemo(() => {
    if (!activeSub) return null;
    console.log('🔄 Creating SubtopicContentEditor for:', activeSub.id);
    return (
      <SubtopicContentEditor
        key={activeSub.id}
        sub={activeSub}
        subtopicId={activeSub.id}
        toast={toastRef.current}
        onUpdate={updateActiveSub}
        highlightSearchTerm={highlightSearchTerm}
      />
    );
  }, [activeSub, updateActiveSub, highlightSearchTerm]);

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
          <button onClick={() => setView('course')} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 7, border: 'none', cursor: 'pointer', background: view === 'course' ? clr.accent : 'rgba(255,255,255,0.1)', color: '#fff' }}>
            🏠 Courses
          </button>
          {selectedCourse && (
            <button onClick={() => setView('manage')} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 7, border: 'none', cursor: 'pointer', background: view === 'manage' ? clr.accent : 'rgba(255,255,255,0.1)', color: '#fff' }}>
              ✏ Manage Content
            </button>
          )}
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
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, minHeight: 'calc(100vh - 57px)' }}>
          <div style={{ borderRight: `1px solid ${clr.border}`, background: clr.white, overflowY: 'auto' }}>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CourseImageUploader 
                course={selectedCourse} 
                onImageUploaded={handleCourseUpdate} 
                toast={toast} 
              />

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="🔍 Search all subtopics..."
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${clr.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    outline: 'none',
                    background: clr.white,
                    color: clr.text,
                  }}
                />
                {showResults && searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: clr.white,
                    border: `1px solid ${clr.border}`,
                    borderRadius: 8,
                    maxHeight: 300,
                    overflowY: 'auto',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    {searchResults.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => navigateToResult(res)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: `1px solid ${clr.border}`,
                          '&:hover': { background: clr.accentLight },
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{res.title}</div>
                        <div style={{ fontSize: 12, color: clr.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {res.snippet || res.preview || ''}
                        </div>
                        <div style={{ fontSize: 11, color: clr.accent }}>in {res.topicTitle}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                <div style={{ padding: 24, textAlign: 'center', color: clr.muted }}>Loading...</div>
              ) : (
                <TopicManager
                  courseId={selectedCourse.id}
                  topics={topics}
                  setTopics={setTopics}
                  activeTopicId={activeTopicId}
                  setActiveTopicId={setActiveTopicId}
                  activeSubId={activeSubId}
                  setActiveSubId={setActiveSubId}
                  toast={toast}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  expandedTopics={expandedTopics}
                  toggleTopic={toggleTopic}
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
            {subtopicEditor || (
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