// src/components/ExamTab.jsx
import React, { useState } from 'react';
import { createExamQuestion, deleteExamQuestion } from '../api/courseApi';

const clr = {
  border: '#e4e7ec',
  muted: '#64748b',
  faint: '#f1f5f9',
  danger: '#dc2626',
  success: '#16a34a',
  successLight: '#f0fdf4',
  accentLight: '#eef2ff',
  accentText: '#3730a3',
};

const Lbl = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: clr.muted, display: 'block', marginBottom: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
    {children}
  </label>
);

const Inp = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
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

const Txta = ({ value, onChange, placeholder, rows = 2 }) => (
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

function ExamTab({ sub, subtopicId, toast, onUpdate }) {
  const [questions, setQuestions] = useState(sub.examQuestions || []);
  const [addForm, setAddForm] = useState({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const addQ = async () => {
    if (!addForm.question.trim()) return;
    setAdding(true);
    try {
      const data = await createExamQuestion(subtopicId, addForm);
      setQuestions([...questions, { id: data.questionId, ...addForm }]);
      setAddForm({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
      setShowAdd(false);
      toast.show('MCQ added');
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  const delQ = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteExamQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
      toast.show('MCQ deleted');
    } catch (e) {
      toast.show(e.message, 'error');
    }
  };

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="dashed" onClick={() => setShowAdd(s => !s)}>
          ＋ Add MCQ
        </Btn>
      </div>
      {showAdd && (
        <div style={{ background: clr.faint, borderRadius: 10, padding: 16 }}>
          <div>
            <Lbl>Question</Lbl>
            <Txta value={addForm.question} onChange={v => setAddForm(f => ({ ...f, question: v }))} placeholder="Enter MCQ question…" rows={2} />
          </div>
          {['A', 'B', 'C', 'D'].map(opt => (
            <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input
                type="radio"
                name="correct"
                checked={addForm.correctAnswer === opt}
                onChange={() => setAddForm(f => ({ ...f, correctAnswer: opt }))}
                style={{ accentColor: clr.success }}
              />
              <Inp value={addForm[`option${opt}`]} onChange={v => setAddForm(f => ({ ...f, [`option${opt}`]: v }))} placeholder={`Option ${opt}`} />
            </div>
          ))}
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
        <div style={{ textAlign: 'center', color: clr.muted, fontSize: 13, padding: 24 }}>No exam questions yet.</div>
      )}
      {questions.map((q, i) => (
        <div key={q.id} style={{ background: clr.faint, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: clr.muted }}>MCQ {i + 1}</span>
            <Btn variant="danger" onClick={() => delQ(q.id)}>
              🗑
            </Btn>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{q.question}</div>
          {['A', 'B', 'C', 'D'].map(opt => (
            <div
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 4,
                padding: '4px 8px',
                background: q.correctAnswer === opt ? clr.successLight : 'transparent',
                borderRadius: 6,
              }}
            >
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

export default ExamTab;
