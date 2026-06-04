import React, { useState } from "react";
import "./FreeAccount.css";
import { registerUser } from "./../../api/authApi";

function FreeAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email");
      return;
    }

    if (!password.trim()) {
      alert("Please enter your password");
      return;
    }

    try {
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Password:", password);

      const res = await registerUser({ name, email, password });

      console.log("Success:", res.data);
      alert("Account Created Successfully");

      setName("");
      setEmail("");
      setPassword("");

    } catch (error) {
      console.log("Error:", error);

      // ✅ FIX 3: Show actual server error message
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Registration Failed";

      alert("❌ " + message);
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