import ConfigureMasterPage from "./ConfigureMasterPage.jsx";
import {
  createContractType,
  deleteContractType,
  getContractTypeById,
  getContractTypes,
  mapContractTypeFormValues,
  mapContractTypeListRow,
  updateContractType,
} from "./configureApi.js";

const contractTypeConfig = {
  createDialogTitle: "Add New Contract Type",
  editDialogTitle: "Update Contract Type",
  searchPlaceholder: "Search Word",
  emptyMessage: "No contract type found",
  downloadFileName: "contract-type-list.csv",
  deleteLabelKey: "contractType",
  tableMinWidth: 900,
  fields: [
    {
      name: "contractType",
      label: "Contract Type",
      required: true,
    },
  ],
  columns: [
    {
      key: "contractType",
      label: "Contract Type",
      width: "25%",
      chip: true,
      align: "center",
    },
    {
      key: "createdBy",
      label: "Creater",
      width: "20%",
      bold: true,
      align: "center",
    },
    {
      key: "createdAt",
      label: "Created Time",
      width: "20%",
      softText: true,
      align: "center",
    },
    {
      key: "updatedAt",
      label: "Updated Time",
      width: "23%",
      softText: true,
      align: "center",
    },
  ],
};

const ContractTypeListPage = () => {
  return (
    <ConfigureMasterPage
      config={contractTypeConfig}
      getItems={getContractTypes}
      getItemById={getContractTypeById}
      createItem={createContractType}
      updateItem={updateContractType}
      deleteItem={deleteContractType}
      mapListRow={mapContractTypeListRow}
      mapFormValues={mapContractTypeFormValues}
    />
  );
};

export default ContractTypeListPage;
