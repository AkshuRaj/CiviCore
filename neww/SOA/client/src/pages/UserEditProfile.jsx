import UserSidebar from "../components/UserSidebar";
import { useState } from "react";

export default function UserEditProfile() {
  const [form, setForm] = useState({ name: "", email: "" });

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />
      <main style={{ flex: 1, padding: 28 }}>
        <h2>Edit Profile</h2>
        <div style={{ maxWidth: 520 }}>
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e6e9ef" }} />

          <label style={{ marginTop: 12 }}>Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e6e9ef" }} />

          <div style={{ marginTop: 12 }}>
            <button style={{ padding: "8px 12px", background: "#095bb5", color: "#fff", border: "none", borderRadius: 8 }}>Save</button>
          </div>
        </div>
      </main>
    </div>
  );
}
