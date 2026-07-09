// src/components/Admin/CourseEnrollmentEditorTab.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// ─── Design tokens ─────────────────────────────────────────────────────
const COLORS = {
  plumDark: '#3B2340',
  plumMid: '#5B3A63',
  plumLight: '#83698A',
  accent: '#714B67',
  ink: '#1F1B24',
  slate: '#6B6470',
  line: '#E8E3EA',
  paper: '#FFFFFF',
  canvas: '#FAF9FB',
  success: '#2E8B57',
  gold: '#E8B84B',
  error: '#DC3545',
};

// ─── Default Configuration ──────────────────────────────────────────
const DEFAULT_ENROLLMENT_CONFIG = {
  // Top Navigation
  backButtonText: '← Back to Courses',
  
  // Breadcrumb
  breadcrumbItems: ['Courses', 'Getting Started'],
  
  // Course Header
  courseTitle: 'ccna-302',
  courseSubtitle: 'xhjxx',
  rating: 4.8,
  reviewCount: 1247,
  ratingStars: '★★★★★',
  
  // Meta Info
  lastUpdateLabel: 'Last Update',
  durationLabel: 'Completion',
  membersLabel: 'Members',
  lastUpdateValue: '7/9/2026',
  durationValue: '3-5 hours',
  
  // Tabs
  overviewTabText: 'Overview',
  
  // Course Description
  descriptionTitle: 'Course Description',
  descriptionText: 'xhjxx',
  
  // Lessons Section
  lessonsTitle: 'Lessons · {count} lessons',
  noLessonsText: 'No lessons available yet',
  
  // Join Course Card
  joinCardTitle: 'JOIN THIS COURSE',
  joinButtonText: 'JOIN THIS COURSE',
  startLearningButtonText: '🚀 Start Learning',
  shareButtonText: 'Share this course',
  loginRequiredText: '🔒 Login required to enroll',
  enrollingText: 'Enrolling...',
  
  // Course Information Card
  infoCardTitle: 'Course Information',
  infoLastUpdateLabel: 'Last Update',
  infoCompletionLabel: 'Completion',
  infoMembersLabel: 'Members',
  infoLevelLabel: 'Level',
  infoLanguageLabel: 'Language',
  infoCertificateLabel: 'Certificate',
  levelValue: 'Intermediate',
  languageValue: 'English',
  certificateValue: 'Yes',
  
  // Enrolled Badge
  enrolledBadgeText: '✓ Enrolled',
  
  // Colors
  primaryColor: COLORS.accent,
  primaryDark: COLORS.plumDark,
  primaryLight: COLORS.plumLight,
  successColor: COLORS.success,
  goldColor: COLORS.gold,
  
  // Login Modal
  loginModalTitle: 'Login Required',
  loginModalText: 'You need to be logged in to enroll in this course. Please login or create an account to continue.',
  loginModalCancelText: 'Cancel',
  loginModalConfirmText: 'Login Now',
};

// ─── Storage Key ────────────────────────────────────────────────────
const STORAGE_KEY = 'courseEnrollmentConfig';

// ─── Helper Functions ──────────────────────────────────────────────
const getEnrollmentConfig = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_ENROLLMENT_CONFIG, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_ENROLLMENT_CONFIG;
    }
  }
  return DEFAULT_ENROLLMENT_CONFIG;
};

const saveEnrollmentConfig = (config) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// ─── Color Picker Component ──────────────────────────────────────────
const ColorPicker = ({ label, value, onChange, description }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
      {label}
    </label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '48px',
          height: '48px',
          padding: '2px',
          borderRadius: '8px',
          border: '2px solid var(--border-light)',
          cursor: 'pointer',
          background: 'transparent',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
          fontSize: '13px',
          fontFamily: 'monospace',
          background: 'var(--bg-base)',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
      />
    </div>
    {description && (
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{description}</p>
    )}
  </div>
);

