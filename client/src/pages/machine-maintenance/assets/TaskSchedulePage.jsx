import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createTask,
  getConfiguredFrequencies,
  getConfiguredShiftTimings,
  getConfiguredTaskCategories,
  getRegisteredMachineOptions,
  getTaskById,
  mapTaskFormValues,
  updateTask,
} from "../components/machineMaintenanceApi.js";

const TaskSchedulePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const baseConfig = pageFormData.taskSchedule;

  const [initialValues, setInitialValues] = useState(null);
  const [loadingInitialValues, setLoadingInitialValues] = useState(false);
  const [loadingDropdownOptions, setLoadingDropdownOptions] = useState(false);

  const [shiftOptions, setShiftOptions] = useState([]);
  const [taskCategoryOptions, setTaskCategoryOptions] = useState([]);
  const [frequencyOptions, setFrequencyOptions] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        setLoadingDropdownOptions(true);

        const [shifts, taskCategories, frequencies, machines] =
          await Promise.all([
            getConfiguredShiftTimings(),
            getConfiguredTaskCategories(),
            getConfiguredFrequencies(),
            getRegisteredMachineOptions(),
          ]);

        setShiftOptions(shifts);
        setTaskCategoryOptions(taskCategories);
        setFrequencyOptions(frequencies);
        setMachineOptions(machines);
      } catch (error) {
        console.error("Failed to load configure dropdown data:", error);
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
            options: taskCategoryOptions,
          };
        }

        if (field.name === "applicableMachine") {
          return {
            ...field,
            select: true,
            options: machineOptions,
          };
        }

        if (field.name === "frequency") {
          return {
            ...field,
            select: true,
            options: frequencyOptions,
          };
        }

        if (field.name === "shift") {
          return {
            ...field,
            select: true,
            options: shiftOptions,
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
      shiftOptions,
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
