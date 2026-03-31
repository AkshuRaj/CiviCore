import { useEffect, useState } from "react";
import axios from "axios";

export default function Incoming() {
  const headId = 1; // replace with logged-in head id
  const [list, setList] = useState([]);
  const [staffList, setStaffList] = useState({});
  const [selectedStaff, setSelectedStaff] = useState({});
  const [showReassign, setShowReassign] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    axios
      .get(`http://localhost:5000/head/incoming/${headId}`)
      .then((res) => {
        console.log("API Response:", res.data);
        setList(res.data);
      })
      .catch((err) => console.error(err));
  };

  // 🔹 Fetch available staff using complaintId
  const fetchStaff = (complaintId) => {
    axios
      .get(`http://localhost:5000/head/staff/${complaintId}`)
      .then((res) =>
        setStaffList((prev) => ({ ...prev, [complaintId]: res.data }))
      )
      .catch((err) => console.error(err));
  };

  // 🔹 Confirm auto-assigned staff
  const confirmAutoAssign = (complaintId) => {
    setLoading({ ...loading, [complaintId]: true });
    axios
      .put(`http://localhost:5000/head/confirm-assign/${complaintId}`)
      .then(() => {
        alert("Staff assignment confirmed! Email sent.");
        setLoading({ ...loading, [complaintId]: false });
        fetchComplaints();
      })
      .catch((err) => {
        console.error(err);
        setLoading({ ...loading, [complaintId]: false });
        alert("Error confirming assignment");
      });
  };

  // 🔹 Reassign staff
  const reassign = (complaintId) => {
    const newStaffId = selectedStaff[complaintId];
    if (!newStaffId) return alert("Select staff first!");

    setLoading({ ...loading, [complaintId]: true });
    axios
      .put(`http://localhost:5000/head/reassign/${complaintId}`, {
        newStaffId,
      })
      .then(() => {
        alert("Staff reassigned successfully! Email sent.");
        setShowReassign({ ...showReassign, [complaintId]: false });
        setLoading({ ...loading, [complaintId]: false });
        fetchComplaints();
      })
      .catch((err) => {
        console.error(err);
        setLoading({ ...loading, [complaintId]: false });
        alert("Error reassigning staff");
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Incoming Complaints - Head Dashboard</h2>

      {list.length === 0 && <p style={{ fontSize: "16px", color: "#666" }}>No complaints pending assignment.</p>}

      {list.map((c) => (
        <div
          key={c.id}
          style={{
            border: "2px solid #ddd",
            margin: "15px 0",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9"
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <h3 style={{ color: "#333", margin: "0 0 8px 0" }}>
              {c.category}
            </h3>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Complaint:</strong> {c.description}
            </p>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Location:</strong> {c.location}, {c.city}
            </p>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Citizen:</strong> {c.name} ({c.email})
            </p>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Phone:</strong> {c.phone}
            </p>
          </div>

          {(c.auto_assigned_staff || c.auto_assigned_staff_id) && !showReassign[c.id] ? (
            // AUTO-ASSIGNED STAFF - PENDING CONFIRMATION
            <div style={{
              backgroundColor: "#e3f2fd",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "10px",
              borderLeft: "4px solid #2196F3"
            }}>
              <p style={{ margin: "0 0 8px 0", color: "#1976d2" }}>
                <strong>Auto-Assigned Staff:</strong>{' '}
                {c.auto_assigned_staff
                  ? `${c.auto_assigned_staff} (ID: ${c.auto_assigned_staff_id})`
                  : `Staff ID: ${c.auto_assigned_staff_id}`}
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => confirmAutoAssign(c.id)}
                  disabled={loading[c.id]}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading[c.id] ? "not-allowed" : "pointer",
                    opacity: loading[c.id] ? 0.6 : 1
                  }}
                >
                  {loading[c.id] ? "Processing..." : "Confirm Assignment"}
                </button>
                <button
                  onClick={() => {
                    setShowReassign({ ...showReassign, [c.id]: true });
                    fetchStaff(c.id);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#FF9800",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Reassign Different Staff
                </button>
              </div>
            </div>
          ) : null}

          {showReassign[c.id] && (
            <div style={{
              backgroundColor: "#fff3e0",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "10px",
              borderLeft: "4px solid #FF9800"
            }}>
              <p style={{ margin: "0 0 8px 0", color: "#e65100" }}>
                <strong>Choose Staff to Assign:</strong>
              </p>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <select
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      [c.id]: e.target.value,
                    })
                  }
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    flex: 1
                  }}
                >
                  <option value="">-- Select Staff --</option>
                  {staffList[c.id] && staffList[c.id].map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Available)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => reassign(c.id)}
                  disabled={loading[c.id]}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading[c.id] ? "not-allowed" : "pointer",
                    opacity: loading[c.id] ? 0.6 : 1
                  }}
                >
                  {loading[c.id] ? "Processing..." : "Confirm Reassignment"}
                </button>
                <button
                  onClick={() => setShowReassign({ ...showReassign, [c.id]: false })}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#999",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!staffList[c.id] && showReassign[c.id] && (
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>Loading available staff...</p>
          )}
        </div>
      ))}
    </div>
  );
}
