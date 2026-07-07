// src/components/Admin/MyCoursesEditorTab.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { colors } from './AdminStyles';

// Default My Courses page configuration
const DEFAULT_MY_COURSES_CONFIG = {
  // Hero Section
  heroEyebrow: "Networking & Security Academy",
  heroTitle: "Knowledge is a superpower",
  heroText: "Level up your networking and security skills — from CCNA fundamentals to CCIE expert tracks. Your next certification starts here.",
  heroButtonText: "Pick a course →",
  heroBgStart: "#3B2340",
  heroBgMid: "#5B3A63",
  heroBgEnd: "#83698A",
  heroDecor: "🎓",
  
  // Section Bar
  sectionTitleMy: "My Courses",
  sectionTitleAll: "All Courses",
  myCoursesTabText: "My Courses",
  allCoursesTabText: "All Courses",
  searchPlaceholder: "Search courses...",
  
  // Course Card
  cardDurationLabel: "⏱",
  cardStepsLabel: "📋",
  cardStepsText: "steps",
  enrolledBadgeText: "Enrolled",
  viewCourseButtonText: "View Course",
  continueLearningButtonText: "Continue Learning",
  
  // Empty States
  emptyStateLoginTitle: "Login required",
  emptyStateLoginText: "Please log in to see your enrolled courses.",
  emptyStateLoginButton: "Go to Login",
  emptyStateNoCoursesTitle: "No courses yet",
  emptyStateNoCoursesText: "Enroll in a course to start learning.",
  emptyStateNoCoursesButton: "Browse All Courses",
  emptyStateNoAvailableTitle: "No courses available",
  emptyStateNoAvailableText: "Check back later for new courses.",
  
  // Footer
  footerText: "Click any course to view details — enrolled courses can be resumed anytime.",
  
  // Track Icons (for different course types)
  trackIcons: {
    ccna: "🌐",
    ccnp: "🚀",
    ccie: "🔐",
    security: "🛡️",
    linux: "🐧",
    python: "🐍",
    fortinet: "🧱",
    aws: "☁️",
    azure: "💠",
    devops: "⚡",
    default: "📄"
  },
  
  // Track Colors
  trackColors: {
    ccna: "#EAF6F1",
    ccnp: "#FDF3E7",
    ccie: "#FBEAEA",
    security: "#F1EAFB",
    linux: "#E7F6FA",
    python: "#EAF6EF",
    fortinet: "#EFF1FB",
    aws: "#E8F4FD",
    azure: "#E3F2FD",
    devops: "#FFF3E0",
    default: "#F2F1F6"
  }
};

