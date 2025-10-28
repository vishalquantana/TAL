import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";

export default function VolunteerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("volunteers")
        .select("*")
        .eq("email", email)
        .eq("password", password);

      console.log("Supabase response:", { data, error });

      if (error) {
        alert("Error: " + error.message);
        console.error("Supabase Error:", error);
        return;
      }

      if (data && data.length > 0) {
        alert("Login successful ✅");
        localStorage.setItem("volunteerProfile", JSON.stringify(data[0]));
        navigate("/studentform");
      } else {
        alert("Invalid email or password ❌");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom right, #f7f9fc, #e3ecf5)",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "25px 20px",
          borderRadius: "12px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "18px",
            color: "#333",
            fontSize: "1.4rem",
          }}
        >
          Volunteer Login
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "9px",
              marginBottom: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "0.95rem",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "9px",
              marginBottom: "18px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "0.95rem",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#cdcfbdff",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Login
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "14px",
            fontSize: "0.9rem",
            color: "#555555ff",
          }}
        >
          Don’t have an account?{" "}
          <a
            href="/register"
            style={{ color: "#007bff", textDecoration: "none", fontWeight: 500 }}
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}