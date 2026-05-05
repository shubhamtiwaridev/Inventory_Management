import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Chip,
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
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useAuth } from "../../store/AuthContext.jsx";
import {
  getStaffTypes,
  createStaffType,
  updateStaffType,
  deleteStaffType,
  getCards,
} from "./staffApi";

const brand = {
  primary: "#106C6B",
  primaryDark: "#0C5A58",
  primaryLight: "#17A89F",
  soft: "#E8F7F6",
  softAlt: "#FFFFFF",
  border: "rgba(16, 108, 107, 0.24)",
  rowBorder: "rgba(16, 108, 107, 0.24)",
  verticalBorder: "#C7D7D7",
  text: "#143736",
  textSoft: "#617776",
  pageBg: "#FFFFFF",
  shadow:
    "0 0 0 1px rgba(15, 23, 42, 0.03), 0 12px 30px rgba(15, 23, 42, 0.08)",
  shadowStrong: "none",
  danger: "#C2410C",
  dangerSoft: "#FFF1EE",
};

const tabs = [
  { label: "STAFF", icon: <BadgeRoundedIcon />, path: "/staff" },
  { label: "STAFF LIST", icon: <FactCheckOutlinedIcon />, path: "/staff-list" },
  {
    label: "STAFF TYPE",
    icon: <VerifiedUserOutlinedIcon />,
    path: "/staff-type",
  },
];

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  boxShadow: "none",
};

