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
  },

  // Visual Theme Presets
  themePreset: 'default'
};

// Theme Presets
const THEME_PRESETS = {
  default: {
    name: 'Default Purple',
    heroBgStart: "#3B2340",
    heroBgMid: "#5B3A63",
    heroBgEnd: "#83698A",
  },
  ocean: {
    name: 'Ocean Blue',
    heroBgStart: "#0F2027",
    heroBgMid: "#203A43",
    heroBgEnd: "#2C5364",
  },
  sunset: {
    name: 'Sunset Orange',
    heroBgStart: "#412234",
    heroBgMid: "#6D466B",
    heroBgEnd: "#B5838D",
  },
  forest: {
    name: 'Forest Green',
    heroBgStart: "#0F2027",
    heroBgMid: "#1A3A2A",
    heroBgEnd: "#2D5A3F",
  },
  crimson: {
    name: 'Crimson Red',
    heroBgStart: "#4A0E0E",
    heroBgMid: "#6B1A1A",
    heroBgEnd: "#8B2A2A",
  },
  midnight: {
    name: 'Midnight Blue',
    heroBgStart: "#0C0E1A",
    heroBgMid: "#1A1D33",
    heroBgEnd: "#2A2D4A",
  },
};

// Color Library for the ColorPicker
const COLOR_LIBRARY = {
  reds: ["#FF6B6B", "#FF4757", "#FF3838", "#EE5A24", "#EA2027", "#C0392B", "#E74C3C"],
  oranges: ["#FF9F43", "#F0932B", "#F39C12", "#E67E22", "#D35400", "#FF7F50", "#FFA07A"],
  yellows: ["#FECA57", "#FFC312", "#F9CA24", "#F1C40F", "#F39C12", "#FFD700", "#FFDF00"],
  greens: ["#A8E6CF", "#55E6C1", "#00B894", "#00A86B", "#27AE60", "#2ECC71", "#1ABC9C"],
  teals: ["#00CEC9", "#0984E3", "#00B4D8", "#00A8CC", "#01949A", "#008080", "#20B2AA"],
  blues: ["#74B9FF", "#0984E3", "#0066CC", "#00509E", "#2D7DD2", "#4A90D9", "#6BB3F0"],
  purples: ["#A29BFE", "#6C5CE7", "#8E44AD", "#9B59B6", "#A569BD", "#7D3C98", "#5B2C6F"],
  pinks: ["#FD79A8", "#E84393", "#D63384", "#C2185B", "#AD1457", "#880E4F", "#4A0E4A"],
  grays: ["#2D3436", "#636E72", "#B2BEC3", "#DFE6E9", "#7F8C8D", "#95A5A6", "#BDC3C7"],
  whites: ["#FFFFFF", "#F5F6FA", "#ECF0F1", "#F8F9FA", "#E8E8E8", "#F0F0F0", "#F7F7F7"]
};

