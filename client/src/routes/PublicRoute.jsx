import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
