import React, { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import { loginUser } from "../api/authApi";
import Swal from "sweetalert2";

function Login() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await loginUser({ email, password });

    console.log("Login Response:", res.data);

    // Store data
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("userId", res.data.userId);
    localStorage.setItem("userName", res.data.name);

    await Swal.fire({
      icon: "success",
      title: `Welcome ${res.data.name}! 👋`,
      text: "Login Successful",
      confirmButtonColor: "#10b981",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    // Redirect based on role
    const role = res.data.role?.toUpperCase();
    
    if (role === "ADMIN") {
      window.location.replace("/admin");
    } else if (role === "INSTRUCTOR") {
      window.location.replace("/instructor");
    } else {
      window.location.replace("/my-courses");
    }

  } catch (error) {
    console.error("Login Error:", error);

    const msg =
      typeof error?.response?.data === "string"
        ? error.response.data
        : error?.response?.data?.message ||
          "Invalid email or password";

    Swal.fire({
      icon: "error",
      title: "Login Failed ❌",
      text: msg,
      confirmButtonColor: "#ef4444",
    });
  }
};
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

        {/* FORM */}
        <form onSubmit={handleLogin} autoComplete="off">
          {/* EMAIL */}
          <div className="field-group">
            <label className="field-label">Email address</label>
            <div className="input-wrap">
              <input
                type="email"
                placeholder="you@example.com"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <span
                className="input-toggle"
                onClick={() => setShowPass(!showPass)}
                style={{ cursor: "pointer" }}
              >
                {showPass ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          {/* OPTIONS */}
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="/forgot" className="forgot-link">Forgot password?</a>
          </div>

          {/* BUTTON */}
          <button type="submit" className="login-btn">Sign In</button>
        </form>

        {/* DIVIDER */}
        <div className="divider"><span>or continue with</span></div>

        {/* SOCIAL */}
        <div className="social-row">
          <button className="social-btn">Google</button>
          <button className="social-btn">GitHub</button>
        </div>

        {/* SIGNUP */}
        <div className="signup-prompt">
          <span>Don't have an account? </span>
          <Link to="/free-account">
            <button type="button" className="signup-btn">Sign up for Free</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;