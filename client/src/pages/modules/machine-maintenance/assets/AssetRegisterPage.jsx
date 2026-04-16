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

const AssetRegisterPage = () => {
  const navigate = useNavigate();
  const config = pageFormData.assetRegister;

  const submitHandler = async (payload) => {
    const row = {
      id: Date.now(),
      assetCode: valueOrNA(payload.assetCode),
      assetName: valueOrNA(payload.assetName),
      category: valueOrNA(payload.category),
      serialNumber: valueOrNA(payload.serialNumber),
      department: valueOrNA(payload.department),
      installDate: valueOrNA(payload.commissioningDate || payload.purchaseDate),
      status: valueOrNA(payload.status || "Running"),
    };

    prependStoredRow(STORAGE_KEYS.assets, row, "assetCode", []);
    return row;
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      submitHandler={submitHandler}
      onSuccess={() => navigate("/machine-maintenance/assets/list")}
    />
  );
};

export default AssetRegisterPage;
