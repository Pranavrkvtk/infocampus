// src/components/TopBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// ─── Material UI Icons ──────────────────────────────────────────────────
import ShareIcon from '@mui/icons-material/Share';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// ─── Top Bar Colors ──────────────────────────────────────────────────
export const TOPBAR = {
  bg: '#2C3540',
  bgGradient: 'linear-gradient(180deg, #2C3540 0%, #1F2933 100%)',
  bgActive: '#1A232E',
  bgHover: '#3A4553',
  border: '#3E4A58',
  text: '#FFFFFF',
  muted: '#C9D2DC',
  lessonsColor: '#47525f',
};

// ─── TopBar Component ──────────────────────────────────────────────────

/**
 * TopBar - Reusable top navigation bar
 * 
 * @param {Object} props
 * @param {boolean} props.isMobile - Whether the viewport is mobile
 * @param {boolean} props.isFullscreen - Whether fullscreen mode is active
 * @param {boolean} props.showMenu - Whether to show the menu/lessons button
 * @param {boolean} props.showBack - Whether to show the back button
 * @param {boolean} props.showShare - Whether to show the share button
 * @param {boolean} props.showFullscreen - Whether to show the fullscreen button
 * @param {boolean} props.showHome - Whether to show the home button
 * @param {boolean} props.showAuth - Whether to show auth buttons (login/logout)
 * @param {boolean} props.isLoggedIn - Whether user is logged in
 * @param {string} props.menuLabel - Label for menu button (default: "Lessons")
 * @param {Function} props.onMenuClick - Handler for menu button click
 * @param {Function} props.onBackClick - Handler for back button click
 * @param {Function} props.onShareClick - Handler for share button click
 * @param {Function} props.onFullscreenClick - Handler for fullscreen button click
 * @param {Function} props.onHomeClick - Handler for home button click
 * @param {Function} props.onLoginClick - Handler for login button click
 * @param {Function} props.onLogoutClick - Handler for logout button click
 * @param {string} props.className - Additional CSS class names
 * @param {Object} props.style - Additional inline styles
 */

