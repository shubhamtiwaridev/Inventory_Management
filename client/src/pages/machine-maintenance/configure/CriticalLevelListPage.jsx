import ConfigureMasterPage from "./ConfigureMasterPage.jsx";
import {
  createCriticalLevel,
  deleteCriticalLevel,
  getCriticalLevelById,
  getCriticalLevels,
  mapCriticalLevelFormValues,
  mapCriticalLevelListRow,
  updateCriticalLevel,
} from "./configureApi.js";

const criticalLevelConfig = {
  createDialogTitle: "Add New Critical Level",
  editDialogTitle: "Update Critical Level",
  searchPlaceholder: "Search Word",
  emptyMessage: "No critical level found",
  downloadFileName: "critical-level-list.csv",
  deleteLabelKey: "criticalLevel",
  tableMinWidth: 900,
  fields: [
    {
      name: "criticalLevel",
      label: "Critical Level",
      required: true,
    },
  ],
  columns: [
    {
      key: "criticalLevel",
      label: "Critical Level",
      width: "25%",
      chip: true,
      align: "center",
    },
    {
      key: "createdAt",
      label: "Created Time",
      width: "25%",
      softText: true,
      align: "center",
    },
    {
      key: "updatedAt",
      label: "Updated Time",
      width: "28%",
      softText: true,
      align: "center",
    },
  ],
};

const CriticalLevelListPage = () => {
  return (
    <ConfigureMasterPage
      config={criticalLevelConfig}
      getItems={getCriticalLevels}
      getItemById={getCriticalLevelById}
      createItem={createCriticalLevel}
      updateItem={updateCriticalLevel}
      deleteItem={deleteCriticalLevel}
      mapListRow={mapCriticalLevelListRow}
      mapFormValues={mapCriticalLevelFormValues}
    />
  );
};

export default CriticalLevelListPage;
