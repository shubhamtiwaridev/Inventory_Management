import { useCallback, useEffect, useMemo, useState } from "react";
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
import MachineMaintenanceListView from "../../machine-maintenance/components/MachineMaintenanceListView.jsx";
import {
  brand,
  filledActionButtonSx,
  outlinedActionButtonSx,
  textFieldStyles,
} from "../../machine-maintenance/components/machineMaintenanceUi.jsx";
import { getGoodsListItems } from "./inventoryGoodsListApi.js";
import {
  createInventoryTransaction,
  deleteInventoryTransaction,
  getAvailableOutboundItems,
  getInventoryTransactions,
  updateInventoryTransaction,
} from "./inventoryTransactionApi.js";
import { getWarehouses } from "./inventoryWarehouseApi.js";

const hiddenScrollbarSx = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
    width: 0,
    height: 0,
  },
};

const transactionConfigs = {
  inbound: {
    title: "Inbound",
    primaryButtonLabel: "New Inbound",
    partnerLabel: "Supplier",
    dateLabel: "Received Date",
    statusOptions: ["Received", "Pending"],
  },
  outbound: {
    title: "Outbound",
    primaryButtonLabel: "New Outbound",
    partnerLabel: "Issued To",
    dateLabel: "Dispatch Date",
    statusOptions: ["Delivered", "Pending"],
  },
};

const getDefaultFormValues = () => ({
  goodsItemId: "",
  warehouseId: "",
  partnerName: "",
  quantity: "",
  transactionDate: "",
  status: "Pending",
  notes: "",
});

const normalizeLookupValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const blurActiveElement = () => {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
};

