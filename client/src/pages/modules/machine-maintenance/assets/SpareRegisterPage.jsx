import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createSpare,
  getSpareById,
  mapSpareFormValues,
  updateSpare,
} from "../components/machineMaintenanceApi.js";

const SpareRegisterPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const config = pageFormData.spareRegister;
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
        const response = await getSpareById(id);
        setInitialValues(mapSpareFormValues(response?.data || {}));
      } catch (error) {
        alert(error.message || "Failed to load spare details");
      } finally {
        setLoadingInitialValues(false);
      }
    };

    loadRecord();
  }, [id]);

  const submitHandler = async (payload) => {
    return id ? updateSpare(id, payload) : createSpare(payload);
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      primaryActionLabel={id ? "Update" : config.primaryActionLabel}
      successMessage={id ? "Spare updated successfully." : config.successMessage}
      submitHandler={submitHandler}
      initialValues={initialValues}
      loadingInitialValues={loadingInitialValues}
      onSuccess={() => navigate("/machine-maintenance/spare-master/list")}
    />
  );
};

export default SpareRegisterPage;