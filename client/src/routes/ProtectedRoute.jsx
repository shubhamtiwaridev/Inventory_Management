import { Navigate, Outlet, useLocation } from "react-router-dom";
import useRouteActivityLogger from "../hooks/useRouteActivityLogger.jsx";
import { useAuth } from "../store/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  useRouteActivityLogger();

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
