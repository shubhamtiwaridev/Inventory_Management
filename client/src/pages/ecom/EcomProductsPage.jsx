import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import MachineMaintenanceListView from "../machine-maintenance/components/MachineMaintenanceListView.jsx";
import { ecomSidebarItems } from "../../components/sidebars/ecomSidebarItems.jsx";
import { useAuth } from "../../store/AuthContext.jsx";
import {
  brand,
  filledActionButtonSx,
  outlinedActionButtonSx,
  textFieldStyles,
} from "../machine-maintenance/components/machineMaintenanceUi.jsx";
import {
  getEcomProducts,
  createEcomProduct,
  updateEcomProduct,
  deleteEcomProduct,
  importEcomProductsExcel,
} from "./components/ecomProductsApi.js";
import { ecomProductsConfig } from "./components/ecomProductsConfig.js";
import {
  getFirstAccessibleSidebarPath,
  isSidebarFeatureVisible,
} from "../../utils/permissions.js";
import { Navigate } from "react-router-dom";

const getDefaultValues = (config) =>
  Object.fromEntries((config.fields || []).map((field) => [field.name, ""]));

const upsertRowAtTop = (rows = [], nextRow) => [
  nextRow,
  ...rows.filter((row) => row.id !== nextRow.id),
];

const EcomProductsPage = () => {
  const { user } = useAuth();
  const config = ecomProductsConfig;

  const [rows, setRows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState(() => getDefaultValues(config));
  const [formErrors, setFormErrors] = useState({});
  const [loadingRows, setLoadingRows] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const permissionConfig = { path: "/ecom", label: "Ecom Products" };

  const canAccessFeature = isSidebarFeatureVisible(
    user,
    permissionConfig.path,
    permissionConfig.label,
  );

  const showFeedback = useCallback(
    (type, message) => setFeedback({ type, message }),
    [],
  );

  const fetchRows = useCallback(
    async ({ skipCache = false } = {}) => {
      try {
        setLoadingRows(true);
        const items = await getEcomProducts({ skipCache });
        setRows(items);
      } catch (error) {
        showFeedback("error", error.message || "Failed to load products");
      } finally {
        setLoadingRows(false);
      }
    },
    [showFeedback],
  );

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  if (!canAccessFeature) {
    return (
      <Navigate
        to={getFirstAccessibleSidebarPath(ecomSidebarItems, user)}
        replace
      />
    );
  }

  const openAddDialog = () => {
    setEditingRow(null);
    setFormValues(getDefaultValues(config));
    setFormErrors({});
    try {
      const active = document?.activeElement;
      if (active && typeof active.blur === "function") active.blur();
    } catch {
      // ignore
    }

    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues(
      Object.fromEntries(
        (config.fields || []).map((f) => [f.name, row[f.name] ?? ""]),
      ),
    );
    setFormErrors({});
    try {
      const active = document?.activeElement;
      if (active && typeof active.blur === "function") active.blur();
    } catch {
      // ignore
    }

    setDialogOpen(true);
  };

  const closeDialog = () => {
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
      await deleteEcomProduct(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      showFeedback("success", "Product deleted successfully.");
    } catch (error) {
      showFeedback("error", error.message || "Failed to delete product");
    }
  };

  const handleRefresh = async () => fetchRows({ skipCache: true });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    (config.fields || []).forEach((field) => {
      if (field.required && !String(formValues[field.name] || "").trim()) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    const timestamp = new Date().toISOString();

    try {
      if (editingRow) {
        const updated = await updateEcomProduct(editingRow.id, {
          ...formValues,
          updatedAt: timestamp,
        });
        if (updated) {
          setRows((prev) =>
            prev.map((r) => (r.id === editingRow.id ? updated : r)),
          );
        }
        showFeedback("success", "Product updated successfully.");
      } else {
        const created = await createEcomProduct({
          ...formValues,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        if (created) setRows((prev) => upsertRowAtTop(prev, created));
        showFeedback("success", "Product created successfully.");
      }

      closeDialog();
    } catch (error) {
      showFeedback("error", error.message || "Failed to save product");
    }
  };

  const handleOpenImport = () => {
    setFeedback({ type: "", message: "" });
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const lowerName = String(file.name || "").toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
      showFeedback("error", "Please choose a valid .xlsx or .xls file.");
      return;
    }

    try {
      setImporting(true);
      setFeedback({ type: "", message: "" });
      const response = await importEcomProductsExcel(file);
      if (Array.isArray(response?.data)) setRows(response.data);
      else await fetchRows({ skipCache: true });

      showFeedback("success", "Import completed.");
    } catch (error) {
      showFeedback("error", error.message || "Failed to import Excel data");
    } finally {
      setImporting(false);
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={handleImportFileChange}
      />

      <MachineMaintenanceListView
        title={config.title}
        columns={config.columns}
        rows={rows}
        loading={loadingRows}
        onRefresh={handleRefresh}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        primaryButtonLabel={config.primaryButtonLabel}
        onPrimaryAction={openAddDialog}
        showDownloadButton={false}
        toolbarActions={
          <Button
            variant="contained"
            startIcon={<UploadFileRoundedIcon />}
            onClick={handleOpenImport}
            disabled={importing || loadingRows}
            sx={filledActionButtonSx}
          >
            {importing ? "Importing..." : "Import Excel"}
          </Button>
        }
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
            }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
              {(config.fields || []).map((field, index) => {
                const isMulti = field.multiline;

                return (
                  <TextField
                    key={field.name}
                    label={field.label}
                    value={formValues[field.name] ?? ""}
                    onChange={(e) =>
                      handleFieldChange(field.name, e.target.value)
                    }
                    required={field.required}
                    error={Boolean(formErrors[field.name])}
                    helperText={formErrors[field.name] || " "}
                    multiline={isMulti}
                    minRows={field.minRows}
                    type={field.type === "number" ? "number" : undefined}
                    autoFocus={index === 0}
                    fullWidth
                    sx={textFieldStyles}
                    select={Boolean(field.type === "select")}
                  >
                    {field.type === "select" && Array.isArray(field.options)
                      ? field.options.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))
                      : null}
                  </TextField>
                );
              })}
            </Box>
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

export default EcomProductsPage;
