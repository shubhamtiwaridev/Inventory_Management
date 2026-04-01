import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import logo from "../assets/logo.png";
import { useAuth } from "../store/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  border: "1px solid rgba(25, 118, 210, 0.08)",
  backgroundColor: "rgba(255,255,255,0.92)",
  boxShadow: "0 20px 50px rgba(17, 38, 146, 0.08)",
};

const getRoleStyle = (role) => {
  if (role === "superadmin") {
    return { bg: "#f3e5f5", color: "#7b1fa2" };
  }
  if (role === "admin") {
    return { bg: "#e3f2fd", color: "#1565c0" };
  }
  return { bg: "#e8f5e9", color: "#2e7d32" };
};

const Team = () => {
  const { user, logout, canViewTeam } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

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
  const totalSuperadmins = teamMembers.filter(
    (item) => item.role === "superadmin",
  ).length;
  const totalAdmins = teamMembers.filter(
    (item) => item.role === "admin",
  ).length;
  const totalNormalUsers = teamMembers.filter(
    (item) => item.role === "user",
  ).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #eef4ff 0%, #f7faff 45%, #eef3fb 100%)",
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
            borderRight: { md: "1px solid rgba(25,118,210,0.08)" },
            borderBottom: { xs: "1px solid rgba(25,118,210,0.08)", md: "none" },
            backgroundColor: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(8px)",
            px: 2.5,
            py: 3,
            display: "flex",
            flexDirection: "column",
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
              alt="StockSense"
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
              color: "#64748b",
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
                    color: isActive ? "primary.main" : "#334155",
                    backgroundColor: isActive ? "#eaf2ff" : "transparent",
                    fontWeight: isActive ? 700 : 600,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: isActive ? "#eaf2ff" : "#f8fbff",
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
                color: "#334155",
                fontWeight: 600,
                textTransform: "none",
                mb: 2,
              }}
            >
              Settings
            </Button>

            <Paper
              elevation={0}
              sx={{ ...softCardSx, p: 2.2, borderRadius: 4 }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Avatar sx={{ bgcolor: "primary.main", width: 42, height: 42 }}>
                  {initials}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>
                    {user?.name || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
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
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#14213d", mb: 0.5 }}
          >
            Team
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            All registered users and their roles
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 3,
            }}
          >
            <Paper elevation={0} sx={{ ...softCardSx, p: 2.5 }}>
              <Typography color="text.secondary">Total Users</Typography>
              <Typography variant="h4" fontWeight={800}>
                {totalUsers}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ ...softCardSx, p: 2.5 }}>
              <Typography color="text.secondary">Superadmins</Typography>
              <Typography variant="h4" fontWeight={800}>
                {totalSuperadmins}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ ...softCardSx, p: 2.5 }}>
              <Typography color="text.secondary">Admins</Typography>
              <Typography variant="h4" fontWeight={800}>
                {totalAdmins}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ ...softCardSx, p: 2.5 }}>
              <Typography color="text.secondary">Users</Typography>
              <Typography variant="h4" fontWeight={800}>
                {totalNormalUsers}
              </Typography>
            </Paper>
          </Box>

          <Paper elevation={0} sx={{ ...softCardSx, p: 2.5 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" fontWeight={800}>
                Registered Team Members
              </Typography>

              <Button
                variant="outlined"
                onClick={fetchUsers}
                sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700 }}
              >
                Refresh
              </Button>
            </Stack>

            {loading ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <CircularProgress />
              </Box>
            ) : teamMembers.length === 0 ? (
              <Alert severity="info">No registered users found.</Alert>
            ) : (
              <Stack spacing={1.5}>
                {teamMembers.map((member) => {
                  const roleStyle = getRoleStyle(member.role);

                  return (
                    <Box
                      key={member._id}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid rgba(25,118,210,0.08)",
                        backgroundColor: "#fff",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {member.name?.charAt(0)?.toUpperCase() || "U"}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={700}>
                              {member.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          flexWrap="wrap"
                        >
                          <Chip
                            label={member.role}
                            sx={{
                              backgroundColor: roleStyle.bg,
                              color: roleStyle.color,
                              fontWeight: 700,
                              textTransform: "capitalize",
                            }}
                          />
                          <Chip
                            label={member.isVerified ? "Verified" : "Pending"}
                            size="small"
                            sx={{
                              backgroundColor: member.isVerified
                                ? "#e8f5e9"
                                : "#fff3e0",
                              color: member.isVerified ? "#2e7d32" : "#ef6c00",
                              fontWeight: 700,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Joined:{" "}
                            {new Date(member.createdAt).toLocaleDateString()}
                          </Typography>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditRoundedIcon />}
                            onClick={() => openEditDialog(member)}
                            sx={{
                              borderRadius: 3,
                              textTransform: "none",
                              fontWeight: 700,
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteRoundedIcon />}
                            onClick={() => openDeleteDialog(member)}
                            sx={{
                              borderRadius: 3,
                              textTransform: "none",
                              fontWeight: 700,
                            }}
                          >
                            Delete
                          </Button>
                          {!member.isVerified && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<CheckCircleRoundedIcon />}
                              onClick={() => handleVerifyUser(member._id)}
                              disabled={actionLoading}
                              sx={{
                                borderRadius: 3,
                                textTransform: "none",
                                fontWeight: 700,
                              }}
                            >
                              Verify
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>

      <Dialog open={editOpen} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={editForm.email}
            onChange={handleEditChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="password"
            type="password"
            value={editForm.password}
            onChange={handleEditChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={editForm.confirmPassword}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateUser}
            disabled={actionLoading}
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
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete{" "}
            <strong>{selectedUser?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This deletes only the user account record.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteUser}
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;
