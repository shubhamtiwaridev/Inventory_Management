import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  deleteVendor,
  getVendors,
  mapVendorListRow,
} from "../components/machineMaintenanceApi.js";

const VendorListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.vendorList;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getVendors();
      const records = Array.isArray(response?.data) ? response.data : [];
      setRows(records.map(mapVendorListRow));
    } catch (err) {
      setError(err.message || "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleEdit = (row) => {
    navigate(`/machine-maintenance/vendors/register/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm("Are you sure you want to delete this vendor?");
    if (!confirmed) return;

    try {
      await deleteVendor(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
    } catch (err) {
      alert(err.message || "Failed to delete vendor");
    }
  };

  return (
    <MachineMaintenanceListView
      title="List of Vendors"
      columns={config.columns}
      rows={rows}
      loading={loading}
      error={error}
      onRefresh={fetchRows}
      onEdit={handleEdit}
      onDelete={handleDelete}
      primaryButtonLabel="New Vendor"
      onPrimaryAction={() => navigate("/machine-maintenance/vendors/register")}
    />
  );
};

export default VendorListPage;