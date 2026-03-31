
import { Link } from "react-router-dom";
import "../styles/forms.css";

export default function HeadSidebar() {
    return (
        <aside style={{ width: 220, padding: 20, backgroundColor: "#f8f9fa", borderRight: "1px solid #ddd" }}>
            <div style={{ marginBottom: 20 }}>
                <h3>Head Dashboard</h3>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Link to="/head/dashboard" style={{ color: "#0b4ea2", fontWeight: 700, textDecoration: "none" }}>Dashboard</Link>
                <Link to="/head/incoming" style={{ color: "#0b4ea2", fontWeight: 700, textDecoration: "none" }}>Incoming Complaints</Link>
                <Link to="/head/assigned" style={{ color: "#0b4ea2", fontWeight: 700, textDecoration: "none" }}>Assigned Complaints</Link>
            </nav>
        </aside>
    );
}
