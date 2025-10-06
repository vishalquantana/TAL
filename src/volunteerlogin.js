// volunteerlogin.js
import React, { useState } from "react";

export default function VolunteerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        // store volunteer_id so student form knows who added the record
        localStorage.setItem("volunteer_id", data.volunteer_id);
        alert("Login successful");
        window.location.href = "/studentform";
      } else {
        alert((data.message || "Login failed"));
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(" Could not reach server. Make sure backend is running.");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "30px auto", padding: 20 }}>
      <h2>Volunteer Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
}
