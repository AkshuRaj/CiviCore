import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Staff.css";

export default function StaffDashboard() {
  const staffId = localStorage.getItem("staffId") || 1;
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/staff/${staffId}`)
      .then(res => setComplaints(res.data))
      .catch(err => console.error(err));
  }, [staffId]);

  const activeCount = complaints.filter(c => c.status !== "RESOLVED").length;
  const completedCount = complaints.filter(c => c.status === "RESOLVED").length;

  return (
    <div className="staff-dashboard">
      <h1 className="page-title">Staff Dashboard</h1>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card active">
          <h4>Active Complaints</h4>
          <p>{activeCount}</p>
        </div>
        <div className="stat-card completed">
          <h4>Completed</h4>
          <p>{completedCount}</p>
        </div>
      </div>

      {/* ASSIGN EMPLOYEE BUTTON */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/staff/assign-employee")}
          style={{
            padding: "12px 20px",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          📋 Assign Employee to Complaints
        </button>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Employee</th>
            </tr>
          </thead>

          <tbody>
            {complaints.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">
                  No complaints assigned
                </td>
              </tr>
            )}

            {complaints.map(c => (
              <tr key={c.id}>
                <td>{c.category}</td>
                <td>{c.description}</td>
                <td>
                  <span className={`priority ${c.priority?.toLowerCase()}`}>
                    {c.priority}
                  </span>
                </td>
                <td>
                  <span className={`status ${c.status.toLowerCase()}`}>
                    {c.status.replaceAll("_", " ")}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: c.employee_id ? "#C8E6C9" : "#FFCCBC",
                    color: c.employee_id ? "#2E7D32" : "#E64A19",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    {c.employee_id ? "Assigned" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
