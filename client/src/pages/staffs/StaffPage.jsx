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
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";

import { useAuth } from "../../store/AuthContext.jsx";
import SideBar from "../SideBar.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
  shadowStrong:
    "0 0 0 1px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.10)",
  danger: "#C2410C",
  dangerSoft: "#FFF1EE",
  fieldBg: "#F8FCFC",
  muted: "#5F6F73",
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

const StaffPage = () => {
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

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    roles: "",
    password: "",
    requestPending: false,
  });

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);
  const isSuperadmin = useMemo(
    () => String(user?.roles || "").toLowerCase() === "superadmin",
    [user?.roles],
  );

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/staff-page`, {
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
      const name = String(row.name || "").toLowerCase();
      const roles = String(row.roles || "").toLowerCase();
      const passwordStatus = (
        row.passwordChangeRequest
          ? "request pending"
          : row.passwordChangeRequestMessage || "no request"
      ).toLowerCase();
      const requestTime = row.passwordChangeRequest
        ? formatDateTime(row.passwordChangeRequestAt).toLowerCase()
        : "-";
      const status = (
        row.isVerified === false ? "pending" : "active"
      ).toLowerCase();

      return (
        name.includes(keyword) ||
        roles.includes(keyword) ||
        passwordStatus.includes(keyword) ||
        requestTime.includes(keyword) ||
        status.includes(keyword)
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

  const resetEditForm = () => {
    setEditFormData({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      roles: "",
      password: "",
      requestPending: false,
    });
    setEditError("");
    setShowEditPassword(false);
  };

  const handleOpenEdit = async (row) => {
    await loadStaffTypes();

    const parts = String(row.name || "")
      .trim()
      .split(" ");

    setEditFormData({
      id: row._id,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
      email: row.email || "",
      roles: row.roles || "",
      password: "",
      requestPending: !!row.passwordChangeRequest,
    });

    setEditError("");
    setOpenEditDialog(true);
  };

  const handleCloseEdit = () => {
    setOpenEditDialog(false);
    resetEditForm();
  };

  const handleEditChange = (e) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editFormData.firstName.trim() || !editFormData.lastName.trim()) {
      setEditError("First name and last name are required");
      return;
    }

    if (!editFormData.email.trim()) {
      setEditError("Email is required");
      return;
    }

    if (!editFormData.roles.trim()) {
      setEditError("Role is required");
      return;
    }

    if (editFormData.requestPending && !editFormData.password.trim()) {
      setEditError("Please enter new password");
      return;
    }

    if (editFormData.password && editFormData.password.length < 8) {
      setEditError("Password must be at least 8 characters");
      return;
    }

    try {
      setSavingEdit(true);

      const response = await fetch(
        `${API_BASE_URL}/staff-page/${editFormData.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${editFormData.firstName} ${editFormData.lastName}`.trim(),
            email: editFormData.email.trim().toLowerCase(),
            roles: editFormData.roles.trim(),
            password: editFormData.password.trim(),
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      const updatedUser = data.user || data.data;

      setStaffList((prev) =>
        prev.map((item) => (item._id === editFormData.id ? updatedUser : item)),
      );

      handleCloseEdit();
    } catch (err) {
      setEditError(err.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenRegister = async (event) => {
    event?.currentTarget?.blur();

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    resetRegisterForm();
    await loadStaffTypes();
    setOpenRegisterDialog(true);
  };

  const handleCloseRegister = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

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

      const response = await fetch(`${API_BASE_URL}/staff-page`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email.trim().toLowerCase(),
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

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/staff-page/${id}`, {
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

  const handleVerify = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff-page/${id}/verify`, {
        method: "PATCH",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      const updatedUser = data.user || data.data;

      setStaffList((prev) =>
        prev.map((item) => (item._id === id ? updatedUser : item)),
      );
    } catch (err) {
      alert(err.message || "Failed to verify user");
    }
  };

  const handleCancelPasswordRequest = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this password request?",
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/staff-page/${id}/clear-password-request`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel password request");
      }

      const updatedUser = data.user || data.data;

      setStaffList((prev) =>
        prev.map((item) => (item._id === id ? updatedUser : item)),
      );
    } catch (err) {
      alert(err.message || "Failed to cancel password request");
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
          <Box
            sx={{
              mb: 2,
              px: { xs: 1, sm: 2 },
              pt: 1,
              backgroundColor: "#FFFFFF",
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
                </Stack>

                <TextField
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  placeholder="Search name, role, status..."
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
                disableRestoreFocus
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
                          autoFocus
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
                                onClick={() => setShowPassword((prev) => !prev)}
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

              <Dialog
                open={openEditDialog}
                onClose={handleCloseEdit}
                fullWidth
                maxWidth="sm"
                disableRestoreFocus
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
                  Update Staff
                </DialogTitle>

                <Box component="form" onSubmit={handleEditSubmit}>
                  <DialogContent sx={{ pt: 1 }}>
                    <Stack spacing={2}>
                      {editError ? (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                          {editError}
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
                          autoFocus
                          label="First Name"
                          name="firstName"
                          value={editFormData.firstName}
                          onChange={handleEditChange}
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
                          value={editFormData.lastName}
                          onChange={handleEditChange}
                          sx={textFieldStyles}
                        />
                      </Box>

                      <TextField
                        fullWidth
                        label="Work Email"
                        name="email"
                        type="email"
                        value={editFormData.email}
                        onChange={handleEditChange}
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
                        value={editFormData.roles}
                        onChange={handleEditChange}
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
                        label={
                          editFormData.requestPending
                            ? "New Password (Required)"
                            : "New Password (Optional)"
                        }
                        name="password"
                        type={showEditPassword ? "text" : "password"}
                        value={editFormData.password}
                        onChange={handleEditChange}
                        placeholder="Enter new password"
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
                                  setShowEditPassword((prev) => !prev)
                                }
                              >
                                {showEditPassword ? (
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
                      onClick={handleCloseEdit}
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
                      disabled={savingEdit}
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
                      {savingEdit ? "Updating..." : "Update"}
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
                    minWidth: 980,
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
                          width: "20%",
                        }}
                      >
                        Name
                      </TableCell>

                      <TableCell
                        sx={{
                          ...getCellSx(),
                          fontWeight: 800,
                          color: brand.text,
                          width: "16%",
                        }}
                      >
                        Role
                      </TableCell>

                      <TableCell
                        sx={{
                          ...getCellSx(),
                          fontWeight: 800,
                          color: brand.text,
                          width: "18%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Password Status
                      </TableCell>

                      <TableCell
                        sx={{
                          ...getCellSx(),
                          fontWeight: 800,
                          color: brand.text,
                          width: "18%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Request Time
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          ...getCellSx({ align: "center" }),
                          fontWeight: 800,
                          color: brand.text,
                          width: "12%",
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
                          width: "16%",
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
                          colSpan={6}
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          Loading staff...
                        </TableCell>
                      </TableRow>
                    ) : filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
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

                          <TableCell sx={getCellSx()}>
                            <Chip
                              label={
                                row.passwordChangeRequest
                                  ? "Request Pending"
                                  : row.passwordChangeRequestMessage ||
                                    "No Request"
                              }
                              size="small"
                              sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                backgroundColor: row.passwordChangeRequest
                                  ? "#FFF8ED"
                                  : brand.soft,
                                color: row.passwordChangeRequest
                                  ? "#D97706"
                                  : brand.primaryDark,
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
                            {row.passwordChangeRequest
                              ? formatDateTime(row.passwordChangeRequestAt)
                              : "-"}
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={getCellSx({ align: "center" })}
                          >
                            <Chip
                              label={
                                row.isVerified === false ? "Pending" : "Active"
                              }
                              size="small"
                              sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                backgroundColor:
                                  row.isVerified === false
                                    ? "#FFF8ED"
                                    : brand.soft,
                                color:
                                  row.isVerified === false
                                    ? "#D97706"
                                    : brand.primaryDark,
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
                              {row.passwordChangeRequest ? (
                                <IconButton
                                  sx={actionButtonSx}
                                  onClick={() =>
                                    handleCancelPasswordRequest(row._id)
                                  }
                                >
                                  <HighlightOffRoundedIcon
                                    sx={{
                                      fontSize: 18,
                                      color: brand.danger,
                                    }}
                                  />
                                </IconButton>
                              ) : null}
                              <IconButton
                                sx={actionButtonSx}
                                onClick={() => handleOpenEdit(row)}
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

                              {row.isVerified === false && isSuperadmin ? (
                                <IconButton
                                  sx={actionButtonSx}
                                  onClick={() => handleVerify(row._id)}
                                >
                                  <TaskAltRoundedIcon
                                    sx={{
                                      fontSize: 18,
                                      color: brand.primaryDark,
                                    }}
                                  />
                                </IconButton>
                              ) : null}
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

export default StaffPage;
