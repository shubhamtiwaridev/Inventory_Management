import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  getStoredRows,
  STORAGE_KEYS,
} from "../components/machineMaintenanceStorage";

const UserListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.userList;

  const rows = useMemo(
    () => getStoredRows(STORAGE_KEYS.users, config.rows),
    [config.rows],
  );

  return (
    <MachineMaintenanceListView
      title="List of Users"
      columns={config.columns}
      rows={rows}
      primaryButtonLabel="New User"
      onPrimaryAction={() =>
        navigate("/machine-maintenance/user-allocation/allocation")
      }
    />
  );
};

export default UserListPage;
