import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PermissionRoute from "./routes/PermissionRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import ForgetPassword from "./pages/auth/ForgetPassword.jsx";

import Dashboard from "./pages/mainpages/Dashboard.jsx";

import StaffPage from "./pages/staffs/StaffPage.jsx";
import StaffList from "./pages/staffs/StaffList.jsx";
import StaffType from "./pages/staffs/StaffType.jsx";

import MachineMaintenancePage from "./pages/machine-maintenance/MachineMaintenancePage.jsx";
import SparesPage from "./pages/spares/SparesPage.jsx";
import InventoryPage from "./pages/inventory/InventoryPage.jsx";
import { inventorySidebarItems } from "./components/sidebars/inventorySidebarItems.jsx";
import { machineMaintenanceSidebarItems } from "./components/sidebars/machineMaintenanceSidebarItems.jsx";
import { sparesSidebarItems } from "./components/sidebars/sparesSidebarItems.jsx";

import AssetListPage from "./pages/machine-maintenance/assets/AssetListPage.jsx";
import SpareListPage from "./pages/machine-maintenance/assets/SpareListPage.jsx";
import TaskListPage from "./pages/machine-maintenance/assets/TaskListPage.jsx";
import UserListPage from "./pages/machine-maintenance/assets/UserListPage.jsx";
import VendorListPage from "./pages/machine-maintenance/assets/VendorListPage.jsx";
import BreakdownListPage from "./pages/machine-maintenance/assets/BreakdownListPage.jsx";
import ConsumeEntryPage from "./pages/machine-maintenance/assets/ConsumeEntryPage.jsx";

import DepartmentListPage from "./pages/machine-maintenance/configure/DepartmentListPage.jsx";
import ShiftTimingListPage from "./pages/machine-maintenance/configure/ShiftTimingListPage.jsx";
import PlantSiteListPage from "./pages/machine-maintenance/configure/PlantSiteListPage.jsx";
import StatusListPage from "./pages/machine-maintenance/configure/StatusListPage.jsx";
import CriticalLevelListPage from "./pages/machine-maintenance/configure/CriticalLevelListPage.jsx";
import UnitOfMeasureListPage from "./pages/machine-maintenance/configure/UnitOfMeasureListPage.jsx";
import TaskCategoryListPage from "./pages/machine-maintenance/configure/TaskCategoryListPage.jsx";
import FrequencyListPage from "./pages/machine-maintenance/configure/FrequencyListPage.jsx";
import ContractTypeListPage from "./pages/machine-maintenance/configure/ContractTypeListPage.jsx";

import InventoryMasterListPage from "./pages/inventory/components/InventoryMasterListPage.jsx";

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
            path="goodslist/:tabKey"
            element={
              <PermissionRoute sidebarItems={inventorySidebarItems} requireModuleAccess>
                <InventoryMasterListPage />
              </PermissionRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
