import { useNavigate } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  prependStoredRow,
  STORAGE_KEYS,
} from "../components/machineMaintenanceStorage";

const valueOrNA = (value) =>
  value === null || value === undefined || value === ""
    ? "Not Available"
    : value;

const TaskSchedulePage = () => {
  const navigate = useNavigate();
  const config = pageFormData.taskSchedule;

  const submitHandler = async (payload) => {
    const row = {
      id: Date.now(),
      taskCode: valueOrNA(payload.taskCode),
      taskName: valueOrNA(payload.taskName),
      frequency: valueOrNA(payload.frequency),
      assignedUser: valueOrNA(payload.assignedUser),
      startDate: valueOrNA(payload.startDate),
      endDate: valueOrNA(payload.endDate),
      shift: valueOrNA(payload.shift),
      status: valueOrNA(payload.status || "Active"),
    };

    prependStoredRow(STORAGE_KEYS.tasks, row, "taskCode", []);
    return row;
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      submitHandler={submitHandler}
      onSuccess={() => navigate("/machine-maintenance/tasks/list")}
    />
  );
};

export default TaskSchedulePage;
