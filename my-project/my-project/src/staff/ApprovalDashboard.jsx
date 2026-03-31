// src/staff/ApprovalDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./approvalDashboard.css";

const ROLE_LABEL = {
  PRIMARY_ADMIN: "Primary Admin",
  SECONDARY_ADMIN: "Secondary Admin (State)",
  HEAD: "Head (District)",
  STAFF: "Staff (City)",
  EMPLOYEE: "Employee",
};

const APPROVES_LABEL = {
  SECONDARY_ADMIN: "Secondary Admin applications",
  HEAD: "Head applications",
  STAFF: "Staff applications",
  EMPLOYEE: "Employee applications",
};

export default function ApprovalDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [applications, setApplications] = useState([]);
  const [targetRole, setTargetRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "profile"

  useEffect(() => {
    const storedToken = localStorage.getItem("ocms_staff_token");
    const storedUser  = localStorage.getItem("ocms_staff_user");
    if (!storedToken || !storedUser) {
      navigate("/staff_login");
      return;
    }
    setToken(storedToken);
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    if (token) fetchPending();
  }, [token]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/staff-register/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Token expired — re-login
          handleLogout();
          return;
        }
        setMsg({ text: data.message || "Failed to fetch applications", type: "error" });
        return;
      }
      setApplications(data.applications || []);
      setTargetRole(data.targetRole);
    } catch {
      setMsg({ text: "Network error. Please refresh.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve");
    try {
      const res = await fetch(`${API_BASE_URL}/api/staff-register/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return setMsg({ text: data.message || "Could not approve", type: "error" });
      setMsg({ text: "✅ Application approved successfully!", type: "success" });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setMsg({ text: "Network error.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectId) return;
    setActionLoading(rejectId + "_reject");
    try {
      const res = await fetch(`${API_BASE_URL}/api/staff-register/${rejectId}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) return setMsg({ text: data.message || "Could not reject", type: "error" });
      setMsg({ text: "Application rejected.", type: "warn" });
      setApplications((prev) => prev.filter((a) => a.id !== rejectId));
      setRejectId(null);
      setRejectReason("");
    } catch {
      setMsg({ text: "Network error.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ocms_staff_token");
    localStorage.removeItem("ocms_staff_user");
    navigate("/staff_login");
  };

  const roleClass = (role) => role?.toLowerCase().replace("_", "-");

  if (!user) return null;

  return (
    <div className="ad-root">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-brand">
          <div className="ad-brand-icon">🏛️</div>
          <span>OCMS</span>
        </div>
        <nav className="ad-nav">
          <button
            className={`ad-nav-item ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            📋 Pending Approvals
            {applications.length > 0 && (
              <span className="ad-badge">{applications.length}</span>
            )}
          </button>
          <button
            className={`ad-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 My Profile
          </button>
        </nav>
        <button className="ad-logout-btn" onClick={handleLogout}>
          ⬅ Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="ad-main">
        {/* Top bar */}
        <div className="ad-topbar">
          <div>
            <h1>Welcome, {user.name} 👋</h1>
            <p className="ad-role-tag">
              <span className={`ad-chip ad-chip--${roleClass(user.role)}`}>
                {ROLE_LABEL[user.role] || user.role}
              </span>
              {!user.isAdmin && user.state && (
                <span className="ad-location">
                  📍 {[user.state, user.district, user.city].filter(Boolean).join(" › ")}
                </span>
              )}
            </p>
          </div>
          <button className="ad-refresh-btn" onClick={fetchPending} title="Refresh">
            🔄 Refresh
          </button>
        </div>

        {msg.text && (
          <div className={`ad-msg ad-msg--${msg.type}`}>
            {msg.text}
            <button className="ad-msg-close" onClick={() => setMsg({ text: "", type: "" })}>✕</button>
          </div>
        )}

        {/* ── PENDING APPROVALS TAB ── */}
        {activeTab === "pending" && (
          <section className="ad-section">
            {/* Queue info header */}
            <div className="ad-queue-header">
              <div>
                <h2>Pending Applications Queue</h2>
                {targetRole ? (
                  <p className="ad-desc">
                    You can review and approve <strong>{APPROVES_LABEL[targetRole] || targetRole}</strong> below.
                    Applications are listed in order of submission (FIFO).
                  </p>
                ) : (
                  <p className="ad-desc">You do not have any pending applications to review.</p>
                )}
              </div>
              <div className="ad-queue-stat">
                <span className="ad-stat-num">{applications.length}</span>
                <span className="ad-stat-label">Pending</span>
              </div>
            </div>

            {/* Stack/Queue concept visual */}
            {targetRole && (
              <div className="ad-concept-row">
                <div className="ad-concept-box">
                  <span className="ad-concept-tag">📥 QUEUE</span>
                  <p>Applications processed <strong>First-In, First-Out</strong> — oldest applications shown first.</p>
                </div>
                <div className="ad-concept-box">
                  <span className="ad-concept-tag">📚 STACK</span>
                  <p>Approval authority follows a hierarchical <strong>push–pop</strong> chain. Your level approves the next.</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="ad-loading">
                <div className="ad-spinner"></div>
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="ad-empty">
                <div className="ad-empty-icon">🎉</div>
                <h3>No pending applications</h3>
                <p>All applications in your jurisdiction have been processed.</p>
              </div>
            ) : (
              <div className="ad-app-list">
                {applications.map((app, idx) => (
                  <div key={app.id} className="ad-app-card">
                    <div className="ad-app-queue-num">#{idx + 1}</div>
                    <div className="ad-app-body">
                      <div className="ad-app-top">
                        <div>
                          <h3 className="ad-app-name">{app.name}</h3>
                          <p className="ad-app-email">{app.email} · {app.phone}</p>
                        </div>
                        <span className={`ad-chip ad-chip--${roleClass(app.role)}`}>
                          {ROLE_LABEL[app.role] || app.role}
                        </span>
                      </div>

                      <div className="ad-app-meta">
                        <span>📍 {[app.state, app.district, app.city].filter(Boolean).join(", ")}</span>
                        {app.department && <span>🏢 {app.department}</span>}
                        {app.designation && <span>💼 {app.designation}</span>}
                        {app.years_of_experience && <span>📅 {app.years_of_experience}</span>}
                        {app.qualification && <span>🎓 {app.qualification}</span>}
                        <span className="ad-app-date">
                          Applied: {new Date(app.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </span>
                      </div>

                      <div className="ad-app-actions">
                        <button
                          className="ad-btn ad-btn--approve"
                          onClick={() => handleApprove(app.id)}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === app.id + "_approve" ? "Approving..." : "✅ Approve"}
                        </button>
                        <button
                          className="ad-btn ad-btn--reject"
                          onClick={() => { setRejectId(app.id); setRejectReason(""); }}
                          disabled={actionLoading !== null}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <section className="ad-section">
            <h2>My Profile</h2>
            <div className="ad-profile-card">
              <div className="ad-profile-avatar">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="ad-profile-info">
                <h3>{user.name}</h3>
                <p className="ad-profile-email">{user.email}</p>
                <span className={`ad-chip ad-chip--${roleClass(user.role)}`}>
                  {ROLE_LABEL[user.role] || user.role}
                </span>
                {!user.isAdmin && (
                  <div className="ad-profile-location">
                    <p>🌍 Country: <strong>India</strong></p>
                    {user.state    && <p>🗺️ State: <strong>{user.state}</strong></p>}
                    {user.district && <p>📍 District: <strong>{user.district}</strong></p>}
                    {user.city     && <p>🏙️ City: <strong>{user.city}</strong></p>}
                  </div>
                )}
                {user.isAdmin && (
                  <p className="ad-admin-note">🔑 You are a Primary Admin with full system access.</p>
                )}
              </div>
            </div>

            {/* Approval chain info */}
            <div className="ad-chain-card">
              <h3>Your Approval Authority</h3>
              <div className="ad-chain">
                {[
                  { key: "PRIMARY_ADMIN", label: "Primary Admin", scope: "All states" },
                  { key: "SECONDARY_ADMIN", label: "Secondary Admin", scope: "State level" },
                  { key: "HEAD", label: "Head", scope: "District level" },
                  { key: "STAFF", label: "Staff", scope: "City level" },
                  { key: "EMPLOYEE", label: "Employee", scope: "Field worker" },
                ].map((r, i) => (
                  <div
                    key={r.key}
                    className={`ad-chain-step ${(user.role === r.key || (user.isAdmin && r.key === "PRIMARY_ADMIN")) ? "current" : ""}`}
                  >
                    <div className="ad-chain-dot"></div>
                    <div>
                      <strong>{r.label}</strong>
                      <span className="ad-chain-scope">{r.scope}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── REJECT MODAL ── */}
      {rejectId && (
        <div className="ad-modal-overlay" onClick={() => setRejectId(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Application</h3>
            <p>Optionally provide a reason for rejection:</p>
            <textarea
              className="ad-modal-textarea"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (optional)..."
              rows={3}
            />
            <div className="ad-modal-actions">
              <button className="ad-btn ad-btn--secondary" onClick={() => setRejectId(null)}>Cancel</button>
              <button
                className="ad-btn ad-btn--reject"
                onClick={handleRejectSubmit}
                disabled={actionLoading !== null}
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
