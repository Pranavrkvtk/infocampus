import React from "react";
import "./FreeAccount.css";

function FreeAccount() {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Free Account</h2>

        <p>
          Create a free account to access lessons, labs, quizzes, and course
          updates.
        </p>

        <form className="free-account-form">
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email Address" />
          <input type="password" placeholder="Password" />

          <button type="submit">Create Free Account</button>
        </form>
      </div>
    </div>
  );
}

export default FreeAccount;