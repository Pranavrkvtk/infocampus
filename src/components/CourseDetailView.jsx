// src/components/CourseDetailView.jsx
// Premium Odoo-style learning UI - Dark Sidebar + Dark Content - Fully Responsive
// ✅ Image save prevention added
// ✅ Auto-exit fullscreen on navigation

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  getSubtopicInterviewQuestions,
  getSubtopicExamQuestions,
  getSubtopicLabs,
  getCourseData,
  getSubtopicImages,
  checkEnrollment,
} from '../api/UserApi';
import { getCourseDetailConfig } from './Admin/CourseDetailEditorTab';
import { getImageUrl } from '../utils/imageUtils';

// ─── Material UI Icons ──────────────────────────────────────────────────
import ShareIcon from '@mui/icons-material/Share';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import LockIcon from '@mui/icons-material/Lock';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FlagIcon from '@mui/icons-material/Flag';
import DescriptionIcon from '@mui/icons-material/Description';
import QuizIcon from '@mui/icons-material/Quiz';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ScienceIcon from '@mui/icons-material/Science';

// ─── Odoo eLearning Color Palette ────────────────────────────────────
const SIDEBAR = {
  bg: '#1d2228',
  header: '#1a1f24',
  headerBg: '#4B5563',
  item: '#252b32',
  itemOpen: '#1d2228',
  hover: '#2c333a',
  active: '#000000',
  border: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textLight: '#D7DDE5',
  textMuted: '#8a95a0',
  accent: '#714b67',
};

const DARK = {
  bg: '#1d2228',
  surface: '#252b32',
  surfaceLight: '#2c333a',
  border: 'rgba(255,255,255,0.06)',
  text: '#FFFFFF',
  textMuted: '#8a95a0',
  textLight: '#D7DDE5',
  accent: '#714b67',
  accentSoft: '#2c333a',
  success: '#22c55e',
  successBg: '#052e16',
  hover: '#2c333a',
  cardBg: '#252b32',
  inputBg: '#1d2228',
};

const LIGHT = {
  bg: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  textLight: '#1e293b',
  hover: '#f1f5f9',
  accent: '#714b67',
  accentSoft: '#eef2ff',
  success: '#22c55e',
  successBg: '#dcfce7',
};

const TOPBAR = {
  bg: '#2C3540',
  bgGradient: 'linear-gradient(180deg, #2C3540 0%, #1F2933 100%)',
  bgActive: '#1A232E',
  bgHover: '#3A4553',
  border: '#3E4A58',
  text: '#FFFFFF',
  muted: '#C9D2DC',
  lessonsColor: '#47525f',
};

// ─── Helpers ───────────────────────────────────────────────────────────

