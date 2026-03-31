import { Link } from "react-router-dom";
import "../styles/forms.css";

export default function UserSidebar() {
  return (
    <aside style={{ width: 220, padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <h3>User Dashboard</h3>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link to="/user/complaint" style={{ color: "#0b4ea2", fontWeight: 700 }}>Lodge Complaint</Link>
        <Link to="/user/my-complaints" style={{ color: "#0b4ea2", fontWeight: 700 }}>My Complaints</Link>
        <Link to="/user/view-status" style={{ color: "#0b4ea2", fontWeight: 700 }}>View Status</Link>
        <Link to="/user/edit-profile" style={{ color: "#0b4ea2", fontWeight: 700 }}>Edit Profile</Link>
        <Link to="/user/delete-account" style={{ color: "#c82333", fontWeight: 700 }}>Delete Account</Link>
      </nav>
    </aside>
  );
}
