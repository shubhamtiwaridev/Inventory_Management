import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import Dashboard from "./pages/mainpages/Dashboard.jsx";
import ForgetPassword from "./pages/auth/ForgetPassword.jsx";

import StaffPage from "./pages/staffs/StaffPage.jsx";
import StaffList from "./pages/staffs/StaffList.jsx";
import StaffType from "./pages/staffs/StaffType.jsx";

import MachineMaintenancePage from "./pages/machine-maintenance/MachineMaintenancePage.jsx";
import SparesPage from "./pages/spares/SparesPage.jsx";
import InventoryPage from "./pages/inventory/InventoryPage.jsx";

import AssetListPage from "./pages/machine-maintenance/assets/AssetListPage.jsx";
import AssetRegisterPage from "./pages/machine-maintenance/assets/AssetRegisterPage.jsx";
import SpareListPage from "./pages/machine-maintenance/assets/SpareListPage.jsx";
import SpareRegisterPage from "./pages/machine-maintenance/assets/SpareRegisterPage.jsx";
import TaskListPage from "./pages/machine-maintenance/assets/TaskListPage.jsx";
import TaskSchedulePage from "./pages/machine-maintenance/assets/TaskSchedulePage.jsx";
import UserListPage from "./pages/machine-maintenance/assets/UserListPage.jsx";
import UserAllocationPage from "./pages/machine-maintenance/assets/UserAllocationPage.jsx";
import VendorListPage from "./pages/machine-maintenance/assets/VendorListPage.jsx";
import VendorRegisterPage from "./pages/machine-maintenance/assets/VendorRegisterPage.jsx";
import BreakdownListPage from "./pages/machine-maintenance/assets/BreakdownListPage.jsx";
import ConsumeEntryPage from "./pages/machine-maintenance/assets/ConsumeEntryPage.jsx";

