// src/components/LabTab.jsx
import React, { useState } from 'react';
import { createLabExercise, deleteLabExercise } from '../api/courseApi';

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

function LabTab({ sub, subtopicId, toast, onUpdate }) {
  const [labs, setLabs] = useState(sub.labExercises || []);
  const [addForm, setAddForm] = useState({ title: '', instructions: '' });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const addLab = async () => {
    if (!addForm.title.trim()) return;
    setAdding(true);
    try {
      const data = await createLabExercise(subtopicId, addForm);
      setLabs([...labs, { id: data.labId, ...addForm }]);
      setAddForm({ title: '', instructions: '' });
      setShowAdd(false);
      toast.show('Lab step added');
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  const delLab = async (id) => {
    if (!window.confirm('Delete this lab step?')) return;
    try {
      await deleteLabExercise(id);
      setLabs(labs.filter(l => l.id !== id));
      toast.show('Lab step deleted');
    } catch (e) {
      toast.show(e.message, 'error');
    }
  };

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="dashed" onClick={() => setShowAdd(s => !s)}>
          ＋ Add lab step
        </Btn>
      </div>
      {showAdd && (
        <div style={{ background: clr.faint, borderRadius: 10, padding: 16 }}>
          <div>
            <Lbl>Step title</Lbl>
            <Inp value={addForm.title} onChange={v => setAddForm(f => ({ ...f, title: v }))} placeholder="e.g. Configure IP address" />
          </div>
          <div style={{ marginTop: 10 }}>
            <Lbl>Instructions</Lbl>
            <Txta value={addForm.instructions} onChange={v => setAddForm(f => ({ ...f, instructions: v }))} placeholder="Step-by-step instructions…" rows={4} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <Btn variant="ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </Btn>
            <Btn onClick={addLab} disabled={adding || !addForm.title.trim()}>
              {adding ? '…' : 'Add'}
            </Btn>
          </div>
        </div>
      )}
      {labs.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', color: clr.muted, fontSize: 13, padding: 24 }}>No lab steps yet.</div>
      )}
      {labs.map((lab, i) => (
        <div key={lab.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: clr.accentLight,
              color: clr.accentText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div style={{ flex: 1, background: clr.faint, borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{lab.title}</span>
              <Btn variant="danger" onClick={() => delLab(lab.id)}>
                🗑
              </Btn>
            </div>
            <div style={{ fontSize: 13, color: clr.muted }}>{lab.instructions}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LabTab;
