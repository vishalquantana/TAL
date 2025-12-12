// src/AdminLogin.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import supabase from "./supabaseClient";
import "./studentlogin.css"; // or rename to adminlogin.css if you prefer

export default function AdminLogin() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (password.length > 64) return "Password must be less than 64 characters long";
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])([A-Za-z\d!@#$%^&*]{8,64})$/;
    if (!passwordRegex.test(password)) {
      return "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character";
    }
    return "";
  };

  const validateName = (name) => {
    if (!name) return "Full name is required";
    if (name.trim().length < 2) return "Full name must be at least 2 characters long";
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name.trim())) return "Full name can only contain letters and spaces";
    return "";
  };

  // Handle input changes with validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!isSignIn) {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (!isSignIn) {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (!isSignIn) {
      setErrors(prev => ({ ...prev, name: validateName(value) }));
    }
  };

  // ✅ Check session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session) {
        const userType = session.user.user_metadata.user_type;

        if (userType === "admin") {
          // ✅ Correct role → navigate to dashboard
          navigate("/admin-dashboard");
        } else {
          // 🚫 Wrong role → force sign out
          await supabase.auth.signOut();
          toast.error("Unauthorized! Please use the correct login portal.");
          setLoading(false);
        }
      } else {
        // No active session → show login form
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);



  // ✅ Handle Sign In & Sign Up
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};
    if (isSignIn) {
      // Sign in validation
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;
      if (!password) newErrors.password = "Password is required";
    } else {
      // Sign up validation
      const nameError = validateName(name);
      if (nameError) newErrors.name = nameError;
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;
      const passwordError = validatePassword(password);
      if (passwordError) newErrors.password = passwordError;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      if (isSignIn) {
        // 🟢 Admin sign-in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const { user } = data;
        const userType = user?.user_metadata?.user_type;

        if (userType !== "admin") {
          await supabase.auth.signOut();
          toast.error("Access denied. Please use the correct login portal.");
          return;
        }

        toast.success("Admin signed in successfully!");
        navigate("/admin-dashboard");
      } else {
        // 🟡 Admin sign-up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              user_type: "admin", // 👈 This ensures trigger inserts into admin table
            },
          },
        });
        if (error) throw error;
        toast.success("Admin account created successfully!");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ✅ Optional: Google Sign-In (only if you want Google auth for admins)
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/admin-dashboard",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>{isSignIn ? "Sign In" : "Admin Sign Up"}</h1>

        <form onSubmit={handleSubmit}>
          {!isSignIn && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={handleNameChange}
                className={errors.name ? "input-error" : ""}
                required
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={handleEmailChange}
            className={errors.email ? "input-error" : ""}
            required
          />
          {errors.email && <p className="error-text">{errors.email}</p>}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className={errors.password ? "input-error" : ""}
            required
          />
          {errors.password && <p className="error-text">{errors.password}</p>}

          <button type="submit">{isSignIn ? "Sign In" : "Sign Up"}</button>
        </form>

        <div className="divider">or</div>

        <button className="google-btn" onClick={handleGoogleSignIn}>
          Continue with Google
        </button>

        <p className="switch-text">
          {isSignIn ? "New admin?" : "Already have an account?"}{" "}
          <span onClick={() => setIsSignIn(!isSignIn)}>
            {isSignIn ? "Create an account" : "Sign in"}
          </span>
        </p>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
