import { authFetch } from "../../api/authFetch";
import { buildApiUrl } from "../../api/config";

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

const normalizeAction = (value) => {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) return "-";

  const lowered = cleanValue.toLowerCase();

  if (lowered.startsWith("created")) return "Created";
  if (lowered.startsWith("updated")) return "Updated";
  if (lowered.startsWith("deleted")) return "Deleted";
  if (lowered.startsWith("opened")) return "Opened";
  if (lowered.startsWith("verified")) return "Verified";
  if (lowered.startsWith("cleared")) return "Cleared";
  if (lowered.startsWith("logged in")) return "Logged In";
  if (lowered.startsWith("logged out")) return "Logged Out";

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
  endpoint: formatValue(item.endpoint),
  time: formatDateTime(item.createdAt),
});

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

  return getResponseList(response).map(mapLogActivityRow);
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
