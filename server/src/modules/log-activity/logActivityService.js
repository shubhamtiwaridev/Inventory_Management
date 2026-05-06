import LogActivity from "./logActivityModel.js";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const RESOURCE_LABELS = {
  users: "User",
  "staff-page": "Staff User",
  "staff-types": "Staff Type",
  cards: "Card",
  assets: "Asset",
  spares: "Spare",
  tasks: "Task",
  "user-allocations": "User Allocation",
  vendors: "Vendor",
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
};

const AUTH_ACTIONS = {
  login: "Logged in",
  logout: "Logged out",
  register: "Registered account",
  "change-password": "Changed password",
  "forgot-password-notification": "Requested password change",
};

const SPECIAL_ACTIONS = {
  verify: "Verified Staff User",
  "clear-password-request": "Cleared Password Request",
  permissions: "Updated User Permissions",
  activate: "Activated Card",
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

  const moduleSegments = businessSegments.filter(
    (segment) => !OBJECT_ID_PATTERN.test(segment) && !SPECIAL_ACTIONS[segment],
  );

  if (moduleSegments.length === 0) return "System";

  return moduleSegments
    .map((segment) => RESOURCE_LABELS[segment] || titleCase(segment))
    .join(" / ");
};

const getAction = ({ method, endpoint }) => {
  const businessSegments = getBusinessSegments(endpoint);

  const authAction =
    businessSegments[0] === "auth" ? AUTH_ACTIONS[businessSegments[1]] : "";

  if (authAction) return authAction;

  const specialSegment = businessSegments.find(
    (segment) => SPECIAL_ACTIONS[segment],
  );

  if (specialSegment) return SPECIAL_ACTIONS[specialSegment];

  const resource = singularize(getResourceSegment(businessSegments));

  return `${METHOD_ACTIONS[method] || "Updated"} ${resource}`;
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

const getRoleValue = (user = {}) => {
  if (Array.isArray(user.roles)) return user.roles.join(", ");
  return user.roles || user.role || "";
};

const getActor = ({ req, responseBody }) => {
  const responseUser = responseBody?.user || responseBody?.data?.user || null;
  const requestUser = req.user || null;
  const user = requestUser || responseUser || {};
  const bodyEmail = req.body?.email
    ? String(req.body.email).trim().toLowerCase()
    : "";

  return {
    userId: user?._id || user?.id || null,
    userName:
      user?.name || user?.userName || user?.username || bodyEmail || "Guest",
    userEmail: user?.email || bodyEmail || "",
    role: getRoleValue(user),
  };
};

export const shouldLogActivity = (req, res) => {
  const method = String(req.method || "").toUpperCase();
  const endpoint = req.originalUrl || req.url || "";

  if (!endpoint.startsWith("/api")) return false;
  if (!MUTATION_METHODS.has(method)) return false;
  if (endpoint.startsWith("/api/log-activity")) return false;
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
  const responseData = responseBody?.data || responseBody?.user || null;
  const targetName = getDisplayName(responseData, req.body);

  return LogActivity.create({
    ...actor,
    action: getAction({ method, endpoint }),
    module: getModuleName(businessSegments),
    resource: singularize(getResourceSegment(businessSegments)),
    resourceId: getResourceId({ req, responseBody }),
    method,
    endpoint,
    statusCode: res.statusCode || 0,
    ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
    userAgent: req.get("user-agent") || "",
    details: {
      message: responseBody?.message || "",
      targetName,
    },
  });
};

export const createManualLogActivity = async (payload = {}) =>
  LogActivity.create(payload);
