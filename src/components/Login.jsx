import React from "react";
import "./Login.css";
function Login() {
  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>

      <form style={{ maxWidth: "400px" }}>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;