import { authFetch } from "../../api/authFetch";
import { buildApiUrl } from "../../api/config";

export const ACTIVITY_LOG_CREATED_EVENT = "activity-log-created";

const getResponseList = (response) =>
  Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  return value;
};

const isMissingValue = (value) => {
  const text = String(value ?? "").trim().toLowerCase();
  return !text || text === "-" || text === "guest";
};

const normalizeAction = (value) => {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) return "-";

  const lowered = cleanValue.toLowerCase();

  if (lowered === "created") return "Created";
  if (lowered === "updated") return "Updated";
  if (lowered === "deleted") return "Deleted";
  if (lowered === "opened") return "Opened";
  if (lowered === "cleared") return "Cleared";
  if (lowered === "logged in") return "Logged In";
  if (lowered === "logged out") return "Logged Out";

  return cleanValue;
};
export const mapLogActivityRow = (item) => ({
  id: item._id,
  userEmail: formatValue(item.userEmail),
  userName: formatValue(item.userName),
  role: formatValue(item.role),
  action: normalizeAction(item.action),
  module: formatValue(item.module),
  page: formatValue(item.page),
  resource: formatValue(item.resource),
  targetName: formatValue(item.targetName || item.details?.targetName),
  assignedCards: Array.isArray(item.details?.assignedCards) && item.details.assignedCards.length > 0
    ? item.details.assignedCards.join(", ")
    : "-",
  endpoint: formatValue(item.endpoint),
  time: formatDateTime(item.createdAt),
});

const canReuseActorForLogout = (candidate, logoutItem) => {
  if (!candidate || candidate === logoutItem) return false;

  const action = String(candidate.action || "")
    .trim()
    .toLowerCase();

  if (action === "logged out" || action === "logout failed") return false;
  if (isMissingValue(candidate.userName) && isMissingValue(candidate.userEmail)) {
    return false;
  }

  const logoutTime = new Date(logoutItem?.createdAt || 0).getTime();
  const candidateTime = new Date(candidate?.createdAt || 0).getTime();

  if (!logoutTime || !candidateTime) return false;

  return Math.abs(logoutTime - candidateTime) <= 5 * 60 * 1000;
};

const resolveLogoutActor = (logs, index) => {
  const current = logs[index];

  if (!current) return current;

  const action = String(current.action || "")
    .trim()
    .toLowerCase();

  if (action !== "logged out") return current;
  if (!isMissingValue(current.userName) || !isMissingValue(current.userEmail)) {
    return current;
  }

  for (let offset = 1; offset <= 6; offset += 1) {
    const previousCandidate = logs[index - offset];

    if (canReuseActorForLogout(previousCandidate, current)) {
      return {
        ...current,
        userName: previousCandidate.userName,
        userEmail: previousCandidate.userEmail,
        role: previousCandidate.role,
        targetName:
          current.targetName || previousCandidate.userName || previousCandidate.userEmail,
      };
    }

    const nextCandidate = logs[index + offset];

    if (canReuseActorForLogout(nextCandidate, current)) {
      return {
        ...current,
        userName: nextCandidate.userName,
        userEmail: nextCandidate.userEmail,
        role: nextCandidate.role,
        targetName:
          current.targetName || nextCandidate.userName || nextCandidate.userEmail,
      };
    }
  }

  return current;
};

const request = async (path, options = {}) => {
  const response = await authFetch(buildApiUrl(path), options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const getLogActivities = async ({ limit = 500, search = "" } = {}) => {
  const params = new URLSearchParams({ limit: String(limit) });

  if (search) {
    params.set("search", search);
  }

  const response = await request(`/log-activities?${params.toString()}`);
  const logs = getResponseList(response);

  return logs
    .map((item, index) => resolveLogoutActor(logs, index))
    .map(mapLogActivityRow);
};

export const getLogActivityCount = async ({ search = "" } = {}) => {
  const params = new URLSearchParams({ limit: "1" });

  if (search) {
    params.set("search", search);
  }

  const response = await request(`/log-activities?${params.toString()}`);
  return Number(response?.pagination?.total || 0);
};

export const deleteLogActivity = async (id) => {
  if (!id) return { success: true };

  return request(`/log-activities/${id}`, {
    method: "DELETE",
  });
};

export const createLogActivity = async (payload = {}) =>
  request("/log-activities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
