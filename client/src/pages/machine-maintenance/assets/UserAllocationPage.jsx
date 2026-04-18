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
  getUserAllocationById,
  mapUserAllocationFormValues,
  updateUserAllocation,
} from "../components/machineMaintenanceApi.js";

const UserAllocationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const baseConfig = pageFormData.userAllocation;

  const [initialValues, setInitialValues] = useState(null);
  const [loadingInitialValues, setLoadingInitialValues] = useState(false);
  const [loadingDropdownOptions, setLoadingDropdownOptions] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        setLoadingDropdownOptions(true);

        const [departments, shifts, machines, statuses] = await Promise.all([
          getConfiguredDepartments(),
          getConfiguredShiftTimings(),
          getRegisteredMachineOptions(),
          getConfiguredStatuses(),
        ]);

        setDepartmentOptions(departments);
        setShiftOptions(shifts);
        setMachineOptions(machines);
        setStatusOptions(statuses);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
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
        if (field.name === "department") {
          return {
            ...field,
            select: true,
            options: departmentOptions,
          };
        }

        if (field.name === "shift") {
          return {
            ...field,
            select: true,
            options: shiftOptions,
          };
        }

        if (field.name === "machine") {
          return {
            ...field,
            select: true,
            options: machineOptions,
          };
        }

        if (field.name === "status") {
          return {
            ...field,
            select: true,
            options: statusOptions,
          };
        }

        return field;
      }),
    }),
    [
      baseConfig,
      departmentOptions,
      shiftOptions,
      machineOptions,
      statusOptions,
    ],
  );

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
      onSuccess={() => navigate("/machine-maintenance/user-allocation/list")}
    />
  );
};

export default UserAllocationPage;
