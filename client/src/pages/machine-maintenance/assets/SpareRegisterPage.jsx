import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createSpare,
  getConfiguredStatuses,
  getConfiguredUnitsOfMeasure,
  getRegisteredMachineOptions,
  getSpareById,
  getVendors,
  mapSpareFormValues,
  updateSpare,
} from "../components/machineMaintenanceApi.js";

const getVendorOptions = (response) => {
  const records = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  const optionMap = new Map();

  records.forEach((item) => {
    const vendorName = String(item?.vendorName || "").trim();

    if (!vendorName) return;

    optionMap.set(vendorName, {
      label: vendorName,
      value: vendorName,
    });
  });

  return Array.from(optionMap.values());
};

const SpareRegisterPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const baseConfig = pageFormData.spareRegister;

  const [initialValues, setInitialValues] = useState(null);
  const [loadingInitialValues, setLoadingInitialValues] = useState(false);
  const [loadingDropdownOptions, setLoadingDropdownOptions] = useState(false);

  const [machineOptions, setMachineOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        setLoadingDropdownOptions(true);

        const [machines, units, statuses, vendorsResponse] = await Promise.all([
          getRegisteredMachineOptions(),
          getConfiguredUnitsOfMeasure(),
          getConfiguredStatuses(),
          getVendors(),
        ]);

        setMachineOptions(machines);
        setUnitOptions(units);
        setStatusOptions(statuses);
        setVendorOptions(getVendorOptions(vendorsResponse));
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

  const config = useMemo(
    () => ({
      ...baseConfig,
      fields: baseConfig.fields.map((field) => {
        if (field.name === "linkedMachine") {
          return {
            ...field,
            select: true,
            options: machineOptions,
          };
        }

        if (field.name === "vendor") {
          return {
            ...field,
            label: "Supplier",
            select: true,
            options: vendorOptions,
          };
        }

        if (field.name === "unit") {
          return {
            ...field,
            select: true,
            options: unitOptions,
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
    [baseConfig, machineOptions, vendorOptions, unitOptions, statusOptions],
  );

  const submitHandler = async (payload) => {
    return id ? updateSpare(id, payload) : createSpare(payload);
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      primaryActionLabel={id ? "Update" : config.primaryActionLabel}
      successMessage={
        id ? "Spare updated successfully." : config.successMessage
      }
      submitHandler={submitHandler}
      initialValues={initialValues}
      loadingInitialValues={loadingInitialValues || loadingDropdownOptions}
      onSuccess={() => navigate("/machine-maintenance/spare-master/list")}
    />
  );
};

export default SpareRegisterPage;
