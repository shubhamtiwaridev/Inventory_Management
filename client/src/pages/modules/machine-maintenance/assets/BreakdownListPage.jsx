import { useMemo } from "react";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  getStoredRows,
  STORAGE_KEYS,
} from "../components/machineMaintenanceStorage";

const BreakdownListPage = () => {
  const config = pageTableData.breakdownList;

  const rows = useMemo(
    () => getStoredRows(STORAGE_KEYS.breakdowns, config.rows),
    [config.rows],
  );

  return (
    <MachineMaintenanceListView
      title="Breakdown List"
      columns={config.columns}
      rows={rows}
      showPrimaryAction={false}
    />
  );
};

export default BreakdownListPage;
