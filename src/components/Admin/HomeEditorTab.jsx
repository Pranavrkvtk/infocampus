// src/components/Admin/HomeEditorTab.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { colors } from './AdminStyles';

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
  testimonialsSignupText: "3414 people signed up the last 30 days!"
};

export default function HomeEditorTab({ onSave, initialConfig }) {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('homePageConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all fields exist
        return { ...DEFAULT_HOME_CONFIG, ...parsed };
      } catch {
        return DEFAULT_HOME_CONFIG;
      }
    }
    return DEFAULT_HOME_CONFIG;
  });

  const [activeTab, setActiveTab] = useState('banner');
  const [previewMode, setPreviewMode] = useState(false);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('homePageConfig', JSON.stringify(config));
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

  const tabs = [
    { id: 'banner', label: '🏷️ Banner' },
    { id: 'welcome', label: '👋 Welcome' },
    { id: 'cta', label: '🎯 CTA Button' },
    { id: 'tagline', label: '📝 Tagline' },
    { id: 'features', label: '✨ Features' },
    { id: 'training', label: '📚 Training Topics' },
    { id: 'instructor', label: '👨‍🏫 Instructor' },
    { id: 'testimonials', label: '⭐ Testimonials' },
  ];

  const ColorPicker = ({ label, value, onChange, path }) => {
    const handleChange = (e) => {
      const newValue = e.target.value;
      // If it's a gradient, handle separately
      if (newValue.includes('gradient')) {
        onChange(path, newValue);
      } else {
        onChange(path, newValue);
      }
    };

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
            onClick={() => onChange(path, DEFAULT_HOME_CONFIG[path.split('.').pop()] || '')}
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
        {value.startsWith('linear-gradient') && (
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

  const renderBannerTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Top Banner Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
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
        <div>
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
        <ColorPicker label="Banner Background Color" value={config.bannerBgColor} onChange={updateConfig} path="bannerBgColor" />
        <ColorPicker label="Button Color" value={config.bannerButtonColor} onChange={updateConfig} path="bannerButtonColor" />
      </div>
    </div>
  );

  const renderWelcomeTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Welcome Message Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>New User Welcome Message</label>
          <input
            type="text"
            value={config.welcomeNewUserMessage}
            onChange={(e) => updateConfig('welcomeNewUserMessage', e.target.value)}
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
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Returning User (No Courses)</label>
          <input
            type="text"
            value={config.welcomeReturningNoCourses}
            onChange={(e) => updateConfig('welcomeReturningNoCourses', e.target.value)}
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
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Returning User (With Courses)</label>
          <input
            type="text"
            value={config.welcomeReturningWithCourses}
            onChange={(e) => updateConfig('welcomeReturningWithCourses', e.target.value)}
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
        <ColorPicker label="New User Background" value={config.welcomeNewUserBg} onChange={updateConfig} path="welcomeNewUserBg" />
        <ColorPicker label="No Courses Background" value={config.welcomeNoCoursesBg} onChange={updateConfig} path="welcomeNoCoursesBg" />
        <ColorPicker label="With Courses Background" value={config.welcomeWithCoursesBg} onChange={updateConfig} path="welcomeWithCoursesBg" />
      </div>
    </div>
  );

  const renderCTATab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>CTA Button Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
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
        <ColorPicker label="Button Background" value={config.ctaButtonBg} onChange={updateConfig} path="ctaButtonBg" />
        <ColorPicker label="Button Text Color" value={config.ctaButtonTextColor} onChange={updateConfig} path="ctaButtonTextColor" />
      </div>
    </div>
  );

  const renderTaglineTab = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Tagline Settings</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
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
        <div>
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
        <div style={{ display: 'flex', gap: 8 }}>
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
      </div>
      <ColorPicker label="Features Background" value={config.featuresBgColor} onChange={updateConfig} path="featuresBgColor" />
      <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
        {config.features.map((feature, index) => (
          <div key={index} style={{
            padding: 16,
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Feature {index + 1}</span>
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
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Icon (emoji)</label>
                <input
                  type="text"
                  value={feature.icon}
                  onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-light)',
                    fontSize: 20,
                    background: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
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
              <div>
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
        <ColorPicker label="Topic Color" value={config.trainingTopicColor} onChange={updateConfig} path="trainingTopicColor" />
        <ColorPicker label="Topic Hover Color" value={config.trainingTopicHoverColor} onChange={updateConfig} path="trainingTopicHoverColor" />
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Topics (comma separated per row)</label>
          <textarea
            value={config.trainingTopics.map(row => row.join(', ')).join('\n')}
            onChange={(e) => {
              const rows = e.target.value.split('\n').filter(r => r.trim());
              const newTopics = rows.map(row => row.split(',').map(item => item.trim()).filter(Boolean));
              updateConfig('trainingTopics', newTopics.length ? newTopics : DEFAULT_HOME_CONFIG.trainingTopics);
            }}
            rows={6}
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
        <div>
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
        <div>
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
        <div>
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
        <div>
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
        <ColorPicker label="Background Start Color" value={config.instructorBgStart} onChange={updateConfig} path="instructorBgStart" />
        <ColorPicker label="Background End Color" value={config.instructorBgEnd} onChange={updateConfig} path="instructorBgEnd" />
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
      <ColorPicker label="Testimonials Background" value={config.testimonialsBg} onChange={updateConfig} path="testimonialsBg" />
      <div>
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
          <div key={index} style={{
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
              <div>
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
              <div>
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
              <div>
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
              <div>
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
              <div>
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
      default: return null;
    }
  };

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
          All changes apply to the public home page
        </span>
      </div>
    </div>
  );
}