import { useCallback, useEffect, useRef, useState } from "react";
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
import { Navigate } from "react-router-dom";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import MachineMaintenanceListView from "../../machine-maintenance/components/MachineMaintenanceListView.jsx";
import { inventorySidebarItems } from "../../../components/sidebars/inventorySidebarItems.jsx";
import { useAuth } from "../../../store/AuthContext.jsx";
import {
  brand,
  filledActionButtonSx,
  outlinedActionButtonSx,
  textFieldStyles,
} from "../../machine-maintenance/components/machineMaintenanceUi.jsx";
import {
  getFirstAccessibleSidebarPath,
  isSidebarFeatureVisible,
} from "../../../utils/permissions.js";
import { inventoryMasterConfigs } from "./inventoryGoodsListData.js";
import {
  createGoodsListItem,
  deleteGoodsListItem,
  getGoodsListItems,
  importGoodsListExcel,
  updateGoodsListItem,
} from "./inventoryGoodsListApi.js";

const permissionConfig = {
  path: "/inventory/goodslist/list",
  label: "Goods List",
};

const getNowStamp = () => {
  const date = new Date();
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getDefaultValues = (config) =>
  Object.fromEntries((config.fields || []).map((field) => [field.name, ""]));

const hiddenScrollbarSx = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
    width: 0,
    height: 0,
  },
};

const normalizeDuplicateValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const findDuplicateGoodsRow = (rows = [], payload = {}, editingId = null) => {
  const keys = [
    payload.goodsCode && ["goodsCode", normalizeDuplicateValue(payload.goodsCode)],
    payload.goodsSku && ["goodsSku", normalizeDuplicateValue(payload.goodsSku)],
    payload.goodsBarcode && [
      "goodsBarcode",
      normalizeDuplicateValue(payload.goodsBarcode),
    ],
    payload.goodsDesc && ["goodsDesc", normalizeDuplicateValue(payload.goodsDesc)],
  ].filter(Boolean);

  return rows.find((row) => {
    if (editingId && row.id === editingId) return false;

    return keys.some(
      ([field, value]) => normalizeDuplicateValue(row[field]) === value,
    );
  });
};

const InventoryMasterListPage = () => {
  const { user } = useAuth();
  const config = inventoryMasterConfigs.goodsList;

  const [rows, setRows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState(() => getDefaultValues(config));
  const [formErrors, setFormErrors] = useState({});
  const [loadingRows, setLoadingRows] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const canAccessFeature = isSidebarFeatureVisible(
    user,
    permissionConfig.path,
    permissionConfig.label,
  );

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
  }, []);

  const fetchGoodsRows = useCallback(async ({ skipCache = false } = {}) => {
    try {
      setLoadingRows(true);
      const goodsItems = await getGoodsListItems({ skipCache });
      setRows(goodsItems);
      setFeedback((prev) =>
        prev.type === "error" ? { type: "", message: "" } : prev,
      );
    } catch (error) {
      showFeedback(
        "error",
        error.message || "Failed to load goods list records",
      );
    } finally {
      setLoadingRows(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    fetchGoodsRows();
  }, [fetchGoodsRows]);

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

  if (!canAccessFeature) {
    return (
      <Navigate
        to={getFirstAccessibleSidebarPath(inventorySidebarItems, user)}
        replace
      />
    );
  }

  const openAddDialog = () => {
    setEditingRow(null);
    setFormValues(getDefaultValues(config));
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    setEditingRow(row);
    setFormValues(
      Object.fromEntries(
        (config.fields || []).map((field) => [
          field.name,
          row[field.name] ?? "",
        ]),
      ),
    );
    setFormErrors({});
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
      await deleteGoodsListItem(row.id);
      await fetchGoodsRows({ skipCache: true });
      showFeedback("success", "Goods item deleted successfully.");
    } catch (error) {
      showFeedback("error", error.message || "Failed to delete goods item");
    }
  };

  const handleRefresh = async () => {
    await fetchGoodsRows({ skipCache: true });
  };

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

    const duplicateRow = findDuplicateGoodsRow(
      rows,
      formValues,
      editingRow?.id || null,
    );

    if (duplicateRow) {
      showFeedback(
        "error",
        "Duplicate goods item found. Goods Code, SKU, Barcode, and Item Name must stay unique.",
      );
      return;
    }

    const timestamp = getNowStamp();

    try {
      if (editingRow) {
        await updateGoodsListItem(editingRow.id, {
          ...formValues,
          updatedAt: timestamp,
        });
        showFeedback("success", "Goods item updated successfully.");
      } else {
        await createGoodsListItem({
          ...formValues,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        showFeedback("success", "Goods item created successfully.");
      }

      await fetchGoodsRows({ skipCache: true });
      closeDialog();
    } catch (error) {
      showFeedback("error", error.message || "Failed to save goods item");
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
      const response = await importGoodsListExcel(file);
      const summary = response?.summary || {};
      const importedCount = summary.importedCount || 0;
      const skippedDuplicates = summary.skippedDuplicates || 0;
      const skippedInvalid = summary.skippedInvalid || 0;
      await fetchGoodsRows({ skipCache: true });

      showFeedback(
        "success",
        `Imported ${importedCount} record(s). Skipped duplicates: ${skippedDuplicates}, invalid: ${skippedInvalid}.`,
      );
    } catch (error) {
      showFeedback(
        "error",
        error.message || "Failed to import Excel data into goods list",
      );
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
            height: { xs: "92vh", sm: "86vh" },
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
            minHeight: 0,
            flex: 1,
            overflow: "hidden",
          }}
        >
          <DialogContent
            dividers={false}
            sx={{
              pt: 2.5,
              pb: 3,
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              ...hiddenScrollbarSx,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 2,
              }}
            >
              {(config.fields || []).map((field) => {
                const isGoodsDesc = field.name === "goodsDesc";

                return (
                  <TextField
                    key={field.name}
                    label={field.label}
                    value={formValues[field.name] ?? ""}
                    onChange={(event) =>
                      handleFieldChange(field.name, event.target.value)
                    }
                    required={field.required}
                    error={Boolean(formErrors[field.name])}
                    helperText={formErrors[field.name] || " "}
                    multiline={isGoodsDesc ? false : field.multiline}
                    minRows={isGoodsDesc ? undefined : field.minRows}
                    fullWidth
                    sx={textFieldStyles}
                  />
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

export default InventoryMasterListPage;
