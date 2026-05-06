import ConfigureMasterPage from "./ConfigureMasterPage.jsx";
import {
  createUnitOfMeasure,
  deleteUnitOfMeasure,
  getUnitOfMeasureById,
  getUnitsOfMeasure,
  mapUnitOfMeasureFormValues,
  mapUnitOfMeasureListRow,
  updateUnitOfMeasure,
} from "./configureApi.js";

const unitOfMeasureConfig = {
  createDialogTitle: "Add New Unit of Measure",
  editDialogTitle: "Update Unit of Measure",
  searchPlaceholder: "Search Word",
  emptyMessage: "No unit of measure found",
  downloadFileName: "unit-of-measure-list.csv",
  deleteLabelKey: "unitOfMeasure",
  tableMinWidth: 900,
  fields: [
    {
      name: "unitOfMeasure",
      label: "Unit of Measure",
      required: true,
    },
  ],
  columns: [
    {
      key: "unitOfMeasure",
      label: "Unit of Measure",
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

const UnitOfMeasureListPage = () => {
  return (
    <ConfigureMasterPage
      config={unitOfMeasureConfig}
      getItems={getUnitsOfMeasure}
      getItemById={getUnitOfMeasureById}
      createItem={createUnitOfMeasure}
      updateItem={updateUnitOfMeasure}
      deleteItem={deleteUnitOfMeasure}
      mapListRow={mapUnitOfMeasureListRow}
      mapFormValues={mapUnitOfMeasureFormValues}
    />
  );
};

export default UnitOfMeasureListPage;
