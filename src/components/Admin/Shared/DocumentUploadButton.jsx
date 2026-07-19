// src/components/Admin/Shared/DocumentUploadButton.jsx
import React, { useRef } from 'react';

const clr = {
  accentLight: '#eef2ff',
  accentText: '#3730a3',
  accent: '#4f46e5',
};

export function DocumentUploadButton({ 
  uploading, 
  onFileSelected, 
  toast, 
  label = 'Upload PDF Only',
  buttonId 
}) {
  const inputId = buttonId || `doc-upload-${Date.now()}`;
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate PDF by MIME type
      if (file.type !== 'application/pdf') {
        if (toast) toast.show('❌ Only PDF files are allowed. Please select a PDF file.', 'error');
        e.target.value = '';
        return;
      }
      
      // Additional extension check
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'pdf') {
        if (toast) toast.show('❌ Only PDF files are allowed. Please select a PDF file.', 'error');
        e.target.value = '';
        return;
      }
      
      onFileSelected(file);
    }
    e.target.value = '';
  };
  
  return (
    <div style={{ marginBottom: 16 }}>
      <input
        type="file"
        accept=".pdf,application/pdf"
        id={inputId}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <label htmlFor={inputId} style={{ display: 'inline-block' }}>
        <span style={{
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 6,
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.5 : 1,
          padding: '5px 12px', 
          fontSize: 12, 
          fontWeight: 600, 
          borderRadius: 8,
          background: clr.accentLight, 
          color: clr.accentText,
          border: `1.5px dashed ${clr.accent}`,
        }}>
          {uploading ? '📎 Uploading PDF...' : `📎 ${label}`}
        </span>
      </label>
    </div>
  );
}