// Icon Library
const ICON_LIBRARY = {
  networking: ["🌐", "🌍", "🌎", "🌏", "📡", "🛰️", "🔗", "📶"],
  security: ["🔐", "🛡️", "🔒", "🔑", "🗝️", "⚔️", "🛡️", "🔓"],
  development: ["🐍", "💻", "⚡", "🔥", "🖥️", "⌨️", "🐧", "☁️"],
  learning: ["🎓", "📚", "📖", "📘", "📙", "📕", "📗", "📔"],
  cloud: ["☁️", "💠", "🌩️", "⛅", "🌈", "💾", "🖧", "📊"],
  general: ["📄", "📋", "📌", "🔖", "📎", "📏", "📐", "🧮"],
  emojis: ["🚀", "💎", "⭐", "🌟", "✨", "🎯", "🏆", "💪", "🤖", "🎨", "🌈", "🎉"]
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
  const [showIconPicker, setShowIconPicker] = useState(null);
  const [editingTrack, setEditingTrack] = useState(null);
  const [recentColors, setRecentColors] = useState(() => {
    const saved = localStorage.getItem('recentColors');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  const applyThemePreset = (presetKey) => {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      setConfig(prev => ({
        ...prev,
        heroBgStart: preset.heroBgStart,
        heroBgMid: preset.heroBgMid,
        heroBgEnd: preset.heroBgEnd,
        themePreset: presetKey
      }));
    }
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

  // Search functionality
  const performSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const searchLower = term.toLowerCase();

    const searchInObject = (obj, path = '') => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          if (obj[key].toLowerCase().includes(searchLower)) {
            results.push({
              path: path ? `${path}.${key}` : key,
              label: key.replace(/([A-Z])/g, ' $1').trim(),
              value: obj[key],
              section: path.split('.')[0] || key
            });
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          // Handle nested objects like trackIcons and trackColors
          if (key === 'trackIcons' || key === 'trackColors') {
            for (const subKey in obj[key]) {
              if (typeof obj[key][subKey] === 'string' && 
                  obj[key][subKey].toLowerCase().includes(searchLower)) {
                results.push({
                  path: `${key}.${subKey}`,
                  label: `${key.replace(/([A-Z])/g, ' $1').trim()} - ${subKey}`,
                  value: obj[key][subKey],
                  section: 'tracks'
                });
              }
            }
          } else {
            searchInObject(obj[key], path ? `${path}.${key}` : key);
          }
        }
      }
    };

    searchInObject(config);
    setSearchResults(results.slice(0, 20));
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (result) => {
    // Map search results to tabs
    const sectionMap = {
      'heroEyebrow': 'hero',
      'heroTitle': 'hero',
      'heroText': 'hero',
      'heroButtonText': 'hero',
      'heroDecor': 'hero',
      'heroBgStart': 'hero',
      'heroBgMid': 'hero',
      'heroBgEnd': 'hero',
      'sectionTitleMy': 'section',
      'sectionTitleAll': 'section',
      'myCoursesTabText': 'section',
      'allCoursesTabText': 'section',
      'searchPlaceholder': 'section',
      'cardDurationLabel': 'cards',
      'cardStepsLabel': 'cards',
      'cardStepsText': 'cards',
      'enrolledBadgeText': 'cards',
      'viewCourseButtonText': 'cards',
      'continueLearningButtonText': 'cards',
      'emptyStateLoginTitle': 'empty',
      'emptyStateLoginText': 'empty',
      'emptyStateLoginButton': 'empty',
      'emptyStateNoCoursesTitle': 'empty',
      'emptyStateNoCoursesText': 'empty',
      'emptyStateNoCoursesButton': 'empty',
      'emptyStateNoAvailableTitle': 'empty',
      'emptyStateNoAvailableText': 'empty',
      'footerText': 'footer',
      'trackIcons': 'tracks',
      'trackColors': 'tracks',
      'themePreset': 'themes'
    };

    // Determine which tab to switch to
    let targetTab = 'hero';
    for (const [key, tab] of Object.entries(sectionMap)) {
      if (result.path.includes(key) || result.section === key) {
        targetTab = tab;
        break;
      }
    }

    setActiveTab(targetTab);
    setShowSearchResults(false);
    setSearchTerm('');
    
    // Scroll to the element after tab switch
    setTimeout(() => {
      const elementId = `search-result-${result.path.replace(/\./g, '-')}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.transition = 'background 0.5s';
        element.style.background = 'var(--primary-light)';
        setTimeout(() => {
          element.style.background = 'transparent';
        }, 2000);
      }
    }, 150);
  };

  // ColorPicker component with search
  const ColorPicker = ({ label, value, onChange, id, showGradient = true }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [pickerSearchTerm, setPickerSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleColorChange = (newColor) => {
      setInputValue(newColor);
      onChange(newColor);

      const updatedRecent = [
        newColor,
        ...recentColors.filter(c => c !== newColor)
      ].slice(0, 12);
      
      setRecentColors(updatedRecent);
      localStorage.setItem("recentColors", JSON.stringify(updatedRecent));
    };

    const handleInputChange = (e) => {
      const val = e.target.value;
      setInputValue(val);
      if (
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val) ||
        val.includes("gradient")
      ) {
        handleColorChange(val);
      }
    };

    const handleInputBlur = () => {
      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue) && !inputValue.includes("gradient")) {
        setInputValue(value);
      }
    };

    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    const allColors = Object.values(COLOR_LIBRARY).flat();
    
    const getFilteredColors = () => {
      let colors = selectedCategory === 'all' 
        ? allColors 
        : COLOR_LIBRARY[selectedCategory] || [];

      if (pickerSearchTerm) {
        colors = colors.filter(color => 
          color.toLowerCase().includes(pickerSearchTerm.toLowerCase())
        );
      }

      return colors;
    };

    const filteredColors = getFilteredColors();

    return (
      <div style={{ marginBottom: 12 }} id={id}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              style={{
                width: 40,
                height: 40,
                padding: 2,
                border: '2px solid var(--border-light)',
                borderRadius: 8,
                cursor: 'pointer',
                background: value || '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!value && <span style={{ color: '#999', fontSize: 12 }}>🎨</span>}
              {value && value.includes('gradient') && (
                <span style={{ fontSize: 20 }}>🌈</span>
              )}
            </button>
            {isPickerOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 8,
                padding: 16,
                background: 'var(--surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                zIndex: 1000,
                width: 320,
                maxHeight: 400,
                overflow: 'auto',
              }}>
                <div style={{ marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Search colors..."
                    value={pickerSearchTerm}
                    onChange={(e) => setPickerSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
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

                <div style={{ 
                  display: 'flex', 
                  gap: 4, 
                  flexWrap: 'wrap', 
                  marginBottom: 12,
                  maxHeight: 60,
                  overflow: 'auto',
                }}>
                  {['all', ...Object.keys(COLOR_LIBRARY)].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '4px 10px',
                        background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-base)',
                        color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 11,
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cat === 'all' ? '🌈 All' : cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: 4,
                  marginBottom: 8,
                }}>
                  {filteredColors.slice(0, 49).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        handleColorChange(color);
                        setIsPickerOpen(false);
                        setPickerSearchTerm('');
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        background: color,
                        border: value === color ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.2s',
                        boxShadow: value === color ? '0 0 0 2px var(--primary)' : 'none',
                      }}
                    />
                  ))}
                </div>

                {recentColors.length > 0 && (
                  <>
                    <div style={{ 
                      borderTop: '1px solid var(--border-light)', 
                      margin: '8px 0',
                      paddingTop: 8,
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>🕒 Recent</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {recentColors.slice(0, 7).map(color => (
                          <button
                            key={color}
                            onClick={() => {
                              handleColorChange(color);
                              setIsPickerOpen(false);
                            }}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 4,
                              background: color,
                              border: value === color ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: 8,
                  marginTop: 8,
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: 8,
                }}>
                  <button
                    onClick={() => {
                      handleColorChange(getRandomColor());
                      setIsPickerOpen(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: 4,
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    🎲 Random
                  </button>
                  {showGradient && (
                    <button
                      onClick={() => {
                        const gradient = 'linear-gradient(135deg, #3B2340, #5B3A63, #83698A)';
                        handleColorChange(gradient);
                        setIsPickerOpen(false);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 4,
                        border: '1px solid var(--border-light)',
                        background: 'linear-gradient(135deg, #3B2340, #5B3A63, #83698A)',
                        color: '#fff',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      🌈 Gradient
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
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
              setInputValue("");
              onChange("");
              setIsPickerOpen(false);
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

  // IconPicker component
  const IconPicker = ({ value, onChange, label, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [iconSearchTerm, setIconSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const allIcons = Object.values(ICON_LIBRARY).flat();
    const categories = ['all', ...Object.keys(ICON_LIBRARY)];

    const filteredIcons = selectedCategory === 'all' 
      ? allIcons 
      : ICON_LIBRARY[selectedCategory] || [];

    const searchedIcons = iconSearchTerm 
      ? filteredIcons.filter(icon => icon === iconSearchTerm || icon.includes(iconSearchTerm))
      : filteredIcons;

    return (
      <div style={{ marginBottom: 12 }} id={id}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: 50,
              height: 50,
              fontSize: 24,
              background: 'var(--bg-base)',
              border: '2px solid var(--border-light)',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {value || '🎨'}
          </button>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter emoji or icon"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--border-light)',
                fontSize: 14,
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            📚 Library
          </button>
          <button
            onClick={() => {
              const defaultVal = DEFAULT_MY_COURSES_CONFIG.trackIcons?.default || '📄';
              onChange(defaultVal);
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

        {isOpen && (
          <div style={{
            marginTop: 12,
            padding: 16,
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            maxHeight: 400,
            overflow: 'auto',
          }}>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search icons..."
                value={iconSearchTerm}
                onChange={(e) => setIconSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border-light)',
                  fontSize: 13,
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '4px 12px',
                    background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-base)',
                    color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    textTransform: 'capitalize',
                  }}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: 4 }}>
              {searchedIcons.slice(0, 50).map((icon, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onChange(icon);
                    setIsOpen(false);
                    setIconSearchTerm('');
                  }}
                  style={{
                    fontSize: 24,
                    padding: 8,
                    background: value === icon ? 'var(--primary)' : 'transparent',
                    border: value === icon ? '2px solid var(--primary)' : '1px solid transparent',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHeroTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Hero Section Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div id="search-result-heroEyebrow">
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
        <div id="search-result-heroTitle">
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
        <div id="search-result-heroText">
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
        <div id="search-result-heroButtonText">
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
        <IconPicker
          id="search-result-heroDecor"
          label="Hero Decor Emoji"
          value={config.heroDecor}
          onChange={(val) => updateConfig('heroDecor', val)}
        />
        <ColorPicker 
          id="search-result-heroBgStart"
          label="Hero Background Start" 
          value={config.heroBgStart} 
          onChange={(color) => updateConfig('heroBgStart', color)}
        />
        <ColorPicker 
          id="search-result-heroBgMid"
          label="Hero Background Middle" 
          value={config.heroBgMid} 
          onChange={(color) => updateConfig('heroBgMid', color)}
        />
        <ColorPicker 
          id="search-result-heroBgEnd"
          label="Hero Background End" 
          value={config.heroBgEnd} 
          onChange={(color) => updateConfig('heroBgEnd', color)}
        />
      </div>
    </div>
  );

  const renderSectionTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Section Bar Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div id="search-result-sectionTitleMy">
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
        <div id="search-result-sectionTitleAll">
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
        <div id="search-result-myCoursesTabText">
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
        <div id="search-result-allCoursesTabText">
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
        <div id="search-result-searchPlaceholder">
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
        <IconPicker
          id="search-result-cardDurationLabel"
          label="Duration Label"
          value={config.cardDurationLabel}
          onChange={(val) => updateConfig('cardDurationLabel', val)}
        />
        <IconPicker
          id="search-result-cardStepsLabel"
          label="Steps Label"
          value={config.cardStepsLabel}
          onChange={(val) => updateConfig('cardStepsLabel', val)}
        />
        <div id="search-result-cardStepsText">
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
        <div id="search-result-enrolledBadgeText">
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
        <div id="search-result-viewCourseButtonText">
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
        <div id="search-result-continueLearningButtonText">
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
        <div id="search-result-emptyStateLoginTitle">
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
        <div id="search-result-emptyStateLoginText">
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
        <div id="search-result-emptyStateLoginButton">
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
        <div id="search-result-emptyStateNoCoursesTitle">
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
        <div id="search-result-emptyStateNoCoursesText">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>No Courses Text</label>
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
        <div id="search-result-emptyStateNoCoursesButton">
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
        <div id="search-result-emptyStateNoAvailableTitle">
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
        <div id="search-result-emptyStateNoAvailableText">
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
      <div id="search-result-footerText">
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
          <div key={key} id={`search-result-trackIcons-${key}`} style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 1fr 40px',
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
              <button
                onClick={() => setEditingTrack(editingTrack === key ? null : key)}
                style={{
                  fontSize: 28,
                  padding: 4,
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {value || '📄'}
              </button>
              {editingTrack === key && (
                <div style={{
                  marginTop: 8,
                  padding: 8,
                  background: 'var(--surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 4,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(30px, 1fr))',
                  gap: 4,
                }}>
                  {Object.values(ICON_LIBRARY).flat().slice(0, 30).map(icon => (
                    <button
                      key={icon}
                      onClick={() => {
                        const newIcons = { ...config.trackIcons, [key]: icon };
                        updateConfig('trackIcons', newIcons);
                        setEditingTrack(null);
                      }}
                      style={{
                        fontSize: 20,
                        padding: 4,
                        background: value === icon ? 'var(--primary)' : 'transparent',
                        border: value === icon ? '2px solid var(--primary)' : '1px solid transparent',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div id={`search-result-trackColors-${key}`}>
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
            <button
              onClick={() => {
                const defaultIcon = DEFAULT_MY_COURSES_CONFIG.trackIcons[key] || '📄';
                const newIcons = { ...config.trackIcons, [key]: defaultIcon };
                updateConfig('trackIcons', newIcons);
                const defaultColor = DEFAULT_MY_COURSES_CONFIG.trackColors[key] || '#F2F1F6';
                const newColors = { ...config.trackColors, [key]: defaultColor };
                updateConfig('trackColors', newColors);
              }}
              style={{
                padding: '4px 8px',
                fontSize: 12,
                background: 'var(--bg-base)',
                border: '1px solid var(--border-light)',
                borderRadius: 4,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              ↺
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderThemesTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Theme Presets</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        Choose a theme preset to instantly change the hero section colors.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {Object.entries(THEME_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => applyThemePreset(key)}
            style={{
              padding: 16,
              background: config.themePreset === key ? 'var(--primary)' : 'var(--bg-base)',
              border: config.themePreset === key ? '2px solid var(--primary)' : '1px solid var(--border-light)',
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '100%',
              height: 60,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${preset.heroBgStart}, ${preset.heroBgMid}, ${preset.heroBgEnd})`,
              marginBottom: 8,
            }} />
            <div style={{
              fontSize: 14,
              fontWeight: config.themePreset === key ? 600 : 400,
              color: config.themePreset === key ? '#fff' : 'var(--text-primary)',
            }}>
              {preset.name}
            </div>
            {config.themePreset === key && (
              <div style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
                marginTop: 4,
              }}>
                ✓ Active
              </div>
            )}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-base)', borderRadius: 8 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Preview</h4>
        <div style={{
          padding: 16,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${config.heroBgStart || '#3B2340'}, ${config.heroBgMid || '#5B3A63'}, ${config.heroBgEnd || '#83698A'})`,
          color: '#fff',
        }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{config.heroEyebrow}</div>
          <div style={{ fontSize: 20, fontWeight: 600, margin: '4px 0' }}>{config.heroTitle}</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>{config.heroText}</div>
          <div style={{ fontSize: 32, marginTop: 8 }}>{config.heroDecor}</div>
        </div>
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
      case 'themes': return renderThemesTab();
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
    { id: 'themes', label: '🎨 Themes' },
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

      {/* Search Bar */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-base)',
        position: 'relative',
      }}>
        <div style={{ position: 'relative' }}>
          <span style={{ 
            position: 'absolute', 
            left: 12, 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: 16,
          }}>🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => performSearch(e.target.value)}
            placeholder="Search for settings... (e.g., 'hero', 'courses', 'enrolled')"
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: 16,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 24,
            right: 24,
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            marginTop: 4,
          }}>
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSearchResultClick(result)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-base)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <div>
                  <div style={{ 
                    fontSize: 13, 
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                  }}>
                    {result.label}
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 300,
                  }}>
                    {result.value}
                  </div>
                </div>
                <div style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-base)',
                  padding: '2px 10px',
                  borderRadius: 12,
                  textTransform: 'capitalize',
                }}>
                  {result.section}
                </div>
              </button>
            ))}
            {searchResults.length === 20 && (
              <div style={{
                padding: '8px 16px',
                textAlign: 'center',
                fontSize: 12,
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}>
                Showing first 20 results. Refine your search.
              </div>
            )}
          </div>
        )}

        {showSearchResults && searchResults.length === 0 && searchTerm && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 24,
            right: 24,
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 1000,
            padding: '16px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            marginTop: 4,
          }}>
            No results found for "{searchTerm}"
          </div>
        )}
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
            onClick={() => {
              setActiveTab(tab.id);
              setShowSearchResults(false);
            }}
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
          🔍 Search helps you find settings quickly
        </span>
      </div>
    </div>
  );
}