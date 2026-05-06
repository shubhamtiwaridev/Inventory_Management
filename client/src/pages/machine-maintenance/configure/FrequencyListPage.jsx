import ConfigureMasterPage from "./ConfigureMasterPage.jsx";
import {
  createFrequency,
  deleteFrequency,
  getFrequencies,
  getFrequencyById,
  mapFrequencyFormValues,
  mapFrequencyListRow,
  updateFrequency,
} from "./configureApi.js";

const frequencyConfig = {
  createDialogTitle: "Add New Frequency",
  editDialogTitle: "Update Frequency",
  searchPlaceholder: "Search Word",
  emptyMessage: "No frequency found",
  downloadFileName: "frequency-list.csv",
  deleteLabelKey: "frequency",
  tableMinWidth: 900,
  fields: [
    {
      name: "frequency",
      label: "Frequency",
      required: true,
    },
  ],
  columns: [
    {
      key: "frequency",
      label: "Frequency",
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

const FrequencyListPage = () => {
  return (
    <ConfigureMasterPage
      config={frequencyConfig}
      getItems={getFrequencies}
      getItemById={getFrequencyById}
      createItem={createFrequency}
      updateItem={updateFrequency}
      deleteItem={deleteFrequency}
      mapListRow={mapFrequencyListRow}
      mapFormValues={mapFrequencyFormValues}
    />
  );
};

export default FrequencyListPage;
