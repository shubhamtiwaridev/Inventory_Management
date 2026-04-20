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

const loadVendorDropdownData = async () => {
  const [contractTypes, statuses, machines] = await Promise.all([
    getConfiguredContractTypes(),
    getConfiguredStatuses(),
    getRegisteredMachineOptions(),
  ]);

  return {
    contractTypes,
    statuses,
    machines,
  };
};

const buildVendorFormConfig = ({ baseConfig, dropdownData }) => ({
  ...baseConfig,
  fields: baseConfig.fields.map((field) => {
    if (field.name === "contractType") {
      return {
        ...field,
        select: true,
        options: dropdownData.contractTypes || [],
      };
    }

    if (field.name === "machinesCovered") {
      return {
        ...field,
        label: "Machines Covered",
        select: true,
        options: dropdownData.machines || [],
      };
    }

    if (field.name === "status") {
      return {
        ...field,
        select: true,
        options: dropdownData.statuses || [],
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
