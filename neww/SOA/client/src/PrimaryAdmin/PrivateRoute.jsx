import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const adminId = localStorage.getItem("admin_id");

  if (!adminId) {
    return <Navigate to="/adminlogin" replace />;
  }
  return children;
}

export default PrivateRoute;
