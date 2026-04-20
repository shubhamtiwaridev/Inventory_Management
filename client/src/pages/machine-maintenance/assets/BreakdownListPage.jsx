import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";

const BreakdownListPage = () => {
  const config = pageTableData.breakdownList;

  return (
    <MachineMaintenanceListView
      title="Breakdown List"
      columns={config.columns}
      rows={[]}
      showPrimaryAction={false}
      showActions={false}
    />
  );
};

export default BreakdownListPage;