// ─── Text Input Component ──────────────────────────────────────────
const TextInput = ({ label, value, onChange, placeholder, type = 'text', description, rows = 1 }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
      {label}
    </label>
    {rows > 1 ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
          fontSize: '13px',
          background: 'var(--bg-base)',
          color: 'var(--text-primary)',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
          fontSize: '13px',
          background: 'var(--bg-base)',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
      />
    )}
    {description && (
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{description}</p>
    )}
  </div>
);

// ─── Section Component ──────────────────────────────────────────────
const Section = ({ title, description, children }) => (
  <div style={{
    background: 'var(--surface)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--border-light)',
    marginBottom: '20px',
  }}>
    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
      {title}
    </h3>
    {description && (
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{description}</p>
    )}
    {children}
  </div>
);

// ─── Preview Component ──────────────────────────────────────────────
const PreviewCard = ({ config }) => {
  const isMobile = window.innerWidth < 768;

  const previewStyles = {
    container: {
      background: COLORS.canvas,
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      border: '1px solid var(--border-light)',
      maxWidth: '100%',
    },
    topNav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: `1px solid ${COLORS.line}`,
      marginBottom: '16px',
    },
    backLink: {
      color: COLORS.slate,
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
    },
    breadcrumb: {
      fontSize: '12px',
      color: COLORS.slate,
      marginBottom: '12px',
      display: 'flex',
      gap: '8px',
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
      gap: '20px',
    },
    joinCard: {
      background: `linear-gradient(135deg, ${config.primaryColor}, ${config.primaryDark})`,
      borderRadius: '12px',
      padding: '20px',
      color: '#fff',
    },
    joinCardTitle: {
      fontSize: '14px',
      fontWeight: 700,
      opacity: 0.9,
      marginBottom: '4px',
    },
    joinCardPrice: {
      fontSize: '28px',
      fontWeight: 800,
      marginBottom: '12px',
    },
    joinBtn: {
      width: '100%',
      padding: '12px',
      background: '#fff',
      color: config.primaryColor,
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
    },
    infoCard: {
      background: COLORS.paper,
      borderRadius: '12px',
      padding: '16px',
      border: `1px solid ${COLORS.line}`,
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: `1px solid ${COLORS.line}`,
      fontSize: '12px',
    },
    courseHeader: {
      background: COLORS.paper,
      borderRadius: '12px',
      padding: '16px',
      border: `1px solid ${COLORS.line}`,
    },
    courseTitle: {
      fontSize: '20px',
      fontWeight: 800,
      color: COLORS.ink,
      marginBottom: '2px',
    },
    courseSubtitle: {
      fontSize: '14px',
      color: COLORS.slate,
      marginBottom: '6px',
    },
    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: COLORS.slate,
    },
    stars: {
      color: config.goldColor,
      fontSize: '14px',
    },
    metaRow: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      fontSize: '12px',
      color: COLORS.slate,
      paddingTop: '6px',
      borderTop: `1px solid ${COLORS.line}`,
      marginTop: '6px',
    },
    lessonsSection: {
      background: COLORS.paper,
      borderRadius: '12px',
      padding: '16px',
      border: `1px solid ${COLORS.line}`,
      marginTop: '12px',
    },
    lessonItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '6px 0',
      borderBottom: `1px solid ${COLORS.line}`,
      fontSize: '12px',
      color: COLORS.slate,
    },
    lessonCheckbox: {
      width: '16px',
      height: '16px',
      border: `2px solid ${COLORS.line}`,
      borderRadius: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    lessonPreview: {
      fontSize: '11px',
      color: config.primaryColor,
      fontWeight: 500,
    },
    lessonXP: {
      fontSize: '11px',
      color: COLORS.slate,
      fontWeight: 500,
    },
  };

  return (
    <div style={previewStyles.container}>
      <div style={previewStyles.topNav}>
        <span style={previewStyles.backLink}>{config.backButtonText}</span>
      </div>

      <div style={previewStyles.breadcrumb}>
        {config.breadcrumbItems.map((item, idx) => (
          <React.Fragment key={idx}>
            <span>{item}</span>
            {idx < config.breadcrumbItems.length - 1 && <span>/</span>}
          </React.Fragment>
        ))}
      </div>

      <div style={previewStyles.mainLayout}>
        {/* Left Column - Join Card */}
        <div>
          <div style={previewStyles.joinCard}>
            <div style={previewStyles.joinCardTitle}>{config.joinCardTitle}</div>
            <div style={previewStyles.joinCardPrice}>$2344</div>
            <button style={previewStyles.joinBtn}>{config.joinButtonText}</button>
          </div>

          <div style={{ ...previewStyles.infoCard, marginTop: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: COLORS.ink }}>
              {config.infoCardTitle}
            </h4>
            <div style={previewStyles.infoRow}>
              <span>{config.infoLastUpdateLabel}</span>
              <span>{config.lastUpdateValue}</span>
            </div>
            <div style={previewStyles.infoRow}>
              <span>{config.infoCompletionLabel}</span>
              <span>{config.durationValue}</span>
            </div>
            <div style={previewStyles.infoRow}>
              <span>{config.infoMembersLabel}</span>
              <span>0</span>
            </div>
            <div style={previewStyles.infoRow}>
              <span>{config.infoLevelLabel}</span>
              <span>{config.levelValue}</span>
            </div>
            <div style={previewStyles.infoRow}>
              <span>{config.infoLanguageLabel}</span>
              <span>{config.languageValue}</span>
            </div>
            <div style={previewStyles.infoRow}>
              <span>{config.infoCertificateLabel}</span>
              <span>{config.certificateValue}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Course Content */}
        <div>
          <div style={previewStyles.courseHeader}>
            <h1 style={previewStyles.courseTitle}>{config.courseTitle}</h1>
            <div style={previewStyles.courseSubtitle}>{config.courseSubtitle}</div>
            <div style={previewStyles.ratingRow}>
              <span style={previewStyles.stars}>{config.ratingStars}</span>
              <span>{config.rating} ({config.reviewCount} reviews)</span>
            </div>
            <div style={previewStyles.metaRow}>
              <span>📅 {config.lastUpdateLabel} {config.lastUpdateValue}</span>
              <span>⏰ {config.durationLabel} {config.durationValue}</span>
              <span>👥 {config.membersLabel} 0</span>
            </div>
          </div>

          <div style={previewStyles.lessonsSection}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: COLORS.ink }}>
              {config.lessonsTitle.replace('{count}', '1')}
            </h3>
            <div style={previewStyles.lessonItem}>
              <span style={previewStyles.lessonCheckbox}></span>
              <span style={{ flex: 1 }}>SUBTOPIC1</span>
              <span style={previewStyles.lessonPreview}>Preview</span>
              <span style={previewStyles.lessonXP}>40 XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Editor Component ──────────────────────────────────────────
