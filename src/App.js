// src/App.js
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';

// ─── Navbar ──────────────────────────────────────────────────────────
import Navbar from './components/Navbar';

// ─── Main Pages ──────────────────────────────────────────────────────
import MyCoursesPage from './components/MyCoursesPage';
import CourseDetailView from './components/CourseDetailView';
import CoursesPage from './components/CoursesPage';
import WatchDemoPage from './components/WatchDemoPage';

// ─── Enrollment Page ──────────────────────────────────────────────
import Enrollments from './components/Enrollments';

// ─── Auth Pages ──────────────────────────────────────────────────────
import Login from './components/Login';
import Logout from './components/Logout';
import FreeAccount from './components/About/FreeAccount';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// ─── Course Pages ──────────────────────────────────────────────────
import CCNA200 from './components/Course/Cisco/CCNA200';
import CCNA350 from './components/Course/Cisco/CCNA350';
import CCNA300 from './components/Course/Cisco/CCNA300';

// ─── Tools & Features ──────────────────────────────────────────────
import PracticeExam from './components/Tools/PracticeExam';
import ForumPage from './components/Forum/ForumPage';
import SupportPage from './components/Support/SupportPage';
import UpgradePage from './components/Tools/UpgradePage';
import { TestApiConnection } from './components/TestApiConnection';

// ─── Admin & Instructor ──────────────────────────────────────────────
import AdminDashboard from './components/Admin/AdminDashboard';
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedInstructorRoute from './components/ProtectedInstructorRoute';

// ─── API ──────────────────────────────────────────────────────────────
import { getSiteSettings } from './api/adminApi';

// ─── Routes where Navbar should be hidden ──────────────────────────
const HIDE_NAVBAR = [
  '/free-account',
  '/login',
  '/admin',
  '/instructor',
  '/logout',
  '/test-api',
  '/ccna200',
  '/ccnp-encor',
  '/ccnp-enarsi',
  '/enrollments',
  '/forgot-password',
  '/reset-password',
];

// ─── Helper: Get Base URL (without /api) ──────────────────────────────
const getBaseUrl = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';
  return API_URL.replace(/\/api\/?$/, '');
};

// ─── Helper: Get Full Image URL ──────────────────────────────────────
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

// ─── Helper: Add cache-busting to URL ──────────────────────────────
const addCacheBusting = (url) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
};

// ─── Helper: Force reload favicon - COMPLETE FIX ──────────────────
const forceReloadFavicon = (url) => {
  if (!url) {
    console.warn('⚠️ No favicon URL provided');
    return;
  }
  
  console.log('🔄 Force reloading favicon:', url);
  
  const fullUrl = getFullImageUrl(url);
  const cacheBustedUrl = addCacheBusting(fullUrl);
  
  // ─── Method 1: Remove ALL existing favicon links ──────────────────
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach(link => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  });
  
  // ─── Method 2: Create new favicon links for all browsers ──────────
  const faviconTypes = [
    { rel: 'icon', type: 'image/png' },
    { rel: 'icon', type: 'image/x-icon' },
    { rel: 'shortcut icon', type: 'image/x-icon' },
    { rel: 'icon', type: 'image/svg+xml' },
  ];
  
  faviconTypes.forEach(({ rel, type }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.type = type;
    link.href = cacheBustedUrl;
    document.head.appendChild(link);
  });
  
  // ─── Method 3: Also try the favicon API if available ──────────────
  if (window.favicon) {
    window.favicon.href = cacheBustedUrl;
  }
  
  // ─── Method 4: Update any favicon in the manifest ──────────────────
  const manifestLink = document.querySelector("link[rel='manifest']");
  if (manifestLink) {
    console.log('📄 Manifest found, favicon may need manual update');
  }
  
  console.log('✅ Favicon force reloaded with cache-busting');
};

// ─── Helper: Force reload Apple Touch Icon ──────────────────────────
const forceReloadAppleIcon = (url) => {
  if (!url) return;
  
  console.log('🔄 Force reloading Apple Touch Icon:', url);
  
  const fullUrl = getFullImageUrl(url);
  const cacheBustedUrl = addCacheBusting(fullUrl);
  
  const existingLinks = document.querySelectorAll("link[rel='apple-touch-icon']");
  existingLinks.forEach(link => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  });
  
  const link = document.createElement('link');
  link.rel = 'apple-touch-icon';
  link.type = 'image/png';
  link.href = cacheBustedUrl;
  document.head.appendChild(link);
  
  console.log('✅ Apple Touch Icon force reloaded');
};

