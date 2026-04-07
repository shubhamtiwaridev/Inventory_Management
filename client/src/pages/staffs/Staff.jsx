import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
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
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import { useAuth } from "../../store/AuthContext.jsx";
import SideBar from "../SideBar.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const brand = {
  primary: "#106C6B",
  primaryDark: "#0C5A58",
  primaryLight: "#17A89F",
  soft: "#E8F7F6",
  softAlt: "#F7FBFB",
  border: "rgba(16, 108, 107, 0.24)",
  rowBorder: "rgba(16, 108, 107, 0.24)",
  verticalBorder: "#C7D7D7",
  text: "#143736",
  textSoft: "#617776",
  pageBg: "linear-gradient(180deg, #F8FAFC 0%, #F5F7FA 45%, #F2F5F8 100%)",
  shadow:
    "0 0 0 1px rgba(15, 23, 42, 0.03), 0 12px 30px rgba(15, 23, 42, 0.08)",
  shadowStrong:
    "0 0 0 1px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.10)",
  danger: "#C2410C",
  dangerSoft: "#FFF1EE",
  fieldBg: "#F8FCFC",
  muted: "#5F6F73",
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

const getCellSx = ({ isLast = false, align = "left" } = {}) => ({
  borderBottom: `1px solid ${brand.rowBorder}`,
  borderRight: isLast ? "none" : `2px solid ${brand.verticalBorder}`,
  py: 2.1,
  px: 2,
  textAlign: align,
  verticalAlign: "middle",
  boxSizing: "border-box",
  backgroundColor: "inherit",
});

