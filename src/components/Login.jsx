// src/components/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { login } from "../api/authApi";
import Swal from "sweetalert2";

function Login() {
  const navigate = useNavigate();
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
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);

    try {
      // ✅ FIX: Normalize email to lowercase before sending
      const normalizedEmail = email.trim().toLowerCase();

      console.log("📧 Original email:", email);
      console.log("📧 Normalized email:", normalizedEmail);

      const response = await login({ email: normalizedEmail, password });
      const data = response.data;

      console.log("🔍 Login Response:", data);

      // Get the stored user data
      const userStr = localStorage.getItem("user");
      const userData = userStr ? JSON.parse(userStr) : {};
      const role = userData.role || "USER";

      console.log("✅ User data from localStorage:", userData);
      console.log("✅ Role:", role);

      await Swal.fire({
        icon: "success",
        title: `Welcome ${userData.name || "User"}! 👋`,
        text: "Login Successful",
        confirmButtonColor: "#10b981",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Redirect based on role
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        navigate("/admin");
      } else if (role === "INSTRUCTOR") {
        navigate("/instructor");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);

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
            errorMessage =
              "Your account has been deactivated or deleted. Please contact the administrator.";
            localStorage.clear();
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
        errorMessage =
          "Unable to connect to the server. Please check your internet connection.";
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
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#4a7fb5" />
              <path
                d="M9 24 Q11 13 18 11 Q25 13 27 24"
                stroke="#f5c842"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="18" cy="11" r="3.5" fill="#3abf94" />
              <path
                d="M15 18 L21 18"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18 15 L18 21"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="logo-text">
            Info<span>campus</span>
          </span>
        </div>

        <h2 className="login-heading">Welcome back</h2>
        <p className="login-sub">Sign in to continue your learning journey</p>

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
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPass(!showPass)}
                disabled={loading}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="signup-prompt">
          <span>Don't have an account? </span>
          <Link to="/free-account">
            <button type="button" className="signup-btn" disabled={loading}>
              <span>Create Free Account →</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;