// src/components/Admin/HomeEditorTab.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { colors } from './AdminStyles';

// Icon Library with more categories and icons
const ICON_LIBRARY = {
  features: ["🏅", "⭐", "🌟", "💎", "🎯", "🚀", "🔥", "💪", "🎨", "🌈", "💡", "🔬", "📈", "🎓", "📚", "❤️", "💙", "💚", "💛", "🧡"],
  badges: ["🏅", "🥇", "🥈", "🥉", "🎖️", "🏆", "🎗️", "🏵️", "🎪"],
  communication: ["📢", "📣", "🔊", "📡", "💬", "🗣️", "📧", "📨", "📩", "📪", "📫", "📬", "📭", "📤", "📥"],
  learning: ["📖", "📘", "📙", "📕", "📗", "📔", "📚", "🎓", "📝", "📋", "📌", "📎", "✏️", "✒️", "🖊️", "🖋️"],
  emojis: ["😊", "🌟", "✨", "🎉", "🎊", "💫", "🌈", "🔥", "💯", "🎯", "👍", "👏", "🙌", "🤝", "💪", "🎈", "🎁", "🎀"],
  technology: ["💻", "🖥️", "⌨️", "🖱️", "📱", "📲", "💾", "💿", "📀", "🖨️", "📠", "☎️", "📞", "📟", "📡"],
  networking: ["🌐", "🌍", "🌎", "🌏", "📶", "🔗", "🛜", "📊", "📈", "📉", "🧮", "🔢", "🔣"],
  security: ["🔐", "🛡️", "🔒", "🔑", "🗝️", "⚔️", "🛡️", "🔓", "🛅", "⛑️"],
  design: ["🎨", "🖌️", "🖍️", "🎭", "🎪", "🎬", "🎵", "🎶", "🎸", "🎺", "🎻", "🥁", "🎹"],
};

// Theme Presets with expanded color options
const THEME_PRESETS = {
  default: {
    name: 'Default Blue',
    // Banner colors
    bannerBgColor: "#f5c842",
    bannerButtonColor: "#3abf94",
    // Welcome colors
    welcomeNewUserBg: "linear-gradient(135deg, #e5a800 0%, #f5c842 100%)",
    welcomeNoCoursesBg: "linear-gradient(135deg, #714B67 0%, #5B3A63 100%)",
    welcomeWithCoursesBg: "linear-gradient(135deg, #3abf94 0%, #2e9d7a 100%)",
    // Features colors
    featuresBgColor: "#5b8dbf",
    // CTA colors
    ctaButtonBg: "#e5a800",
    ctaButtonTextColor: "#fff",
    // Training colors
    trainingTopicColor: "#3a7fc1",
    trainingTopicHoverColor: "#e5a800",
    // Instructor colors
    instructorBgStart: "#4a7fb5",
    instructorBgEnd: "#6fa3d0",
    // Testimonials colors
    testimonialsBg: "#f0f2f5",
    testimonialCardBg: "#fff",
    testimonialHeaderBg: "#4a7fb5",
    testimonialTextColor: "#444",
    testimonialTitleColor: "#222",
    testimonialStarColor: "#f5c842",
    // Avatar colors
    avatarColors: ["#7aa3c8", "#6b9abf", "#5b8dbf"]
  },
  ocean: {
    name: 'Ocean Blue',
    bannerBgColor: "#1a8a8a",
    bannerButtonColor: "#0f5c5c",
    welcomeNewUserBg: "linear-gradient(135deg, #0f5c6b 0%, #1a8a8a 100%)",
    welcomeNoCoursesBg: "linear-gradient(135deg, #1a4a5a 0%, #2c6a7a 100%)",
    welcomeWithCoursesBg: "linear-gradient(135deg, #1a7a6a 0%, #2a9a8a 100%)",
    featuresBgColor: "#2c7a8a",
    ctaButtonBg: "#0f5c6b",
    ctaButtonTextColor: "#fff",
    trainingTopicColor: "#2c7a8a",
    trainingTopicHoverColor: "#1a8a8a",
    instructorBgStart: "#1a6a7a",
    instructorBgEnd: "#3a9aaa",
    testimonialsBg: "#e8f4f8",
    testimonialCardBg: "#fff",
    testimonialHeaderBg: "#1a6a7a",
    testimonialTextColor: "#333",
    testimonialTitleColor: "#1a4a5a",
    testimonialStarColor: "#f5c842",
    avatarColors: ["#1a6a7a", "#2c7a8a", "#3a9aaa"]
  },
  sunset: {
    name: 'Warm Sunset',
    bannerBgColor: "#e67e22",
    bannerButtonColor: "#d35400",
    welcomeNewUserBg: "linear-gradient(135deg, #d35400 0%, #e67e22 100%)",
    welcomeNoCoursesBg: "linear-gradient(135deg, #8e44ad 0%, #6c3483 100%)",
    welcomeWithCoursesBg: "linear-gradient(135deg, #d4ac0d 0%, #f1c40f 100%)",
    featuresBgColor: "#c0392b",
    ctaButtonBg: "#d35400",
    ctaButtonTextColor: "#fff",
    trainingTopicColor: "#c0392b",
    trainingTopicHoverColor: "#e67e22",
    instructorBgStart: "#c0392b",
    instructorBgEnd: "#e74c3c",
    testimonialsBg: "#fdf2e9",
    testimonialCardBg: "#fff",
    testimonialHeaderBg: "#c0392b",
    testimonialTextColor: "#444",
    testimonialTitleColor: "#222",
    testimonialStarColor: "#f5c842",
    avatarColors: ["#c0392b", "#e67e22", "#d35400"]
  },
  forest: {
    name: 'Forest Green',
    bannerBgColor: "#27ae60",
    bannerButtonColor: "#1e8449",
    welcomeNewUserBg: "linear-gradient(135deg, #1e8449 0%, #27ae60 100%)",
    welcomeNoCoursesBg: "linear-gradient(135deg, #1a3a2a 0%, #2d5a3f 100%)",
    welcomeWithCoursesBg: "linear-gradient(135deg, #2d7a3f 0%, #3a9a5f 100%)",
    featuresBgColor: "#2e7d32",
    ctaButtonBg: "#1e8449",
    ctaButtonTextColor: "#fff",
    trainingTopicColor: "#2e7d32",
    trainingTopicHoverColor: "#27ae60",
    instructorBgStart: "#1e8449",
    instructorBgEnd: "#27ae60",
    testimonialsBg: "#eaf5ea",
    testimonialCardBg: "#fff",
    testimonialHeaderBg: "#1e8449",
    testimonialTextColor: "#333",
    testimonialTitleColor: "#1a3a2a",
    testimonialStarColor: "#f5c842",
    avatarColors: ["#1e8449", "#2e7d32", "#27ae60"]
  },
  midnight: {
    name: 'Midnight Blue',
    bannerBgColor: "#2c3e50",
    bannerButtonColor: "#1a252f",
    welcomeNewUserBg: "linear-gradient(135deg, #1a1a2e 0%, #2c3e50 100%)",
    welcomeNoCoursesBg: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
    welcomeWithCoursesBg: "linear-gradient(135deg, #1a2e3a 0%, #2a4a5a 100%)",
    featuresBgColor: "#1a1a2e",
    ctaButtonBg: "#2c3e50",
    ctaButtonTextColor: "#fff",
    trainingTopicColor: "#2c3e50",
    trainingTopicHoverColor: "#4a6a8a",
    instructorBgStart: "#1a1a2e",
    instructorBgEnd: "#2c3e50",
    testimonialsBg: "#1a1a2e",
    testimonialCardBg: "#2a2a4a",
    testimonialHeaderBg: "#1a1a2e",
    testimonialTextColor: "#ccc",
    testimonialTitleColor: "#fff",
    testimonialStarColor: "#f5c842",
    avatarColors: ["#2c3e50", "#4a6a8a", "#6a8aaa"]
  },
  coral: {
    name: 'Coral Pink',
    bannerBgColor: "#ff6b6b",
    bannerButtonColor: "#c0392b",
    welcomeNewUserBg: "linear-gradient(135deg, #c0392b 0%, #ff6b6b 100%)",
    welcomeNoCoursesBg: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
    welcomeWithCoursesBg: "linear-gradient(135deg, #00b894 0%, #55efc4 100%)",
    featuresBgColor: "#d63031",
    ctaButtonBg: "#c0392b",
    ctaButtonTextColor: "#fff",
    trainingTopicColor: "#d63031",
    trainingTopicHoverColor: "#ff6b6b",
    instructorBgStart: "#d63031",
    instructorBgEnd: "#ff6b6b",
    testimonialsBg: "#fdf0f0",
    testimonialCardBg: "#fff",
    testimonialHeaderBg: "#d63031",
    testimonialTextColor: "#444",
    testimonialTitleColor: "#222",
    testimonialStarColor: "#f5c842",
    avatarColors: ["#d63031", "#ff6b6b", "#c0392b"]
  },
  lavender: {
    name: 'Lavender Dream',
    bannerBgColor: "#9b59b6",
    bannerButtonColor: "#8e44ad",
    welcomeNewUserBg: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
    welcomeNoCoursesBg: "linear-gradient(135deg, #6c3483 0%, #8e44ad 100%)",
    welcomeWithCoursesBg: "linear-gradient(135deg, #5b2d8a 0%, #7d3c98 100%)",
    featuresBgColor: "#7d3c98",
    ctaButtonBg: "#8e44ad",
    ctaButtonTextColor: "#fff",
    trainingTopicColor: "#7d3c98",
    trainingTopicHoverColor: "#9b59b6",
    instructorBgStart: "#6c3483",
    instructorBgEnd: "#9b59b6",
    testimonialsBg: "#f5eef8",
    testimonialCardBg: "#fff",
    testimonialHeaderBg: "#7d3c98",
    testimonialTextColor: "#444",
    testimonialTitleColor: "#222",
    testimonialStarColor: "#f5c842",
    avatarColors: ["#7d3c98", "#9b59b6", "#8e44ad"]
  },
  mint: {
    name: 'Mint Fresh',
    bannerBgColor: "#1abc9c",
    bannerButtonColor: "#16a085",
    welcomeNewUserBg: "linear-gradient(135deg, #16a085 0%, #1abc9c 100%)",
    welcomeNoCoursesBg: "linear-gradient(135deg, #0e6655 0%, #148f77 100%)",
    welcomeWithCoursesBg: "linear-gradient(135deg, #1a7a6a 0%, #2a9a8a 100%)",
    featuresBgColor: "#148f77",
    ctaButtonBg: "#16a085",
    ctaButtonTextColor: "#fff",
    trainingTopicColor: "#148f77",
    trainingTopicHoverColor: "#1abc9c",
    instructorBgStart: "#0e6655",
    instructorBgEnd: "#1abc9c",
    testimonialsBg: "#eafaf1",
    testimonialCardBg: "#fff",
    testimonialHeaderBg: "#148f77",
    testimonialTextColor: "#333",
    testimonialTitleColor: "#0e6655",
    testimonialStarColor: "#f5c842",
    avatarColors: ["#148f77", "#1abc9c", "#16a085"]
  }
};

