import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <h2>Loading...</h2>;

  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default PublicRoute;