import { useState, useEffect, useMemo } from 'react';
import "./myComplaints.css";
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../utils/apiClient';

function formatId(id) {
  return `#CMP-${String(id).padStart(4, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function statusClass(status) {
  if (!status) return 'status registered';
  const normalized = String(status).toUpperCase().replace(/[^A-Z_]/g, '_');
  switch (normalized) {
    case 'IN_PROGRESS':
      return 'status in-progress';
    case 'CLOSED':
      return 'status resolved';
    case 'PENDING':
    default:
      return 'status registered';
  }
}

function MyComplaints() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Fetch user complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        setComplaints([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetchWithAuth('http://localhost:5000/api/user-complaints');
        const text = await res.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = {}; }

        if (!res.ok) {
          const msg = data.message || data.error || 'Failed to fetch complaints';
          setError(msg);
          setComplaints([]);
        } else {
          setComplaints(data.complaints || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Network error while fetching complaints');
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();

    // Listen for new complaints
    const handleUpdate = () => fetchComplaints();
    window.addEventListener('mycomplaints:updated', handleUpdate);
    return () => window.removeEventListener('mycomplaints:updated', handleUpdate);
  }, [token]);

  const searchNormalized = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!searchNormalized) return complaints;
    return complaints.filter(c => {
      const idMatch = formatId(c.id).toLowerCase().includes(searchNormalized) || String(c.id).includes(searchNormalized);
      const categoryMatch = (c.category || '').toLowerCase().includes(searchNormalized);
      const titleMatch = (c.title || '').toLowerCase().includes(searchNormalized);
      return idMatch || categoryMatch || titleMatch;
    });
  }, [complaints, searchNormalized]);

  if (loading) {
    return (
      <div className="complaints-page">
        <h2>My Complaints</h2>
        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading complaints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="complaints-page">
        <h2>My Complaints</h2>
        <p style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="complaints-page">
        <h2>My Complaints</h2>
        <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '1rem' }}>
            No complaints registered yet
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Start by clicking "Lodge Complaint" in the sidebar to register a complaint
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="complaints-page">
    <div className="complaints-header">
        <h2>My Complaints</h2>
        <input
          className="complaints-search"
          type="search"
          placeholder="Search by ID, category, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search complaints"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="no-results">No complaints found.</p>
      ) : (
        <div className="complaints-grid">
          
          {filtered.map((c) => (
            <div className="complaint-card" key={c.id}>
              <div className="card-top">
                <div className="card-id">{formatId(c.id)}</div>
                <div className="card-title">{c.title}</div>
              </div>
              <div className="card-body">
                <div className="card-row"><span className="label">Category:</span> {c.category}</div>
                <div className="card-row"><span className="label">Location:</span> {c.location || c.city || c.address || ''}</div>
                <div className="card-row"><span className="label">Registered:</span> {formatDate(c.registeredAt)}</div>
                <div className="card-row"><span className="label">Status:</span> <span className={statusClass(c.status)}>{String(c.status || '').toUpperCase()}</span></div>
              </div>
              <div className="card-footer">
                <button className="view-btn" type="button">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyComplaints;
