import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { clearDashboardSummaryCache } from "../pages/mainpages/dashboardApi.js";
import {
  ACTIVITY_LOG_CREATED_EVENT,
  createLogActivity,
} from "../pages/log-activity/logActivityApi.js";
import { useAuth } from "../store/AuthContext.jsx";
import { getRouteActivityPayload } from "../utils/routeActivityLogger.js";

const ROUTE_ACTIVITY_DEDUP_MS = 1500;

const getRecentRouteActivityKey = (pathname = "") =>
  `route-activity:${String(pathname || "").trim()}`;

const wasLoggedRecently = (pathname = "") => {
  if (!pathname || typeof window === "undefined") {
    return false;
  }

  try {
    const storageKey = getRecentRouteActivityKey(pathname);
    const previousTimestamp = Number(sessionStorage.getItem(storageKey) || 0);

    if (
      Number.isFinite(previousTimestamp) &&
      previousTimestamp > 0 &&
      Date.now() - previousTimestamp < ROUTE_ACTIVITY_DEDUP_MS
    ) {
      return true;
    }

    sessionStorage.setItem(storageKey, String(Date.now()));
    return false;
  } catch {
    return false;
  }
};

const useRouteActivityLogger = () => {
  const location = useLocation();
  const { authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const payload = getRouteActivityPayload(location);

    if (!payload || wasLoggedRecently(payload.endpoint)) {
      return;
    }

    createLogActivity(payload)
      .then(() => {
        clearDashboardSummaryCache();
        window.dispatchEvent(
          new CustomEvent(ACTIVITY_LOG_CREATED_EVENT, {
            detail: payload,
          }),
        );
      })
      .catch(() => {});
  }, [authLoading, isAuthenticated, location]);
};

export default useRouteActivityLogger;

