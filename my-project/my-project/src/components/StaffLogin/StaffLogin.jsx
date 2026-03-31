// src/components/StaffLogin/StaffLogin.jsx
import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./StaffLogin.css";

const ROLE_LABEL = {
  PRIMARY_ADMIN: "Primary Admin",
  SECONDARY_ADMIN: "Secondary Admin",
  HEAD: "Head",
  STAFF: "Staff",
  EMPLOYEE: "Employee",
};

export default function StaffLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";

  const [tab, setTab] = useState(defaultTab); // "login" | "status"
  const [form, setForm] = useState({ email: "", password: "" });
  const [statusEmail, setStatusEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [applicationStatus, setApplicationStatus] = useState(null);

  const showMsg = (text, type = "error") => setMessage({ text, type });
  const clearMsg = () => setMessage({ text: "", type: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMsg();
    if (!form.email || !form.password) return showMsg("Email and password are required.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/staff-register/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.status === "PENDING") {
          showMsg("⏳ " + data.message, "warn");
        } else if (data.status === "REJECTED") {
          showMsg("❌ " + data.message, "error");
        } else {
          showMsg(data.message || "Login failed.", "error");
        }
        return;
      }

      // Store token and user
      localStorage.setItem("ocms_staff_token", data.token);
      localStorage.setItem("ocms_staff_user", JSON.stringify(data.user));

      showMsg("Login successful! Redirecting...", "success");
      setTimeout(() => {
        navigate("/staff/dashboard");
      }, 600);
    } catch {
      showMsg("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    clearMsg();
    if (!statusEmail) return showMsg("Please enter your email address.");
    setLoading(true);
    setApplicationStatus(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/staff-register/check-status?email=${encodeURIComponent(statusEmail)}`
      );
      const data = await res.json();
      if (!res.ok) return showMsg(data.message || "No application found.");
      setApplicationStatus(data.application);
    } catch {
      showMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s) =>
    s === "APPROVED" ? "#22c55e" : s === "REJECTED" ? "#ef4444" : "#f59e0b";
  const statusIcon  = (s) =>
    s === "APPROVED" ? "✅" : s === "REJECTED" ? "❌" : "⏳";

  return (
    <div className="sl-root">
      {/* Header */}
      <div className="sl-header">
        <button className="sl-back-btn" onClick={() => navigate("/")}>← Home</button>
        <div className="sl-header-text">
          <h1>Online Complaint Management System</h1>
          <p>Staff & Officials Portal</p>
        </div>
      </div>

      <div className="sl-content">
        <div className="sl-card">
          {/* Tab Toggle */}
          <div className="sl-tabs">
            <button
              className={`sl-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => { setTab("login"); clearMsg(); setApplicationStatus(null); }}
            >
              🔑 Login
            </button>
            <button
              className={`sl-tab ${tab === "status" ? "active" : ""}`}
              onClick={() => { setTab("status"); clearMsg(); }}
            >
              📋 Check Application Status
            </button>
          </div>

          {message.text && (
            <div className={`sl-message sl-message--${message.type}`}>{message.text}</div>
          )}

          {/* ── LOGIN TAB ── */}
          {tab === "login" && (
            <div className="sl-panel">
              <div className="sl-icon">🏛️</div>
              <h2>Staff Login</h2>
              <p className="sl-subtitle">Login to access your approval dashboard. Only <strong>approved</strong> staff and admins can log in.</p>

              <form onSubmit={handleLogin} className="sl-form">
                <div className="sl-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="sl-field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button type="submit" className="sl-btn" disabled={loading}>
                  {loading ? "Logging in..." : "Login →"}
                </button>
              </form>

              <div className="sl-links">
                <Link to="/staff_signup">New application? Register here</Link>
                <span>·</span>
                <Link to="/">Back to Home</Link>
              </div>

              {/* Quick role guide */}
              <div className="sl-role-guide">
                <p className="sl-role-guide-title">Who can login here?</p>
                <div className="sl-role-chips">
                  {Object.entries(ROLE_LABEL).map(([k, v]) => (
                    <span key={k} className={`sl-chip sl-chip--${k.toLowerCase().replace("_", "-")}`}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CHECK STATUS TAB ── */}
          {tab === "status" && (
            <div className="sl-panel">
              <div className="sl-icon">🔍</div>
              <h2>Check Application Status</h2>
              <p className="sl-subtitle">
                Enter the email address you registered with to check the current status of your staff application.
              </p>

              <form onSubmit={handleCheckStatus} className="sl-form">
                <div className="sl-field">
                  <label>Registered Email</label>
                  <input
                    type="email"
                    value={statusEmail}
                    onChange={(e) => setStatusEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button type="submit" className="sl-btn" disabled={loading}>
                  {loading ? "Checking..." : "Check Status"}
                </button>
              </form>

              {applicationStatus && (
                <div className="sl-status-card" style={{ "--status-color": statusColor(applicationStatus.status) }}>
                  <div className="sl-status-icon">{statusIcon(applicationStatus.status)}</div>
                  <div className="sl-status-info">
                    <h3>{applicationStatus.name}</h3>
                    <p className="sl-status-meta">
                      Role: <strong>{ROLE_LABEL[applicationStatus.role] || applicationStatus.role}</strong>
                      &nbsp;|&nbsp;
                      Applied: <strong>{new Date(applicationStatus.created_at).toLocaleDateString("en-IN")}</strong>
                    </p>
                    <span className="sl-status-badge" style={{ background: statusColor(applicationStatus.status) }}>
                      {applicationStatus.status}
                    </span>
                    {applicationStatus.rejection_reason && (
                      <p className="sl-reject-reason">
                        Reason: {applicationStatus.rejection_reason}
                      </p>
                    )}
                    {applicationStatus.status === "PENDING" && (
                      <p className="sl-pending-msg">Your application is being reviewed. Please check back later.</p>
                    )}
                    {applicationStatus.status === "APPROVED" && (
                      <p className="sl-approved-msg">🎉 You can now <button className="sl-link-btn" onClick={() => setTab("login")}>login here</button>!</p>
                    )}
                  </div>
                </div>
              )}

              <div className="sl-links" style={{ marginTop: "20px" }}>
                <Link to="/staff_signup">Apply now</Link>
                <span>·</span>
                <Link to="/">Back to Home</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
