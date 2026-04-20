import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createUserAllocation,
  getConfiguredDepartments,
  getConfiguredShiftTimings,
  getConfiguredStatuses,
  getRegisteredMachineOptions,
  getStaffMemberOptions,
  getUserAllocationById,
  mapUserAllocationFormValues,
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

  if (!cleanValue) {
    return options;
  }

  const exists = options.some((option) => {
    const optionValue =
      typeof option === "string" ? option : String(option?.value || "").trim();
    return optionValue === cleanValue;
  });

  if (exists) {
    return options;
  }

  const currentValueOption = toOption(cleanValue);
  return currentValueOption ? [currentValueOption, ...options] : options;
};

const UserAllocationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const baseConfig = pageFormData.userAllocation;

  const [initialValues, setInitialValues] = useState(null);
  const [loadingInitialValues, setLoadingInitialValues] = useState(false);
  const [loadingDropdownOptions, setLoadingDropdownOptions] = useState(false);

  const [staffOptions, setStaffOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        setLoadingDropdownOptions(true);

        const [staffs, departments, shifts, machines, statuses] =
          await Promise.all([
            getStaffMemberOptions(),
            getConfiguredDepartments(),
            getConfiguredShiftTimings(),
            getRegisteredMachineOptions(),
            getConfiguredStatuses(),
          ]);

        setStaffOptions(staffs);
        setDepartmentOptions(departments);
        setShiftOptions(shifts);
        setMachineOptions(machines);
        setStatusOptions(statuses);
      } catch (error) {
        console.error("Failed to load user allocation dropdown data:", error);
      } finally {
        setLoadingDropdownOptions(false);
      }
    };

    loadDropdownOptions();
  }, []);

  useEffect(() => {
    if (!id) {
      setInitialValues(null);
      return;
    }

    const loadRecord = async () => {
      try {
        setLoadingInitialValues(true);
        const response = await getUserAllocationById(id);
        setInitialValues(mapUserAllocationFormValues(response?.data || {}));
      } catch (error) {
        alert(error.message || "Failed to load user allocation details");
      } finally {
        setLoadingInitialValues(false);
      }
    };

    loadRecord();
  }, [id]);

  const config = useMemo(
    () => ({
      ...baseConfig,
      fields: baseConfig.fields.map((field) => {
        if (field.name === "userName") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              staffOptions,
              initialValues?.userName,
            ),
          };
        }

        if (field.name === "department") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              departmentOptions,
              initialValues?.department,
            ),
          };
        }

        if (field.name === "shift") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              shiftOptions,
              initialValues?.shift,
            ),
          };
        }

        if (field.name === "machine") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              machineOptions,
              initialValues?.machine,
            ),
          };
        }

        if (field.name === "status") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              statusOptions,
              initialValues?.status,
            ),
          };
        }

        return field;
      }),
    }),
    [
      baseConfig,
      staffOptions,
      departmentOptions,
      shiftOptions,
      machineOptions,
      statusOptions,
      initialValues,
    ],
  );

  const handleFieldChange = ({ field, value }) => {
    if (field.name !== "userName") {
      return {};
    }

    const selectedStaff = staffOptions.find(
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

  const submitHandler = async (payload) => {
    return id
      ? updateUserAllocation(id, payload)
      : createUserAllocation(payload);
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      primaryActionLabel={id ? "Update" : config.primaryActionLabel}
      successMessage={
        id ? "User allocation updated successfully." : config.successMessage
      }
      submitHandler={submitHandler}
      initialValues={initialValues}
      loadingInitialValues={loadingInitialValues || loadingDropdownOptions}
      onFieldChange={handleFieldChange}
      onSuccess={() => navigate("/machine-maintenance/user-allocation/list")}
    />
  );
};

export default UserAllocationPage;
