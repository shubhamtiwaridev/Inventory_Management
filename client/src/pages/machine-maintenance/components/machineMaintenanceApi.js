import { API_BASE_URL, SERVER_BASE_URL } from "../../../api/config";
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

const isFormDataPayload = (value) =>
  typeof FormData !== "undefined" && value instanceof FormData;

const clearGetCache = () => {
  for (const key of responseCache.keys()) {
    if (key.startsWith("GET:")) {
      responseCache.delete(key);
    }
  }
};

const request = async (url, options = {}) => {
  const { body, headers = {}, ...rest } = options;
  const useFormData = isFormDataPayload(body);
  const method = String(rest.method || "GET").toUpperCase();
  const shouldUseCache = method === "GET" && !useFormData;
  const cacheKey = `${method}:${url}`;

  if (shouldUseCache) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    headers: useFormData
      ? getAuthHeaders(headers)
      : getAuthHeaders({
          "Content-Type": "application/json",
          ...headers,
        }),
    body: useFormData ? body : body ? JSON.stringify(body) : undefined,
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

const formatDateValue = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().split("T")[0];
};

const formatDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  return value;
};

const normalizeFilePath = (value) => {
  if (!value) return "";

  let normalized = String(value).replace(/\\/g, "/");

  if (normalized.startsWith("/app/uploads/")) {
    normalized = normalized.replace("/app/uploads/", "/uploads/");
  } else if (normalized.startsWith("app/uploads/")) {
    normalized = normalized.replace("app/uploads/", "/uploads/");
  } else if (normalized.startsWith("uploads/")) {
    normalized = `/${normalized}`;
  }

  return normalized;
};

const getFileExtension = (value) => {
  const normalized = normalizeFilePath(value);
  const fileName = normalized.split("/").pop() || "";
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "";
  return String(extension || "").toLowerCase();
};

const buildFileUrl = (value) => {
  const normalized = normalizeFilePath(value);
  if (!normalized) return "";

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const cleanedPath = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;
  return `${SERVER_BASE_URL}${cleanedPath}`;
};

const buildAssetFileDisplayName = (fieldName, storedValue) => {
  const extension = getFileExtension(storedValue);
  if (!extension) return "-";

  if (fieldName === "operatingManual") {
    return `manual.${extension}`;
  }

  if (fieldName === "machineImage") {
    return `machine.${extension}`;
  }

  return `file.${extension}`;
};

const buildAssetFileValue = (fieldName, storedValue) => {
  if (!storedValue) return "-";

  const extension = getFileExtension(storedValue);
  const url = buildFileUrl(storedValue);

  if (!extension || !url) return "-";

  const isPdf = extension === "pdf";
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(extension);

  return {
    kind: "file",
    fieldName,
    displayName: buildAssetFileDisplayName(fieldName, storedValue),
    url,
    extension,
    fileType: isPdf ? "pdf" : isImage ? "image" : "file",
    previewUrl: isImage ? url : "",
    searchableText: buildAssetFileDisplayName(fieldName, storedValue),
  };
};

export const mapAssetListRow = (item) => ({
  id: item._id,
  assetCode: formatValue(item.assetCode),
  assetName: formatValue(item.assetName),
  category: formatValue(item.category),
  plant: formatValue(item.plant),
  department: formatValue(item.department),
  manufacturer: formatValue(item.manufacturer),
  modelNumber: formatValue(item.modelNumber),
  serialNumber: formatValue(item.serialNumber),
  commissioningDate: formatDateValue(item.commissioningDate),
  purchaseDate: formatDateValue(item.purchaseDate),
  warrantyStart: formatDateValue(item.warrantyStart),
  warrantyEnd: formatDateValue(item.warrantyEnd),
  criticality: formatValue(item.criticality),
  status: formatValue(item.status),
  powerRating: formatValue(item.powerRating),
  technicalSpecifications: formatValue(item.technicalSpecifications),
  operatingManual: buildAssetFileValue("operatingManual", item.operatingManual),
  machineImage: buildAssetFileValue("machineImage", item.machineImage),
  qrCode: formatValue(item.qrCode),
});

export const mapSpareListRow = (item) => ({
  id: item._id,
  spareCode: formatValue(item.spareCode),
  spareName: formatValue(item.spareName),
  description: formatValue(item.description),
  linkedMachine: formatValue(item.linkedMachine),
  partCategory: formatValue(item.partCategory),
  vendor: formatValue(item.vendor),
  partNo: formatValue(item.partNo),
  unit: formatValue(item.unit),
  reorderLevel: formatValue(item.reorderLevel),
  minQty: formatValue(item.minQty),
  maxQty: formatValue(item.maxQty),
  currentStock: formatValue(item.currentStock),
  leadTime: formatValue(item.leadTime),
  costPerUnit: formatValue(item.costPerUnit),
  alternatePart: formatValue(item.alternatePart),
  shelfLocation: formatValue(item.shelfLocation),
  batchNo: formatValue(item.batchNo),
  status: formatValue(item.status),
});

