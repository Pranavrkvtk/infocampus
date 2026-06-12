// src/components/ImagesTab.jsx
import React, { useState, useEffect } from 'react';
import { getSubtopicImages, deleteImage } from '../api/courseApi';

const clr = {
  border: '#e4e7ec',
  muted: '#64748b',
  faint: '#f1f5f9',
  danger: '#dc2626',
};

const Lbl = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: clr.muted, display: 'block', marginBottom: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
    {children}
  </label>
);

const Btn = ({ children, onClick, disabled, variant = 'ghost', size = 'sm' }) => {
  const sizes = { sm: { padding: '5px 12px', fontSize: 12 } };
  const variants = {
    ghost: { background: clr.faint, color: clr.muted, border: `1px solid ${clr.border}` },
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

function ImagesTab({ sub, subtopicId, toast }) {
  const [images, setImages] = useState(sub.images || []);
  const [loading, setLoading] = useState(false);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await getSubtopicImages(subtopicId);
      setImages(data.images || []);
    } catch (e) {
      toast.show('Failed to load images', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subtopicId) loadImages();
  }, [subtopicId]);

  const deleteImageHandler = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await deleteImage(imageId);
      setImages(images.filter(img => img.id !== imageId));
      toast.show('Image deleted');
    } catch (e) {
      toast.show('Failed to delete image', 'error');
    }
  };

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Lbl>Subtopic Images ({images.length})</Lbl>
          <Btn onClick={loadImages} disabled={loading}>
            {loading ? 'Loading…' : '🔄 Refresh'}
          </Btn>
        </div>
        {images.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: clr.faint, borderRadius: 10, color: clr.muted }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
            <div style={{ fontSize: 13 }}>No images uploaded for this subtopic yet.</div>
            <div style={{ fontSize: 12, color: clr.muted, marginTop: 4 }}>Upload a PDF with images in the left panel.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {images.map((img, idx) => (
              <div key={img.id || idx} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${clr.border}`, background: clr.faint }}>
                <img
                  src={img.url}
                  alt={`Image ${idx + 1}`}
                  style={{ width: '100%', height: 120, objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => window.open(img.url, '_blank')}
                />
                <button
                  onClick={() => deleteImageHandler(img.id)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: clr.danger,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5,
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                  title="Delete image"
                >
                  ×
                </button>
                <div style={{ padding: '6px 8px', fontSize: 10, color: clr.muted, background: 'rgba(255,255,255,0.7)' }}>
                  {img.pageNumber ? `Page ${img.pageNumber}` : `Image ${idx + 1}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImagesTab;
