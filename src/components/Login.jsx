// src/components/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Add useNavigate
import "./Login.css";
import { login } from "../api/authApi";
import Swal from "sweetalert2";

function Login() {
  const navigate = useNavigate(); // ✅ Add this
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter both email and password",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await login({ email, password });
      const data = response.data;

      console.log("Login Response:", data);

      // ✅ Store user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email || email);
      localStorage.setItem("userStatus", data.status || "ACTIVE");

      await Swal.fire({
        icon: "success",
        title: `Welcome ${data.name}! 👋`,
        text: "Login Successful",
        confirmButtonColor: "#10b981",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      const role = data.role?.toUpperCase();
      
      // ✅ Use navigate instead of window.location.replace
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "INSTRUCTOR") {
        navigate("/instructor");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Login Error:", error);

      let errorMessage = "Invalid email or password";
      let errorTitle = "Login Failed ❌";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (typeof data === "string") {
          errorMessage = data;
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (data?.message) {
          errorMessage = data.message;
        }

        if (status === 403) {
          errorTitle = "Account Inactive ⛔";
          if (errorMessage.includes("inactive") || errorMessage.includes("deleted")) {
            errorMessage = "Your account has been deactivated or deleted. Please contact the administrator.";
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userStatus");
          }
        } else if (status === 401) {
          errorTitle = "Invalid Credentials ❌";
          errorMessage = "Invalid email or password. Please try again.";
        } else if (status === 500) {
          errorTitle = "Server Error ⚠️";
          errorMessage = "Something went wrong. Please try again later.";
        }
      } else if (error.request) {
        errorTitle = "Network Error 🌐";
        errorMessage = "Unable to connect to the server. Please check your internet connection.";
      }

      Swal.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-box">
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

        <form onSubmit={handleLogin} autoComplete="off">
          <div className="field-group">
            <label className="field-label">Email address</label>
            <div className="input-wrap">
              <input
                type="email"
                placeholder="you@example.com"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
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

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="/forgot" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="divider"><span>or continue with</span></div>

        <div className="social-row">
          <button className="social-btn" disabled={loading}>Google</button>
          <button className="social-btn" disabled={loading}>GitHub</button>
        </div>

        <div className="signup-prompt">
          <span>Don't have an account? </span>
          <Link to="/free-account">
            <button type="button" className="signup-btn" disabled={loading}>Sign up for Free</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;