export default function CourseEnrollmentEditorTab() {
  const [config, setConfig] = useState(DEFAULT_ENROLLMENT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = getEnrollmentConfig();
    setConfig(saved);
  }, []);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveEnrollmentConfig(config);
    setHasChanges(false);
    Swal.fire({
      title: 'Saved!',
      text: 'Course enrollment page configuration has been saved.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: 'Reset to Default?',
      text: 'This will restore all default values. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reset',
      confirmButtonColor: '#dc2626',
    });

    if (result.isConfirmed) {
      setConfig(DEFAULT_ENROLLMENT_CONFIG);
      saveEnrollmentConfig(DEFAULT_ENROLLMENT_CONFIG);
      setHasChanges(false);
      Swal.fire({
        title: 'Reset!',
        text: 'Configuration has been reset to default.',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            📄 Course Enrollment Page Editor
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Customize all text, colors, and content on the course enrollment page
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: '#dc2626',
              border: '1px solid #dc2626',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              padding: '10px 28px',
              background: hasChanges ? 'var(--primary)' : '#94a3b8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {hasChanges ? '💾 Save Changes' : 'Saved'}
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : '1fr 1fr',
        gap: '24px',
      }}>
        {/* Left Column - Editor */}
        <div>
          {/* Top Navigation Section */}
          <Section title="🔝 Top Navigation" description="Customize the back button and breadcrumb">
            <TextInput
              label="Back Button Text"
              value={config.backButtonText}
              onChange={(v) => updateConfig('backButtonText', v)}
              placeholder="← Back to Courses"
            />
            <TextInput
              label="Breadcrumb Items (comma separated)"
              value={config.breadcrumbItems.join(', ')}
              onChange={(v) => updateConfig('breadcrumbItems', v.split(',').map(s => s.trim()))}
              placeholder="Courses, Getting Started"
              description="Separate items with commas"
            />
          </Section>

          {/* Course Header Section */}
          <Section title="📚 Course Header" description="Customize the course title, subtitle, and rating">
            <TextInput
              label="Course Title"
              value={config.courseTitle}
              onChange={(v) => updateConfig('courseTitle', v)}
              placeholder="ccna-302"
            />
            <TextInput
              label="Course Subtitle"
              value={config.courseSubtitle}
              onChange={(v) => updateConfig('courseSubtitle', v)}
              placeholder="xhjxx"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Rating"
                value={config.rating}
                onChange={(v) => updateConfig('rating', parseFloat(v) || 0)}
                placeholder="4.8"
                type="number"
              />
              <TextInput
                label="Review Count"
                value={config.reviewCount}
                onChange={(v) => updateConfig('reviewCount', parseInt(v) || 0)}
                placeholder="1247"
                type="number"
              />
            </div>
            <TextInput
              label="Rating Stars"
              value={config.ratingStars}
              onChange={(v) => updateConfig('ratingStars', v)}
              placeholder="★★★★★"
            />
          </Section>

          {/* Meta Info Section */}
          <Section title="📊 Meta Information" description="Customize labels and values for course metadata">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Last Update Label"
                value={config.lastUpdateLabel}
                onChange={(v) => updateConfig('lastUpdateLabel', v)}
                placeholder="Last Update"
              />
              <TextInput
                label="Last Update Value"
                value={config.lastUpdateValue}
                onChange={(v) => updateConfig('lastUpdateValue', v)}
                placeholder="7/9/2026"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Duration Label"
                value={config.durationLabel}
                onChange={(v) => updateConfig('durationLabel', v)}
                placeholder="Completion"
              />
              <TextInput
                label="Duration Value"
                value={config.durationValue}
                onChange={(v) => updateConfig('durationValue', v)}
                placeholder="3-5 hours"
              />
            </div>
            <TextInput
              label="Members Label"
              value={config.membersLabel}
              onChange={(v) => updateConfig('membersLabel', v)}
              placeholder="Members"
            />
          </Section>

          {/* Join Card Section */}
          <Section title="💳 Join Course Card" description="Customize the enrollment card on the left side">
            <TextInput
              label="Join Card Title"
              value={config.joinCardTitle}
              onChange={(v) => updateConfig('joinCardTitle', v)}
              placeholder="JOIN THIS COURSE"
            />
            <TextInput
              label="Join Button Text"
              value={config.joinButtonText}
              onChange={(v) => updateConfig('joinButtonText', v)}
              placeholder="JOIN THIS COURSE"
            />
            <TextInput
              label="Start Learning Button Text"
              value={config.startLearningButtonText}
              onChange={(v) => updateConfig('startLearningButtonText', v)}
              placeholder="🚀 Start Learning"
            />
            <TextInput
              label="Share Button Text"
              value={config.shareButtonText}
              onChange={(v) => updateConfig('shareButtonText', v)}
              placeholder="Share this course"
            />
            <TextInput
              label="Login Required Text"
              value={config.loginRequiredText}
              onChange={(v) => updateConfig('loginRequiredText', v)}
              placeholder="🔒 Login required to enroll"
            />
          </Section>

          {/* Course Info Card Section */}
          <Section title="ℹ️ Course Information Card" description="Customize the information card labels">
            <TextInput
              label="Info Card Title"
              value={config.infoCardTitle}
              onChange={(v) => updateConfig('infoCardTitle', v)}
              placeholder="Course Information"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Last Update Label"
                value={config.infoLastUpdateLabel}
                onChange={(v) => updateConfig('infoLastUpdateLabel', v)}
                placeholder="Last Update"
              />
              <TextInput
                label="Completion Label"
                value={config.infoCompletionLabel}
                onChange={(v) => updateConfig('infoCompletionLabel', v)}
                placeholder="Completion"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Members Label"
                value={config.infoMembersLabel}
                onChange={(v) => updateConfig('infoMembersLabel', v)}
                placeholder="Members"
              />
              <TextInput
                label="Level Label"
                value={config.infoLevelLabel}
                onChange={(v) => updateConfig('infoLevelLabel', v)}
                placeholder="Level"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Language Label"
                value={config.infoLanguageLabel}
                onChange={(v) => updateConfig('infoLanguageLabel', v)}
                placeholder="Language"
              />
              <TextInput
                label="Certificate Label"
                value={config.infoCertificateLabel}
                onChange={(v) => updateConfig('infoCertificateLabel', v)}
                placeholder="Certificate"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Level Value"
                value={config.levelValue}
                onChange={(v) => updateConfig('levelValue', v)}
                placeholder="Intermediate"
              />
              <TextInput
                label="Language Value"
                value={config.languageValue}
                onChange={(v) => updateConfig('languageValue', v)}
                placeholder="English"
              />
            </div>
            <TextInput
              label="Certificate Value"
              value={config.certificateValue}
              onChange={(v) => updateConfig('certificateValue', v)}
              placeholder="Yes"
            />
          </Section>

          {/* Lessons Section */}
          <Section title="📖 Lessons Section" description="Customize the lessons display text">
            <TextInput
              label="Lessons Title"
              value={config.lessonsTitle}
              onChange={(v) => updateConfig('lessonsTitle', v)}
              placeholder="Lessons · {count} lessons"
              description="Use {count} to display the number of lessons"
            />
            <TextInput
              label="No Lessons Text"
              value={config.noLessonsText}
              onChange={(v) => updateConfig('noLessonsText', v)}
              placeholder="No lessons available yet"
            />
          </Section>

          {/* Colors Section */}
          <Section title="🎨 Colors" description="Customize the color scheme">
            <ColorPicker
              label="Primary Color"
              value={config.primaryColor}
              onChange={(v) => updateConfig('primaryColor', v)}
              description="Used for buttons, accents, and highlights"
            />
            <ColorPicker
              label="Primary Dark"
              value={config.primaryDark}
              onChange={(v) => updateConfig('primaryDark', v)}
              description="Used for gradients and dark variants"
            />
            <ColorPicker
              label="Success Color"
              value={config.successColor}
              onChange={(v) => updateConfig('successColor', v)}
              description="Used for enrolled badges and completed items"
            />
            <ColorPicker
              label="Gold Color"
              value={config.goldColor}
              onChange={(v) => updateConfig('goldColor', v)}
              description="Used for star ratings"
            />
          </Section>

          {/* Login Modal Section */}
          <Section title="🔐 Login Modal" description="Customize the login modal text">
            <TextInput
              label="Modal Title"
              value={config.loginModalTitle}
              onChange={(v) => updateConfig('loginModalTitle', v)}
              placeholder="Login Required"
            />
            <TextInput
              label="Modal Text"
              value={config.loginModalText}
              onChange={(v) => updateConfig('loginModalText', v)}
              placeholder="You need to be logged in to enroll..."
              rows={3}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Cancel Button Text"
                value={config.loginModalCancelText}
                onChange={(v) => updateConfig('loginModalCancelText', v)}
                placeholder="Cancel"
              />
              <TextInput
                label="Confirm Button Text"
                value={config.loginModalConfirmText}
                onChange={(v) => updateConfig('loginModalConfirmText', v)}
                placeholder="Login Now"
              />
            </div>
          </Section>
        </div>

        {/* Right Column - Preview */}
        <div>
          <div style={{
            position: window.innerWidth >= 1024 ? 'sticky' : 'static',
            top: '20px',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              👁️ Live Preview
            </h3>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
            }}>
              Changes are reflected in real-time below
            </p>
            <PreviewCard config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}