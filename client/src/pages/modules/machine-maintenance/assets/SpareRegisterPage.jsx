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

const SpareRegisterPage = () => {
  const navigate = useNavigate();
  const config = pageFormData.spareRegister;

  const submitHandler = async (payload) => {
    const row = {
      id: Date.now(),
      spareCode: valueOrNA(payload.spareCode),
      spareName: valueOrNA(payload.spareName),
      partNo: valueOrNA(payload.partNo),
      unit: valueOrNA(payload.unit),
      minQty: valueOrNA(payload.minQty),
      maxQty: valueOrNA(payload.maxQty),
      vendor: valueOrNA(payload.vendor),
      status: valueOrNA(payload.status || "Active"),
    };

    prependStoredRow(STORAGE_KEYS.spares, row, "spareCode", []);
    return row;
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      submitHandler={submitHandler}
      onSuccess={() => navigate("/machine-maintenance/spare-master/list")}
    />
  );
};

export default SpareRegisterPage;
