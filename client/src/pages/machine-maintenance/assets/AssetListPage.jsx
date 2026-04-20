import {
  pageFormData,
  pageTableData,
} from "../components/machineMaintenanceUi.jsx";
import MachineMaintenanceDialogPage from "../components/MachineMaintenanceDialogPage.jsx";
import {
  createAsset,
  deleteAsset,
  getAssetById,
  getAssets,
  getConfiguredCriticalLevels,
  getConfiguredDepartments,
  getConfiguredPlantSites,
  getConfiguredStatuses,
  mapAssetFormValues,
  mapAssetListRow,
  updateAsset,
} from "../components/machineMaintenanceApi.js";

const buildAssetPayload = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    formData.append(key, value);
  });

  return formData;
};

const loadAssetDropdownData = async () => {
  const [departments, plants, criticalLevels, statuses] = await Promise.all([
    getConfiguredDepartments(),
    getConfiguredPlantSites(),
    getConfiguredCriticalLevels(),
    getConfiguredStatuses(),
  ]);

  return {
    departments,
    plants,
    criticalLevels,
    statuses,
  };
};

const buildAssetFormConfig = ({ baseConfig, dropdownData }) => ({
  ...baseConfig,
  fields: baseConfig.fields.map((field) => {
    if (field.name === "plant") {
      return { ...field, select: true, options: dropdownData.plants || [] };
    }

    if (field.name === "department") {
      return {
        ...field,
        select: true,
        options: dropdownData.departments || [],
      };
    }

    if (field.name === "criticality") {
      return {
        ...field,
        select: true,
        options: dropdownData.criticalLevels || [],
      };
    }

    if (field.name === "status") {
      return { ...field, select: true, options: dropdownData.statuses || [] };
    }

    return field;
  }),
});

const AssetListPage = () => {
  return (
    <MachineMaintenanceDialogPage
      listTitle="List of Assets"
      formTitle="Machine Registration"
      listConfig={pageTableData.assetList}
      formConfig={pageFormData.assetRegister}
      listPath="/machine-maintenance/assets/list"
      getList={getAssets}
      mapListRow={mapAssetListRow}
      deleteItem={deleteAsset}
      getItemById={getAssetById}
      createItem={createAsset}
      updateItem={updateAsset}
      mapFormValues={mapAssetFormValues}
      loadDropdownData={loadAssetDropdownData}
      buildFormConfig={buildAssetFormConfig}
      buildSubmitPayload={buildAssetPayload}
      createSuccessMessage="Machine registered successfully."
      updateSuccessMessage="Machine updated successfully."
      deleteConfirmMessage="Are you sure you want to delete this asset?"
      fetchErrorMessage="Failed to fetch assets"
      deleteErrorMessage="Failed to delete asset"
      primaryButtonLabel="New"
      dialogMaxWidth="sm"
      dialogWidth={{ xs: "calc(100% - 24px)", sm: "496px" }}
    />
  );
};

export default AssetListPage;
