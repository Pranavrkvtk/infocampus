// src/components/SubtopicEditor.jsx
import React, { useState } from 'react';
import NotesTab from './NotesTab';
import ImagesTab from './ImagesTab';
import VideoTab from './VideoTab';
import InterviewTab from './InterviewTab';
import ExamTab from './ExamTab';
import LabTab from './LabTab';

const clr = {
  border: '#e4e7ec',
  accent: '#4f46e5',
  muted: '#64748b',
  white: '#ffffff',
};

const TABS = [
  { id: 'notes', icon: '📝', label: 'Notes' },
  { id: 'images', icon: '🖼️', label: 'Images' },
  { id: 'video', icon: '🎬', label: 'Video' },
  { id: 'interview', icon: '🎤', label: 'Interview Qs' },
  { id: 'exam', icon: '📋', label: 'Exam Qs' },
  { id: 'lab', icon: '🧪', label: 'Lab Steps' },
];

const Card = ({ children, style }) => (
  <div style={{ background: clr.white, borderRadius: 12, border: `1px solid ${clr.border}`, ...style }}>
    {children}
  </div>
);

function SubtopicEditor({ sub, subtopicId, toast, onUpdate }) {
  const [activeTab, setActiveTab] = useState('notes');
  const [localSub, setLocalSub] = useState(sub);

  const handleUpdate = (patch) => {
    setLocalSub(s => ({ ...s, ...patch }));
    onUpdate(patch);
  };

  return (
    <Card style={{ flex: 1 }}>
      <div style={{ borderBottom: `1px solid ${clr.border}`, display: 'flex', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? clr.accent : clr.muted,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t.id ? `2px solid ${clr.accent}` : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
        {activeTab === 'notes' && <NotesTab sub={localSub} subtopicId={subtopicId} toast={toast} onUpdate={handleUpdate} />}
        {activeTab === 'images' && <ImagesTab sub={localSub} subtopicId={subtopicId} toast={toast} onUpdate={handleUpdate} />}
        {activeTab === 'video' && <VideoTab sub={localSub} subtopicId={subtopicId} toast={toast} onUpdate={handleUpdate} />}
        {activeTab === 'interview' && <InterviewTab sub={localSub} subtopicId={subtopicId} toast={toast} onUpdate={handleUpdate} />}
        {activeTab === 'exam' && <ExamTab sub={localSub} subtopicId={subtopicId} toast={toast} onUpdate={handleUpdate} />}
        {activeTab === 'lab' && <LabTab sub={localSub} subtopicId={subtopicId} toast={toast} onUpdate={handleUpdate} />}
      </div>
    </Card>
  );
}

export default SubtopicEditor;
