import {
  pageFormData,
  pageTableData,
} from "../components/machineMaintenanceUi.jsx";
import MachineMaintenanceDialogPage from "../components/MachineMaintenanceDialogPage.jsx";
import {
  createTask,
  deleteTask,
  getConfiguredFrequencies,
  getConfiguredShiftTimings,
  getConfiguredStatuses,
  getConfiguredTaskCategories,
  getRegisteredMachineOptions,
  getStaffMemberOptions,
  getTaskById,
  getTasks,
  mapTaskFormValues,
  mapTaskListRow,
  updateTask,
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

const loadTaskDropdownData = async () => {
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

  return {
    taskCategories,
    machines,
    frequencies,
    assignedUsers,
    shifts,
    statuses,
  };
};

const buildTaskFormConfig = ({ baseConfig, dropdownData, initialValues }) => ({
  ...baseConfig,
  fields: baseConfig.fields.map((field) => {
    if (field.name === "taskCategory") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.taskCategories || [],
          initialValues?.taskCategory,
        ),
      };
    }

    if (field.name === "applicableMachine") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.machines || [],
          initialValues?.applicableMachine,
        ),
      };
    }

    if (field.name === "frequency") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.frequencies || [],
          initialValues?.frequency,
        ),
      };
    }

    if (field.name === "assignedUser") {
      return {
        ...field,
        select: true,
        options: mergeOptionsWithExistingValue(
          dropdownData.assignedUsers || [],
          initialValues?.assignedUser,
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

const TaskListPage = () => {
  return (
    <MachineMaintenanceDialogPage
      listTitle="List of Tasks"
      formTitle="Task Schedule"
      listConfig={pageTableData.taskList}
      formConfig={pageFormData.taskSchedule}
      listPath="/machine-maintenance/tasks/list"
      getList={getTasks}
      mapListRow={mapTaskListRow}
      deleteItem={deleteTask}
      getItemById={getTaskById}
      createItem={createTask}
      updateItem={updateTask}
      mapFormValues={mapTaskFormValues}
      loadDropdownData={loadTaskDropdownData}
      buildFormConfig={buildTaskFormConfig}
      createSuccessMessage="Task scheduled successfully."
      updateSuccessMessage="Task updated successfully."
      deleteConfirmMessage="Are you sure you want to delete this task?"
      fetchErrorMessage="Failed to fetch tasks"
      deleteErrorMessage="Failed to delete task"
      primaryButtonLabel="New"
      dialogMaxWidth="sm"
      dialogWidth={{ xs: "calc(100% - 24px)", sm: "496px" }}
    />
  );
};

export default TaskListPage;
