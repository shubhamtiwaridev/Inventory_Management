import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Navigate, useParams } from "react-router-dom";
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
import {
  cloneInventoryMasterRows,
  inventoryMasterConfigs,
} from "./inventoryGoodsListData.js";
import {
  createGoodsListItem,
  deleteGoodsListItem,
  getGoodsListItems,
  importGoodsListExcel,
  updateGoodsListItem,
} from "./inventoryGoodsListApi.js";

const configKeyMap = {
  list: "goodsList",
  units: "units",
  class: "class",
  color: "color",
  brand: "brand",
  specs: "specs",
  origin: "origin",
};

const permissionConfigMap = {
  list: {
    path: "/inventory/goodslist/list",
    label: "Goods List",
  },
  units: {
    path: "/inventory/goodslist/units",
    label: "Unit",
  },
  class: {
    path: "/inventory/goodslist/class",
    label: "Class",
  },
  color: {
    path: "/inventory/goodslist/color",
    label: "Color",
  },
  brand: {
    path: "/inventory/goodslist/brand",
    label: "Brand",
  },
  specs: {
    path: "/inventory/goodslist/specs",
    label: "Specs",
  },
  origin: {
    path: "/inventory/goodslist/origin",
    label: "Origin",
  },
};

const GOODS_LIST_DERIVED_CONFIGS = [
  { key: "units", field: "goodsUnit" },
  { key: "class", field: "goodsClass" },
  { key: "color", field: "goodsColor" },
  { key: "brand", field: "goodsBrand" },
  { key: "specs", field: "goodsSpecs" },
  { key: "origin", field: "goodsOrigin" },
];

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

const buildDerivedRowsFromGoodsItems = (goodsItems = []) =>
  GOODS_LIST_DERIVED_CONFIGS.reduce((acc, { key, field }) => {
    const seenValues = new Set();

    acc[key] = goodsItems.reduce((rows, item, index) => {
      const value = String(item?.[field] || "").trim();

      if (!value) return rows;

      const normalizedValue = normalizeDuplicateValue(value);

      if (seenValues.has(normalizedValue)) return rows;
      seenValues.add(normalizedValue);

      rows.push({
        id: `${key}-${normalizedValue}-${index}`,
        [field]: value,
        createdBy: item?.createdBy || "System",
        createdAt: item?.createdAt || "-",
        updatedAt: item?.updatedAt || "-",
      });

      return rows;
    }, []);

    return acc;
  }, {});

const InventoryMasterListPage = () => {
  const { user } = useAuth();
  const { tabKey } = useParams();
  const configKey = configKeyMap[tabKey] || "goodsList";
  const isGoodsListTab = configKey === "goodsList";
  const permissionConfig =
    permissionConfigMap[tabKey] || permissionConfigMap.list;
  const config = inventoryMasterConfigs[configKey];

  const [masterRows, setMasterRows] = useState(() =>
    cloneInventoryMasterRows(),
  );
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

  const rows = masterRows[configKey] || [];

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
  }, []);

  const syncGoodsInventoryRows = useCallback((goodsItems = []) => {
    setMasterRows((prev) => ({
      ...prev,
      goodsList: goodsItems,
      ...buildDerivedRowsFromGoodsItems(goodsItems),
    }));
  }, []);

  const fetchGoodsRows = useCallback(async () => {
    try {
      setLoadingRows(true);
      const goodsItems = await getGoodsListItems();
      syncGoodsInventoryRows(goodsItems);
      setFeedback((prev) => (prev.type === "error" ? { type: "", message: "" } : prev));
    } catch (error) {
      showFeedback(
        "error",
        error.message || "Failed to load goods list records",
      );
    } finally {
      setLoadingRows(false);
    }
  }, [showFeedback, syncGoodsInventoryRows]);

  const optionMap = useMemo(() => {
    const options = {};

    (config.fields || []).forEach((field) => {
      if (!field.selectFrom) return;

      const sourceConfig = inventoryMasterConfigs[field.selectFrom];
      const sourceRows = masterRows[field.selectFrom] || [];
      const valueKey = sourceConfig?.primaryValueKey;

      options[field.name] = sourceRows
        .map((row) => row[valueKey])
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index);
    });

    return options;
  }, [config.fields, masterRows]);

  useEffect(() => {
    fetchGoodsRows();
  }, [fetchGoodsRows]);

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
    if (isGoodsListTab) {
      try {
        await deleteGoodsListItem(row.id);
        await fetchGoodsRows();
        showFeedback("success", "Goods item deleted successfully.");
      } catch (error) {
        showFeedback("error", error.message || "Failed to delete goods item");
      }

      return;
    }

    setMasterRows((prev) => ({
      ...prev,
      [configKey]: (prev[configKey] || []).filter((item) => item.id !== row.id),
    }));
  };

  const handleRefresh = async () => {
    if (isGoodsListTab) {
      await fetchGoodsRows();
      return;
    }

    setMasterRows((prev) => ({
      ...prev,
      [configKey]: cloneInventoryMasterRows()[configKey] || [],
    }));
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

    if (isGoodsListTab) {
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
    }

    const timestamp = getNowStamp();

    if (isGoodsListTab) {
      try {
        if (editingRow) {
          await updateGoodsListItem(editingRow.id, formValues);
          showFeedback("success", "Goods item updated successfully.");
        } else {
          await createGoodsListItem(formValues);
          showFeedback("success", "Goods item created successfully.");
        }

        await fetchGoodsRows();
        closeDialog();
      } catch (error) {
        showFeedback("error", error.message || "Failed to save goods item");
      }

      return;
    }

    if (editingRow) {
      setMasterRows((prev) => ({
        ...prev,
        [configKey]: (prev[configKey] || []).map((item) =>
          item.id === editingRow.id
            ? {
                ...item,
                ...formValues,
                updatedAt: timestamp,
              }
            : item,
        ),
      }));
    } else {
      const newRow = {
        id: Date.now(),
        ...formValues,
        createdBy: "Admin",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      setMasterRows((prev) => ({
        ...prev,
        [configKey]: [newRow, ...(prev[configKey] || [])],
      }));
    }

    closeDialog();
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
      await fetchGoodsRows();

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
        toolbarActions={
          isGoodsListTab ? (
            <Button
              variant="contained"
              startIcon={<UploadFileRoundedIcon />}
              onClick={handleOpenImport}
              disabled={importing || loadingRows}
              sx={filledActionButtonSx}
            >
              {importing ? "Importing..." : "Import Excel"}
            </Button>
          ) : null
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
                const isSelect = Boolean(field.selectFrom);
                const fieldOptions = optionMap[field.name] || [];
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
                    select={isSelect}
                    multiline={isGoodsDesc ? false : field.multiline}
                    minRows={isGoodsDesc ? undefined : field.minRows}
                    fullWidth
                    sx={textFieldStyles}
                  >
                    {isSelect
                      ? fieldOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
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

export default InventoryMasterListPage;
