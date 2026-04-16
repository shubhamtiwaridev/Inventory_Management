import { useMemo } from "react";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  getStoredRows,
  STORAGE_KEYS,
} from "../components/machineMaintenanceStorage";

const ConsumeEntryPage = () => {
  const config = pageTableData.consumeList;

  const rows = useMemo(
    () => getStoredRows(STORAGE_KEYS.consume, config.rows),
    [config.rows],
  );

  return (
    <MachineMaintenanceListView
      title="Consume Entry"
      columns={config.columns}
      rows={rows}
      showPrimaryAction={false}
    />
  );
};

export default ConsumeEntryPage;
