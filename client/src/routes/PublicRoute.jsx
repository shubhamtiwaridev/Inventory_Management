import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import FullPageLoader from "../components/FullPageLoader.jsx";

const PublicRoute = () => {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return (
      <FullPageLoader
        title="Preparing sign in"
        subtitle="Checking whether you already have an active session."
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
