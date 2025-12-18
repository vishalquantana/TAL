import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "./supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./studentlogin.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");

  // ✅ Validation functions
  const validatePassword = (value) => {
    const errors = [];
    if (!/[a-z]/.test(value)) errors.push("Must include a lowercase letter");
    if (!/[A-Z]/.test(value)) errors.push("Must include an uppercase letter");
    if (!/[0-9]/.test(value)) errors.push("Must include a number");
    if (!/[@$!%*?&]/.test(value)) errors.push("Must include a special character (@$!%*?&)");
    if (value.length < 8) errors.push("Must be at least 8 characters long");
    return errors;
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (
          window.location.href.includes("access_token") ||
          window.location.href.includes("refresh_token") ||
          window.location.href.includes("type=recovery")
        ) {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        }

        const { data } = await supabase.auth.getSession();
        setHasSession(!!data.session);
      } catch (err) {
        console.error(err);
        toast.error("Failed to verify reset link");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordErrors = validatePassword(password);
    const confirmErrors = password !== confirmPassword ? ["Passwords do not match"] : [];

    setErrors({
      password: passwordErrors,
      confirmPassword: confirmErrors,
    });

    if (passwordErrors.length > 0 || confirmErrors.length > 0) {
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Password updated successfully!");

      await supabase.auth.signOut();

      setTimeout(() => {
        if (role === "admin") {
          navigate("/adminlogin");
        } else if (role === "student") {
          navigate("/studentlogin");
        } else if (role === "donor") {
          navigate("/donorlogin");
        } else {
          navigate("/volunteerlogin");
        }
      }, 1500);
    } catch (err) {
      toast.error(err.message);
    }
  };
  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
        Verifying reset link...
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Reset Password</h1>

        {!hasSession && (
          <p style={{ color: "Red" }}>
             Please use reset link from email.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "40px", width: "100%" }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92 1.11-1.11L3.51 2.3 2.4 3.41l2.92 2.92C4.13 8.74 4 9.35 4 10c0 2.76 2.24 5 5 5 .65 0 1.26-.13 1.83-.36l2.92 2.92 1.11-1.11L12 7z" fill="#666"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#666"/>
                  </svg>
                )}
              </span>
            </div>
            {errors.password && (
              <ul style={{ color: "red", textAlign: "left", margin: "0" }}>
                {errors.password.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingRight: "40px", width: "100%" }}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showConfirmPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92 1.11-1.11L3.51 2.3 2.4 3.41l2.92 2.92C4.13 8.74 4 9.35 4 10c0 2.76 2.24 5 5 5 .65 0 1.26-.13 1.83-.36l2.92 2.92 1.11-1.11L12 7z" fill="#666"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#666"/>
                  </svg>
                )}
              </span>
            </div>
            {errors.confirmPassword && (
              <p style={{ color: "red", margin: "0" }}>{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit">Update Password</button>
        </form>

        <ToastContainer position="top-center" />
      </div>
    </div>
  );
}
