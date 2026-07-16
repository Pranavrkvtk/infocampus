import React, { useState } from "react";
import "./FreeAccount.css";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, CheckCircle, ArrowRight, Phone } from "lucide-react";

function FreeAccount() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8082';

  const validateGmailFormat = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return { valid: false, message: "Only @gmail.com addresses are allowed" };
    }
    const username = email.split('@')[0];
    if (username.length < 6) {
      return { valid: false, message: "Gmail username must be at least 6 characters" };
    }
    if (!/[a-zA-Z]/.test(username)) {
      return { valid: false, message: "Gmail username must contain at least one letter" };
    }
    return { valid: true, message: "Valid Gmail format" };
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return { valid: false, message: "Phone number must be exactly 10 digits" };
    }
    return { valid: true, message: "Valid phone number" };
  };

  const sendOtp = async () => {
    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email first",
        confirmButtonColor: "#714b67",
      });
      return;
    }

    const emailValidation = validateGmailFormat(email.trim().toLowerCase());
    if (!emailValidation.valid) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: emailValidation.message,
        confirmButtonColor: "#714b67",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "info",
          title: "📧 Code Sent!",
          text: `We've sent a 6-digit code to ${email.trim().toLowerCase()}`,
          confirmButtonColor: "#714b67",
        });
        setShowOtpInput(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.error || "Could not send verification code",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not connect to server",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Code",
        text: "Please enter the 6-digit verification code",
        confirmButtonColor: "#714b67",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailVerified(true);
        setShowOtpInput(false);
        Swal.fire({
          icon: "success",
          title: "✅ Verified!",
          text: "Your email has been verified",
          confirmButtonColor: "#714b67",
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Verification Failed",
          text: data.error || "Invalid or expired code",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not verify code",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire({ icon: "warning", title: "Name Required", text: "Please enter your name", confirmButtonColor: "#714b67" });
      return;
    }

    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(name.trim())) {
      Swal.fire({ icon: "warning", title: "Invalid Name", text: "Name must not contain numbers or special characters", confirmButtonColor: "#714b67" });
      return;
    }

    if (!email.trim()) {
      Swal.fire({ icon: "warning", title: "Email Required", text: "Please enter your email", confirmButtonColor: "#714b67" });
      return;
    }

    const emailValidation = validateGmailFormat(email.trim().toLowerCase());
    if (!emailValidation.valid) {
      Swal.fire({ icon: "warning", title: "Invalid Email", text: emailValidation.message, confirmButtonColor: "#714b67" });
      return;
    }

    if (!emailVerified) {
      Swal.fire({ icon: "warning", title: "Email Not Verified", text: "Please verify your email first", confirmButtonColor: "#714b67" });
      return;
    }

    if (!phone.trim()) {
      Swal.fire({ icon: "warning", title: "Phone Required", text: "Please enter your phone number", confirmButtonColor: "#714b67" });
      return;
    }

    const phoneValidation = validatePhone(phone.trim());
    if (!phoneValidation.valid) {
      Swal.fire({ icon: "warning", title: "Invalid Phone", text: phoneValidation.message, confirmButtonColor: "#714b67" });
      return;
    }

    if (!password.trim()) {
      Swal.fire({ icon: "warning", title: "Password Required", text: "Please enter your password", confirmButtonColor: "#714b67" });
      return;
    }

    const passwordRegex = /^[0-9]{6}$/;
    if (!passwordRegex.test(password.trim())) {
      Swal.fire({ icon: "warning", title: "Invalid Password", text: "Password must be exactly 6 digits", confirmButtonColor: "#714b67" });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({ icon: "warning", title: "Passwords Don't Match", text: "Password and Confirm Password must match", confirmButtonColor: "#714b67" });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password.trim(),
          role: "USER",
          status: "ACTIVE"
        })
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "🎉 Account Created!",
          text: `Welcome, ${name.trim()}! Redirecting to login...`,
          confirmButtonColor: "#714b67",
          timer: 2500,
          timerProgressBar: true,
          allowOutsideClick: false,
        });
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: data.error || "Could not create account",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not connect to server",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fa-page">
      <div className="fa-card">
        <div className="fa-header">
          <h2>Create Account</h2>
        </div>

        <form className="fa-form" onSubmit={handleRegister}>
          {/* Name */}
          <div className="fa-group">
            <div className="fa-input-icon">
              <User size={18} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!/[0-9]/.test(val)) setName(val);
                }}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email with OTP */}
          <div className="fa-group">
            <div className="fa-input-icon">
              <Mail size={18} />
              <input
                type="email"
                placeholder="Email (Gmail only)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || emailVerified}
              />
            </div>
            <div className="fa-email-actions">
              {!emailVerified ? (
                <button type="button" onClick={sendOtp} disabled={isLoading} className="fa-otp-btn">
                  {isLoading ? 'Sending...' : 'Verify Email'}
                </button>
              ) : (
                <span className="fa-verified">✅ Verified</span>
              )}
            </div>
          </div>

          {/* OTP Input */}
          {showOtpInput && !emailVerified && (
            <div className="fa-group fa-otp-group">
              <div className="fa-input-icon">
                <Lock size={18} />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[0-9]*$/.test(val) && val.length <= 6) setOtp(val);
                  }}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="fa-otp-actions">
                <button type="button" onClick={verifyOtp} disabled={isLoading} className="fa-verify-btn">
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button type="button" onClick={sendOtp} className="fa-resend-btn">
                  Resend
                </button>
              </div>
            </div>
          )}

          {/* Phone */}
          <div className="fa-group">
            <div className="fa-input-icon">
              <Phone size={18} />
              <input
                type="tel"
                placeholder="Phone Number (10 digits)"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]*$/.test(val) && val.length <= 10) setPhone(val);
                }}
                maxLength={10}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="fa-group">
            <div className="fa-input-icon">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Password (6 digits)"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]*$/.test(val) && val.length <= 6) setPassword(val);
                }}
                maxLength={6}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="fa-group">
            <div className="fa-input-icon">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]*$/.test(val) && val.length <= 6) setConfirmPassword(val);
                }}
                maxLength={6}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button className="fa-btn" type="submit" disabled={isLoading || !emailVerified}>
            {isLoading ? 'Creating...' : 'Get Started →'}
          </button>
        </form>

        <div className="fa-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
   
        </div>
      </div>
    </div>
  );
}

export default FreeAccount;