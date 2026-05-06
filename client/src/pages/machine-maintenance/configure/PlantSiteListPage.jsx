import ConfigureMasterPage from "./ConfigureMasterPage.jsx";
import {
  createPlantSite,
  deletePlantSite,
  getPlantSiteById,
  getPlantSites,
  mapPlantSiteFormValues,
  mapPlantSiteListRow,
  updatePlantSite,
} from "./configureApi.js";

const plantSiteConfig = {
  createDialogTitle: "Add New Plant Site",
  editDialogTitle: "Update Plant Site",
  searchPlaceholder: "Search Word",
  emptyMessage: "No plant site found",
  downloadFileName: "plant-site-list.csv",
  deleteLabelKey: "plantSite",
  tableMinWidth: 900,
  fields: [
    {
      name: "plantSite",
      label: "Plant / Site",
      required: true,
    },
  ],
  columns: [
    { key: "plantSite", label: "Plant / Site", width: "25%", chip: true },
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

const PlantSiteListPage = () => {
  return (
    <ConfigureMasterPage
      config={plantSiteConfig}
      getItems={getPlantSites}
      getItemById={getPlantSiteById}
      createItem={createPlantSite}
      updateItem={updatePlantSite}
      deleteItem={deletePlantSite}
      mapListRow={mapPlantSiteListRow}
      mapFormValues={mapPlantSiteFormValues}
    />
  );
};

export default PlantSiteListPage;
