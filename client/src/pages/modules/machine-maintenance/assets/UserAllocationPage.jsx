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

const UserAllocationPage = () => {
  const navigate = useNavigate();
  const config = pageFormData.userAllocation;

  const submitHandler = async (payload) => {
    const row = {
      id: Date.now(),
      employeeId: valueOrNA(payload.employeeId),
      userName: valueOrNA(payload.userName),
      machine: valueOrNA(payload.machine),
      task: valueOrNA(payload.task),
      shift: valueOrNA(payload.shift),
      status: valueOrNA(payload.status || "Active"),
    };

    prependStoredRow(STORAGE_KEYS.users, row, "employeeId", []);
    return row;
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      submitHandler={submitHandler}
      onSuccess={() => navigate("/machine-maintenance/user-allocation/list")}
    />
  );
};

export default UserAllocationPage;
