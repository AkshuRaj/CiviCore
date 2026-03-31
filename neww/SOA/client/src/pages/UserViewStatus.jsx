import UserSidebar from "../components/UserSidebar";

export default function UserViewStatus() {
  return (
    <div style={{ display: "flex" }}>
      <UserSidebar />
      <main style={{ flex: 1, padding: 28 }}>
        <h2>View Status</h2>
        <p style={{ color: "#6b7280" }}>Enter a complaint ID or check your recent complaints to view current status.</p>
        <input placeholder="Complaint ID" style={{ padding: 8, borderRadius: 8, border: "1px solid #e6e9ef" }} />
      </main>
    </div>
  );
}
