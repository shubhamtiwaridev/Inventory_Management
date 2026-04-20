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
  const [machines, units, statuses, vendorsResponse] = await Promise.all([
    getRegisteredMachineOptions(),
    getConfiguredUnitsOfMeasure(),
    getConfiguredStatuses(),
    getVendors(),
  ]);

  return {
    machines,
    units,
    statuses,
    vendors: getVendorOptions(vendorsResponse),
  };
};

const buildSpareFormConfig = ({ baseConfig, dropdownData }) => ({
  ...baseConfig,
  fields: baseConfig.fields.map((field) => {
    if (field.name === "linkedMachine") {
      return { ...field, select: true, options: dropdownData.machines || [] };
    }

    if (field.name === "vendor") {
      return {
        ...field,
        label: "Supplier",
        select: true,
        options: dropdownData.vendors || [],
      };
    }

    if (field.name === "unit") {
      return { ...field, select: true, options: dropdownData.units || [] };
    }

    if (field.name === "status") {
      return { ...field, select: true, options: dropdownData.statuses || [] };
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
