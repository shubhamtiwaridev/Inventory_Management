import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useParams } from "react-router-dom";
import MachineMaintenanceListView from "../../machine-maintenance/components/MachineMaintenanceListView.jsx";
import {
  brand,
  filledActionButtonSx,
  outlinedActionButtonSx,
  textFieldStyles,
} from "../../machine-maintenance/components/machineMaintenanceUi.jsx";
import {
  cloneInventoryMasterRows,
  inventoryMasterConfigs,
} from "./inventoryGoodsListData.js";

const configKeyMap = {
  list: "goodsList",
  units: "units",
  class: "class",
  color: "color",
  brand: "brand",
  specs: "specs",
  origin: "origin",
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

const InventoryMasterListPage = () => {
  const { tabKey } = useParams();
  const configKey = configKeyMap[tabKey] || "goodsList";
  const config = inventoryMasterConfigs[configKey];

  const [masterRows, setMasterRows] = useState(() =>
    cloneInventoryMasterRows(),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState(() => getDefaultValues(config));
  const [formErrors, setFormErrors] = useState({});

  const rows = masterRows[configKey] || [];

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

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${config.title.toLowerCase()} record?`,
    );
    if (!confirmed) return;

    setMasterRows((prev) => ({
      ...prev,
      [configKey]: (prev[configKey] || []).filter((item) => item.id !== row.id),
    }));
  };

  const handleRefresh = () => {
    setMasterRows((prev) => ({
      ...prev,
      [configKey]: cloneInventoryMasterRows()[configKey] || [],
    }));
  };

  const handleSubmit = (event) => {
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

    const timestamp = getNowStamp();

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

  return (
    <>
      <MachineMaintenanceListView
        title={config.title}
        columns={config.columns}
        rows={rows}
        onRefresh={handleRefresh}
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
    </>
  );
};

export default InventoryMasterListPage;
