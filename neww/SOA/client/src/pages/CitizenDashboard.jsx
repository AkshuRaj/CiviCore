// src/pages/CitizenDashboard.jsx
import { useState } from "react";
import axios from "axios";

export default function CitizenDashboard() {
  const [email, setEmail] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/citizen/${email}`
      );
      setComplaints(res.data);
      setError("");
    } catch (err) {
      setError("No complaints found");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Citizen Dashboard</h2>

      {/* LOGIN USING EMAIL */}
      <input
        type="email"
        placeholder="Enter registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={loadComplaints}>View Complaints</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />

      {/* COMPLAINT LIST */}
      {complaints.map((c) => (
        <div
          key={c.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px"
          }}
        >
          <p><b>ID:</b> {c.id}</p>
          <p><b>Category:</b> {c.category}</p>
          <p><b>Description:</b> {c.description}</p>
          <p><b>Status:</b> {c.status}</p>

          {/* SAME MESSAGE AS EMAIL */}
          <p style={{ color: "green" }}>
            <b>Message:</b> {c.notification_message}
          </p>
        </div>
      ))}
    </div>
  );
}
