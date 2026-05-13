import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
} from "@mui/material";
import MachineMaintenanceListView from "../../machine-maintenance/components/MachineMaintenanceListView.jsx";
import {
  brand,
  filledActionButtonSx,
  outlinedActionButtonSx,
  textFieldStyles,
} from "../../machine-maintenance/components/machineMaintenanceUi.jsx";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
} from "./inventoryWarehouseApi.js";

const hiddenScrollbarSx = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
    width: 0,
    height: 0,
  },
};

const blurActiveElement = () => {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
};

const defaultFormValues = {
  warehouseCode: "",
  warehouseName: "",
  location: "",
  description: "",
};

const InventoryWarehousePage = () => {
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState(defaultFormValues);
  const [formErrors, setFormErrors] = useState({});

  const columns = [
    { key: "warehouseCode", label: "Warehouse Code", width: 170, nowrap: true },
    { key: "warehouseName", label: "Warehouse Name", width: 220 },
    { key: "location", label: "Location", width: 220 },
    { key: "description", label: "Description", width: 260 },
    { key: "updatedAt", label: "Update Time", width: 180, nowrap: true },
  ];

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
  }, []);

  const loadRows = useCallback(async () => {
    try {
      setLoadingRows(true);
      const items = await getWarehouses();
      setRows(items);
      setFeedback((prev) =>
        prev.type === "error" ? { type: "", message: "" } : prev,
      );
    } catch (error) {
      showFeedback("error", error.message || "Failed to load warehouses");
    } finally {
      setLoadingRows(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    if (!feedback.message) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setFeedback({ type: "", message: "" });
    }, 10000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [feedback]);

  const openAddDialog = () => {
    blurActiveElement();
    setEditingRow(null);
    setFormValues(defaultFormValues);
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    blurActiveElement();
    setEditingRow(row);
    setFormValues({
      warehouseCode: row.warehouseCode || "",
      warehouseName: row.warehouseName || "",
      location: row.location || "",
      description: row.description || "",
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    blurActiveElement();
    setDialogOpen(false);
    setEditingRow(null);
    setFormErrors({});
  };

  const handleFieldChange = (fieldName, value) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
    setFormErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleDelete = async (row) => {
    try {
      await deleteWarehouse(row.id);
      await loadRows();
      showFeedback("success", "Warehouse deleted successfully.");
    } catch (error) {
      showFeedback("error", error.message || "Failed to delete warehouse");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!String(formValues.warehouseName || "").trim()) {
      nextErrors.warehouseName = "Warehouse Name is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    try {
      if (editingRow) {
        await updateWarehouse(editingRow.id, formValues);
        showFeedback("success", "Warehouse updated successfully.");
      } else {
        await createWarehouse(formValues);
        showFeedback("success", "Warehouse created successfully.");
      }

      await loadRows();
      closeDialog();
    } catch (error) {
      showFeedback("error", error.message || "Failed to save warehouse");
    }
  };

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }} spacing={1.5}>
      {feedback.message ? (
        <Alert
          severity={feedback.type === "success" ? "success" : "error"}
          onClose={() => setFeedback({ type: "", message: "" })}
          sx={{ borderRadius: 2.5, flexShrink: 0 }}
        >
          {feedback.message}
        </Alert>
      ) : null}

      <MachineMaintenanceListView
        title="Warehouses"
        columns={columns}
        rows={rows}
        loading={loadingRows}
        onRefresh={loadRows}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        primaryButtonLabel="New Warehouse"
        onPrimaryAction={openAddDialog}
        showDownloadButton={false}
      />

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            width: "100%",
            maxWidth: { xs: "calc(100% - 24px)", sm: "496px" },
            height: "auto",
            maxHeight: { xs: "92vh", sm: "86vh" },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: "0 1 auto",
            minHeight: 0,
          }}
        >
          <DialogContent
            dividers={false}
            sx={{
              pt: 2.5,
              pb: 3,
              flex: "0 1 auto",
              minHeight: "auto",
              overflowY: "auto",
              overflowX: "hidden",
              ...hiddenScrollbarSx,
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Warehouse Code"
                value={formValues.warehouseCode}
                onChange={(event) =>
                  handleFieldChange("warehouseCode", event.target.value)
                }
                fullWidth
                sx={textFieldStyles}
              />

              <TextField
                label="Warehouse Name"
                value={formValues.warehouseName}
                onChange={(event) =>
                  handleFieldChange("warehouseName", event.target.value)
                }
                required
                error={Boolean(formErrors.warehouseName)}
                helperText={formErrors.warehouseName || " "}
                fullWidth
                sx={textFieldStyles}
              />

              <TextField
                label="Location"
                value={formValues.location}
                onChange={(event) =>
                  handleFieldChange("location", event.target.value)
                }
                fullWidth
                sx={textFieldStyles}
              />

              <TextField
                label="Description"
                value={formValues.description}
                onChange={(event) =>
                  handleFieldChange("description", event.target.value)
                }
                multiline
                minRows={3}
                fullWidth
                sx={textFieldStyles}
              />
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              pb: 3,
              pt: 1.5,
              borderTop: `1px solid ${brand.border}`,
              flexShrink: 0,
            }}
          >
            <Stack direction="row" spacing={1.25}>
              <Button
                onClick={closeDialog}
                variant="outlined"
                sx={outlinedActionButtonSx}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={filledActionButtonSx}
              >
                {editingRow ? "Update" : "Save"}
              </Button>
            </Stack>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
};

export default InventoryWarehousePage;
