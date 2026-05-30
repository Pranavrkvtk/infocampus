import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="login-container">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-box">
        {/* Logo */}
        <div className="login-logo">
          <span className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#4a7fb5"/>
              <path d="M8 22 Q10 12 16 10 Q22 12 24 22" stroke="#f5c842" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <circle cx="16" cy="10" r="3" fill="#3abf94"/>
            </svg>
          </span>
          <span className="logo-text">Info<span>campus</span></span>
        </div>

        <h2 className="login-heading">Welcome back</h2>
        <p className="login-sub">Sign in to continue learning</p>

        <form onSubmit={e => e.preventDefault()}>
          <div className="field-group">
            <label className="field-label">Email address</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="#4a7fb5" strokeWidth="1.5"/>
                  <path d="M1 5l7 5 7-5" stroke="#4a7fb5" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              <input type="email" placeholder="you@example.com" className="login-input" />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#4a7fb5" strokeWidth="1.5"/>
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#4a7fb5" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1" fill="#4a7fb5"/>
                </svg>
              </span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="login-input"
              />
              <span className="input-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="#888" strokeWidth="1.5"/>
                    <circle cx="8" cy="8" r="2" stroke="#888" strokeWidth="1.5"/>
                    <line x1="2" y1="2" x2="14" y2="14" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="#888" strokeWidth="1.5"/>
                    <circle cx="8" cy="8" r="2" stroke="#888" strokeWidth="1.5"/>
                  </svg>
                )}
              </span>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="/forgot" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="login-btn">
            Sign In
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: "8px" }}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>

        <div className="divider"><span>or continue with</span></div>

        <div className="social-row">
          <button className="social-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.1 9.2c0-.6-.1-1.2-.2-1.7H9v3.3h4.6c-.2 1-.8 1.9-1.7 2.4v2h2.7c1.6-1.5 2.5-3.6 2.5-6z" fill="#4285F4"/>
              <path d="M9 18c2.3 0 4.2-.8 5.6-2.1l-2.7-2c-.8.5-1.7.8-2.9.8-2.2 0-4.1-1.5-4.8-3.5H1.4v2.1C2.8 16 5.7 18 9 18z" fill="#34A853"/>
              <path d="M4.2 11.2c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5.7H1.4C.5 7.1 0 8.5 0 10s.5 2.9 1.4 4.3l2.8-3.1z" fill="#FBBC05"/>
              <path d="M9 3.6c1.3 0 2.4.4 3.3 1.3l2.4-2.4C13.2.8 11.3 0 9 0 5.7 0 2.8 2 1.4 5l2.8 2.2C4.9 5.1 6.8 3.6 9 3.6z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button className="social-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 0C4 0 0 4 0 9c0 4 2.6 7.4 6.2 8.6.5.1.6-.2.6-.4v-1.5c-2.6.6-3.1-1.2-3.1-1.2-.4-1.1-1-1.4-1-1.4-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.7.1-.5.3-.9.5-1.1-2-.2-4.2-1-4.2-4.6 0-1 .4-1.9 1-2.5-.1-.3-.4-1.2.1-2.5 0 0 .8-.3 2.7 1 .8-.2 1.6-.3 2.4-.3.8 0 1.6.1 2.4.3 1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.2.1 2.5.6.7 1 1.5 1 2.5 0 3.6-2.2 4.4-4.2 4.6.3.3.6.8.6 1.6v2.4c0 .2.1.5.6.4C15.4 16.4 18 13 18 9c0-5-4-9-9-9z" fill="#24292F"/>
            </svg>
            GitHub
          </button>
        </div>

        <p className="signup-prompt">
          Don't have an account? <a href="/register" className="signup-link">Sign up free</a>
        </p>
      </div>
    </div>
  );
}

export default Login;