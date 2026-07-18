// src/components/ForgotPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { forgotPassword } from "../api/authApi";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address",
        confirmButtonColor: "#714b67",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(email.trim().toLowerCase());

      Swal.fire({
        icon: "success",
        title: "📧 Email Sent!",
        html: `
          <p>We've sent a password reset link to</p>
          <p><strong>${email.trim().toLowerCase()}</strong></p>
          <p style="font-size: 13px; color: #6b7280; margin-top: 8px;">
            Please check your inbox and spam folder.
          </p>
        `,
        confirmButtonColor: "#714b67",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/login");
      });

      setEmail("");

    } catch (error) {
      console.error("Forgot Password Error:", error);
      
      let errorMessage = "Could not send reset email. Please try again.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: errorMessage,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-header">
          <Link to="/login" className="fp-back">
            <ArrowLeft size={18} />
            Back to Login
          </Link>
          <h2>🔐 Forgot Password?</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form className="fp-form" onSubmit={handleSubmit}>
          <div className="fp-group">
            <label className="fp-label">Email Address</label>
            <div className="fp-input-icon">
              <Mail size={18} className="fp-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="fp-input"
              />
            </div>
          </div>

          <button 
            className="fp-btn" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="fp-spinner" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="fp-footer">
          <p>
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}