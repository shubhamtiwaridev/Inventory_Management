import { useEffect, useState } from "react";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { getAssets } from "../components/machineMaintenanceApi.js";

const consumeColumns = [
  { key: "entryNo", label: "Entry No", width: "180px" },
  { key: "itemName", label: "Asset / Spare", width: "220px" },
  { key: "requestedBy", label: "Requested By", width: "180px" },
  { key: "issueDate", label: "Issue Date", width: "150px" },
  { key: "unit", label: "Unit", width: "140px" },
  { key: "consumeQty", label: "Consume Qty", width: "150px" },
  { key: "status", label: "Status", width: "150px", type: "status" },
];

const isBreakdownStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase() === "breakdown";

const formatDateValue = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toISOString().split("T")[0];
};

const mapConsumeRow = (item) => ({
  id: item?._id,
  entryNo: item?.assetCode || "-",
  itemName: item?.assetName || "-",
  requestedBy: item?.updatedBy || item?.createdBy || "-",
  issueDate: formatDateValue(item?.updatedAt || item?.createdAt),
  unit: item?.category || "-",
  consumeQty: "-",
  status: item?.status || "-",
});

const ConsumeStatusListView = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAssets({ skipCache: true });
      const list = Array.isArray(response?.data) ? response.data : [];

      setRows(list.filter((item) => isBreakdownStatus(item?.status)).map(mapConsumeRow));
    } catch (err) {
      setError(err.message || "Failed to fetch consume records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  return (
    <MachineMaintenanceListView
      title="Consume Entry"
      columns={consumeColumns}
      rows={rows}
      showPrimaryAction={false}
      showActions={false}
      onRefresh={fetchRows}
      loading={loading}
      error={error}
    />
  );
};

export default ConsumeStatusListView;
