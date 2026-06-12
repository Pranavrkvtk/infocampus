import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

// ─── tiny helpers ────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const EMPTY_SUB = () => ({
  id: uid(),
  title: '',
  notes: '',
  videoUrl: '',
  interviewQuestions: [{ id: uid(), q: '', a: '' }],
  examQuestions: [{ id: uid(), text: '', options: ['', '', '', ''], answer: 0 }],
  labSteps: [{ id: uid(), text: '' }],
});

const EMPTY_TOPIC = () => ({
  id: uid(),
  title: '',
  subtopics: [EMPTY_SUB()],
});

const EMPTY_COURSE = () => ({
  title: '',
  code: '',
  level: 'Beginner',
  topics: [EMPTY_TOPIC()],
});

// ─── palette ─────────────────────────────────────────────────────────────────
const c = {
  accent: '#5E5BFF',
  accentBg: '#f0f0ff',
  accentText: '#3a38cc',
  success: '#16a34a',
  successBg: '#f0fdf4',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  warn: '#d97706',
  warnBg: '#fffbeb',
  border: '#e5e7eb',
  borderFocus: '#5E5BFF',
  text: '#111827',
  muted: '#6b7280',
  surface: '#f9fafb',
  white: '#ffffff',
};

// ─── base styles ─────────────────────────────────────────────────────────────
const S = {
  page: {
    fontFamily: "'Inter', system-ui, sans-serif",
    color: c.text,
    background: c.white,
    minHeight: '100vh',
    padding: '0',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
    borderBottom: `1px solid ${c.border}`,
    background: c.white,
    position: 'sticky',
    top: 0,
    zIndex: 50,
    flexWrap: 'wrap',
    gap: 10,
  },
  topbarTitle: { fontSize: 17, fontWeight: 700, color: c.text, display: 'flex', alignItems: 'center', gap: 8 },
  layout: { display: 'flex', minHeight: 'calc(100vh - 57px)' },
  left: {
    width: 380,
    borderRight: `1px solid ${c.border}`,
    background: c.surface,
    overflowY: 'auto',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  right: { flex: 1, overflowY: 'auto', background: c.white },
  panelHead: {
    padding: '14px 18px 10px',
    borderBottom: `1px solid ${c.border}`,
    background: c.white,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  panelHeadTitle: { fontSize: 13, fontWeight: 600, color: c.text },
  panelHeadSub: { fontSize: 11, color: c.muted, marginTop: 2 },
  input: {
    width: '100%',
    padding: '8px 11px',
    fontSize: 13,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    outline: 'none',
    background: c.white,
    color: c.text,
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 13,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    outline: 'none',
    resize: 'vertical',
    background: c.white,
    color: c.text,
    fontFamily: 'inherit',
    lineHeight: 1.6,
    boxSizing: 'border-box',
  },
  label: { fontSize: 12, fontWeight: 600, color: c.muted, display: 'block', marginBottom: 5, letterSpacing: '0.03em' },
  btnPrimary: {
    padding: '9px 20px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none',
    background: c.accent, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  btnSecondary: {
    padding: '7px 14px', fontSize: 12, fontWeight: 500, borderRadius: 7, border: `1px solid ${c.border}`,
    background: c.white, color: c.muted, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
  },
  btnDanger: {
    padding: '5px 10px', fontSize: 12, fontWeight: 500, borderRadius: 7, border: 'none',
    background: c.dangerBg, color: c.danger, cursor: 'pointer',
  },
  btnAdd: {
    padding: '6px 12px', fontSize: 12, fontWeight: 500, borderRadius: 7, border: `1px dashed ${c.accent}`,
    background: c.accentBg, color: c.accentText, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
  },
  btnSuccess: {
    padding: '9px 20px', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none',
    background: c.success, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  dropZone: (dragging, hasFile) => ({
    border: `2px dashed ${dragging ? c.accent : hasFile ? c.success : c.border}`,
    borderRadius: 12,
    padding: '16px 12px',
    textAlign: 'center',
    background: dragging ? c.accentBg : hasFile ? c.successBg : c.surface,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: 12,
  }),
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    padding: '8px 12px',
    background: c.surface,
    borderRadius: 8,
    border: `1px solid ${c.border}`,
  },
  progressBar: {
    marginTop: 10,
    height: 4,
    borderRadius: 999,
    background: c.border,
    overflow: 'hidden',
  },
  progressFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: `linear-gradient(90deg, ${c.accent}, #7c6fff)`,
    borderRadius: 999,
    transition: 'width 0.3s ease',
  }),
};

const Label = ({ children }) => <label style={S.label}>{children}</label>;

const Input = ({ value, onChange, placeholder, style }) => (
  <input
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{ ...S.input, ...style }}
    onFocus={e => (e.target.style.borderColor = c.borderFocus)}
    onBlur={e => (e.target.style.borderColor = c.border)}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={S.textarea}
    onFocus={e => (e.target.style.borderColor = c.borderFocus)}
    onBlur={e => (e.target.style.borderColor = c.border)}
  />
);