const tabButtonSx = (active) => ({
  borderRadius: 0,
  px: 2.25,
  py: 1.4,
  minWidth: 108,
  color: active ? "#111111" : "#444444",
  fontWeight: active ? 800 : 700,
  textTransform: "none",
  borderBottom: active ? "3px solid #111111" : "3px solid transparent",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.55,
  "& .tab-icon": {
    color: active ? "#111111" : "#444444",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  "& .tab-icon svg": {
    fontSize: 24,
  },
  "& .tab-label": {
    fontSize: "0.95rem",
    lineHeight: 1.1,
    whiteSpace: "nowrap",
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: "#111111",
  },
});

const actionButtonSx = {
  width: 34,
  height: 34,
  borderRadius: 2.5,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  "&:hover": {
    backgroundColor: brand.soft,
  },
};

const getCellSx = ({ isLast = false, align = "center" } = {}) => ({
  borderBottom: `1px solid ${brand.rowBorder}`,
  borderRight: isLast ? "none" : `2px solid ${brand.verticalBorder}`,
  py: 2.1,
  px: 2,
  textAlign: align,
  verticalAlign: "middle",
  boxSizing: "border-box",
  backgroundColor: "inherit",
});

const pad = (value) => String(value).padStart(2, "0");

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const amPm = hours >= 12 ? "PM" : "AM";

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${hours12}:${pad(date.getMinutes())} ${amPm}`;
};

const canAssignCardToStaffType = (card) => {
  if (typeof card?.allowInStaffTypes === "boolean") {
    return card.allowInStaffTypes;
  }

  const normalizedName = String(card?.name || "")
    .trim()
    .toLowerCase();
  const normalizedPath = String(card?.path || "")
    .trim()
    .toLowerCase();

  if (normalizedName === "staff") {
    return false;
  }

  if (normalizedPath === "/staff" || normalizedPath.startsWith("/staff/")) {
    return false;
  }

  return true;
};

const StaffType = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [availableCards, setAvailableCards] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    assignedCards: [],
    createdBy: "",
  });

  const rowsPerPage = 10;

  const isSuperadminStaffType = useMemo(
    () =>
      String(formData.name || "")
        .trim()
        .toLowerCase() === "superadmin",
    [formData.name],
  );

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      assignedCards: [],
      createdBy: user?.name || "",
    });
    setEditingId("");
    setShowForm(false);
  }, [user?.name]);

  const loadCards = useCallback(async () => {
    try {
      const response = await getCards();
      const cards = Array.isArray(response?.data) ? response.data : [];
      setAvailableCards(cards.filter(canAssignCardToStaffType));
    } catch (error) {
      console.error("Failed to load cards:", error);
    }
  }, []);

  const loadStaffTypes = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getStaffTypes();
      const list = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.staffTypes)
          ? response.staffTypes
          : Array.isArray(response)
            ? response
            : [];

      setRows(list);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load staff types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaffTypes();
    loadCards();
  }, [loadStaffTypes, loadCards]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rows;

    return rows.filter((row) => {
      const createdAt = formatDateTime(row.createdAt).toLowerCase();
      const updatedAt = formatDateTime(row.updatedAt).toLowerCase();

      return (
        String(row.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(row.createdBy || "")
          .toLowerCase()
          .includes(keyword) ||
        createdAt.includes(keyword) ||
        updatedAt.includes(keyword)
      );
    });
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
    await loadStaffTypes();
  };

  const handleDownload = () => {
    const header = ["Staff Type", "Creater", "Created Time", "Updated Time"];

    const csvRows = filteredRows.map((row) => [
      row.name || "",
      row.createdBy || "",
      formatDateTime(row.createdAt),
      formatDateTime(row.updatedAt),
    ]);

    const csv = [header, ...csvRows]
      .map((line) =>
        line.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "staff-type-list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      assignedCards: [],
      createdBy: user?.name || "",
    });
    setEditingId("");
    setShowForm(true);
    setErrorMessage("");
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name || "",
      assignedCards: (row.assignedCards || []).map((card) => card._id || card),
      createdBy: row.createdBy || "",
    });
    setEditingId(row._id);
    setShowForm(true);
    setErrorMessage("");
  };

  const handleCancel = () => {
    resetForm();
    setErrorMessage("");
  };

  const toggleAssignedCard = (cardId) => {
    setFormData((prev) => ({
      ...prev,
      assignedCards: prev.assignedCards.includes(cardId)
        ? prev.assignedCards.filter((id) => id !== cardId)
        : [...prev.assignedCards, cardId],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      assignedCards: formData.assignedCards,
      createdBy: formData.createdBy.trim(),
    };

    if (!payload.name || !payload.createdBy) {
      setErrorMessage("Please fill Staff Type and Creater Person");
      return;
    }

    if (
      !isSuperadminStaffType &&
      (!payload.assignedCards || payload.assignedCards.length === 0)
    ) {
      setErrorMessage("Please select at least one card for this staff type");
      return;
    }

    if (isSuperadminStaffType) {
      payload.assignedCards = [];
    }

    try {
      setSaving(true);
      setErrorMessage("");

      if (editingId) {
        const response = await updateStaffType(editingId, payload);
        const updatedRow = response?.data || response?.staffType || response;

        setRows((prev) =>
          prev.map((item) => (item._id === editingId ? updatedRow : item)),
        );
      } else {
        const response = await createStaffType(payload);
        const newRow = response?.data || response?.staffType || response;

        setRows((prev) => [newRow, ...prev]);
        setPage(1);
      }

      resetForm();
    } catch (error) {
      setErrorMessage(error.message || "Failed to save staff type");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    try {
      setErrorMessage("");
      await deleteStaffType(row._id);
      setRows((prev) => prev.filter((item) => item._id !== row._id));
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete staff type");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: brand.pageBg,
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            mb: 2,
            px: { xs: 1, sm: 2 },
            pt: 1,
            background: "transparent",
            borderBottom: "none",
            overflowX: "auto",
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 0.5, sm: 1.25 }}
            sx={{
              minWidth: "max-content",
              alignItems: "flex-end",
            }}
          >
            {tabs.map((tab) => {
              const active = location.pathname === tab.path;

              return (
                <Button
                  key={tab.label}
                  onClick={() => navigate(tab.path)}
                  sx={tabButtonSx(active)}
                >
                  <Box className="tab-icon">{tab.icon}</Box>
                  <Box component="span" className="tab-label">
                    {tab.label}
                  </Box>
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Paper elevation={0} sx={{ ...softCardSx, overflow: "hidden" }}>
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                flexWrap="wrap"
                useFlexGap
              >
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
                  Download
                </Button>
              </Stack>

              <TextField
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search Word"
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 280 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    backgroundColor: "#FFFFFF",
                    boxShadow: brand.shadow,
                    "& fieldset": {
                      borderColor: brand.border,
                    },
                    "&:hover fieldset": {
                      borderColor: brand.primaryLight,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: brand.primary,
                    },
                  },
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
              PaperProps={{
                sx: {
                  borderRadius: 4,
                  border: `1px solid ${brand.border}`,
                  boxShadow: brand.shadowStrong,
                  overflow: "hidden",
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
                {editingId ? "Update Staff Type" : "Add New Staff Type"}
              </DialogTitle>

              <Box component="form" onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 1 }}>
                  <Stack spacing={2}>
                    <TextField
                      autoFocus
                      label="Staff Type"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      fullWidth
                    />

                    <TextField
                      label="Creater Person"
                      value={formData.createdBy}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          createdBy: e.target.value,
                        }))
                      }
                      fullWidth
                    />

                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        {isSuperadminStaffType
                          ? "Assign Cards"
                          : "Assign Cards *"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {isSuperadminStaffType
                          ? "Superadmin does not require card selection. Superadmin will see all cards automatically."
                          : "Select which cards this staff type can access. At least one card must be selected."}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {availableCards.map((card) => (
                          <Box
                            key={card._id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 1,
                              border: `1px solid ${formData.assignedCards.includes(card._id) ? brand.primary : brand.border}`,
                              borderRadius: 1,
                              backgroundColor: formData.assignedCards.includes(
                                card._id,
                              )
                                ? brand.soft
                                : "transparent",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: brand.primary,
                                backgroundColor: brand.soft,
                              },
                            }}
                            onClick={() => {
                              if (!isSuperadminStaffType) {
                                toggleAssignedCard(card._id);
                              }
                            }}
                          >
                            <Checkbox
                              checked={formData.assignedCards.includes(
                                card._id,
                              )}
                              sx={{ p: 0, mr: 1 }}
                              disabled={isSuperadminStaffType}
                              onChange={(e) => {
                                e.stopPropagation();

                                if (!isSuperadminStaffType) {
                                  toggleAssignedCard(card._id);
                                }
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {card.title}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      {availableCards.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No cards available. Please contact administrator.
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </DialogContent>

                <DialogActions
                  sx={{
                    px: 3,
                    pb: 3,
                    pt: 1,
                    gap: 1,
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{
                      minWidth: 110,
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      color: brand.text,
                      borderColor: brand.border,
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{
                      minWidth: 110,
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
                      boxShadow: "0 12px 24px rgba(16, 108, 107, 0.20)",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${brand.primaryDark} 0%, ${brand.primaryDark} 100%)`,
                      },
                    }}
                  >
                    {saving ? "Saving..." : editingId ? "Update" : "Add"}
                  </Button>
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
                overflowX: "auto",
                overflowY: "hidden",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Table
                sx={{
                  width: "100%",
                  minWidth: 900,
                  backgroundColor: "#FFFFFF",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: brand.softAlt,
                    }}
                  >
                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "22%",
                      }}
                    >
                      Staff Type
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "20%",
                      }}
                    >
                      Creater
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "20%",
                      }}
                    >
                      Created Time
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "23%",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Updated Time
                    </TableCell>

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
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={getCellSx({ isLast: true, align: "center" })}
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : visibleRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={getCellSx({ isLast: true, align: "center" })}
                      >
                        No staff type found
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRows.map((row) => (
                      <TableRow
                        key={row._id}
                        hover
                        sx={{
                          backgroundColor: "#FFFFFF",
                          "&:hover": {
                            backgroundColor: "#FAFBFC",
                          },
                        }}
                      >
                        <TableCell sx={getCellSx()}>
                          <Chip
                            label={row.name}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              backgroundColor: brand.soft,
                              color: brand.primaryDark,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            ...getCellSx(),
                            color: brand.text,
                            fontWeight: 600,
                          }}
                        >
                          {row.createdBy || "-"}
                        </TableCell>

                        <TableCell
                          sx={{
                            ...getCellSx(),
                            color: brand.textSoft,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDateTime(row.createdAt)}
                        </TableCell>

                        <TableCell
                          sx={{
                            ...getCellSx(),
                            color: brand.textSoft,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDateTime(row.updatedAt)}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          <Stack
                            direction="row"
                            justifyContent="center"
                            spacing={1}
                          >
                            <IconButton
                              onClick={() => handleEdit(row)}
                              sx={actionButtonSx}
                            >
                              <EditRoundedIcon
                                sx={{
                                  fontSize: 18,
                                  color: brand.primaryDark,
                                }}
                              />
                            </IconButton>

                            <IconButton
                              onClick={() => handleDelete(row)}
                              sx={{
                                ...actionButtonSx,
                                "&:hover": {
                                  backgroundColor: brand.dangerSoft,
                                },
                              }}
                            >
                              <DeleteOutlineRoundedIcon
                                sx={{ fontSize: 18, color: brand.danger }}
                              />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default StaffType;
