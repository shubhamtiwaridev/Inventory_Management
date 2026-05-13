import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { GlobalStyles } from "@mui/material";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PermissionRoute from "./routes/PermissionRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import FullPageLoader from "./components/FullPageLoader.jsx";

const Register = lazy(() => import("./pages/auth/Register.jsx"));
const Login = lazy(() => import("./pages/auth/Login.jsx"));
const ForgetPassword = lazy(() => import("./pages/auth/ForgetPassword.jsx"));

const Dashboard = lazy(() => import("./pages/mainpages/Dashboard.jsx"));

const StaffPage = lazy(() => import("./pages/staffs/StaffPage.jsx"));
const StaffList = lazy(() => import("./pages/staffs/StaffList.jsx"));
const StaffType = lazy(() => import("./pages/staffs/StaffType.jsx"));

const MachineMaintenancePage = lazy(
  () => import("./pages/machine-maintenance/MachineMaintenancePage.jsx"),
);
const SparesPage = lazy(() => import("./pages/spares/SparesPage.jsx"));
const InventoryPage = lazy(() => import("./pages/inventory/InventoryPage.jsx"));
import { inventorySidebarItems } from "./components/sidebars/inventorySidebarItems.jsx";
import { machineMaintenanceSidebarItems } from "./components/sidebars/machineMaintenanceSidebarItems.jsx";
import { sparesSidebarItems } from "./components/sidebars/sparesSidebarItems.jsx";

const AssetListPage = lazy(
  () => import("./pages/machine-maintenance/assets/AssetListPage.jsx"),
);
const SpareListPage = lazy(
  () => import("./pages/machine-maintenance/assets/SpareListPage.jsx"),
);
const TaskListPage = lazy(
  () => import("./pages/machine-maintenance/assets/TaskListPage.jsx"),
);
const UserListPage = lazy(
  () => import("./pages/machine-maintenance/assets/UserListPage.jsx"),
);
const VendorListPage = lazy(
  () => import("./pages/machine-maintenance/assets/VendorListPage.jsx"),
);
const BreakdownListPage = lazy(
  () => import("./pages/machine-maintenance/assets/BreakdownListPage.jsx"),
);
const ConsumeEntryPage = lazy(
  () => import("./pages/machine-maintenance/assets/ConsumeEntryPage.jsx"),
);
const ComplaintAssetsPage = lazy(
  () => import("./pages/machine-maintenance/complient/ComplaintAssetsPage.jsx"),
);
const ComplaintSparePage = lazy(
  () => import("./pages/machine-maintenance/complient/ComplaintSparePage.jsx"),
);
const ComplaintTaskMasterPage = lazy(
  () =>
    import("./pages/machine-maintenance/complient/ComplaintTaskMasterPage.jsx"),
);
const ComplaintVendorPage = lazy(
  () => import("./pages/machine-maintenance/complient/ComplaintVendorPage.jsx"),
);

const DepartmentListPage = lazy(
  () =>
    import("./pages/machine-maintenance/configure/DepartmentListPage.jsx"),
);
const ShiftTimingListPage = lazy(
  () =>
    import("./pages/machine-maintenance/configure/ShiftTimingListPage.jsx"),
);
const PlantSiteListPage = lazy(
  () => import("./pages/machine-maintenance/configure/PlantSiteListPage.jsx"),
);
const StatusListPage = lazy(
  () => import("./pages/machine-maintenance/configure/StatusListPage.jsx"),
);
const CriticalLevelListPage = lazy(
  () =>
    import("./pages/machine-maintenance/configure/CriticalLevelListPage.jsx"),
);
const UnitOfMeasureListPage = lazy(
  () =>
    import("./pages/machine-maintenance/configure/UnitOfMeasureListPage.jsx"),
);
const TaskCategoryListPage = lazy(
  () =>
    import("./pages/machine-maintenance/configure/TaskCategoryListPage.jsx"),
);
const FrequencyListPage = lazy(
  () => import("./pages/machine-maintenance/configure/FrequencyListPage.jsx"),
);
const ContractTypeListPage = lazy(
  () =>
    import("./pages/machine-maintenance/configure/ContractTypeListPage.jsx"),
);

const InventoryMasterListPage = lazy(
  () => import("./pages/inventory/components/InventoryMasterListPage.jsx"),
);
const InventoryTransactionPage = lazy(
  () => import("./pages/inventory/components/InventoryTransactionPage.jsx"),
);
const InventoryWarehousePage = lazy(
  () => import("./pages/inventory/components/InventoryWarehousePage.jsx"),
);
const InventoryUploadCenterPage = lazy(
  () => import("./pages/inventory/components/InventoryUploadCenterPage.jsx"),
);
const InventoryDownloadCenterPage = lazy(
  () => import("./pages/inventory/components/InventoryDownloadCenterPage.jsx"),
);
const LogActivityPage = lazy(
  () => import("./pages/log-activity/LogActivityPage.jsx"),
);

