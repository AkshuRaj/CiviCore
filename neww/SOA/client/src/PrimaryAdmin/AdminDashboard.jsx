import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserShield,
  FaBuilding,
  FaTools,
  FaClipboardList,
  FaEye,
  FaConciergeBell,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // redirect to login if no token
      return;
    }

    // Optional: fetch admin info from backend
    axios
      .get("http://localhost:5000/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAdminName(res.data.admin_name);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login"); // token invalid
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const features = [
    {
      name: "Secondary Admin Approvals",
      icon: <FaUserShield />,
      link: "/secondary-admin-approvals",
    },
    {
      name: "Manage Departments",
      icon: <FaBuilding />,
      link: "/admindepartments",
    },
    {
      name: "Manage Service Types",
      icon: <FaConciergeBell />,
      link: "/adminservice-type",
    },
    { name: "Manage Skills", icon: <FaTools />, link: "/adminskills" },
    { name: "Manage Priorities", icon: <FaTools />, link: "/adminpriority" },
    {
      name: "Manage Complaint Categories",
      icon: <FaClipboardList />,
      link: "/admincomplaint-categories",
    },
    { name: "View Complaints", icon: <FaEye />, link: "/complaints" },
    {
      name: "View Category Gallery",
      icon: <FaEye />,
      link: "/admincategory-gallery",
    },
  ];

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#2c3e50" }}>Primary Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <p style={{ fontSize: "18px", color: "#34495e" }}>
        Welcome, <b>{adminName}</b>
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              width: "220px",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              padding: "20px",
              textAlign: "center",
              transition: "transform 0.2s",
              cursor: "pointer",
            }}
            onClick={() => navigate(feature.link)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                fontSize: "40px",
                color: "#16a085",
                marginBottom: "15px",
              }}
            >
              {feature.icon}
            </div>
            <h3
              style={{
                fontSize: "18px",
                marginBottom: "15px",
                color: "#2c3e50",
              }}
            >
              {feature.name}
            </h3>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#16a085",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
