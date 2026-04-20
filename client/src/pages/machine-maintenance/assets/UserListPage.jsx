import { useRef } from "react";
import {
  pageFormData,
  pageTableData,
} from "../components/machineMaintenanceUi.jsx";
import MachineMaintenanceDialogPage from "../components/MachineMaintenanceDialogPage.jsx";
import {
  createUserAllocation,
  deleteUserAllocation,
  getConfiguredDepartments,
  getConfiguredShiftTimings,
  getConfiguredStatuses,
  getRegisteredMachineOptions,
  getStaffMemberOptions,
  getUserAllocationById,
  getUserAllocations,
  mapUserAllocationFormValues,
  mapUserAllocationListRow,
  updateUserAllocation,
} from "../components/machineMaintenanceApi.js";

const normalizeString = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

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

const loadUserAllocationDropdownData = async () => {
  const [staffs, departments, shifts, machines, statuses] = await Promise.all([
    getStaffMemberOptions(),
    getConfiguredDepartments(),
    getConfiguredShiftTimings(),
    getRegisteredMachineOptions(),
    getConfiguredStatuses(),
  ]);

  return {
    staffs,
    departments,
    shifts,
    machines,
    statuses,
  };
};

const UserListPage = () => {
  const staffDataRef = useRef({});

  const buildFormConfig = ({ baseConfig, dropdownData, initialValues }) => {
    staffDataRef.current = dropdownData || {};

    return {
      ...baseConfig,
      fields: baseConfig.fields.map((field) => {
        if (field.name === "userName") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              dropdownData.staffs || [],
              initialValues?.userName,
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

        if (field.name === "shift") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              dropdownData.shifts || [],
              initialValues?.shift,
            ),
          };
        }

        if (field.name === "machine") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              dropdownData.machines || [],
              initialValues?.machine,
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
    };
  };

  const handleFieldChange = ({ field, value }) => {
    if (field.name !== "userName") {
      return {};
    }

    const selectedStaff = (staffDataRef.current.staffs || []).find(
      (option) => normalizeString(option?.value) === normalizeString(value),
    );

    if (!selectedStaff?.data) {
      return {};
    }

    return {
      employeeId: selectedStaff.data.employeeId || "",
      role: selectedStaff.data.role || "",
      email: selectedStaff.data.email || "",
    };
  };

  return (
    <MachineMaintenanceDialogPage
      listTitle="List of Users"
      formTitle="User Allocation"
      listConfig={pageTableData.userList}
      formConfig={pageFormData.userAllocation}
      listPath="/machine-maintenance/user-allocation/list"
      getList={getUserAllocations}
      mapListRow={mapUserAllocationListRow}
      deleteItem={deleteUserAllocation}
      getItemById={getUserAllocationById}
      createItem={createUserAllocation}
      updateItem={updateUserAllocation}
      mapFormValues={mapUserAllocationFormValues}
      loadDropdownData={loadUserAllocationDropdownData}
      buildFormConfig={buildFormConfig}
      onFieldChange={handleFieldChange}
      createSuccessMessage="User allocation saved successfully."
      updateSuccessMessage="User allocation updated successfully."
      deleteConfirmMessage="Are you sure you want to delete this user allocation?"
      fetchErrorMessage="Failed to fetch users"
      deleteErrorMessage="Failed to delete user allocation"
      primaryButtonLabel="New"
      dialogMaxWidth="sm"
      dialogWidth={{ xs: "calc(100% - 24px)", sm: "496px" }}
    />
  );
};

export default UserListPage;
