// src/components/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import api from "../api/axios";
import "./ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    
    console.log("📍 URL params:", location.search);
    console.log("🔑 Token from URL:", tokenParam);
    
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setIsVerifying(false);
      Swal.fire({
        icon: "error",
        title: "Invalid Request",
        text: "No reset token provided. Please request a new password reset.",
        confirmButtonColor: "#dc2626",
      }).then(() => {
        navigate("/forgot-password");
      });
    }
  }, [location, navigate]);

  const validateToken = async (token) => {
    try {
      console.log("🔍 Validating token:", token);
      console.log("📡 API URL:", `${api.defaults.baseURL}/auth/validate-reset-token?token=${token}`);
      
      const response = await api.get(`/auth/validate-reset-token?token=${token}`);
      console.log("✅ Token validation response:", response.data);
      
      if (response.data.valid) {
        setIsValidToken(true);
        setIsVerifying(false);
        Swal.fire({
          icon: "success",
          title: "✅ Valid Link",
          text: "Please enter your new password below.",
          confirmButtonColor: "#10b981",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        setIsVerifying(false);
        Swal.fire({
          icon: "error",
          title: "Invalid or Expired Link",
          text: response.data.error || "This password reset link is invalid or has expired. Please request a new one.",
          confirmButtonColor: "#dc2626",
        }).then(() => {
          navigate("/forgot-password");
        });
      }
    } catch (error) {
      console.error("❌ Token validation error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      
      setIsVerifying(false);
      
      let errorMessage = "Failed to validate reset token. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 404) {
        errorMessage = "The reset endpoint was not found. Please check your server configuration.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.code === "ECONNREFUSED" || error.message?.includes("Network Error")) {
        errorMessage = "Cannot connect to the server. Please make sure the backend is running.";
      }
      
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: errorMessage,
        confirmButtonColor: "#dc2626",
      }).then(() => {
        navigate("/forgot-password");
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must be at least 6 characters long",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords Don't Match",
        text: "Please make sure both passwords match",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔄 Resetting password with token:", token);
      
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      
      console.log("✅ Password reset response:", response.data);

      await Swal.fire({
        icon: "success",
        title: "✅ Password Reset Successfully!",
        html: `
          <p>Your password has been reset successfully.</p>
          <p style="font-size: 13px; color: #6b7280; margin-top: 8px;">
            You can now login with your new password.
          </p>
        `,
        confirmButtonColor: "#10b981",
        confirmButtonText: "Go to Login",
      });

      navigate("/login");

    } catch (error) {
      console.error("❌ Reset Password Error:", error);
      console.error("❌ Error response:", error.response?.data);
      
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 404) {
        errorMessage = "The reset endpoint was not found. Please check your server configuration.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: errorMessage,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className="rp-page">
        <div className="rp-card">
          <div className="rp-header">
            <h2>Verifying...</h2>
            <p>Please wait while we verify your reset link</p>
          </div>
          <div className="rp-loading">
            <div className="rp-spinner-large" />
          </div>
        </div>
      </div>
    );
  }

  // Show invalid token state
  if (!isValidToken) {
    return (
      <div className="rp-page">
        <div className="rp-card">
          <div className="rp-header">
            <div className="rp-icon-wrapper rp-icon-error">
              <AlertCircle size={32} color="#dc2626" />
            </div>
            <h2>Invalid Link</h2>
            <p>This password reset link is invalid or has expired</p>
          </div>
          <button 
            className="rp-btn" 
            onClick={() => navigate("/forgot-password")}
          >
            Request New Link
          </button>
          <div className="rp-footer">
            <p>
              <Link to="/login">← Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show reset form
  return (
    <div className="rp-page">
      <div className="rp-card">
        <div className="rp-header">
          <div className="rp-icon-wrapper">
            <Lock size={32} color="#714b67" />
          </div>
          <h2>🔐 Create New Password</h2>
          <p>Enter your new password below</p>
        </div>

        <form className="rp-form" onSubmit={handleSubmit}>
          <div className="rp-group">
            <label className="rp-label">New Password</label>
            <div className="rp-input-icon">
              <Lock size={18} className="rp-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                className="rp-input"
                minLength={6}
                autoFocus
              />
              <button
                type="button"
                className="rp-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="rp-password-hint">
              <span className={newPassword.length >= 6 ? "rp-hint-valid" : "rp-hint-invalid"}>
                {newPassword.length >= 6 ? "✅" : "⬜"} At least 6 characters
              </span>
            </div>
          </div>

          <div className="rp-group">
            <label className="rp-label">Confirm Password</label>
            <div className="rp-input-icon">
              <Lock size={18} className="rp-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="rp-input"
                minLength={6}
              />
              <button
                type="button"
                className="rp-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {confirmPassword && (
              <div className="rp-password-hint">
                <span className={newPassword === confirmPassword ? "rp-hint-valid" : "rp-hint-invalid"}>
                  {newPassword === confirmPassword ? "✅" : "❌"} 
                  {newPassword === confirmPassword ? " Passwords match" : " Passwords don't match"}
                </span>
              </div>
            )}
          </div>

          <button 
            className="rp-btn" 
            type="submit" 
            disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            {isLoading ? (
              <>
                <span className="rp-spinner" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="rp-footer">
          <p>
            <Link to="/login">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}