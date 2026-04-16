import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  getStoredRows,
  STORAGE_KEYS,
} from "../components/machineMaintenanceStorage";

const SpareListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.spareList;

  const rows = useMemo(
    () => getStoredRows(STORAGE_KEYS.spares, config.rows),
    [config.rows],
  );

  return (
    <MachineMaintenanceListView
      title="List of Spares"
      columns={config.columns}
      rows={rows}
      primaryButtonLabel="New Spare"
      onPrimaryAction={() =>
        navigate("/machine-maintenance/spare-master/register")
      }
    />
  );
};

export default SpareListPage;
