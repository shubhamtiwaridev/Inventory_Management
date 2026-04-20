import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createTask,
  getConfiguredFrequencies,
  getConfiguredShiftTimings,
  getConfiguredStatuses,
  getConfiguredTaskCategories,
  getRegisteredMachineOptions,
  getStaffMemberOptions,
  getTaskById,
  mapTaskFormValues,
  updateTask,
} from "../components/machineMaintenanceApi.js";

const toOption = (value) => {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    return null;
  }

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

  const optionExists = options.some((option) => {
    const optionValue =
      typeof option === "string" ? option : String(option?.value || "").trim();

    return optionValue === cleanValue;
  });

  if (optionExists) {
    return options;
  }

  const currentValueOption = toOption(cleanValue);

  return currentValueOption ? [currentValueOption, ...options] : options;
};

const TaskSchedulePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const baseConfig = pageFormData.taskSchedule;

  const [initialValues, setInitialValues] = useState(null);
  const [loadingInitialValues, setLoadingInitialValues] = useState(false);
  const [loadingDropdownOptions, setLoadingDropdownOptions] = useState(false);

  const [taskCategoryOptions, setTaskCategoryOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [frequencyOptions, setFrequencyOptions] = useState([]);
  const [assignedUserOptions, setAssignedUserOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        setLoadingDropdownOptions(true);

        const [
          taskCategories,
          machines,
          frequencies,
          assignedUsers,
          shifts,
          statuses,
        ] = await Promise.all([
          getConfiguredTaskCategories(),
          getRegisteredMachineOptions(),
          getConfiguredFrequencies(),
          getStaffMemberOptions(),
          getConfiguredShiftTimings(),
          getConfiguredStatuses(),
        ]);

        setTaskCategoryOptions(taskCategories);
        setMachineOptions(machines);
        setFrequencyOptions(frequencies);
        setAssignedUserOptions(assignedUsers);
        setShiftOptions(shifts);
        setStatusOptions(statuses);
      } catch (error) {
        console.error("Failed to load task dropdown data:", error);
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
        const response = await getTaskById(id);
        setInitialValues(mapTaskFormValues(response?.data || {}));
      } catch (error) {
        alert(error.message || "Failed to load task details");
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
        if (field.name === "taskCategory") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              taskCategoryOptions,
              initialValues?.taskCategory,
            ),
          };
        }

        if (field.name === "applicableMachine") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              machineOptions,
              initialValues?.applicableMachine,
            ),
          };
        }

        if (field.name === "frequency") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              frequencyOptions,
              initialValues?.frequency,
            ),
          };
        }

        if (field.name === "assignedUser") {
          return {
            ...field,
            select: true,
            options: mergeOptionsWithExistingValue(
              assignedUserOptions,
              initialValues?.assignedUser,
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
      taskCategoryOptions,
      machineOptions,
      frequencyOptions,
      assignedUserOptions,
      shiftOptions,
      statusOptions,
      initialValues,
    ],
  );

  const submitHandler = async (payload) => {
    return id ? updateTask(id, payload) : createTask(payload);
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      primaryActionLabel={id ? "Update" : config.primaryActionLabel}
      successMessage={id ? "Task updated successfully." : config.successMessage}
      submitHandler={submitHandler}
      initialValues={initialValues}
      loadingInitialValues={loadingInitialValues || loadingDropdownOptions}
      onSuccess={() => navigate("/machine-maintenance/tasks/list")}
    />
  );
};

export default TaskSchedulePage;
