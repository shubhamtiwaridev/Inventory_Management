import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createAsset,
  getAssetById,
  mapAssetFormValues,
  updateAsset,
} from "../components/machineMaintenanceApi.js";

const buildPayload = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    formData.append(key, value);
  });

  return formData;
};

const AssetRegisterPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const config = pageFormData.assetRegister;
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
        const response = await getAssetById(id);
        setInitialValues(mapAssetFormValues(response?.data || {}));
      } catch (error) {
        alert(error.message || "Failed to load asset details");
      } finally {
        setLoadingInitialValues(false);
      }
    };

    loadRecord();
  }, [id]);

  const submitHandler = async (payload) => {
    const formData = buildPayload(payload);
    return id ? updateAsset(id, formData) : createAsset(formData);
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      title={id ? "Machine Registration" : config.title}
      primaryActionLabel={id ? "Update" : config.primaryActionLabel}
      successMessage={id ? "Machine updated successfully." : config.successMessage}
      submitHandler={submitHandler}
      initialValues={initialValues}
      loadingInitialValues={loadingInitialValues}
      onSuccess={() => navigate("/machine-maintenance/assets/list")}
    />
  );
};

export default AssetRegisterPage;