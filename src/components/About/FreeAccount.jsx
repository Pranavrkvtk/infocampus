import React, { useState } from "react";
import "./FreeAccount.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function FreeAccount() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // ✅ Backend URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082';

  // ✅ Validate Gmail format
  const validateGmailFormat = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return { valid: false, message: "Only @gmail.com email addresses are allowed" };
    }

    const username = email.split('@')[0];
    
    if (username.length < 6) {
      return { valid: false, message: "Gmail username must be at least 6 characters" };
    }
    
    if (!/[a-zA-Z]/.test(username)) {
      return { valid: false, message: "Gmail username must contain at least one letter" };
    }
    
    if (username.includes('..')) {
      return { valid: false, message: "Gmail username cannot contain consecutive dots" };
    }
    
    if (username.startsWith('.') || username.endsWith('.')) {
      return { valid: false, message: "Gmail username cannot start or end with a dot" };
    }

    return { valid: true, message: "Valid Gmail format" };
  };

  // ✅ Send OTP
  const sendOtp = async () => {
    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email first",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const emailValidation = validateGmailFormat(email.trim().toLowerCase());
    if (!emailValidation.valid) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: emailValidation.message,
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "info",
          title: "📧 Verification Code Sent",
          html: `
            <p>We've sent a 6-digit code to <strong>${email.trim().toLowerCase()}</strong></p>
            <p style="font-size: 14px; color: #666;">Please check your inbox or spam folder</p>
          `,
          confirmButtonColor: "#10b981",
        });
        setShowOtpInput(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Send Code",
          text: data.error || "Could not send verification code. Please try again.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not connect to server. Please check your internet connection.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Code",
        text: "Please enter the 6-digit verification code",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          otp: otp.trim() 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailVerified(true);
        setShowOtpInput(false);
        Swal.fire({
          icon: "success",
          title: "✅ Email Verified!",
          text: "Your email has been verified. You can now complete registration.",
          confirmButtonColor: "#10b981",
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: data.error || "Invalid or expired verification code",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not verify code. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Register User
  const handleRegister = async (e) => {
    e.preventDefault();

    // Name validation
    if (!name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name Required",
        text: "Please enter your name",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(name.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Name",
        text: "Name must not contain numbers or special characters",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // Email validation
    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const emailValidation = validateGmailFormat(email.trim().toLowerCase());
    if (!emailValidation.valid) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: emailValidation.message,
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // ✅ Check if email is verified
    if (!emailVerified) {
      Swal.fire({
        icon: "warning",
        title: "Email Not Verified",
        text: "Please verify your email first by clicking 'Send Code'",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // Password validation
    if (!password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Password Required",
        text: "Please enter your password",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const passwordRegex = /^[0-9]{6}$/;
    if (!passwordRegex.test(password.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must be exactly 6 digits",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    if (!confirmPassword.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Confirm Password Required",
        text: "Please re-enter your password",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords Don't Match",
        text: "Password and Confirm Password must be the same",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // ✅ Register user
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          password: password.trim(),
          role: "USER",
          status: "ACTIVE"
        })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Show success message with auto-redirect
        await Swal.fire({
          icon: "success",
          title: "🎉 Account Created!",
          html: `
            <h3>Welcome, ${name.trim()}!</h3>
            <p>Your account has been created with <strong>${email.trim().toLowerCase()}</strong></p>
            <p style="font-size: 14px; color: #666; margin-top: 8px;">
              Redirecting you to login page...
            </p>
          `,
          confirmButtonColor: "#10b981",
          timer: 3000,
          timerProgressBar: true,
          allowOutsideClick: false,
        });

        // ✅ Reset form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setOtp("");
        setShowOtpInput(false);
        setEmailVerified(false);

        // ✅ Redirect to login page
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed ❌",
          text: data.error || "Could not create account. Please try again.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Error registering:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not connect to server. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fa-page">
      <div className="fa-card">
        <h2>Create Free Account</h2>
        <p>Access 328 free lessons, labs and quizzes. No credit card required.</p>

        <form className="fa-form" onSubmit={handleRegister} autoComplete="off">
          <input type="text" name="fakeusernameremembered" style={{ display: "none" }} readOnly />
          <input type="password" name="fakepasswordremembered" style={{ display: "none" }} readOnly />

          <div>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                if (!/[0-9]/.test(val)) {
                  setName(val);
                }
              }}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label>Email Address</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="email"
                placeholder="johnsmith@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || emailVerified}
                style={{ flex: 1 }}
              />
              {!emailVerified ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={isLoading}
                  style={{
                    padding: '10px 16px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    fontSize: '13px'
                  }}
                >
                  {isLoading ? 'Sending...' : 'Send Code'}
                </button>
              ) : (
                <span style={{ 
                  padding: '10px 16px',
                  background: '#10b981',
                  color: '#fff',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  whiteSpace: 'nowrap'
                }}>
                  ✅ Verified
                </span>
              )}
            </div>
            {email && !email.toLowerCase().endsWith('@gmail.com') && (
              <small style={{ color: '#ef4444', fontSize: '12px' }}>
                Only @gmail.com addresses are allowed
              </small>
            )}
            {email && email.toLowerCase().endsWith('@gmail.com') && !emailVerified && (
              <small style={{ color: '#10b981', fontSize: '12px' }}>
                ✅ Valid Gmail format - Click "Send Code" to verify
              </small>
            )}
          </div>

          {/* OTP Input */}
          {showOtpInput && !emailVerified && (
            <div>
              <label>Verification Code</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[0-9]*$/.test(val) && val.length <= 6) {
                      setOtp(val);
                    }
                  }}
                  maxLength={6}
                  style={{ flex: 1 }}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <small style={{ color: '#666', fontSize: '12px' }}>
                Enter the 6-digit code sent to your email
              </small>
              <button
                type="button"
                onClick={sendOtp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline',
                  marginTop: '4px'
                }}
              >
                Resend Code
              </button>
            </div>
          )}

          <div>
            <label>Password (6 digits)</label>
            <input
              type="password"
              placeholder="e.g., 123456"
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*$/.test(val) && val.length <= 6) {
                  setPassword(val);
                }
              }}
              maxLength={6}
              required
              disabled={isLoading}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Must be exactly 6 digits (0-9)
            </small>
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter 6 digit password"
              value={confirmPassword}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*$/.test(val) && val.length <= 6) {
                  setConfirmPassword(val);
                }
              }}
              maxLength={6}
              required
              disabled={isLoading}
            />
            {confirmPassword && password !== confirmPassword && (
              <small style={{ color: '#ef4444', fontSize: '12px' }}>
                ⚠️ Passwords do not match
              </small>
            )}
            {confirmPassword && password === confirmPassword && (
              <small style={{ color: '#10b981', fontSize: '12px' }}>
                ✅ Passwords match
              </small>
            )}
          </div>

          <button 
            className="fa-btn" 
            type="submit" 
            disabled={isLoading || !emailVerified}
          >
            {isLoading ? 'Creating Account...' : 'Create Free Account'}
          </button>

        </form>

        <p className="fa-footer">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default FreeAccount;