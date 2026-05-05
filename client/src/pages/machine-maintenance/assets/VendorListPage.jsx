import {
  pageFormData,
  pageTableData,
} from "../components/machineMaintenanceUi.jsx";
import MachineMaintenanceDialogPage from "../components/MachineMaintenanceDialogPage.jsx";
import {
  createVendor,
  deleteVendor,
  getConfiguredContractTypes,
  getConfiguredStatuses,
  getRegisteredMachineOptions,
  getVendorById,
  getVendors,
  mapVendorFormValues,
  mapVendorListRow,
  updateVendor,
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

const loadVendorDropdownData = async () => {
  const [contractTypesResult, statusesResult, machinesResult] =
    await Promise.allSettled([
    getConfiguredContractTypes(),
    getConfiguredStatuses(),
    getRegisteredMachineOptions(),
    ]);

  return {
    contractTypes:
      contractTypesResult.status === "fulfilled"
        ? contractTypesResult.value
        : [],
    statuses: statusesResult.status === "fulfilled" ? statusesResult.value : [],
    machines: machinesResult.status === "fulfilled" ? machinesResult.value : [],
  };
};

const buildVendorFormConfig = ({ baseConfig, dropdownData, initialValues }) => ({
  ...baseConfig,
  fields: baseConfig.fields.map((field) => {
    if (field.name === "contractType") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.contractTypes || [],
          initialValues?.contractType,
        ),
      };
    }

    if (field.name === "machinesCovered") {
      return {
        ...field,
        label: "Machines Covered",
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.machines || [],
          initialValues?.machinesCovered,
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

const VendorListPage = () => {
  return (
    <MachineMaintenanceDialogPage
      listTitle="List of Vendors"
      formTitle="Vendor Registration"
      listConfig={pageTableData.vendorList}
      formConfig={pageFormData.vendorRegister}
      listPath="/machine-maintenance/vendors/list"
      getList={getVendors}
      mapListRow={mapVendorListRow}
      deleteItem={deleteVendor}
      getItemById={getVendorById}
      createItem={createVendor}
      updateItem={updateVendor}
      mapFormValues={mapVendorFormValues}
      loadDropdownData={loadVendorDropdownData}
      buildFormConfig={buildVendorFormConfig}
      createSuccessMessage="Vendor registered successfully."
      updateSuccessMessage="Vendor updated successfully."
      deleteConfirmMessage="Are you sure you want to delete this vendor?"
      fetchErrorMessage="Failed to fetch vendors"
      deleteErrorMessage="Failed to delete vendor"
      primaryButtonLabel="New"
      dialogMaxWidth="sm"
      dialogWidth={{ xs: "calc(100% - 24px)", sm: "496px" }}
    />
  );
};

export default VendorListPage;
