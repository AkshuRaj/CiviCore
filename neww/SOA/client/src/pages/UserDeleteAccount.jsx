import UserSidebar from "../components/UserSidebar";
import { useState } from "react";

export default function UserDeleteAccount() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />
      <main style={{ flex: 1, padding: 28 }}>
        <h2 style={{ color: "#c82333" }}>Delete Account</h2>
        <p style={{ color: "#6b7280" }}>This action will permanently remove your account and data. This cannot be undone.</p>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /> I understand the consequences
        </label>
        <div style={{ marginTop: 12 }}>
          <button disabled={!confirmed} style={{ padding: "8px 12px", background: confirmed ? "#c82333" : "#f1b0b0", color: "#fff", border: "none", borderRadius: 8 }}>Delete Account</button>
        </div>
      </main>
    </div>
  );
}
