import LogActivity from "./logActivityModel.js";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const RESOURCE_LABELS = {
  users: "User",
  "staff-page": "Staff User",
  "staff-types": "Staff Type",
  cards: "Card",
  login: "Login",
  logout: "Logout",
  register: "Register",
  "change-password": "Password",
  "forgot-password-notification": "Forgot Password",
  assets: "Asset",
  spares: "Spare",
  tasks: "Task",
  "user-allocations": "User Allocation",
  vendors: "Vendor",
  complients: "Complaint",
  departments: "Department",
  "shift-timings": "Shift Timing",
  "plant-sites": "Plant Site",
  statuses: "Status",
  "critical-levels": "Critical Level",
  "units-of-measure": "Unit Of Measure",
  "task-categories": "Task Category",
  frequencies: "Frequency",
  "contract-types": "Contract Type",
  "log-activity": "Log Activity",
  "log-activities": "Log Activity",
  inventory: "Inventory",
  "goods-list": "Goods List",
  "upload-center": "Upload Center",
  "download-center": "Download Center",
  warehouses: "Warehouse",
  inbound: "Inbound",
  outbound: "Outbound",
  "import-excel": "Import Excel",
};

const AUTH_ACTIONS = {
  login: "Logged In",
  logout: "Logged Out",
  register: "Registered From Public",
  "change-password": "Changed Password",
  "forgot-password-notification": "Forgot Password Request",
};

const AUTH_PAGE_LABELS = {
  login: "Login",
  logout: "Logout",
  register: "Public Register",
  "change-password": "Change Password",
  "forgot-password-notification": "Forget Password",
};

const SPECIAL_ACTIONS = {
  verify: "Verified Registered Account",
  "clear-password-request": "Cleared Password Request",
  permissions: "Updated User Permissions",
  activate: "Activated Card",
  "import-excel": "Imported Excel",
};

const METHOD_ACTIONS = {
  POST: "Created",
  PUT: "Updated",
  PATCH: "Updated",
  DELETE: "Deleted",
};

const titleCase = (value = "") =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const singularize = (value = "") => {
  const cleanValue = String(value || "").trim();

  if (RESOURCE_LABELS[cleanValue]) return RESOURCE_LABELS[cleanValue];
  if (cleanValue.endsWith("ies"))
    return titleCase(`${cleanValue.slice(0, -3)}y`);
  if (cleanValue.endsWith("ses")) return titleCase(cleanValue.slice(0, -2));
  if (cleanValue.endsWith("s")) return titleCase(cleanValue.slice(0, -1));

  return titleCase(cleanValue);
};

const getPathSegments = (path = "") =>
  String(path || "")
    .split("?")[0]
    .split("/")
    .filter(Boolean);

const removeApiPrefix = (segments = []) =>
  segments[0] === "api" ? segments.slice(1) : segments;

const getBusinessSegments = (endpoint = "") =>
  removeApiPrefix(getPathSegments(endpoint)).filter(
    (segment) => !OBJECT_ID_PATTERN.test(segment),
  );

const getResourceSegment = (businessSegments = []) => {
  if (
    businessSegments[0] === "inventory" &&
    businessSegments[1] === "upload-center"
  ) {
    return "file";
  }

  const ignored = new Set(["api", "auth", "machine-maintenance", "configure"]);

  for (let index = businessSegments.length - 1; index >= 0; index -= 1) {
    const segment = businessSegments[index];

    if (!ignored.has(segment) && !SPECIAL_ACTIONS[segment]) {
      return segment;
    }
  }

  return businessSegments[businessSegments.length - 1] || "activity";
};

const getModuleName = (businessSegments = []) => {
  if (businessSegments[0] === "auth") return "Authentication";
  if (businessSegments[0] === "staff-page") return "Staff";
  if (businessSegments[0] === "staff-types") return "Staff";
  if (businessSegments[0] === "machine-maintenance")
    return "Machine Maintenance";
  if (businessSegments[0] === "inventory") return "Inventory";

  const moduleSegments = businessSegments.filter(
    (segment) => !OBJECT_ID_PATTERN.test(segment) && !SPECIAL_ACTIONS[segment],
  );

  if (moduleSegments.length === 0) return "System";

  return moduleSegments
    .map((segment) => RESOURCE_LABELS[segment] || titleCase(segment))
    .join(" / ");
};

