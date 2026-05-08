import { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import MachineMaintenanceListView from "../machine-maintenance/components/MachineMaintenanceListView.jsx";
import { brand } from "../machine-maintenance/components/machineMaintenanceUi.jsx";
import { deleteLogActivity, getLogActivities } from "./logActivityApi.js";

const logActivityColumns = [
  { key: "userEmail", label: "User Email", width: "240px" },
  { key: "userName", label: "User Name", width: "200px" },
  { key: "role", label: "Role", width: "160px" },
  { key: "action", label: "Action", width: "220px" },
  { key: "page", label: "Page", width: "240px" },
  { key: "targetName", label: "Record", width: "240px" },
  { key: "time", label: "Time", width: "220px", nowrap: true },
];

const LogActivityPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const logs = await getLogActivities();
      setRows(logs);
    } catch (fetchError) {
      setError(fetchError.message || "Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleDelete = async (row) => {
    if (!row?.id) return;

    const previousRows = rows;

    setRows((prev) => prev.filter((item) => item.id !== row.id));
    setError("");

    try {
      await deleteLogActivity(row.id);
    } catch (deleteError) {
      setRows(previousRows);
      setError(deleteError.message || "Failed to delete activity log");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: brand.pageBg,
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      <MachineMaintenanceListView
        title="Log Activity"
        columns={logActivityColumns}
        rows={rows}
        actionColumnLabel="Delete"
        showPrimaryAction={false}
        showActions
        onDelete={handleDelete}
        onRefresh={fetchRows}
        loading={loading}
        error={error}
      />
    </Box>
  );
};

export default LogActivityPage;
