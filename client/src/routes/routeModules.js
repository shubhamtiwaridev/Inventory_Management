import { lazy } from "react";

const createPreloadableRoute = (loader) => {
  let loadedModulePromise;
  const load = () => {
    if (!loadedModulePromise) {
      loadedModulePromise = loader();
    }

    return loadedModulePromise;
  };

  const LazyComponent = lazy(load);
  LazyComponent.preload = load;

  return LazyComponent;
};

export const Register = createPreloadableRoute(
  () => import("../pages/auth/Register.jsx"),
);
export const Login = createPreloadableRoute(
  () => import("../pages/auth/Login.jsx"),
);
export const ForgetPassword = createPreloadableRoute(
  () => import("../pages/auth/ForgetPassword.jsx"),
);

export const Dashboard = createPreloadableRoute(
  () => import("../pages/mainpages/Dashboard.jsx"),
);

export const StaffPage = createPreloadableRoute(
  () => import("../pages/staffs/StaffPage.jsx"),
);
export const StaffList = createPreloadableRoute(
  () => import("../pages/staffs/StaffList.jsx"),
);
export const StaffType = createPreloadableRoute(
  () => import("../pages/staffs/StaffType.jsx"),
);

export const MachineMaintenancePage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/MachineMaintenancePage.jsx"),
);
export const SparesPage = createPreloadableRoute(
  () => import("../pages/spares/SparesPage.jsx"),
);
export const InventoryPage = createPreloadableRoute(
  () => import("../pages/inventory/InventoryPage.jsx"),
);

export const AssetListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/assets/AssetListPage.jsx"),
);
export const SpareListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/assets/SpareListPage.jsx"),
);
export const TaskListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/assets/TaskListPage.jsx"),
);
export const UserListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/assets/UserListPage.jsx"),
);
export const VendorListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/assets/VendorListPage.jsx"),
);
export const BreakdownListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/assets/BreakdownListPage.jsx"),
);
export const ConsumeEntryPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/assets/ConsumeEntryPage.jsx"),
);
export const ComplaintAssetsPage = createPreloadableRoute(
  () =>
    import("../pages/machine-maintenance/complient/ComplaintAssetsPage.jsx"),
);
export const ComplaintSparePage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/complient/ComplaintSparePage.jsx"),
);
export const ComplaintTaskMasterPage = createPreloadableRoute(
  () =>
    import("../pages/machine-maintenance/complient/ComplaintTaskMasterPage.jsx"),
);
export const ComplaintVendorPage = createPreloadableRoute(
  () =>
    import("../pages/machine-maintenance/complient/ComplaintVendorPage.jsx"),
);

export const DepartmentListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/configure/DepartmentListPage.jsx"),
);
export const ShiftTimingListPage = createPreloadableRoute(
  () =>
    import("../pages/machine-maintenance/configure/ShiftTimingListPage.jsx"),
);
export const PlantSiteListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/configure/PlantSiteListPage.jsx"),
);
export const StatusListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/configure/StatusListPage.jsx"),
);
export const CriticalLevelListPage = createPreloadableRoute(
  () =>
    import("../pages/machine-maintenance/configure/CriticalLevelListPage.jsx"),
);
export const UnitOfMeasureListPage = createPreloadableRoute(
  () =>
    import("../pages/machine-maintenance/configure/UnitOfMeasureListPage.jsx"),
);
export const TaskCategoryListPage = createPreloadableRoute(
  () =>
    import("../pages/machine-maintenance/configure/TaskCategoryListPage.jsx"),
);
export const FrequencyListPage = createPreloadableRoute(
  () => import("../pages/machine-maintenance/configure/FrequencyListPage.jsx"),
);
export const ContractTypeListPage = createPreloadableRoute(
  () =>
    import("../pages/machine-maintenance/configure/ContractTypeListPage.jsx"),
);

