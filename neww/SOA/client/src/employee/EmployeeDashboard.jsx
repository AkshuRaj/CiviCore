import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const employeeId = localStorage.getItem("employeeId") || 1;
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchStats();

    // Auto-refresh complaints every 5 seconds (short polling)
    const interval = setInterval(() => {
      fetchComplaints();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Poll summary counts so badges update quickly when external actions occur
    const sInterval = setInterval(() => {
      fetchStats();
    }, 3000);
    return () => clearInterval(sInterval);
  }, []);

  const fetchComplaints = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/employee/complaints/${employeeId}`)
      .then((res) => setComplaints(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    axios
      .get(`http://localhost:5000/employee/dashboard/${employeeId}`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>Employee Dashboard</h1>

      {/* STATS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#E3F2FD",
            borderRadius: "8px",
            flex: 1,
            borderLeft: "4px solid #2196F3",
          }}
        >
          <h4 style={{ margin: "0 0 5px 0", color: "#1976D2" }}>
            Total Complaints
          </h4>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            {stats ? stats.total : complaints.length}
          </p>
        </div>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#FFF3E0",
            borderRadius: "8px",
            flex: 1,
            borderLeft: "4px solid #FF9800",
          }}
        >
          <h4 style={{ margin: "0 0 5px 0", color: "#E65100" }}>
            In Progress
          </h4>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            {stats ? stats.in_progress : complaints.filter((c) => c.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#C8E6C9",
            borderRadius: "8px",
            flex: 1,
            borderLeft: "4px solid #4CAF50",
          }}
        >
          <h4 style={{ margin: "0 0 5px 0", color: "#2E7D32" }}>
            Resolved
          </h4>
          <p style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            {stats ? stats.resolved : complaints.filter((c) => c.status === "RESOLVED").length}
          </p>
        </div>
      </div>

      {loading && <p style={{ textAlign: "center", color: "#999" }}>Loading complaints...</p>}

      {complaints.length === 0 && !loading && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#F5F5F5",
            borderRadius: "8px",
            textAlign: "center",
            color: "#666",
          }}
        >
          <p>No complaints assigned to you yet.</p>
        </div>
      )}

      {/* COMPLAINTS TABLE */}
      {complaints.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #ddd",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F5F5F5", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                  Category
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                  Description
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                  Location
                </th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                  Status
                </th>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{complaint.category}</td>
                  <td style={{ padding: "12px" }}>{complaint.description}</td>
                  <td style={{ padding: "12px" }}>
                    {complaint.location}, {complaint.city}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          complaint.status === "RESOLVED"
                            ? "#C8E6C9"
                            : complaint.status === "IN_PROGRESS"
                              ? "#FFE0B2"
                              : "#BBDEFB",
                        color:
                          complaint.status === "RESOLVED"
                            ? "#2E7D32"
                            : complaint.status === "IN_PROGRESS"
                              ? "#E65100"
                              : "#1565C0",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {complaint.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <Link
                      to={`/employee/update/${complaint.id}`}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Update
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
