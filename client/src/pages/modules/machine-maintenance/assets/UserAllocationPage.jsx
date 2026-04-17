import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MachineMaintenanceFormView from "../components/MachineMaintenanceFormView.jsx";
import { pageFormData } from "../components/machineMaintenanceUi.jsx";
import {
  createUserAllocation,
  getUserAllocationById,
  mapUserAllocationFormValues,
  updateUserAllocation,
} from "../components/machineMaintenanceApi.js";

const UserAllocationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const config = pageFormData.userAllocation;
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
        const response = await getUserAllocationById(id);
        setInitialValues(mapUserAllocationFormValues(response?.data || {}));
      } catch (error) {
        alert(error.message || "Failed to load user allocation details");
      } finally {
        setLoadingInitialValues(false);
      }
    };

    loadRecord();
  }, [id]);

  const submitHandler = async (payload) => {
    return id ? updateUserAllocation(id, payload) : createUserAllocation(payload);
  };

  return (
    <MachineMaintenanceFormView
      {...config}
      primaryActionLabel={id ? "Update" : config.primaryActionLabel}
      successMessage={
        id ? "User allocation updated successfully." : config.successMessage
      }
      submitHandler={submitHandler}
      initialValues={initialValues}
      loadingInitialValues={loadingInitialValues}
      onSuccess={() => navigate("/machine-maintenance/user-allocation/list")}
    />
  );
};

export default UserAllocationPage;