import ConfigurePage from "./pages/configure/ConfigurePage.jsx";
import DepartmentListPage from "./pages/configure/DepartmentListPage.jsx";
import ShiftTimingListPage from "./pages/configure/ShiftTimingListPage.jsx";
import PlantSiteListPage from "./pages/configure/PlantSiteListPage.jsx";
import StatusListPage from "./pages/configure/StatusListPage.jsx";
import CriticalLevelListPage from "./pages/configure/CriticalLevelListPage.jsx";
import UnitOfMeasureListPage from "./pages/configure/UnitOfMeasureListPage.jsx";
import TaskCategoryListPage from "./pages/configure/TaskCategoryListPage.jsx";
import FrequencyListPage from "./pages/configure/FrequencyListPage.jsx";
import ContractTypeListPage from "./pages/configure/ContractTypeListPage.jsx";

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

        <Route path="/machine-maintenance" element={<MachineMaintenancePage />}>
          <Route
            index
            element={<Navigate to="/machine-maintenance/assets/list" replace />}
          />

          <Route path="assets/list" element={<AssetListPage />} />
          <Route path="assets/register" element={<AssetRegisterPage />} />
          <Route path="assets/register/:id" element={<AssetRegisterPage />} />

          <Route path="spare-master/list" element={<SpareListPage />} />
          <Route path="spare-master/register" element={<SpareRegisterPage />} />
          <Route
            path="spare-master/register/:id"
            element={<SpareRegisterPage />}
          />

          <Route path="tasks/list" element={<TaskListPage />} />
          <Route path="tasks/schedule" element={<TaskSchedulePage />} />
          <Route path="tasks/schedule/:id" element={<TaskSchedulePage />} />

          <Route path="user-allocation/list" element={<UserListPage />} />
          <Route
            path="user-allocation/allocation"
            element={<UserAllocationPage />}
          />
          <Route
            path="user-allocation/allocation/:id"
            element={<UserAllocationPage />}
          />

          <Route path="vendors/list" element={<VendorListPage />} />
          <Route path="vendors/register" element={<VendorRegisterPage />} />
          <Route path="vendors/register/:id" element={<VendorRegisterPage />} />

          <Route
            path="consume/breakdown-list"
            element={<BreakdownListPage />}
          />
          <Route path="consume/entry" element={<ConsumeEntryPage />} />
        </Route>

        <Route path="/spares" element={<SparesPage />} />
        <Route path="/inventory/*" element={<InventoryPage />} />

        <Route path="/configure" element={<ConfigurePage />}>
          <Route
            index
            element={<Navigate to="/configure/department" replace />}
          />

          <Route path="department" element={<DepartmentListPage />} />
          <Route path="shift-timing" element={<ShiftTimingListPage />} />
          <Route path="plant-site" element={<PlantSiteListPage />} />
          <Route path="status" element={<StatusListPage />} />
          <Route path="critical-level" element={<CriticalLevelListPage />} />
          <Route path="unit-of-measure" element={<UnitOfMeasureListPage />} />
          <Route path="task-category" element={<TaskCategoryListPage />} />
          <Route path="frequency" element={<FrequencyListPage />} />
          <Route path="contract-type" element={<ContractTypeListPage />} />

          <Route
            path="department/list"
            element={<Navigate to="/configure/department" replace />}
          />
          <Route
            path="shift-timing/list"
            element={<Navigate to="/configure/shift-timing" replace />}
          />
          <Route
            path="plant-site/list"
            element={<Navigate to="/configure/plant-site" replace />}
          />
          <Route
            path="status/list"
            element={<Navigate to="/configure/status" replace />}
          />
          <Route
            path="critical-level/list"
            element={<Navigate to="/configure/critical-level" replace />}
          />
          <Route
            path="unit-of-measure/list"
            element={<Navigate to="/configure/unit-of-measure" replace />}
          />
          <Route
            path="task-category/list"
            element={<Navigate to="/configure/task-category" replace />}
          />
          <Route
            path="frequency/list"
            element={<Navigate to="/configure/frequency" replace />}
          />
          <Route
            path="contract-type/list"
            element={<Navigate to="/configure/contract-type" replace />}
          />

          <Route
            path="department/register"
            element={<Navigate to="/configure/department" replace />}
          />
          <Route
            path="department/register/:id"
            element={<Navigate to="/configure/department" replace />}
          />
          <Route
            path="shift-timing/register"
            element={<Navigate to="/configure/shift-timing" replace />}
          />
          <Route
            path="shift-timing/register/:id"
            element={<Navigate to="/configure/shift-timing" replace />}
          />
          <Route
            path="plant-site/register"
            element={<Navigate to="/configure/plant-site" replace />}
          />
          <Route
            path="plant-site/register/:id"
            element={<Navigate to="/configure/plant-site" replace />}
          />
          <Route
            path="status/register"
            element={<Navigate to="/configure/status" replace />}
          />
          <Route
            path="status/register/:id"
            element={<Navigate to="/configure/status" replace />}
          />
          <Route
            path="critical-level/register"
            element={<Navigate to="/configure/critical-level" replace />}
          />
          <Route
            path="critical-level/register/:id"
            element={<Navigate to="/configure/critical-level" replace />}
          />
          <Route
            path="unit-of-measure/register"
            element={<Navigate to="/configure/unit-of-measure" replace />}
          />
          <Route
            path="unit-of-measure/register/:id"
            element={<Navigate to="/configure/unit-of-measure" replace />}
          />
          <Route
            path="task-category/register"
            element={<Navigate to="/configure/task-category" replace />}
          />
          <Route
            path="task-category/register/:id"
            element={<Navigate to="/configure/task-category" replace />}
          />
          <Route
            path="frequency/register"
            element={<Navigate to="/configure/frequency" replace />}
          />
          <Route
            path="frequency/register/:id"
            element={<Navigate to="/configure/frequency" replace />}
          />
          <Route
            path="contract-type/register"
            element={<Navigate to="/configure/contract-type" replace />}
          />
          <Route
            path="contract-type/register/:id"
            element={<Navigate to="/configure/contract-type" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