const getPageName = ({ businessSegments = [], req, responseBody }) => {
  if (businessSegments[0] === "auth") {
    return AUTH_PAGE_LABELS[businessSegments[1]] || "Authentication";
  }

  if (businessSegments[0] === "staff-page") {
    if (businessSegments.includes("verify")) return "Verify Register Account";

    if (String(req.method || "").toUpperCase() === "POST") {
      return "Internal Register";
    }

    return "Staff";
  }

  if (businessSegments[0] === "staff-types") return "Staff Type";

  if (businessSegments[0] === "machine-maintenance") {
    const feature = businessSegments[1] || "";

    if (feature === "assets") return "Machine Registration";
    if (feature === "spares") return "Spare Registration";
    if (feature === "tasks") return "Task Schedule";
    if (feature === "user-allocations") return "User Allocation";
    if (feature === "vendors") return "Vendor Registration";

    if (feature === "complients") {
      const section = String(
        responseBody?.data?.section ||
          req.body?.section ||
          req.query?.section ||
          "",
      )
        .trim()
        .toLowerCase();

      if (section === "assets") return "Assets Complaint";
      if (section === "spare") return "Spare Complaint";
      if (section === "task-master") return "Task Master Complaint";
      if (section === "vendor-supplier") return "Vendor/Supplier Complaint";

      return "Complaint";
    }
  }

  if (businessSegments[0] === "configure") {
    return singularize(businessSegments[1] || "Configure");
  }

  if (businessSegments[0] === "inventory") {
    if (businessSegments[1] === "goods-list") return "Goods List";
    if (businessSegments[1] === "upload-center") return "Upload Center";
    if (businessSegments[1] === "download-center") return "Download Center";
    if (businessSegments[1] === "warehouses") return "Warehouses";
    if (businessSegments[1] === "inbound") return "Inbound";
    if (businessSegments[1] === "outbound") return "Outbound";
  }

  return getModuleName(businessSegments);
};

const getAction = ({ method, endpoint }) => {
  const businessSegments = getBusinessSegments(endpoint);

  const authAction =
    businessSegments[0] === "auth" ? AUTH_ACTIONS[businessSegments[1]] : "";

  if (authAction) return authAction;

  if (businessSegments[0] === "staff-page" && method === "POST") {
    return "Registered From Internal";
  }

  const specialSegment = businessSegments.find(
    (segment) => SPECIAL_ACTIONS[segment],
  );

  if (specialSegment) return SPECIAL_ACTIONS[specialSegment];

  return METHOD_ACTIONS[method] || "Updated";
};

const getResourceId = ({ req, responseBody }) => {
  const responseData = responseBody?.data || responseBody?.user || null;

  if (responseData?._id) return String(responseData._id);
  if (responseData?.id) return String(responseData.id);
  if (req.params?.id) return String(req.params.id);

  const segments = getPathSegments(req.originalUrl || req.url || "");
  const objectIdSegment = segments.find((segment) =>
    OBJECT_ID_PATTERN.test(segment),
  );

  return objectIdSegment || "";
};

const getDisplayName = (...records) => {
  const fields = [
    "name",
    "title",
    "email",
    "originalName",
    "storedName",
    "entryNo",
    "goodsDesc",
    "goodsCode",
    "goodsSku",
    "goodsBarcode",
    "warehouseName",
    "warehouseCode",
    "assetName",
    "assetCode",
    "spareName",
    "spareCode",
    "taskName",
    "taskCode",
    "userName",
    "employeeId",
    "vendorName",
    "vendorCode",
    "complaintTitle",
    "complaintCode",
    "department",
    "plantSite",
    "shiftTiming",
    "status",
    "criticalLevel",
    "unitOfMeasure",
    "taskCategory",
    "frequency",
    "contractType",
  ];

  for (const record of records) {
    if (!record || typeof record !== "object") continue;

    for (const field of fields) {
      const value = record[field];

      if (value !== undefined && value !== null && String(value).trim()) {
        return String(value).trim();
      }
    }
  }

  return "";
};

const getUploadFileNames = (req) =>
  (Array.isArray(req?.files) ? req.files : [])
    .map((file) => String(file?.originalname || file?.filename || "").trim())
    .filter(Boolean);

const getUploadTargetName = (req) => {
  const fileNames = getUploadFileNames(req);

  if (fileNames.length === 0) return "";
  if (fileNames.length === 1) return fileNames[0];

  return `${fileNames[0]} +${fileNames.length - 1} more`;
};