export const mapTaskListRow = (item) => ({
  id: item._id,
  taskCode: formatValue(item.taskCode),
  taskName: formatValue(item.taskName),
  taskCategory: formatValue(item.taskCategory),
  applicableMachine: formatValue(item.applicableMachine),
  frequency: formatValue(item.frequency),
  assignedUser: formatValue(item.assignedUser),
  shift: formatValue(item.shift),
  startDate: formatDateValue(item.startDate),
  endDate: formatDateValue(item.endDate),
  estimatedDuration: formatValue(item.estimatedDuration),
  requiredManpower: formatValue(item.requiredManpower),
  requiredTools: formatValue(item.requiredTools),
  requiredSpareParts: formatValue(item.requiredSpareParts),
  checklistSteps: formatValue(item.checklistSteps),
  instructions: formatValue(item.instructions),
  safetyPrecautions: formatValue(item.safetyPrecautions),
  skillRequirement: formatValue(item.skillRequirement),
  escalationLevel: formatValue(item.escalationLevel),
  status: formatValue(item.status),
});

export const mapUserAllocationListRow = (item) => ({
  id: item._id,
  employeeId: formatValue(item.employeeId),
  userName: formatValue(item.userName),
  role: formatValue(item.role),
  department: formatValue(item.department),
  skillSet: formatValue(item.skillSet),
  shift: formatValue(item.shift),
  mobileNumber: formatValue(item.mobileNumber),
  email: formatValue(item.email),
  supervisor: formatValue(item.supervisor),
  machine: formatValue(item.machine),
  task: formatValue(item.task),
  accessRights: formatValue(item.accessRights),
  status: formatValue(item.status),
});

export const mapVendorListRow = (item) => ({
  id: item._id,
  vendorCode: formatValue(item.vendorCode),
  vendorName: formatValue(item.vendorName),
  contactPerson: formatValue(item.contactPerson),
  phone: formatValue(item.phone),
  email: formatValue(item.email),
  city: formatValue(item.city),
  contractType: formatValue(item.contractType),
  sla: formatValue(item.sla),
  machinesCovered: formatValue(item.machinesCovered),
  contractValidityFrom: formatDateValue(item.contractValidityFrom),
  contractValidityTo: formatDateValue(item.contractValidityTo),
  escalationContacts: formatValue(item.escalationContacts),
  status: formatValue(item.status),
});

export const mapAssetFormValues = (item) => ({
  assetCode: item.assetCode || "",
  assetName: item.assetName || "",
  category: item.category || "",
  plant: item.plant || "",
  department: item.department || "",
  manufacturer: item.manufacturer || "",
  modelNumber: item.modelNumber || "",
  serialNumber: item.serialNumber || "",
  commissioningDate: formatDateInputValue(item.commissioningDate),
  purchaseDate: formatDateInputValue(item.purchaseDate),
  warrantyStart: formatDateInputValue(item.warrantyStart),
  warrantyEnd: formatDateInputValue(item.warrantyEnd),
  criticality: item.criticality || "",
  status: item.status || "Running",
  powerRating: item.powerRating || "",
  technicalSpecifications: item.technicalSpecifications || "",
  operatingManual: null,
  machineImage: null,
  qrCode: item.qrCode || "",
});

export const mapSpareFormValues = (item) => ({
  spareCode: item.spareCode || "",
  spareName: item.spareName || "",
  description: item.description || "",
  linkedMachine: item.linkedMachine || "",
  partCategory: item.partCategory || "",
  vendor: item.vendor || "",
  partNo: item.partNo || "",
  unit: item.unit || "",
  reorderLevel: item.reorderLevel ?? "",
  minQty: item.minQty ?? "",
  maxQty: item.maxQty ?? "",
  currentStock: item.currentStock ?? "",
  leadTime: item.leadTime ?? "",
  costPerUnit: item.costPerUnit ?? "",
  alternatePart: item.alternatePart || "",
  shelfLocation: item.shelfLocation || "",
  batchNo: item.batchNo || "",
  status: item.status || "Active",
});

