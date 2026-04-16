import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

import Register from "./pages/auth/Register.jsx";
import Login from "./pages/auth/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ForgetPassword from "./pages/auth/ForgetPassword.jsx";

import StaffPage from "./pages/staffs/StaffPage.jsx";
import StaffList from "./pages/staffs/StaffList.jsx";
import StaffType from "./pages/staffs/StaffType.jsx";

import MachineMaintenancePage from "./pages/modules/machine-maintenance/MachineMaintenancePage.jsx";
import SparesPage from "./pages/modules/spares/SparesPage.jsx";
import InventoryPage from "./pages/modules/inventory/InventoryPage.jsx";

import AssetListPage from "./pages/modules/machine-maintenance/assets/AssetListPage.jsx";
import AssetRegisterPage from "./pages/modules/machine-maintenance/assets/AssetRegisterPage.jsx";
import SpareListPage from "./pages/modules/machine-maintenance/assets/SpareListPage.jsx";
import SpareRegisterPage from "./pages/modules/machine-maintenance/assets/SpareRegisterPage.jsx";
import TaskListPage from "./pages/modules/machine-maintenance/assets/TaskListPage.jsx";
import TaskSchedulePage from "./pages/modules/machine-maintenance/assets/TaskSchedulePage.jsx";
import UserListPage from "./pages/modules/machine-maintenance/assets/UserListPage.jsx";
import UserAllocationPage from "./pages/modules/machine-maintenance/assets/UserAllocationPage.jsx";
import VendorListPage from "./pages/modules/machine-maintenance/assets/VendorListPage.jsx";
import VendorRegisterPage from "./pages/modules/machine-maintenance/assets/VendorRegisterPage.jsx";
import BreakdownListPage from "./pages/modules/machine-maintenance/assets/BreakdownListPage.jsx";
import ConsumeEntryPage from "./pages/modules/machine-maintenance/assets/ConsumeEntryPage.jsx";

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
          <Route path="spare-master/list" element={<SpareListPage />} />
          <Route path="spare-master/register" element={<SpareRegisterPage />} />
          <Route path="tasks/list" element={<TaskListPage />} />
          <Route path="tasks/schedule" element={<TaskSchedulePage />} />

          <Route path="user-allocation/list" element={<UserListPage />} />
          <Route
            path="user-allocation/allocation"
            element={<UserAllocationPage />}
          />

          <Route path="vendors/list" element={<VendorListPage />} />
          <Route path="vendors/register" element={<VendorRegisterPage />} />

          <Route
            path="consume/breakdown-list"
            element={<BreakdownListPage />}
          />
          <Route path="consume/entry" element={<ConsumeEntryPage />} />
        </Route>

        <Route path="/spares" element={<SparesPage />} />
        <Route path="/inventory/*" element={<InventoryPage />} />
      </Route>
    </Routes>
  );
}

export default App;
