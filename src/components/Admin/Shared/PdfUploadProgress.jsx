// src/components/Admin/Shared/PdfUploadProgress.jsx
import React from 'react';

const clr = {
  white: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  faint: '#f1f5f9',
  accent: '#4f46e5',
  success: '#16a34a',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
};

export function PdfUploadProgress({ progress, fileName, onCancel }) {
  const getStatusMessage = () => {
    if (progress === 100) return '✅ Upload Complete!';
    if (progress < 30) return '📤 Preparing upload...';
    if (progress < 60) return '📄 Uploading PDF...';
    if (progress < 90) return '🔄 Processing document...';
    if (progress < 100) return '📝 Finalizing...';
    return '✅ Complete!';
  };

  const getEmoji = () => {
    if (progress === 100) return '✅';
    if (progress < 30) return '📤';
    if (progress < 60) return '📄';
    if (progress < 90) return '🔄';
    return '📝';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.6)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: clr.white,
        borderRadius: 16,
        padding: 32,
        width: 420,
        maxWidth: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: clr.text, marginBottom: 8 }}>
            {getEmoji()} {progress === 100 ? 'Upload Complete!' : 'Uploading PDF'}
          </div>
          <div style={{ fontSize: 13, color: clr.muted }}>
            {fileName || 'Processing document...'}
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            fontWeight: 600,
            color: clr.text,
            marginBottom: 4,
          }}>
            <span>Progress</span>
            <span style={{ color: clr.accent }}>{progress}%</span>
          </div>
          <div style={{
            width: '100%',
            height: 10,
            background: clr.faint,
            borderRadius: 5,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${clr.accent}, #818cf8)`,
              borderRadius: 5,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          padding: '10px 14px',
          background: clr.faint,
          borderRadius: 8,
          fontSize: 13,
          color: clr.text,
        }}>
          <span style={{ fontSize: 18 }}>{getEmoji()}</span>
          <span>{getStatusMessage()}</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
          fontSize: 11,
          color: clr.muted,
        }}>
          <span>⏱️ Please wait...</span>
          <span>{progress === 100 ? '🎉 Done!' : `${progress}% complete`}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={onCancel}
            disabled={progress === 100}
            style={{
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              background: progress === 100 ? clr.success : clr.dangerLight,
              color: progress === 100 ? '#fff' : clr.danger,
              cursor: progress === 100 ? 'default' : 'pointer',
              opacity: progress === 100 ? 0.7 : 1,
            }}
          >
            {progress === 100 ? '✓ Completed' : '✕ Cancel Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}