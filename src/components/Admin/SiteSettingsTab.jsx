// src/components/Admin/SiteSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { LoadingSpinner } from './AdminStyles';
import {
  getAdminSiteSettings,
  updateSiteSettings,
  initializeSiteSettings,
  uploadSiteLogo,
  uploadSiteFavicon,
  uploadSiteAppleIcon,
  uploadSiteOgImage,
} from '../../api/adminApi';

// ─── Material UI Icons ──────────────────────────────────────────────
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';

const DEFAULT_SETTINGS = {
  siteName: 'My LMS',
  pageTitle: 'Learning Management System',
  metaDescription: 'Learn new skills with our comprehensive online courses',
  faviconUrl: '',
  appleIconUrl: '',
  themeColor: '#714B67',
  logoUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImageUrl: '',
  twitterCardImage: '',
  footerText: '',
  copyrightText: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  socialFacebook: '',
  socialTwitter: '',
  socialLinkedin: '',
  socialYoutube: '',
  socialInstagram: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  customCss: '',
  customJs: '',
};

// ─── Helper: Get Base URL ──────────────────────────────────────────
const getBaseUrl = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';
  return API_URL.replace(/\/api\/?$/, '');
};

// ─── Helper: Get Full Image URL ──────────────────────────────────
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  const BASE_URL = getBaseUrl();
  
  if (imageUrl.startsWith('/uploads/')) {
    return `${BASE_URL}${imageUrl}`;
  }
  
  if (imageUrl.startsWith('/')) {
    return `${BASE_URL}${imageUrl}`;
  }
  
  if (!imageUrl.includes('/')) {
    return `${BASE_URL}/uploads/${imageUrl}`;
  }
  
  return imageUrl;
};

// ─── Helper: Add cache-busting ────────────────────────────────────
const addCacheBusting = (url) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
};

function SiteSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewFavicon, setPreviewFavicon] = useState(null);
  const [previewAppleIcon, setPreviewAppleIcon] = useState(null);
  const [previewOgImage, setPreviewOgImage] = useState(null);
  const [refreshFaviconKey, setRefreshFaviconKey] = useState(Date.now());

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getAdminSiteSettings();
      console.log('📥 Loaded site settings:', data);
      
      // Ensure all fields exist
      const loadedSettings = { ...DEFAULT_SETTINGS, ...data };
      setSettings(loadedSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(loadedSettings)));
      setHasChanges(false);
      
      // Set previews with full URLs
      if (loadedSettings.logoUrl) {
        setPreviewLogo(getFullImageUrl(loadedSettings.logoUrl));
      }
      if (loadedSettings.faviconUrl) {
        setPreviewFavicon(getFullImageUrl(loadedSettings.faviconUrl));
      }
      if (loadedSettings.appleIconUrl) {
        setPreviewAppleIcon(getFullImageUrl(loadedSettings.appleIconUrl));
      }
      if (loadedSettings.ogImageUrl) {
        setPreviewOgImage(getFullImageUrl(loadedSettings.ogImageUrl));
      }
      
    } catch (error) {
      console.error('Error loading settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load Settings',
        text: error.message || 'Could not load site settings. Using defaults.',
      });
      setSettings(DEFAULT_SETTINGS);
      setOriginalSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleFileChange = async (field, file) => {
    if (!file) return;

    try {
      setUploading(true);
      
      let uploadFunction;
      let displayName;
      
      switch (field) {
        case 'logoUrl':
          uploadFunction = uploadSiteLogo;
          displayName = 'Logo';
          break;
        case 'faviconUrl':
          uploadFunction = uploadSiteFavicon;
          displayName = 'Favicon';
          break;
        case 'appleIconUrl':
          uploadFunction = uploadSiteAppleIcon;
          displayName = 'Apple Icon';
          break;
        case 'ogImageUrl':
          uploadFunction = uploadSiteOgImage;
          displayName = 'OG Image';
          break;
        default:
          throw new Error('Unknown field for file upload');
      }

      // Show uploading toast
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: 'info',
        title: `Uploading ${displayName}...`,
      });

      const result = await uploadFunction(file);
      console.log(`✅ ${field} uploaded:`, result);
      
      // Get the image URL from response
      const imageUrl = result.imageUrl || result.url || result.data || '';
      
      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }
      
      const fullImageUrl = getFullImageUrl(imageUrl);
      
      // Update the setting with the URL from server (relative path)
      handleChange(field, imageUrl);
      
      // Set preview state with full URL
      if (field === 'logoUrl') setPreviewLogo(fullImageUrl);
      else if (field === 'faviconUrl') {
        setPreviewFavicon(fullImageUrl);
        // Force refresh favicon in the browser
        forceRefreshFavicon(fullImageUrl);
      } else if (field === 'appleIconUrl') {
        setPreviewAppleIcon(fullImageUrl);
        forceRefreshAppleIcon(fullImageUrl);
      } else if (field === 'ogImageUrl') setPreviewOgImage(fullImageUrl);

      // 🔥 RELOAD SETTINGS to get the latest data from database
      await loadSettings();

      // Update the favicon key to force re-render
      setRefreshFaviconKey(Date.now());

      Swal.fire({
        icon: 'success',
        title: 'Upload Successful!',
        text: `${displayName} uploaded and saved successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      
      let errorMessage = error.message || 'Could not upload file.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Upload endpoint not found. Please contact support.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please upload a smaller file.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  // ─── Force Refresh Favicon ──────────────────────────────────────
  const forceRefreshFavicon = (url) => {
    if (!url) return;
    
    console.log('🔄 Force refreshing favicon:', url);
    
    // Remove all existing favicon links
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach(link => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
    
    const cacheBustedUrl = addCacheBusting(url);
    
    // Create new favicon links
    const link1 = document.createElement('link');
    link1.rel = 'icon';
    link1.type = 'image/x-icon';
    link1.href = cacheBustedUrl;
    document.head.appendChild(link1);
    
    const link2 = document.createElement('link');
    link2.rel = 'shortcut icon';
    link2.type = 'image/x-icon';
    link2.href = cacheBustedUrl;
    document.head.appendChild(link2);
    
    const link3 = document.createElement('link');
    link3.rel = 'icon';
    link3.type = 'image/png';
    link3.href = cacheBustedUrl;
    document.head.appendChild(link3);
    
    console.log('✅ Favicon force refreshed');
  };

  // ─── Force Refresh Apple Icon ──────────────────────────────────
  const forceRefreshAppleIcon = (url) => {
    if (!url) return;
    
    console.log('🔄 Force refreshing Apple Touch Icon:', url);
    
    const existingLinks = document.querySelectorAll("link[rel='apple-touch-icon']");
    existingLinks.forEach(link => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
    
    const cacheBustedUrl = addCacheBusting(url);
    
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.type = 'image/png';
    link.href = cacheBustedUrl;
    document.head.appendChild(link);
    
    console.log('✅ Apple Touch Icon force refreshed');
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

    try {
      setSaving(true);
      await updateSiteSettings(settings);
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      setHasChanges(false);
      
      // Refresh favicon if it was changed
      if (settings.faviconUrl) {
        const fullUrl = getFullImageUrl(settings.faviconUrl);
        forceRefreshFavicon(fullUrl);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Settings Saved! 🎉',
        text: 'Site settings have been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.response?.data?.error || error.message || 'Could not save settings.',
      });
    } finally {
      setSaving(false);
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
        setSaving(true);
        await initializeSiteSettings();
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
          text: error.response?.data?.error || error.message || 'Could not reset settings.',
        });
      } finally {
        setSaving(false);
      }
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
        setPreviewLogo(originalSettings.logoUrl ? getFullImageUrl(originalSettings.logoUrl) : null);
        setPreviewFavicon(originalSettings.faviconUrl ? getFullImageUrl(originalSettings.faviconUrl) : null);
        setPreviewAppleIcon(originalSettings.appleIconUrl ? getFullImageUrl(originalSettings.appleIconUrl) : null);
        setPreviewOgImage(originalSettings.ogImageUrl ? getFullImageUrl(originalSettings.ogImageUrl) : null);
      }
    });
  };

  // ─── Preview Favicon in a new tab ──────────────────────────────
  const previewFaviconInNewTab = () => {
    if (settings.faviconUrl) {
      const fullUrl = getFullImageUrl(settings.faviconUrl);
      window.open(fullUrl, '_blank');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.container}>
      {/* Header Actions */}
      <div style={styles.headerActions}>
        <span style={styles.status}>
          {hasChanges ? '⚠️ Unsaved changes' : '✅ All saved'}
        </span>
        <button onClick={initializeDefaults} style={styles.resetBtn}>
          🔄 Reset to Defaults
        </button>
        <button onClick={discardChanges} style={styles.discardBtn} disabled={!hasChanges}>
          <RefreshIcon style={{ fontSize: '18px' }} /> Discard
        </button>
        <button onClick={handleSave} style={styles.saveBtn} disabled={saving || uploading}>
          <SaveIcon style={{ fontSize: '18px' }} />
          {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save Settings'}
        </button>
      </div>

      {/* Settings Grid */}
      <div style={styles.grid}>
        {/* Basic Info */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <SettingsIcon style={styles.sectionIcon} /> Basic Information
          </h3>

          <div style={styles.field}>
            <label style={styles.label}>Site Name</label>
            <input
              type="text"
              value={settings.siteName || ''}
              onChange={(e) => handleChange('siteName', e.target.value)}
              style={styles.input}
              placeholder="My LMS"
            />
            <span style={styles.hint}>Used in browser tab and branding</span>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Page Title</label>
            <input
              type="text"
              value={settings.pageTitle || ''}
              onChange={(e) => handleChange('pageTitle', e.target.value)}
              style={styles.input}
              placeholder="Learning Management System"
            />
            <span style={styles.hint}>Appears in browser tab</span>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Meta Description</label>
            <textarea
              rows="3"
              value={settings.metaDescription || ''}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              style={styles.textarea}
              placeholder="Learn new skills with our comprehensive online courses"
            />
            <span style={styles.hint}>SEO description (150-160 characters recommended)</span>
          </div>
        </div>

        {/* Branding */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <ImageIcon style={styles.sectionIcon} /> Branding
          </h3>

          {/* Logo Upload */}
          <div style={styles.field}>
            <label style={styles.label}>Logo</label>
            <div style={styles.fileUploadArea}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileChange('logoUrl', e.target.files[0]);
                  }
                }}
                style={styles.fileInput}
                id="logo-upload"
                disabled={uploading}
              />
              <label htmlFor="logo-upload" style={styles.fileUploadLabel}>
                <CloudUploadIcon style={{ fontSize: '20px' }} />
                Upload Logo
              </label>
              {settings.logoUrl && (
                <button
                  onClick={() => {
                    handleChange('logoUrl', '');
                    setPreviewLogo(null);
                  }}
                  style={styles.clearBtn}
                  disabled={uploading}
                >
                  <DeleteIcon style={{ fontSize: '16px' }} />
                </button>
              )}
            </div>
            {(settings.logoUrl || previewLogo) && (
              <div style={styles.previewContainer}>
                <img
                  src={previewLogo || getFullImageUrl(settings.logoUrl)}
                  alt="Logo preview"
                  style={styles.previewImage}
                />
              </div>
            )}
          </div>

          {/* Favicon Upload */}
          <div style={styles.field}>
            <label style={styles.label}>Favicon (16x16 or 32x32)</label>
            <div style={styles.fileUploadArea}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileChange('faviconUrl', e.target.files[0]);
                  }
                }}
                style={styles.fileInput}
                id="favicon-upload"
                disabled={uploading}
              />
              <label htmlFor="favicon-upload" style={styles.fileUploadLabel}>
                <CloudUploadIcon style={{ fontSize: '20px' }} />
                Upload Favicon
              </label>
              {settings.faviconUrl && (
                <>
                  <button
                    onClick={previewFaviconInNewTab}
                    style={styles.previewBtn}
                    title="Preview favicon"
                  >
                    <VisibilityIcon style={{ fontSize: '16px' }} />
                  </button>
                  <button
                    onClick={() => {
                      handleChange('faviconUrl', '');
                      setPreviewFavicon(null);
                    }}
                    style={styles.clearBtn}
                    disabled={uploading}
                  >
                    <DeleteIcon style={{ fontSize: '16px' }} />
                  </button>
                </>
              )}
            </div>
            {(settings.faviconUrl || previewFavicon) && (
              <div style={styles.previewContainer}>
                <img
                  src={previewFavicon || getFullImageUrl(settings.faviconUrl)}
                  alt="Favicon preview"
                  style={styles.previewIcon}
                  key={refreshFaviconKey}
                />
                <span style={styles.previewHint}>Preview - may be cached by browser</span>
              </div>
            )}
          </div>

          {/* Apple Icon Upload */}
          <div style={styles.field}>
            <label style={styles.label}>Apple Touch Icon (180x180)</label>
            <div style={styles.fileUploadArea}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileChange('appleIconUrl', e.target.files[0]);
                  }
                }}
                style={styles.fileInput}
                id="apple-icon-upload"
                disabled={uploading}
              />
              <label htmlFor="apple-icon-upload" style={styles.fileUploadLabel}>
                <CloudUploadIcon style={{ fontSize: '20px' }} />
                Upload Apple Icon
              </label>
              {settings.appleIconUrl && (
                <button
                  onClick={() => {
                    handleChange('appleIconUrl', '');
                    setPreviewAppleIcon(null);
                  }}
                  style={styles.clearBtn}
                  disabled={uploading}
                >
                  <DeleteIcon style={{ fontSize: '16px' }} />
                </button>
              )}
            </div>
            {(settings.appleIconUrl || previewAppleIcon) && (
              <div style={styles.previewContainer}>
                <img
                  src={previewAppleIcon || getFullImageUrl(settings.appleIconUrl)}
                  alt="Apple icon preview"
                  style={styles.previewIcon}
                />
              </div>
            )}
          </div>

          {/* Theme Color */}
          <div style={styles.field}>
            <label style={styles.label}>Theme Color</label>
            <div style={styles.colorRow}>
              <input
                type="color"
                value={settings.themeColor || '#714B67'}
                onChange={(e) => handleChange('themeColor', e.target.value)}
                style={styles.colorPicker}
              />
              <input
                type="text"
                value={settings.themeColor || ''}
                onChange={(e) => handleChange('themeColor', e.target.value)}
                style={styles.colorInput}
              />
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: settings.themeColor || '#714B67',
                border: '1px solid #e4e7ec',
              }} />
            </div>
            <span style={styles.hint}>Used for browser theme color and branding</span>
          </div>
        </div>

        {/* SEO & Social */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <LinkIcon style={styles.sectionIcon} /> SEO & Social Media
          </h3>

          <div style={styles.field}>
            <label style={styles.label}>Open Graph Title</label>
            <input
              type="text"
              value={settings.ogTitle || ''}
              onChange={(e) => handleChange('ogTitle', e.target.value)}
              style={styles.input}
              placeholder="Title for social sharing"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Open Graph Description</label>
            <textarea
              rows="2"
              value={settings.ogDescription || ''}
              onChange={(e) => handleChange('ogDescription', e.target.value)}
              style={styles.textarea}
              placeholder="Description for social sharing"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Open Graph Image</label>
            <div style={styles.fileUploadArea}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileChange('ogImageUrl', e.target.files[0]);
                  }
                }}
                style={styles.fileInput}
                id="og-image-upload"
                disabled={uploading}
              />
              <label htmlFor="og-image-upload" style={styles.fileUploadLabel}>
                <CloudUploadIcon style={{ fontSize: '20px' }} />
                Upload OG Image
              </label>
              {settings.ogImageUrl && (
                <button
                  onClick={() => {
                    handleChange('ogImageUrl', '');
                    setPreviewOgImage(null);
                  }}
                  style={styles.clearBtn}
                  disabled={uploading}
                >
                  <DeleteIcon style={{ fontSize: '16px' }} />
                </button>
              )}
            </div>
            {(settings.ogImageUrl || previewOgImage) && (
              <div style={styles.previewContainer}>
                <img
                  src={previewOgImage || getFullImageUrl(settings.ogImageUrl)}
                  alt="OG image preview"
                  style={styles.previewImage}
                />
              </div>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Twitter Card Image</label>
            <input
              type="text"
              value={settings.twitterCardImage || ''}
              onChange={(e) => handleChange('twitterCardImage', e.target.value)}
              style={styles.input}
              placeholder="URL for Twitter card image"
            />
          </div>
        </div>

        {/* Footer & Contact */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <DescriptionIcon style={styles.sectionIcon} /> Footer & Contact
          </h3>

          <div style={styles.field}>
            <label style={styles.label}>Footer Text</label>
            <textarea
              rows="3"
              value={settings.footerText || ''}
              onChange={(e) => handleChange('footerText', e.target.value)}
              style={styles.textarea}
              placeholder="Footer text for the bottom of every page"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Copyright Text</label>
            <input
              type="text"
              value={settings.copyrightText || ''}
              onChange={(e) => handleChange('copyrightText', e.target.value)}
              style={styles.input}
              placeholder="© 2024 Your Company. All rights reserved."
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <EmailIcon style={{ fontSize: '16px', verticalAlign: 'middle' }} /> Contact Email
            </label>
            <input
              type="email"
              value={settings.contactEmail || ''}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              style={styles.input}
              placeholder="contact@yourlms.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <PhoneIcon style={{ fontSize: '16px', verticalAlign: 'middle' }} /> Contact Phone
            </label>
            <input
              type="text"
              value={settings.contactPhone || ''}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              style={styles.input}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <LocationOnIcon style={{ fontSize: '16px', verticalAlign: 'middle' }} /> Address
            </label>
            <textarea
              rows="2"
              value={settings.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              style={styles.textarea}
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
        </div>

        {/* Social Media */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <LinkIcon style={styles.sectionIcon} /> Social Media Links
          </h3>

          <div style={styles.field}>
            <label style={styles.label}>
              <FacebookIcon style={{ fontSize: '16px', verticalAlign: 'middle', color: '#1877f2' }} /> Facebook
            </label>
            <input
              type="url"
              value={settings.socialFacebook || ''}
              onChange={(e) => handleChange('socialFacebook', e.target.value)}
              style={styles.input}
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <TwitterIcon style={{ fontSize: '16px', verticalAlign: 'middle', color: '#1da1f2' }} /> Twitter
            </label>
            <input
              type="url"
              value={settings.socialTwitter || ''}
              onChange={(e) => handleChange('socialTwitter', e.target.value)}
              style={styles.input}
              placeholder="https://twitter.com/yourhandle"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <LinkedInIcon style={{ fontSize: '16px', verticalAlign: 'middle', color: '#0a66c2' }} /> LinkedIn
            </label>
            <input
              type="url"
              value={settings.socialLinkedin || ''}
              onChange={(e) => handleChange('socialLinkedin', e.target.value)}
              style={styles.input}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <YouTubeIcon style={{ fontSize: '16px', verticalAlign: 'middle', color: '#ff0000' }} /> YouTube
            </label>
            <input
              type="url"
              value={settings.socialYoutube || ''}
              onChange={(e) => handleChange('socialYoutube', e.target.value)}
              style={styles.input}
              placeholder="https://youtube.com/c/yourchannel"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <InstagramIcon style={{ fontSize: '16px', verticalAlign: 'middle', color: '#e4405f' }} /> Instagram
            </label>
            <input
              type="url"
              value={settings.socialInstagram || ''}
              onChange={(e) => handleChange('socialInstagram', e.target.value)}
              style={styles.input}
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
        </div>

        {/* Analytics & Custom Code */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <CodeIcon style={styles.sectionIcon} /> Analytics & Custom Code
          </h3>

          <div style={styles.field}>
            <label style={styles.label}>Google Analytics ID</label>
            <input
              type="text"
              value={settings.googleAnalyticsId || ''}
              onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
              style={styles.input}
              placeholder="G-XXXXXXXXXX"
            />
            <span style={styles.hint}>e.g., G-XXXXXXXXXX</span>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Google Tag Manager ID</label>
            <input
              type="text"
              value={settings.googleTagManagerId || ''}
              onChange={(e) => handleChange('googleTagManagerId', e.target.value)}
              style={styles.input}
              placeholder="GTM-XXXXXXX"
            />
            <span style={styles.hint}>e.g., GTM-XXXXXXX</span>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Custom CSS</label>
            <textarea
              rows="4"
              value={settings.customCss || ''}
              onChange={(e) => handleChange('customCss', e.target.value)}
              style={styles.codeTextarea}
              placeholder="/* Add custom CSS here */"
            />
            <span style={styles.hint}>Custom CSS will be injected into the head</span>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Custom JavaScript</label>
            <textarea
              rows="4"
              value={settings.customJs || ''}
              onChange={(e) => handleChange('customJs', e.target.value)}
              style={styles.codeTextarea}
              placeholder="// Add custom JavaScript here"
            />
            <span style={styles.hint}>Custom JS will be injected before the closing body tag</span>
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
    display: 'inline-flex',
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
  resetBtn: {
    display: 'inline-flex',
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
  discardBtn: {
    display: 'inline-flex',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
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
  codeTextarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e4e7ec',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '80px',
    transition: 'border-color 0.2s',
    background: '#f8fafc',
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
  hint: {
    display: 'block',
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  previewHint: {
    display: 'block',
    fontSize: '10px',
    color: '#94a3b8',
    marginTop: '4px',
    fontStyle: 'italic',
  },
  fileUploadArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  fileInput: {
    display: 'none',
  },
  fileUploadLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#eef2ff',
    color: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#e0e7ff',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  previewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px',
    background: '#f0f9ff',
    color: '#0ea5e9',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#e0f2fe',
    },
  },
  clearBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px',
    background: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#fee2e2',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  previewContainer: {
    marginTop: '8px',
  },
  previewImage: {
    maxWidth: '200px',
    maxHeight: '100px',
    borderRadius: '8px',
    border: '1px solid #e4e7ec',
    objectFit: 'contain',
  },
  previewIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    border: '1px solid #e4e7ec',
    objectFit: 'contain',
  },
};

export default SiteSettingsTab;