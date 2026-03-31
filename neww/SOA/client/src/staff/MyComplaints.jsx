import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MyComplaints() {
  const [list, setList] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/staff/Ramesh")
      .then(res => setList(res.data));
  }, []);

  return (
    <div>
      <h3>My Complaints</h3>
      {list.map(c => (
        <div key={c.id}>
          {c.description} - {c.priority}
          <Link to={`/staff/update/${c.id}`}> Update</Link>
        </div>
      ))}
    </div>
  );
}
