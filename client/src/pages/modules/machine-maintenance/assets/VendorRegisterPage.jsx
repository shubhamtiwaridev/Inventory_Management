import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createVendor,
  getVendorById,
  mapVendorFormValues,
  updateVendor,
} from "../components/machineMaintenanceApi.js";

const VendorRegisterPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const config = pageFormData.vendorRegister;
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
        const response = await getVendorById(id);
        setInitialValues(mapVendorFormValues(response?.data || {}));
      } catch (error) {
        alert(error.message || "Failed to load vendor details");
      } finally {
        setLoadingInitialValues(false);
      }
    };

    loadRecord();
  }, [id]);

  const submitHandler = async (payload) => {
    return id ? updateVendor(id, payload) : createVendor(payload);
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      primaryActionLabel={id ? "Update" : config.primaryActionLabel}
      successMessage={id ? "Vendor updated successfully." : config.successMessage}
      submitHandler={submitHandler}
      initialValues={initialValues}
      loadingInitialValues={loadingInitialValues}
      onSuccess={() => navigate("/machine-maintenance/vendors/list")}
    />
  );
};

export default VendorRegisterPage;