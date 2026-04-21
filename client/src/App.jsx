import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
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
          <Route path="assets/register" element={<AssetListPage />} />
          <Route path="assets/register/:id" element={<AssetListPage />} />

          <Route path="spare-master/list" element={<SpareListPage />} />
          <Route path="spare-master/register" element={<SpareListPage />} />
          <Route path="spare-master/register/:id" element={<SpareListPage />} />

          <Route path="tasks/list" element={<TaskListPage />} />
          <Route path="tasks/schedule" element={<TaskListPage />} />
          <Route path="tasks/schedule/:id" element={<TaskListPage />} />

          <Route path="user-allocation/list" element={<UserListPage />} />
          <Route path="user-allocation/allocation" element={<UserListPage />} />
          <Route
            path="user-allocation/allocation/:id"
            element={<UserListPage />}
          />

          <Route path="vendors/list" element={<VendorListPage />} />
          <Route path="vendors/register" element={<VendorListPage />} />
          <Route path="vendors/register/:id" element={<VendorListPage />} />

          <Route
            path="consume/breakdown-list"
            element={<BreakdownListPage />}
          />
          <Route path="consume/entry" element={<ConsumeEntryPage />} />

          <Route
            path="configure"
            element={
              <Navigate
                to="/machine-maintenance/configure/department"
                replace
              />
            }
          />
          <Route path="configure/department" element={<DepartmentListPage />} />
          <Route
            path="configure/shift-timing"
            element={<ShiftTimingListPage />}
          />
          <Route path="configure/plant-site" element={<PlantSiteListPage />} />
          <Route path="configure/status" element={<StatusListPage />} />
          <Route
            path="configure/critical-level"
            element={<CriticalLevelListPage />}
          />
          <Route
            path="configure/unit-of-measure"
            element={<UnitOfMeasureListPage />}
          />
          <Route
            path="configure/task-category"
            element={<TaskCategoryListPage />}
          />
          <Route path="configure/frequency" element={<FrequencyListPage />} />
          <Route
            path="configure/contract-type"
            element={<ContractTypeListPage />}
          />
        </Route>

        <Route path="/spares" element={<SparesPage />} />

        <Route path="/inventory/*" element={<InventoryPage />}>
          <Route
            path="goodslist/:tabKey"
            element={<InventoryMasterListPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
