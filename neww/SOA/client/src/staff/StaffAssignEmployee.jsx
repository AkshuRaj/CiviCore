import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StaffAssignEmployee() {
  const staffId = localStorage.getItem("staffId") || 1;
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    axios
      .get(`http://localhost:5000/staff/${staffId}`)
      .then((res) => {
        const assigned = res.data.filter(
          (c) => c.status === "ASSIGNED_TO_STAFF" && !c.employee_id
        );
        setComplaints(assigned);
      })
      .catch((err) => console.error(err));
  };

  const handleComplaintSelect = (complaintId) => {
    setSelectedComplaint(complaintId);
    setSelectedEmployee("");
    setEmployees([]);

    // Fetch available employees for this complaint location
    axios
      .get(`http://localhost:5000/staff/employees/${complaintId}`)
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err));
  };

  const assignEmployee = () => {
    if (!selectedEmployee) return alert("Please select an employee");

    setLoading(true);
    axios
      .put(
        `http://localhost:5000/staff/assign-employee/${selectedComplaint}`,
        { employeeId: selectedEmployee }
      )
      .then(() => {
        alert("Employee assigned successfully!");
        setSelectedComplaint(null);
        setSelectedEmployee("");
        setEmployees([]);
        fetchComplaints();
      })
      .catch((err) => {
        console.error(err);
        alert("Error assigning employee");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Assign Employee to Complaints</h2>
        <button
          onClick={() => navigate("/staff/dashboard")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {complaints.length === 0 && (
        <p style={{ fontSize: "16px", color: "#666" }}>
          No complaints pending employee assignment.
        </p>
      )}

      {complaints.map((complaint) => (
        <div
          key={complaint.id}
          style={{
            border: "2px solid #ddd",
            margin: "15px 0",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor:
              selectedComplaint === complaint.id ? "#f0f8ff" : "#f9f9f9",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <h3 style={{ color: "#333", margin: "0 0 8px 0" }}>
              {complaint.category}
            </h3>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Description:</strong> {complaint.description}
            </p>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Location:</strong> {complaint.location}, {complaint.city}
            </p>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Citizen:</strong> {complaint.name} ({complaint.email})
            </p>
          </div>

          {selectedComplaint === complaint.id ? (
            <div
              style={{
                backgroundColor: "#e3f2fd",
                padding: "12px",
                borderRadius: "6px",
                borderLeft: "4px solid #2196F3",
              }}
            >
              <p style={{ margin: "0 0 8px 0", color: "#1976d2" }}>
                <strong>Available Employees:</strong>
              </p>
              {employees.length === 0 ? (
                <p style={{ color: "#d32f2f", marginBottom: "10px" }}>No available employees in this location.</p>
              ) : (
                <>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    style={{
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.phone}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={assignEmployee}
                  disabled={!selectedEmployee || loading || employees.length === 0}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading || employees.length === 0 ? "not-allowed" : "pointer",
                    opacity: loading || employees.length === 0 ? 0.6 : 1,
                  }}
                >
                  {loading ? "Assigning..." : "Assign Employee"}
                </button>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#999",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleComplaintSelect(complaint.id)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Assign Employee
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
