import { clearDashboardSummaryCache } from "../../mainpages/dashboardApi.js";
import {
  ACTIVITY_LOG_CREATED_EVENT,
  createLogActivity,
} from "../../log-activity/logActivityApi.js";

export const logMachineMaintenanceActivity = async (payload = {}) => {
  const nextPayload = {
    module: "Machine Maintenance",
    ...payload,
  };

  try {
    await createLogActivity(nextPayload);
    clearDashboardSummaryCache();

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(ACTIVITY_LOG_CREATED_EVENT, {
          detail: nextPayload,
        }),
      );
    }
  } catch {
    // Keep UI actions non-blocking if activity logging fails.
  }
};