export default function MyCoursesEditorTab({ onSave, initialConfig }) {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('myCoursesConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_MY_COURSES_CONFIG, ...parsed };
      } catch {
        return DEFAULT_MY_COURSES_CONFIG;
      }
    }
    return DEFAULT_MY_COURSES_CONFIG;
  });

  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    localStorage.setItem('myCoursesConfig', JSON.stringify(config));
    if (onSave) onSave(config);
  }, [config, onSave]);

  const updateConfig = (path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const resetToDefaults = async () => {
    const result = await Swal.fire({
      title: 'Reset to Defaults?',
      text: 'This will reset all My Courses page settings to default values.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reset',
      confirmButtonColor: colors.coral,
    });
    if (result.isConfirmed) {
      setConfig(DEFAULT_MY_COURSES_CONFIG);
      localStorage.setItem('myCoursesConfig', JSON.stringify(DEFAULT_MY_COURSES_CONFIG));
      Swal.fire('Reset!', 'My Courses page settings have been reset to defaults.', 'success');
    }
  };

  const tabs = [
    { id: 'hero', label: '🎯 Hero Section' },
    { id: 'section', label: '📋 Section Bar' },
    { id: 'cards', label: '🃏 Course Cards' },
    { id: 'empty', label: '📭 Empty States' },
    { id: 'footer', label: '📄 Footer' },
    { id: 'tracks', label: '🏷️ Track Icons' },
  ];

  const ColorPicker = ({ label, value, onChange, path }) => {
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="color"
            value={value.startsWith('#') ? value : '#4f46e5'}
            onChange={(e) => onChange(path, e.target.value)}
            style={{ width: 40, height: 40, padding: 2, border: '1px solid var(--border-light)', borderRadius: 6, cursor: 'pointer' }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            placeholder="#hex or gradient"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--border-light)',
              fontSize: 13,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <button
            onClick={() => {
              const defaultVal = DEFAULT_MY_COURSES_CONFIG[path.split('.').pop()] || '';
              onChange(path, defaultVal);
            }}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              background: 'var(--bg-base)',
              border: '1px solid var(--border-light)',
              borderRadius: 6,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>
    );
  };

  const renderHeroTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Hero Section Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Hero Eyebrow</label>
          <input
            type="text"
            value={config.heroEyebrow}
            onChange={(e) => updateConfig('heroEyebrow', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Hero Title</label>
          <input
            type="text"
            value={config.heroTitle}
            onChange={(e) => updateConfig('heroTitle', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Hero Text</label>
          <textarea
            value={config.heroText}
            onChange={(e) => updateConfig('heroText', e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Hero Button Text</label>
          <input
            type="text"
            value={config.heroButtonText}
            onChange={(e) => updateConfig('heroButtonText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Hero Decor Emoji</label>
          <input
            type="text"
            value={config.heroDecor}
            onChange={(e) => updateConfig('heroDecor', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 20,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <ColorPicker label="Hero Background Start" value={config.heroBgStart} onChange={updateConfig} path="heroBgStart" />
        <ColorPicker label="Hero Background Middle" value={config.heroBgMid} onChange={updateConfig} path="heroBgMid" />
        <ColorPicker label="Hero Background End" value={config.heroBgEnd} onChange={updateConfig} path="heroBgEnd" />
      </div>
    </div>
  );

  const renderSectionTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Section Bar Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>My Courses Title</label>
          <input
            type="text"
            value={config.sectionTitleMy}
            onChange={(e) => updateConfig('sectionTitleMy', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>All Courses Title</label>
          <input
            type="text"
            value={config.sectionTitleAll}
            onChange={(e) => updateConfig('sectionTitleAll', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>My Courses Tab Text</label>
          <input
            type="text"
            value={config.myCoursesTabText}
            onChange={(e) => updateConfig('myCoursesTabText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>All Courses Tab Text</label>
          <input
            type="text"
            value={config.allCoursesTabText}
            onChange={(e) => updateConfig('allCoursesTabText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Search Placeholder</label>
          <input
            type="text"
            value={config.searchPlaceholder}
            onChange={(e) => updateConfig('searchPlaceholder', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderCardsTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Course Card Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Duration Label</label>
          <input
            type="text"
            value={config.cardDurationLabel}
            onChange={(e) => updateConfig('cardDurationLabel', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Steps Label</label>
          <input
            type="text"
            value={config.cardStepsLabel}
            onChange={(e) => updateConfig('cardStepsLabel', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Steps Text</label>
          <input
            type="text"
            value={config.cardStepsText}
            onChange={(e) => updateConfig('cardStepsText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Enrolled Badge Text</label>
          <input
            type="text"
            value={config.enrolledBadgeText}
            onChange={(e) => updateConfig('enrolledBadgeText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>View Course Button Text</label>
          <input
            type="text"
            value={config.viewCourseButtonText}
            onChange={(e) => updateConfig('viewCourseButtonText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Continue Learning Button Text</label>
          <input
            type="text"
            value={config.continueLearningButtonText}
            onChange={(e) => updateConfig('continueLearningButtonText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderEmptyTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Empty States Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Login Required Title</label>
          <input
            type="text"
            value={config.emptyStateLoginTitle}
            onChange={(e) => updateConfig('emptyStateLoginTitle', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Login Required Text</label>
          <input
            type="text"
            value={config.emptyStateLoginText}
            onChange={(e) => updateConfig('emptyStateLoginText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Login Required Button</label>
          <input
            type="text"
            value={config.emptyStateLoginButton}
            onChange={(e) => updateConfig('emptyStateLoginButton', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>No Courses Title</label>
          <input
            type="text"
            value={config.emptyStateNoCoursesTitle}
            onChange={(e) => updateConfig('emptyStateNoCoursesTitle', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>No Courses Text</label>
          <input
            type="text"
            value={config.emptyStateNoCoursesText}
            onChange={(e) => updateConfig('emptyStateNoCoursesText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>No Courses Button</label>
          <input
            type="text"
            value={config.emptyStateNoCoursesButton}
            onChange={(e) => updateConfig('emptyStateNoCoursesButton', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>No Available Title</label>
          <input
            type="text"
            value={config.emptyStateNoAvailableTitle}
            onChange={(e) => updateConfig('emptyStateNoAvailableTitle', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>No Available Text</label>
          <input
            type="text"
            value={config.emptyStateNoAvailableText}
            onChange={(e) => updateConfig('emptyStateNoAvailableText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderFooterTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Footer Settings</h3>
      <div>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Footer Text</label>
        <textarea
          value={config.footerText}
          onChange={(e) => updateConfig('footerText', e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--border-light)',
            fontSize: 14,
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
            outline: 'none',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  );

  const renderTracksTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Track Icons & Colors</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        These icons and colors appear on course cards based on the course title.
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        {Object.entries(config.trackIcons).map(([key, value]) => (
          <div key={key} style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 1fr',
            gap: 10,
            padding: 10,
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Icon</label>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newIcons = { ...config.trackIcons, [key]: e.target.value };
                  updateConfig('trackIcons', newIcons);
                }}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border-light)',
                  fontSize: 18,
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={config.trackColors[key] || '#F2F1F6'}
                  onChange={(e) => {
                    const newColors = { ...config.trackColors, [key]: e.target.value };
                    updateConfig('trackColors', newColors);
                  }}
                  style={{ width: 32, height: 32, padding: 2, border: '1px solid var(--border-light)', borderRadius: 4, cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={config.trackColors[key] || '#F2F1F6'}
                  onChange={(e) => {
                    const newColors = { ...config.trackColors, [key]: e.target.value };
                    updateConfig('trackColors', newColors);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border-light)',
                    fontSize: 13,
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'hero': return renderHeroTab();
      case 'section': return renderSectionTab();
      case 'cards': return renderCardsTab();
      case 'empty': return renderEmptyTab();
      case 'footer': return renderFooterTab();
      case 'tracks': return renderTracksTab();
      default: return null;
    }
  };

  const editorTabs = [
    { id: 'hero', label: '🎯 Hero' },
    { id: 'section', label: '📋 Section' },
    { id: 'cards', label: '🃏 Cards' },
    { id: 'empty', label: '📭 Empty' },
    { id: 'footer', label: '📄 Footer' },
    { id: 'tracks', label: '🏷️ Tracks' },
  ];

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      background: 'var(--surface)',
      borderRadius: 16,
      border: '1px solid var(--border-light)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        background: 'var(--bg-base)',
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            📚 My Courses Page Editor
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Customize all text, icons, and content on the My Courses page
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={resetToDefaults}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}
          >
            🔄 Reset
          </button>
          <button
            onClick={() => {
              localStorage.setItem('myCoursesConfig', JSON.stringify(config));
              Swal.fire({
                title: 'Saved!',
                text: 'My Courses page configuration has been saved.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
              });
            }}
            style={{
              padding: '8px 20px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            💾 Save All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-light)',
        gap: 4,
        background: 'var(--bg-base)',
        flexWrap: 'nowrap',
      }}>
        {editorTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 600 : 400,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        {renderTabContent()}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 24px',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-base)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          ⚡ Changes are saved automatically to your browser
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          All changes apply to the My Courses page
        </span>
      </div>
    </div>
  );
}