export const mapTaskFormValues = (item) => ({
  taskCode: item.taskCode || "",
  taskName: item.taskName || "",
  taskCategory: item.taskCategory || "",
  applicableMachine: item.applicableMachine || "",
  frequency: item.frequency || "",
  assignedUser: item.assignedUser || "",
  shift: item.shift || "",
  startDate: formatDateInputValue(item.startDate),
  endDate: formatDateInputValue(item.endDate),
  estimatedDuration: item.estimatedDuration || "",
  requiredManpower: item.requiredManpower || "",
  requiredTools: item.requiredTools || "",
  requiredSpareParts: item.requiredSpareParts || "",
  checklistSteps: item.checklistSteps || "",
  instructions: item.instructions || "",
  safetyPrecautions: item.safetyPrecautions || "",
  skillRequirement: item.skillRequirement || "",
  escalationLevel: item.escalationLevel || "",
  status: item.status || "Active",
});

export const mapUserAllocationFormValues = (item) => ({
  employeeId: item.employeeId || "",
  userName: item.userName || "",
  role: item.role || "",
  department: item.department || "",
  skillSet: item.skillSet || "",
  shift: item.shift || "",
  mobileNumber: item.mobileNumber || "",
  email: item.email || "",
  supervisor: item.supervisor || "",
  machine: item.machine || "",
  task: item.task || "",
  accessRights: item.accessRights || "",
  status: item.status || "Active",
});

export const mapVendorFormValues = (item) => ({
  vendorCode: item.vendorCode || "",
  vendorName: item.vendorName || "",
  contactPerson: item.contactPerson || "",
  phone: item.phone || "",
  email: item.email || "",
  city: item.city || "",
  contractType: item.contractType || "",
  sla: item.sla || "",
  machinesCovered: item.machinesCovered || "",
  contractValidityFrom: formatDateInputValue(item.contractValidityFrom),
  contractValidityTo: formatDateInputValue(item.contractValidityTo),
  escalationContacts: item.escalationContacts || "",
  status: item.status || "Active",
});

const getResponseList = (response) =>
  Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

const toOption = (value) => {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return null;

  return {
    label: cleanValue,
    value: cleanValue,
  };
};

const uniqueOptions = (options = []) => {
  const optionMap = new Map();

  options.forEach((option) => {
    if (!option?.value) return;
    optionMap.set(option.value, option);
  });

  return Array.from(optionMap.values());
};

const getSimpleOptionFromItem = (fieldName) => (item) =>
  toOption(item?.[fieldName] || item?.name || item?.label || item?.value || "");

const getDepartmentOptionFromItem = getSimpleOptionFromItem("department");

const getPlantSiteOptionFromItem = (item) =>
  toOption(
    item?.plantSite ||
      item?.plant ||
      item?.site ||
      item?.name ||
      item?.label ||
      item?.value ||
      "",
  );

const getShiftTimingOptionFromItem = (item) => {
  const fromTime = String(
    item?.fromTime ||
      item?.shiftFrom ||
      item?.from ||
      item?.startTime ||
      item?.start ||
      "",
  ).trim();

  const toTime = String(
    item?.toTime ||
      item?.shiftTo ||
      item?.to ||
      item?.endTime ||
      item?.end ||
      "",
  ).trim();

  const combinedShift = String(
    item?.shiftTiming ||
      item?.shift ||
      item?.name ||
      item?.label ||
      item?.value ||
      "",
  ).trim();

  if (combinedShift) {
    return toOption(combinedShift);
  }

  if (fromTime && toTime) {
    return toOption(`${fromTime} - ${toTime}`);
  }

  return toOption(fromTime || toTime || "");
};

const getConfiguredOptions = async (url, mapOption) => {
  const response = await request(url);
  const records = getResponseList(response);

  return uniqueOptions(records.map(mapOption).filter(Boolean));
};

const firstNonEmpty = (...values) => {
  for (const value of values) {
    const cleanValue = String(value ?? "").trim();
    if (cleanValue) return cleanValue;
  }
  return "";
};

const getStaffResponseList = (response) => {
  if (Array.isArray(response?.users)) return response.users;
  if (Array.isArray(response?.data?.users)) return response.data.users;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.rows)) return response.rows;
  if (Array.isArray(response?.staffs)) return response.staffs;
  if (Array.isArray(response?.staffList)) return response.staffList;
  if (Array.isArray(response?.employees)) return response.employees;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response)) return response;
  return [];
};

const getStaffOptionFromItem = (item) => {
  const name = firstNonEmpty(
    item?.name,
    item?.userName,
    item?.staffName,
    item?.fullName,
    item?.employeeName,
  );

  if (!name) return null;

  return {
    label: name,
    value: name,
    data: {
      employeeId: firstNonEmpty(
        item?.employeeId,
        item?.employeeCode,
        item?.staffId,
        item?.empId,
        item?.code,
        item?._id,
      ),
      role: firstNonEmpty(
        item?.role,
        item?.roles,
        item?.roleName,
        item?.staffType,
        item?.designation,
      ),
      email: firstNonEmpty(item?.email, item?.emailAddress, item?.mail),
    },
  };
};

