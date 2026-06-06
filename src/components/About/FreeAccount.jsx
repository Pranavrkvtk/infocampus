import React, { useState } from "react";
import "./FreeAccount.css";
import { registerUser } from "./../../api/authApi";
import Swal from "sweetalert2";
function FreeAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  if (!email.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Email Required",
      text: "Please enter your email",
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

  } catch (error) {
    console.log("Error:", error);

    const message =
      error.response?.data?.message ||
      error.response?.data ||
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
          {/* ✅ FIX 2: Dummy hidden fields to prevent Chrome autofill */}
          <input type="text"     name="fakeusernameremembered" style={{ display: "none" }} readOnly />
          <input type="password" name="fakepasswordremembered" style={{ display: "none" }} readOnly />

          {/* NAME */}
          <div>
            <label>Full Name</label>
            <input
              type="text"
              name="register_name"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          {/* EMAIL — ✅ FIX 1: name + autoComplete to block autofill */}
          <div>
            <label>Email Address</label>
            <input
              type="email"
              name="register_email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-email"
              required
            />
          </div>

          {/* PASSWORD — ✅ FIX 1: new-password blocks Chrome autofill */}
          <div>
            <label>Password</label>
            <input
              type="password"
              name="register_password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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