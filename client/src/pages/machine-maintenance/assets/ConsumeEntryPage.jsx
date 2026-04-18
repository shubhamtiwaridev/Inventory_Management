import MachineMaintenanceListView from "../components/MachineMaintenanceListView.jsx";
import { pageTableData } from "../components/machineMaintenanceUi.jsx";

const ConsumeEntryPage = () => {
  const config = pageTableData.consumeList;

  return (
    <MachineMaintenanceListView
      title="Consume Entry"
      columns={config.columns}
      rows={[]}
      showPrimaryAction={false}
      showActions={false}
    />
  );
};

export default ConsumeEntryPage;