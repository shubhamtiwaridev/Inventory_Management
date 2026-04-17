const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const isFormDataPayload = (value) =>
  typeof FormData !== "undefined" && value instanceof FormData;

const request = async (url, options = {}) => {
  const { body, headers = {}, ...rest } = options;
  const useFormData = isFormDataPayload(body);

  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    headers: useFormData
      ? headers
      : {
          "Content-Type": "application/json",
          ...headers,
        },
    body: useFormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
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

export const mapAssetListRow = (item) => ({
  id: item._id,
  assetCode: item.assetCode || "-",
  assetName: item.assetName || "-",
  category: item.category || "-",
  serialNumber: item.serialNumber || "-",
  department: item.department || "-",
  installDate: formatDateValue(item.commissioningDate || item.purchaseDate),
  status: item.status || "-",
});

export const mapSpareListRow = (item) => ({
  id: item._id,
  spareCode: item.spareCode || "-",
  spareName: item.spareName || "-",
  partNo: item.partNo || "-",
  unit: item.unit || "-",
  minQty: item.minQty ?? "-",
  maxQty: item.maxQty ?? "-",
  vendor: item.vendor || "-",
  status: item.status || "-",
});

export const mapTaskListRow = (item) => ({
  id: item._id,
  taskCode: item.taskCode || "-",
  taskName: item.taskName || "-",
  frequency: item.frequency || "-",
  assignedUser: item.assignedUser || "-",
  startDate: formatDateValue(item.startDate),
  endDate: formatDateValue(item.endDate),
  shift: item.shift || "-",
  status: item.status || "-",
});

export const mapUserAllocationListRow = (item) => ({
  id: item._id,
  employeeId: item.employeeId || "-",
  userName: item.userName || "-",
  machine: item.machine || "-",
  task: item.task || "-",
  shift: item.shift || "-",
  status: item.status || "-",
});

export const mapVendorListRow = (item) => ({
  id: item._id,
  vendorCode: item.vendorCode || "-",
  vendorName: item.vendorName || "-",
  contactPerson: item.contactPerson || "-",
  phone: item.phone || "-",
  email: item.email || "-",
  city: item.city || "-",
  contractType: item.contractType || "-",
  status: item.status || "-",
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

export const getAssets = async () => request("/machine-maintenance/assets");
export const getAssetById = async (id) => request(`/machine-maintenance/assets/${id}`);
export const createAsset = async (payload) =>
  request("/machine-maintenance/assets", { method: "POST", body: payload });
export const updateAsset = async (id, payload) =>
  request(`/machine-maintenance/assets/${id}`, { method: "PUT", body: payload });
export const deleteAsset = async (id) =>
  request(`/machine-maintenance/assets/${id}`, { method: "DELETE" });

export const getSpares = async () => request("/machine-maintenance/spares");
export const getSpareById = async (id) => request(`/machine-maintenance/spares/${id}`);
export const createSpare = async (payload) =>
  request("/machine-maintenance/spares", { method: "POST", body: payload });
export const updateSpare = async (id, payload) =>
  request(`/machine-maintenance/spares/${id}`, { method: "PUT", body: payload });
export const deleteSpare = async (id) =>
  request(`/machine-maintenance/spares/${id}`, { method: "DELETE" });

export const getTasks = async () => request("/machine-maintenance/tasks");
export const getTaskById = async (id) => request(`/machine-maintenance/tasks/${id}`);
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
  request("/machine-maintenance/user-allocations", { method: "POST", body: payload });
export const updateUserAllocation = async (id, payload) =>
  request(`/machine-maintenance/user-allocations/${id}`, {
    method: "PUT",
    body: payload,
  });
export const deleteUserAllocation = async (id) =>
  request(`/machine-maintenance/user-allocations/${id}`, { method: "DELETE" });

export const getVendors = async () => request("/machine-maintenance/vendors");
export const getVendorById = async (id) => request(`/machine-maintenance/vendors/${id}`);
export const createVendor = async (payload) =>
  request("/machine-maintenance/vendors", { method: "POST", body: payload });
export const updateVendor = async (id, payload) =>
  request(`/machine-maintenance/vendors/${id}`, { method: "PUT", body: payload });
export const deleteVendor = async (id) =>
  request(`/machine-maintenance/vendors/${id}`, { method: "DELETE" });