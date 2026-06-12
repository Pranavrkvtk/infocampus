// src/components/InterviewTab.jsx
import React, { useState } from 'react';
import { createInterviewQuestion, deleteInterviewQuestion } from '../api/courseApi';

const clr = {
  border: '#e4e7ec',
  muted: '#64748b',
  faint: '#f1f5f9',
  danger: '#dc2626',
  accentLight: '#eef2ff',
  accentText: '#3730a3',
};

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
      background: '#ffffff',
      color: '#0f172a',
      boxSizing: 'border-box',
    }}
    onFocus={e => e.target.style.borderColor = '#4f46e5'}
    onBlur={e => e.target.style.borderColor = clr.border}
  />
);

const Txta = ({ value, onChange, placeholder, rows = 3 }) => (
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
      background: '#ffffff',
      color: '#0f172a',
      fontFamily: 'inherit',
      lineHeight: 1.6,
      boxSizing: 'border-box',
    }}
    onFocus={e => e.target.style.borderColor = '#4f46e5'}
    onBlur={e => e.target.style.borderColor = clr.border}
  />
);

const Btn = ({ children, onClick, disabled, variant = 'primary', size = 'sm' }) => {
  const sizes = { sm: { padding: '5px 12px', fontSize: 12 } };
  const variants = {
    primary: { background: '#4f46e5', color: '#fff' },
    ghost: { background: clr.faint, color: clr.muted, border: `1px solid ${clr.border}` },
    dashed: { background: clr.accentLight, color: clr.accentText, border: `1.5px dashed #4f46e5` },
    danger: { background: clr.faint, color: clr.danger },
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

function InterviewTab({ sub, subtopicId, toast, onUpdate }) {
  const [questions, setQuestions] = useState(sub.interviewQuestions || []);
  const [addForm, setAddForm] = useState({ question: '', answer: '' });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const addQ = async () => {
    if (!addForm.question.trim()) return;
    setAdding(true);
    try {
      const data = await createInterviewQuestion(subtopicId, addForm);
      setQuestions([...questions, { id: data.questionId, ...addForm }]);
      setAddForm({ question: '', answer: '' });
      setShowAdd(false);
      toast.show('Question added');
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  const delQ = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteInterviewQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
      toast.show('Question deleted');
    } catch (e) {
      toast.show(e.message, 'error');
    }
  };

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="dashed" onClick={() => setShowAdd(s => !s)}>
          ＋ Add question
        </Btn>
      </div>
      {showAdd && (
        <div style={{ background: clr.faint, borderRadius: 10, padding: 16 }}>
          <div>
            <Lbl>Question</Lbl>
            <Inp value={addForm.question} onChange={v => setAddForm(f => ({ ...f, question: v }))} placeholder="e.g. Explain the OSI model layers" />
          </div>
          <div style={{ marginTop: 10 }}>
            <Lbl>Answer</Lbl>
            <Txta value={addForm.answer} onChange={v => setAddForm(f => ({ ...f, answer: v }))} placeholder="Expected answer…" rows={3} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </Btn>
            <Btn onClick={addQ} disabled={adding || !addForm.question.trim()}>
              {adding ? '…' : 'Add'}
            </Btn>
          </div>
        </div>
      )}
      {questions.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', color: clr.muted, fontSize: 13, padding: 24 }}>No interview questions yet.</div>
      )}
      {questions.map((q, i) => (
        <div key={q.id} style={{ background: clr.faint, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: clr.muted }}>Q{i + 1}</span>
            <Btn variant="danger" onClick={() => delQ(q.id)}>
              🗑
            </Btn>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{q.question}</div>
          <div style={{ fontSize: 13, color: clr.muted }}>{q.answer}</div>
        </div>
      ))}
    </div>
  );
}

export default InterviewTab;
