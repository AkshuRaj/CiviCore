import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useRef } from "react";
import "../staff/UpdateStatus.css";

export default function EmployeeUpdateComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeeId = localStorage.getItem("employeeId") || 1;

  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();

    // =====================
    // VALIDATION
    // =====================
    if (!status) {
      alert("Please select a status");
      return;
    }

    if (!remarks.trim()) {
      alert("Public remarks are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("status", status);
      formData.append("remarks", remarks);
      formData.append("internalNote", internalNote);
      if (file) formData.append("proof", file);

      const response = await axios.put(
        `http://localhost:5000/employee/update/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Complaint updated successfully! Notifications sent to citizen, head, and staff.");
      navigate("/employee");
    } catch (err) {
      console.error(err);
      alert("Update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-page">
      <form className="update-form" onSubmit={submit}>
        <div className="form-header">
          <h3>Update Complaint Status</h3>
          <div className="hint">
            Update will be sent to citizen, head, and staff
          </div>
        </div>

        <div className="form-grid">
          {/* STATUS */}
          <div>
            <label>
              Status <span>*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              aria-label="Update status"
            >
              <option value="">-- Select Status --</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <div className="field-helper">Current selection: {status || "None"}</div>
          </div>

          {/* FILE UPLOAD */}
          <div>
            <label>Upload Proof/Evidence</label>
            <div className="file-input-wrap">
              <input
                ref={fileInputRef}
                style={{ display: "none" }}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button
                type="button"
                className="file-input-btn"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                Choose file
              </button>
              <div className="file-name">{file ? file.name : "No file chosen"}</div>
            </div>
            <div className="field-helper">
              Optional: Attach proof of work done
            </div>
          </div>

          {/* PUBLIC REMARKS (full width) */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label>
              Public Remarks (Visible to Citizen) <span>*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Describe actions taken and current status"
              required
            />
          </div>

          {/* INTERNAL NOTES (full width) */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label>Internal Notes (Staff & Head Only)</label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Internal notes for staff and head review"
            />
          </div>

          {/* ACTIONS (full width) */}
          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Complaint"}
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/employee")}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
