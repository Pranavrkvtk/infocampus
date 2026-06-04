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

    const res = await registerUser({
      name,
      email,
      password,
    });

    console.log("Success:", res.data);
    alert("Account Created Successfully");

    setName("");
    setEmail("");
    setPassword("");

  } catch (error) {
    console.log("Error:", error);
    alert("Registration Failed");
  }
};
  return (
    <div className="fa-page">
      <div className="fa-card">

        <h2>Create Free Account</h2>
        <p>Access 328 free lessons, labs and quizzes. No credit card required.</p>

        <form className="fa-form" onSubmit={handleRegister}>

          {/* NAME */}
          <div>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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