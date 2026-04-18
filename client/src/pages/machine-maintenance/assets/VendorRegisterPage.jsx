import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createVendor,
  getConfiguredContractTypes,
  getConfiguredStatuses,
  getVendorById,
  mapVendorFormValues,
  updateVendor,
} from "../components/machineMaintenanceApi.js";

const VendorRegisterPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const baseConfig = pageFormData.vendorRegister;

  const [initialValues, setInitialValues] = useState(null);
  const [loadingInitialValues, setLoadingInitialValues] = useState(false);
  const [loadingDropdownOptions, setLoadingDropdownOptions] = useState(false);

  const [contractTypeOptions, setContractTypeOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        setLoadingDropdownOptions(true);

        const [contractTypes, statuses] = await Promise.all([
          getConfiguredContractTypes(),
          getConfiguredStatuses(),
        ]);

        setContractTypeOptions(contractTypes);
        setStatusOptions(statuses);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
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

  const config = useMemo(
    () => ({
      ...baseConfig,
      fields: baseConfig.fields.map((field) => {
        if (field.name === "contractType") {
          return {
            ...field,
            select: true,
            options: contractTypeOptions,
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
    [baseConfig, contractTypeOptions, statusOptions],
  );

  const submitHandler = async (payload) => {
    return id ? updateVendor(id, payload) : createVendor(payload);
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      primaryActionLabel={id ? "Update" : config.primaryActionLabel}
      successMessage={
        id ? "Vendor updated successfully." : config.successMessage
      }
      submitHandler={submitHandler}
      initialValues={initialValues}
      loadingInitialValues={loadingInitialValues || loadingDropdownOptions}
      onSuccess={() => navigate("/machine-maintenance/vendors/list")}
    />
  );
};

export default VendorRegisterPage;