// ─── Tab bar ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'notes', icon: '📝', label: 'Notes' },
  { id: 'video', icon: '🎬', label: 'Video' },
  { id: 'interview', icon: '🎤', label: 'Interview Qs' },
  { id: 'exam', icon: '📋', label: 'Exam Qs' },
  { id: 'lab', icon: '🧪', label: 'Lab' },
];

function TabBar({ active, setActive }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${c.border}`, padding: '0 24px', background: c.white }}>
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => setActive(t.id)}
          style={{
            padding: '11px 16px',
            fontSize: 13,
            fontWeight: active === t.id ? 600 : 400,
            color: active === t.id ? c.accent : c.muted,
            background: 'none',
            border: 'none',
            borderBottom: active === t.id ? `2px solid ${c.accent}` : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: -1,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Notes panel ─────────────────────────────────────────────────────────────
function NotesPanel({ sub, update }) {
  return (
    <div style={{ padding: '22px 28px' }}>
      <Label>Lesson notes (auto-generated from PDF content)</Label>
      <Textarea
        value={sub.notes}
        onChange={v => update('notes', v)}
        placeholder="Notes will be auto-generated from the PDF content..."
        rows={12}
      />
    </div>
  );
}

// ─── Video panel ─────────────────────────────────────────────────────────────
function VideoPanel({ sub, update }) {
  return (
    <div style={{ padding: '22px 28px' }}>
      <Label>Video URL (Optional - Add manually)</Label>
      <Input value={sub.videoUrl} onChange={v => update('videoUrl', v)} placeholder="https://youtube.com/watch?v=..." />
      {sub.videoUrl && sub.videoUrl.includes('youtube') && (
        <div style={{ marginTop: 16, borderRadius: 10, overflow: 'hidden', border: `1px solid ${c.border}` }}>
          <iframe
            width="100%"
            height="300"
            src={sub.videoUrl.replace('watch?v=', 'embed/')}
            title="Lesson video"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

// ─── Interview Questions panel ────────────────────────────────────────────────
function InterviewPanel({ sub, update }) {
  const qs = sub.interviewQuestions || [{ id: uid(), q: '', a: '' }];
  const setQs = qs => update('interviewQuestions', qs);

  const addQ = () => setQs([...qs, { id: uid(), q: '', a: '' }]);
  const removeQ = id => setQs(qs.filter(q => q.id !== id));
  const updateQ = (id, field, val) => setQs(qs.map(q => q.id === id ? { ...q, [field]: val } : q));

  return (
    <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Label>Interview Questions & Answers (auto-generated from PDF)</Label>
      {qs.map((q, i) => (
        <div key={q.id} style={{ background: c.surface, borderRadius: 10, border: `1px solid ${c.border}`, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.muted }}>Question {i + 1}</span>
            {qs.length > 1 && <button style={S.btnDanger} onClick={() => removeQ(q.id)}>✕ Remove</button>}
          </div>
          <Label>Question</Label>
          <Input value={q.q} onChange={v => updateQ(q.id, 'q', v)} placeholder="e.g. What is the purpose of the OSI model?" />
          <div style={{ marginTop: 10 }}>
            <Label>Model answer</Label>
            <Textarea value={q.a} onChange={v => updateQ(q.id, 'a', v)} placeholder="Write the expected answer…" rows={3} />
          </div>
        </div>
      ))}
      <button style={S.btnAdd} onClick={addQ}>＋ Add question</button>
    </div>
  );
}

// ─── Exam Questions panel ─────────────────────────────────────────────────────
function ExamPanel({ sub, update }) {
  const qs = sub.examQuestions || [{ id: uid(), text: '', options: ['', '', '', ''], answer: 0 }];
  const setQs = qs => update('examQuestions', qs);

  const addQ = () => setQs([...qs, { id: uid(), text: '', options: ['', '', '', ''], answer: 0 }]);
  const removeQ = id => setQs(qs.filter(q => q.id !== id));
  const updateQ = (id, field, val) => setQs(qs.map(q => q.id === id ? { ...q, [field]: val } : q));
  const updateOption = (qid, idx, val) =>
    setQs(qs.map(q => q.id === qid ? { ...q, options: q.options.map((o, i) => i === idx ? val : o) } : q));

  return (
    <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Label>Multiple Choice Exam Questions (auto-generated from PDF)</Label>
      {qs.map((q, i) => (
        <div key={q.id} style={{ background: c.surface, borderRadius: 10, border: `1px solid ${c.border}`, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: c.muted }}>MCQ {i + 1}</span>
            {qs.length > 1 && <button style={S.btnDanger} onClick={() => removeQ(q.id)}>✕ Remove</button>}
          </div>
          <Label>Question text</Label>
          <Input value={q.text} onChange={v => updateQ(q.id, 'text', v)} placeholder="Which layer of the OSI model is responsible for routing?" />
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Label>Options (click radio to mark correct answer)</Label>
            {q.options.map((opt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={q.answer === idx}
                  onChange={() => updateQ(q.id, 'answer', idx)}
                  style={{ accentColor: c.success, width: 15, height: 15, cursor: 'pointer', flexShrink: 0 }}
                />
                <Input
                  value={opt}
                  onChange={v => updateOption(q.id, idx, v)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  style={{ border: q.answer === idx ? `1px solid ${c.success}` : `1px solid ${c.border}` }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button style={S.btnAdd} onClick={addQ}>＋ Add MCQ</button>
    </div>
  );
}

// ─── Lab panel ───────────────────────────────────────────────────────────────
function LabPanel({ sub, update }) {
  const steps = sub.labSteps || [{ id: uid(), text: '' }];
  const setSteps = s => update('labSteps', s);

  const addStep = () => setSteps([...steps, { id: uid(), text: '' }]);
  const removeStep = id => setSteps(steps.filter(s => s.id !== id));
  const updateStep = (id, val) => setSteps(steps.map(s => s.id === id ? { ...s, text: val } : s));

  return (
    <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Label>Lab Steps (auto-generated from PDF)</Label>
      {steps.map((step, i) => (
        <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: c.accentBg,
            color: c.accentText, fontSize: 12, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
          }}>{i + 1}</div>
          <Textarea value={step.text} onChange={v => updateStep(step.id, v)} placeholder={`Step ${i + 1} instruction…`} rows={2} />
          {steps.length > 1 && (
            <button style={{ ...S.btnDanger, marginTop: 4, flexShrink: 0 }} onClick={() => removeStep(step.id)}>✕</button>
          )}
        </div>
      ))}
      <button style={S.btnAdd} onClick={addStep}>＋ Add step</button>
    </div>
  );
}

// ─── Subtopic editor (right panel) ───────────────────────────────────────────
function SubtopicEditor({ topicTitle, sub, onUpdateSub }) {
  const [activeTab, setActiveTab] = useState('notes');

  const update = (field, val) => onUpdateSub({ ...sub, [field]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 28px 14px', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ fontSize: 12, color: c.muted, marginBottom: 4 }}>{topicTitle}</div>
        <Input
          value={sub.title}
          onChange={v => update('title', v)}
          placeholder="Subtopic title, e.g. OSI model"
          style={{ fontSize: 17, fontWeight: 600, border: 'none', padding: '4px 0', borderBottom: `2px solid ${c.border}` }}
        />
      </div>
      <TabBar active={activeTab} setActive={setActiveTab} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'notes' && <NotesPanel sub={sub} update={update} />}
        {activeTab === 'video' && <VideoPanel sub={sub} update={update} />}
        {activeTab === 'interview' && <InterviewPanel sub={sub} update={update} />}
        {activeTab === 'exam' && <ExamPanel sub={sub} update={update} />}
        {activeTab === 'lab' && <LabPanel sub={sub} update={update} />}
      </div>
    </div>
  );
}

// ─── Left panel: course structure tree ───────────────────────────────────────
function StructureTree({ course, setCourse, activeSubId, setActiveSubId, onPdfUpload }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const topics = course?.topics || [];
  const totalTopics = topics.length;
  const totalSubtopics = topics.reduce((a, t) => a + (t.subtopics?.length || 0), 0);

  const updateCourseField = (field, val) => setCourse(c => ({ ...c, [field]: val }));

  const addTopic = () => setCourse(c => ({ ...c, topics: [...(c.topics || []), EMPTY_TOPIC()] }));
  const removeTopic = tid => setCourse(c => ({ ...c, topics: (c.topics || []).filter(t => t.id !== tid) }));
  const updateTopicTitle = (tid, val) => setCourse(c => ({ ...c, topics: (c.topics || []).map(t => t.id === tid ? { ...t, title: val } : t) }));
  const addSubtopic = tid => setCourse(c => ({ ...c, topics: (c.topics || []).map(t => t.id === tid ? { ...t, subtopics: [...(t.subtopics || []), EMPTY_SUB()] } : t) }));
  const removeSubtopic = (tid, sid) => setCourse(c => ({ ...c, topics: (c.topics || []).map(t => t.id === tid ? { ...t, subtopics: (t.subtopics || []).filter(s => s.id !== sid) } : t) }));

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      Swal.fire('Invalid File', 'Please select a valid PDF file.', 'warning');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Swal.fire('No File', 'Please select a PDF file first', 'warning');
      return;
    }

    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => setProgress(prev => Math.min(prev + 10, 90)), 500);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('courseId', '');

      const response = await fetch(`${API_BASE}/admin/pdfs/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      clearInterval(interval);
      setProgress(100);

      if (response.ok) {
        Swal.fire({
          title: 'PDF Uploaded!',
          html: `📄 ${selectedFile.name}<br/>🖼️ ${data.imageCount || 0} images extracted`,
          icon: 'success',
          timer: 2000,
        });
        setSelectedFile(null);

        Swal.fire({
          title: 'Generating Course Structure...',
          html: 'Extracting topics and subtopics from PDF...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const structureResponse = await fetch(`${API_BASE}/admin/pdfs/${data.pdfId}/generate-structure`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const structureData = await structureResponse.json();

        if (structureResponse.ok) {
          Swal.fire({
            title: 'Content Extracted!',
            html: `✅ ${structureData.topicsCount || 0} topics created<br/>📝 ${structureData.subtopicsCount || 0} subtopics<br/>📚 Notes, Interview Qs, Exam Qs & Labs auto-generated!`,
            icon: 'success',
            timer: 3000,
          });

          onPdfUpload?.({
            courseId: structureData.courseId,
            courseTitle: structureData.courseTitle,
            topicsCount: structureData.topicsCount,
            subtopicsCount: structureData.subtopicsCount
          });
        } else {
          throw new Error(structureData.error || 'Structure generation failed');
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      clearInterval(interval);
      Swal.fire('Upload Failed', error.message, 'error');
      setProgress(0);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={S.panelHead}>
        <div style={S.panelHeadTitle}>Course details</div>
      </div>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}` }}>
        <Label>Course title</Label>
        <Input value={course?.title || ''} onChange={v => updateCourseField('title', v)} placeholder="e.g. CCNA 200-301" />
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Label>Course code</Label>
            <Input value={course?.code || ''} onChange={v => updateCourseField('code', v)} placeholder="200-301" />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Level</Label>
            <select value={course?.level || 'Beginner'} onChange={e => updateCourseField('level', e.target.value)} style={{ ...S.input, cursor: 'pointer' }}>
              {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* PDF Upload Section */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${c.border}`, background: c.accentBg }}>
        <Label>📄 Upload PDF (Auto-generates all content)</Label>
        <div
          style={S.dropZone(dragging, !!selectedFile)}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileSelect(e.dataTransfer.files[0]); }}
        >
          <div style={{ fontSize: 28 }}>{selectedFile ? '✅' : '📄'}</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedFile ? selectedFile.name : 'Drag & drop PDF here'}</div>
          <div style={{ fontSize: 11, color: c.muted }}>or click to browse</div>
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e.target.files[0])} />
        </div>
        {selectedFile && (
          <div style={S.fileInfo}>
            <span>📄</span>
            <div style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedFile.name}</div>
            <button style={S.btnDanger} onClick={() => setSelectedFile(null)}>✕</button>
          </div>
        )}
        {uploading && (
          <>
            <div style={S.progressBar}><div style={S.progressFill(progress)} /></div>
            <div style={{ fontSize: 11, textAlign: 'right', marginTop: 4, color: c.muted }}>{progress}%</div>
          </>
        )}
        <button
          style={{ ...S.btnPrimary, width: '100%', marginTop: 12, justifyContent: 'center' }}
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? '⏳ Uploading...' : '📤 Upload PDF & Auto-Generate Everything'}
        </button>
      </div>

      {/* Topics */}
      <div style={S.panelHead}>
        <div style={S.panelHeadTitle}>Topics & subtopics</div>
        <div style={S.panelHeadSub}>
          {totalTopics} topics · {totalSubtopics} subtopics
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0 16px' }}>
        {topics.map((topic, ti) => (
          <TopicBlock
            key={topic.id}
            topic={topic}
            index={ti}
            activeSubId={activeSubId}
            setActiveSubId={setActiveSubId}
            onTitleChange={v => updateTopicTitle(topic.id, v)}
            onAddSub={() => addSubtopic(topic.id)}
            onRemoveTopic={() => removeTopic(topic.id)}
            onRemoveSub={sid => removeSubtopic(topic.id, sid)}
            canRemoveTopic={topics.length > 1}
          />
        ))}
        <div style={{ padding: '6px 16px' }}>
          <button style={S.btnAdd} onClick={addTopic}>＋ Add topic</button>
        </div>
      </div>
    </div>
  );
}

