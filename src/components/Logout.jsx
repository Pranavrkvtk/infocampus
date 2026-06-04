import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/login");
  }, [navigate]);

  return <h2>Logging out...</h2>;
}

export default Logout;