const getStaffDirectory = async () => {
  const response = await request("/staff-page");
  return getStaffResponseList(response);
};

export const getConfiguredDepartments = async () =>
  getConfiguredOptions("/configure/departments", getDepartmentOptionFromItem);

export const getConfiguredPlantSites = async () =>
  getConfiguredOptions("/configure/plant-sites", getPlantSiteOptionFromItem);

export const getConfiguredShiftTimings = async () =>
  getConfiguredOptions(
    "/configure/shift-timings",
    getShiftTimingOptionFromItem,
  );

export const getConfiguredStatuses = async () =>
  getConfiguredOptions(
    "/configure/statuses",
    getSimpleOptionFromItem("status"),
  );

export const getConfiguredCriticalLevels = async () =>
  getConfiguredOptions(
    "/configure/critical-levels",
    getSimpleOptionFromItem("criticalLevel"),
  );

export const getConfiguredUnitsOfMeasure = async () =>
  getConfiguredOptions(
    "/configure/units-of-measure",
    getSimpleOptionFromItem("unitOfMeasure"),
  );

export const getConfiguredTaskCategories = async () =>
  getConfiguredOptions(
    "/configure/task-categories",
    getSimpleOptionFromItem("taskCategory"),
  );

export const getConfiguredFrequencies = async () =>
  getConfiguredOptions(
    "/configure/frequencies",
    getSimpleOptionFromItem("frequency"),
  );

export const getConfiguredContractTypes = async () =>
  getConfiguredOptions(
    "/configure/contract-types",
    getSimpleOptionFromItem("contractType"),
  );

export const getStaffMemberOptions = async () => {
  const records = await getStaffDirectory();
  return uniqueOptions(records.map(getStaffOptionFromItem).filter(Boolean));
};

export const getAssets = async () => request("/machine-maintenance/assets");

export const getRegisteredMachineOptions = async () => {
  const response = await getAssets();

  const machineNames = Array.from(
    new Set(
      (response?.data || [])
        .map((item) => String(item?.assetName || "").trim())
        .filter(Boolean),
    ),
  );

  return machineNames.map((name) => ({
    label: name,
    value: name,
  }));
};

export const getAssetById = async (id) =>
  request(`/machine-maintenance/assets/${id}`);
export const createAsset = async (payload) =>
  request("/machine-maintenance/assets", { method: "POST", body: payload });
export const updateAsset = async (id, payload) =>
  request(`/machine-maintenance/assets/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteAsset = async (id) =>
  request(`/machine-maintenance/assets/${id}`, { method: "DELETE" });

export const getSpares = async () => request("/machine-maintenance/spares");
export const getSpareById = async (id) =>
  request(`/machine-maintenance/spares/${id}`);
export const createSpare = async (payload) =>
  request("/machine-maintenance/spares", { method: "POST", body: payload });
export const updateSpare = async (id, payload) =>
  request(`/machine-maintenance/spares/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteSpare = async (id) =>
  request(`/machine-maintenance/spares/${id}`, { method: "DELETE" });

export const getTasks = async () => request("/machine-maintenance/tasks");
export const getTaskById = async (id) =>
  request(`/machine-maintenance/tasks/${id}`);
export const createTask = async (payload) =>
  request("/machine-maintenance/tasks", { method: "POST", body: payload });
export const updateTask = async (id, payload) =>
  request(`/machine-maintenance/tasks/${id}`, { method: "PUT", body: payload });
export const deleteTask = async (id) =>
  request(`/machine-maintenance/tasks/${id}`, { method: "DELETE" });

export const getUserAllocations = async () =>
  request("/machine-maintenance/user-allocations");
export const getUserAllocationById = async (id) =>
  request(`/machine-maintenance/user-allocations/${id}`);
export const createUserAllocation = async (payload) =>
  request("/machine-maintenance/user-allocations", {
    method: "POST",
    body: payload,
  });
export const updateUserAllocation = async (id, payload) =>
  request(`/machine-maintenance/user-allocations/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteUserAllocation = async (id) =>
  request(`/machine-maintenance/user-allocations/${id}`, {
    method: "DELETE",
  });

export const getVendors = async () => request("/machine-maintenance/vendors");
export const getVendorById = async (id) =>
  request(`/machine-maintenance/vendors/${id}`);
export const createVendor = async (payload) =>
  request("/machine-maintenance/vendors", { method: "POST", body: payload });
export const updateVendor = async (id, payload) =>
  request(`/machine-maintenance/vendors/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteVendor = async (id) =>
  request(`/machine-maintenance/vendors/${id}`, { method: "DELETE" });