// ─── Helper: Clear all favicon cache ────────────────────────────────
const clearFaviconCache = () => {
  console.log('🔄 Clearing all favicon cache...');
  
  const iconLinks = document.querySelectorAll("link[rel*='icon']");
  iconLinks.forEach(link => link.remove());
  
  const appleLinks = document.querySelectorAll("link[rel='apple-touch-icon']");
  appleLinks.forEach(link => link.remove());
  
  const tempLink = document.createElement('link');
  tempLink.rel = 'icon';
  tempLink.type = 'image/svg+xml';
  tempLink.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⏳</text></svg>";
  document.head.appendChild(tempLink);
  
  console.log('✅ Favicon cache cleared');
};

// ─── App Routes ──────────────────────────────────────────────────────
function AppRoutes() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  console.log('🔥 AppRoutes rendering, path:', window.location.pathname);

  return (
    <Routes>
      <Route path="/" element={<MyCoursesPage />} />
      <Route path="/my-courses" element={<MyCoursesPage />} />
      <Route path="/course/:courseId" element={<CourseDetailView />} />
      
      <Route 
        path="/enrollments" 
        element={
          <Enrollments 
            isMobile={isMobile} 
            onBack={() => navigate('/my-courses')} 
          />
        } 
      />
      
      <Route 
        path="/enrollments/:courseId" 
        element={
          <Enrollments 
            isMobile={isMobile} 
            onBack={() => navigate('/my-courses')} 
          />
        } 
      />

      <Route path="/courses" element={
        <CoursesPage 
          isMobile={isMobile} 
          onBack={() => navigate('/')} 
        />
      } />
      <Route path="/watch-demo" element={
        <WatchDemoPage 
          isMobile={isMobile} 
          onBack={() => navigate('/courses')} 
        />
      } />
      <Route path="/ccna200" element={<CCNA200 />} />
      <Route path="/ccnp-encor" element={<CCNA350 />} />
      <Route path="/ccnp-enarsi" element={<CCNA300 />} />

      <Route path="/practice-exam" element={<PracticeExam />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/upgrade" element={<UpgradePage />} />
      <Route path="/support" element={
        <SupportPage 
          isMobile={isMobile} 
          onBack={() => navigate('/')} 
        />
      } />
      <Route path="/test-api" element={<TestApiConnection />} />

      <Route path="/free-account" element={<FreeAccount />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/instructor/*"
        element={
          <ProtectedInstructorRoute>
            <InstructorDashboard />
          </ProtectedInstructorRoute>
        }
      />

      <Route path="*" element={<Navigate to="/my-courses" replace />} />
    </Routes>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────
function Layout() {
  const location = useLocation();
  const [siteSettings, setSiteSettings] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const previousPathRef = useRef('');
  const faviconAppliedRef = useRef(false);

  console.log('📍 Current path in Layout:', location.pathname);

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        console.log('📥 Loading site settings...');
        const data = await getSiteSettings();
        console.log('✅ Site settings loaded:', data);
        setSiteSettings(data);
        
        applySiteSettings(data);
        faviconAppliedRef.current = true;
        
      } catch (error) {
        console.error('❌ Error loading site settings:', error);
        document.title = 'Learning Management System';
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSiteSettings();
    
    return () => {};
  }, []);

  useEffect(() => {
    if (siteSettings && location.pathname !== previousPathRef.current) {
      console.log('🔄 Route changed, re-applying settings for:', location.pathname);
      previousPathRef.current = location.pathname;
      applySiteSettings(siteSettings);
    }
  }, [location.pathname, siteSettings]);

  const applySiteSettings = (settings) => {
    if (!settings) {
      console.warn('⚠️ No settings to apply');
      return;
    }

    console.log('🎨 Applying site settings:', settings);

    // ─── Page Title - SIMPLIFIED: Just the site name ──────────────────
    // ✅ FIXED: Only show the site name, no suffixes
    const pageTitle = settings.pageTitle || 'Learning Management System';
    document.title = pageTitle;
    console.log('📄 Page title set to:', document.title);

    // ─── Meta Description ────────────────────────────────────────────
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (settings.metaDescription) {
      metaDesc.setAttribute('content', settings.metaDescription);
    }

    // ─── Theme Color ─────────────────────────────────────────────────
    let themeColor = document.querySelector("meta[name='theme-color']");
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }
    if (settings.themeColor) {
      themeColor.setAttribute('content', settings.themeColor);
      console.log('🎨 Theme color set to:', settings.themeColor);
    }

    // ─── FAVICON - Force Reload ──────────────────────────────────────
    if (settings.faviconUrl) {
      forceReloadFavicon(settings.faviconUrl);
    } else {
      clearFaviconCache();
    }

    // ─── APPLE TOUCH ICON - Force Reload ────────────────────────────
    if (settings.appleIconUrl) {
      forceReloadAppleIcon(settings.appleIconUrl);
    }

    // ─── Open Graph Tags ─────────────────────────────────────────────
    let ogTitle = document.querySelector("meta[property='og:title']");
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    if (settings.ogTitle) {
      ogTitle.setAttribute('content', settings.ogTitle);
    }

    let ogDescription = document.querySelector("meta[property='og:description']");
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    if (settings.ogDescription) {
      ogDescription.setAttribute('content', settings.ogDescription);
    }

    let ogImage = document.querySelector("meta[property='og:image']");
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    if (settings.ogImageUrl) {
      const fullUrl = getFullImageUrl(settings.ogImageUrl);
      ogImage.setAttribute('content', fullUrl);
    }

    // ─── Twitter Card ─────────────────────────────────────────────────
    let twitterTitle = document.querySelector("meta[name='twitter:title']");
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta');
      twitterTitle.name = 'twitter:title';
      document.head.appendChild(twitterTitle);
    }
    if (settings.ogTitle) {
      twitterTitle.setAttribute('content', settings.ogTitle);
    }

    let twitterDescription = document.querySelector("meta[name='twitter:description']");
    if (!twitterDescription) {
      twitterDescription = document.createElement('meta');
      twitterDescription.name = 'twitter:description';
      document.head.appendChild(twitterDescription);
    }
    if (settings.ogDescription) {
      twitterDescription.setAttribute('content', settings.ogDescription);
    }

    let twitterImage = document.querySelector("meta[name='twitter:image']");
    if (!twitterImage) {
      twitterImage = document.createElement('meta');
      twitterImage.name = 'twitter:image';
      document.head.appendChild(twitterImage);
    }
    const imageUrl = settings.twitterCardImage || settings.ogImageUrl;
    if (imageUrl) {
      const fullUrl = getFullImageUrl(imageUrl);
      twitterImage.setAttribute('content', fullUrl);
    }

    // ─── Custom CSS ──────────────────────────────────────────────────
    const existingStyle = document.getElementById('custom-site-css');
    if (settings.customCss && settings.customCss.trim()) {
      let styleTag = existingStyle;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'custom-site-css';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = settings.customCss;
    } else if (existingStyle) {
      existingStyle.remove();
    }

    // ─── Custom JS ────────────────────────────────────────────────────
    const existingScript = document.getElementById('custom-site-js');
    if (settings.customJs && settings.customJs.trim()) {
      let scriptTag = existingScript;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'custom-site-js';
        document.body.appendChild(scriptTag);
      }
      scriptTag.textContent = settings.customJs;
    } else if (existingScript) {
      existingScript.remove();
    }

    // ─── Google Analytics ────────────────────────────────────────────
    if (settings.googleAnalyticsId) {
      const existingGa = document.getElementById('google-analytics');
      if (existingGa) {
        existingGa.remove();
      }

      const gaScript = document.createElement('script');
      gaScript.id = 'google-analytics';
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', settings.googleAnalyticsId);
    }

    // ─── Google Tag Manager ──────────────────────────────────────────
    if (settings.googleTagManagerId) {
      const existingGtm = document.getElementById('google-tag-manager');
      if (existingGtm) {
        existingGtm.remove();
      }

      const gtmScript = document.createElement('script');
      gtmScript.id = 'google-tag-manager';
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.googleTagManagerId}');
      `;
      document.head.appendChild(gtmScript);

      const existingNoscript = document.getElementById('gtm-noscript');
      if (existingNoscript) {
        existingNoscript.remove();
      }
      const noscript = document.createElement('noscript');
      noscript.id = 'gtm-noscript';
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${settings.googleTagManagerId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    console.log('✅ Site settings applied successfully');
  };

  const showNavbar = !HIDE_NAVBAR.some(path => {
    if (path.includes(':')) {
      const basePath = path.split(':')[0];
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === path;
  });

  console.log('👁️ Show navbar:', showNavbar);

  if (!settingsLoaded) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f8fafc',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e4e7ec',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading site settings...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {showNavbar && <Navbar />}
      <AppRoutes />
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;