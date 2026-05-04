import { API_BASE_URL } from "../../../api/config";
import { clearAuthSession, getAuthHeaders } from "../../../api/authStorage";

const GET_CACHE_TTL_MS = 60 * 1000;
const responseCache = new Map();

const cloneCachedValue = (value) => JSON.parse(JSON.stringify(value));

const getCachedResponse = (key) => {
  const entry = responseCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }

  return cloneCachedValue(entry.value);
};

const setCachedResponse = (key, value) => {
  responseCache.set(key, {
    value: cloneCachedValue(value),
    expiresAt: Date.now() + GET_CACHE_TTL_MS,
  });
};

const clearGetCache = () => {
  for (const key of responseCache.keys()) {
    if (key.startsWith("GET:")) {
      responseCache.delete(key);
    }
  }
};

const request = async (url, options = {}) => {
  const { body, headers = {}, ...rest } = options;
  const method = String(rest.method || "GET").toUpperCase();
  const shouldUseCache = method === "GET";
  const cacheKey = `${method}:${url}`;

  if (shouldUseCache) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
      ...headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (response.status === 204) {
    if (method !== "GET") {
      clearGetCache();
    }
    return { success: true };
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    throw new Error(data.message || "Something went wrong");
  }

  if (method !== "GET") {
    clearGetCache();
  }

  if (shouldUseCache) {
    setCachedResponse(cacheKey, data);
  }

  return data;
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  return value;
};

const formatCreatedBy = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;

  return (
    value.name ||
    value.username ||
    value.email ||
    value.fullName ||
    value._id ||
    "-"
  );
};

const pad = (value) => String(value).padStart(2, "0");

const formatDateTimeValue = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const amPm = hours >= 12 ? "PM" : "AM";

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${hours12}:${pad(date.getMinutes())} ${amPm}`;
};

const splitShiftTiming = (item = {}) => {
  const fromTime =
    item.fromTime ||
    item.shiftFrom ||
    item.from ||
    item.startTime ||
    item.start ||
    "";

  const toTime =
    item.toTime || item.shiftTo || item.to || item.endTime || item.end || "";

  if (fromTime || toTime) {
    return {
      fromTime: fromTime || "",
      toTime: toTime || "",
    };
  }

  const combined = String(item.shiftTiming || "").trim();

  if (!combined) {
    return {
      fromTime: "",
      toTime: "",
    };
  }

  const parts = combined.split(" - ");

  if (parts.length >= 2) {
    return {
      fromTime: parts[0]?.trim() || "",
      toTime: parts.slice(1).join(" - ").trim() || "",
    };
  }

  return {
    fromTime: combined,
    toTime: "",
  };
};

const buildShiftTimingPayload = (payload = {}) => {
  const fromTime = String(payload.fromTime || "").trim();
  const toTime = String(payload.toTime || "").trim();

  return {
    shiftTiming:
      fromTime && toTime ? `${fromTime} - ${toTime}` : fromTime || toTime || "",
    fromTime,
    toTime,
    shiftFrom: fromTime,
    shiftTo: toTime,
  };
};

const mapSimpleListRow = (item, fieldName) => ({
  id: item._id,
  [fieldName]: formatValue(item[fieldName]),
  createdBy: formatCreatedBy(item.createdBy),
  createdAt: formatDateTimeValue(item.createdAt),
  updatedAt: formatDateTimeValue(item.updatedAt),
});

const mapSimpleFormValues = (item, fieldName) => ({
  [fieldName]: item[fieldName] || "",
});

export const mapDepartmentListRow = (item) =>
  mapSimpleListRow(item, "department");

export const mapShiftTimingListRow = (item) => {
  const { fromTime, toTime } = splitShiftTiming(item);

  return {
    id: item._id,
    fromTime: formatValue(fromTime),
    toTime: formatValue(toTime),
    createdBy: formatCreatedBy(item.createdBy),
    createdAt: formatDateTimeValue(item.createdAt),
    updatedAt: formatDateTimeValue(item.updatedAt),
  };
};

export const mapPlantSiteListRow = (item) =>
  mapSimpleListRow(item, "plantSite");

export const mapStatusListRow = (item) => mapSimpleListRow(item, "status");
export const mapCriticalLevelListRow = (item) =>
  mapSimpleListRow(item, "criticalLevel");
export const mapUnitOfMeasureListRow = (item) =>
  mapSimpleListRow(item, "unitOfMeasure");
export const mapTaskCategoryListRow = (item) =>
  mapSimpleListRow(item, "taskCategory");
export const mapFrequencyListRow = (item) =>
  mapSimpleListRow(item, "frequency");
export const mapContractTypeListRow = (item) =>
  mapSimpleListRow(item, "contractType");

export const mapDepartmentFormValues = (item) =>
  mapSimpleFormValues(item, "department");

export const mapShiftTimingFormValues = (item) => {
  const { fromTime, toTime } = splitShiftTiming(item);

  return {
    fromTime: fromTime || "",
    toTime: toTime || "",
  };
};

export const mapPlantSiteFormValues = (item) =>
  mapSimpleFormValues(item, "plantSite");

export const mapStatusFormValues = (item) =>
  mapSimpleFormValues(item, "status");
export const mapCriticalLevelFormValues = (item) =>
  mapSimpleFormValues(item, "criticalLevel");
export const mapUnitOfMeasureFormValues = (item) =>
  mapSimpleFormValues(item, "unitOfMeasure");
export const mapTaskCategoryFormValues = (item) =>
  mapSimpleFormValues(item, "taskCategory");
export const mapFrequencyFormValues = (item) =>
  mapSimpleFormValues(item, "frequency");
export const mapContractTypeFormValues = (item) =>
  mapSimpleFormValues(item, "contractType");

export const getDepartments = async () => request("/configure/departments");
export const getDepartmentById = async (id) =>
  request(`/configure/departments/${id}`);
export const createDepartment = async (payload) =>
  request("/configure/departments", { method: "POST", body: payload });
export const updateDepartment = async (id, payload) =>
  request(`/configure/departments/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteDepartment = async (id) =>
  request(`/configure/departments/${id}`, { method: "DELETE" });

