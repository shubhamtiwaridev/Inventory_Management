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

const toOption = (value) => {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return null;

  return {
    label: cleanValue,
    value: cleanValue,
  };
};

const mergeOptionsWithExistingValue = (options = [], value = "") => {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) return options;

  const exists = options.some((option) => {
    const optionValue =
      typeof option === "string" ? option : String(option?.value || "").trim();

    return optionValue === cleanValue;
  });

  if (exists) return options;

  const currentValueOption = toOption(cleanValue);
  return currentValueOption ? [currentValueOption, ...options] : options;
};

const buildAssetPayload = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    formData.append(key, value);
  });

  return formData;
};

const loadAssetDropdownData = async () => {
  const [departmentsResult, plantsResult, criticalLevelsResult, statusesResult] =
    await Promise.allSettled([
    getConfiguredDepartments(),
    getConfiguredPlantSites(),
    getConfiguredCriticalLevels(),
    getConfiguredStatuses(),
    ]);

  return {
    departments:
      departmentsResult.status === "fulfilled" ? departmentsResult.value : [],
    plants: plantsResult.status === "fulfilled" ? plantsResult.value : [],
    criticalLevels:
      criticalLevelsResult.status === "fulfilled"
        ? criticalLevelsResult.value
        : [],
    statuses: statusesResult.status === "fulfilled" ? statusesResult.value : [],
  };
};

const buildAssetFormConfig = ({ baseConfig, dropdownData, initialValues }) => ({
  ...baseConfig,
  fields: baseConfig.fields.map((field) => {
    if (field.name === "plant") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.plants || [],
          initialValues?.plant,
        ),
      };
    }

    if (field.name === "department") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.departments || [],
          initialValues?.department,
        ),
      };
    }

    if (field.name === "criticality") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.criticalLevels || [],
          initialValues?.criticality,
        ),
      };
    }

    if (field.name === "status") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.statuses || [],
          initialValues?.status,
        ),
      };
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
