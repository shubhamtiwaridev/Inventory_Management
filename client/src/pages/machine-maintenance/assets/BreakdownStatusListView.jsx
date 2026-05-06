import { useEffect, useState } from "react";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import {
  getAssets,
  mapAssetListRow,
} from "../components/machineMaintenanceApi.js";

const breakdownColumns = [
  { key: "assetCode", label: "Machine ID", width: "180px" },
  { key: "assetName", label: "Machine Name", width: "220px" },
  { key: "category", label: "Category", width: "180px" },
  { key: "plant", label: "Plant / Site", width: "180px" },
  { key: "department", label: "Department", width: "180px" },
  { key: "criticality", label: "Criticality", width: "160px", type: "status" },
  { key: "status", label: "Status", width: "150px", type: "status" },
];

const isBreakdownStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase() === "breakdown";

const BreakdownStatusListView = ({ title }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAssets({ skipCache: true });
      const list = Array.isArray(response?.data) ? response.data : [];

      setRows(
        list
          .filter((item) => isBreakdownStatus(item?.status))
          .map((item) => mapAssetListRow(item)),
      );
    } catch (err) {
      setError(err.message || "Failed to fetch breakdown records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  return (
    <MachineMaintenanceListView
      title={title}
      columns={breakdownColumns}
      rows={rows}
      showPrimaryAction={false}
      showActions={false}
      onRefresh={fetchRows}
      loading={loading}
      error={error}
    />
  );
};

export default BreakdownStatusListView;
