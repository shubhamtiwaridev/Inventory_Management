import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import {
  actionIconButtonSx,
  brand,
  filledActionButtonSx,
  getCellSx,
  outlinedActionButtonSx,
  searchFieldSx,
  textFieldStyles,
} from "../../machine-maintenance/components/machineMaintenanceUi.jsx";
import { useAuth } from "../../../store/AuthContext.jsx";
import { hasActionPermission } from "../../../utils/permissions.js";

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  boxShadow: "none",
};

const buildInitialFormData = (fields = []) =>
  fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue || "";
    return acc;
  }, {});

const ConfigureMasterPage = ({
  config,
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  mapListRow,
  mapFormValues,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState(buildInitialFormData(config.fields));

  const rowsPerPage = 10;

  const canCreate = hasActionPermission(user, location.pathname, "create");
  const canUpdate = hasActionPermission(user, location.pathname, "update");
  const canDelete = hasActionPermission(user, location.pathname, "delete");
  const canShowActionColumn = canUpdate || canDelete;
  const tableMinWidth = Math.max(
    config.tableMinWidth || 980,
    (config.columns.length + (canShowActionColumn ? 1 : 0)) * 180,
  );

  const resetForm = useCallback(() => {
    setFormData(buildInitialFormData(config.fields));
    setEditingId("");
    setShowForm(false);
  }, [config.fields]);

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getItems();
      const list = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      setRows(list.map(mapListRow));
    } catch (error) {
      setErrorMessage(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [getItems, mapListRow]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rows;

    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page]);

  const handleRefresh = async () => {
    setSearch("");
    setPage(1);
    setShowForm(false);
    setErrorMessage("");
    await loadRows();
  };

  const handleDownload = () => {
    const header = config.columns.map((column) => column.label);

    const csvRows = filteredRows.map((row) =>
      config.columns.map((column) => row[column.key] || ""),
    );

    const csv = [header, ...csvRows]
      .map((line) =>
        line.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", config.downloadFileName || "list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleOpenCreate = () => {
    if (!canCreate) return;

    setFormData(buildInitialFormData(config.fields));
    setEditingId("");
    setShowForm(true);
    setErrorMessage("");
  };

  const handleEdit = async (row) => {
    if (!canUpdate) return;

    try {
      setErrorMessage("");

      if (getItemById) {
        const response = await getItemById(row.id);
        setFormData(mapFormValues(response?.data || {}));
      } else {
        setFormData(mapFormValues(row));
      }

      setEditingId(row.id);
      setShowForm(true);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load details");
    }
  };

  const handleCancel = () => {
    resetForm();
    setErrorMessage("");
  };

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const missingRequiredField = config.fields.find(
      (field) => field.required && !String(formData[field.name] || "").trim(),
    );

    if (missingRequiredField) {
      const requiredLabels = config.fields
        .filter((field) => field.required)
        .map((field) => field.label)
        .join(" and ");

      setErrorMessage(`Please fill ${requiredLabels}`);
      return;
    }

    const payload = config.buildPayload
      ? config.buildPayload(formData)
      : Object.fromEntries(
          Object.entries(formData).map(([key, value]) => [
            key,
            typeof value === "string" ? value.trim() : value,
          ]),
        );

    try {
      setSaving(true);
      setErrorMessage("");

      if (editingId) {
        if (!canUpdate) {
          setErrorMessage("You do not have permission to update this record");
          return;
        }

        await updateItem(editingId, payload);
      } else {
        if (!canCreate) {
          setErrorMessage("You do not have permission to create this record");
          return;
        }

        await createItem(payload);
        setPage(1);
      }

      await loadRows();
      resetForm();
    } catch (error) {
      setErrorMessage(error.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!canDelete) return;

    try {
      setErrorMessage("");
      await deleteItem(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete data");
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        ...softCardSx,
        overflow: "hidden",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2, flexShrink: 0 }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            flexWrap="wrap"
            useFlexGap
          >
            {canCreate ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleOpenCreate}
                sx={{
                  borderRadius: 3,
                  px: 2,
                  py: 1.15,
                  textTransform: "none",
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
                  boxShadow: "0 12px 24px rgba(16, 108, 107, 0.20)",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${brand.primaryDark} 0%, ${brand.primaryDark} 100%)`,
                  },
                }}
              >
                New
              </Button>
            ) : null}

            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleRefresh}
              sx={{
                borderRadius: 3,
                px: 2,
                py: 1.15,
                textTransform: "none",
                fontWeight: 700,
                color: brand.text,
                borderColor: brand.border,
                "&:hover": {
                  borderColor: brand.primaryLight,
                  backgroundColor: brand.soft,
                },
              }}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDownload}
              sx={outlinedActionButtonSx}
              disabled={loading || filteredRows.length === 0}
            >
              Download
            </Button>
          </Stack>

          <TextField
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={config.searchPlaceholder || "Search Word"}
            size="small"
            sx={{
              minWidth: { xs: "100%", sm: 280 },
              ...searchFieldSx,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchRoundedIcon sx={{ color: brand.textSoft }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Dialog
          open={showForm}
          onClose={handleCancel}
          fullWidth
          maxWidth="sm"
          disableRestoreFocus
          PaperProps={{
            sx: {
              borderRadius: 4,
              border: `1px solid ${brand.border}`,
              boxShadow: brand.shadowStrong,
              overflow: "hidden",
              width: "100%",
              maxWidth: { xs: "calc(100% - 24px)", sm: "496px" },
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              color: brand.text,
              pb: 1,
            }}
          >
            {editingId ? config.editDialogTitle : config.createDialogTitle}
          </DialogTitle>

          <Box component="form" onSubmit={handleSubmit}>
            <DialogContent
              sx={{
                pt: 2.5,
                pb: 3,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 2,
                }}
              >
                {config.fields.map((field, index) => (
                  <TextField
                    key={field.name}
                    label={field.label}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.name, e.target.value)
                    }
                    fullWidth
                    required={field.required}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    multiline={field.multiline}
                    minRows={field.minRows}
                    InputLabelProps={field.inputLabelProps}
                    autoFocus={index === 0}
                    sx={textFieldStyles}
                  />
                ))}
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
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  sx={outlinedActionButtonSx}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  sx={filledActionButtonSx}
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Save"}
                </Button>
              </Stack>
            </DialogActions>
          </Box>
        </Dialog>

        {errorMessage ? (
          <Typography
            sx={{
              mb: 2,
              color: brand.danger,
              fontWeight: 700,
            }}
          >
            {errorMessage}
          </Typography>
        ) : null}

        <TableContainer
          sx={{
            borderRadius: 3,
            border: `1px solid ${brand.border}`,
            flex: 1,
            minHeight: 0,
            overflowX: "auto",
            overflowY: "hidden",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Table
            sx={{
              width: "100%",
              minWidth: tableMinWidth,
              backgroundColor: "#FFFFFF",
              tableLayout: "fixed",
              borderCollapse: "collapse",
            }}
          >
            <TableHead
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <TableRow
                sx={{
                  backgroundColor: brand.softAlt,
                }}
              >
                {config.columns.map((column, index) => (
                  <TableCell
                    key={column.key}
                    sx={{
                      ...getCellSx({
                        align: column.align || "center",
                        isLast:
                          !canShowActionColumn &&
                          index === config.columns.length - 1,
                      }),
                      fontWeight: 800,
                      color: brand.text,
                      width: column.width,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}

                {canShowActionColumn ? (
                  <TableCell
                    align="center"
                    sx={{
                      ...getCellSx({ isLast: true, align: "center" }),
                      fontWeight: 800,
                      color: brand.text,
                      width: "12%",
                    }}
                  >
                    Action
                  </TableCell>
                ) : null}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      config.columns.length + (canShowActionColumn ? 1 : 0)
                    }
                    align="center"
                    sx={getCellSx({ isLast: true, align: "center" })}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <CircularProgress size={18} />
                      <Typography sx={{ color: brand.textSoft }}>
                        Loading records...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      config.columns.length + (canShowActionColumn ? 1 : 0)
                    }
                    align="center"
                    sx={getCellSx({ isLast: true, align: "center" })}
                  >
                    {config.emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      backgroundColor: "#FFFFFF",
                      "&:hover": {
                        backgroundColor: "#FAFBFC",
                      },
                    }}
                  >
                    {config.columns.map((column, index) => (
                      <TableCell
                        key={column.key}
                        sx={getCellSx({
                          align: column.align || "center",
                          isLast:
                            !canShowActionColumn &&
                            index === config.columns.length - 1,
                        })}
                      >
                        {column.chip ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={row[column.key] || "-"}
                              size="small"
                              sx={{
                                borderRadius: 2,
                                backgroundColor: brand.soft,
                                color: brand.primaryDark,
                                fontWeight: 700,
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography
                            component="span"
                            sx={{
                              display: "block",
                              width: "100%",
                              textAlign: column.align || "center",
                              color: column.softText
                                ? brand.textSoft
                                : brand.text,
                              fontWeight: column.bold ? 600 : 400,
                              whiteSpace: "nowrap",
                              fontSize: "0.95rem",
                            }}
                          >
                            {row[column.key] || "-"}
                          </Typography>
                        )}
                      </TableCell>
                    ))}

                    {canShowActionColumn ? (
                      <TableCell
                        align="center"
                        sx={getCellSx({ isLast: true, align: "center" })}
                      >
                        <Stack
                          direction="row"
                          justifyContent="center"
                          spacing={1}
                        >
                          {canUpdate ? (
                            <IconButton
                              onClick={() => handleEdit(row)}
                              sx={actionIconButtonSx}
                            >
                              <EditRoundedIcon
                                sx={{
                                  fontSize: 18,
                                  color: brand.primaryDark,
                                }}
                              />
                            </IconButton>
                          ) : null}

                          {canDelete ? (
                            <IconButton
                              onClick={() => handleDelete(row)}
                              sx={{
                                ...actionIconButtonSx,
                                "&:hover": {
                                  backgroundColor: brand.dangerSoft,
                                },
                              }}
                            >
                              <DeleteOutlineRoundedIcon
                                sx={{ fontSize: 18, color: brand.danger }}
                              />
                            </IconButton>
                          ) : null}
                        </Stack>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default ConfigureMasterPage;
