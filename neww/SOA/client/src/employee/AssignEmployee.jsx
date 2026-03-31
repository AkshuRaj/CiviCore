import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function AssignEmployee() {
  const { id } = useParams();
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    axios
      .get(`http://localhost:5000/staff/employees/${id}`)
      .then(res => setEmployees(res.data))
      .catch(err => {
        console.error(err);
        setError("Failed to load employees");
      });
  }, [id]);

  const assign = () => {
    if (!selected) return alert("Please select an employee to assign");
    setLoading(true);
    setError("");
    axios
      .put(`http://localhost:5000/staff/assign-employee/${id}`, {
        employeeId: selected
      })
      .then(() => alert("Employee assigned"))
      .catch(err => {
        console.error(err);
        setError(err?.response?.data?.message || "Assignment failed");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h3>Assign Employee</h3>

      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}

      <select value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Select Employee</option>
        {employees.map(emp => (
          <option key={emp.id} value={emp.email}>
            {emp.name} - {emp.phone}
          </option>
        ))}
      </select>

      <button onClick={assign} disabled={!selected || loading} style={{ marginLeft: 8 }}>
        {loading ? "Assigning..." : "Assign"}
      </button>
    </div>
  );
}