const withPermissionRoute = (
  element,
  sidebarItems,
  featurePath,
  featureLabel = "",
) => (
  <PermissionRoute
    sidebarItems={sidebarItems}
    featurePath={featurePath}
    featureLabel={featureLabel}
  >
    {element}
  </PermissionRoute>
);

function App() {
  return (
    <>
      <GlobalStyles
        styles={{
          "*::-webkit-scrollbar:vertical": {
            width: 0,
            display: "none",
          },
          "*::-webkit-scrollbar:horizontal": {
            height: 10,
            display: "block",
          },
        }}
      />
      <Suspense
        fallback={
          <FullPageLoader
            title="Loading page"
            subtitle="We are downloading only the files needed for this screen."
          />
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<PublicRoute />}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Dashboard />} />
            <Route path="/suppliers" element={<Dashboard />} />
            <Route path="/warehouses" element={<Dashboard />} />
            <Route path="/categories" element={<Dashboard />} />
            <Route path="/reports" element={<Dashboard />} />

            <Route path="/staff" element={<StaffPage />} />
            <Route path="/staff-list" element={<StaffList />} />
            <Route path="/staff-type" element={<StaffType />} />
            <Route path="/log-activity" element={<LogActivityPage />} />

            <Route
              path="/machine-maintenance"
              element={
                <PermissionRoute
                  sidebarItems={machineMaintenanceSidebarItems}
                  requireModuleAccess
                >
                  <MachineMaintenancePage />
                </PermissionRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/machine-maintenance/assets/list" replace />}
              />

          <Route
            path="assets/list"
            element={withPermissionRoute(
              <AssetListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/assets/list",
              "List of Assets",
            )}
          />
          <Route
            path="assets/register"
            element={withPermissionRoute(
              <AssetListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/assets/register",
              "Machine Registration",
            )}
          />
          <Route
            path="assets/register/:id"
            element={withPermissionRoute(
              <AssetListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/assets/register",
              "Machine Registration",
            )}
          />

          <Route
            path="spare-master/list"
            element={withPermissionRoute(
              <SpareListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/spare-master/list",
              "List of Spares",
            )}
          />
          <Route
            path="spare-master/register"
            element={withPermissionRoute(
              <SpareListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/spare-master/register",
              "Spare Registration",
            )}
          />
          <Route
            path="spare-master/register/:id"
            element={withPermissionRoute(
              <SpareListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/spare-master/register",
              "Spare Registration",
            )}
          />

          <Route
            path="tasks/list"
            element={withPermissionRoute(
              <TaskListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/tasks/list",
              "List of Tasks",
            )}
          />
          <Route
            path="tasks/schedule"
            element={withPermissionRoute(
              <TaskListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/tasks/schedule",
              "Schedule",
            )}
          />
          <Route
            path="tasks/schedule/:id"
            element={withPermissionRoute(
              <TaskListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/tasks/schedule",
              "Schedule",
            )}
          />

          <Route
            path="user-allocation/list"
            element={withPermissionRoute(
              <UserListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/user-allocation/list",
              "List of Users",
            )}
          />
          <Route
            path="user-allocation/allocation"
            element={withPermissionRoute(
              <UserListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/user-allocation/allocation",
              "Allocation",
            )}
          />
          <Route
            path="user-allocation/allocation/:id"
            element={withPermissionRoute(
              <UserListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/user-allocation/allocation",
              "Allocation",
            )}
          />

          <Route
            path="vendors/list"
            element={withPermissionRoute(
              <VendorListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/vendors/list",
              "List of Vendors",
            )}
          />
          <Route
            path="vendors/register"
            element={withPermissionRoute(
              <VendorListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/vendors/register",
              "Vendor Registration",
            )}
          />
          <Route
            path="vendors/register/:id"
            element={withPermissionRoute(
              <VendorListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/vendors/register",
              "Vendor Registration",
            )}
          />

          <Route
            path="consume/breakdown-list"
            element={withPermissionRoute(
              <BreakdownListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/consume/breakdown-list",
              "Breakdown List",
            )}
          />
          <Route
            path="consume/entry"
            element={withPermissionRoute(
              <ConsumeEntryPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/consume/entry",
              "Consume Entry",
            )}
          />
          <Route
            path="complient"
            element={
              <Navigate to="/machine-maintenance/complient/assets" replace />
            }
          />
          <Route
            path="complient/assets"
            element={withPermissionRoute(
              <ComplaintAssetsPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/complient/assets",
              "Assets",
            )}
          />
          <Route
            path="complient/spare"
            element={withPermissionRoute(
              <ComplaintSparePage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/complient/spare",
              "Spare",
            )}
          />
          <Route
            path="complient/task-master"
            element={withPermissionRoute(
              <ComplaintTaskMasterPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/complient/task-master",
              "Task Master",
            )}
          />
          <Route
            path="complient/vendor-supplier"
            element={withPermissionRoute(
              <ComplaintVendorPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/complient/vendor-supplier",
              "Vendor/Supplier",
            )}
          />

          <Route
            path="configure"
            element={
              <Navigate
                to="/machine-maintenance/configure/department"
                replace
              />
            }
          />
          <Route
            path="configure/department"
            element={withPermissionRoute(
              <DepartmentListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/configure/department",
              "Department",
            )}
          />
          <Route
            path="configure/shift-timing"
            element={withPermissionRoute(
              <ShiftTimingListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/configure/shift-timing",
              "Shift Timing",
            )}
          />
          <Route
            path="configure/plant-site"
            element={withPermissionRoute(
              <PlantSiteListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/configure/plant-site",
              "Plant Site",
            )}
          />
          <Route
            path="configure/status"
            element={withPermissionRoute(
              <StatusListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/configure/status",
              "Status",
            )}
          />
          <Route
            path="configure/critical-level"
            element={withPermissionRoute(
              <CriticalLevelListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/configure/critical-level",
              "Critical Level",
            )}
          />
          <Route
            path="configure/unit-of-measure"
            element={withPermissionRoute(
              <UnitOfMeasureListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/configure/unit-of-measure",
              "Units of Measure",
            )}
          />
          <Route
            path="configure/task-category"
            element={withPermissionRoute(
              <TaskCategoryListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/configure/task-category",
              "Task Category",
            )}
          />
          <Route
            path="configure/frequency"
            element={withPermissionRoute(
              <FrequencyListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/configure/frequency",
              "Frequency",
            )}
          />
          <Route
            path="configure/contract-type"
            element={withPermissionRoute(
              <ContractTypeListPage />,
              machineMaintenanceSidebarItems,
              "/machine-maintenance/configure/contract-type",
              "Contract Type",
            )}
          />
            </Route>

            <Route
              path="/spares"
              element={
                <PermissionRoute
                  sidebarItems={sparesSidebarItems}
                  requireModuleAccess
                >
                  <SparesPage />
                </PermissionRoute>
              }
            />

            <Route
              path="/inventory/*"
              element={
                <PermissionRoute
                  sidebarItems={inventorySidebarItems}
                  requireModuleAccess
                >
                  <InventoryPage />
                </PermissionRoute>
              }
            >
              <Route
                path="inbound"
                element={
                  <PermissionRoute
                    sidebarItems={inventorySidebarItems}
                    featurePath="/inventory/inbound"
                    featureLabel="Inbound"
                  >
                    <InventoryTransactionPage type="inbound" />
                  </PermissionRoute>
                }
              />
              <Route
                path="outbound"
                element={
                  <PermissionRoute
                    sidebarItems={inventorySidebarItems}
                    featurePath="/inventory/outbound"
                    featureLabel="Outbound"
                  >
                    <InventoryTransactionPage type="outbound" />
                  </PermissionRoute>
                }
              />
              <Route
                path="goodslist/list"
                element={
                  <PermissionRoute
                    sidebarItems={inventorySidebarItems}
                    featurePath="/inventory/goodslist/list"
                    featureLabel="Goods List"
                  >
                    <InventoryMasterListPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="warehouses"
                element={
                  <PermissionRoute
                    sidebarItems={inventorySidebarItems}
                    featurePath="/inventory/warehouses"
                    featureLabel="Warehouses"
                  >
                    <InventoryWarehousePage />
                  </PermissionRoute>
                }
              />
              <Route
                path="upload-center"
                element={
                  <PermissionRoute
                    sidebarItems={inventorySidebarItems}
                    featurePath="/inventory/upload-center"
                    featureLabel="Upload Center"
                  >
                    <InventoryUploadCenterPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="download-center"
                element={
                  <PermissionRoute
                    sidebarItems={inventorySidebarItems}
                    featurePath="/inventory/download-center"
                    featureLabel="Download Center"
                  >
                    <InventoryDownloadCenterPage />
                  </PermissionRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
