import React, { useState } from "react";
import "./FreeAccount.css";
import { registerUser } from "./../../api/authApi";
import Swal from "sweetalert2";

function FreeAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Name Required",
        text: "Please enter your name",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // ✅ Name must not contain numbers
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

    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // ✅ Gmail-only validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email.trim().toLowerCase())) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Only @gmail.com email addresses are allowed",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    if (!password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Password Required",
        text: "Please enter your password",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // ✅ Password must be exactly 6 digits
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

    // ✅ Confirm password required
    if (!confirmPassword.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Confirm Password Required",
        text: "Please re-enter your password",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    // ✅ Passwords must match
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords Don't Match",
        text: "Password and Confirm Password must be the same",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Password:", password);

      const res = await registerUser({ name, email, password });

      console.log("Success:", res.data);

      await Swal.fire({
        icon: "success",
        title: "🎉 Account Created!",
        html: `
          <h3>Welcome, ${name}!</h3>
          <p>Your account has been created successfully.</p>
        `,
        confirmButtonColor: "#10b981",
        timer: 2500,
        timerProgressBar: true,
      });

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.log("Error:", error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (typeof error.response?.data === "string" ? error.response.data : null) ||
        "Registration Failed";

      Swal.fire({
        icon: "error",
        title: "Registration Failed ❌",
        text: message,
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="fa-page">
      <div className="fa-card">

        <h2>Create Free Account</h2>
        <p>Access 328 free lessons, labs and quizzes. No credit card required.</p>

        <form
          className="fa-form"
          onSubmit={handleRegister}
          autoComplete="off"
        >
          <input type="text"     name="fakeusernameremembered" style={{ display: "none" }} readOnly />
          <input type="password" name="fakepasswordremembered" style={{ display: "none" }} readOnly />

          <div>
            <label>Full Name</label>
            <input
              type="text"
              name="register_name"
              placeholder="John Smith"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                if (!/[0-9]/.test(val)) {
                  setName(val);
                }
              }}
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label>Email Address</label>
            <input
              type="email"
              name="register_email"
              placeholder="john@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-email"
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="register_password"
              placeholder="6 digits only"
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*$/.test(val) && val.length <= 6) {
                  setPassword(val);
                }
              }}
              autoComplete="new-password"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              name="register_confirm_password"
              placeholder="Re-enter 6 digit password"
              value={confirmPassword}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*$/.test(val) && val.length <= 6) {
                  setConfirmPassword(val);
                }
              }}
              autoComplete="new-password"
              maxLength={6}
              required
            />
          </div>

          <button className="fa-btn" type="submit">
            Create Free Account
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