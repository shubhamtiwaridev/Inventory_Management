const normalizePath = (value = "") => {
  const trimmed = String(value || "").trim();

  if (!trimmed || trimmed === "/") {
    return "/";
  }

  return trimmed.replace(/\/+$/, "");
};

const titleCase = (value = "") =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const routeActivityDefinitions = [
  { path: "/dashboard", module: "Dashboard", page: "Dashboard" },
  { path: "/log-activity", module: "Log Activity", page: "Log Activity" },
  { path: "/staff", module: "Staff", page: "Staff" },
  { path: "/staff-list", module: "Staff", page: "Staff List" },
  { path: "/staff-type", module: "Staff", page: "Staff Type" },
  { path: "/spares", module: "Spares", page: "Spares Overview" },
  { path: "/spares/items", module: "Spares", page: "Spare Items" },
  { path: "/spares/storage", module: "Spares", page: "Storage" },
  { path: "/spares/issue", module: "Spares", page: "Issue Spares" },
  { path: "/spares/re-orders", module: "Spares", page: "Re Orders" },
  { path: "/spares/suppliers", module: "Spares", page: "Suppliers" },
  { path: "/inventory", module: "Inventory", page: "Inventory" },
  { path: "/inventory/inbound", module: "Inventory", page: "Inbound" },
  { path: "/inventory/outbound", module: "Inventory", page: "Outbound" },
  { path: "/inventory/goodslist/list", module: "Inventory", page: "Goods List" },
  { path: "/inventory/warehouses", module: "Inventory", page: "Warehouses" },
  { path: "/inventory/upload-center", module: "Inventory", page: "Upload Center" },
  {
    path: "/inventory/download-center",
    module: "Inventory",
    page: "Download Center",
  },
  {
    path: "/machine-maintenance/assets/list",
    module: "Machine Maintenance",
    page: "List of Assets",
  },
  {
    path: "/machine-maintenance/assets/register",
    module: "Machine Maintenance",
    page: "Machine Registration",
  },
  {
    path: "/machine-maintenance/spare-master/list",
    module: "Machine Maintenance",
    page: "List of Spares",
  },
  {
    path: "/machine-maintenance/spare-master/register",
    module: "Machine Maintenance",
    page: "Spare Registration",
  },
  {
    path: "/machine-maintenance/tasks/list",
    module: "Machine Maintenance",
    page: "List of Tasks",
  },
  {
    path: "/machine-maintenance/tasks/schedule",
    module: "Machine Maintenance",
    page: "Schedule",
  },
  {
    path: "/machine-maintenance/user-allocation/list",
    module: "Machine Maintenance",
    page: "List of Users",
  },
  {
    path: "/machine-maintenance/user-allocation/allocation",
    module: "Machine Maintenance",
    page: "Allocation",
  },
  {
    path: "/machine-maintenance/vendors/list",
    module: "Machine Maintenance",
    page: "List of Vendors",
  },
  {
    path: "/machine-maintenance/vendors/register",
    module: "Machine Maintenance",
    page: "Vendor Registration",
  },
  {
    path: "/machine-maintenance/consume/breakdown-list",
    module: "Machine Maintenance",
    page: "Breakdown List",
  },
  {
    path: "/machine-maintenance/consume/entry",
    module: "Machine Maintenance",
    page: "Consume Entry",
  },
  {
    path: "/machine-maintenance/complient/assets",
    module: "Machine Maintenance",
    page: "Assets",
  },
  {
    path: "/machine-maintenance/complient/spare",
    module: "Machine Maintenance",
    page: "Spare",
  },
  {
    path: "/machine-maintenance/complient/task-master",
    module: "Machine Maintenance",
    page: "Task Master",
  },
  {
    path: "/machine-maintenance/complient/vendor-supplier",
    module: "Machine Maintenance",
    page: "Vendor/Supplier",
  },
  {
    path: "/machine-maintenance/configure/department",
    module: "Machine Maintenance",
    page: "Department",
  },
  {
    path: "/machine-maintenance/configure/shift-timing",
    module: "Machine Maintenance",
    page: "Shift Timing",
  },
  {
    path: "/machine-maintenance/configure/plant-site",
    module: "Machine Maintenance",
    page: "Plant Site",
  },
  {
    path: "/machine-maintenance/configure/status",
    module: "Machine Maintenance",
    page: "Status",
  },
  {
    path: "/machine-maintenance/configure/critical-level",
    module: "Machine Maintenance",
    page: "Critical Level",
  },
  {
    path: "/machine-maintenance/configure/unit-of-measure",
    module: "Machine Maintenance",
    page: "Units of Measure",
  },
  {
    path: "/machine-maintenance/configure/task-category",
    module: "Machine Maintenance",
    page: "Task Category",
  },
  {
    path: "/machine-maintenance/configure/frequency",
    module: "Machine Maintenance",
    page: "Frequency",
  },
  {
    path: "/machine-maintenance/configure/contract-type",
    module: "Machine Maintenance",
    page: "Contract Type",
  },
  {
    path: "/machine-maintenance/upload-center",
    module: "Machine Maintenance",
    page: "Upload Center",
  },
  {
    path: "/machine-maintenance/download-center",
    module: "Machine Maintenance",
    page: "Download Center",
  },
];

const matchRouteActivity = (pathname = "") => {
  const normalizedPathname = normalizePath(pathname);

  return [...routeActivityDefinitions]
    .sort((left, right) => right.path.length - left.path.length)
    .find(
      (item) =>
        normalizedPathname === item.path ||
        normalizedPathname.startsWith(`${item.path}/`),
    );
};

const buildFallbackRouteActivity = (pathname = "") => {
  const normalizedPathname = normalizePath(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  if (normalizedPathname === "/") {
    return null;
  }

  const firstSegment = segments[0] || "";
  const lastSegment = segments[segments.length - 1] || firstSegment;

  if (firstSegment === "inventory") {
    return {
      module: "Inventory",
      page: titleCase(lastSegment),
    };
  }

  if (firstSegment === "machine-maintenance") {
    return {
      module: "Machine Maintenance",
      page: titleCase(lastSegment),
    };
  }

  if (firstSegment === "spares") {
    return {
      module: "Spares",
      page: titleCase(lastSegment),
    };
  }

  if (firstSegment === "log-activity") {
    return {
      module: "Log Activity",
      page: "Log Activity",
    };
  }

  return {
    module: titleCase(firstSegment),
    page: titleCase(lastSegment),
  };
};

export const getRouteActivityPayload = (locationLike = {}) => {
  const pathname = normalizePath(locationLike.pathname);
  const matchedRoute =
    matchRouteActivity(pathname) || buildFallbackRouteActivity(pathname);

  if (!matchedRoute) {
    return null;
  }

  return {
    action: "Opened",
    module: matchedRoute.module,
    page: matchedRoute.page,
    resource: "Card",
    targetName: matchedRoute.page,
    endpoint: pathname,
    details: {
      source: "route-change",
      path: pathname,
    },
  };
};
