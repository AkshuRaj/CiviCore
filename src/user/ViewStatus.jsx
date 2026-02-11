import { useState, useEffect } from "react";
import "./viewstatus.css";
import UserSidebar from './UserSidebar';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../utils/apiClient';

function ViewStatus() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  const fetchComplaints = async () => {
    if (!token) {
      setError('User not authenticated');
      setComplaints([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth('http://localhost:5000/api/user-complaints');
      const text = await res.text();
      const body = text ? JSON.parse(text) : {};
      if (res.ok && Array.isArray(body.complaints)) {
        const mapped = body.complaints.map((c) => ({
          id: c.id,
          registrationNumber: c.id ? `CMP-${c.id}` : '',
          receivedDate: c.registeredAt || c.created_at || c.createdAt || new Date().toISOString(),
          title: c.title || '',
          description: c.description || '',
          status: c.status || 'REGISTERED',
          category: c.category || c.category_name || '',
          city: c.city || '',
          address: c.address || '',
          landmark: c.landmark || '',
          priority: c.priority || '',
          raw: c,
        }));
        setComplaints(mapped);
        setCurrentPage(1);
      } else {
        console.warn('Unexpected complaints response', body);
        setComplaints([]);
      }
    } catch (e) {
      console.error('Failed to load complaints', e);
      setError('Failed to load complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchComplaints();
    } else {
      setError('User not authenticated');
      setComplaints([]);
    }

    // listen for updates to re-fetch server-backed complaints
    const handler = () => {
      if (token) fetchComplaints();
    };
    window.addEventListener('mycomplaints:updated', handler);
    return () => window.removeEventListener('mycomplaints:updated', handler);
  }, [token]);

  // Filter complaints based on search
  const filteredComplaints = complaints.filter(complaint =>
    complaint.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredComplaints.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayedComplaints = filteredComplaints.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleFirst = () => {
    setCurrentPage(1);
  };

  const handleLast = () => {
    setCurrentPage(totalPages);
  };

  return (
    <div className="status-wrapper">
      <UserSidebar />
      <div className="view-status-container">
        <h2>List of Grievances</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="refresh-btn" onClick={fetchComplaints} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          {loading && <span style={{ fontSize: 12, color: '#666' }}>Loading...</span>}
        </div>

      <div className="status-controls">
        <div className="entries-selector">
          <select 
            value={entriesPerPage} 
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
          </select>
          <span>entries</span>
        </div>

        <div className="search-box">
          <label htmlFor="search">Search:</label>
          <input
            id="search"
            type="text"
            placeholder="Search by Registration Number or Description"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem' }}>
          {error}
        </div>
      )}

      {loading && complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Loading complaints...
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          No complaints registered yet
        </div>
      ) : (
        <>
      <div className="table-wrapper">
        <table className="grievances-table">
          <thead>
            <tr>
              <th className="col-sn">Sn.</th>
              <th className="col-reg">Registration Number</th>
              <th className="col-date">Registered Date</th>
              <th className="col-title">Title</th>
              <th className="col-cat">Category</th>
              <th className="col-loc">Location</th>
              <th className="col-pri">Priority</th>
              <th className="col-status">Status</th>
              <th className="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedComplaints.length > 0 ? (
              displayedComplaints.map((complaint, index) => (
                <>
                <tr key={complaint.id || index}>
                  <td className="col-sn">{startIndex + index + 1}</td>
                  <td className="col-reg">{complaint.registrationNumber}</td>
                  <td className="col-date">{new Date(complaint.receivedDate).toLocaleDateString()}</td>
                  <td className="col-title">{complaint.title || '-'}</td>
                  <td className="col-cat">{complaint.category || '-'}</td>
                  <td className="col-loc">{complaint.city || ''}</td>
                  <td className="col-pri">{complaint.priority || '-'}</td>
                  <td className="col-status">
                    <span className={`status-badge status-${(complaint.status||'').toLowerCase()}`}>
                      {complaint.status || "Pending"}
                    </span>
                  </td>
                  <td className="col-action">
                    <button className="details-btn" onClick={() => setExpanded(prev => ({ ...prev, [complaint.id]: !prev[complaint.id] }))}>
                      {expanded[complaint.id] ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
                {expanded[complaint.id] && (
                  <tr key={`${complaint.id}-details`} className="details-row">
                    <td colSpan="9">
                      <div className="detail-grid">
                        <div><strong>Description:</strong> {complaint.description || '-'}</div>
                        <div><strong>Address:</strong> {complaint.address || '-'}</div>
                        <div><strong>Landmark:</strong> {complaint.landmark || '-'}</div>
                        <div><strong>Category:</strong> {complaint.category || '-'}</div>
                        <div><strong>City:</strong> {complaint.city || '-'}</div>
                        <div><strong>Priority:</strong> {complaint.priority || '-'}</div>
                        <div><strong>Raw:</strong> <pre style={{whiteSpace: 'pre-wrap', margin: 0}}>{JSON.stringify(complaint.raw || complaint, null, 2)}</pre></div>
                      </div>
                    </td>
                  </tr>
                )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No data available in table
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="entries-info">
          {displayedComplaints.length > 0 ? (
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredComplaints.length)} of{" "}
              {filteredComplaints.length} entries
            </span>
          ) : (
            <span>No entries found</span>
          )}
        </div>

        <div className="pagination">
          <button 
            className="pagination-btn" 
            onClick={handleFirst}
            disabled={currentPage === 1 || totalPages === 0}
          >
            First
          </button>
          <button 
            className="pagination-btn" 
            onClick={handlePrevious}
            disabled={currentPage === 1 || totalPages === 0}
          >
            Prev
          </button>
          <button 
            className="pagination-btn" 
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
          <button 
            className="pagination-btn" 
            onClick={handleLast}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Last
          </button>
        </div>
      </div>
      </>
      )}
      </div>
    </div>
  );
}

export default ViewStatus;