// Default home page configuration
const DEFAULT_HOME_CONFIG = {
  // Banner
  bannerText: "Unlock Free Cisco Lessons – No Credit Card Needed!",
  bannerButtonText: "Sign up for Free",
  bannerButtonColor: "#3abf94",
  bannerBgColor: "#f5c842",
  
  // Welcome message for logged-in users
  welcomeNewUserMessage: "🎉 Welcome to Infocampus! Your account is ready — let's start your first lesson.",
  welcomeReturningNoCourses: "🌟 Ready to begin your journey? Explore our courses and start learning today!",
  welcomeReturningWithCourses: "👋 Welcome back! Continue learning from where you left off.",
  welcomeNewUserBg: "linear-gradient(135deg, #e5a800 0%, #f5c842 100%)",
  welcomeNoCoursesBg: "linear-gradient(135deg, #714B67 0%, #5B3A63 100%)",
  welcomeWithCoursesBg: "linear-gradient(135deg, #3abf94 0%, #2e9d7a 100%)",
  
  // CTA Button
  ctaButtonText: "Browse Courses →",
  ctaButtonBg: "#e5a800",
  ctaButtonTextColor: "#fff",
  
  // Tagline
  taglineLine1: "Complex networking topics explained in the simplest way possible...",
  taglineLine2: "Including Cisco CCNA, CCNP and CCIE Enterprise Infrastructure.",
  
  // Features Section
  featuresBgColor: "#5b8dbf",
  features: [
    {
      icon: "🏅",
      title: "Exclusive Content",
      desc: "809 lessons and I am constantly adding new lessons, videos and reference material. Everything is explained in the simplest way possible."
    },
    {
      icon: "❤️",
      title: "Start for Free",
      desc: "Create your free account and start learning right away. Explore 328 free lessons, experience our teaching style, and learn at your own pace."
    },
    {
      icon: "📢",
      title: "Community Forum",
      desc: "Do you still have questions after viewing some of the lessons? We have a community forum where we help out members with answers."
    }
  ],
  
  // Training Topics
  trainingTopics: [
    ["Subnetting", "Switching", "Spanning-Tree", "Frame-Relay"],
    ["RIP", "EIGRP", "OSPF", "BGP"],
    ["Multicast", "IPv6", "QoS", "MPLS"],
    ["Security", "IP Routing", "Network Services", "Linux"],
    ["GRE", "IOS", "DMVPN", "PIM"],
    ["NAT", "ACL", "VPN", "IPSec"]
  ],
  trainingTopicColor: "#3a7fc1",
  trainingTopicHoverColor: "#e5a800",
  
  // Instructor Section
  instructorTitle: "Stop Struggling & Start Learning",
  instructorText: "My name is Rene, and I am here to help you to achieve your goals. Do you want to upgrade your skills? Want to start a career in networking? Become a CCIE in Enterprise Infrastructure? Let me help you! After teaching Cisco classroom courses for several years I decided to share my knowledge online on Infocampus.com.",
  instructorName: "Rene Molenaar",
  instructorTitle2: "CCIE #41726, founder of Infocampus.com (and primary course author)",
  instructorBgStart: "#4a7fb5",
  instructorBgEnd: "#6fa3d0",
  
  // Testimonials
  testimonialsBg: "#f0f2f5",
  testimonials: [
    {
      name: "ETHAN MORISSETTE",
      role: "Network Analyst",
      date: "March 18, 2025",
      title: "Beyond Expectations",
      text: "What can I say... infocampus.com is such a well put together site. The content helped me build my knowledge, link certain topics together, and deepen my understanding of networking.",
      initials: "EM",
      color: "#7aa3c8"
    },
    {
      name: "MURAT BILGIN",
      role: "Senior Systems Analyst",
      date: "December 17, 2024",
      title: "Clear and Concise",
      text: "Preparing for my ENRSI, I am a visual learner and learn best from examples. I like that I can follow along using CML/GNS3 to understand the basics and mechanics.",
      initials: "MB",
      color: "#6b9abf"
    },
    {
      name: "FARRAKH GILANI",
      role: "Network Engineer",
      date: "March 19, 2025",
      title: "Ideal for Certification",
      text: "infocampus.com is simply the best trainer. Topics are explained in a way that makes them easy to understand. The content's quality and clear explanations make it ideal for certification.",
      initials: "FG",
      color: "#5b8dbf"
    }
  ],
  testimonialsSignupText: "3414 people signed up the last 30 days!",
  themePreset: 'default'
};

