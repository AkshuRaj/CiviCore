import { useState, useEffect } from "react";
import "./user.css";
import ComplaintForm from "./ComplaintForm";
import MyComplaints from "./MyComplaints";
import ViewStatus from "./ViewStatus";
import CategoryPage from "../modules/complaint/category";
import UserSidebar from "./UserSidebar";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../utils/apiClient';

function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const initialPage = location?.state?.show === 'complaints' ? 'complaints' : 'home';
  const [page, setPage] = useState(initialPage);
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

  // Home Page
  if (page === "home") {
    return (
      <div className="user-dashboard-wrapper">
        <UserSidebar onNavigate={setPage} currentPage={page} />
        <div className="dashboard-container">
          <h2>Welcome back, {userName} 👋</h2>

          {/* Trust & Confidence Message */}
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

          {/* Statistics Cards */}
          <div className="statistics-container">
            {/* Total Complaints Card */}
            <div className="stat-card stat-blue">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <p className="stat-number">{stats.total}</p>
                <p className="stat-label">Total Complaints Registered</p>
              </div>
            </div>

            {/* Pending Complaints Card */}
            <div className="stat-card stat-orange">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <p className="stat-number">{stats.pending}</p>
                <p className="stat-label">Complaints Pending</p>
              </div>
            </div>

            {/* Closed Complaints Card */}
            <div className="stat-card stat-green">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <p className="stat-number">{stats.closed}</p>
                <p className="stat-label">Complaints Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Complaint Form Page (kept for internal navigation fallback)
  if (page === "form") {
    return (
      <div className="user-dashboard-wrapper">
        <UserSidebar onNavigate={setPage} currentPage={page} />
        <div className="dashboard-container">
          <button className="back-btn" onClick={() => setPage("home")}>
            ← Back to Home
          </button>
          <ComplaintForm initialCategory={selectedCategory?.id || selectedCategory || ""} />
        </div>
      </div>
    );
  }

  // My Complaints Page
  if (page === "complaints") {
    return (
      <div className="user-dashboard-wrapper">
        <UserSidebar onNavigate={setPage} currentPage={page} />
        <div className="dashboard-container">
          <button className="back-btn" onClick={() => setPage("home")}>
            ← Back to Home
          </button>
          <MyComplaints />
        </div>
      </div>
    );
  }

  // Category Page
  if (page === "category") {
    return (
      <div className="user-dashboard-wrapper">
        <UserSidebar onNavigate={setPage} currentPage={page} />
        <div className="dashboard-container">
          <button className="back-btn" onClick={() => setPage("home")}>
            ← Back to Home
          </button>
          <CategoryPage onSelectCategory={(cat) => {
            // When a category is selected, store it and navigate to form
            setSelectedCategory(cat);
            setPage("form");
          }} />
        </div>
      </div>
    );
  }

  // View Status Page
  if (page === "status") {
    return (
      <div className="user-dashboard-wrapper">
        <UserSidebar onNavigate={setPage} currentPage={page} />
        <div className="dashboard-container">
          <button className="back-btn" onClick={() => setPage("home")}>
            ← Back to Home
          </button>
          <ViewStatus />
        </div>
      </div>
    );
  }

  // Default fallback (should not reach here)
  return (
    <div className="user-dashboard-wrapper">
      <UserSidebar onNavigate={setPage} currentPage={page} />
      <div className="dashboard-container">
        <h2>Welcome back, {userName} 👋</h2>
        <p>Page not found. Please select a menu option.</p>
      </div>
    </div>
  );
}

export default UserDashboard;
