import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useRef } from "react";
import "../staff/UpdateStatus.css";

export default function EmployeeUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();

    if (!status) return alert("Please select a status");
    if (!remarks.trim()) return alert("Public remarks are required");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("status", status);
      formData.append("remarks", remarks);
      formData.append("internalNote", internalNote);
      if (file) formData.append("proof", file);

      await axios.put(
        `http://localhost:5000/employee/update/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Refresh employee dashboard counts so badges update quickly
      try {
        const employeeId = localStorage.getItem("employeeId") || 1;
        await axios.get(`http://localhost:5000/employee/dashboard/${employeeId}`);
      } catch (e) {
        console.warn("Dashboard refresh failed", e);
      }

      alert("Complaint updated successfully");
      navigate("/employee");
    } catch (err) {
      console.error(err);
      alert("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-page">
      <form className="update-form" onSubmit={submit}>
        <div className="form-header">
          <h3>Employee: Update Complaint</h3>
          <div className="hint">Employee updates will notify head, staff and citizen when resolved</div>
        </div>

        <div className="form-grid">
          <div>
            <label>
              Status <span>*</span>
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} required>
              <option value="">-- Select Status --</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <div className="field-helper">Current selection: {status || 'None'}</div>
          </div>

          <div>
            <label>Upload Proof (Before / After)</label>
            <div className="file-input-wrap">
              <input ref={fileInputRef} style={{ display: "none" }} type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
              <button type="button" className="file-input-btn" onClick={() => fileInputRef.current && fileInputRef.current.click()}>Choose file</button>
              <div className="file-name">{file ? file.name : 'No file chosen'}</div>
            </div>
            <div className="field-helper">Optional: attach proof when resolving complaints</div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Public Remarks (Citizen Visible) <span>*</span></label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter update details for the citizen" required />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Internal Notes (Employee Only)</label>
            <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Internal discussion notes" />
          </div>

          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Update'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
