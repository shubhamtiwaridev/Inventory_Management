import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";
import {
  getStoredRows,
  STORAGE_KEYS,
} from "../components/machineMaintenanceStorage";

const VendorListPage = () => {
  const navigate = useNavigate();
  const config = pageTableData.vendorList;

  const rows = useMemo(
    () => getStoredRows(STORAGE_KEYS.vendors, config.rows),
    [config.rows],
  );

  return (
    <MachineMaintenanceListView
      title="List of Vendors"
      columns={config.columns}
      rows={rows}
      primaryButtonLabel="New Vendor"
      onPrimaryAction={() => navigate("/machine-maintenance/vendors/register")}
    />
  );
};

export default VendorListPage;
