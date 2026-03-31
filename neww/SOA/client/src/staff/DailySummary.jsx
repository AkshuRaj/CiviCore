import { useEffect, useState } from "react";
import axios from "axios";

export default function DailySummary() {
  const staffId = localStorage.getItem("staffId");
  const [summary, setSummary] = useState({ total: 0, resolved: 0 });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/staff/summary/${staffId}`)
      .then(res => setSummary(res.data));
  }, []);

  return (
    <div className="card summary-card">
      <h4>Today's Summary</h4>
      <p>Total Assigned Today: {summary.total}</p>
      <p>Resolved Today: {summary.resolved}</p>
    </div>
  );
}
