import ConfigureMasterPage from "./ConfigureMasterPage.jsx";
import {
  createStatus,
  deleteStatus,
  getStatusById,
  getStatuses,
  mapStatusFormValues,
  mapStatusListRow,
  updateStatus,
} from "./configureApi.js";

const statusConfig = {
  createDialogTitle: "Add New Status",
  editDialogTitle: "Update Status",
  searchPlaceholder: "Search Word",
  emptyMessage: "No status found",
  downloadFileName: "status-list.csv",
  deleteLabelKey: "status",
  tableMinWidth: 900,
  fields: [
    {
      name: "status",
      label: "Status",
      required: true,
    },
  ],
  columns: [
    {
      key: "status",
      label: "Status",
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

const StatusListPage = () => {
  return (
    <ConfigureMasterPage
      config={statusConfig}
      getItems={getStatuses}
      getItemById={getStatusById}
      createItem={createStatus}
      updateItem={updateStatus}
      deleteItem={deleteStatus}
      mapListRow={mapStatusListRow}
      mapFormValues={mapStatusFormValues}
    />
  );
};

export default StatusListPage;