export const getShiftTimings = async () => request("/configure/shift-timings");
export const getShiftTimingById = async (id) =>
  request(`/configure/shift-timings/${id}`);
export const createShiftTiming = async (payload) =>
  request("/configure/shift-timings", {
    method: "POST",
    body: buildShiftTimingPayload(payload),
  });
export const updateShiftTiming = async (id, payload) =>
  request(`/configure/shift-timings/${id}`, {
    method: "PUT",
    body: buildShiftTimingPayload(payload),
  });
export const deleteShiftTiming = async (id) =>
  request(`/configure/shift-timings/${id}`, { method: "DELETE" });

export const getPlantSites = async () => request("/configure/plant-sites");
export const getPlantSiteById = async (id) =>
  request(`/configure/plant-sites/${id}`);
export const createPlantSite = async (payload) =>
  request("/configure/plant-sites", { method: "POST", body: payload });
export const updatePlantSite = async (id, payload) =>
  request(`/configure/plant-sites/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deletePlantSite = async (id) =>
  request(`/configure/plant-sites/${id}`, { method: "DELETE" });

export const getStatuses = async () => request("/configure/statuses");
export const getStatusById = async (id) => request(`/configure/statuses/${id}`);
export const createStatus = async (payload) =>
  request("/configure/statuses", { method: "POST", body: payload });
export const updateStatus = async (id, payload) =>
  request(`/configure/statuses/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteStatus = async (id) =>
  request(`/configure/statuses/${id}`, { method: "DELETE" });

export const getCriticalLevels = async () =>
  request("/configure/critical-levels");
export const getCriticalLevelById = async (id) =>
  request(`/configure/critical-levels/${id}`);
export const createCriticalLevel = async (payload) =>
  request("/configure/critical-levels", { method: "POST", body: payload });
export const updateCriticalLevel = async (id, payload) =>
  request(`/configure/critical-levels/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteCriticalLevel = async (id) =>
  request(`/configure/critical-levels/${id}`, { method: "DELETE" });

export const getUnitsOfMeasure = async () =>
  request("/configure/units-of-measure");
export const getUnitOfMeasureById = async (id) =>
  request(`/configure/units-of-measure/${id}`);
export const createUnitOfMeasure = async (payload) =>
  request("/configure/units-of-measure", { method: "POST", body: payload });
export const updateUnitOfMeasure = async (id, payload) =>
  request(`/configure/units-of-measure/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteUnitOfMeasure = async (id) =>
  request(`/configure/units-of-measure/${id}`, { method: "DELETE" });

export const getTaskCategories = async () =>
  request("/configure/task-categories");
export const getTaskCategoryById = async (id) =>
  request(`/configure/task-categories/${id}`);
export const createTaskCategory = async (payload) =>
  request("/configure/task-categories", { method: "POST", body: payload });
export const updateTaskCategory = async (id, payload) =>
  request(`/configure/task-categories/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteTaskCategory = async (id) =>
  request(`/configure/task-categories/${id}`, { method: "DELETE" });

export const getFrequencies = async () => request("/configure/frequencies");
export const getFrequencyById = async (id) =>
  request(`/configure/frequencies/${id}`);
export const createFrequency = async (payload) =>
  request("/configure/frequencies", { method: "POST", body: payload });
export const updateFrequency = async (id, payload) =>
  request(`/configure/frequencies/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteFrequency = async (id) =>
  request(`/configure/frequencies/${id}`, { method: "DELETE" });

export const getContractTypes = async () =>
  request("/configure/contract-types");
export const getContractTypeById = async (id) =>
  request(`/configure/contract-types/${id}`);
export const createContractType = async (payload) =>
  request("/configure/contract-types", { method: "POST", body: payload });
export const updateContractType = async (id, payload) =>
  request(`/configure/contract-types/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteContractType = async (id) =>
  request(`/configure/contract-types/${id}`, { method: "DELETE" });
