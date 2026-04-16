import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  getStoredRows,
  STORAGE_KEYS,
} from "../components/machineMaintenanceStorage";

const TaskListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.taskList;

  const rows = useMemo(
    () => getStoredRows(STORAGE_KEYS.tasks, config.rows),
    [config.rows],
  );

  return (
    <MachineMaintenanceListView
      title="List of Tasks"
      columns={config.columns}
      rows={rows}
      primaryButtonLabel="New Task"
      onPrimaryAction={() => navigate("/machine-maintenance/tasks/schedule")}
    />
  );
};

export default TaskListPage;