export const InventoryMasterListPage = createPreloadableRoute(
  () => import("../pages/inventory/components/InventoryMasterListPage.jsx"),
);
export const InventoryTransactionPage = createPreloadableRoute(
  () => import("../pages/inventory/components/InventoryTransactionPage.jsx"),
);
export const InventoryWarehousePage = createPreloadableRoute(
  () => import("../pages/inventory/components/InventoryWarehousePage.jsx"),
);
export const InventoryUploadCenterPage = createPreloadableRoute(
  () => import("../pages/inventory/components/InventoryUploadCenterPage.jsx"),
);
export const InventoryDownloadCenterPage = createPreloadableRoute(
  () => import("../pages/inventory/components/InventoryDownloadCenterPage.jsx"),
);
export const EcomPage = createPreloadableRoute(
  () => import("../pages/ecom/EcomPage.jsx"),
);
export const EcomOverviewPage = createPreloadableRoute(
  () => import("../pages/ecom/EcomProductsPage.jsx"),
);
export const EcomAmazonPage = createPreloadableRoute(
  () => import("../pages/ecom/EcomAmazonPage.jsx"),
);
export const EcomFlipkartPage = createPreloadableRoute(
  () => import("../pages/ecom/EcomFlipkartPage.jsx"),
);
export const EcomMesshoPage = createPreloadableRoute(
  () => import("../pages/ecom/EcomMesshoPage.jsx"),
);
export const LogActivityPage = createPreloadableRoute(
  () => import("../pages/log-activity/LogActivityPage.jsx"),
);

const matchesRoutePath = (pathname = "", routePath = "") =>
  pathname === routePath || pathname.startsWith(`${routePath}/`);

const routePreloadConfigs = [
  {
    match: (pathname) => pathname === "/register",
    preloaders: [Register.preload],
  },
  {
    match: (pathname) => pathname === "/login",
    preloaders: [Login.preload],
  },
  {
    match: (pathname) => pathname === "/forgot-password",
    preloaders: [ForgetPassword.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/dashboard"),
    preloaders: [Dashboard.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/staff"),
    preloaders: [StaffPage.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/staff-list"),
    preloaders: [StaffList.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/staff-type"),
    preloaders: [StaffType.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/log-activity"),
    preloaders: [LogActivityPage.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/machine-maintenance"),
    preloaders: [MachineMaintenancePage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/assets"),
    preloaders: [AssetListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/spare-master"),
    preloaders: [SpareListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/tasks"),
    preloaders: [TaskListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/user-allocation"),
    preloaders: [UserListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/vendors"),
    preloaders: [VendorListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/consume/breakdown-list"),
    preloaders: [BreakdownListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/consume/entry"),
    preloaders: [ConsumeEntryPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/complient/assets"),
    preloaders: [ComplaintAssetsPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/complient/spare"),
    preloaders: [ComplaintSparePage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/complient/task-master"),
    preloaders: [ComplaintTaskMasterPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(
        pathname,
        "/machine-maintenance/complient/vendor-supplier",
      ),
    preloaders: [ComplaintVendorPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/configure/department"),
    preloaders: [DepartmentListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/configure/shift-timing"),
    preloaders: [ShiftTimingListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/configure/plant-site"),
    preloaders: [PlantSiteListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/configure/status"),
    preloaders: [StatusListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(
        pathname,
        "/machine-maintenance/configure/critical-level",
      ),
    preloaders: [CriticalLevelListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(
        pathname,
        "/machine-maintenance/configure/unit-of-measure",
      ),
    preloaders: [UnitOfMeasureListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(
        pathname,
        "/machine-maintenance/configure/task-category",
      ),
    preloaders: [TaskCategoryListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/machine-maintenance/configure/frequency"),
    preloaders: [FrequencyListPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(
        pathname,
        "/machine-maintenance/configure/contract-type",
      ),
    preloaders: [ContractTypeListPage.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/spares"),
    preloaders: [SparesPage.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/inventory"),
    preloaders: [InventoryPage.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/inventory/inbound"),
    preloaders: [InventoryTransactionPage.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/inventory/outbound"),
    preloaders: [InventoryTransactionPage.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/inventory/goodslist"),
    preloaders: [InventoryMasterListPage.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/inventory/warehouses"),
    preloaders: [InventoryWarehousePage.preload],
  },
  {
    match: (pathname) => matchesRoutePath(pathname, "/inventory/upload-center"),
    preloaders: [InventoryUploadCenterPage.preload],
  },
  {
    match: (pathname) =>
      matchesRoutePath(pathname, "/inventory/download-center"),
    preloaders: [InventoryDownloadCenterPage.preload],
  },
];

export const preloadRouteModules = (pathname = "") => {
  const preloaders = new Set();

  routePreloadConfigs.forEach(({ match, preloaders: routePreloaders }) => {
    if (!match(pathname)) {
      return;
    }

    routePreloaders.forEach((preload) => preloaders.add(preload));
  });

  preloaders.forEach((preload) => {
    preload();
  });
};
