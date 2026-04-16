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

const VendorRegisterPage = () => {
  const navigate = useNavigate();
  const config = pageFormData.vendorRegister;

  const submitHandler = async (payload) => {
    const row = {
      id: Date.now(),
      vendorCode: valueOrNA(payload.vendorCode),
      vendorName: valueOrNA(payload.vendorName),
      contactPerson: valueOrNA(payload.contactPerson),
      phone: valueOrNA(payload.phone),
      email: valueOrNA(payload.email),
      city: valueOrNA(payload.city),
      contractType: valueOrNA(payload.contractType),
      status: valueOrNA(payload.status || "Active"),
    };

    prependStoredRow(STORAGE_KEYS.vendors, row, "vendorCode", []);
    return row;
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      submitHandler={submitHandler}
      onSuccess={() => navigate("/machine-maintenance/vendors/list")}
    />
  );
};

export default VendorRegisterPage;
