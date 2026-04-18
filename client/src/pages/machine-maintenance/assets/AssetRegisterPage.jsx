import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createAsset,
  getAssetById,
  getConfiguredCriticalLevels,
  getConfiguredDepartments,
  getConfiguredPlantSites,
  getConfiguredStatuses,
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
  const baseConfig = pageFormData.assetRegister;

  const [initialValues, setInitialValues] = useState(null);
  const [loadingInitialValues, setLoadingInitialValues] = useState(false);
  const [loadingDropdownOptions, setLoadingDropdownOptions] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [plantOptions, setPlantOptions] = useState([]);
  const [criticalLevelOptions, setCriticalLevelOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        setLoadingDropdownOptions(true);

        const [departments, plants, criticalLevels, statuses] =
          await Promise.all([
            getConfiguredDepartments(),
            getConfiguredPlantSites(),
            getConfiguredCriticalLevels(),
            getConfiguredStatuses(),
          ]);

        setDepartmentOptions(departments);
        setPlantOptions(plants);
        setCriticalLevelOptions(criticalLevels);
        setStatusOptions(statuses);
      } catch (error) {
        console.error("Failed to load configure dropdown data:", error);
      } finally {
        setLoadingDropdownOptions(false);
      }
    };

    loadDropdownOptions();
  }, []);

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

  const config = useMemo(
    () => ({
      ...baseConfig,
      fields: baseConfig.fields.map((field) => {
        if (field.name === "plant") {
          return {
            ...field,
            select: true,
            options: plantOptions,
          };
        }

        if (field.name === "department") {
          return {
            ...field,
            select: true,
            options: departmentOptions,
          };
        }

        if (field.name === "criticality") {
          return {
            ...field,
            select: true,
            options: criticalLevelOptions,
          };
        }

        if (field.name === "status") {
          return {
            ...field,
            select: true,
            options: statusOptions,
          };
        }

        return field;
      }),
    }),
    [
      baseConfig,
      plantOptions,
      departmentOptions,
      criticalLevelOptions,
      statusOptions,
    ],
  );

  const submitHandler = async (payload) => {
    const formData = buildPayload(payload);
    return id ? updateAsset(id, formData) : createAsset(formData);
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      title={id ? "Machine Registration" : config.title}
      primaryActionLabel={id ? "Update" : config.primaryActionLabel}
      successMessage={
        id ? "Machine updated successfully." : config.successMessage
      }
      submitHandler={submitHandler}
      initialValues={initialValues}
      loadingInitialValues={loadingInitialValues || loadingDropdownOptions}
      onSuccess={() => navigate("/machine-maintenance/assets/list")}
    />
  );
};

export default AssetRegisterPage;
