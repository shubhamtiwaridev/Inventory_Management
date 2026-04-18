import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  deleteUserAllocation,
  getUserAllocations,
  mapUserAllocationListRow,
} from "../components/machineMaintenanceApi.js";

const UserListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.userList;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getUserAllocations();
      const records = Array.isArray(response?.data) ? response.data : [];
      setRows(records.map(mapUserAllocationListRow));
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleEdit = (row) => {
    navigate(`/machine-maintenance/user-allocation/allocation/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user allocation?",
    );
    if (!confirmed) return;

    try {
      await deleteUserAllocation(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
    } catch (err) {
      alert(err.message || "Failed to delete user allocation");
    }
  };

  return (
    <MachineMaintenanceListView
      title="List of Users"
      columns={config.columns}
      rows={rows}
      loading={loading}
      error={error}
      onRefresh={fetchRows}
      onEdit={handleEdit}
      onDelete={handleDelete}
      primaryButtonLabel="New User"
      onPrimaryAction={() =>
        navigate("/machine-maintenance/user-allocation/allocation")
      }
    />
  );
};

export default UserListPage;