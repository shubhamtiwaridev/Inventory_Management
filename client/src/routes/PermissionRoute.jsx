import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext.jsx";
import {
  getFirstAccessibleSidebarPath,
  hasVisibleSidebarAccess,
  isSidebarFeatureVisible,
} from "../utils/permissions.js";

const PermissionRoute = ({
  children,
  sidebarItems = [],
  featurePath = "",
  featureLabel = "",
  requireModuleAccess = false,
}) => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  const hasAccess = requireModuleAccess
    ? hasVisibleSidebarAccess(sidebarItems, user)
    : isSidebarFeatureVisible(user, featurePath, featureLabel);

  if (hasAccess) {
    return children;
  }

  return (
    <Navigate
      to={getFirstAccessibleSidebarPath(sidebarItems, user)}
      replace
    />
  );
};

export default PermissionRoute;
