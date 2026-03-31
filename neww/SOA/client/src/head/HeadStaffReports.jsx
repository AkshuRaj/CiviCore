import { useEffect, useState } from "react";
import axios from "axios";

export default function HeadStaffReports() {
  const headId = 1; // Replace with logged-in head id
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [headRemarks, setHeadRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    axios
      .get(`http://localhost:5000/head/staff-reports/${headId}`)
      .then((res) => setReports(res.data))
      .catch((err) => console.error(err));
  };

  const handleMarkCompletion = () => {
    if (completion === null || !headRemarks.trim()) {
      return alert("Please select completion status and add remarks");
    }

    setLoading(true);
    axios
      .put(
        `http://localhost:5000/head/mark-completion/${selectedReport.id}`,
        {
          isCompleted: completion,
          headRemarks: headRemarks,
        }
      )
      .then(() => {
        alert(
          `Complaint marked as ${
            completion ? "COMPLETED" : "INCOMPLETE"
          }! Notifications sent.`
        );
        setSelectedReport(null);
        setCompletion(null);
        setHeadRemarks("");
        fetchReports();
      })
      .catch((err) => {
        console.error(err);
        alert("Error marking completion");
      })
      .finally(() => setLoading(false));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "#4CAF50";
      case "INCOMPLETE":
        return "#f44336";
      case "RESOLVED":
        return "#2196F3";
      case "IN_PROGRESS":
        return "#FF9800";
      default:
        return "#999";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Staff Reports & Complaint Reviews</h2>

      {reports.length === 0 && (
        <p style={{ fontSize: "16px", color: "#666" }}>
          No staff reports available yet.
        </p>
      )}

      {reports.map((report) => (
        <div
          key={report.id}
          style={{
            border: "2px solid #ddd",
            margin: "15px 0",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor:
              selectedReport?.id === report.id ? "#f0f8ff" : "#f9f9f9",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <h3 style={{ color: "#333", margin: "0 0 8px 0" }}>
              {report.category}
            </h3>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Description:</strong> {report.description}
            </p>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Location:</strong> {report.location}, {report.city}
            </p>
            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Citizen:</strong> {report.name} ({report.email})
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                margin: "10px 0",
              }}
            >
              <div>
                <strong>Assigned Staff:</strong>
                <p style={{ color: "#666", margin: "5px 0" }}>
                  {report.staffName} ({report.staffEmail})
                </p>
              </div>
              <div>
                <strong>Assigned Employee:</strong>
                <p style={{ color: "#666", margin: "5px 0" }}>
                  {report.employeeName ? `${report.employeeName} (${report.employeeEmail})` : "Not assigned yet"}
                </p>
              </div>
            </div>

            <p style={{ color: "#666", margin: "5px 0" }}>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  backgroundColor: getStatusColor(report.status),
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {report.status}
              </span>
            </p>

            {report.remarks && (
              <p style={{ color: "#666", margin: "5px 0" }}>
                <strong>Employee Remarks:</strong> {report.remarks}
              </p>
            )}

            {report.proof && (
              <p style={{ color: "#666", margin: "5px 0" }}>
                <strong>Proof/Evidence:</strong>{" "}
                <a href={`http://localhost:5000/uploads/${report.proof}`} target="_blank" rel="noreferrer">
                  View Proof
                </a>
              </p>
            )}
          </div>

          {(report.status === "RESOLVED" || report.status === "IN_PROGRESS") &&
          !["COMPLETED", "INCOMPLETE"].includes(report.status) ? (
            <>
              {selectedReport?.id === report.id ? (
                <div
                  style={{
                    backgroundColor: "#e8f5e9",
                    padding: "12px",
                    borderRadius: "6px",
                    borderLeft: "4px solid #4CAF50",
                  }}
                >
                  <p style={{ margin: "0 0 8px 0", color: "#2e7d32" }}>
                    <strong>Mark Complaint Completion:</strong>
                  </p>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                      <input
                        type="radio"
                        name="completion"
                        value="true"
                        checked={completion === true}
                        onChange={() => setCompletion(true)}
                      />
                      {" "}
                      <strong>✓ COMPLETED - All requirements met</strong>
                    </label>
                    <label style={{ display: "block" }}>
                      <input
                        type="radio"
                        name="completion"
                        value="false"
                        checked={completion === false}
                        onChange={() => setCompletion(false)}
                      />
                      {" "}
                      <strong>✗ INCOMPLETE - Needs more work</strong>
                    </label>
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      <strong>Head Remarks (Required):</strong>
                    </label>
                    <textarea
                      value={headRemarks}
                      onChange={(e) => setHeadRemarks(e.target.value)}
                      placeholder="Provide feedback or completion notes..."
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        minHeight: "80px",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={handleMarkCompletion}
                      disabled={completion === null || loading}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor:
                          completion === null || loading
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          completion === null || loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? "Processing..." : "Mark Completion"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReport(null);
                        setCompletion(null);
                        setHeadRemarks("");
                      }}
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
                  onClick={() => {
                    setSelectedReport(report);
                    setCompletion(null);
                    setHeadRemarks("");
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Review & Mark Completion
                </button>
              )}
            </>
          ) : (
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "10px",
                borderRadius: "6px",
                borderLeft: "4px solid #999",
              }}
            >
              <p style={{ margin: "0", color: "#666" }}>
                <strong>Completion Status:</strong> {report.status}
              </p>
              {report.head_remarks && (
                <p style={{ margin: "5px 0 0 0", color: "#666" }}>
                  <strong>Head Remarks:</strong> {report.head_remarks}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
