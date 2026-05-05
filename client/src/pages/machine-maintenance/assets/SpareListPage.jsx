import {
  pageFormData,
  pageTableData,
} from "../components/machineMaintenanceUi.jsx";
import MachineMaintenanceDialogPage from "../components/MachineMaintenanceDialogPage.jsx";
import {
  createSpare,
  deleteSpare,
  getConfiguredStatuses,
  getConfiguredUnitsOfMeasure,
  getRegisteredMachineOptions,
  getSpareById,
  getSpares,
  getVendors,
  mapSpareFormValues,
  mapSpareListRow,
  updateSpare,
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

const getVendorOptions = (response) => {
  const records = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  const optionMap = new Map();

  records.forEach((item) => {
    const vendorName = String(item?.vendorName || "").trim();
    if (!vendorName) return;

    optionMap.set(vendorName, {
      label: vendorName,
      value: vendorName,
    });
  });

  return Array.from(optionMap.values());
};

const loadSpareDropdownData = async () => {
  const [machinesResult, unitsResult, statusesResult, vendorsResult] =
    await Promise.allSettled([
    getRegisteredMachineOptions(),
    getConfiguredUnitsOfMeasure(),
    getConfiguredStatuses(),
    getVendors({ skipCache: true }),
    ]);

  return {
    machines:
      machinesResult.status === "fulfilled" ? machinesResult.value : [],
    units: unitsResult.status === "fulfilled" ? unitsResult.value : [],
    statuses:
      statusesResult.status === "fulfilled" ? statusesResult.value : [],
    vendors:
      vendorsResult.status === "fulfilled"
        ? getVendorOptions(vendorsResult.value)
        : [],
  };
};

const buildSpareFormConfig = ({ baseConfig, dropdownData, initialValues }) => ({
  ...baseConfig,
  fields: baseConfig.fields.map((field) => {
    if (field.name === "linkedMachine") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.machines || [],
          initialValues?.linkedMachine,
        ),
      };
    }

    if (field.name === "vendor") {
      return {
        ...field,
        label: "Supplier",
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.vendors || [],
          initialValues?.vendor,
        ),
      };
    }

    if (field.name === "unit") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.units || [],
          initialValues?.unit,
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

const SpareListPage = () => {
  return (
    <MachineMaintenanceDialogPage
      listTitle="List of Spares"
      formTitle="Spare Registration"
      listConfig={pageTableData.spareList}
      formConfig={pageFormData.spareRegister}
      listPath="/machine-maintenance/spare-master/list"
      getList={getSpares}
      mapListRow={mapSpareListRow}
      deleteItem={deleteSpare}
      getItemById={getSpareById}
      createItem={createSpare}
      updateItem={updateSpare}
      mapFormValues={mapSpareFormValues}
      loadDropdownData={loadSpareDropdownData}
      buildFormConfig={buildSpareFormConfig}
      createSuccessMessage="Spare registered successfully."
      updateSuccessMessage="Spare updated successfully."
      deleteConfirmMessage="Are you sure you want to delete this spare?"
      fetchErrorMessage="Failed to fetch spares"
      deleteErrorMessage="Failed to delete spare"
      primaryButtonLabel="New"
      dialogMaxWidth="sm"
      dialogWidth={{ xs: "calc(100% - 24px)", sm: "496px" }}
    />
  );
};

export default SpareListPage;
