import UserSidebar from "../components/UserSidebar";
import { Link } from "react-router-dom";

export default function UserMyComplaints() {
  // Placeholder page — you can wire API calls to list user's complaints here
  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />
      <main style={{ flex: 1, padding: 28 }}>
        <h2>My Complaints</h2>
        <p style={{ color: "#6b7280" }}>No complaints yet. Use the button below to lodge your first complaint.</p>
        <Link to="/user/complaint" style={{ background: "#095bb5", color: "#fff", padding: "8px 12px", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>Lodge Complaint</Link>
      </main>
    </div>
  );
}
