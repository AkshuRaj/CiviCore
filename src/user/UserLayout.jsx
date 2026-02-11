import UserSidebar from "./UserSidebar";
import { Outlet } from "react-router-dom";

export default function UserLayout() {
  return (
    <div className="user-dashboard-wrapper">
      <UserSidebar />
      <div className="dashboard-container">
        <Outlet />
      </div>
    </div>
  );
}
