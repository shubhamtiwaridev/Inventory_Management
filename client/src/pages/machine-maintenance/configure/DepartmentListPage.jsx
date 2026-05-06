import ConfigureMasterPage from "./ConfigureMasterPage.jsx";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartments,
  mapDepartmentFormValues,
  mapDepartmentListRow,
  updateDepartment,
} from "./configureApi.js";

const departmentConfig = {
  createDialogTitle: "Add New Department",
  editDialogTitle: "Update Department",
  searchPlaceholder: "Search Word",
  emptyMessage: "No department found",
  downloadFileName: "department-list.csv",
  deleteLabelKey: "department",
  tableMinWidth: 900,
  fields: [
    {
      name: "department",
      label: "Department",
      required: true,
    },
  ],
  columns: [
    { key: "department", label: "Department", width: "25%", chip: true },
    {
      key: "createdAt",
      label: "Created Time",
      width: "25%",
      softText: true,
    },
    {
      key: "updatedAt",
      label: "Updated Time",
      width: "28%",
      softText: true,
    },
  ],
};

const DepartmentListPage = () => {
  return (
    <ConfigureMasterPage
      config={departmentConfig}
      getItems={getDepartments}
      getItemById={getDepartmentById}
      createItem={createDepartment}
      updateItem={updateDepartment}
      deleteItem={deleteDepartment}
      mapListRow={mapDepartmentListRow}
      mapFormValues={mapDepartmentFormValues}
    />
  );
};

export default DepartmentListPage;
