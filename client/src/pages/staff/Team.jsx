import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import logo from "../../assets/logo.png";
import { useAuth } from "../../store/AuthContext.jsx";
import RefreshButton from "../../components/RefreshButton.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const brand = {
  primary: "#106C6B",
  primaryDark: "#0C5A58",
  primaryLight: "#17A89F",
  soft: "#F4F6F8",
  softAlt: "#FFFFFF",
  border: "rgba(15, 23, 42, 0.08)",
  text: "#143736",
  textSoft: "#617776",
  pageBg: "linear-gradient(180deg, #F8FAFC 0%, #F5F7FA 45%, #F2F5F8 100%)",
  shadow:
    "0 0 0 1px rgba(15, 23, 42, 0.03), 0 12px 30px rgba(15, 23, 42, 0.08)",
  shadowStrong:
    "0 0 0 1px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.10)",
};

const sidebarItems = [
  { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/dashboard" },
  { label: "Inventory", icon: <Inventory2RoundedIcon />, path: "/inventory" },
  { label: "Orders", icon: <ShoppingCartRoundedIcon />, path: "/orders" },
  {
    label: "Suppliers",
    icon: <LocalShippingRoundedIcon />,
    path: "/suppliers",
  },
  { label: "Warehouses", icon: <WarehouseRoundedIcon />, path: "/warehouses" },
  { label: "Categories", icon: <CategoryRoundedIcon />, path: "/categories" },
  { label: "Reports", icon: <BarChartRoundedIcon />, path: "/reports" },
  { label: "Team", icon: <Groups2RoundedIcon />, path: "/team" },
];

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  boxShadow: brand.shadow,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
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
  "& .MuiInputLabel-root.Mui-focused": {
    color: brand.primary,
  },
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  const pad = (num) => String(num).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

const tableColumns =
  "minmax(280px,1.5fr) minmax(170px,0.9fr) minmax(220px,1fr) minmax(220px,1fr) 120px";

const Team = () => {
  const { user, logout, canViewTeam } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const topTabs = [
    {
      label: "STAFF",
      icon: <PersonOutlineRoundedIcon />,
      path: "/team",
    },
    {
      label: "CHECK CODE",
      icon: <FactCheckOutlinedIcon />,
      path: "/team/check-code",
    },
    {
      label: "STAFF TYPE",
      icon: <ShieldOutlinedIcon />,
      path: "/team/staff-type",
    },
  ];

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user?.name]);

  const fetchUsers = useCallback(async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setTeamMembers(data.users || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (!canViewTeam) {
      navigate("/dashboard", { replace: true });
      return;
    }

    fetchUsers();
  }, [canViewTeam, fetchUsers, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openEditDialog = (member) => {
    setSelectedUser(member);
    setEditForm({
      email: member.email || "",
      password: "",
      confirmPassword: "",
    });
    setEditOpen(true);
  };

  const closeEditDialog = () => {
    setEditOpen(false);
    setSelectedUser(null);
    setEditForm({
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const openDeleteDialog = (member) => {
    setSelectedUser(member);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setSelectedUser(null);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setError("Password and confirm password do not match");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const payload = {
        email: editForm.email,
      };

      if (editForm.password) {
        payload.password = editForm.password;
      }

      const response = await fetch(`${API_URL}/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      closeEditDialog();
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/users/${selectedUser._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      closeDeleteDialog();
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyUser = async (id) => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/users/${id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify user");
      }

      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to verify user");
    } finally {
      setActionLoading(false);
    }
  };

  const totalUsers = teamMembers.length;
  const totalForgotPasswordRequests = teamMembers.filter(
    (item) => item.forgotPasswordRequested,
  ).length;
  const totalPendingVerification = teamMembers.filter(
    (item) => !item.isVerified,
  ).length;

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return teamMembers;

    return teamMembers.filter((member) => {
      const values = [
        member.name,
        member.email,
        member.staffType,
        member.role,
        member.isVerified ? "verified" : "pending",
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      );
    });
  }, [teamMembers, search]);

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
        <Box
          sx={{
            width: { xs: "100%", md: 250 },
            borderRight: { md: `1px solid ${brand.border}` },
            borderBottom: { xs: `1px solid ${brand.border}`, md: "none" },
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            px: 2.5,
            py: 3,
            display: "flex",
            flexDirection: "column",
            boxShadow: brand.shadow,
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              mb: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              px: 0.5,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Decostyle"
              sx={{
                width: 170,
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: brand.textSoft,
              fontWeight: 700,
              letterSpacing: 1,
              mb: 1.5,
              px: 1,
            }}
          >
            MAIN MENU
          </Typography>

          <Stack spacing={0.75}>
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.label}
                  startIcon={item.icon}
                  fullWidth
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: "flex-start",
                    borderRadius: 3,
                    px: 1.5,
                    py: 1.2,
                    color: isActive ? brand.primary : brand.text,
                    backgroundColor: isActive ? "#F4F6F8" : "transparent",
                    fontWeight: isActive ? 700 : 600,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#F4F6F8",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Box sx={{ mt: "auto", pt: 4 }}>
            <Button
              startIcon={<SettingsRoundedIcon />}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                borderRadius: 3,
                px: 1.5,
                py: 1.2,
                color: brand.text,
                fontWeight: 600,
                textTransform: "none",
                mb: 2,
                "&:hover": {
                  backgroundColor: "#F4F6F8",
                },
              }}
            >
              Settings
            </Button>

            <Paper
              elevation={0}
              sx={{
                ...softCardSx,
                p: 2.2,
                borderRadius: 4,
                boxShadow: brand.shadowStrong,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Avatar
                  sx={{
                    bgcolor: brand.primary,
                    width: 42,
                    height: 42,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} sx={{ color: brand.text }} noWrap>
                    {user?.name || "User"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: brand.textSoft }}
                    noWrap
                  >
                    {user?.email || "user@example.com"}
                  </Typography>
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<LogoutRoundedIcon />}
                onClick={handleLogout}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  color: brand.primary,
                  borderColor: brand.border,
                  "&:hover": {
                    borderColor: brand.primaryLight,
                    backgroundColor: "#F7F9FB",
                  },
                }}
              >
                Logout
              </Button>
            </Paper>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "transparent",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              pt: 0.75,
              borderBottom: `1px solid ${brand.border}`,
              backgroundColor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              boxShadow: brand.shadow,
            }}
          >
            <Stack
              direction="row"
              spacing={0}
              sx={{
                overflowX: "auto",
                alignItems: "stretch",
              }}
            >
              {topTabs.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Box
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    sx={{
                      minWidth: 120,
                      px: { xs: 2, md: 2.5 },
                      pt: 1.2,
                      pb: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.4,
                      color: isActive ? "#000000" : "#3f3f46",
                      borderBottom: isActive
                        ? "3px solid #111111"
                        : "3px solid transparent",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        color: isActive ? "#000000" : "#444444",
                        "& svg": {
                          fontSize: 24,
                        },
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: "0.95rem",
                        fontWeight: isActive ? 700 : 600,
                        whiteSpace: "nowrap",
                        lineHeight: 1.1,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 2, md: 3 },
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2.5,
                  backgroundColor: "#fff",
                  boxShadow: brand.shadow,
                }}
              >
                {error}
              </Alert>
            )}

            {user?.role === "superadmin" && totalForgotPasswordRequests > 0 && (
              <Alert
                severity="warning"
                sx={{
                  mb: 2,
                  borderRadius: 2.5,
                  backgroundColor: "#fff",
                  boxShadow: brand.shadow,
                }}
              >
                {totalForgotPasswordRequests} user(s) requested password reset.
                Use edit to update their password.
              </Alert>
            )}

            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${brand.border}`,
                backgroundColor: "#FFFFFF",
                boxShadow: brand.shadowStrong,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 1.8,
                  borderBottom: `1px solid ${brand.border}`,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Stack
                  direction={{ xs: "column", xl: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", xl: "center" }}
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
                    <Button
                      startIcon={<AddRoundedIcon />}
                      sx={{
                        minWidth: 110,
                        borderRadius: 2.5,
                        color: "#fff",
                        backgroundColor: brand.primary,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 2,
                        boxShadow: "0 8px 20px rgba(16, 108, 107, 0.18)",
                        "&:hover": {
                          backgroundColor: brand.primaryDark,
                        },
                      }}
                    >
                      NEW
                    </Button>

                    <RefreshButton onClick={fetchUsers} loading={loading} />

                    <Button
                      startIcon={<CloudDownloadRoundedIcon />}
                      sx={{
                        minWidth: 140,
                        borderRadius: 2.5,
                        color: brand.primary,
                        backgroundColor: "#fff",
                        border: `1px solid ${brand.border}`,
                        textTransform: "none",
                        fontWeight: 700,
                        px: 2,
                        boxShadow: brand.shadow,
                        "&:hover": {
                          backgroundColor: "#F7F9FB",
                        },
                      }}
                    >
                      DOWNLOAD
                    </Button>
                  </Stack>

                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Word"
                    size="small"
                    sx={{
                      width: { xs: "100%", sm: 280 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        backgroundColor: "#fff",
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
                          <SearchRoundedIcon sx={{ color: brand.primary }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Box>

              <Box sx={{ px: 2, pt: 1.25, pb: 1, backgroundColor: "#FFFFFF" }}>
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    color: brand.textSoft,
                    fontWeight: 600,
                  }}
                >
                  Total Staff: {totalUsers} | Pending Verification:{" "}
                  {totalPendingVerification} | Reset Requests:{" "}
                  {totalForgotPasswordRequests}
                </Typography>
              </Box>

              {loading ? (
                <Box
                  sx={{
                    py: 8,
                    textAlign: "center",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <CircularProgress sx={{ color: brand.primary }} />
                </Box>
              ) : filteredMembers.length === 0 ? (
                <Box sx={{ p: 3, backgroundColor: "#FFFFFF" }}>
                  <Alert
                    severity="info"
                    sx={{ borderRadius: 2, boxShadow: brand.shadow }}
                  >
                    No registered users found.
                  </Alert>
                </Box>
              ) : (
                <Box sx={{ overflowX: "auto", backgroundColor: "#FFFFFF" }}>
                  <Box sx={{ minWidth: 1030 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: tableColumns,
                        alignItems: "stretch",
                        borderTop: `1px solid ${brand.border}`,
                        borderBottom: `1px solid ${brand.border}`,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      {[
                        "Staff Name",
                        "Staff Type",
                        "Create Time",
                        "Update Time",
                        "Action",
                      ].map((head, index) => (
                        <Box
                          key={head}
                          sx={{
                            px: 2,
                            py: 1.35,
                            display: "flex",
                            alignItems: "center",
                            borderRight:
                              index !== 4 ? `1px solid ${brand.border}` : "none",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.88rem",
                              color: brand.text,
                              textAlign: index === 4 ? "center" : "left",
                              width: "100%",
                            }}
                          >
                            {head}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {filteredMembers.map((member, index) => {
                      const isPending = !member.isVerified;
                      const canVerify =
                        user?.role === "superadmin" && !member.isVerified;

                      return (
                        <Box
                          key={member._id}
                          sx={{
                            borderBottom:
                              index !== filteredMembers.length - 1
                                ? `1px solid ${brand.border}`
                                : "none",
                            backgroundColor: "#FFFFFF",
                            "&:hover": {
                              backgroundColor: "#FAFBFC",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: tableColumns,
                              alignItems: "stretch",
                            }}
                          >
                            <Box
                              sx={{
                                px: 2,
                                py: 1.7,
                                display: "flex",
                                alignItems: "center",
                                borderRight: `1px solid ${brand.border}`,
                              }}
                            >
                              <Box sx={{ pr: 1 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 600,
                                    color: brand.text,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {member.name}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    color: brand.textSoft,
                                    mt: 0.4,
                                  }}
                                >
                                  {member.email}
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                px: 2,
                                py: 1.7,
                                display: "flex",
                                alignItems: "center",
                                borderRight: `1px solid ${brand.border}`,
                              }}
                            >
                              <Typography
                                sx={{
                                  width: "fit-content",
                                  px: 1.1,
                                  py: 0.45,
                                  borderRadius: 999,
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  color: "#0C5A58",
                                  backgroundColor: "#EEF4F4",
                                }}
                              >
                                {member.staffType || "-"}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                px: 2,
                                py: 1.7,
                                display: "flex",
                                alignItems: "center",
                                borderRight: `1px solid ${brand.border}`,
                              }}
                            >
                              <Typography
                                sx={{ fontSize: "0.92rem", color: brand.text }}
                              >
                                {formatDateTime(member.createdAt)}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                px: 2,
                                py: 1.7,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                borderRight: `1px solid ${brand.border}`,
                              }}
                            >
                              <Typography
                                sx={{ fontSize: "0.92rem", color: brand.text }}
                              >
                                {formatDateTime(
                                  member.updatedAt || member.createdAt,
                                )}
                              </Typography>

                              {member.forgotPasswordRequestedAt && (
                                <Typography
                                  sx={{
                                    fontSize: "0.76rem",
                                    color: "#B45309",
                                    mt: 0.4,
                                    fontWeight: 700,
                                  }}
                                >
                                  Reset:{" "}
                                  {formatDateTime(
                                    member.forgotPasswordRequestedAt,
                                  )}
                                </Typography>
                              )}
                            </Box>

                            <Box
                              sx={{
                                px: 1,
                                py: 1.7,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Stack
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                spacing={0.25}
                              >
                                {member.isVerified ? (
                                  <IconButton
                                    size="small"
                                    disableRipple
                                    sx={{
                                      color: brand.primary,
                                      "&:hover": {
                                        backgroundColor: "transparent",
                                      },
                                    }}
                                  >
                                    <CheckCircleRoundedIcon fontSize="small" />
                                  </IconButton>
                                ) : (
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      if (canVerify) handleVerifyUser(member._id);
                                    }}
                                    disabled={!canVerify || actionLoading}
                                    sx={{
                                      color: brand.primaryLight,
                                    }}
                                  >
                                    <LockOutlinedIcon fontSize="small" />
                                  </IconButton>
                                )}

                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(member)}
                                  sx={{ color: brand.primaryDark }}
                                >
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>

                                <IconButton
                                  size="small"
                                  onClick={() => openDeleteDialog(member)}
                                  sx={{ color: "#B42318" }}
                                >
                                  <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Box>
                          </Box>

                          {isPending && (
                            <Box
                              sx={{
                                px: 2,
                                pb: 1.2,
                                pt: 0,
                                borderTop: `1px solid ${brand.border}`,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.76rem",
                                  color: "#B45309",
                                  fontWeight: 700,
                                }}
                              >
                                Verification pending
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={editOpen}
        onClose={closeEditDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${brand.border}`,
            boxShadow: brand.shadowStrong,
          },
        }}
      >
        <DialogTitle sx={{ color: brand.text, fontWeight: 800 }}>
          Edit User
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={editForm.email}
            onChange={handleEditChange}
            sx={inputSx}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="password"
            type="password"
            value={editForm.password}
            onChange={handleEditChange}
            sx={inputSx}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={editForm.confirmPassword}
            onChange={handleEditChange}
            sx={inputSx}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeEditDialog}
            sx={{ color: brand.textSoft, fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateUser}
            disabled={actionLoading}
            sx={{
              backgroundColor: brand.primary,
              fontWeight: 700,
              "&:hover": {
                backgroundColor: brand.primaryDark,
              },
            }}
          >
            {actionLoading ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${brand.border}`,
            boxShadow: brand.shadowStrong,
          },
        }}
      >
        <DialogTitle sx={{ color: brand.text, fontWeight: 800 }}>
          Delete User
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: brand.text }}>
            Are you sure you want to permanently delete{" "}
            <strong>{selectedUser?.name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: brand.textSoft }}>
            This deletes only the user account record.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeDeleteDialog}
            sx={{ color: brand.textSoft, fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteUser}
            disabled={actionLoading}
            sx={{ fontWeight: 700 }}
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;