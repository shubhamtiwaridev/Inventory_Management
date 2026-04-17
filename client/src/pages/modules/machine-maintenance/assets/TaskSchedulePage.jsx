import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createTask,
  getTaskById,
  mapTaskFormValues,
  updateTask,
} from "../components/machineMaintenanceApi.js";

const TaskSchedulePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const config = pageFormData.taskSchedule;
  const [initialValues, setInitialValues] = useState(null);
  const [loadingInitialValues, setLoadingInitialValues] = useState(false);

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
      loadingInitialValues={loadingInitialValues}
      onSuccess={() => navigate("/machine-maintenance/tasks/list")}
    />
  );
};

export default TaskSchedulePage;