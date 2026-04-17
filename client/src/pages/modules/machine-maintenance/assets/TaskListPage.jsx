import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  deleteTask,
  getTasks,
  mapTaskListRow,
} from "../components/machineMaintenanceApi.js";

const TaskListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.taskList;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getTasks();
      const records = Array.isArray(response?.data) ? response.data : [];
      setRows(records.map(mapTaskListRow));
    } catch (err) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleEdit = (row) => {
    navigate(`/machine-maintenance/tasks/schedule/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      await deleteTask(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  return (
    <MachineMaintenanceListView
      title="List of Tasks"
      columns={config.columns}
      rows={rows}
      loading={loading}
      error={error}
      onRefresh={fetchRows}
      onEdit={handleEdit}
      onDelete={handleDelete}
      primaryButtonLabel="New Task"
      onPrimaryAction={() => navigate("/machine-maintenance/tasks/schedule")}
    />
  );
};

export default TaskListPage;