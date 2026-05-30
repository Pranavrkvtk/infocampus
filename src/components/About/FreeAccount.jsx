import React from "react";
import "./FreeAccount.css";

function FreeAccount() {
  return (
    <div className="fa-page">
      <div className="fa-card">

        <h2>Create Free Account</h2>
        <p>Access 328 free lessons, labs and quizzes. No credit card required.</p>

        <form className="fa-form" onSubmit={e => e.preventDefault()}>

          <div>
            <label>Full Name</label>
            <input type="text" placeholder="John Smith" required />
          </div>

          <div>
            <label>Email Address</label>
            <input type="email" placeholder="john@example.com" required />
          </div>

          <div>
            <label>Password</label>
            <input type="password" placeholder="Min. 8 characters" required />
          </div>

          <button className="fa-btn" type="submit">Create Free Account</button>

        </form>

        <p className="fa-footer">
          Already have an account? <a href="/login">Sign in</a>
        </p>

      </div>
    </div>
  );
}

export default FreeAccount;