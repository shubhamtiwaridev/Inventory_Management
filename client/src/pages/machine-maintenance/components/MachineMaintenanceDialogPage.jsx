import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Dialog, DialogContent } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MachineMaintenanceFormView from "./MachineMaintenanceFormView.jsx";
import MachineMaintenanceListView from "./MachineMaintenanceListView.jsx";

const getResponseRecords = (response) =>
  Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

const hiddenScrollbarSx = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
    width: 0,
    height: 0,
  },
};

const defaultBuildFormConfig = ({ baseConfig }) => baseConfig;
const defaultBuildSubmitPayload = (payload) => payload;

const blurActiveElement = () => {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
};

const MachineMaintenanceDialogPage = ({
  listTitle,
  listConfig,
  formConfig,
  listPath,
  getList,
  mapListRow,
  deleteItem,
  getItemById,
  createItem,
  updateItem,
  mapFormValues,
  loadDropdownData,
  buildFormConfig = defaultBuildFormConfig,
  onFieldChange,
  buildSubmitPayload = defaultBuildSubmitPayload,
  createSuccessMessage,
  updateSuccessMessage,
  fetchErrorMessage,
  deleteErrorMessage,
  primaryButtonLabel,
  dialogMaxWidth = "sm",
  dialogWidth = { xs: "calc(100% - 24px)", sm: "496px" },
  dialogHeight = { xs: "92vh", sm: "86vh" },
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [rowsError, setRowsError] = useState("");

  const [dropdownData, setDropdownData] = useState({});
  const [dropdownError, setDropdownError] = useState("");
  const [loadingDropdownOptions, setLoadingDropdownOptions] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [loadingInitialValues, setLoadingInitialValues] = useState(false);

  const fetchRows = useCallback(async () => {
    try {
      setLoadingRows(true);
      setRowsError("");
      const response = await getList();
      const records = getResponseRecords(response);
      setRows(records.map(mapListRow));
    } catch (error) {
      setRowsError(
        error.message || fetchErrorMessage || "Failed to fetch records",
      );
    } finally {
      setLoadingRows(false);
    }
  }, [fetchErrorMessage, getList, mapListRow]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    let isMounted = true;

    if (!loadDropdownData) {
      setDropdownData({});
      setDropdownError("");
      return undefined;
    }

    if (!dialogOpen) {
      return undefined;
    }

    const loadOptions = async () => {
      try {
        setLoadingDropdownOptions(true);
        setDropdownError("");
        const nextData = await loadDropdownData();
        if (isMounted) {
          setDropdownData(nextData || {});
        }
      } catch (error) {
        if (isMounted) {
          setDropdownError(error.message || "Failed to load dropdown data");
        }
      } finally {
        if (isMounted) {
          setLoadingDropdownOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [dialogOpen, loadDropdownData]);

  useEffect(() => {
    const isNonListRoute = location.pathname !== listPath;

    if (isNonListRoute || id) {
      blurActiveElement();
      setDialogOpen(true);
      setActiveId(id || null);
      return;
    }

    setActiveId(null);
  }, [id, listPath, location.pathname]);

  useEffect(() => {
    let isMounted = true;

    if (!dialogOpen) {
      return undefined;
    }

    if (!activeId) {
      setInitialValues(null);
      return undefined;
    }

    const loadRecord = async () => {
      try {
        setLoadingInitialValues(true);
        const response = await getItemById(activeId);
        if (isMounted) {
          setInitialValues(mapFormValues(response?.data || {}));
        }
      } catch (error) {
        if (isMounted) {
          alert(error.message || "Failed to load record details");
        }
      } finally {
        if (isMounted) {
          setLoadingInitialValues(false);
        }
      }
    };

    loadRecord();

    return () => {
      isMounted = false;
    };
  }, [activeId, dialogOpen, getItemById, mapFormValues]);

  const resolvedFormConfig = useMemo(
    () =>
      buildFormConfig({
        baseConfig: formConfig,
        dropdownData,
        initialValues,
      }),
    [buildFormConfig, dropdownData, formConfig, initialValues],
  );

  const handleOpenCreate = () => {
    blurActiveElement();
    setActiveId(null);
    setInitialValues(null);
    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    blurActiveElement();
    setActiveId(row.id);
    setDialogOpen(true);
  };

  const handleDelete = async (row) => {
    try {
      await deleteItem(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
    } catch (error) {
      alert(error.message || deleteErrorMessage || "Failed to delete record");
    }
  };

  const handleCloseDialog = () => {
    blurActiveElement();
    setDialogOpen(false);
    setActiveId(null);
    setInitialValues(null);

    if (location.pathname !== listPath) {
      navigate(listPath, { replace: true });
    }
  };

  const submitHandler = async (payload) => {
    const nextPayload = buildSubmitPayload(payload);

    if (activeId) {
      return updateItem(activeId, nextPayload);
    }

    return createItem(nextPayload);
  };

  const handleSuccess = async () => {
    await fetchRows();
    handleCloseDialog();
  };

  return (
    <>
      <MachineMaintenanceListView
        title={listTitle}
        columns={listConfig.columns}
        rows={rows}
        loading={loadingRows}
        error={rowsError}
        onRefresh={fetchRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        primaryButtonLabel={primaryButtonLabel}
        onPrimaryAction={handleOpenCreate}
      />

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth={dialogMaxWidth}
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            width: "100%",
            maxWidth: dialogWidth,
            height: dialogHeight,
            maxHeight: dialogHeight,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {dropdownError ? (
          <Alert severity="error" sx={{ mx: 2, mt: 2, flexShrink: 0 }}>
            {dropdownError}
          </Alert>
        ) : null}

        <DialogContent
          dividers={false}
          sx={{
            p: 0,
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            ...hiddenScrollbarSx,
          }}
        >
          <MachineMaintenanceFormView
            {...resolvedFormConfig}
            primaryActionLabel={
              activeId ? "Update" : resolvedFormConfig.primaryActionLabel
            }
            successMessage={
              activeId
                ? updateSuccessMessage
                : createSuccessMessage || resolvedFormConfig.successMessage
            }
            submitHandler={submitHandler}
            initialValues={initialValues}
            loadingInitialValues={
              loadingInitialValues || loadingDropdownOptions
            }
            onFieldChange={
              onFieldChange
                ? (payload) => onFieldChange({ ...payload, dropdownData })
                : undefined
            }
            onSuccess={handleSuccess}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MachineMaintenanceDialogPage;
