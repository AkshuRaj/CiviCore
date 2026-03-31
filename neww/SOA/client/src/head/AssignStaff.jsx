import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/forms.css";
import HeadSidebar from "../components/HeadSidebar";

export default function AssignStaff({ complaintId }) {
  const [staff, setStaff] = useState("");
  const [priority, setPriority] = useState("Medium");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/complaints/${complaintId}/assign`, {
        staffId: staff,
        priority
      });
      alert("Complaint assigned to staff successfully with 21-day SLA");
      navigate("/head/assigned");
    } catch (error) {
      alert("Error assigning complaint: " + error.message);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "80vh" }}>
      <HeadSidebar />
      <main style={{ flex: 1, padding: 28 }}>
        <div className="form-wrapper">
          <div className="form-card" style={{ maxWidth: 520 }}>
            <h3 className="form-title">Assign Staff</h3>
            <form className="form-grid" onSubmit={submit}>
              <div className="form-field">

                <label className="form-label">Staff</label>
                <select className="form-select" value={staff} onChange={(e) => setStaff(e.target.value)} required>
                  <option value="">Select Staff</option>
                  <option value="2">Ramesh</option>
                  <option value="3">Suresh</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Priority</label>
                <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
