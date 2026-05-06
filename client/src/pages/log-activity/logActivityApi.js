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

export const mapLogActivityRow = (item) => ({
  id: item._id,
  userEmail: formatValue(item.userEmail),
  userName: formatValue(item.userName),
  role: formatValue(item.role),
  action: formatValue(item.action),
  module: formatValue(item.module),
  resource: formatValue(item.resource),
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

  const response = await request(`/log-activity?${params.toString()}`);

  return getResponseList(response).map(mapLogActivityRow);
};

export const deleteLogActivity = async (id) => {
  if (!id) return { success: true };

  return request(`/log-activity/${id}`, {
    method: "DELETE",
  });
};
