// src/pages/StaffLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Stafflogin.css";

export default function StaffLogin({ onBack }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password"); // password | otp | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const apiBase = "http://localhost:5000";

  /* ================= PASSWORD LOGIN ================= */
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setStatus({});

    if (!email || !password) {
      return setStatus({ type: "error", text: "Email and password required." });
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", text: data.message || "Login failed." });
      } else {
        localStorage.setItem("staffId", data.staffId);
        setStatus({ type: "success", text: "Login successful." });
        navigate("/staff");
      }
    } catch {
      setStatus({ type: "error", text: "Server error." });
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTP LOGIN ================= */
  const requestLoginOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      return setStatus({ type: "error", text: "Enter registered email." });
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/staff/login/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", text: data.message });
      } else {
        setStatus({ type: "success", text: "OTP sent to email." });
        setMode("otp");
      }
    } catch {
      setStatus({ type: "error", text: "OTP send failed." });
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async (e) => {
    e.preventDefault();

    if (!email || !loginOtp) {
      return setStatus({ type: "error", text: "Email and OTP required." });
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/staff/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: loginOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", text: data.message });
      } else {
        localStorage.setItem("staffId", data.staffId);
        setStatus({ type: "success", text: "Login successful." });
        navigate("/staff");
      }
    } catch {
      setStatus({ type: "error", text: "OTP verification failed." });
    } finally {
      setLoading(false);
    }
  };

  /* ================= FORGOT PASSWORD ================= */
  const requestForgotOtp = async () => {
    if (!email) {
      return setStatus({ type: "error", text: "Enter registered email." });
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/staff/forgot/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setStatus({
        type: res.ok ? "success" : "error",
        text: data.message || "OTP sent",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyForgotOtp = async (e) => {
    e.preventDefault();

    if (!email || !forgotOtp || !newPassword) {
      return setStatus({ type: "error", text: "All fields required." });
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/staff/forgot/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: forgotOtp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", text: data.message });
      } else {
        setStatus({
          type: "success",
          text: "Password updated. Please login.",
        });
        setMode("password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* LEFT SIDE - BRANDING */}
        <div className="login-left">
          <div className="login-branding">
            <h2>Complaint Management System</h2>
            <p>Staff Dashboard</p>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <main className="login-right">
          <header className="login-header">
            <button
              className="login-back-btn"
              onClick={onBack || (() => window.history.back())}
            >
              ← Back
            </button>
            <h1>Staff Login</h1>
            <p>Staff access portal</p>
          </header>

          <div className="login-card">
            {status.text && (
              <div className={`login-status login-status--${status.type}`}>
                {status.text}
              </div>
            )}

            <div className="login-tabs">
              <button
                className={`login-tab ${mode === "password" ? "login-tab--active" : ""}`}
                onClick={() => setMode("password")}
              >
                Password login
              </button>
              <button
                className={`login-tab ${mode === "otp" ? "login-tab--active" : ""}`}
                onClick={() => setMode("otp")}
              >
                Email OTP login
              </button>
              <button
                className={`login-tab ${mode === "forgot" ? "login-tab--active" : ""}`}
                onClick={() => setMode("forgot")}
              >
                Forgot password
              </button>
            </div>

            {/* PASSWORD */}
            {mode === "password" && (
              <form className="login-form" onSubmit={handlePasswordLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 10, top: 10 }}
                  >
                    {showPassword ? "" : ""}
                  </span>
                </div>

                <button className="login-submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            )}

            {/* OTP */}
            {mode === "otp" && (
              <form
                className="login-form"
                onSubmit={loginOtp ? verifyLoginOtp : requestLoginOtp}
              >
                <input
                  type="email"
                  placeholder="Registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="OTP"
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value)}
                />
                <button className="login-submit" disabled={loading}>
                  {loginOtp ? "Verify OTP & Login" : "Send OTP"}
                </button>
              </form>
            )}

            {/* FORGOT */}
            {mode === "forgot" && (
              <form className="login-form" onSubmit={verifyForgotOtp}>
                <input
                  type="email"
                  placeholder="Registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="OTP"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={requestForgotOtp}>
                  Send / Resend OTP
                </button>
                <button className="login-submit">Update password</button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
