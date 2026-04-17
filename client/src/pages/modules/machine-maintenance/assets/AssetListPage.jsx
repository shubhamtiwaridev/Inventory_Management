import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  deleteAsset,
  getAssets,
  mapAssetListRow,
} from "../components/machineMaintenanceApi.js";

const AssetListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.assetList;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAssets();
      const records = Array.isArray(response?.data) ? response.data : [];
      setRows(records.map(mapAssetListRow));
    } catch (err) {
      setError(err.message || "Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleEdit = (row) => {
    navigate(`/machine-maintenance/assets/register/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm("Are you sure you want to delete this asset?");
    if (!confirmed) return;

    try {
      await deleteAsset(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
    } catch (err) {
      alert(err.message || "Failed to delete asset");
    }
  };

  return (
    <MachineMaintenanceListView
      title="List of Assets"
      columns={config.columns}
      rows={rows}
      loading={loading}
      error={error}
      onRefresh={fetchRows}
      onEdit={handleEdit}
      onDelete={handleDelete}
      primaryButtonLabel="New Asset"
      onPrimaryAction={() => navigate("/machine-maintenance/assets/register")}
    />
  );
};

export default AssetListPage;