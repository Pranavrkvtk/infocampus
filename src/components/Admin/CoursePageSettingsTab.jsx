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

// ─── Default Settings (fallback) ──────────────────────────────────
const DEFAULT_SETTINGS = {
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
  tabMyText: "My Courses",
  tabAllText: "All Courses",
  searchPlaceholder: "Search courses...",
  
  // Course Card
  cardDurationLabel: "⏱",
  cardStepsLabel: "📋",
  cardStepsText: "steps",
  enrolledBadgeText: "Enrolled",
  viewCourseButtonText: "View Course",
  continueLearningButtonText: "Continue Learning",
  
  // Empty States
  emptyStateLoginTitle: "Login to see your courses",
  emptyStateLoginText: "Sign in to view your enrolled courses and track progress.",
  emptyStateLoginButton: "Sign In",
  emptyStateNoCoursesTitle: "No courses yet",
  emptyStateNoCoursesText: "Browse all courses and enroll to start learning.",
  emptyStateNoCoursesButton: "Browse All Courses",
  emptyStateNoAvailableTitle: "No courses available",
  emptyStateNoAvailableText: "Check back later for new courses.",
  
  // Footer
  footerText: "Browse our course catalog. Sign in to enroll and track progress.",
  
  // Track Settings (JSON strings)
  trackIcons: '{"ccna":"🌐","ccnp":"🚀","ccie":"🔐","security":"🛡️","linux":"🐧","python":"🐍","fortinet":"🧱","aws":"☁️","azure":"💠","devops":"⚡","default":"📄"}',
  trackColors: '{"ccna":"#EAF6F1","ccnp":"#FDF3E7","ccie":"#FBEAEA","security":"#F1EAFB","linux":"#E7F6FA","python":"#EAF6EF","fortinet":"#EFF1FB","aws":"#E8F4FD","azure":"#E3F2FD","devops":"#FFF3E0","default":"#F2F1F6"}',
};

function CoursePageSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // ─── Parse settings from API response ──────────────────────────
  const parseSettingsFromApi = (apiData) => {
    if (!apiData) return DEFAULT_SETTINGS;
    
    // If the API returns a settings object directly
    const data = apiData.settings || apiData;
    
    return {
      // Hero Section
      heroEyebrow: data.heroEyebrow || data['course.hero.eyebrow'] || DEFAULT_SETTINGS.heroEyebrow,
      heroTitle: data.heroTitle || data['course.hero.title'] || DEFAULT_SETTINGS.heroTitle,
      heroText: data.heroText || data['course.hero.text'] || DEFAULT_SETTINGS.heroText,
      heroButtonText: data.heroButtonText || data['course.hero.button'] || DEFAULT_SETTINGS.heroButtonText,
      heroBgStart: data.heroBgStart || data['course.hero.bg.start'] || DEFAULT_SETTINGS.heroBgStart,
      heroBgMid: data.heroBgMid || data['course.hero.bg.mid'] || DEFAULT_SETTINGS.heroBgMid,
      heroBgEnd: data.heroBgEnd || data['course.hero.bg.end'] || DEFAULT_SETTINGS.heroBgEnd,
      heroDecor: data.heroDecor || data['course.hero.decor'] || DEFAULT_SETTINGS.heroDecor,
      
      // Section Bar
      sectionTitleMy: data.sectionTitleMy || data['course.section.my'] || DEFAULT_SETTINGS.sectionTitleMy,
      sectionTitleAll: data.sectionTitleAll || data['course.section.all'] || DEFAULT_SETTINGS.sectionTitleAll,
      tabMyText: data.tabMyText || data['course.tab.my'] || DEFAULT_SETTINGS.tabMyText,
      tabAllText: data.tabAllText || data['course.tab.all'] || DEFAULT_SETTINGS.tabAllText,
      searchPlaceholder: data.searchPlaceholder || data['course.search.placeholder'] || DEFAULT_SETTINGS.searchPlaceholder,
      
      // Course Card
      cardDurationLabel: data.cardDurationLabel || data['course.card.duration'] || DEFAULT_SETTINGS.cardDurationLabel,
      cardStepsLabel: data.cardStepsLabel || data['course.card.steps'] || DEFAULT_SETTINGS.cardStepsLabel,
      cardStepsText: data.cardStepsText || data['course.card.steps.text'] || DEFAULT_SETTINGS.cardStepsText,
      enrolledBadgeText: data.enrolledBadgeText || data['course.card.enrolled'] || DEFAULT_SETTINGS.enrolledBadgeText,
      viewCourseButtonText: data.viewCourseButtonText || data['course.card.view'] || DEFAULT_SETTINGS.viewCourseButtonText,
      continueLearningButtonText: data.continueLearningButtonText || data['course.card.continue'] || DEFAULT_SETTINGS.continueLearningButtonText,
      
      // Empty States
      emptyStateLoginTitle: data.emptyStateLoginTitle || data['course.empty.login.title'] || DEFAULT_SETTINGS.emptyStateLoginTitle,
      emptyStateLoginText: data.emptyStateLoginText || data['course.empty.login.text'] || DEFAULT_SETTINGS.emptyStateLoginText,
      emptyStateLoginButton: data.emptyStateLoginButton || data['course.empty.login.button'] || DEFAULT_SETTINGS.emptyStateLoginButton,
      emptyStateNoCoursesTitle: data.emptyStateNoCoursesTitle || data['course.empty.no-courses.title'] || DEFAULT_SETTINGS.emptyStateNoCoursesTitle,
      emptyStateNoCoursesText: data.emptyStateNoCoursesText || data['course.empty.no-courses.text'] || DEFAULT_SETTINGS.emptyStateNoCoursesText,
      emptyStateNoCoursesButton: data.emptyStateNoCoursesButton || data['course.empty.no-courses.button'] || DEFAULT_SETTINGS.emptyStateNoCoursesButton,
      emptyStateNoAvailableTitle: data.emptyStateNoAvailableTitle || data['course.empty.no-available.title'] || DEFAULT_SETTINGS.emptyStateNoAvailableTitle,
      emptyStateNoAvailableText: data.emptyStateNoAvailableText || data['course.empty.no-available.text'] || DEFAULT_SETTINGS.emptyStateNoAvailableText,
      
      // Footer
      footerText: data.footerText || data['course.footer.text'] || DEFAULT_SETTINGS.footerText,
      
      // Track Settings (JSON strings)
      trackIcons: data.trackIcons || data['course.track.icons'] || DEFAULT_SETTINGS.trackIcons,
      trackColors: data.trackColors || data['course.track.colors'] || DEFAULT_SETTINGS.trackColors,
    };
  };

  // ─── Convert settings to API format ────────────────────────────
  const settingsToApiFormat = (settingsData) => {
    return {
      // Hero Section
      heroEyebrow: settingsData.heroEyebrow,
      heroTitle: settingsData.heroTitle,
      heroText: settingsData.heroText,
      heroButtonText: settingsData.heroButtonText,
      heroBgStart: settingsData.heroBgStart,
      heroBgMid: settingsData.heroBgMid,
      heroBgEnd: settingsData.heroBgEnd,
      heroDecor: settingsData.heroDecor,
      
      // Section Bar
      sectionTitleMy: settingsData.sectionTitleMy,
      sectionTitleAll: settingsData.sectionTitleAll,
      tabMyText: settingsData.tabMyText,
      tabAllText: settingsData.tabAllText,
      searchPlaceholder: settingsData.searchPlaceholder,
      
      // Course Card
      cardDurationLabel: settingsData.cardDurationLabel,
      cardStepsLabel: settingsData.cardStepsLabel,
      cardStepsText: settingsData.cardStepsText,
      enrolledBadgeText: settingsData.enrolledBadgeText,
      viewCourseButtonText: settingsData.viewCourseButtonText,
      continueLearningButtonText: settingsData.continueLearningButtonText,
      
      // Empty States
      emptyStateLoginTitle: settingsData.emptyStateLoginTitle,
      emptyStateLoginText: settingsData.emptyStateLoginText,
      emptyStateLoginButton: settingsData.emptyStateLoginButton,
      emptyStateNoCoursesTitle: settingsData.emptyStateNoCoursesTitle,
      emptyStateNoCoursesText: settingsData.emptyStateNoCoursesText,
      emptyStateNoCoursesButton: settingsData.emptyStateNoCoursesButton,
      emptyStateNoAvailableTitle: settingsData.emptyStateNoAvailableTitle,
      emptyStateNoAvailableText: settingsData.emptyStateNoAvailableText,
      
      // Footer
      footerText: settingsData.footerText,
      
      // Track Settings (store as strings)
      trackIcons: settingsData.trackIcons,
      trackColors: settingsData.trackColors,
    };
  };

  // ─── Load Settings ──────────────────────────────────────────────
  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getAdminCoursePageSettings();
      console.log('📥 Loaded settings from API:', data);
      
      const parsedSettings = parseSettingsFromApi(data);
      console.log('📥 Parsed settings:', parsedSettings);
      
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
      // Use defaults if API fails
      setSettings(DEFAULT_SETTINGS);
      setOriginalSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
    } finally {
      setLoading(false);
    }
  };

  // ─── Initialize Default Settings ──────────────────────────────
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

  // ─── Handle Field Changes ──────────────────────────────────────
  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  // ─── Handle JSON Field Changes ─────────────────────────────────
  const handleJsonChange = (field, value) => {
    try {
      // Validate JSON
      JSON.parse(value);
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
      setHasChanges(true);
    } catch (e) {
      // Invalid JSON - show warning but allow editing
      console.warn('Invalid JSON:', e.message);
      // Still update the field but with a visual indicator
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
      setHasChanges(true);
    }
  };

  // ─── Validate JSON fields ──────────────────────────────────────
  const isValidJson = (str) => {
    if (!str) return true;
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  // ─── Save Settings ─────────────────────────────────────────────
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

    // Validate JSON fields before saving
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

  // ─── Discard Changes ────────────────────────────────────────────
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

  // ─── Load on Mount ──────────────────────────────────────────────
  useEffect(() => {
    loadSettings();
  }, []);

  // ─── Loading State ──────────────────────────────────────────────
  if (loading) {
    return <LoadingSpinner />;
  }

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* Header Actions */}
      <div style={styles.headerActions}>
        <span style={styles.status}>
          {hasChanges ? '⚠️ Unsaved changes' : '✅ All saved'}
        </span>
        <button onClick={discardChanges} style={styles.discardBtn} disabled={!hasChanges}>
          <RefreshIcon style={{ fontSize: '18px' }} />
          Discard
        </button>
        <button onClick={initializeDefaults} style={styles.resetBtn}>
          🔄 Reset to Defaults
        </button>
        <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
          <SaveIcon style={{ fontSize: '18px' }} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Settings Grid */}
      <div style={styles.grid}>
        {/* Hero Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <TextFieldsIcon style={styles.sectionIcon} />
            Hero Section
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

          <div style={styles.field}>
            <label style={styles.label}>Hero Decor Emoji</label>
            <input
              type="text"
              value={settings.heroDecor || ''}
              onChange={(e) => handleChange('heroDecor', e.target.value)}
              style={styles.input}
              maxLength="2"
              placeholder="🎓"
            />
          </div>
        </div>

        {/* Hero Colors Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <ColorLensIcon style={styles.sectionIcon} />
            Hero Colors
          </h3>

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

        {/* Section Titles */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <TextFieldsIcon style={styles.sectionIcon} />
            Section Titles
          </h3>

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
          <h3 style={styles.sectionTitle}>
            <SettingsIcon style={styles.sectionIcon} />
            Course Card
          </h3>

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
            <label style={styles.label}>Steps Label</label>
            <input
              type="text"
              value={settings.cardStepsLabel || ''}
              onChange={(e) => handleChange('cardStepsLabel', e.target.value)}
              style={styles.input}
              placeholder="📋"
              maxLength="2"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Steps Text</label>
            <input
              type="text"
              value={settings.cardStepsText || ''}
              onChange={(e) => handleChange('cardStepsText', e.target.value)}
              style={styles.input}
              placeholder="steps"
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
          <h3 style={styles.sectionTitle}>
            <DescriptionIcon style={styles.sectionIcon} />
            Empty States
          </h3>

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
          <h3 style={styles.sectionTitle}>
            <FormatQuoteIcon style={styles.sectionIcon} />
            Footer & Track Settings
          </h3>

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
};

export default CoursePageSettingsTab;