// Enhanced Icon Picker Component - Improved
const IconPicker = ({ value, onChange, label, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentIcons, setRecentIcons] = useState([]);

  const allIcons = Object.values(ICON_LIBRARY).flat();
  const categories = ['all', ...Object.keys(ICON_LIBRARY)];

  // Load recent icons from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentIcons');
    if (saved) {
      try {
        setRecentIcons(JSON.parse(saved));
      } catch {
        setRecentIcons([]);
      }
    }
  }, []);

  const filteredIcons = selectedCategory === 'all' 
    ? allIcons 
    : ICON_LIBRARY[selectedCategory] || [];

  const searchedIcons = searchTerm 
    ? filteredIcons.filter(icon => icon === searchTerm || icon.includes(searchTerm))
    : filteredIcons;

  const handleIconSelect = (icon) => {
    onChange(icon);
    // Save to recent icons
    const updatedRecent = [icon, ...recentIcons.filter(i => i !== icon)].slice(0, 12);
    setRecentIcons(updatedRecent);
    localStorage.setItem('recentIcons', JSON.stringify(updatedRecent));
    setIsOpen(false);
    setSearchTerm('');
  };

  if (compact) {
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 36,
            height: 36,
            fontSize: 20,
            background: 'var(--bg-base)',
            border: '1px solid var(--border-light)',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          title="Click to select icon"
        >
          {value || '⭐'}
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Icon"
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid var(--border-light)',
            fontSize: 14,
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            padding: 10,
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 1000,
            width: 280,
            maxHeight: 280,
            overflow: 'auto',
          }}>
            {/* Search input */}
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px solid var(--border-light)',
                fontSize: 12,
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
                outline: 'none',
                marginBottom: 8,
              }}
            />
            
            {/* Recent icons */}
            {recentIcons.length > 0 && !searchTerm && (
              <>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Recent
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, marginBottom: 8 }}>
                  {recentIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => handleIconSelect(icon)}
                      style={{
                        fontSize: 18,
                        padding: 4,
                        background: value === icon ? 'var(--primary)' : 'transparent',
                        border: value === icon ? '1px solid var(--primary)' : '1px solid transparent',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {categories.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '2px 8px',
                    background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-base)',
                    color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 10,
                    textTransform: 'capitalize',
                  }}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            {/* Icons grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
              {searchedIcons.slice(0, 30).map(icon => (
                <button
                  key={icon}
                  onClick={() => handleIconSelect(icon)}
                  style={{
                    fontSize: 18,
                    padding: 4,
                    background: value === icon ? 'var(--primary)' : 'transparent',
                    border: value === icon ? '1px solid var(--primary)' : '1px solid transparent',
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
  }

  return (
    <div style={{ marginBottom: 12, position: 'relative' }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 50,
            height: 50,
            fontSize: 28,
            background: 'var(--bg-base)',
            border: '2px solid var(--border-light)',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          title="Click to open icon library"
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
            padding: '8px 16px',
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
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 8,
          padding: 16,
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 1000,
          width: '100%',
          maxHeight: 420,
          overflow: 'auto',
        }}>
          {/* Search */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="🔍 Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* Recent Icons */}
          {recentIcons.length > 0 && !searchTerm && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
                ⏱️ Recently Used
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
                {recentIcons.slice(0, 8).map(icon => (
                  <button
                    key={icon}
                    onClick={() => handleIconSelect(icon)}
                    style={{
                      fontSize: 22,
                      padding: 6,
                      background: value === icon ? 'var(--primary)' : 'var(--bg-base)',
                      border: value === icon ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      borderRadius: 6,
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

          {/* Categories */}
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
                  transition: 'all 0.2s',
                }}
              >
                {cat.replace('_', ' ')}
                {selectedCategory === cat && ' ✓'}
              </button>
            ))}
          </div>

          {/* Icons Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))', 
            gap: 4,
            maxHeight: 200,
            overflow: 'auto',
          }}>
            {searchedIcons.slice(0, 80).map((icon, idx) => (
              <button
                key={idx}
                onClick={() => handleIconSelect(icon)}
                style={{
                  fontSize: 24,
                  padding: 8,
                  background: value === icon ? 'var(--primary)' : 'var(--bg-base)',
                  border: value === icon ? '2px solid var(--primary)' : '1px solid transparent',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
          
          {searchedIcons.length === 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>
              No icons found. Try a different search term.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function HomeEditorTab({ onSave, initialConfig }) {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('homePageConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_HOME_CONFIG, ...parsed };
      } catch {
        return DEFAULT_HOME_CONFIG;
      }
    }
    return DEFAULT_HOME_CONFIG;
  });

  const [activeTab, setActiveTab] = useState('themes');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [expandedThemeColors, setExpandedThemeColors] = useState(null);

  useEffect(() => {
    localStorage.setItem('homePageConfig', JSON.stringify(config));
    if (onSave) onSave(config);
  }, [config, onSave]);

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
        } else if (Array.isArray(obj[key])) {
          if (key === 'features' || key === 'testimonials') {
            obj[key].forEach((item, index) => {
              for (const field in item) {
                if (typeof item[field] === 'string' && 
                    item[field].toLowerCase().includes(searchLower)) {
                  results.push({
                    path: `${key}.${index}.${field}`,
                    label: `${key.slice(0, -1)} ${index + 1} - ${field}`,
                    value: item[field],
                    section: key
                  });
                }
              }
            });
          } else if (key === 'trainingTopics') {
            obj[key].forEach((row, rowIndex) => {
              row.forEach((topic, colIndex) => {
                if (typeof topic === 'string' && 
                    topic.toLowerCase().includes(searchLower)) {
                  results.push({
                    path: `${key}.${rowIndex}.${colIndex}`,
                    label: `Training Topic: ${topic}`,
                    value: topic,
                    section: 'training'
                  });
                }
              });
            });
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          searchInObject(obj[key], path ? `${path}.${key}` : key);
        }
      }
    };

    searchInObject(config);
    setSearchResults(results.slice(0, 20));
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (result) => {
    const sectionMap = {
      'bannerText': 'banner',
      'bannerButtonText': 'banner',
      'bannerBgColor': 'banner',
      'bannerButtonColor': 'banner',
      'welcomeNewUserMessage': 'welcome',
      'welcomeReturningNoCourses': 'welcome',
      'welcomeReturningWithCourses': 'welcome',
      'welcomeNewUserBg': 'welcome',
      'welcomeNoCoursesBg': 'welcome',
      'welcomeWithCoursesBg': 'welcome',
      'ctaButtonText': 'cta',
      'ctaButtonBg': 'cta',
      'ctaButtonTextColor': 'cta',
      'taglineLine1': 'tagline',
      'taglineLine2': 'tagline',
      'featuresBgColor': 'features',
      'features': 'features',
      'trainingTopicColor': 'training',
      'trainingTopicHoverColor': 'training',
      'trainingTopics': 'training',
      'instructorTitle': 'instructor',
      'instructorText': 'instructor',
      'instructorName': 'instructor',
      'instructorTitle2': 'instructor',
      'instructorBgStart': 'instructor',
      'instructorBgEnd': 'instructor',
      'testimonialsBg': 'testimonials',
      'testimonials': 'testimonials',
      'testimonialsSignupText': 'testimonials',
      'themePreset': 'themes'
    };

    const tabId = sectionMap[result.section] || 'banner';
    setActiveTab(tabId);
    setShowSearchResults(false);
    setSearchTerm('');
    
    setTimeout(() => {
      const element = document.getElementById(`search-result-${result.path}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.transition = 'background 0.5s';
        element.style.background = 'var(--primary-light)';
        setTimeout(() => {
          element.style.background = 'transparent';
        }, 2000);
      }
    }, 100);
  };

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

  const updateFeature = (index, field, value) => {
    setConfig(prev => {
      const newFeatures = [...prev.features];
      newFeatures[index] = { ...newFeatures[index], [field]: value };
      return { ...prev, features: newFeatures };
    });
  };

  const updateTestimonial = (index, field, value) => {
    setConfig(prev => {
      const newTestimonials = [...prev.testimonials];
      newTestimonials[index] = { ...newTestimonials[index], [field]: value };
      return { ...prev, testimonials: newTestimonials };
    });
  };

  const addFeature = () => {
    setConfig(prev => ({
      ...prev,
      features: [...prev.features, { icon: '⭐', title: 'New Feature', desc: 'Description here...' }]
    }));
  };

  const removeFeature = (index) => {
    if (config.features.length <= 1) {
      Swal.fire('Cannot remove', 'You need at least one feature.', 'warning');
      return;
    }
    setConfig(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addTestimonial = () => {
    setConfig(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { 
        name: 'NAME HERE', 
        role: 'Role', 
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        title: 'Title', 
        text: 'Testimonial text here...',
        initials: 'NH',
        color: '#7aa3c8'
      }]
    }));
  };

  const removeTestimonial = (index) => {
    if (config.testimonials.length <= 1) {
      Swal.fire('Cannot remove', 'You need at least one testimonial.', 'warning');
      return;
    }
    setConfig(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };

  const applyThemePreset = (presetKey) => {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      setConfig(prev => ({
        ...prev,
        ...preset,
        themePreset: presetKey
      }));
    }
  };

  const resetToDefaults = async () => {
    const result = await Swal.fire({
      title: 'Reset to Defaults?',
      text: 'This will reset all home page settings to default values.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reset',
      confirmButtonColor: colors.coral,
    });
    if (result.isConfirmed) {
      setConfig(DEFAULT_HOME_CONFIG);
      localStorage.setItem('homePageConfig', JSON.stringify(DEFAULT_HOME_CONFIG));
      Swal.fire('Reset!', 'Home page settings have been reset to defaults.', 'success');
    }
  };

// Enhanced Color Picker Component - Fixed
const ColorPicker = ({ label, value, onChange, path, id, showGradient = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentColors, setRecentColors] = useState([]);
  const [inputValue, setInputValue] = useState(value);
  // Removed: const [selectedColor, setSelectedColor] = useState(value);

  // Color Library with categories
  const COLOR_LIBRARY = {
    reds: ['#FF0000', '#FF4444', '#FF6B6B', '#FF8A8A', '#FFB3B3', '#FFD1D1', '#8B0000', '#CC0000', '#DC143C', '#B22222'],
    oranges: ['#FF8C00', '#FFA500', '#FFB347', '#FFC966', '#FFD700', '#FFE4B5', '#FF7F50', '#FF6347', '#FF4500', '#FFA07A'],
    yellows: ['#FFFF00', '#FFF44F', '#F0E68C', '#FFD700', '#FFDF00', '#F0E68C', '#FFE4B5', '#FAFAD2', '#FFFFE0', '#FFFACD'],
    greens: ['#00FF00', '#32CD32', '#7CFC00', '#00FA9A', '#00FF7F', '#3CB371', '#2E8B57', '#228B22', '#006400', '#008000'],
    blues: ['#0000FF', '#4169E1', '#1E90FF', '#00BFFF', '#87CEEB', '#87CEFA', '#4682B4', '#5F9EA0', '#6495ED', '#7B68EE'],
    purples: ['#800080', '#9370DB', '#8A2BE2', '#9400D3', '#9932CC', '#BA55D3', '#DA70D6', '#DDA0DD', '#EE82EE', '#FF00FF'],
    pinks: ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FF99CC', '#FF66B2', '#FF3399', '#FF0066', '#FF0040', '#FF80BF'],
    grays: ['#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC', '#E8E8E8', '#F0F0F0', '#F8F8F8', '#696969', '#2F4F4F'],
    browns: ['#8B4513', '#A0522D', '#A52A2A', '#D2691E', '#CD853F', '#DEB887', '#D2B48C', '#BC8F8F', '#F4A460', '#DAA520'],
    teals: ['#008080', '#20B2AA', '#48D1CC', '#40E0D0', '#00CED1', '#5F9EA0', '#66CDAA', '#00CDCD', '#00B4D8', '#0077B6'],
    indigos: ['#4B0082', '#483D8B', '#6A5ACD', '#7B68EE', '#8A2BE2', '#9370DB', '#9B59B6', '#A569BD', '#AF7AC5', '#BB8FCE'],
    corals: ['#FF7F50', '#FF6347', '#FF6B6B', '#FF8C69', '#FFA07A', '#FA8072', '#E9967A', '#F08080', '#CD5C5C', '#DC143C']
  };

  // Get all colors from library
  const getAllColors = () => {
    return Object.values(COLOR_LIBRARY).flat();
  };

  // Load recent colors from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentColors');
    if (saved) {
      try {
        setRecentColors(JSON.parse(saved));
      } catch {
        setRecentColors([]);
      }
    }
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter colors based on search and category
  const getFilteredColors = () => {
    let colors = selectedCategory === 'all' 
      ? getAllColors() 
      : COLOR_LIBRARY[selectedCategory] || [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      colors = colors.filter(color => {
        // Search by hex value
        if (color.toLowerCase().includes(term)) return true;
        // Search by color name (approximate)
        const colorNames = {
          '#FF0000': 'red', '#FF4444': 'red', '#FF6B6B': 'red',
          '#FF8C00': 'orange', '#FFA500': 'orange',
          '#FFFF00': 'yellow', '#FFF44F': 'yellow',
          '#00FF00': 'green', '#32CD32': 'green',
          '#0000FF': 'blue', '#4169E1': 'blue',
          '#800080': 'purple', '#9370DB': 'purple',
          '#FF69B4': 'pink', '#FF1493': 'pink',
          '#808080': 'gray', '#A9A9A9': 'gray',
          '#8B4513': 'brown', '#A0522D': 'brown',
          '#008080': 'teal', '#20B2AA': 'teal',
          '#4B0082': 'indigo', '#483D8B': 'indigo',
          '#FF7F50': 'coral', '#FF6347': 'coral'
        };
        const name = colorNames[color.toUpperCase()] || '';
        return name.includes(term);
      });
    }
    return colors;
  };

  const filteredColors = getFilteredColors();

  // Check if value is a gradient
  const isGradient = value && value.includes('gradient');

  // Handle color change
  const handleColorChange = (newColor) => {
    setInputValue(newColor);
    onChange(path, newColor);

    // Save to recent colors
    const updatedRecent = [newColor, ...recentColors.filter(c => c !== newColor)].slice(0, 12);
    setRecentColors(updatedRecent);
    localStorage.setItem('recentColors', JSON.stringify(updatedRecent));
  };

  // Handle color selection from library
  const handleColorSelect = (newColor) => {
    handleColorChange(newColor);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle manual input
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val) || val.includes('gradient')) {
      handleColorChange(val);
    }
  };

  const handleInputBlur = () => {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue) && !inputValue.includes('gradient')) {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue) || inputValue.includes('gradient')) {
        handleColorChange(inputValue);
        setIsOpen(false);
      }
    }
  };

  // Get category names with emojis
  const getCategoryLabel = (cat) => {
    const labels = {
      'all': '🎨 All Colors',
      'reds': '🔴 Reds',
      'oranges': '🟠 Oranges',
      'yellows': '🟡 Yellows',
      'greens': '🟢 Greens',
      'blues': '🔵 Blues',
      'purples': '🟣 Purples',
      'pinks': '💗 Pinks',
      'grays': '⬜ Grays',
      'browns': '🟤 Browns',
      'teals': '🩵 Teals',
      'indigos': '💜 Indigos',
      'cools': '❄️ Cool Colors',
      'warms': '🔥 Warm Colors'
    };
    return labels[cat] || cat;
  };

  return (
    <div style={{ marginBottom: 12 }} id={id}>
      <label style={{ 
        fontSize: 13, 
        fontWeight: 500, 
        color: 'var(--text-primary)', 
        display: 'block', 
        marginBottom: 4 
      }}>
        {label}
      </label>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Color Preview Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            title="Click to open color library"
            style={{
              width: 44,
              height: 44,
              padding: 3,
              border: '2px solid var(--border-light)',
              borderRadius: 8,
              cursor: 'pointer',
              background: isGradient ? value : (value || '#4f46e5'),
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!value && <span style={{ color: '#999', fontSize: 14 }}>🎨</span>}
            {isGradient && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: value,
              }} />
            )}
            {value && !isGradient && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: value,
                borderRadius: 6,
              }} />
            )}
            <span style={{
              position: 'absolute',
              bottom: 2,
              right: 4,
              fontSize: 10,
              opacity: 0.7,
              color: isGradient ? '#fff' : '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}>▼</span>
          </button>

          {/* Color Library Dropdown */}
          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 8,
              padding: 16,
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              zIndex: 1000,
              width: 340,
              maxHeight: 480,
              overflow: 'auto',
            }}>
              {/* Search Input */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search colors (red, blue, #FF0000...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: 6,
                      border: '1px solid var(--border-light)',
                      fontSize: 13,
                      background: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    fontSize: 14,
                  }}>🔍</span>
                </div>
              </div>

              {/* Recent Colors */}
              {recentColors.length > 0 && !searchTerm && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ 
                    fontSize: 11, 
                    color: 'var(--text-secondary)', 
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    ⏱️ Recently Used
                    <button
                      onClick={() => {
                        localStorage.removeItem('recentColors');
                        setRecentColors([]);
                      }}
                      style={{
                        marginLeft: 'auto',
                        padding: '2px 8px',
                        fontSize: 10,
                        background: 'transparent',
                        border: '1px solid var(--border-light)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(8, 1fr)', 
                    gap: 4 
                  }}>
                    {recentColors.slice(0, 8).map((color, idx) => (
                      <button
                        key={`recent-${color}-${idx}`}
                        onClick={() => handleColorSelect(color)}
                        title={color}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: color,
                          border: value === color ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'all 0.2s',
                          position: 'relative',
                        }}
                      >
                        {value === color && (
                          <span style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#fff',
                            fontSize: 12,
                            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                          }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Tabs */}
              {!searchTerm && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{
                    display: 'flex',
                    gap: 4,
                    flexWrap: 'wrap',
                    maxHeight: 80,
                    overflow: 'auto',
                  }}>
                    {Object.keys(COLOR_LIBRARY).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          padding: '3px 10px',
                          background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-base)',
                          color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 11,
                          textTransform: 'capitalize',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getCategoryLabel(cat)}
                        {selectedCategory === cat && ' ✓'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 4,
                maxHeight: 200,
                overflow: 'auto',
                padding: '4px 0',
              }}>
                {filteredColors.slice(0, 64).map((color, idx) => (
                  <button
                    key={`${color}-${idx}`}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: color,
                      border: value === color ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    {value === color && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#fff',
                        fontSize: 12,
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      }}>✓</span>
                    )}
                  </button>
                ))}
              </div>

              {filteredColors.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 20, 
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                }}>
                  No colors found. Try a different search term.
                </div>
              )}

              {/* Manual Color Input */}
              <div style={{ 
                marginTop: 12, 
                paddingTop: 12, 
                borderTop: '1px solid var(--border-light)',
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Enter hex (#FF0000) or gradient"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid var(--border-light)',
                      fontSize: 12,
                      background: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {
                      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                      handleColorSelect(randomColor);
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    🎲 Random
                  </button>
                </div>
                {isGradient && (
                  <div style={{ 
                    marginTop: 6, 
                    height: 8, 
                    borderRadius: 4,
                    background: value,
                    border: '1px solid var(--border-light)'
                  }} />
                )}
                <div style={{ 
                  fontSize: 10, 
                  color: 'var(--text-secondary)', 
                  marginTop: 4,
                  display: 'flex',
                  gap: 8,
                }}>
                  <span>💡 Tip: Press Enter to apply</span>
                  <span>•</span>
                  <span>Gradient: linear-gradient(135deg, #color1, #color2)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Color Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
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
            fontFamily: 'monospace',
          }}
        />

        {/* Reset Button */}
        <button
          onClick={() => {
            const defaultVal = DEFAULT_HOME_CONFIG[path.split('.').pop()] || '';
            handleColorChange(defaultVal);
          }}
          title="Reset to default color"
          style={{
            padding: '6px 12px',
            fontSize: 12,
            background: 'var(--bg-base)',
            border: '1px solid var(--border-light)',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
        >
          ↺ Reset
        </button>

        {/* Color Preview Label */}
        {value && !isGradient && (
          <div style={{
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 10,
            background: value,
            color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            minWidth: 30,
            textAlign: 'center',
          }}>
            {value.slice(0, 7)}
          </div>
        )}
      </div>

      {/* Gradient Preview */}
      {isGradient && showGradient && (
        <div style={{ 
          marginTop: 6, 
          height: 8, 
          borderRadius: 4,
          background: value,
          border: '1px solid var(--border-light)'
        }} />
      )}
    </div>
  );
};
  // Tab render functions
  const renderBannerTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Top Banner Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div id="search-result-bannerText">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Banner Text</label>
          <input
            type="text"
            value={config.bannerText}
            onChange={(e) => updateConfig('bannerText', e.target.value)}
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
        <div id="search-result-bannerButtonText">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Button Text</label>
          <input
            type="text"
            value={config.bannerButtonText}
            onChange={(e) => updateConfig('bannerButtonText', e.target.value)}
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
        <ColorPicker id="search-result-bannerBgColor" label="Banner Background Color" value={config.bannerBgColor} onChange={updateConfig} path="bannerBgColor" />
        <ColorPicker id="search-result-bannerButtonColor" label="Button Color" value={config.bannerButtonColor} onChange={updateConfig} path="bannerButtonColor" />
      </div>
    </div>
  );

  const renderWelcomeTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Welcome Message Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div id="search-result-welcomeNewUserMessage">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>New User Welcome Message</label>
          <textarea
            value={config.welcomeNewUserMessage}
            onChange={(e) => updateConfig('welcomeNewUserMessage', e.target.value)}
            rows={2}
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
        <div id="search-result-welcomeReturningNoCourses">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Returning User (No Courses)</label>
          <textarea
            value={config.welcomeReturningNoCourses}
            onChange={(e) => updateConfig('welcomeReturningNoCourses', e.target.value)}
            rows={2}
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
        <div id="search-result-welcomeReturningWithCourses">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Returning User (With Courses)</label>
          <textarea
            value={config.welcomeReturningWithCourses}
            onChange={(e) => updateConfig('welcomeReturningWithCourses', e.target.value)}
            rows={2}
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
        <ColorPicker id="search-result-welcomeNewUserBg" label="New User Background" value={config.welcomeNewUserBg} onChange={updateConfig} path="welcomeNewUserBg" />
        <ColorPicker id="search-result-welcomeNoCoursesBg" label="No Courses Background" value={config.welcomeNoCoursesBg} onChange={updateConfig} path="welcomeNoCoursesBg" />
        <ColorPicker id="search-result-welcomeWithCoursesBg" label="With Courses Background" value={config.welcomeWithCoursesBg} onChange={updateConfig} path="welcomeWithCoursesBg" />
      </div>
    </div>
  );

  const renderCTATab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>CTA Button Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div id="search-result-ctaButtonText">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Button Text</label>
          <input
            type="text"
            value={config.ctaButtonText}
            onChange={(e) => updateConfig('ctaButtonText', e.target.value)}
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
        <ColorPicker id="search-result-ctaButtonBg" label="Button Background" value={config.ctaButtonBg} onChange={updateConfig} path="ctaButtonBg" />
        <ColorPicker id="search-result-ctaButtonTextColor" label="Button Text Color" value={config.ctaButtonTextColor} onChange={updateConfig} path="ctaButtonTextColor" />
      </div>
    </div>
  );

  const renderTaglineTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Tagline Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div id="search-result-taglineLine1">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Tagline Line 1</label>
          <input
            type="text"
            value={config.taglineLine1}
            onChange={(e) => updateConfig('taglineLine1', e.target.value)}
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
        <div id="search-result-taglineLine2">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Tagline Line 2</label>
          <input
            type="text"
            value={config.taglineLine2}
            onChange={(e) => updateConfig('taglineLine2', e.target.value)}
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

  const renderFeaturesTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Features Section</h3>
        <button
          onClick={addFeature}
          style={{
            padding: '8px 16px',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ＋ Add Feature
        </button>
      </div>
      <ColorPicker id="search-result-featuresBgColor" label="Features Background" value={config.featuresBgColor} onChange={updateConfig} path="featuresBgColor" />
      <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
        {config.features.map((feature, index) => (
          <div key={index} id={`search-result-features.${index}`} style={{
            padding: 16,
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            background: 'var(--surface)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Feature {index + 1}
              </span>
              <button
                onClick={() => removeFeature(index)}
                style={{
                  padding: '4px 12px',
                  background: 'var(--error)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                ✕ Remove
              </button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <IconPicker
                label="Icon (emoji)"
                value={feature.icon}
                onChange={(val) => updateFeature(index, 'icon', val)}
              />
              <div id={`search-result-features.${index}.title`}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Title</label>
                <input
                  type="text"
                  value={feature.title}
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
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
              <div id={`search-result-features.${index}.desc`}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  value={feature.desc}
                  onChange={(e) => updateFeature(index, 'desc', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
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
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrainingTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Training Topics</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <ColorPicker id="search-result-trainingTopicColor" label="Topic Color" value={config.trainingTopicColor} onChange={updateConfig} path="trainingTopicColor" />
        <ColorPicker id="search-result-trainingTopicHoverColor" label="Topic Hover Color" value={config.trainingTopicHoverColor} onChange={updateConfig} path="trainingTopicHoverColor" />
        <div id="search-result-trainingTopics">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Topics (comma separated per row)</label>
          <textarea
            value={config.trainingTopics.map(row => row.join(', ')).join('\n')}
            onChange={(e) => {
              const rows = e.target.value.split('\n').filter(r => r.trim());
              const newTopics = rows.map(row => row.split(',').map(item => item.trim()).filter(Boolean));
              updateConfig('trainingTopics', newTopics.length ? newTopics : DEFAULT_HOME_CONFIG.trainingTopics);
            }}
            rows={8}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
              fontSize: 14,
              background: 'var(--bg-base)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Enter each row on a new line, topics separated by commas
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstructorTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Instructor Section</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div id="search-result-instructorTitle">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Title</label>
          <input
            type="text"
            value={config.instructorTitle}
            onChange={(e) => updateConfig('instructorTitle', e.target.value)}
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
        <div id="search-result-instructorText">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Text</label>
          <textarea
            value={config.instructorText}
            onChange={(e) => updateConfig('instructorText', e.target.value)}
            rows={4}
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
        <div id="search-result-instructorName">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Instructor Name</label>
          <input
            type="text"
            value={config.instructorName}
            onChange={(e) => updateConfig('instructorName', e.target.value)}
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
        <div id="search-result-instructorTitle2">
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Title/Role</label>
          <input
            type="text"
            value={config.instructorTitle2}
            onChange={(e) => updateConfig('instructorTitle2', e.target.value)}
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
        <ColorPicker id="search-result-instructorBgStart" label="Background Start Color" value={config.instructorBgStart} onChange={updateConfig} path="instructorBgStart" />
        <ColorPicker id="search-result-instructorBgEnd" label="Background End Color" value={config.instructorBgEnd} onChange={updateConfig} path="instructorBgEnd" />
      </div>
    </div>
  );

  const renderTestimonialsTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Testimonials</h3>
        <button
          onClick={addTestimonial}
          style={{
            padding: '8px 16px',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ＋ Add Testimonial
        </button>
      </div>
      <ColorPicker id="search-result-testimonialsBg" label="Testimonials Background" value={config.testimonialsBg} onChange={updateConfig} path="testimonialsBg" />
      <div id="search-result-testimonialsSignupText">
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Signup Text</label>
        <input
          type="text"
          value={config.testimonialsSignupText}
          onChange={(e) => updateConfig('testimonialsSignupText', e.target.value)}
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
      <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
        {config.testimonials.map((testimonial, index) => (
          <div key={index} id={`search-result-testimonials.${index}`} style={{
            padding: 16,
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Testimonial {index + 1}</span>
              <button
                onClick={() => removeTestimonial(index)}
                style={{
                  padding: '4px 12px',
                  background: 'var(--error)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                ✕ Remove
              </button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div id={`search-result-testimonials.${index}.name`}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Name</label>
                <input
                  type="text"
                  value={testimonial.name}
                  onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
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
              <div id={`search-result-testimonials.${index}.role`}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Role</label>
                <input
                  type="text"
                  value={testimonial.role}
                  onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
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
              <div id={`search-result-testimonials.${index}.date`}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Date</label>
                <input
                  type="text"
                  value={testimonial.date}
                  onChange={(e) => updateTestimonial(index, 'date', e.target.value)}
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
              <div id={`search-result-testimonials.${index}.title`}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Title</label>
                <input
                  type="text"
                  value={testimonial.title}
                  onChange={(e) => updateTestimonial(index, 'title', e.target.value)}
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
              <div id={`search-result-testimonials.${index}.text`}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Text</label>
                <textarea
                  value={testimonial.text}
                  onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-light)',
                    fontSize: 14,
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
              <ColorPicker 
                id={`search-result-testimonials.${index}.color`}
                label="Avatar Color" 
                value={testimonial.color} 
                onChange={(path, value) => updateTestimonial(index, 'color', value)} 
                path={`testimonials.${index}.color`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Enhanced Themes Tab
  const renderThemesTab = () => {
    
    return (
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
          🎨 Theme Presets & Custom Colors
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Choose a theme preset or customize individual colors below.
        </p>

        {/* Theme Preset Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
          gap: 12,
          marginBottom: 24,
        }}>
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyThemePreset(key)}
              style={{
                padding: 12,
                background: config.themePreset === key ? 'var(--primary)' : 'var(--bg-base)',
                border: config.themePreset === key ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: '100%',
                height: 30,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${preset.bannerBgColor || '#f5c842'}, ${preset.instructorBgStart || '#4a7fb5'})`,
                marginBottom: 6,
              }} />
              <div style={{
                fontSize: 13,
                fontWeight: config.themePreset === key ? 600 : 400,
                color: config.themePreset === key ? '#fff' : 'var(--text-primary)',
              }}>
                {preset.name}
              </div>
              {config.themePreset === key && (
                <div style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: 2,
                }}>
                  ✓ Active
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Individual Color Customization */}
        <div style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: 20,
          marginTop: 8,
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              🎯 Customize Individual Colors
            </h4>
            <button
              onClick={() => setExpandedThemeColors(!expandedThemeColors)}
              style={{
                padding: '6px 14px',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-light)',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--text-secondary)',
              }}
            >
              {expandedThemeColors ? '📦 Collapse All' : '📦 Expand All'}
            </button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '12px 24px',
          }}>
            {/* Banner Colors */}
            <div style={{ 
              padding: 12, 
              background: 'var(--surface)',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                🏷️ Banner Colors
              </div>
              <ColorPicker 
                label="Banner Background" 
                value={config.bannerBgColor} 
                onChange={updateConfig} 
                path="bannerBgColor"
              />
              <ColorPicker 
                label="Banner Button Color" 
                value={config.bannerButtonColor} 
                onChange={updateConfig} 
                path="bannerButtonColor"
              />
            </div>

            {/* Welcome Colors */}
            <div style={{ 
              padding: 12, 
              background: 'var(--surface)',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                👋 Welcome Colors
              </div>
              <ColorPicker 
                label="New User Background" 
                value={config.welcomeNewUserBg} 
                onChange={updateConfig} 
                path="welcomeNewUserBg"
              />
              <ColorPicker 
                label="No Courses Background" 
                value={config.welcomeNoCoursesBg} 
                onChange={updateConfig} 
                path="welcomeNoCoursesBg"
              />
              <ColorPicker 
                label="With Courses Background" 
                value={config.welcomeWithCoursesBg} 
                onChange={updateConfig} 
                path="welcomeWithCoursesBg"
              />
            </div>

            {/* Features Colors */}
            <div style={{ 
              padding: 12, 
              background: 'var(--surface)',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                ✨ Features Colors
              </div>
              <ColorPicker 
                label="Features Background" 
                value={config.featuresBgColor} 
                onChange={updateConfig} 
                path="featuresBgColor"
              />
            </div>

            {/* CTA Colors */}
            <div style={{ 
              padding: 12, 
              background: 'var(--surface)',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                🎯 CTA Colors
              </div>
              <ColorPicker 
                label="CTA Button Background" 
                value={config.ctaButtonBg} 
                onChange={updateConfig} 
                path="ctaButtonBg"
              />
              <ColorPicker 
                label="CTA Button Text Color" 
                value={config.ctaButtonTextColor} 
                onChange={updateConfig} 
                path="ctaButtonTextColor"
              />
            </div>

            {/* Training Colors */}
            <div style={{ 
              padding: 12, 
              background: 'var(--surface)',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                📚 Training Colors
              </div>
              <ColorPicker 
                label="Topic Color" 
                value={config.trainingTopicColor} 
                onChange={updateConfig} 
                path="trainingTopicColor"
              />
              <ColorPicker 
                label="Topic Hover Color" 
                value={config.trainingTopicHoverColor} 
                onChange={updateConfig} 
                path="trainingTopicHoverColor"
              />
            </div>

            {/* Instructor Colors */}
            <div style={{ 
              padding: 12, 
              background: 'var(--surface)',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                👨‍🏫 Instructor Colors
              </div>
              <ColorPicker 
                label="Background Start" 
                value={config.instructorBgStart} 
                onChange={updateConfig} 
                path="instructorBgStart"
              />
              <ColorPicker 
                label="Background End" 
                value={config.instructorBgEnd} 
                onChange={updateConfig} 
                path="instructorBgEnd"
              />
            </div>

            {/* Testimonials Colors */}
            <div style={{ 
              padding: 12, 
              background: 'var(--surface)',
              borderRadius: 8,
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                ⭐ Testimonials Colors
              </div>
              <ColorPicker 
                label="Background" 
                value={config.testimonialsBg} 
                onChange={updateConfig} 
                path="testimonialsBg"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Section */}
        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: 'var(--bg-base)', 
          borderRadius: 8,
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
            🔮 Live Preview
          </h4>
          
          {/* Banner Preview */}
          <div style={{
            padding: 12,
            borderRadius: 8,
            background: config.bannerBgColor || '#f5c842',
            color: '#fff',
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 14 }}>{config.bannerText}</div>
            <div style={{ 
              display: 'inline-block',
              padding: '4px 12px',
              marginTop: 8,
              borderRadius: 4,
              background: config.bannerButtonColor || '#3abf94',
              fontSize: 12,
            }}>
              {config.bannerButtonText}
            </div>
          </div>
          
          {/* Features Preview */}
          <div style={{
            padding: 12,
            borderRadius: 8,
            background: config.featuresBgColor || '#5b8dbf',
            color: '#fff',
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Features Preview</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              {config.features.length} features with icons
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {config.features.slice(0, 3).map((f, i) => (
                <span key={i} style={{ fontSize: 20 }}>{f.icon}</span>
              ))}
            </div>
          </div>

          {/* Instructor Preview */}
          <div style={{
            padding: 12,
            borderRadius: 8,
            background: `linear-gradient(120deg, ${config.instructorBgStart || '#4a7fb5'}, ${config.instructorBgEnd || '#6fa3d0'})`,
            color: '#fff',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Instructor Section</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{config.instructorName}</div>
          </div>
        </div>

        <div style={{ 
          marginTop: 16,
          padding: 12,
          background: 'var(--surface)',
          borderRadius: 8,
          border: '1px solid var(--border-light)',
        }}>
          <p style={{ 
            fontSize: 12, 
            color: 'var(--text-secondary)',
            margin: 0,
            textAlign: 'center',
          }}>
            💡 Tip: Click on any color swatch to open the color picker, or enter a custom hex value.
          </p>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'banner': return renderBannerTab();
      case 'welcome': return renderWelcomeTab();
      case 'cta': return renderCTATab();
      case 'tagline': return renderTaglineTab();
      case 'features': return renderFeaturesTab();
      case 'training': return renderTrainingTab();
      case 'instructor': return renderInstructorTab();
      case 'testimonials': return renderTestimonialsTab();
      case 'themes': return renderThemesTab();
      default: return null;
    }
  };

  const tabs = [
    { id: 'banner', label: '🏷️ Banner' },
    { id: 'welcome', label: '👋 Welcome' },
    { id: 'cta', label: '🎯 CTA' },
    { id: 'tagline', label: '📝 Tagline' },
    { id: 'features', label: '✨ Features' },
    { id: 'training', label: '📚 Training' },
    { id: 'instructor', label: '👨‍🏫 Instructor' },
    { id: 'testimonials', label: '⭐ Testimonials' },
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
            🏠 Home Page Editor
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Customize all text, colors, and content on the public home page
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
              localStorage.setItem('homePageConfig', JSON.stringify(config));
              Swal.fire({
                title: 'Saved!',
                text: 'Home page configuration has been saved.',
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
            placeholder="Search for settings... (e.g., 'banner', 'welcome', 'feature title')"
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
        {tabs.map(tab => (
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