const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('watch?v=') && url.includes('&list=')) {
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      const listMatch = url.match(/[?&]list=([^&]+)/);
      if (listMatch && listMatch[1]) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}?list=${listMatch[1]}`;
      }
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
  }
  if (url.includes('watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  if (url.includes('vimeo.com/')) {
    return url.replace('vimeo.com/', 'player.vimeo.com/video/');
  }
  return url;
};

const getVideoUrls = (subtopic) => {
  if (!subtopic) return [];
  
  if (subtopic.videoUrls && Array.isArray(subtopic.videoUrls)) {
    const validUrls = subtopic.videoUrls.filter(url => url && url.trim() !== '');
    if (validUrls.length > 0) return validUrls;
  }
  
  if (subtopic.videoUrl && subtopic.videoUrl.trim() !== '') {
    return [subtopic.videoUrl];
  }
  
  return [];
};

const hasVideoContent = (subtopic) => {
  if (!subtopic) return false;
  return getVideoUrls(subtopic).length > 0;
};

const hasNotesContent = (subtopic) => {
  if (!subtopic) return false;
  return !!(subtopic.content && subtopic.content.trim() !== '');
};

const fetchImageWithAuth = async (url) => {
  try {
    const token = localStorage.getItem('token');
    const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1");
    const response = await fetch(cleanUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch image');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

const buildImgSrc = (src) => {
  if (!src) return '';
  return getImageUrl(src) || '';
};

const buildImageTag = (alt, src) => {
  const imgSrc = buildImgSrc(src);
  return `<img src="${imgSrc}" alt="${alt}" class="note-image" loading="lazy" />`;
};

const inlineFormat = (str) => {
  let out = str;
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => buildImageTag(alt, url));
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => 
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="note-link">${text}</a>`
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/`([^`]+)`/g, '<code class="note-code">$1</code>');
  return out;
};

// ─── Odoo-style Markdown Renderer ────────────────────────────────────

const renderOdooContent = (text) => {
  if (!text) return '';
  
  const lines = text.split('\n');
  let html = '';
  let listType = null;

  const closeList = () => {
    if (listType) {
      html += `</${listType}>`;
      listType = null;
    }
  };

  const processLine = (line) => {
    const mainHeading = line.match(/^#\s+(.+)$/);
    if (mainHeading) {
      closeList();
      html += `<h1 class="odoo-main-heading">${inlineFormat(mainHeading[1])}</h1>`;
      return true;
    }

    const subHeading = line.match(/^##\s+(.+)$/);
    if (subHeading) {
      closeList();
      html += `<h2 class="odoo-sub-heading">${inlineFormat(subHeading[1])}</h2>`;
      return true;
    }

    const question = line.match(/^#\s+(\d+)\.\s+(.*)$/);
    if (question) {
      closeList();
      html += `<div class="odoo-question-wrapper">`;
      html += `<div class="odoo-question-number">${question[1]}.</div>`;
      html += `<div class="odoo-question-text">${inlineFormat(question[2])}</div>`;
      html += `</div>`;
      return true;
    }

    const boldListItem = line.match(/^-\s+\*\*(.+)\*\*$/);
    if (boldListItem) {
      closeList();
      html += `<div class="odoo-section-header">${inlineFormat(boldListItem[1])}</div>`;
      return true;
    }

    const indentListItem = line.match(/^\s{2,}-\s+(.+)$/);
    if (indentListItem) {
      if (listType !== 'ul') {
        closeList();
        html += '<ul class="odoo-list">';
        listType = 'ul';
      }
      html += `<li class="odoo-list-item">${inlineFormat(indentListItem[1])}</li>`;
      return true;
    }

    const listItem = line.match(/^-\s+(.+)$/);
    if (listItem) {
      if (listType !== 'ul') {
        closeList();
        html += '<ul class="odoo-list">';
        listType = 'ul';
      }
      html += `<li class="odoo-list-item">${inlineFormat(listItem[1])}</li>`;
      return true;
    }

    const boldText = line.match(/^\*\*(.+)\*\*$/);
    if (boldText) {
      closeList();
      html += `<div class="odoo-signin-text">${inlineFormat(boldText[1])}</div>`;
      return true;
    }

    const xpMatch = line.match(/^\+(\d+)\s+XP$/);
    if (xpMatch) {
      closeList();
      html += `<div class="odoo-xp-badge">+${xpMatch[1]} XP</div>`;
      return true;
    }

    if (line.match(/^---$/)) {
      closeList();
      html += '<hr class="odoo-divider" />';
      return true;
    }

    closeList();
    if (line.trim()) {
      html += `<p class="odoo-paragraph">${inlineFormat(line)}</p>`;
    }
    return true;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '') {
      closeList();
      continue;
    }
    processLine(line);
  }

  closeList();
  return html;
};

const buildOdooStyles = (colors) => `
  .odoo-content {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #1a1a1a !important;
    font-size: 16px;
    line-height: 1.8;
    padding: 4px 0;
    max-width: 100%;
    background: transparent !important;
    min-height: auto;
  }
  .odoo-main-heading {
    font-size: 32px;
    font-weight: 800;
    color: #1a1a1a !important;
    margin: 0 0 24px 0;
    padding: 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  .odoo-sub-heading {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a !important;
    margin: 32px 0 16px 0;
    padding: 0;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .odoo-section-header {
    font-size: 15px;
    font-weight: 700;
    color: #4a5568 !important;
    margin: 20px 0 8px 0;
    padding: 0;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .odoo-list {
    margin: 4px 0 20px 0;
    padding-left: 0;
    list-style: none;
  }
  .odoo-list-item {
    padding: 6px 0 6px 28px;
    position: relative;
    font-size: 15px;
    color: #2d3748 !important;
    line-height: 1.7;
  }
  .odoo-list-item::before {
    content: "●";
    position: absolute;
    left: 4px;
    color: ${colors.accent || '#714b67'};
    font-weight: 700;
    font-size: 12px;
  }
  .odoo-question-wrapper {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin: 28px 0 12px 0;
    padding: 16px 20px;
    background: #f7fafc !important;
    border-radius: 12px;
    border-left: 4px solid ${colors.accent || '#714b67'};
  }
  .odoo-question-number {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a !important;
    min-width: 28px;
    flex-shrink: 0;
  }
  .odoo-question-text {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a !important;
    line-height: 1.6;
  }
  .odoo-signin-text {
    font-size: 15px;
    font-weight: 500;
    color: #4a5568 !important;
    margin: 20px 0 10px 0;
    padding: 0;
    text-align: center;
  }
  .odoo-xp-badge {
    display: inline-block;
    background: ${colors.accent || '#714b67'};
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 700;
    padding: 6px 20px;
    border-radius: 20px;
    margin: 4px 0;
  }
  .odoo-divider {
    border: none;
    border-top: 1px solid #e2e8f0 !important;
    margin: 24px 0;
  }
  .odoo-paragraph {
    font-size: 15px;
    color: #2d3748 !important;
    line-height: 1.8;
    margin: 0 0 18px 0;
  }
  .note-link {
    color: ${colors.accent || '#714b67'};
    text-decoration: underline;
    text-underline-offset: 2px;
    font-weight: 500;
  }
  .note-link:hover {
    color: #5a3a4e;
  }
  .note-code {
    background: #f7fafc !important;
    padding: 2px 10px;
    border-radius: 6px;
    font-size: 14px;
    font-family: 'JetBrains Mono', monospace;
    color: #2d3748 !important;
  }
  .note-image {
    max-width: 100%;
    border-radius: 12px;
    margin: 20px 0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    display: block;
    pointer-events: none;
    -webkit-user-drag: none;
    user-drag: none;
  }
  .fade-in {
    animation: odooFadeIn 0.5s ease-out;
  }
  @keyframes odooFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .odoo-content,
  .odoo-content * {
    user-select: none !important;
    -webkit-user-select: none !important;
  }
  /* ─── Odoo Premium "Paper" layout (Notes / Exam Content / Interview Content) ─── */
  .lesson-page-wrapper {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: #ffffff;
    display: flex;
    justify-content: center;
    box-sizing: border-box;
    padding: 30px 20px 60px 20px;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  .lesson-paper {
    width: 900px;
    max-width: 100%;
    background: #ffffff;
    border-radius: 0;
    padding: 40px 60px;
    box-shadow: none;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .lesson-page-wrapper::-webkit-scrollbar {
    width: 8px;
  }
  .lesson-page-wrapper::-webkit-scrollbar-track {
    background: #e2e6ea;
    border-radius: 4px;
  }
  .lesson-page-wrapper::-webkit-scrollbar-thumb {
    background: #c3cad2;
    border-radius: 4px;
  }
  .lesson-page-wrapper::-webkit-scrollbar-thumb:hover {
    background: #a9b2bc;
  }
  @media (max-width: 768px) {
    .lesson-page-wrapper {
      padding: 14px 8px 40px 8px;
    }
    .lesson-paper {
      padding: 20px 18px;
      border-radius: 10px;
    }
  }
  .odoo-content::-webkit-scrollbar {
    width: 8px;
  }
  .odoo-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .odoo-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  .odoo-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  @media (max-width: 768px) {
    .odoo-main-heading { font-size: 24px; }
    .odoo-sub-heading { font-size: 20px; }
    .odoo-list-item { font-size: 14px; padding: 4px 0 4px 24px; }
    .odoo-paragraph { font-size: 14px; }
    .odoo-question-wrapper { padding: 12px 16px; }
    .odoo-question-text { font-size: 15px; }
  }
`;

// ─── Empty State Component ──────────────────────────────────────────

function EmptyState({ courseTitle, topicsCount, subtopicsCount }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: '400px',
      padding: isMobile ? '20px' : '40px',
      background: 'linear-gradient(180deg, #e8ecf0 0%, #d5dadd 100%)',
      color: '#1a1f24',
      textAlign: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important",
    }}>
      <div style={{
        width: isMobile ? '60px' : '80px',
        height: isMobile ? '60px' : '80px',
        borderRadius: '50%',
        background: 'rgba(113, 75, 103, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isMobile ? '16px' : '24px',
        border: '1px solid rgba(113, 75, 103, 0.12)',
      }}>
        <span style={{ fontSize: isMobile ? '28px' : '36px' }}>📚</span>
      </div>

      <h1 style={{
        fontSize: isMobile ? '20px' : '32px',
        fontWeight: 700,
        margin: '0 0 8px 0',
        color: '#1a1f24',
        letterSpacing: '-0.02em',
      }}>
        {courseTitle || 'Course'}
      </h1>

      <p style={{
        fontSize: isMobile ? '14px' : '18px',
        color: 'rgba(26, 31, 36, 0.5)',
        margin: '0 0 24px 0',
        maxWidth: '500px',
        lineHeight: 1.6,
      }}>
        Select a section from the sidebar to start learning
      </p>

      <div style={{
        display: 'flex',
        gap: isMobile ? '20px' : '32px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: isMobile ? '22px' : '28px',
            fontWeight: 700,
            color: '#1a1f24',
          }}>
            {topicsCount || 0}
          </span>
          <span style={{
            fontSize: isMobile ? '11px' : '13px',
            color: 'rgba(26, 31, 36, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Topics
          </span>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: isMobile ? '22px' : '28px',
            fontWeight: 700,
            color: '#1a1f24',
          }}>
            {subtopicsCount || 0}
          </span>
          <span style={{
            fontSize: isMobile ? '11px' : '13px',
            color: 'rgba(26, 31, 36, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Lessons
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Components ──────────────────────────────────────────────────

function NotesTab({ content, config }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!content) {
    return <div style={{ padding: '20px', color: '#4a5568', textAlign: 'center' }}>No notes available</div>;
  }

  const html = renderOdooContent(content);
  const styleTag = buildOdooStyles(config.colors);

  return (
    <div className="lesson-page-wrapper">
      <div className="lesson-paper">
        <div
          className="odoo-content fade-in"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            color: '#1a1a1a',
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          onSelect={(e) => e.preventDefault()}
        />
      </div>
      <style>{styleTag}</style>
    </div>
  );
}

function ExamContentTab({ content, config }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!content) {
    return <div style={{ padding: '20px', color: '#4a5568', textAlign: 'center' }}>No exam content available</div>;
  }

  const html = renderOdooContent(content);
  const styleTag = buildOdooStyles(config.colors);

  return (
    <div className="lesson-page-wrapper">
      <div className="lesson-paper">
        <div
          className="odoo-content fade-in"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            color: '#1a1a1a',
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          onSelect={(e) => e.preventDefault()}
        />
      </div>
      <style>{styleTag}</style>
    </div>
  );
}

function InterviewContentTab({ content, config }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!content) {
    return <div style={{ padding: '20px', color: '#4a5568', textAlign: 'center' }}>No interview content available</div>;
  }

  const html = renderOdooContent(content);
  const styleTag = buildOdooStyles(config.colors);

  return (
    <div className="lesson-page-wrapper">
      <div className="lesson-paper">
        <div
          className="odoo-content fade-in"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            color: '#1a1a1a',
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          onSelect={(e) => e.preventDefault()}
        />
      </div>
      <style>{styleTag}</style>
    </div>
  );
}

// ✅ Updated VideoTab with download prevention
function VideoTab({ videoUrls, config, title, courseTitle }) {
  const [currentVideo, setCurrentVideo] = useState(0);
  const urls = Array.isArray(videoUrls) ? videoUrls : (videoUrls ? [videoUrls] : []);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (urls.length === 0) {
    return <div style={{ padding: 24, color: '#C9D2DC', textAlign: 'center' }}>No videos available</div>;
  }

  const embed = getEmbedUrl(urls[currentVideo]);

  return (
    <div style={{
      height: '100%',
      width: '100%',
      background: '#000',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        height: '100%',
      }}>
        <iframe
          src={embed}
          title={`Video ${currentVideo + 1}`}
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
            background: '#000',
          }}
        />
      </div>

      {urls.length > 1 && (
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: isMobile ? 16 : 24,
          zIndex: 3,
          display: 'flex',
          gap: isMobile ? 4 : 8,
          background: 'rgba(0,0,0,0.6)',
          padding: isMobile ? '4px 8px' : '8px 16px',
          borderRadius: 999,
          backdropFilter: 'blur(8px)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {urls.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentVideo(idx)}
              style={{
                border: 0,
                borderRadius: 999,
                padding: isMobile ? '4px 10px' : '6px 14px',
                background: idx === currentVideo ? '#714b67' : 'rgba(255,255,255,0.2)',
                color: idx === currentVideo ? '#FFFFFF' : '#fff',
                fontWeight: 700,
                fontSize: isMobile ? '10px' : '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InterviewTab({ questions, config }) {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!questions || questions.length === 0) {
    return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>No interview questions available</div>;
  }

  return (
    <div style={{ padding: isMobile ? '12px' : '20px' }}>
      <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: isMobile ? '8px 12px' : '10px 14px',
            borderRadius: '10px',
            border: `1px solid ${LIGHT.border}`,
            fontSize: isMobile ? '13px' : '14px',
            outline: 'none',
            background: LIGHT.bg,
            color: LIGHT.text,
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '10px' }}>
        {questions.map((q, idx) => (
          <div
            key={q.id}
            style={{
              background: LIGHT.surface,
              borderRadius: isMobile ? '10px' : '12px',
              border: `1px solid ${LIGHT.border}`,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: isMobile ? '12px 14px' : '14px 18px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: isMobile ? '13px' : '14px',
                color: LIGHT.text,
              }}
            >
              <span>
                <span style={{ color: LIGHT.textMuted, marginRight: '8px' }}>{idx + 1}.</span>
                {q.question}
              </span>
              <span style={{ fontSize: isMobile ? '14px' : '16px', color: LIGHT.textMuted }}>
                {expanded[q.id] ? '▼' : '▶'}
              </span>
            </div>
            {expanded[q.id] && (
              <div style={{
                padding: isMobile ? '12px 14px' : '14px 18px',
                borderTop: `1px solid ${LIGHT.border}`,
                background: LIGHT.hover,
                color: LIGHT.text,
                lineHeight: '1.8',
                fontSize: isMobile ? '13px' : '14px',
              }}>
                {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamTab({ questions, config, onScoreUpdate }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!questions || questions.length === 0) {
    return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>No exam questions available</div>;
  }

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    setScore({ correct, total: questions.length });
    setSubmitted(true);
    if (onScoreUpdate) onScoreUpdate(correct, questions.length);
  };

  return (
    <div style={{ padding: isMobile ? '12px' : '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '10px 14px' : '12px 16px',
        background: LIGHT.hover,
        borderRadius: '12px',
        marginBottom: isMobile ? '12px' : '16px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <span style={{ fontWeight: 700, fontSize: isMobile ? '14px' : '15px', color: LIGHT.textLight }}>
          Quiz
        </span>
        {!submitted && (
          <button
            onClick={handleSubmit}
            style={{
              padding: isMobile ? '6px 16px' : '8px 20px',
              background: config.colors?.accent || '#714b67',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: isMobile ? '12px' : '13px',
              cursor: 'pointer',
            }}
          >
            Submit Quiz
          </button>
        )}
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} style={{
          padding: isMobile ? '14px' : '18px',
          background: LIGHT.surface,
          borderRadius: '12px',
          border: `1px solid ${LIGHT.border}`,
          marginBottom: isMobile ? '10px' : '12px',
        }}>
          <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: isMobile ? '14px' : '15px', color: LIGHT.textLight }}>
            <span style={{ color: LIGHT.textMuted, marginRight: '8px' }}>{idx + 1}.</span>
            {q.question}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optText = q[`option${opt}`];
              if (!optText) return null;
              const isSelected = answers[q.id] === opt;
              return (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: isMobile ? '6px 12px' : '8px 14px',
                    borderRadius: '8px',
                    background: isSelected ? LIGHT.accentSoft : 'transparent',
                    border: isSelected ? `1px solid ${config.colors?.accent || '#714b67'}` : `1px solid transparent`,
                    cursor: submitted ? 'default' : 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    checked={isSelected}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                    disabled={submitted}
                    style={{ accentColor: config.colors?.accent || '#714b67' }}
                  />
                  <span style={{ fontSize: isMobile ? '13px' : '14px', color: LIGHT.text }}>
                    <strong style={{ color: LIGHT.textMuted, marginRight: '4px' }}>{opt}.</strong>
                    {optText}
                  </span>
                </label>
              );
            })}
          </div>
          {submitted && (
            <div style={{
              marginTop: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: answers[q.id] === q.correctAnswer ? LIGHT.successBg : '#fee2e2',
              fontSize: isMobile ? '12px' : '13px',
              color: answers[q.id] === q.correctAnswer ? LIGHT.success : '#dc2626',
            }}>
              {answers[q.id] === q.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
            </div>
          )}
        </div>
      ))}

      {submitted && score && (
        <div style={{
          padding: isMobile ? '14px' : '16px',
          background: LIGHT.hover,
          borderRadius: '12px',
          textAlign: 'center',
          marginTop: '8px',
        }}>
          <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: LIGHT.textLight }}>
            {score.correct} / {score.total}
          </div>
          <div style={{ fontSize: isMobile ? '12px' : '13px', color: LIGHT.textMuted }}>
            {Math.round((score.correct / score.total) * 100)}% correct
          </div>
        </div>
      )}
    </div>
  );
}

function LabsTab({ labs, config }) {
  const [activeLab, setActiveLab] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!labs || labs.length === 0) {
    return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>No labs available</div>;
  }

  return (
    <div style={{ padding: isMobile ? '12px' : '20px' }}>
      {labs.map((lab, idx) => (
        <div
          key={lab.id}
          style={{
            background: LIGHT.surface,
            borderRadius: isMobile ? '10px' : '12px',
            border: `1px solid ${LIGHT.border}`,
            padding: isMobile ? '14px 16px' : '16px 20px',
            marginBottom: isMobile ? '8px' : '10px',
            cursor: 'pointer',
          }}
          onClick={() => setActiveLab(activeLab === lab.id ? null : lab.id)}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <span style={{ fontWeight: 600, fontSize: isMobile ? '14px' : '15px', color: LIGHT.textLight }}>
              {idx + 1}. {lab.title}
            </span>
          </div>
          {activeLab === lab.id && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: `1px solid ${LIGHT.border}`,
              fontSize: isMobile ? '13px' : '14px',
              color: LIGHT.text,
              lineHeight: '1.8',
            }}>
              {lab.instructions}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main CourseDetailView ────────────────────────────────────────────

export default function CourseDetailView({
  selectedCourse: propSelectedCourse,
  topics: propTopics = [],
  subtopics: propSubtopics = [],
  images: propImages = [],
  progress = 0,
  activeView = 'split',
  activeSection = 0,
  completedSections = [],
  currentSubtopic: propCurrentSubtopic = null,
  contentLoading: propContentLoading = false,
  handleBack,
  setActiveView,
  setActiveSection: propSetActiveSection,
  setCurrentSubtopic: propSetCurrentSubtopic,
  loadSubtopicImages: propLoadSubtopicImages,
  resetProgress,
  markSectionComplete,
  getImageSrc,
  getImageUrl,
  handleImageError,
  isGuest = false,
  isPreview = false,
  styles: propStyles,
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // ─── State for fetched data ──────────────────────────────────────────
  const [fetchedCourse, setFetchedCourse] = useState(null);
  const [fetchedTopics, setFetchedTopics] = useState([]);
  const [fetchedSubtopics, setFetchedSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // ─── Local state for sidebar and content ────────────────────────────
  const [localActiveSection, setLocalActiveSection] = useState(activeSection || 0);
  const [localCurrentSubtopic, setLocalCurrentSubtopic] = useState(propCurrentSubtopic || null);
  const [localImages, setLocalImages] = useState(propImages || []);

  // ─── Use props or local state ──────────────────────────────────────
  const selectedCourse = propSelectedCourse || fetchedCourse;
  const topics = propTopics.length > 0 ? propTopics : fetchedTopics;
  const subtopics = propSubtopics.length > 0 ? propSubtopics : fetchedSubtopics;
  const images = propImages.length > 0 ? propImages : localImages;
  const currentSubtopic = propCurrentSubtopic || localCurrentSubtopic || (subtopics.length > 0 ? subtopics[localActiveSection] : null);
  const contentLoading = propContentLoading || loading;

  const currentActiveSection = typeof propSetActiveSection === 'function'
    ? activeSection
    : localActiveSection;

  // ─── Wrapper functions for setters ──────────────────────────────────
  const setActiveSection = useCallback((index) => {
    console.log("📍 setActiveSection called with index:", index);
    if (typeof propSetActiveSection === 'function') {
      propSetActiveSection(index);
    }
    setLocalActiveSection(index);
  }, [propSetActiveSection]);

  const setCurrentSubtopic = useCallback((subtopic) => {
    console.log("📍 setCurrentSubtopic called with:", subtopic?.title);
    if (typeof propSetCurrentSubtopic === 'function') {
      propSetCurrentSubtopic(subtopic);
    }
    setLocalCurrentSubtopic(subtopic);
  }, [propSetCurrentSubtopic]);

  const loadSubtopicImages = useCallback(async (subtopicId) => {
    if (typeof propLoadSubtopicImages === 'function') {
      return await propLoadSubtopicImages(subtopicId);
    }
    try {
      const data = await getSubtopicImages(subtopicId);
      setLocalImages(data);
      return data;
    } catch (error) {
      console.error('Error loading subtopic images:', error);
      return [];
    }
  }, [propLoadSubtopicImages]);

  // ─── Load config ─────────────────────────────────────────────────────
  const config = getCourseDetailConfig();

  // ─── Define the display order of content types ──────────────────────
  const typeOrder = ['notes', 'video', 'exam-content', 'interview-content', 'interview', 'exam', 'labs'];

  // ─── Build content types from config in the desired order ──────────
  const CONTENT_TYPES = [
    {
      key: 'notes',
      icon: <DescriptionIcon sx={{ fontSize: 18, color: '#FFC107' }} />,
      label: 'Notes',
      color: '#714b67',
    },
    {
      key: 'video',
      icon: <YouTubeIcon sx={{ fontSize: 20, color: '#FF0000' }} />,
      label: 'Video',
      color: '#3b82f6',
    },
    {
      key: 'exam-content',
      icon: <QuizIcon sx={{ fontSize: 18, color: '#16a34a' }} />,
      label: 'Exam Content',
      color: '#16a34a',
    },
    {
      key: 'interview-content',
      icon: <RecordVoiceOverIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />,
      label: 'Interview Content',
      color: '#8b5cf6',
    },
    {
      key: 'interview',
      icon: <QuestionAnswerIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />,
      label: 'Interview Q&A',
      color: '#8b5cf6',
    },
    {
      key: 'exam',
      icon: <QuizIcon sx={{ fontSize: 18, color: '#16a34a' }} />,
      label: 'Exam Quiz',
      color: '#16a34a',
    },
    {
      key: 'labs',
      icon: <ScienceIcon sx={{ fontSize: 18, color: '#f59e0b' }} />,
      label: 'Labs',
      color: '#f59e0b',
    },
  ];

  // ─── Fetch course data using getCourseData (auto-detects auth) ──────
  const fetchCourseData = useCallback(async (id) => {
    try {
      setLoading(true);
      setFetchError(null);
      
      console.log('📥 Fetching course data for ID:', id);
      
      const response = await getCourseData(id);
      console.log('📚 Course data response:', response);
      
      let data = response;
      if (response && response.data) {
        data = response.data;
      }
      
      if (!data || !data.id) {
        console.error('❌ No course data found:', data);
        setFetchError('Course data not found. Please try again.');
        setLoading(false);
        return;
      }

      setIsAuthenticated(data.isAuthenticated === true);
      setIsEnrolled(data.isEnrolled === true);
      
      console.log('🔐 isAuthenticated:', data.isAuthenticated);
      console.log('📚 isEnrolled:', data.isEnrolled);

      setFetchedCourse(data);

      let allTopics = [];
      let allSubtopics = [];

      const topicsData = data.topics || [];
      console.log('📚 Topics data found:', topicsData);

      if (topicsData && topicsData.length > 0) {
        allTopics = topicsData;
        
        topicsData.forEach((topic, topicIndex) => {
          const subs = topic.subTopics || topic.subtopics || [];
          console.log(`📚 Topic ${topicIndex + 1}: ${topic.title}, subtopics: ${subs.length}`);
          
          const isFirstTopic = topicIndex === 0 || topic.isFirstTopic === true;
          
          subs.forEach(sub => {
            const hasContent = sub.content && sub.content.trim() !== '';
            const hasVideo = sub.videoUrl && sub.videoUrl.trim() !== '';
            
            allSubtopics.push({
              id: sub.id,
              title: sub.title || 'Untitled',
              topicTitle: topic.title || 'Topic',
              topicId: topic.id,
              topicIndex: topicIndex,
              isFirstTopic: isFirstTopic,
              content: sub.content || '',
              videoUrl: sub.videoUrl || '',
              videoUrls: sub.videoUrls || [],
              imageUrl: sub.imageUrl || '',
              images: sub.images || [],
              isFree: sub.isFree || isFirstTopic,
              examContent: sub.examContent || '',
              interviewContent: sub.interviewContent || '',
              displayOrder: sub.displayOrder || 0,
              contentStatus: sub.contentStatus || (isFirstTopic ? 'free_preview' : 'locked'),
              isAuthenticated: data.isAuthenticated,
              isEnrolled: data.isEnrolled,
              hasContent: hasContent,
              hasVideo: hasVideo,
              ...sub
            });
          });
        });
      }

      console.log('📚 Extracted topics count:', allTopics.length);
      console.log('📚 Extracted subtopics count:', allSubtopics.length);

      setFetchedTopics(allTopics);
      setFetchedSubtopics(allSubtopics);

      if (allSubtopics.length > 0) {
        setActiveSection(0);
        setCurrentSubtopic(allSubtopics[0]);
        await loadSubtopicImages(allSubtopics[0].id);
      }

      if (data.isAuthenticated) {
        try {
          const enrollmentCheck = await checkEnrollment(id);
          setIsEnrolled(enrollmentCheck.enrolled);
          console.log('📚 Enrollment status:', enrollmentCheck);
        } catch (err) {
          console.error('Error checking enrollment:', err);
        }
      }

    } catch (err) {
      console.error('❌ Error fetching course data:', err);
      setFetchError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [setActiveSection, setCurrentSubtopic, loadSubtopicImages]);

  // ─── Fetch course data on mount and courseId change ────────────────
  useEffect(() => {
    console.log('🔄 CourseDetailView useEffect - courseId:', courseId);
    if (courseId) {
      fetchCourseData(courseId);
    } else {
      setLoading(false);
    }
  }, [courseId, fetchCourseData]);

  // ─── Rest of the component ──────────────────────────────────────────
  const [expandedTopics, setExpandedTopics] = useState(() => {
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return {};
    }
    const t = topics.find((tp) => {
      const subs = tp.subTopics || tp.subtopics || [];
      return subs.length > 0;
    });
    return t ? { [t.id]: true } : {};
  });
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeContentType, setActiveContentType] = useState('notes');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [authImageUrls, setAuthImageUrls] = useState({});
  const authImageUrlsRef = useRef({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  // ─── Check if mobile on mount and resize ────────────────────────────
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowSidebar(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ FIXED: isTopicLocked uses authentication status from response
  const isTopicLocked = useCallback(
    (topicId, topicIndex) => {
      if (isAuthenticated && isEnrolled) {
        return false;
      }
      
      if (isAuthenticated && !isEnrolled) {
        return topicIndex !== 0;
      }
      
      if (isPreview) {
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return true;
        return topic.isFirstTopic !== true;
      }
      
      if (!isLoggedIn) {
        return topicIndex !== 0;
      }
      
      const topic = topics.find(t => t.id === topicId);
      if (!topic) return true;
      return topic.isFirstTopic !== true;
    },
    [isLoggedIn, isPreview, topics, isAuthenticated, isEnrolled]
  );

  // ─── Effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) navbar.style.display = 'none';
    document.body.style.paddingTop = '0';
    return () => {
      const navbar = document.querySelector('nav');
      if (navbar) navbar.style.display = '';
      document.body.style.paddingTop = '';
    };
  }, []);

  // ✅ NEW: Auto-exit fullscreen when component unmounts (navigation occurs)
  useEffect(() => {
    return () => {
      // Exit fullscreen when component unmounts (navigation occurs)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          // Ignore errors - fullscreen might already be exited
          console.debug('Fullscreen exit on navigation:', err);
        });
      }
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const loadImagesWithAuth = async () => {
      const newAuthUrls = {};
      for (const img of images) {
        const safeId = img.subTopicId || img.subtopicId;
        if (!safeId) continue;
        const url = `/admin/uploads/subtopic_${safeId}/images/${img.fileName}`;
        const blobUrl = await fetchImageWithAuth(url);
        if (blobUrl) newAuthUrls[img.id] = blobUrl;
      }
      setAuthImageUrls(newAuthUrls);
      authImageUrlsRef.current = newAuthUrls;
    };
    if (images.length > 0) loadImagesWithAuth();
    return () => {
      Object.values(authImageUrlsRef.current).forEach((url) => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [images]);

  // ✅ Global disable right-click on images - MOVED BEFORE EARLY RETURNS
  useEffect(() => {
    const disableRightClick = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', disableRightClick);
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
    };
  }, []);

  const videoUrls = getVideoUrls(currentSubtopic);
  const currentTopic = topics && Array.isArray(topics) ? topics.find((t) => {
    const subs = t.subTopics || t.subtopics || [];
    return subs.some((s) => String(s.id) === String(currentSubtopic?.id));
  }) : null;

  const fetchSubtopicData = useCallback(async (subtopicId) => {
    if (!subtopicId) return;
    setLoadingData(true);
    try {
      const [questions, exams, labList] = await Promise.all([
        getSubtopicInterviewQuestions(subtopicId).catch(() => []),
        getSubtopicExamQuestions(subtopicId).catch(() => []),
        getSubtopicLabs(subtopicId).catch(() => []),
      ]);
      setInterviewQuestions(questions);
      setExamQuestions(exams);
      setLabs(labList);
    } catch (err) {
      console.error('Failed to load subtopic data', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (currentSubtopic?.id) fetchSubtopicData(currentSubtopic.id);
  }, [currentSubtopic, fetchSubtopicData]);

  useEffect(() => {
    if (currentTopic) {
      setExpandedTopics((prev) => (prev[currentTopic.id] ? prev : { ...prev, [currentTopic.id]: true }));
    }
  }, [currentTopic]);

  const toggleTopic = (topicId) => setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));

  const handleLogin = () => {
    navigate('/login');
  };

  const promptLoginForLockedContent = () => {
    Swal.fire({
      title: 'Login Required',
      text: 'This lesson is part of the full course. Sign in to unlock every topic.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sign In',
      cancelButtonText: 'Not now',
      confirmButtonColor: '#714b67',
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogin();
      }
    });
  };

  const promptEnrollForLockedContent = () => {
    Swal.fire({
      title: 'Enrollment Required',
      text: 'You need to enroll in this course to access all content.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Enroll Now',
      cancelButtonText: 'Not now',
      confirmButtonColor: '#714b67',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/courses/${courseId}/enroll`);
      }
    });
  };

  // ✅ selectSubtopic function with proper locking logic
  const selectSubtopic = async (sub, globalIndex, topicId, topicIndex) => {
    console.log("📌 Clicked:", sub.title);
    console.log("📌 Global Index:", globalIndex);

    if (isTopicLocked(topicId, topicIndex)) {
      if (isAuthenticated && !isEnrolled) {
        promptEnrollForLockedContent();
      } else {
        promptLoginForLockedContent();
      }
      return;
    }

    setActiveSection(globalIndex);
    setCurrentSubtopic(sub);
    await loadSubtopicImages(sub.id);
    if (isMobile) {
      setShowSidebar(false);
    }
    
    const hasVideo = hasVideoContent(sub);
    const hasNotes = hasNotesContent(sub);
    const hasExam = !!(sub.examContent && sub.examContent.trim() !== '');
    const hasInterview = !!(sub.interviewContent && sub.interviewContent.trim() !== '');
    
    const subAvailableTypes = [];
    if (hasVideo) subAvailableTypes.push('video');
    if (hasNotes) subAvailableTypes.push('notes');
    if (hasExam) subAvailableTypes.push('exam-content');
    if (hasInterview) subAvailableTypes.push('interview-content');
    
    try {
      const [questions, exams, labList] = await Promise.all([
        getSubtopicInterviewQuestions(sub.id).catch(() => []),
        getSubtopicExamQuestions(sub.id).catch(() => []),
        getSubtopicLabs(sub.id).catch(() => []),
      ]);
      
      if (questions && questions.length > 0) subAvailableTypes.push('interview');
      if (exams && exams.length > 0) subAvailableTypes.push('exam');
      if (labList && labList.length > 0) subAvailableTypes.push('labs');
      
      setInterviewQuestions(questions || []);
      setExamQuestions(exams || []);
      setLabs(labList || []);
    } catch (err) {
      console.error('Failed to load subtopic data:', err);
    }
    
    subAvailableTypes.sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));
    
    if (subAvailableTypes.length > 0) {
      setActiveContentType(subAvailableTypes[0]);
    } else {
      setActiveContentType('notes');
    }
  };

  const filteredTopics = searchQuery
    ? (topics || []).filter((topic) => {
        const subs = topic.subTopics || topic.subtopics || [];
        return topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subs.some((sub) => sub.title.toLowerCase().includes(searchQuery.toLowerCase()));
      })
    : (topics || []);

  const renderPanelContent = () => {
    if (!currentSubtopic) {
      return (
        <EmptyState 
          courseTitle={selectedCourse?.title}
          topicsCount={topics ? topics.length : 0}
          subtopicsCount={subtopics ? subtopics.length : 0}
        />
      );
    }
    if (loadingData) return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>Loading...</div>;
    
    const currentAvailableTypes = (() => {
      if (!currentSubtopic) return [];
      const out = [];
      
      const hasVideo = hasVideoContent(currentSubtopic);
      const hasNotes = hasNotesContent(currentSubtopic);
      const hasExam = !!(currentSubtopic.examContent && currentSubtopic.examContent.trim() !== '');
      const hasInterview = !!(currentSubtopic.interviewContent && currentSubtopic.interviewContent.trim() !== '');
      
      if (hasVideo) out.push('video');
      if (hasNotes) out.push('notes');
      if (hasExam) out.push('exam-content');
      if (hasInterview) out.push('interview-content');
      
      if (interviewQuestions.length > 0) out.push('interview');
      if (examQuestions.length > 0) out.push('exam');
      if (labs.length > 0) out.push('labs');
      
      out.sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));
      return out;
    })();
    
    if (currentAvailableTypes.length === 0) return <div style={{ padding: '20px', color: LIGHT.textMuted, textAlign: 'center' }}>No content available</div>;

    if (!currentAvailableTypes.includes(activeContentType)) {
      setActiveContentType(currentAvailableTypes[0]);
    }

    switch (activeContentType) {
      case 'video':
        return (
          <VideoTab
            videoUrls={videoUrls}
            config={config}
            title={currentSubtopic?.title}
            courseTitle={selectedCourse?.title}
          />
        );
      case 'notes': 
        return <NotesTab content={currentSubtopic.content} config={config} />;
      case 'exam-content':
        return <ExamContentTab content={currentSubtopic.examContent} config={config} />;
      case 'interview-content':
        return <InterviewContentTab content={currentSubtopic.interviewContent} config={config} />;
      case 'interview': 
        return <InterviewTab questions={interviewQuestions} config={config} />;
      case 'exam': 
        return <ExamTab questions={examQuestions} config={config} />;
      case 'labs': 
        return <LabsTab labs={labs} config={config} />;
      default: 
        return null;
    }
  };

  // ✅ Toggle sidebar - properly handle mobile
  const toggleSidebar = () => {
    if (isMobile) {
      setShowSidebar((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleHomeClick = () => {
    navigate('/my-courses');
  };

  const handleBackClick = () => {
    if (handleBack) {
      handleBack();
    } else {
      navigate(-1);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: selectedCourse?.title || 'Course',
      text: `Check out this course: ${selectedCourse?.title || 'Course'}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        Swal.fire({
          title: 'Link Copied!',
          text: 'Course link copied to clipboard.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // ✅ Close sidebar on overlay click
  const handleOverlayClick = () => {
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  // ─── EARLY RETURNS (Loading, Error) ──────────────────────────────────
  // These must come AFTER all hooks are declared

  if (loading || contentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: DARK.bg, minHeight: '100vh' }}>
        <div style={{ width: '40px', height: '40px', border: `3px solid ${DARK.border}`, borderTopColor: DARK.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: DARK.textMuted, fontSize: '15px' }}>Loading course...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: DARK.bg, minHeight: '100vh' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Course</h2>
        <p style={{ color: DARK.textMuted, fontSize: '15px' }}>{fetchError}</p>
        <button
          onClick={() => navigate('/my-courses')}
          style={{
            marginTop: '20px',
            padding: '10px 24px',
            background: '#714b67',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ← Back to My Courses
        </button>
      </div>
    );
  }

  const styles = propStyles || {
    page: {
      background: 'linear-gradient(180deg, #e8ecf0 0%, #d5dadd 100%)',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    topBar: {
      height: isMobile ? '56px' : '64px',
      background: TOPBAR.bgGradient,
      borderBottom: `1px solid ${TOPBAR.border}`,
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      padding: 0,
      color: TOPBAR.text,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    },
    topBarLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0px',
      flexWrap: 'wrap',
    },
    topBarRight: {
      display: 'flex',
      alignItems: 'stretch',
      gap: '0px',
      height: '100%',
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '4px' : '10px',
      padding: isMobile ? '0 12px' : '0 24px',
      fontSize: isMobile ? '12px' : '15px',
      fontWeight: 600,
      border: 'none',
      borderLeft: `1px solid ${TOPBAR.border}`,
      cursor: 'pointer',
      transition: 'background 0.15s',
      background: TOPBAR.bgActive,
      color: TOPBAR.text,
      height: '100%',
      borderRadius: 0,
    },
    shell: {
      display: 'flex',
      height: isMobile ? 'calc(100% - 56px)' : 'calc(100% - 64px)',
      width: '100%',
      background: SIDEBAR.bg,
    },
    sidebar: {
      width: isMobile ? '85%' : '340px',
      minWidth: isMobile ? '85%' : '340px',
      maxWidth: isMobile ? '85%' : '340px',
      background: SIDEBAR.bg,
      borderRight: 'none',
      color: SIDEBAR.text,
      overflowY: 'auto',
      flexShrink: 0,
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      position: isMobile ? 'fixed' : 'relative',
      top: isMobile ? '0' : 'auto',
      left: isMobile ? '-100%' : 'auto',
      bottom: 0,
      zIndex: isMobile ? 1000 : 1,
      transition: isMobile ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      boxShadow: isMobile ? '4px 0 20px rgba(0,0,0,0.3)' : 'none',
    },
    sidebarOpen: { left: '0' },
    sidebarHeader: {
      padding: isMobile ? '16px 16px 12px' : '20px 20px 16px',
      background: '#4B5563',
      borderBottom: `1px solid ${SIDEBAR.border}`,
      borderTop: `1px solid rgba(255,255,255,0.05)`,
    },
    sidebarTitle: {
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: 700,
      color: '#000000',
      lineHeight: 1.2,
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      letterSpacing: '-0.01em',
    },
    topicItem: {
      margin: 0,
      borderBottom: '1px solid rgba(42, 40, 40, 0.39)',
    },
    topicHeader: (isOpen) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '10px 12px' : '12px 16px',
      cursor: 'pointer',
      fontWeight: isOpen ? 700 : 600,
      fontSize: isMobile ? '11px' : '12px',
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      color: isOpen ? SIDEBAR.textLight : SIDEBAR.textMuted,
      background: isOpen ? '#252b32' : 'transparent',
      borderRadius: 0,
      borderTop: '1px solid rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(0,0,0,0.25)',
      transition: 'background 0.2s ease',
      borderLeft: isOpen ? `3px solid ${SIDEBAR.accent}` : '3px solid transparent',
    }),
    subtopicItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '6px' : '8px',
      padding: isMobile ? '6px 8px 6px 16px' : '8px 12px 8px 28px',
      cursor: 'pointer',
      fontSize: isMobile ? '12px' : '13px',
      fontWeight: isActive ? '600' : '400',
      color: isActive ? '#FFFFFF' : SIDEBAR.textMuted,
      background: isActive ? '#000000' : 'transparent',
      transition: 'all 0.2s ease',
      borderLeft: isActive ? `3px solid ${SIDEBAR.accent}` : '3px solid transparent',
      borderRadius: '3px',
      margin: '0px 0',
    }),
    contentTypeItem: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '6px' : '8px',
      padding: isMobile ? '4px 8px 4px 28px' : '5px 12px 5px 46px',
      fontSize: isMobile ? '11px' : '12px',
      cursor: 'pointer',
      color: isActive ? '#714b67' : SIDEBAR.textMuted,
      background: isActive ? '#000000' : 'transparent',
      transition: 'all 0.2s ease',
      fontWeight: isActive ? 600 : 400,
      borderLeft: isActive ? `3px solid ${SIDEBAR.accent}` : '3px solid transparent',
      borderRadius: '3px',
      margin: '0px 0',
    }),
    mainContent: {
      flex: 1,
      minWidth: 0,
      background: 'linear-gradient(180deg, #e8ecf0 0%, #d5dadd 100%)',
      display: 'flex',
      flexDirection: 'column',
    },
    contentPanel: {
      flex: 1,
      background: 'transparent',
      borderRadius: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: 'none',
      boxShadow: 'none',
    },
    contentBody: {
      flex: 1,
      overflow: 'hidden',
      padding: 0,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
    },
    mobileOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 999,
      display: isMobile && showSidebar ? 'block' : 'none',
    },
  };

  const preventCopy = (e) => {
    e.preventDefault();
    return false;
  };

  return (
    <div style={styles.page}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        * { 
          -webkit-touch-callout: none !important; 
          -webkit-user-select: none !important; 
          user-select: none !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }
        input, textarea, select { 
          -webkit-user-select: auto !important; 
          user-select: auto !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }
        body { 
          overscroll-behavior: none; 
          touch-action: pan-y; 
          margin: 0; 
          padding: 0; 
          background: #d5dadd;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }
        .odoo-content { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }
        .odoo-content * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

        #mobile-sidebar::-webkit-scrollbar {
          width: 0;
          display: none;
        }
        #mobile-sidebar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .action-btn:hover {
          background: ${TOPBAR.bgHover};
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .action-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }

        .sidebar-item:hover {
          background: #000000 !important;
          color: #FFFFFF !important;
        }
        .sidebar-item-active {
          background: #000000 !important;
          color: #FFFFFF !important;
        }
        .sidebar-item-active:hover {
          background: #000000 !important;
          color: #FFFFFF !important;
        }

        /* ✅ Prevent image saving */
        img {
          -webkit-user-drag: none !important;
          user-drag: none !important;
          pointer-events: none !important;
          -webkit-touch-callout: none !important;
        }
        
        /* ✅ Hide context menu on images */
        img {
          -webkit-touch-callout: none !important;
        }

        @media (max-width: 768px) {
          .action-btn span { display: none; }
          .action-btn { padding: 0 12px !important; }
        }
        @media (min-width: 769px) {
          .action-btn-mobile-text { display: none; }
        }
      `}</style>

      {/* ─── TOP NAVIGATION BAR ────────────────────────────────── */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <button
            onClick={toggleSidebar}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '4px' : '8px',
              padding: isMobile ? '0 10px' : '0 16px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 700,
              color: TOPBAR.text,
              cursor: 'pointer',
              transition: 'background 0.15s, transform 0.15s',
              background: TOPBAR.lessonsColor,
              border: 'none',
              borderRight: `1px solid ${TOPBAR.border}`,
              height: '100%',
              textTransform: 'none',
              letterSpacing: '0.5px',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.lessonsColor;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <MenuIcon style={{ color: '#FFFFFF', fontSize: isMobile ? '20px' : '24px' }} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Lessons</span>
          </button>

          <button
            onClick={handleBackClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '4px' : '8px',
              padding: isMobile ? '0 10px' : '0 16px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: 600,
              color: TOPBAR.text,
              cursor: 'pointer',
              transition: 'background 0.15s, transform 0.15s',
              background: 'transparent',
              border: 'none',
              borderRight: `1px solid ${TOPBAR.border}`,
              height: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: isMobile ? '16px' : '18px' }}>←</span>
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Back</span>
          </button>
        </div>

        <div style={styles.topBarRight}>
          <button
            onClick={handleShare}
            className="action-btn"
            style={styles.actionButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.bgActive;
            }}
          >
            <ShareIcon style={{ fontSize: isMobile ? '18px' : '20px' }} />
            <span>Share</span>
          </button>

          <button
            onClick={handleFullscreen}
            className="action-btn"
            style={styles.actionButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.bgActive;
            }}
          >
            {isFullscreen ? (
              <>
                <FullscreenExitIcon style={{ fontSize: isMobile ? '18px' : '20px' }} />
                <span>Exit</span>
              </>
            ) : (
              <>
                <FullscreenIcon style={{ fontSize: isMobile ? '18px' : '20px' }} />
                <span>Full</span>
              </>
            )}
          </button>

          <button
            onClick={handleHomeClick}
            className="action-btn"
            style={{
              ...styles.actionButton,
              color: '#FFFFFF',
              fontWeight: 700,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.bgActive;
            }}
          >
            <HomeOutlinedIcon style={{ fontSize: isMobile ? '18px' : '20px' }} />
            <span>Home</span>
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="action-btn"
              style={{
                ...styles.actionButton,
                color: '#ff6b6b',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TOPBAR.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = TOPBAR.bgActive;
              }}
            >
              <LogoutIcon style={{ fontSize: isMobile ? '18px' : '20px' }} />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="action-btn"
              style={{
                ...styles.actionButton,
                color: '#F7C948',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TOPBAR.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = TOPBAR.bgActive;
              }}
            >
              <LoginIcon style={{ fontSize: isMobile ? '18px' : '20px' }} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {activeView === 'split' && (
        <div style={styles.shell}>
          {/* ─── Mobile Overlay ────────────────────────────────────── */}
          {isMobile && showSidebar && (
            <div 
              style={styles.mobileOverlay} 
              onClick={handleOverlayClick}
            />
          )}

          {/* ─── Sidebar ──────────────────────────────────────────────── */}
          {(!isSidebarCollapsed || isMobile) && (
            <aside 
              id="mobile-sidebar" 
              style={{ 
                ...styles.sidebar, 
                ...(isMobile && showSidebar ? styles.sidebarOpen : {}),
                left: isMobile && !showSidebar ? '-100%' : (isMobile ? '0' : 'auto')
              }}
            >
              <div style={styles.sidebarHeader}>
                <div style={styles.sidebarTitle}>
                  {selectedCourse?.title || 'Course'}
                </div>
              </div>

              <div style={{ padding: isMobile ? '8px 10px' : '10px 12px' }}>
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '10px 12px' : '12px 14px',
                    borderRadius: '12px',
                    border: `1px solid ${SIDEBAR.border}`,
                    background: 'rgba(255,255,255,0.05)',
                    fontSize: isMobile ? '13px' : '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                    color: SIDEBAR.text,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = SIDEBAR.accent;
                    e.target.style.boxShadow = `0 0 0 3px rgba(113, 75, 103, 0.15)`;
                    e.target.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = SIDEBAR.border;
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                  }}
                />
              </div>

              {/* Sidebar rendering */}
              <div>
                {filteredTopics.map((topic, topicIndex) => {
                  const topicSubs = topic.subTopics || topic.subtopics || [];
                  const isOpen = !!expandedTopics[topic.id];
                  const locked = isTopicLocked(topic.id, topicIndex);
                  
                  return (
                    <div key={topic.id} style={styles.topicItem}>
                      <div 
                        style={styles.topicHeader(isOpen)}
                        onClick={() => toggleTopic(topic.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = SIDEBAR.hover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isOpen ? SIDEBAR.itemOpen : 'transparent';
                        }}
                      >
                        <span style={{ fontSize: isMobile ? '10px' : '12px' }}>{topic.title}</span>
                        <span style={{ fontSize: isMobile ? '8px' : '10px' }}>
                          {isOpen ? '▼' : '▶'}
                        </span>
                      </div>
                      {isOpen && topicSubs.map((sub) => {
                        const globalIndex = subtopics.findIndex((s) => String(s.id) === String(sub.id));
                        if (globalIndex === -1) return null;
                        
                        const isActive = currentActiveSection === globalIndex;
                        const subtopicLocked = locked || (isPreview && topic.isFirstTopic !== true);
                        
                        const subHasVideo = hasVideoContent(sub);
                        const subHasNotes = hasNotesContent(sub);
                        const subHasExam = !!(sub.examContent && sub.examContent.trim() !== '');
                        const subHasInterview = !!(sub.interviewContent && sub.interviewContent.trim() !== '');
                        
                        const subAvailableTypes = [];
                        if (subHasVideo) subAvailableTypes.push('video');
                        if (subHasNotes) subAvailableTypes.push('notes');
                        if (subHasExam) subAvailableTypes.push('exam-content');
                        if (subHasInterview) subAvailableTypes.push('interview-content');
                        
                        if (isActive) {
                          if (interviewQuestions.length > 0) subAvailableTypes.push('interview');
                          if (examQuestions.length > 0) subAvailableTypes.push('exam');
                          if (labs.length > 0) subAvailableTypes.push('labs');
                        }
                        
                        subAvailableTypes.sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));
                        
                        const hasAnyContentForSub = subHasVideo || subHasNotes || subHasExam || subHasInterview;
                        
                        return (
                          <div key={sub.id}>
                            <div 
                              style={{
                                ...styles.subtopicItem(isActive),
                                opacity: subtopicLocked ? 0.5 : 1,
                                cursor: subtopicLocked ? 'not-allowed' : 'pointer',
                              }}
                              className={isActive ? 'sidebar-item-active' : 'sidebar-item'}
                              onClick={() => {
                                if (subtopicLocked) {
                                  if (isAuthenticated && !isEnrolled) {
                                    promptEnrollForLockedContent();
                                  } else {
                                    promptLoginForLockedContent();
                                  }
                                  return;
                                }
                                selectSubtopic(sub, globalIndex, topic.id, topicIndex);
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive && !subtopicLocked) {
                                  e.currentTarget.style.color = '#FFFFFF';
                                  e.currentTarget.style.background = '#000000';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive && !subtopicLocked) {
                                  e.currentTarget.style.color = SIDEBAR.textMuted;
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px', flex: 1, minWidth: 0 }}>
                                {subtopicLocked ? (
                                  <LockIcon style={{ fontSize: isMobile ? '12px' : '14px', color: SIDEBAR.textMuted, flexShrink: 0 }} />
                                ) : (
<div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px', flexShrink: 0 }}>
  {(subHasVideo || subHasNotes) ? (
    <FlagIcon style={{ fontSize: isMobile ? '16px' : '18px', color: '#FFC107' }} />
  ) : !subtopicLocked ? (
    <span style={{ fontSize: isMobile ? '10px' : '11px', color: SIDEBAR.textMuted }}>●</span>
  ) : null}
</div>
                                )}
                                <span style={{ flex: 1, wordBreak: 'break-word', fontSize: isMobile ? '12px' : '13px' }}>{sub.title}</span>
                                {subtopicLocked && (
                                  <LockIcon style={{ fontSize: isMobile ? '12px' : '14px', color: SIDEBAR.textMuted, flexShrink: 0 }} />
                                )}
                              </div>
                            </div>
                            
                            {/* Content type tabs for selected subtopic */}
                            {isActive && !subtopicLocked && (
                              <div style={{ marginLeft: isMobile ? '8px' : '16px' }}>
                                {loadingData ? (
                                  <div style={{ padding: '4px 8px 4px 16px', fontSize: isMobile ? '10px' : '11px', color: SIDEBAR.textMuted }}>Loading…</div>
                                ) : (
                                  CONTENT_TYPES.filter((t) => subAvailableTypes.includes(t.key)).map((t) => {
                                    const isActiveType = activeContentType === t.key;
                                    
                                    return (
                                      <div
                                        key={t.key}
                                        style={{
                                          ...styles.contentTypeItem(isActiveType),
                                        }}
                                        className={isActiveType ? 'sidebar-item-active' : 'sidebar-item'}
                                        onClick={() => setActiveContentType(t.key)}
                                        onMouseEnter={(e) => {
                                          if (!isActiveType) {
                                            e.currentTarget.style.color = '#FFFFFF';
                                            e.currentTarget.style.background = '#000000';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isActiveType) {
                                            e.currentTarget.style.color = SIDEBAR.textMuted;
                                            e.currentTarget.style.background = 'transparent';
                                          }
                                        }}
                                      >
                                        <span style={{ fontSize: isMobile ? '11px' : '12px', width: '16px', textAlign: 'center' }}>{t.icon}</span>
                                        <span style={{ fontSize: isMobile ? '10px' : '12px' }}>{t.label}</span>
                                      </div>
                                    );
                                  })
                                )}
                                {!loadingData && subAvailableTypes.length === 0 && (
                                  <div style={{ padding: '4px 8px 4px 16px', fontSize: isMobile ? '10px' : '11px', color: SIDEBAR.textMuted }}>No content</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {filteredTopics.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: SIDEBAR.textMuted, fontSize: isMobile ? '12px' : '13px' }}>
                    No topics match your search.
                  </div>
                )}
              </div>
            </aside>
          )}

          <main style={styles.mainContent}>
            <div style={styles.contentPanel}>
              <div
                style={styles.contentBody}
                className="fade-in"
                onCopy={preventCopy}
                onCut={preventCopy}
                onContextMenu={preventCopy}
                onSelectStart={preventCopy}
              >
                {renderPanelContent()}
              </div>
            </div>
          </main>
        </div>
      )}

      {activeView === 'gallery' && (
        <div style={{ background: LIGHT.surface, borderRadius: '16px', padding: isMobile ? '12px' : '20px', margin: isMobile ? '8px 12px' : '16px 24px', border: `1px solid ${LIGHT.border}` }}>
          <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 700, marginBottom: isMobile ? '12px' : '16px', color: LIGHT.textLight }}>📸 All Course Images ({images.length})</h2>
          {images.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: LIGHT.textMuted }}>No images yet</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? '8px' : '16px' }}>
              {images.map((img) => {
                const safeId = img.subTopicId || img.subtopicId;
                if (!safeId) return null;
                const imageUrl = authImageUrls[img.id] || `/admin/uploads/subtopic_${safeId}/images/${img.fileName}`;
                return (
                  <div
                    key={img.id}
                    style={{
                      border: `1px solid ${LIGHT.border}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'default',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      background: LIGHT.surface,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`Page ${img.pageNumber}`}
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        WebkitUserDrag: 'none',
                        userDrag: 'none',
                      }}
                      onError={() => handleImageError?.(img.id)}
                      loading="lazy"
                      draggable="false"
                    />
                    <div style={{ padding: isMobile ? '4px 8px' : '8px 12px', fontSize: isMobile ? '10px' : '12px', textAlign: 'center', background: LIGHT.bg, color: LIGHT.textMuted }}>
                      Page {img.pageNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}