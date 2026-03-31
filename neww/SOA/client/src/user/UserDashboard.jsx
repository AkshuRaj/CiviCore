import { useState, useEffect } from "react";
import "./user.css";
import ComplaintForm from "./ComplaintForm";
import MyComplaints from "./MyComplaints";
import ViewStatus from "./ViewStatus";
import CategoryPage from "../complaint/CategoryPage";
import UserSidebar from "./UserSidebar";
import Profile from "../components/profile/Profile";
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../utils/apiClient';

function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  // Use context from UserLayout
  const { page, setPage } = useOutletContext();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const userName = user?.name || "User";

  // Stats state
  const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch stats for the logged-in user
  const fetchStats = async () => {
    if (!token) {
      console.warn('No token available');
      setStats({ total: 0, pending: 0, closed: 0 });
      return;
    }

    console.log('Fetching stats using token');
    setLoadingStats(true);
    try {
      const res = await fetchWithAuth('http://localhost:5000/api/complaints/stats');
      const body = await res.json();

      console.log('Stats response:', body);

      if (res.ok && body.stats) {
        console.log('Stats updated:', body.stats);
        setStats(body.stats);
      } else {
        console.warn('Failed to fetch stats', body);
        setStats({ total: 0, pending: 0, closed: 0 });
      }
    } catch (e) {
      console.error('Failed to fetch stats', e);
      setStats({ total: 0, pending: 0, closed: 0 });
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch stats on mount
  useEffect(() => {
    console.log('UserDashboard mounted, token available:', !!token);
    if (token) {
      fetchStats();
    }
  }, [token]);

  // Listen for stats updates when a complaint is registered
  useEffect(() => {
    const handleStatsUpdate = () => {
      console.log('Stats update event received');
      if (token) {
        fetchStats();
      }
    };

    window.addEventListener('stats:updated', handleStatsUpdate);
    return () => window.removeEventListener('stats:updated', handleStatsUpdate);
  }, [token]);

  // Handle setting page from location state (if any)
  useEffect(() => {
    if (location?.state?.show === 'complaints') {
      setPage('complaints');
    }
  }, [location?.state, setPage]);

  // Render content based on current page inside a single JSX return
  let content = null;

  if (page === "home") {
    content = (
      <>
        <h2>Welcome back, {userName} 👋</h2>

        <div className="trust-message">
          <p className="trust-title">📋 Your Voice Matters</p>
          <p className="trust-desc">
            We are here to listen and act. Every complaint you file is important and deserves attention.
            Our system is designed with your trust in mind—your information is secure, your concerns are
            confidential, and your grievances are handled with care by dedicated officials. From the moment
            you submit, you can track every step of your complaint's progress. We don't just register complaints;
            we work towards real solutions. Your feedback helps us build a better system for everyone.
          </p>
        </div>

        <div className="statistics-container">
          <div className="stat-card stat-blue">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p className="stat-number">{stats.total}</p>
              <p className="stat-label">Total Complaints Registered</p>
            </div>
          </div>

          <div className="stat-card stat-orange">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <p className="stat-number">{stats.pending}</p>
              <p className="stat-label">Complaints Pending</p>
            </div>
          </div>

          <div className="stat-card stat-green">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <p className="stat-number">{stats.closed}</p>
              <p className="stat-label">Complaints Closed</p>
            </div>
          </div>
        </div>
      </>
    );
  } else if (page === "form") {
    content = (
      <>
        <button className="back-btn" onClick={() => setPage("home")}>← Back to Home</button>
        <ComplaintForm initialCategory={selectedCategory?.id || selectedCategory || ""} />
      </>
    );
  } else if (page === "complaints") {
    content = (
      <>
        <button className="back-btn" onClick={() => setPage("home")}>← Back to Home</button>
        <MyComplaints />
      </>
    );
  } else if (page === "category") {
    content = (
      <>
        <button className="back-btn" onClick={() => setPage("home")}>← Back to Home</button>
        <CategoryPage onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setPage("form");
        }} />
      </>
    );
  } else if (page === "status") {
    content = (
      <>
        <button className="back-btn" onClick={() => setPage("home")}>← Back to Home</button>
        <ViewStatus />
      </>
    );
  } else if (page === "profile") {
    content = (
      <>
        <button className="back-btn" onClick={() => setPage("home")}>← Back to Home</button>
        <Profile />
      </>
    );
  } else {
    content = (
      <>
        <h2>Welcome back, {userName} 👋</h2>
        <p>Page not found. Please select a menu option.</p>
      </>
    );
  }

  return (
    <div className="dashboard-inner">{content}</div>
  );
}

export default UserDashboard;