const textFieldStyles = {
  "& .MuiInputLabel-root": {
    color: brand.muted,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: brand.primaryDark,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    bgcolor: brand.fieldBg,
    "& fieldset": {
      borderColor: brand.border,
    },
    "&:hover fieldset": {
      borderColor: brand.primary,
    },
    "&.Mui-focused fieldset": {
      borderColor: brand.primary,
    },
  },
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const Staff = () => {
  const { user, logout, canViewTeam } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [savingRegister, setSavingRegister] = useState(false);
  const [staffTypes, setStaffTypes] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roles: "",
    password: "",
    confirmPassword: "",
  });

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch staff");
      }

      const users = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setStaffList(users);
    } catch (err) {
      setError(err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const loadStaffTypes = async () => {
    try {
      setLoadingRoles(true);
      setRegisterError("");

      const response = await fetch(`${API_BASE_URL}/staff-types`, {
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to load staff types");
      }

      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.staffTypes)
          ? data.staffTypes
          : Array.isArray(data)
            ? data
            : [];

      setStaffTypes(list);
    } catch (err) {
      setRegisterError(err.message || "Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return staffList;

    return staffList.filter((row) => {
      const name = row.name?.toLowerCase() || "";
      const email = row.email?.toLowerCase() || "";
      const roles = row.roles?.toLowerCase() || "";
      const createdAt = formatDateTime(row.createdAt).toLowerCase();
      const updatedAt = formatDateTime(row.updatedAt).toLowerCase();

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        roles.includes(keyword) ||
        createdAt.includes(keyword) ||
        updatedAt.includes(keyword)
      );
    });
  }, [search, staffList]);

  const resetRegisterForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      roles: "",
      password: "",
      confirmPassword: "",
    });
    setRegisterError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleOpenRegister = async () => {
    resetRegisterForm();
    setOpenRegisterDialog(true);
    await loadStaffTypes();
  };

  const handleCloseRegister = () => {
    setOpenRegisterDialog(false);
    resetRegisterForm();
  };

  const handleRegisterChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setRegisterError("First name and last name are required");
      return;
    }

    if (!formData.email.trim()) {
      setRegisterError("Email is required");
      return;
    }

    if (!formData.roles.trim()) {
      setRegisterError("Role is required");
      return;
    }

    if (formData.password.length < 8) {
      setRegisterError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }

    try {
      setSavingRegister(true);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email.trim(),
          roles: formData.roles.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      handleCloseRegister();
      await fetchStaff();
    } catch (err) {
      setRegisterError(err.message || "Registration failed");
    } finally {
      setSavingRegister(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRefresh = () => {
    setSearch("");
    fetchStaff();
  };

  const handleDownload = () => {
    const header = [
      "Name",
      "Email",
      "Role",
      "Create Time",
      "Update Time",
      "Status",
    ];

    const csvRows = filteredRows.map((row) => [
      row.name || "",
      row.email || "",
      row.roles || "",
      formatDateTime(row.createdAt),
      formatDateTime(row.updatedAt),
      "Active",
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
    link.setAttribute("download", "staff-list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setStaffList((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleEdit = (id) => {
    navigate(`/staff/edit/${id}`);
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
                    onClick={handleOpenRegister}
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
                  }}
                  placeholder="Search name, email, role..."
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
                open={openRegisterDialog}
                onClose={handleCloseRegister}
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
                  Add New Staff
                </DialogTitle>

                <Box component="form" onSubmit={handleRegisterSubmit}>
                  <DialogContent sx={{ pt: 1 }}>
                    <Stack spacing={2}>
                      {registerError ? (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                          {registerError}
                        </Alert>
                      ) : null}

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleRegisterChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonOutlineIcon
                                  sx={{ color: brand.primaryDark }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={textFieldStyles}
                        />

                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleRegisterChange}
                          sx={textFieldStyles}
                        />
                      </Box>

                      <TextField
                        fullWidth
                        label="Work Email"
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={handleRegisterChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutlineIcon
                                sx={{ color: brand.primaryDark }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyles}
                      />

                      <TextField
                        select
                        fullWidth
                        label="Roles"
                        name="roles"
                        value={formData.roles}
                        onChange={handleRegisterChange}
                        disabled={loadingRoles}
                        helperText={
                          loadingRoles ? "Loading roles..." : "Select a role"
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AdminPanelSettingsOutlinedIcon
                                sx={{ color: brand.primaryDark }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyles}
                      >
                        <MenuItem value="">Select role</MenuItem>
                        {staffTypes.map((item) => (
                          <MenuItem key={item._id} value={item.name}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={handleRegisterChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon
                                sx={{ color: brand.primaryDark }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                onClick={() =>
                                  setShowPassword((prev) => !prev)
                                }
                              >
                                {showPassword ? (
                                  <VisibilityOffOutlinedIcon
                                    sx={{ color: brand.primaryDark }}
                                  />
                                ) : (
                                  <VisibilityOutlinedIcon
                                    sx={{ color: brand.primaryDark }}
                                  />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyles}
                      />

                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleRegisterChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon
                                sx={{ color: brand.primaryDark }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                onClick={() =>
                                  setShowConfirmPassword((prev) => !prev)
                                }
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOffOutlinedIcon
                                    sx={{ color: brand.primaryDark }}
                                  />
                                ) : (
                                  <VisibilityOutlinedIcon
                                    sx={{ color: brand.primaryDark }}
                                  />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyles}
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
                      onClick={handleCloseRegister}
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
                      disabled={savingRegister}
                      sx={{
                        minWidth: 140,
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
                      {savingRegister ? "Creating..." : "Create Account"}
                    </Button>
                  </DialogActions>
                </Box>
              </Dialog>

              {error && (
                <Typography
                  sx={{ color: brand.danger, mb: 2, fontWeight: 600 }}
                >
                  {error}
                </Typography>
              )}

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
                          width: "15%",
                        }}
                      >
                        Name
                      </TableCell>

                      <TableCell
                        sx={{
                          ...getCellSx(),
                          fontWeight: 800,
                          color: brand.text,
                          width: "20%",
                        }}
                      >
                        Email
                      </TableCell>

                      <TableCell
                        sx={{
                          ...getCellSx(),
                          fontWeight: 800,
                          color: brand.text,
                          width: "13%",
                        }}
                      >
                        Role
                      </TableCell>

                      <TableCell
                        sx={{
                          ...getCellSx(),
                          fontWeight: 800,
                          color: brand.text,
                          width: "17%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Create Time
                      </TableCell>

                      <TableCell
                        sx={{
                          ...getCellSx(),
                          fontWeight: 800,
                          color: brand.text,
                          width: "17%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Update Time
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          ...getCellSx({ align: "center" }),
                          fontWeight: 800,
                          color: brand.text,
                          width: "8%",
                        }}
                      >
                        Status
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          ...getCellSx({ isLast: true, align: "center" }),
                          fontWeight: 800,
                          color: brand.text,
                          width: "10%",
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
                          colSpan={7}
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          Loading staff...
                        </TableCell>
                      </TableRow>
                    ) : filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          No staff found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRows.map((row) => (
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
                          <TableCell
                            sx={{
                              ...getCellSx(),
                              color: brand.text,
                              fontWeight: 600,
                            }}
                          >
                            {row.name || "-"}
                          </TableCell>

                          <TableCell
                            sx={{
                              ...getCellSx(),
                              color: brand.textSoft,
                              wordBreak: "break-word",
                            }}
                          >
                            {row.email || "-"}
                          </TableCell>

                          <TableCell sx={getCellSx()}>
                            <Chip
                              label={row.roles || "-"}
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
                            sx={getCellSx({ align: "center" })}
                          >
                            <Chip
                              label="Active"
                              size="small"
                              sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                backgroundColor: brand.soft,
                                color: brand.primaryDark,
                              }}
                            />
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
                                sx={actionButtonSx}
                                onClick={() => handleEdit(row._id)}
                              >
                                <EditRoundedIcon
                                  sx={{
                                    fontSize: 18,
                                    color: brand.primaryDark,
                                  }}
                                />
                              </IconButton>

                              <IconButton
                                onClick={() => handleDelete(row._id)}
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

export default Staff;