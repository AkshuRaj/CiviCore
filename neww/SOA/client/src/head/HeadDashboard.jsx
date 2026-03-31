import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./HeadDashboard.css";

export default function HeadDashboard() {
  const headId = 1; // replace later with logged-in head id

  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    resolved: 0
    
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/head/dashboard/${headId}`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, [headId]);

  const pending = stats.total - stats.assigned - stats.resolved;

  return (
    <div className="head-dashboard-page">
      <div className="head-dashboard-container">
        {/* HEADER */}
        <div className="head-dashboard-header">
          <h1>Head Dashboard</h1>
          <p>Real-time complaint monitoring and management system</p>
        </div>

        {/* STATS */}
        <div className="head-stats-grid">
          <StatCard 
            title="Total Complaints" 
            value={stats.total} 
            className="blue"
          />
          <StatCard 
            title="Pending" 
            value={pending} 
            className="amber"
          />
          <StatCard 
            title="Assigned to Staff" 
            value={stats.assigned} 
            className="orange"
          />
          <StatCard 
            title="Resolved" 
            value={stats.resolved} 
            className="green"
            
          />
        </div>

        {/* ACTION SECTION */}
        <div className="head-action-section">
          <h2>Quick Actions</h2>
          <div className="head-action-grid">
            <ActionCard
              title="Incoming Complaints"
              subtitle="Review and assign new complaints to staff members"
              icon="📥"
              to="/head/incoming"
              className="incoming"
            />

            <ActionCard
              title="Assigned Complaints"
              subtitle="Track progress of complaints assigned to staff"
              icon="🔍"
              to="/head/assigned"
              className="assigned"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== REUSABLE COMPONENTS ===== */

function StatCard({ title, value, className }) {
  return (
    <div className={`stat-card ${className}`}>
      <p className="stat-label">{title}</p>
      <h2 className="stat-value">{value}</h2>
    </div>
  );
}

function ActionCard({ title, subtitle, icon, to, className }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className={`action-card ${className}`}>
        <div className="action-card-content">
          <div className="action-card-icon">{icon}</div>
          <h2 className="action-card-title">{title}</h2>
          <p className="action-card-subtitle">{subtitle}</p>
        </div>
        <div className="action-card-button">
          Open <span>→</span>
        </div>
      </div>
    </Link>
  );
}
