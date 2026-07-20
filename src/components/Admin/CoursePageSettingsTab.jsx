// src/components/Admin/CoursePageSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  getAdminCoursePageSettings,
  updateCoursePageSettings,
  initializeCoursePageSettings,
} from '../../api/UserApi';
import { colors, LoadingSpinner } from './AdminStyles';

// ─── Material UI Icons ──────────────────────────────────────────────
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GridViewIcon from '@mui/icons-material/GridView';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AppsIcon from '@mui/icons-material/Apps';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

// ─── Section Icons Library ──────────────────────────────────────────
const SECTION_ICON_OPTIONS = [
  { value: 'grid', label: 'Grid View', icon: <GridViewIcon /> },
  { value: 'apps', label: 'Apps Grid', icon: <AppsIcon /> },
  { value: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { value: 'module', label: 'Module View', icon: <ViewModuleIcon /> },
  { value: 'list', label: 'List View', icon: <ViewListIcon /> },
  { value: 'carousel', label: 'Carousel', icon: <GridViewIcon /> },
  { value: 'quilt', label: 'Quilt View', icon: <GridViewIcon /> },
  { value: 'stream', label: 'Stream View', icon: <GridViewIcon /> },
  { value: 'agenda', label: 'Agenda View', icon: <GridViewIcon /> },
  { value: 'compact', label: 'Compact View', icon: <GridViewIcon /> },
  { value: 'day', label: 'Day View', icon: <GridViewIcon /> },
  { value: 'week', label: 'Week View', icon: <GridViewIcon /> },
];

// ─── Default Settings (fallback) ──────────────────────────────────
const DEFAULT_SETTINGS = {
  heroEyebrow: "Networking & Security Academy",
  heroTitle: "Knowledge is a superpower",
  heroText: "Level up your networking and security skills — from CCNA fundamentals to CCIE expert tracks. Your next certification starts here.",
  heroButtonText: "Pick a course →",
  heroBgStart: "#3B2340",
  heroBgMid: "#5B3A63",
  heroBgEnd: "#83698A",
  sectionTitleMy: "My Courses",
  sectionTitleAll: "All Courses",
  tabMyText: "My Courses",
  tabAllText: "All Courses",
  searchPlaceholder: "Search courses...",
  cardDurationLabel: "⏱",
  enrolledBadgeText: "Enrolled",
  viewCourseButtonText: "View Course",
  continueLearningButtonText: "Continue Learning",
  emptyStateLoginTitle: "Login to see your courses",
  emptyStateLoginText: "Sign in to view your enrolled courses and track progress.",
  emptyStateLoginButton: "Sign In",
  emptyStateNoCoursesTitle: "No courses yet",
  emptyStateNoCoursesText: "Browse all courses and enroll to start learning.",
  emptyStateNoCoursesButton: "Browse All Courses",
  emptyStateNoAvailableTitle: "No courses available",
  emptyStateNoAvailableText: "Check back later for new courses.",
  footerText: "Browse our course catalog. Sign in to enroll and track progress.",
  sectionIcon: "grid",
  trackIcons: '{"ccna":"🌐","ccnp":"🚀","ccie":"🔐","security":"🛡️","linux":"🐧","python":"🐍","fortinet":"🧱","aws":"☁️","azure":"💠","devops":"⚡","default":"📄"}',
  trackColors: '{"ccna":"#EAF6F1","ccnp":"#FDF3E7","ccie":"#FBEAEA","security":"#F1EAFB","linux":"#E7F6FA","python":"#EAF6EF","fortinet":"#EFF1FB","aws":"#E8F4FD","azure":"#E3F2FD","devops":"#FFF3E0","default":"#F2F1F6"}',
  // ─── Color Settings ──────────────────────────────────────────────
  heroBtnBg: "#4f46e5",
  heroBtnTextColor: "#ffffff",
  heroBtnHoverBg: "#4338ca",
  primaryColor: "#4f46e5",
  iconColor: "#714B67",
  tabActiveBg: "#714B67",
  tabActiveText: "#ffffff",
  tabInactiveText: "#6B6470",
  categoryActiveBg: "#714B67",
  categoryActiveText: "#ffffff",
  categoryBorderColor: "#E8E3EA",
  viewBtnBg: "#ffffff",
  viewBtnText: "#714B67",
  viewBtnBorder: "#714B67",
  continueBtnBg: "#714B67",
  continueBtnText: "#ffffff",
};

function CoursePageSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const parseSettingsFromApi = (apiData) => {
    if (!apiData) return DEFAULT_SETTINGS;
    const data = apiData.settings || apiData;
    return {
      heroEyebrow: data.heroEyebrow || DEFAULT_SETTINGS.heroEyebrow,
      heroTitle: data.heroTitle || DEFAULT_SETTINGS.heroTitle,
      heroText: data.heroText || DEFAULT_SETTINGS.heroText,
      heroButtonText: data.heroButtonText || DEFAULT_SETTINGS.heroButtonText,
      heroBgStart: data.heroBgStart || DEFAULT_SETTINGS.heroBgStart,
      heroBgMid: data.heroBgMid || DEFAULT_SETTINGS.heroBgMid,
      heroBgEnd: data.heroBgEnd || DEFAULT_SETTINGS.heroBgEnd,
      sectionTitleMy: data.sectionTitleMy || DEFAULT_SETTINGS.sectionTitleMy,
      sectionTitleAll: data.sectionTitleAll || DEFAULT_SETTINGS.sectionTitleAll,
      tabMyText: data.tabMyText || DEFAULT_SETTINGS.tabMyText,
      tabAllText: data.tabAllText || DEFAULT_SETTINGS.tabAllText,
      searchPlaceholder: data.searchPlaceholder || DEFAULT_SETTINGS.searchPlaceholder,
      cardDurationLabel: data.cardDurationLabel || DEFAULT_SETTINGS.cardDurationLabel,
      enrolledBadgeText: data.enrolledBadgeText || DEFAULT_SETTINGS.enrolledBadgeText,
      viewCourseButtonText: data.viewCourseButtonText || DEFAULT_SETTINGS.viewCourseButtonText,
      continueLearningButtonText: data.continueLearningButtonText || DEFAULT_SETTINGS.continueLearningButtonText,
      emptyStateLoginTitle: data.emptyStateLoginTitle || DEFAULT_SETTINGS.emptyStateLoginTitle,
      emptyStateLoginText: data.emptyStateLoginText || DEFAULT_SETTINGS.emptyStateLoginText,
      emptyStateLoginButton: data.emptyStateLoginButton || DEFAULT_SETTINGS.emptyStateLoginButton,
      emptyStateNoCoursesTitle: data.emptyStateNoCoursesTitle || DEFAULT_SETTINGS.emptyStateNoCoursesTitle,
      emptyStateNoCoursesText: data.emptyStateNoCoursesText || DEFAULT_SETTINGS.emptyStateNoCoursesText,
      emptyStateNoCoursesButton: data.emptyStateNoCoursesButton || DEFAULT_SETTINGS.emptyStateNoCoursesButton,
      emptyStateNoAvailableTitle: data.emptyStateNoAvailableTitle || DEFAULT_SETTINGS.emptyStateNoAvailableTitle,
      emptyStateNoAvailableText: data.emptyStateNoAvailableText || DEFAULT_SETTINGS.emptyStateNoAvailableText,
      footerText: data.footerText || DEFAULT_SETTINGS.footerText,
      sectionIcon: data.sectionIcon || DEFAULT_SETTINGS.sectionIcon,
      trackIcons: data.trackIcons || DEFAULT_SETTINGS.trackIcons,
      trackColors: data.trackColors || DEFAULT_SETTINGS.trackColors,
      // ─── Color Settings ──────────────────────────────────────────────
      heroBtnBg: data.heroBtnBg || DEFAULT_SETTINGS.heroBtnBg,
      heroBtnTextColor: data.heroBtnTextColor || DEFAULT_SETTINGS.heroBtnTextColor,
      heroBtnHoverBg: data.heroBtnHoverBg || DEFAULT_SETTINGS.heroBtnHoverBg,
      primaryColor: data.primaryColor || DEFAULT_SETTINGS.primaryColor,
      iconColor: data.iconColor || DEFAULT_SETTINGS.iconColor,
      tabActiveBg: data.tabActiveBg || DEFAULT_SETTINGS.tabActiveBg,
      tabActiveText: data.tabActiveText || DEFAULT_SETTINGS.tabActiveText,
      tabInactiveText: data.tabInactiveText || DEFAULT_SETTINGS.tabInactiveText,
      categoryActiveBg: data.categoryActiveBg || DEFAULT_SETTINGS.categoryActiveBg,
      categoryActiveText: data.categoryActiveText || DEFAULT_SETTINGS.categoryActiveText,
      categoryBorderColor: data.categoryBorderColor || DEFAULT_SETTINGS.categoryBorderColor,
      viewBtnBg: data.viewBtnBg || DEFAULT_SETTINGS.viewBtnBg,
      viewBtnText: data.viewBtnText || DEFAULT_SETTINGS.viewBtnText,
      viewBtnBorder: data.viewBtnBorder || DEFAULT_SETTINGS.viewBtnBorder,
      continueBtnBg: data.continueBtnBg || DEFAULT_SETTINGS.continueBtnBg,
      continueBtnText: data.continueBtnText || DEFAULT_SETTINGS.continueBtnText,
    };
  };

  const settingsToApiFormat = (settingsData) => {
    return {
      heroEyebrow: settingsData.heroEyebrow,
      heroTitle: settingsData.heroTitle,
      heroText: settingsData.heroText,
      heroButtonText: settingsData.heroButtonText,
      heroBgStart: settingsData.heroBgStart,
      heroBgMid: settingsData.heroBgMid,
      heroBgEnd: settingsData.heroBgEnd,
      sectionTitleMy: settingsData.sectionTitleMy,
      sectionTitleAll: settingsData.sectionTitleAll,
      tabMyText: settingsData.tabMyText,
      tabAllText: settingsData.tabAllText,
      searchPlaceholder: settingsData.searchPlaceholder,
      cardDurationLabel: settingsData.cardDurationLabel,
      enrolledBadgeText: settingsData.enrolledBadgeText,
      viewCourseButtonText: settingsData.viewCourseButtonText,
      continueLearningButtonText: settingsData.continueLearningButtonText,
      emptyStateLoginTitle: settingsData.emptyStateLoginTitle,
      emptyStateLoginText: settingsData.emptyStateLoginText,
      emptyStateLoginButton: settingsData.emptyStateLoginButton,
      emptyStateNoCoursesTitle: settingsData.emptyStateNoCoursesTitle,
      emptyStateNoCoursesText: settingsData.emptyStateNoCoursesText,
      emptyStateNoCoursesButton: settingsData.emptyStateNoCoursesButton,
      emptyStateNoAvailableTitle: settingsData.emptyStateNoAvailableTitle,
      emptyStateNoAvailableText: settingsData.emptyStateNoAvailableText,
      footerText: settingsData.footerText,
      sectionIcon: settingsData.sectionIcon,
      trackIcons: settingsData.trackIcons,
      trackColors: settingsData.trackColors,
      // ─── Color Settings ──────────────────────────────────────────────
      heroBtnBg: settingsData.heroBtnBg,
      heroBtnTextColor: settingsData.heroBtnTextColor,
      heroBtnHoverBg: settingsData.heroBtnHoverBg,
      primaryColor: settingsData.primaryColor,
      iconColor: settingsData.iconColor,
      tabActiveBg: settingsData.tabActiveBg,
      tabActiveText: settingsData.tabActiveText,
      tabInactiveText: settingsData.tabInactiveText,
      categoryActiveBg: settingsData.categoryActiveBg,
      categoryActiveText: settingsData.categoryActiveText,
      categoryBorderColor: settingsData.categoryBorderColor,
      viewBtnBg: settingsData.viewBtnBg,
      viewBtnText: settingsData.viewBtnText,
      viewBtnBorder: settingsData.viewBtnBorder,
      continueBtnBg: settingsData.continueBtnBg,
      continueBtnText: settingsData.continueBtnText,
    };
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getAdminCoursePageSettings();
      console.log('📥 Loaded settings from API:', data);
      const parsedSettings = parseSettingsFromApi(data);
      setSettings(parsedSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(parsedSettings)));
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Settings',
        text: error.message || 'Could not load course page settings. Using defaults.',
      });
      setSettings(DEFAULT_SETTINGS);
      setOriginalSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    const result = await Swal.fire({
      title: 'Initialize Default Settings?',
      text: 'This will reset all settings to default values. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Reset to Defaults',
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await initializeCoursePageSettings();
        await loadSettings();
        Swal.fire({
          icon: 'success',
          title: 'Reset Complete!',
          text: 'Settings have been reset to default values.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error initializing settings:', error);
        Swal.fire({
          icon: 'error',
          title: 'Reset Failed',
          text: error.message || 'Could not reset settings.',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleJsonChange = (field, value) => {
    try {
      JSON.parse(value);
      setSettings(prev => ({ ...prev, [field]: value }));
      setHasChanges(true);
    } catch (e) {
      console.warn('Invalid JSON:', e.message);
      setSettings(prev => ({ ...prev, [field]: value }));
      setHasChanges(true);
    }
  };

  const isValidJson = (str) => {
    if (!str) return true;
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      Swal.fire({
        icon: 'info',
        title: 'No Changes',
        text: 'You haven\'t made any changes to save.',
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const jsonFields = ['trackIcons', 'trackColors'];
    const invalidFields = jsonFields.filter(f => !isValidJson(settings[f]));
    
    if (invalidFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid JSON',
        text: `Please fix the following fields: ${invalidFields.join(', ')}.`,
      });
      return;
    }

    try {
      setSaving(true);
      const apiData = settingsToApiFormat(settings);
      await updateCoursePageSettings(apiData);
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      setHasChanges(false);
      Swal.fire({
        icon: 'success',
        title: 'Settings Saved! 🎉',
        text: 'Course page settings have been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Could not save settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    if (!hasChanges) return;
    Swal.fire({
      title: 'Discard Changes?',
      text: 'You will lose all unsaved changes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Discard',
    }).then((result) => {
      if (result.isConfirmed) {
        setSettings(JSON.parse(JSON.stringify(originalSettings)));
        setHasChanges(false);
      }
    });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // ─── Parse track icons for preview ──────────────────────────────
  const parseTrackIcons = () => {
    try {
      return JSON.parse(settings.trackIcons || '{}');
    } catch {
      return {};
    }
  };

  const trackIcons = parseTrackIcons();

  // ─── Sample courses for preview ──────────────────────────────────
  const sampleCourses = [
    { id: 1, title: 'CCNA Routing & Switching', level: 'Intermediate', duration: '6 weeks', track: 'ccna' },
    { id: 2, title: 'CCNP Enterprise', level: 'Advanced', duration: '8 weeks', track: 'ccnp' },
    { id: 3, title: 'CCIE Security', level: 'Expert', duration: '12 weeks', track: 'ccie' },
    { id: 4, title: 'Cyber Security Fundamentals', level: 'Beginner', duration: '4 weeks', track: 'security' },
  ];

  const getTrackInfo = (track) => {
    const icon = trackIcons[track] || trackIcons.default || '📄';
    return { icon };
  };

  // ─── Get section icon name for preview ──────────────────────────
  const getSectionIconName = () => {
    const option = SECTION_ICON_OPTIONS.find(opt => opt.value === settings.sectionIcon);
    return option ? option.label : 'Grid View';
  };

  // ─── Color Preview Helper ────────────────────────────────────────
  const ColorPreview = ({ bg, text }) => (
    <div style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      background: bg || '#ffffff',
      color: text || '#000000',
      fontSize: '10px',
      fontWeight: 600,
      border: '1px solid #e4e7ec',
      marginLeft: '4px',
    }}>
      Preview
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header Actions */}
      <div style={styles.headerActions}>
        <span style={styles.status}>
          {hasChanges ? '⚠️ Unsaved changes' : '✅ All saved'}
        </span>
        <button onClick={() => setShowPreview(!showPreview)} style={styles.previewToggleBtn}>
          {showPreview ? (
            <><VisibilityOffIcon style={{ fontSize: '18px' }} /> Hide Preview</>
          ) : (
            <><VisibilityIcon style={{ fontSize: '18px' }} /> Show Preview</>
          )}
        </button>
        <button onClick={discardChanges} style={styles.discardBtn} disabled={!hasChanges}>
          <RefreshIcon style={{ fontSize: '18px' }} /> Discard
        </button>
        <button onClick={initializeDefaults} style={styles.resetBtn}>
          🔄 Reset to Defaults
        </button>
        <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
          <SaveIcon style={{ fontSize: '18px' }} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* ─── FULL PAGE PREVIEW ────────────────────────────────────── */}
      {showPreview && (
        <div style={styles.previewContainer}>
          <div style={styles.previewHeader}>
            <span style={styles.previewTitle}>📄 Full Page Preview</span>
            <span style={styles.previewBadge}>Real-time</span>
          </div>

          {/* Hero Section - NO DECOR ICON */}
          <div style={{
            ...styles.previewHero,
            background: `linear-gradient(135deg, ${settings.heroBgStart || '#3B2340'} 0%, ${settings.heroBgMid || '#5B3A63'} 55%, ${settings.heroBgEnd || '#83698A'} 100%)`
          }}>
            <div style={styles.previewHeroInner}>
              <div style={styles.previewEyebrow}>{settings.heroEyebrow}</div>
              <h2 style={styles.previewTitleText}>{settings.heroTitle}</h2>
              <p style={styles.previewHeroText}>{settings.heroText}</p>
              <div style={{
                ...styles.previewHeroBtn,
                background: settings.heroBtnBg || '#4f46e5',
                color: settings.heroBtnTextColor || '#ffffff',
              }}>
                <span>{settings.heroButtonText}</span>
              </div>
            </div>
            {/* ✅ HERO DECOR REMOVED */}
          </div>

          {/* Section Bar */}
          <div style={styles.previewSectionBar}>
            <div style={styles.previewSectionTitle}>
              <GridViewIcon style={{ fontSize: '20px', color: settings.iconColor || '#714B67' }} />
              <span style={{ marginLeft: '8px' }}>{settings.sectionTitleAll}</span>
              <span style={styles.previewCount}>4</span>
              <span style={styles.previewIconLabel}>({getSectionIconName()})</span>
            </div>
            <div style={styles.previewSearchWrap}>
              <SearchIcon style={styles.previewSearchIcon} />
              <input
                type="text"
                placeholder={settings.searchPlaceholder}
                style={styles.previewSearchInput}
                disabled
              />
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.previewTabContainer}>
            <button style={{
              ...styles.previewTabActive,
              background: settings.tabActiveBg || '#714B67',
              color: settings.tabActiveText || '#ffffff',
            }}>{settings.tabMyText}</button>
            <button style={{
              ...styles.previewTabInactive,
              color: settings.tabInactiveText || '#6B6470',
            }}>{settings.tabAllText}</button>
          </div>

          {/* Course Grid */}
          <div style={styles.previewGrid}>
            {sampleCourses.map((course) => {
              const trackInfo = getTrackInfo(course.track);
              return (
                <div key={course.id} style={styles.previewCard}>
                  <div style={styles.previewCardImage}>
                    <div style={styles.previewCardBadge}>
                      <span>{trackInfo.icon}</span> {course.level}
                    </div>
                  </div>
                  <div style={styles.previewCardBody}>
                    <div style={styles.previewCardTitle}>{course.title}</div>
                    <div style={styles.previewCardMeta}>
                      <span><AccessTimeIcon style={{ fontSize: '12px' }} /> {course.duration}</span>
                      <span><EmojiEventsIcon style={{ fontSize: '12px' }} /> {course.level}</span>
                    </div>
                  </div>
                  <div style={styles.previewCardFooter}>
                    <button style={{
                      ...styles.previewViewBtn,
                      background: settings.viewBtnBg || '#ffffff',
                      color: settings.viewBtnText || '#714B67',
                      borderColor: settings.viewBtnBorder || '#714B67',
                    }}>
                      {settings.viewCourseButtonText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={styles.previewFooter}>
            <p>{settings.footerText}</p>
          </div>
        </div>
      )}

      {/* Settings Grid */}
      <div style={styles.grid}>
        {/* Hero Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <TextFieldsIcon style={styles.sectionIcon} /> Hero Section
          </h3>
          
          <div style={styles.field}>
            <label style={styles.label}>Eyebrow Text</label>
            <input
              type="text"
              value={settings.heroEyebrow || ''}
              onChange={(e) => handleChange('heroEyebrow', e.target.value)}
              style={styles.input}
              placeholder="e.g., Networking & Security Academy"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Hero Title *</label>
            <input
              type="text"
              value={settings.heroTitle || ''}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              style={styles.input}
              placeholder="e.g., Knowledge is a superpower"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Hero Description</label>
            <textarea
              rows="3"
              value={settings.heroText || ''}
              onChange={(e) => handleChange('heroText', e.target.value)}
              style={styles.textarea}
              placeholder="Enter hero description..."
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Hero Button Text</label>
            <input
              type="text"
              value={settings.heroButtonText || ''}
              onChange={(e) => handleChange('heroButtonText', e.target.value)}
              style={styles.input}
              placeholder="e.g., Pick a course →"
            />
          </div>

          {/* ✅ HERO DECOR ICON FIELD REMOVED */}

          {/* ─── Section Icon Picker ─────────────────────────── */}
          <div style={styles.field}>
            <label style={styles.label}>Section Icon</label>
            <div style={styles.selectWrapper}>
              <select
                value={settings.sectionIcon || 'grid'}
                onChange={(e) => handleChange('sectionIcon', e.target.value)}
                style={styles.select}
              >
                {SECTION_ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span style={styles.selectHint}>
                This icon appears next to "All Courses" / "My Courses" title
              </span>
            </div>
          </div>
        </div>

        {/* Hero Colors */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><ColorLensIcon style={styles.sectionIcon} /> Hero Colors</h3>

          <div style={styles.field}>
            <label style={styles.label}>Start Color</label>
            <div style={styles.colorRow}>
              <input
                type="color"
                value={settings.heroBgStart || '#3B2340'}
                onChange={(e) => handleChange('heroBgStart', e.target.value)}
                style={styles.colorPicker}
              />
              <input
                type="text"
                value={settings.heroBgStart || ''}
                onChange={(e) => handleChange('heroBgStart', e.target.value)}
                style={styles.colorInput}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Middle Color</label>
            <div style={styles.colorRow}>
              <input
                type="color"
                value={settings.heroBgMid || '#5B3A63'}
                onChange={(e) => handleChange('heroBgMid', e.target.value)}
                style={styles.colorPicker}
              />
              <input
                type="text"
                value={settings.heroBgMid || ''}
                onChange={(e) => handleChange('heroBgMid', e.target.value)}
                style={styles.colorInput}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>End Color</label>
            <div style={styles.colorRow}>
              <input
                type="color"
                value={settings.heroBgEnd || '#83698A'}
                onChange={(e) => handleChange('heroBgEnd', e.target.value)}
                style={styles.colorPicker}
              />
              <input
                type="text"
                value={settings.heroBgEnd || ''}
                onChange={(e) => handleChange('heroBgEnd', e.target.value)}
                style={styles.colorInput}
              />
            </div>
          </div>

          <div style={styles.colorPreview}>
            <div style={{
              ...styles.previewGradient,
              background: `linear-gradient(135deg, ${settings.heroBgStart || '#3B2340'} 0%, ${settings.heroBgMid || '#5B3A63'} 55%, ${settings.heroBgEnd || '#83698A'} 100%)`
            }}>
              <span style={styles.previewText}>Preview</span>
            </div>
          </div>
        </div>

        {/* ─── THEME COLORS SECTION ─────────────────────────────────── */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <ColorLensIcon style={styles.sectionIcon} /> Theme Colors
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
            Customize all button and UI colors across the course page
          </p>

          {/* Hero Button Colors */}
          <div style={styles.colorGrid}>
            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Hero Button BG</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.heroBtnBg || '#4f46e5'}
                  onChange={(e) => handleChange('heroBtnBg', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.heroBtnBg || ''}
                  onChange={(e) => handleChange('heroBtnBg', e.target.value)}
                  style={styles.colorInputSmall}
                />
                <ColorPreview bg={settings.heroBtnBg} text={settings.heroBtnTextColor} />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Hero Button Text</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.heroBtnTextColor || '#ffffff'}
                  onChange={(e) => handleChange('heroBtnTextColor', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.heroBtnTextColor || ''}
                  onChange={(e) => handleChange('heroBtnTextColor', e.target.value)}
                  style={styles.colorInputSmall}
                />
                <ColorPreview bg={settings.heroBtnBg} text={settings.heroBtnTextColor} />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Hero Button Hover</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.heroBtnHoverBg || '#4338ca'}
                  onChange={(e) => handleChange('heroBtnHoverBg', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.heroBtnHoverBg || ''}
                  onChange={(e) => handleChange('heroBtnHoverBg', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Primary Color</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.primaryColor || '#4f46e5'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.primaryColor || ''}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Icon Color</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.iconColor || '#714B67'}
                  onChange={(e) => handleChange('iconColor', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.iconColor || ''}
                  onChange={(e) => handleChange('iconColor', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Tab Colors */}
          <div style={styles.colorGrid}>
            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Tab Active BG</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.tabActiveBg || '#714B67'}
                  onChange={(e) => handleChange('tabActiveBg', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.tabActiveBg || ''}
                  onChange={(e) => handleChange('tabActiveBg', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Tab Active Text</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.tabActiveText || '#ffffff'}
                  onChange={(e) => handleChange('tabActiveText', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.tabActiveText || ''}
                  onChange={(e) => handleChange('tabActiveText', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Tab Inactive Text</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.tabInactiveText || '#6B6470'}
                  onChange={(e) => handleChange('tabInactiveText', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.tabInactiveText || ''}
                  onChange={(e) => handleChange('tabInactiveText', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Category Tab Colors */}
          <div style={styles.colorGrid}>
            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Category Active BG</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.categoryActiveBg || '#714B67'}
                  onChange={(e) => handleChange('categoryActiveBg', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.categoryActiveBg || ''}
                  onChange={(e) => handleChange('categoryActiveBg', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Category Active Text</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.categoryActiveText || '#ffffff'}
                  onChange={(e) => handleChange('categoryActiveText', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.categoryActiveText || ''}
                  onChange={(e) => handleChange('categoryActiveText', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Category Border</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.categoryBorderColor || '#E8E3EA'}
                  onChange={(e) => handleChange('categoryBorderColor', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.categoryBorderColor || ''}
                  onChange={(e) => handleChange('categoryBorderColor', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* View & Continue Button Colors */}
          <div style={styles.colorGrid}>
            <div style={styles.colorField}>
              <label style={styles.colorLabel}>View Button BG</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.viewBtnBg || '#ffffff'}
                  onChange={(e) => handleChange('viewBtnBg', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.viewBtnBg || ''}
                  onChange={(e) => handleChange('viewBtnBg', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>View Button Text</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.viewBtnText || '#714B67'}
                  onChange={(e) => handleChange('viewBtnText', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.viewBtnText || ''}
                  onChange={(e) => handleChange('viewBtnText', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>View Button Border</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.viewBtnBorder || '#714B67'}
                  onChange={(e) => handleChange('viewBtnBorder', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.viewBtnBorder || ''}
                  onChange={(e) => handleChange('viewBtnBorder', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Continue Button BG</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.continueBtnBg || '#714B67'}
                  onChange={(e) => handleChange('continueBtnBg', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.continueBtnBg || ''}
                  onChange={(e) => handleChange('continueBtnBg', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>

            <div style={styles.colorField}>
              <label style={styles.colorLabel}>Continue Button Text</label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={settings.continueBtnText || '#ffffff'}
                  onChange={(e) => handleChange('continueBtnText', e.target.value)}
                  style={styles.colorPickerSmall}
                />
                <input
                  type="text"
                  value={settings.continueBtnText || ''}
                  onChange={(e) => handleChange('continueBtnText', e.target.value)}
                  style={styles.colorInputSmall}
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div style={styles.livePreview}>
            <p style={styles.livePreviewLabel}>🔴 Live Preview:</p>
            <div style={styles.livePreviewButtons}>
              <button style={{
                background: settings.heroBtnBg || '#4f46e5',
                color: settings.heroBtnTextColor || '#ffffff',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'default',
              }}>
                Hero Button
              </button>
              <button style={{
                background: settings.viewBtnBg || '#ffffff',
                color: settings.viewBtnText || '#714B67',
                border: `2px solid ${settings.viewBtnBorder || '#714B67'}`,
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'default',
              }}>
                View Course
              </button>
              <button style={{
                background: settings.continueBtnBg || '#714B67',
                color: settings.continueBtnText || '#ffffff',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'default',
              }}>
                Continue Learning
              </button>
            </div>
          </div>
        </div>

        {/* Section Titles */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><TextFieldsIcon style={styles.sectionIcon} /> Section Titles</h3>

          <div style={styles.field}>
            <label style={styles.label}>My Courses Title</label>
            <input
              type="text"
              value={settings.sectionTitleMy || ''}
              onChange={(e) => handleChange('sectionTitleMy', e.target.value)}
              style={styles.input}
              placeholder="My Courses"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>All Courses Title</label>
            <input
              type="text"
              value={settings.sectionTitleAll || ''}
              onChange={(e) => handleChange('sectionTitleAll', e.target.value)}
              style={styles.input}
              placeholder="All Courses"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Tab: My Courses</label>
            <input
              type="text"
              value={settings.tabMyText || ''}
              onChange={(e) => handleChange('tabMyText', e.target.value)}
              style={styles.input}
              placeholder="My Courses"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Tab: All Courses</label>
            <input
              type="text"
              value={settings.tabAllText || ''}
              onChange={(e) => handleChange('tabAllText', e.target.value)}
              style={styles.input}
              placeholder="All Courses"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Search Placeholder</label>
            <input
              type="text"
              value={settings.searchPlaceholder || ''}
              onChange={(e) => handleChange('searchPlaceholder', e.target.value)}
              style={styles.input}
              placeholder="Search courses..."
            />
          </div>
        </div>

        {/* Course Card */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><SettingsIcon style={styles.sectionIcon} /> Course Card</h3>

          <div style={styles.field}>
            <label style={styles.label}>Duration Label</label>
            <input
              type="text"
              value={settings.cardDurationLabel || ''}
              onChange={(e) => handleChange('cardDurationLabel', e.target.value)}
              style={styles.input}
              placeholder="⏱"
              maxLength="2"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Enrolled Badge Text</label>
            <input
              type="text"
              value={settings.enrolledBadgeText || ''}
              onChange={(e) => handleChange('enrolledBadgeText', e.target.value)}
              style={styles.input}
              placeholder="Enrolled"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>View Course Button</label>
            <input
              type="text"
              value={settings.viewCourseButtonText || ''}
              onChange={(e) => handleChange('viewCourseButtonText', e.target.value)}
              style={styles.input}
              placeholder="View Course"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Continue Learning Button</label>
            <input
              type="text"
              value={settings.continueLearningButtonText || ''}
              onChange={(e) => handleChange('continueLearningButtonText', e.target.value)}
              style={styles.input}
              placeholder="Continue Learning"
            />
          </div>
        </div>

        {/* Empty States */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><DescriptionIcon style={styles.sectionIcon} /> Empty States</h3>

          <div style={styles.field}>
            <label style={styles.label}>Login Required Title</label>
            <input
              type="text"
              value={settings.emptyStateLoginTitle || ''}
              onChange={(e) => handleChange('emptyStateLoginTitle', e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Login Required Text</label>
            <textarea
              rows="2"
              value={settings.emptyStateLoginText || ''}
              onChange={(e) => handleChange('emptyStateLoginText', e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Login Button Text</label>
            <input
              type="text"
              value={settings.emptyStateLoginButton || ''}
              onChange={(e) => handleChange('emptyStateLoginButton', e.target.value)}
              style={styles.input}
            />
          </div>

          <hr style={styles.divider} />

          <div style={styles.field}>
            <label style={styles.label}>No Courses Title</label>
            <input
              type="text"
              value={settings.emptyStateNoCoursesTitle || ''}
              onChange={(e) => handleChange('emptyStateNoCoursesTitle', e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>No Courses Text</label>
            <textarea
              rows="2"
              value={settings.emptyStateNoCoursesText || ''}
              onChange={(e) => handleChange('emptyStateNoCoursesText', e.target.value)}
              style={styles.textarea}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>No Courses Button</label>
            <input
              type="text"
              value={settings.emptyStateNoCoursesButton || ''}
              onChange={(e) => handleChange('emptyStateNoCoursesButton', e.target.value)}
              style={styles.input}
            />
          </div>

          <hr style={styles.divider} />

          <div style={styles.field}>
            <label style={styles.label}>No Available Title</label>
            <input
              type="text"
              value={settings.emptyStateNoAvailableTitle || ''}
              onChange={(e) => handleChange('emptyStateNoAvailableTitle', e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>No Available Text</label>
            <textarea
              rows="2"
              value={settings.emptyStateNoAvailableText || ''}
              onChange={(e) => handleChange('emptyStateNoAvailableText', e.target.value)}
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Footer & Track Settings */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><FormatQuoteIcon style={styles.sectionIcon} /> Footer & Track Settings</h3>

          <div style={styles.field}>
            <label style={styles.label}>Footer Text</label>
            <textarea
              rows="3"
              value={settings.footerText || ''}
              onChange={(e) => handleChange('footerText', e.target.value)}
              style={styles.textarea}
              placeholder="Browse our course catalog..."
            />
          </div>

          <hr style={styles.divider} />

          <div style={styles.field}>
            <label style={styles.label}>Track Icons (JSON)</label>
            <textarea
              rows="6"
              value={settings.trackIcons || ''}
              onChange={(e) => handleJsonChange('trackIcons', e.target.value)}
              style={{
                ...styles.jsonTextarea,
                borderColor: isValidJson(settings.trackIcons) ? '#e4e7ec' : '#ef4444',
              }}
              placeholder='{"ccna":"🌐","ccnp":"🚀","default":"📄"}'
            />
            <span style={styles.hint}>
              {isValidJson(settings.trackIcons) ? '✅ Valid JSON' : '❌ Invalid JSON'}
            </span>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Track Colors (JSON)</label>
            <textarea
              rows="6"
              value={settings.trackColors || ''}
              onChange={(e) => handleJsonChange('trackColors', e.target.value)}
              style={{
                ...styles.jsonTextarea,
                borderColor: isValidJson(settings.trackColors) ? '#e4e7ec' : '#ef4444',
              }}
              placeholder='{"ccna":"#EAF6F1","ccnp":"#FDF3E7","default":"#F2F1F6"}'
            />
            <span style={styles.hint}>
              {isValidJson(settings.trackColors) ? '✅ Valid JSON' : '❌ Invalid JSON'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '24px',
    padding: '16px 20px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e4e7ec',
  },
  status: {
    fontSize: '14px',
    fontWeight: 500,
    padding: '6px 14px',
    borderRadius: '20px',
    background: '#f1f5f9',
    color: '#64748b',
    marginRight: 'auto',
  },
  previewToggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#eef2ff',
    color: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#e0e7ff',
    },
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#4338ca',
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  discardBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#ffffff',
    color: '#64748b',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#f8fafc',
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#ffffff',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#fef2f2',
    },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '20px',
  },
  section: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e4e7ec',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#0f172a',
    marginTop: 0,
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #f1f5f9',
  },
  sectionIcon: {
    fontSize: '20px',
    color: '#4f46e5',
  },
  field: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#334155',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    background: '#ffffff',
    color: '#0f172a',
    '&:focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
    transition: 'border-color 0.2s',
    background: '#ffffff',
    color: '#0f172a',
    '&:focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
  jsonTextarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
    resize: 'vertical',
    transition: 'border-color 0.2s',
    background: '#ffffff',
    color: '#0f172a',
    '&:focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
  colorRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  colorPicker: {
    width: '40px',
    height: '40px',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    cursor: 'pointer',
    padding: '2px',
  },
  colorInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#ffffff',
    color: '#0f172a',
  },
  colorPreview: {
    marginTop: '12px',
  },
  previewGradient: {
    height: '50px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  hint: {
    display: 'block',
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #f1f5f9',
    margin: '14px 0',
  },

  // ─── Section Icon Select Styles ────────────────────────────────
  selectWrapper: {
    position: 'relative',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.2s',
    cursor: 'pointer',
    '&:focus': {
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
  selectHint: {
    display: 'block',
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  previewIconLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginLeft: '8px',
    fontWeight: 400,
  },

  // ─── Preview Styles ────────────────────────────────────────────
  previewContainer: {
    marginBottom: '24px',
    border: '1px solid #e4e7ec',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#ffffff',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: '#f8fafc',
    borderBottom: '1px solid #e4e7ec',
  },
  previewTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f172a',
  },
  previewBadge: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '2px 12px',
    background: '#22c55e',
    color: '#ffffff',
    borderRadius: '12px',
  },
  previewHero: {
    position: 'relative',
    overflow: 'hidden',
    padding: '40px 48px',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    minHeight: '180px',
  },
  previewHeroInner: {
    maxWidth: '100%',
    flex: 1,
  },
  previewEyebrow: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    opacity: 0.75,
    marginBottom: '8px',
  },
  previewTitleText: {
    fontSize: '24px',
    fontWeight: 800,
    lineHeight: 1.08,
    letterSpacing: '-0.5px',
    marginBottom: '8px',
  },
  previewHeroText: {
    fontSize: '13px',
    lineHeight: 1.6,
    opacity: 0.88,
    maxWidth: '480px',
    marginBottom: '14px',
  },
  previewHeroBtn: {
    display: 'inline-block',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },

  // Section Bar
  previewSectionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    background: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
  },
  previewSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
  },
  previewCount: {
    fontSize: '13px',
    fontWeight: 400,
    color: '#64748b',
    marginLeft: '10px',
    background: '#f1f5f9',
    padding: '2px 10px',
    borderRadius: '12px',
  },
  previewSearchWrap: {
    position: 'relative',
    width: '220px',
  },
  previewSearchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    fontSize: '16px',
  },
  previewSearchInput: {
    width: '100%',
    padding: '6px 12px 6px 34px',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    fontSize: '13px',
    background: '#f8fafc',
    color: '#0f172a',
    outline: 'none',
  },

  // Tabs
  previewTabContainer: {
    display: 'flex',
    gap: '4px',
    padding: '8px 24px',
    background: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
  },
  previewTabActive: {
    padding: '6px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  previewTabInactive: {
    padding: '6px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },

  // Course Grid
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    padding: '20px 24px',
    background: '#f8fafc',
  },
  previewCard: {
    background: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e4e7ec',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  previewCardImage: {
    height: '100px',
    background: 'linear-gradient(135deg, #e8ecf0 0%, #d5dadd 100%)',
    position: 'relative',
  },
  previewCardBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  previewCardBody: {
    padding: '12px 14px 8px',
  },
  previewCardTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.3,
    marginBottom: '4px',
    minHeight: '36px',
  },
  previewCardMeta: {
    display: 'flex',
    gap: '10px',
    fontSize: '11px',
    color: '#64748b',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  previewCardFooter: {
    padding: '8px 14px 12px',
  },
  previewViewBtn: {
    width: '100%',
    padding: '6px',
    border: '1px solid',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Footer
  previewFooter: {
    padding: '16px 24px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#64748b',
    borderTop: '1px solid #f1f5f9',
    background: '#ffffff',
  },

  // ─── Theme Color Styles ────────────────────────────────────────
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '8px',
    marginBottom: '8px',
  },
  colorField: {
    marginBottom: '4px',
  },
  colorLabel: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 500,
    color: '#64748b',
    marginBottom: '2px',
  },
  colorPickerSmall: {
    width: '28px',
    height: '28px',
    border: '1px solid #e4e7ec',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '1px',
    flexShrink: 0,
  },
  colorInputSmall: {
    width: '70px',
    padding: '4px 6px',
    border: '1px solid #e4e7ec',
    borderRadius: '4px',
    fontSize: '11px',
    background: '#ffffff',
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  livePreview: {
    marginTop: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e4e7ec',
  },
  livePreviewLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '8px',
  },
  livePreviewButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
};

export default CoursePageSettingsTab;