import { useEffect, useState } from "react";
import axios from "axios";

export default function HeadAssigned() {
  const headId = 1;
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
      .get(`http://localhost:5000/head/assigned/${headId}`)
      .then((res) => setList(res.data))
      .catch((err) => console.error(err));
  };

  const fetchStaff = (complaintId) => {
    axios
      .get(`http://localhost:5000/head/staff/${complaintId}`)
      .then((res) =>
        setStaffList((prev) => ({ ...prev, [complaintId]: res.data }))
      )
      .catch((err) => console.error(err));
  };

  const reassign = (complaintId) => {
    const newStaffId = selectedStaff[complaintId];
    if (!newStaffId) return alert("Select staff first!");

    setLoading({ ...loading, [complaintId]: true });
    axios
      .put(`http://localhost:5000/head/reassign/${complaintId}`, {
        newStaffId,
      })
      .then(() => {
        alert("Staff reassigned successfully! Email sent to both staff and citizen.");
        setShowReassign({ ...showReassign, [complaintId]: false });
        setSelectedStaff({ ...selectedStaff, [complaintId]: "" });
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
      <h2>Assigned Complaints - Track & Reassign</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        View complaints assigned to staff and reassign if needed
      </p>

      {list.length === 0 && (
        <p style={{ fontSize: "16px", color: "#999" }}>No assigned complaints yet.</p>
      )}

      {list.map((c) => (
        <div
          key={c.id}
          style={{
            border: "2px solid #2196F3",
            margin: "15px 0",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#f5f9ff",
            boxShadow: "0 2px 8px rgba(33, 150, 243, 0.1)"
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <h3 style={{ color: "#1976d2", margin: "0 0 8px 0" }}>
                  {c.category}
                </h3>
                <p style={{ color: "#555", margin: "5px 0" }}>
                  <strong>Complaint:</strong> {c.description}
                </p>
              </div>
              <span
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                {c.status}
              </span>
            </div>

            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Location:</strong> {c.location}, {c.city}
            </p>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Citizen:</strong> {c.name} ({c.email}) | {c.phone}
            </p>

            {c.staff_id && (
              <div style={{
                backgroundColor: "#e8f5e9",
                padding: "10px",
                borderRadius: "6px",
                marginTop: "10px",
                borderLeft: "3px solid #4CAF50"
              }}>
                <p style={{ margin: "0 0 8px 0", color: "#1b5e20" }}>
                  <strong>Currently Assigned To:</strong> {c.staff_name || `Staff ID: ${c.staff_id}`}
                </p>
              </div>
            )}
          </div>

          {!showReassign[c.id] ? (
            <button
              onClick={() => {
                setShowReassign({ ...showReassign, [c.id]: true });
                fetchStaff(c.id);
              }}
              style={{
                padding: "10px 18px",
                backgroundColor: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              Reassign Staff
            </button>
          ) : (
            <div style={{
              backgroundColor: "#fff3e0",
              padding: "12px",
              borderRadius: "6px",
              borderLeft: "4px solid #FF9800"
            }}>
              <p style={{ margin: "0 0 10px 0", color: "#e65100", fontWeight: "bold" }}>
                Select Different Staff to Assign:
              </p>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                <select
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      [c.id]: e.target.value,
                    })
                  }
                  value={selectedStaff[c.id] || ""}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    flex: 1,
                    minWidth: "200px",
                    fontSize: "14px"
                  }}
                >
                  <option value="">-- Select Available Staff --</option>
                  {staffList[c.id] && staffList[c.id].map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Available)
                    </option>
                  ))}
                </select>
              </div>

              {!staffList[c.id] && (
                <p style={{ color: "#666", fontSize: "13px", margin: "8px 0" }}>
                  Loading available staff...
                </p>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => reassign(c.id)}
                  disabled={loading[c.id] || !selectedStaff[c.id]}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: loading[c.id] || !selectedStaff[c.id] ? "#ccc" : "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading[c.id] || !selectedStaff[c.id] ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    opacity: loading[c.id] || !selectedStaff[c.id] ? 0.6 : 1
                  }}
                >
                  {loading[c.id] ? "Processing..." : "Confirm Reassignment"}
                </button>
                <button
                  onClick={() => {
                    setShowReassign({ ...showReassign, [c.id]: false });
                    setSelectedStaff({ ...selectedStaff, [c.id]: "" });
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#999",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
