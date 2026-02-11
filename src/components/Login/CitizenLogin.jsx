// src/pages/UserLogin.jsx
import { useEffect, useState } from "react";
import React from "react";
import "./CitizenLogin.css";
import login from "../../assets/login.gif";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const slides = [
  {
    title: "One portal. Every complaint.",
    text: "Register civic, governance, safety and consumer complaints in one unified system.",
  },
  {
    title: "7‑day action commitment.",
    text: "We target action or a reasoned response on every valid complaint within 7 days.",
  },
  {
    title: "Transparent status tracking.",
    text: "Track your complaints from registered to resolved with clear, timestamped updates.",
  },
];

export default function CitizenLogin({ onBack }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [mode, setMode] = useState("password"); // "password" | "otp" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const id = setInterval(
      () => setSlideIndex((i) => (i + 1) % slides.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  const apiBase = "http://localhost:5000";

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    if (!email || !password) {
      setStatus({ type: "error", text: "Email and password are required." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/login/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", text: data.message || "Login failed." });
      } else {
        setStatus({ type: "success", text: "Login successful." });
        // Save user data + token to AuthContext
        if (data.token && data.user) {
          login(data.user, data.token);
          // Give context a moment to update, then navigate
          setTimeout(() => navigate("/user/dashboard"), 100);
        }
      }
    } catch {
      setStatus({ type: "error", text: "Network error while logging in." });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLoginOtp = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    if (!email) {
      setStatus({ type: "error", text: "Enter your registered email first." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/login/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({
          type: "error",
          text: data.message || "Could not send OTP.",
        });
      } else {
        setStatus({
          type: "success",
          text: "Login OTP sent to your email.",
        });
        setMode("otp");
      }
    } catch {
      setStatus({ type: "error", text: "Network error while sending OTP." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    if (!email || !loginOtp) {
      setStatus({ type: "error", text: "Enter email and OTP." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: loginOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", text: data.message || "Invalid OTP." });
      } else {
        setStatus({ type: "success", text: "Login successful via OTP." });
        // Save user data + token to AuthContext
        if (data.token && data.user) {
          login(data.user, data.token);
          // Give context a moment to update, then navigate
          setTimeout(() => navigate("/user/dashboard"), 100);
        }
      }
    } catch {
      setStatus({ type: "error", text: "Network error while verifying OTP." });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestForgotOtp = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    if (!email) {
      setStatus({ type: "error", text: "Enter your registered email." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/forgot/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({
          type: "error",
          text: data.message || "Could not send OTP.",
        });
      } else {
        setStatus({
          type: "success",
          text: "Password reset OTP sent to your email.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: "Network error while sending password reset OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    if (!email || !forgotOtp || !newPassword) {
      setStatus({
        type: "error",
        text: "Email, OTP and new password are required.",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/forgot/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: forgotOtp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", text: data.message || "OTP invalid." });
      } else {
        setStatus({
          type: "success",
          text: "Password updated successfully. You can now login.",
        });
        setMode("password");
        setPassword("");
        setForgotOtp("");
        setNewPassword("");
      }
    } catch {
      setStatus({
        type: "error",
        text: "Network error while updating password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = slides[slideIndex];
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <div className="login-page">
      <div className="login-layout">
        {/* Left slideshow */}
        <aside className="login-left">
          <div className="login-logo-pill">OCMS</div>
          <div className="login-slide">
            <h2>{currentSlide.title}</h2>
            <p>{currentSlide.text}</p>
          </div>
          <div className="login-slide-dots">
            {slides.map((s, i) => (
              <button
                key={s.title}
                className={`login-dot ${
                  i === slideIndex ? "login-dot--active" : ""
                }`}
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </div>
          <br />
          <div className="loginimage">
            <img src={login} alt="Login image" />
          </div>
          <div className="login-left-footer">
            <p>Online Complaint Management System</p>
            <p className="login-left-footnote">
              Trusted by citizens, powered by departments.
            </p>
          </div>
        </aside>

        {/* Right: login form */}
        <main className="login-right">
          <header className="login-header">
            <button
              className="login-back-btn"
              onClick={() => {
                if (onBack) return onBack();
                navigate('/');
              }}
            >
              ← Back
            </button>
            <div className="login-header-text">
              <p className="login-kicker">Citizen Login</p>
              <h1>Sign in to OCMS</h1>
              <p>
                Access your dashboard, register new complaints and track
                existing ones in real time.
              </p>
            </div>
          </header>

          <div className="login-card">
            {status.text && (
              <div
                className={`login-status login-status--${
                  status.type || "info"
                }`}
              >
                {status.text}
              </div>
            )}

            <div className="login-tabs">
              <button
                className={`login-tab ${
                  mode === "password" ? "login-tab--active" : ""
                }`}
                onClick={() => setMode("password")}
              >
                Password login
              </button>
              <button
                className={`login-tab ${
                  mode === "otp" ? "login-tab--active" : ""
                }`}
                onClick={() => setMode("otp")}
              >
                Email OTP login
              </button>
              <button
                className={`login-tab ${
                  mode === "forgot" ? "login-tab--active" : ""
                }`}
                onClick={() => setMode("forgot")}
              >
                Forgot password
              </button>
            </div>

            {/* Password login */}
            {mode === "password" && (
              <form className="login-form" onSubmit={handlePasswordLogin}>
                <div className="login-field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div
                  className="login-field"
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <label htmlFor="password">Password</label>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "90%",
                      padding: "12px 45px 12px 12px",
                      fontSize: "14px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  />

                  {/* Eye Icon */}
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "38px",
                      cursor: "pointer",
                      fontSize: "18px",
                      color: "#555",
                      userSelect: "none",
                    }}
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <div className="login-row">
                  <button
                    type="button"
                    className="login-link"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  className="login-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            )}

            {/* OTP login */}
            {mode === "otp" && (
              <form
                className="login-form login-form--otp"
                onSubmit={
                  loginOtp ? handleVerifyLoginOtp : handleRequestLoginOtp
                }
              >
                <div className="login-field">
                  <label htmlFor="otp-email">Registered email</label>
                  <input
                    id="otp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="login-field">
                  <label htmlFor="login-otp">OTP (sent to email)</label>
                  <input
                    id="login-otp"
                    type="text"
                    maxLength={6}
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    placeholder="Enter OTP after you receive it"
                  />
                </div>

                <button
                  className="login-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : loginOtp
                      ? "Verify OTP & Sign in"
                      : "Send OTP to email"}
                </button>
              </form>
            )}

            {/* Forgot password */}
            {mode === "forgot" && (
              <form className="login-form" onSubmit={handleVerifyForgotOtp}>
                <div className="login-field">
                  <label htmlFor="forgot-email">Registered email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="login-field">
                  <label htmlFor="forgot-otp">
                    OTP for password reset
                    <button
                      type="button"
                      className="login-otp-request-link"
                      onClick={handleRequestForgotOtp}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send / Resend OTP"}
                    </button>
                  </label>
                  <input
                    id="forgot-otp"
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                  />
                </div>
                <div
                  className="login-field"
                  style={{
                    position: "relative",
                    width: "90%",
                  }}
                >
                  <label htmlFor="new-password">New Password</label>

                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    style={{
                      width: "100%",
                      padding: "12px 45px 12px 12px",
                      fontSize: "14px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  />

                  {/* Eye Icon */}
                  <span
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "38px",
                      cursor: "pointer",
                      fontSize: "18px",
                      color: "#555",
                      userSelect: "none",
                    }}
                    title={showNewPassword ? "Hide Password" : "Show Password"}
                  >
                    {showNewPassword ? "🙈" : "👁️"}
                  </span>
                </div>
                <button
                  className="login-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            )}

            {/* Social login */}
            <div className="login-social">
              <div className="login-social-divider">
                <span>or continue with</span>
              </div>
              <div className="login-social-row">
                <button
                  className="login-social-btn login-social-btn--google"
                  onClick={() =>
                    (window.location.href = `${apiBase}/auth/google`)
                  }
                >
                  <span className="login-social-icon">G</span>
                  <span>Google</span>
                </button>
                <button
                  className="login-social-btn login-social-btn--facebook"
                  onClick={() =>
                    (window.location.href = `${apiBase}/auth/facebook`)
                  }
                >
                  <span className="login-social-icon">f</span>
                  <span>Facebook</span>
                </button>
              </div>
              <p className="login-social-note">
                Social login will authenticate you with the provider and then
                create or link your OCMS citizen account.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}