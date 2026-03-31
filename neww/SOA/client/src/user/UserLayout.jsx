import UserSidebar from "./UserSidebar";
import Navbar from "../components/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function UserLayout() {
  const location = useLocation();
  const [page, setPage] = useState("home");

  // Reset or set page based on navigation state
  useEffect(() => {
    if (location.pathname === "/user/dashboard") {
      if (location.state && location.state.show) {
        setPage(location.state.show);
      } else {
        setPage("home");
      }
    }
  }, [location.pathname, location.state]);

  return (
    <div className="ocms-page">
      <Navbar />
      <div className="user-dashboard-wrapper">
        <UserSidebar setPage={setPage} />
        <div className="dashboard-container">
          <Outlet context={{ page, setPage }} />
        </div>
      </div>
    </div>
  );
}