const InventoryTransactionPage = ({ type = "inbound" }) => {
  const config = transactionConfigs[type] || transactionConfigs.inbound;
  const [rows, setRows] = useState([]);
  const [goodsItems, setGoodsItems] = useState([]);
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [availableOutboundItems, setAvailableOutboundItems] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState(getDefaultFormValues);
  const [formErrors, setFormErrors] = useState({});

  const goodsOptions = useMemo(
    () => {
      if (type === "outbound") {
        return availableOutboundItems.map((item) => ({
          id: item.goodsItemId,
          goodsCode: item.goodsCode || "",
          goodsDesc: item.goodsDesc || "",
          goodsUnit: item.unit || "",
          availableQuantity: item.currentQuantity || 0,
          label: [item.goodsCode, item.goodsDesc].filter(Boolean).join(" - "),
        }));
      }

      return goodsItems.map((item) => ({
        id: item.id,
        goodsCode: item.goodsCode || "",
        goodsDesc: item.goodsDesc || "",
        goodsUnit: item.goodsUnit || "",
        availableQuantity: "",
        label: [item.goodsCode, item.goodsDesc].filter(Boolean).join(" - "),
      }));
    },
    [availableOutboundItems, goodsItems, type],
  );

  const selectedGoodsItem = useMemo(
    () =>
      goodsOptions.find((item) => item.id === formValues.goodsItemId) || null,
    [formValues.goodsItemId, goodsOptions],
  );
  const warehouseOptions = useMemo(
    () => {
      if (type === "outbound") {
        const selectedGoodsId = formValues.goodsItemId;
        const filteredAvailableItems = selectedGoodsId
          ? availableOutboundItems.filter(
              (item) => item.goodsItemId === selectedGoodsId,
            )
          : availableOutboundItems;

        return filteredAvailableItems.map((item) => ({
          id: item.warehouseId,
          warehouseName: item.warehouseName || "",
          warehouseCode: "",
          location: "",
          availableQuantity: item.currentQuantity || 0,
          label: item.warehouseName || "",
        }));
      }

      return warehouseItems.map((item) => ({
        id: item.id,
        warehouseName: item.warehouseName || "",
        warehouseCode: item.warehouseCode || "",
        location: item.location || "",
        availableQuantity: "",
        label: [item.warehouseCode, item.warehouseName]
          .filter(Boolean)
          .join(" - "),
      }));
    },
    [availableOutboundItems, formValues.goodsItemId, type, warehouseItems],
  );
  const selectedWarehouse = useMemo(
    () => {
      const matchedWarehouseOption =
        warehouseOptions.find((item) => item.id === formValues.warehouseId) ||
        null;
      const matchedWarehouseItem =
        warehouseItems.find((item) => item.id === formValues.warehouseId) ||
        null;

      if (!matchedWarehouseOption && !matchedWarehouseItem) return null;

      return {
        ...matchedWarehouseItem,
        ...matchedWarehouseOption,
        location:
          matchedWarehouseItem?.location || matchedWarehouseOption?.location || "",
      };
    },
    [formValues.warehouseId, warehouseItems, warehouseOptions],
  );
  const selectedOutboundAvailability = useMemo(() => {
    if (type !== "outbound") return "";
    if (!formValues.goodsItemId || !formValues.warehouseId) return "";

    const matchedItem = availableOutboundItems.find(
      (item) =>
        item.goodsItemId === formValues.goodsItemId &&
        item.warehouseId === formValues.warehouseId,
    );

    return matchedItem ? String(matchedItem.currentQuantity || 0) : "0";
  }, [
    availableOutboundItems,
    formValues.goodsItemId,
    formValues.warehouseId,
    type,
  ]);

  const tableColumns = useMemo(
    () => [
      { key: "entryNo", label: "Entry No", width: 150, nowrap: true },
      { key: "goodsCode", label: "Goods Code", width: 150, nowrap: true },
      { key: "goodsDesc", label: "Goods Desc", width: 240 },
      { key: "warehouseName", label: "Warehouse", width: 180 },
      { key: "partnerName", label: config.partnerLabel, width: 180 },
      { key: "quantity", label: "Quantity", width: 120, nowrap: true },
      { key: "unit", label: "Unit", width: 120, nowrap: true },
      {
        key: "transactionDate",
        label: config.dateLabel,
        width: 160,
        nowrap: true,
      },
      { key: "status", label: "Status", width: 140, type: "status" },
      { key: "updatedAt", label: "Update Time", width: 180, nowrap: true },
    ],
    [config.dateLabel, config.partnerLabel],
  );

  const showFeedback = useCallback((feedbackType, message) => {
    setFeedback({ type: feedbackType, message });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoadingRows(true);
      const [transactionRows, goodsListRows, warehouseRows] = await Promise.all([
        getInventoryTransactions(type),
        getGoodsListItems(),
        getWarehouses(),
      ]);
      const outboundAvailableItems =
        type === "outbound" ? await getAvailableOutboundItems() : [];

      setRows(transactionRows);
      setGoodsItems(goodsListRows);
      setWarehouseItems(warehouseRows);
      setAvailableOutboundItems(outboundAvailableItems);
      setFeedback((prev) =>
        prev.type === "error" ? { type: "", message: "" } : prev,
      );
    } catch (error) {
      showFeedback(
        "error",
        error.message || `Failed to load ${config.title.toLowerCase()} records`,
      );
    } finally {
      setLoadingRows(false);
    }
  }, [config.title, showFeedback, type]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    setFormValues({
      ...getDefaultFormValues(),
      status: config.statusOptions[1] || config.statusOptions[0] || "Pending",
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    blurActiveElement();
    const matchedGoodsItem =
      goodsOptions.find((item) => item.id === row.goodsItemId) ||
      goodsOptions.find(
        (item) =>
          normalizeLookupValue(item.goodsCode) ===
            normalizeLookupValue(row.goodsCode) &&
          normalizeLookupValue(item.goodsDesc) ===
            normalizeLookupValue(row.goodsDesc),
      ) ||
      null;
    const matchedWarehouse =
      warehouseOptions.find((item) => item.id === row.warehouseId) ||
      warehouseOptions.find(
        (item) =>
          normalizeLookupValue(item.warehouseName) ===
          normalizeLookupValue(row.warehouseName),
      ) ||
      null;

    setEditingRow(row);
    setFormValues({
      goodsItemId: matchedGoodsItem?.id || "",
      warehouseId: matchedWarehouse?.id || "",
      partnerName: row.partnerName || "",
      quantity: row.quantity || "",
      transactionDate: row.transactionDate || "",
      status: row.status || config.statusOptions[0] || "Pending",
      notes: row.notes || "",
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
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
      ...(fieldName === "goodsItemId" ? { warehouseId: "" } : {}),
    }));
    setFormErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleDelete = async (row) => {
    try {
      await deleteInventoryTransaction(type, row.id);
      await loadData();
      showFeedback(
        "success",
        `${config.title} record deleted successfully.`,
      );
    } catch (error) {
      showFeedback(
        "error",
        error.message || `Failed to delete ${config.title.toLowerCase()} record`,
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!String(formValues.goodsItemId || "").trim()) {
      nextErrors.goodsItemId = "Goods item is required";
    }

    if (!String(formValues.warehouseId || "").trim()) {
      nextErrors.warehouseId = "Warehouse is required";
    }

    if (!String(formValues.partnerName || "").trim()) {
      nextErrors.partnerName = `${config.partnerLabel} is required`;
    }

    if (!String(formValues.quantity || "").trim()) {
      nextErrors.quantity = "Quantity is required";
    } else if (Number(formValues.quantity) <= 0) {
      nextErrors.quantity = "Quantity must be greater than 0";
    }

    if (!String(formValues.transactionDate || "").trim()) {
      nextErrors.transactionDate = `${config.dateLabel} is required`;
    }

    if (!String(formValues.status || "").trim()) {
      nextErrors.status = "Status is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    const payload = {
      goodsItemId: formValues.goodsItemId,
      warehouseId: formValues.warehouseId,
      partnerName: formValues.partnerName,
      quantity: Number(formValues.quantity),
      transactionDate: formValues.transactionDate,
      status: formValues.status,
      notes: formValues.notes,
    };

    try {
      if (editingRow) {
        await updateInventoryTransaction(type, editingRow.id, payload);
        showFeedback(
          "success",
          `${config.title} record updated successfully.`,
        );
      } else {
        await createInventoryTransaction(type, payload);
        showFeedback(
          "success",
          `${config.title} record created successfully.`,
        );
      }

      await loadData();
      closeDialog();
    } catch (error) {
      showFeedback(
        "error",
        error.message || `Failed to save ${config.title.toLowerCase()} record`,
      );
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
        title={config.title}
        columns={tableColumns}
        rows={rows}
        loading={loadingRows}
        onRefresh={loadData}
        onEdit={openEditDialog}
        onDelete={handleDelete}
        primaryButtonLabel={config.primaryButtonLabel}
        onPrimaryAction={openAddDialog}
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
            <Stack spacing={2}>
              <TextField
                select
                label="Goods Item"
                value={formValues.goodsItemId}
                onChange={(event) =>
                  handleFieldChange("goodsItemId", event.target.value)
                }
                required
                error={Boolean(formErrors.goodsItemId)}
                helperText={
                  formErrors.goodsItemId ||
                  "Only items from Goods List can be selected"
                }
                fullWidth
                sx={textFieldStyles}
              >
                {goodsOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Goods Code"
                value={selectedGoodsItem?.goodsCode || ""}
                fullWidth
                disabled
                sx={textFieldStyles}
              />

              <TextField
                label="Goods Desc"
                value={selectedGoodsItem?.goodsDesc || ""}
                fullWidth
                disabled
                sx={textFieldStyles}
              />

              <TextField
                label="Unit"
                value={selectedGoodsItem?.goodsUnit || ""}
                fullWidth
                disabled
                sx={textFieldStyles}
              />

              <TextField
                select
                label="Warehouse"
                value={formValues.warehouseId}
                onChange={(event) =>
                  handleFieldChange("warehouseId", event.target.value)
                }
                required
                error={Boolean(formErrors.warehouseId)}
                helperText={formErrors.warehouseId || " "}
                fullWidth
                sx={textFieldStyles}
              >
                {warehouseOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Warehouse Location"
                value={selectedWarehouse?.location || ""}
                fullWidth
                disabled
                sx={textFieldStyles}
              />

              {type === "outbound" ? (
                <TextField
                  label="Current Available Stock"
                  value={selectedOutboundAvailability}
                  fullWidth
                  disabled
                  sx={textFieldStyles}
                />
              ) : null}

              <TextField
                label={config.partnerLabel}
                value={formValues.partnerName}
                onChange={(event) =>
                  handleFieldChange("partnerName", event.target.value)
                }
                required
                error={Boolean(formErrors.partnerName)}
                helperText={formErrors.partnerName || " "}
                fullWidth
                sx={textFieldStyles}
              />

              <TextField
                label="Quantity"
                type="number"
                value={formValues.quantity}
                onChange={(event) =>
                  handleFieldChange("quantity", event.target.value)
                }
                required
                error={Boolean(formErrors.quantity)}
                helperText={formErrors.quantity || " "}
                fullWidth
                sx={textFieldStyles}
                inputProps={{ min: 0, step: "any" }}
              />

              <TextField
                label={config.dateLabel}
                type="date"
                value={formValues.transactionDate}
                onChange={(event) =>
                  handleFieldChange("transactionDate", event.target.value)
                }
                required
                error={Boolean(formErrors.transactionDate)}
                helperText={formErrors.transactionDate || " "}
                fullWidth
                sx={textFieldStyles}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                select
                label="Status"
                value={formValues.status}
                onChange={(event) =>
                  handleFieldChange("status", event.target.value)
                }
                required
                error={Boolean(formErrors.status)}
                helperText={formErrors.status || " "}
                fullWidth
                sx={textFieldStyles}
              >
                {config.statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Notes"
                value={formValues.notes}
                onChange={(event) =>
                  handleFieldChange("notes", event.target.value)
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

export default InventoryTransactionPage;