function TopicBlock({ topic, index, activeSubId, setActiveSubId, onTitleChange, onAddSub, onRemoveTopic, onRemoveSub, canRemoveTopic }) {
  const [open, setOpen] = useState(true);
  const subtopics = topic?.subtopics || [];

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
        background: c.surface, borderBottom: `1px solid ${c.border}`,
      }}>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.muted, fontSize: 14, padding: 2 }}>
          {open ? '▾' : '▸'}
        </button>
        <div style={{
          width: 22, height: 22, borderRadius: 6, background: c.accentBg,
          color: c.accentText, fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{index + 1}</div>
        <input value={topic?.title || ''} onChange={e => onTitleChange(e.target.value)} placeholder={`Topic ${index + 1} title`}
          style={{ flex: 1, fontSize: 13, fontWeight: 600, border: 'none', background: 'transparent', outline: 'none', color: c.text, minWidth: 0 }} />
        {canRemoveTopic && <button onClick={onRemoveTopic} style={{ ...S.btnDanger, padding: '3px 7px', fontSize: 11 }}>✕</button>}
      </div>
      {open && (
        <div style={{ paddingLeft: 0 }}>
          {subtopics.map((sub, si) => (
            <div key={sub.id} onClick={() => setActiveSubId(sub.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 8px 38px', cursor: 'pointer',
              background: activeSubId === sub.id ? c.accentBg : 'transparent',
              borderLeft: activeSubId === sub.id ? `3px solid ${c.accent}` : '3px solid transparent',
              borderBottom: `1px solid ${c.border}`,
            }}>
              <span style={{ fontSize: 11, color: c.muted, flexShrink: 0 }}>{index + 1}.{si + 1}</span>
              <span style={{
                flex: 1, fontSize: 13, color: activeSubId === sub.id ? c.accentText : (sub.title ? c.text : c.muted),
                fontWeight: activeSubId === sub.id ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{sub.title || 'Untitled subtopic'}</span>
              {subtopics.length > 1 && (
                <button onClick={e => { e.stopPropagation(); onRemoveSub(sub.id); }} style={{ ...S.btnDanger, padding: '2px 6px', fontSize: 11, flexShrink: 0 }}>✕</button>
              )}
            </div>
          ))}
          <div style={{ padding: '7px 14px 7px 38px', borderBottom: `1px solid ${c.border}` }}>
            <button style={S.btnAdd} onClick={onAddSub}>＋ Add subtopic</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function PdfUploadTab() {
  const [course, setCourse] = useState(EMPTY_COURSE());
  const [activeSubId, setActiveSubId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const allSubs = (course?.topics || []).flatMap(t => t.subtopics || []);
  const activeSub = allSubs.find(s => s?.id === activeSubId) || allSubs[0];
  const activeTopic = (course?.topics || []).find(t => (t.subtopics || []).some(s => s?.id === activeSub?.id));

  useEffect(() => {
    if (!activeSubId && allSubs.length > 0) {
      setActiveSubId(allSubs[0].id);
    }
  }, [activeSubId, allSubs]);

  const updateActiveSub = updated => setCourse(c => ({
    ...c,
    topics: (c.topics || []).map(t => ({
      ...t,
      subtopics: (t.subtopics || []).map(s => s.id === updated.id ? updated : s)
    }))
  }));

  const handlePdfUpload = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/courses/${data.courseId}/topics`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const topicsData = await response.json();

      const formattedTopics = topicsData.map(topic => ({
        id: topic.id,
        title: topic.title,
        subtopics: (topic.subtopics || topic.subTopics || []).map(sub => ({
          id: sub.id,
          title: sub.title,
          notes: sub.notes || sub.content || '',
          videoUrl: sub.videoUrl || '',
          interviewQuestions: sub.interviewQuestions || [{ id: uid(), q: '', a: '' }],
          examQuestions: sub.examQuestions || [{ id: uid(), text: '', options: ['', '', '', ''], answer: 0 }],
          labSteps: sub.labSteps || [{ id: uid(), text: '' }],
        }))
      }));

      setCourse({
        title: data.courseTitle || course.title,
        code: course.code || '200-301',
        level: course.level || 'Beginner',
        topics: formattedTopics.length > 0 ? formattedTopics : course.topics
      });

      if (formattedTopics.length > 0 && formattedTopics[0].subtopics.length > 0) {
        setActiveSubId(formattedTopics[0].subtopics[0].id);
      }

      Swal.fire({
        title: 'Course Loaded!',
        html: `✅ ${formattedTopics.length} topics loaded<br/>📝 ${formattedTopics.reduce((a, t) => a + t.subtopics.length, 0)} subtopics<br/>📚 Notes, Interview Qs, Exam Qs & Labs auto-generated from PDF!`,
        icon: 'success',
      });
    } catch (error) {
      Swal.fire('Error', 'Failed to load course structure from backend', 'error');
    }
  };

  const handleSave = async () => {
    if (!course?.title?.trim()) { setError('Please enter a course title.'); return; }
    setError('');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const courseRes = await fetch(`${API_BASE}/admin/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: course.title, description: `${course.code || ''} · ${course.level || 'Beginner'}`, level: course.level }),
      });
      if (!courseRes.ok) throw new Error('Failed to create course');
      const createdCourse = await courseRes.json();

      for (let ti = 0; ti < (course.topics || []).length; ti++) {
        const topic = course.topics[ti];
        const topicRes = await fetch(`${API_BASE}/admin/courses/${createdCourse.id}/topics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: topic.title, displayOrder: ti + 1 }),
        });
        if (!topicRes.ok) throw new Error(`Failed to create topic: ${topic.title}`);
        const createdTopic = await topicRes.json();

        for (let si = 0; si < (topic.subtopics || []).length; si++) {
          const sub = topic.subtopics[si];
          await fetch(`${API_BASE}/admin/topics/${createdTopic.id}/subtopics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              title: sub.title,
              displayOrder: si + 1,
              notes: sub.notes,
              videoUrl: sub.videoUrl,
              interviewQuestions: sub.interviewQuestions,
              examQuestions: sub.examQuestions,
              labSteps: sub.labSteps,
            }),
          });
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      Swal.fire('Success!', 'Course saved successfully!', 'success');
    } catch (e) {
      setError(e.message || 'Save failed.');
      Swal.fire('Error', e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset everything and start a new course?')) {
      const fresh = EMPTY_COURSE();
      setCourse(fresh);
      setActiveSubId(fresh.topics[0]?.subtopics[0]?.id || null);
      setSaved(false);
      setError('');
    }
  };

  const totalTopics = (course?.topics || []).length;
  const totalSubs = (course?.topics || []).reduce((a, t) => a + (t.subtopics || []).length, 0);
  const filledSubs = allSubs.filter(s => s?.title?.trim()).length;

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={S.topbarTitle}>
          <span style={{ fontSize: 20 }}>📚</span>
          Course Builder
          <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: c.accentBg, color: c.accentText, marginLeft: 8 }}>
            {filledSubs}/{totalSubs} subtopics filled
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {error && <span style={{ fontSize: 12, color: c.danger, background: c.dangerBg, padding: '6px 12px', borderRadius: 7 }}>⚠ {error}</span>}
          {saved && <span style={{ fontSize: 12, color: c.success, background: c.successBg, padding: '6px 12px', borderRadius: 7 }}>✓ Saved to server</span>}
          <button style={S.btnSecondary} onClick={handleReset}>↺ New course</button>
          <button style={saving ? { ...S.btnSuccess, opacity: 0.7 } : S.btnSuccess} onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Saving…' : '💾 Save course'}
          </button>
        </div>
      </div>

      <div style={S.layout}>
        <div style={S.left}>
          <StructureTree
            course={course}
            setCourse={setCourse}
            activeSubId={activeSub?.id}
            setActiveSubId={setActiveSubId}
            onPdfUpload={handlePdfUpload}
          />
        </div>
        <div style={S.right}>
          {activeSub ? (
            <SubtopicEditor
              key={activeSub.id}
              topicTitle={activeTopic?.title || 'Topic'}
              sub={activeSub}
              onUpdateSub={updateActiveSub}
            />
          ) : (
            <div style={{ padding: 48, textAlign: 'center', color: c.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
              <div>Select a subtopic from the left panel to start editing</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PdfUploadTab;