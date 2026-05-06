import MachineMaintenanceDialogPage from "../components/MachineMaintenanceDialogPage.jsx";
import {
  createComplient,
  deleteComplient,
  getComplientById,
  getComplients,
  getRegisteredMachineOptions,
  getSpareOptions,
  getTaskOptions,
  getVendorOptions,
  mapComplientFormValues,
  mapComplientListRow,
  updateComplient,
} from "../components/machineMaintenanceApi.js";

const PRIORITY_OPTIONS = ["High", "Medium", "Low"].map((value) => ({
  label: value,
  value,
}));

const SECTION_CONFIG = {
  assets: {
    title: "Assets",
    listPath: "/machine-maintenance/complient/assets",
    relatedField: "assetName",
    relatedLabel: "Asset",
    loadOptions: getRegisteredMachineOptions,
  },
  spare: {
    title: "Spare",
    listPath: "/machine-maintenance/complient/spare",
    relatedField: "spareName",
    relatedLabel: "Spare",
    loadOptions: getSpareOptions,
  },
  "task-master": {
    title: "Task Master",
    listPath: "/machine-maintenance/complient/task-master",
    relatedField: "taskName",
    relatedLabel: "Task Master",
    loadOptions: getTaskOptions,
  },
  "vendor-supplier": {
    title: "Vendor/Supplier",
    listPath: "/machine-maintenance/complient/vendor-supplier",
    relatedField: "vendorName",
    relatedLabel: "Vendor",
    loadOptions: getVendorOptions,
  },
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

  return [{ label: cleanValue, value: cleanValue }, ...options];
};

const buildPageConfig = (section) => {
  const sectionConfig = SECTION_CONFIG[section];

  return {
    ...sectionConfig,
    listTitle: `${sectionConfig.title} Complaint`,
    listConfig: {
      columns: [
        { key: "complaintCode", label: "Complaint ID", width: "160px" },
        { key: "complaintTitle", label: "Complaint Title", width: "240px" },
        {
          key: sectionConfig.relatedField,
          label: sectionConfig.relatedLabel,
          width: "220px",
        },
        { key: "description", label: "Description", width: "240px" },
        { key: "issueDate", label: "Issue Date", width: "150px" },
        { key: "priority", label: "Priority", width: "140px", type: "status" },
        { key: "resolvedBy", label: "Resolved By", width: "180px" },
        { key: "resolvedDate", label: "Resolved Date", width: "160px" },
      ],
    },
    formConfig: {
      primaryActionLabel: "Save",
      successMessage: `${sectionConfig.title} complaint saved successfully.`,
      fields: [
        { name: "complaintCode", label: "Complaint ID", required: true },
        { name: "complaintTitle", label: "Complaint Title", required: true },
        {
          name: sectionConfig.relatedField,
          label: sectionConfig.relatedLabel,
          required: true,
          select: true,
          options: [],
        },
        { name: "issueDate", label: "Issue Date", required: true, type: "date" },
        {
          name: "priority",
          label: "Priority",
          required: true,
          select: true,
          defaultValue: "Medium",
          options: PRIORITY_OPTIONS,
        },
        {
          name: "description",
          label: "Description",
          multiline: true,
          minRows: 3,
        },
      ],
    },
  };
};

const ComplaintSectionPage = ({ section }) => {
  const config = buildPageConfig(section);

  const loadDropdownData = async () => {
    const [relatedOptionsResult] = await Promise.allSettled([config.loadOptions()]);

    return {
      relatedOptions:
        relatedOptionsResult.status === "fulfilled"
          ? relatedOptionsResult.value
          : [],
    };
  };

  const buildFormConfig = ({ baseConfig, dropdownData, initialValues }) => ({
    ...baseConfig,
    fields: baseConfig.fields.map((field) => {
      if (field.name === config.relatedField) {
        return {
          ...field,
          select: true,
          options: mergeOptionsWithExistingValue(
            dropdownData.relatedOptions || [],
            initialValues?.[config.relatedField],
          ),
        };
      }

      return field;
    }),
  });

  return (
    <MachineMaintenanceDialogPage
      listTitle={config.listTitle}
      listConfig={config.listConfig}
      formConfig={config.formConfig}
      listPath={config.listPath}
      getList={() => getComplients(section)}
      mapListRow={mapComplientListRow}
      deleteItem={deleteComplient}
      getItemById={getComplientById}
      createItem={createComplient}
      updateItem={updateComplient}
      mapFormValues={mapComplientFormValues}
      loadDropdownData={loadDropdownData}
      buildFormConfig={buildFormConfig}
      buildSubmitPayload={(payload) => ({
        ...payload,
        section,
      })}
      createSuccessMessage={`${config.title} complaint created successfully.`}
      updateSuccessMessage={`${config.title} complaint updated successfully.`}
      fetchErrorMessage={`Failed to fetch ${config.title.toLowerCase()} complaints`}
      deleteErrorMessage={`Failed to delete ${config.title.toLowerCase()} complaint`}
      primaryButtonLabel="New"
      dialogMaxWidth="sm"
      dialogWidth={{ xs: "calc(100% - 24px)", sm: "496px" }}
      dialogHeight={{ xs: "78vh", sm: "72vh" }}
    />
  );
};

export default ComplaintSectionPage;