const TopBar = ({
  // Visibility flags
  isMobile = false,
  isFullscreen = false,
  showMenu = true,
  showBack = false,
  showShare = true,
  showFullscreen = true,
  showHome = true,
  showAuth = true,
  
  // State
  isLoggedIn = false,
  menuLabel = 'Lessons',
  
  // Handlers
  onMenuClick,
  onBackClick,
  onShareClick,
  onFullscreenClick,
  onHomeClick,
  onLoginClick,
  onLogoutClick,
  
  // Additional
  className = '',
  style = {},
}) => {
  const navigate = useNavigate();

  // ─── Default Handlers ──────────────────────────────────────────────
  
  const handleShare = async () => {
    if (onShareClick) {
      onShareClick();
      return;
    }

    // Default share behavior
    const shareData = {
      title: document.title || 'Course',
      text: 'Check out this course!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        Swal.fire({
          title: 'Link Copied!',
          text: 'Link copied to clipboard.',
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

  const handleHome = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigate('/my-courses');
    }
  };

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    if (onLogoutClick) {
      onLogoutClick();
      return;
    }

    // Default logout behavior
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      confirmButtonColor: '#dc2626',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
      }
    });
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleFullscreen = () => {
    if (onFullscreenClick) {
      onFullscreenClick();
      return;
    }

    // Default fullscreen behavior
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

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div style={{
      height: isMobile ? '28px' : '32px',
      background: TOPBAR.bgGradient,
      borderBottom: `1px solid ${TOPBAR.border}`,
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      padding: 0,
      color: TOPBAR.text,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      ...style,
    }} className={className}>
      
      {/* ─── Left Section ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0px',
        flexWrap: 'wrap',
        height: '100%',
      }}>
        {showMenu && (
          <button
            onClick={onMenuClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '2px' : '4px',
              padding: isMobile ? '0 5px' : '0 8px',
              fontSize: isMobile ? '10px' : '11px',
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
              opacity: isFullscreen ? 0.5 : 1,
              pointerEvents: isFullscreen ? 'none' : 'auto',
            }}
            onMouseEnter={(e) => {
              if (!isFullscreen) {
                e.currentTarget.style.background = TOPBAR.bgHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isFullscreen) {
                e.currentTarget.style.background = TOPBAR.lessonsColor;
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <MenuIcon style={{ color: '#FFFFFF', fontSize: isMobile ? '12px' : '14px' }} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>{menuLabel}</span>
          </button>
        )}

        {showBack && (
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '2px' : '4px',
              padding: isMobile ? '0 5px' : '0 8px',
              fontSize: isMobile ? '10px' : '11px',
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
            <ArrowBackIcon style={{ fontSize: isMobile ? '10px' : '12px' }} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Back</span>
          </button>
        )}
      </div>

      {/* ─── Right Section ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '0px',
        height: '100%',
      }}>
        {showShare && (
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '2px' : '5px',
              padding: isMobile ? '0 6px' : '0 12px',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 600,
              border: 'none',
              borderLeft: `1px solid ${TOPBAR.border}`,
              cursor: 'pointer',
              transition: 'background 0.15s',
              background: TOPBAR.bgActive,
              color: TOPBAR.text,
              height: '100%',
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.bgActive;
            }}
          >
            <ShareIcon style={{ fontSize: isMobile ? '11px' : '12px' }} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Share</span>
          </button>
        )}

        {showFullscreen && (
          <button
            onClick={handleFullscreen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '2px' : '5px',
              padding: isMobile ? '0 6px' : '0 12px',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 600,
              border: 'none',
              borderLeft: `1px solid ${TOPBAR.border}`,
              cursor: 'pointer',
              transition: 'background 0.15s',
              background: TOPBAR.bgActive,
              color: TOPBAR.text,
              height: '100%',
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.bgActive;
            }}
          >
            {isFullscreen ? (
              <>
                <FullscreenExitIcon style={{ fontSize: isMobile ? '11px' : '12px' }} />
                <span style={{ display: isMobile ? 'none' : 'inline' }}>Exit</span>
              </>
            ) : (
              <>
                <FullscreenIcon style={{ fontSize: isMobile ? '11px' : '12px' }} />
                <span style={{ display: isMobile ? 'none' : 'inline' }}>Full</span>
              </>
            )}
          </button>
        )}

        {showHome && (
          <button
            onClick={handleHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '2px' : '5px',
              padding: isMobile ? '0 6px' : '0 12px',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 600,
              border: 'none',
              borderLeft: `1px solid ${TOPBAR.border}`,
              cursor: 'pointer',
              transition: 'background 0.15s',
              background: TOPBAR.bgActive,
              color: '#FFFFFF',
              height: '100%',
              borderRadius: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = TOPBAR.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = TOPBAR.bgActive;
            }}
          >
            <HomeOutlinedIcon style={{ fontSize: isMobile ? '11px' : '12px' }} />
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Home</span>
          </button>
        )}

        {showAuth && (
          isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '2px' : '5px',
                padding: isMobile ? '0 6px' : '0 12px',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: 600,
                border: 'none',
                borderLeft: `1px solid ${TOPBAR.border}`,
                cursor: 'pointer',
                transition: 'background 0.15s',
                background: TOPBAR.bgActive,
                color: '#ff6b6b',
                height: '100%',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TOPBAR.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = TOPBAR.bgActive;
              }}
            >
              <LogoutIcon style={{ fontSize: isMobile ? '11px' : '12px' }} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '2px' : '5px',
                padding: isMobile ? '0 6px' : '0 12px',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: 600,
                border: 'none',
                borderLeft: `1px solid ${TOPBAR.border}`,
                cursor: 'pointer',
                transition: 'background 0.15s',
                background: TOPBAR.bgActive,
                color: '#F7C948',
                height: '100%',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = TOPBAR.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = TOPBAR.bgActive;
              }}
            >
              <LoginIcon style={{ fontSize: isMobile ? '11px' : '12px' }} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Sign In</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default TopBar;