const getInventoryRequestTargetName = ({ req, businessSegments = [] }) => {
  if (
    businessSegments[0] === "inventory" &&
    businessSegments[1] === "goods-list" &&
    businessSegments.includes("import-excel")
  ) {
    return String(req?.file?.originalname || req?.file?.filename || "").trim();
  }

  if (
    businessSegments[0] === "inventory" &&
    businessSegments[1] === "upload-center"
  ) {
    return getUploadTargetName(req);
  }

  return "";
};

const getAssignedCardNames = (...records) => {
  for (const record of records) {
    const assignedCards = record?.assignedCards;

    if (!Array.isArray(assignedCards) || assignedCards.length === 0) {
      continue;
    }

    const names = assignedCards
      .map((card) => {
        if (!card) return "";
        if (typeof card === "string") return card.trim();
        return String(card.title || card.name || card.label || "").trim();
      })
      .filter(Boolean);

    if (names.length > 0) {
      return names;
    }
  }

  return [];
};

const getRoleValue = (user = {}) => {
  if (Array.isArray(user.roles)) return user.roles.join(", ");
  return user.roles || user.role || "";
};

const buildActorPayload = (user = {}, fallback = {}) => ({
  userId: user?._id || user?.id || fallback.userId || null,
  userName:
    user?.name ||
    user?.userName ||
    user?.username ||
    fallback.userName ||
    "Guest",
  userEmail:
    user?.email ||
    (fallback.userEmail ? String(fallback.userEmail).trim().toLowerCase() : ""),
  role: getRoleValue(user) || fallback.role || "",
});

const getActor = ({ req, responseBody }) => {
  const responseUser = responseBody?.user || responseBody?.data?.user || null;
  const requestUser = req.user || null;
  const user = requestUser || responseUser || {};
  const bodyEmail = req.body?.email
    ? String(req.body.email).trim().toLowerCase()
    : "";

  return buildActorPayload(user, {
    userEmail: bodyEmail,
    userName: bodyEmail || "Guest",
  });
};

export const shouldLogActivity = (req, res) => {
  const method = String(req.method || "").toUpperCase();
  const endpoint = req.originalUrl || req.url || "";

  if (!endpoint.startsWith("/api")) return false;
  if (!MUTATION_METHODS.has(method)) return false;
  if (endpoint.startsWith("/api/log-activity")) return false;
  if (endpoint.startsWith("/api/log-activities")) return false;
  if (endpoint.startsWith("/api/auth/logout")) return false;
  if (res.statusCode >= 400) return false;

  return true;
};

export const createLogActivityFromRequest = async ({
  req,
  res,
  responseBody,
}) => {
  if (!shouldLogActivity(req, res)) return null;

  const method = String(req.method || "").toUpperCase();
  const endpoint = req.originalUrl || req.url || "";
  const businessSegments = getBusinessSegments(endpoint);
  const actor = getActor({ req, responseBody });
  const responseData =
    responseBody?.data ||
    responseBody?.user ||
    responseBody?.permissions ||
    null;
  const targetName =
    getDisplayName(responseData, req.body) ||
    getInventoryRequestTargetName({ req, businessSegments });
  const page = getPageName({ businessSegments, req, responseBody });
  const assignedCardNames = getAssignedCardNames(
    responseData,
    responseData?.staffType,
    req.body,
  );

  return LogActivity.create({
    ...actor,
    action: getAction({ method, endpoint }),
    module: getModuleName(businessSegments),
    page,
    resource: singularize(getResourceSegment(businessSegments)),
    targetName,
    resourceId: getResourceId({ req, responseBody }),
    method,
    endpoint,
    statusCode: res.statusCode || 0,
    ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
    userAgent: req.get("user-agent") || "",
    details: {
      message: responseBody?.message || "",
      page,
      targetName,
      assignedCards: assignedCardNames,
    },
  });
};

export const createManualLogActivity = async (payload = {}) =>
  LogActivity.create(payload);

export const createRequestScopedLogActivity = async ({
  req,
  action,
  module = "",
  page = "",
  resource = "",
  targetName = "",
  resourceId = "",
  method = "",
  endpoint = "",
  statusCode = 0,
  details = {},
  user = null,
  fallbackActor = {},
}) =>
  LogActivity.create({
    ...buildActorPayload(user, fallbackActor),
    action,
    module,
    page,
    resource,
    targetName,
    resourceId,
    method,
    endpoint,
    statusCode,
    ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || "",
    userAgent: req?.get?.("user-agent") || "",
    details,
  });
