// src/components/VideoTab.jsx
import React, { useState } from 'react';
import { updateSubtopicVideo } from '../api/courseApi';

const clr = {
  border: '#e4e7ec',
  muted: '#64748b',
  success: '#16a34a',
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

function VideoTab({ sub, subtopicId, toast, onUpdate }) {
  const [videoUrl, setVideoUrl] = useState(sub.videoUrl || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateSubtopicVideo(subtopicId, videoUrl);
      onUpdate({ videoUrl });
      toast.show('Video URL saved');
    } catch (e) {
      toast.show(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const embedUrl = videoUrl.includes('watch?v=')
    ? videoUrl.replace('watch?v=', 'embed/')
    : videoUrl.includes('youtu.be/')
    ? videoUrl.replace('youtu.be/', 'youtube.com/embed/')
    : null;

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Lbl>Video URL</Lbl>
          <Btn onClick={save} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save'}
          </Btn>
        </div>
        <Inp value={videoUrl} onChange={setVideoUrl} placeholder="https://youtube.com/watch?v=…" />
      </div>
      {embedUrl && (
        <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${clr.border}` }}>
          <iframe width="100%" height="300" src={embedUrl} title="video" frameBorder="0" allowFullScreen />
        </div>
      )}
    </div>
  );
}

export default VideoTab;
