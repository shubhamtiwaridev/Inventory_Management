import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  deleteSpare,
  getSpares,
  mapSpareListRow,
} from "../components/machineMaintenanceApi.js";

const SpareListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.spareList;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getSpares();
      const records = Array.isArray(response?.data) ? response.data : [];
      setRows(records.map(mapSpareListRow));
    } catch (err) {
      setError(err.message || "Failed to fetch spares");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleEdit = (row) => {
    navigate(`/machine-maintenance/spare-master/register/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm("Are you sure you want to delete this spare?");
    if (!confirmed) return;

    try {
      await deleteSpare(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
    } catch (err) {
      alert(err.message || "Failed to delete spare");
    }
  };

  return (
    <MachineMaintenanceListView
      title="List of Spares"
      columns={config.columns}
      rows={rows}
      loading={loading}
      error={error}
      onRefresh={fetchRows}
      onEdit={handleEdit}
      onDelete={handleDelete}
      primaryButtonLabel="New Spare"
      onPrimaryAction={() => navigate("/machine-maintenance/spare-master/register")}
    />
  );
};

export default SpareListPage;