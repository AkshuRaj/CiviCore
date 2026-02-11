import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./usersidebar.css";

function UserSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("dashboard");

  const handleMenuClick = (path, key) => {
    setActiveItem(key);
    navigate(path);

    if (window.innerWidth <= 768) {
      setTimeout(() => setIsOpen(false), 100);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`user-sidebar ${isOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">

          <div className="sidebar-section">
            <ul className="nav-menu">

              <li>
                <button
                  className={`nav-item ${activeItem === "dashboard" ? "active" : ""}`}
                  onClick={() => handleMenuClick("/user/dashboard", "dashboard")}
                >
                  User Dashboard
                </button>
              </li>

              <li>
                <button
                  className={`nav-item ${activeItem === "lodge" ? "active" : ""}`}
                  onClick={() => handleMenuClick("/user/categories", "lodge")}
                >
                  Lodge Complaint
                </button>
              </li>

              <li>
                <button
                  className={`nav-item ${activeItem === "complaints" ? "active" : ""}`}
                  onClick={() => handleMenuClick("/user/complaints", "complaints")}
                >
                  My Complaints
                </button>
              </li>

              <li>
                <button
                  className={`nav-item ${activeItem === "status" ? "active" : ""}`}
                  onClick={() => handleMenuClick("/user/status", "status")}
                >
                  View Status
                </button>
              </li>

            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="section-header">Account Activity</h3>
            <ul className="nav-menu">

              <li>
                <button
                  className={`nav-item ${activeItem === "profile" ? "active" : ""}`}
                  onClick={() => handleMenuClick("/user/profile", "profile")}
                >
                  Edit Profile
                </button>
              </li>

              <li>
                <button
                  className="nav-item danger"
                  onClick={() => {
                    if (window.confirm("Delete account permanently?")) {
                      navigate("/user/delete-account");
                    }
                  }}
                >
                  Delete Account
                </button>
              </li>

            </ul>
          </div>

        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item logout"
            onClick={() => {
              logout();
              navigate("/citizen_login");
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default UserSidebar;
