// src/components/NotesTab.jsx
import React, { useState } from 'react';
import { updateSubtopicNotes } from '../api/courseApi';

// ─── Shared styles ────────────────────────────────────────────────────────────
const clr = {
  success: '#16a34a',
  muted: '#64748b',
};

const Lbl = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: clr.muted, display: 'block', marginBottom: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
    {children}
  </label>
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
      border: '1px solid #e4e7ec',
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
    onBlur={e => e.target.style.borderColor = '#e4e7ec'}
  />
);

const Btn = ({ children, onClick, disabled, variant = 'success', size = 'sm' }) => {
  const sizes = { sm: { padding: '5px 12px', fontSize: 12 } };
  const variants = { success: { background: clr.success, color: '#fff' } };
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

function NotesTab({ sub, subtopicId, toast, onUpdate }) {
  const [notes, setNotes] = useState(sub.notes || '');
  const [saving, setSaving] = useState(false);

  const saveNotes = async () => {
    setSaving(true);
    try {
      await updateSubtopicNotes(subtopicId, notes);
      onUpdate({ notes });
      toast.show('Notes saved');
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Lbl>Lesson notes</Lbl>
          <Btn onClick={saveNotes} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save notes'}
          </Btn>
        </div>
        <Txta
          value={notes}
          onChange={setNotes}
          placeholder="Write comprehensive lesson notes here. Include key concepts, definitions, examples, and important points to remember…"
          rows={12}
        />
      </div>
    </div>
  );
}

export default NotesTab;
