import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  getStoredRows,
  STORAGE_KEYS,
} from "../components/machineMaintenanceStorage";

const AssetListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.assetList;

  const rows = useMemo(
    () => getStoredRows(STORAGE_KEYS.assets, config.rows),
    [config.rows],
  );

  return (
    <MachineMaintenanceListView
      title="List of Assets"
      columns={config.columns}
      rows={rows}
      primaryButtonLabel="New Asset"
      onPrimaryAction={() => navigate("/machine-maintenance/assets/register")}
    />
  );
};

export default AssetListPage;
