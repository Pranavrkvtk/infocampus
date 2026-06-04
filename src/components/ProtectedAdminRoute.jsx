import { Navigate } from "react-router-dom";

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role?.toUpperCase() !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;