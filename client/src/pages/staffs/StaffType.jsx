import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
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
import SideBar from "../SideBar.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const getStaffTypes = async () => {
  return request("/staff-types");
};

const createStaffType = async (payload) => {
  return request("/staff-types", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const updateStaffType = async (id, payload) => {
  return request(`/staff-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

const deleteStaffType = async (id) => {
  return request(`/staff-types/${id}`, {
    method: "DELETE",
  });
};

const brand = {
  primary: "#106C6B",
  primaryDark: "#0C5A58",
  primaryLight: "#17A89F",
  soft: "#E8F7F6",
  softAlt: "#F7FBFB",
  border: "rgba(16, 108, 107, 0.24)",
  rowBorder: "rgba(16, 108, 107, 0.24)",
  text: "#143736",
  textSoft: "#617776",
  pageBg: "linear-gradient(180deg, #F8FAFC 0%, #F5F7FA 45%, #F2F5F8 100%)",
  shadow:
    "0 0 0 1px rgba(15, 23, 42, 0.03), 0 12px 30px rgba(15, 23, 42, 0.08)",
  shadowStrong:
    "0 0 0 1px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.10)",
  danger: "#C2410C",
  dangerSoft: "#FFF1EE",
};

const tabs = [
  { label: "STAFF", icon: <BadgeRoundedIcon />, path: "/staff" },
  { label: "CHECK CODE", icon: <FactCheckOutlinedIcon />, path: "/check-code" },
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
  boxShadow: brand.shadowStrong,
};

const tabButtonSx = (active) => ({
  borderRadius: 0,
  px: 2,
  py: 1.25,
  minWidth: "fit-content",
  color: active ? brand.text : brand.textSoft,
  fontWeight: active ? 800 : 700,
  textTransform: "none",
  borderBottom: active
    ? `3px solid ${brand.primaryDark}`
    : "3px solid transparent",
  "&:hover": {
    backgroundColor: "transparent",
    color: brand.primaryDark,
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

const rowCellSx = {
  borderBottom: `1px solid ${brand.rowBorder}`,
  py: 2.1,
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

const pad = (value) => String(value).padStart(2, "0");

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

const StaffType = () => {
  const { user, logout, canViewTeam } = useAuth();
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
  const [formData, setFormData] = useState({
    name: "",
    createdBy: "",
  });

  const rowsPerPage = 10;
  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      createdBy: user?.name || "",
    });
    setEditingId("");
    setShowForm(false);
  }, [user?.name]);

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
  }, [loadStaffTypes]);

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
      createdBy: user?.name || "",
    });
    setEditingId("");
    setShowForm(true);
    setErrorMessage("");
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name || "",
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      createdBy: formData.createdBy.trim(),
    };

    if (!payload.name || !payload.createdBy) {
      setErrorMessage("Please fill Staff Type and Creater Person");
      return;
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
    const confirmed = window.confirm(
      `Are you sure you want to delete "${row.name}"?`,
    );

    if (!confirmed) return;

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
          display: "flex",
          minHeight: "100vh",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <SideBar
          user={user}
          initials={initials}
          canViewTeam={canViewTeam}
          location={location}
          navigate={navigate}
          handleLogout={handleLogout}
        />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
          }}
        >
          <Paper elevation={0} sx={{ ...softCardSx, overflow: "hidden" }}>
            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1 }}
              sx={{
                px: { xs: 1, sm: 2 },
                pt: 1,
                borderBottom: `1px solid ${brand.border}`,
                overflowX: "auto",
              }}
            >
              {tabs.map((tab) => {
                const active = location.pathname === tab.path;

                return (
                  <Button
                    key={tab.label}
                    startIcon={tab.icon}
                    onClick={() => navigate(tab.path)}
                    sx={tabButtonSx(active)}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Stack>

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
                  overflow: "hidden",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Table
                  sx={{
                    minWidth: 900,
                    backgroundColor: "#FFFFFF",
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
                          ...rowCellSx,
                          fontWeight: 800,
                          color: brand.text,
                        }}
                      >
                        Staff Type
                      </TableCell>

                      <TableCell
                        sx={{
                          ...rowCellSx,
                          fontWeight: 800,
                          color: brand.text,
                        }}
                      >
                        Creater
                      </TableCell>

                      <TableCell
                        sx={{
                          ...rowCellSx,
                          fontWeight: 800,
                          color: brand.text,
                        }}
                      >
                        Created Time
                      </TableCell>

                      <TableCell
                        sx={{
                          ...rowCellSx,
                          fontWeight: 800,
                          color: brand.text,
                        }}
                      >
                        Updated Time
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          ...rowCellSx,
                          fontWeight: 800,
                          color: brand.text,
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={rowCellSx}>
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={rowCellSx}>
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
                          <TableCell sx={rowCellSx}>
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
                              ...rowCellSx,
                              color: brand.text,
                              fontWeight: 600,
                            }}
                          >
                            {row.createdBy || "-"}
                          </TableCell>

                          <TableCell
                            sx={{
                              ...rowCellSx,
                              color: brand.textSoft,
                            }}
                          >
                            {formatDateTime(row.createdAt)}
                          </TableCell>

                          <TableCell
                            sx={{
                              ...rowCellSx,
                              color: brand.textSoft,
                            }}
                          >
                            {formatDateTime(row.updatedAt)}
                          </TableCell>

                          <TableCell align="center" sx={rowCellSx}>
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
    </Box>
  );
};

export default StaffType;
