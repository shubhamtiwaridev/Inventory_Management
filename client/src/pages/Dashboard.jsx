import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
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
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import { useAuth } from "../store/AuthContext.jsx";

const sidebarItems = [
  { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/dashboard" },
  { label: "Inventory", icon: <Inventory2RoundedIcon />, path: "/inventory" },
  {
    label: "Orders",
    icon: <ShoppingCartRoundedIcon />,
    badge: 24,
    path: "/orders",
  },
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

const stats = [
  {
    title: "Total Products",
    value: "12,847",
    subtitle: "+8.2%",
    subtitleTone: "success",
    icon: <InventoryRoundedIcon />,
    iconBg: "#e7f1ff",
    iconColor: "#1976d2",
  },
  {
    title: "Low Stock Items",
    value: "142",
    subtitle: "+12 today",
    subtitleTone: "error",
    icon: <WarningAmberRoundedIcon />,
    iconBg: "#fff3e0",
    iconColor: "#ef6c00",
  },
  {
    title: "Total Stock Value",
    value: "$2.4M",
    subtitle: "+3.5%",
    subtitleTone: "success",
    icon: <TrendingUpRoundedIcon />,
    iconBg: "#e8f5e9",
    iconColor: "#2e7d32",
  },
  {
    title: "Orders Pending",
    value: "384",
    subtitle: "24 new",
    subtitleTone: "success",
    icon: <ShoppingCartRoundedIcon />,
    iconBg: "#e3f2fd",
    iconColor: "#0288d1",
  },
];

const orders = [
  {
    id: "#ORD-7821",
    product: "Wireless Headphones",
    category: "Electronics",
    qty: 120,
    status: "Delivered",
    value: "$14,400",
  },
  {
    id: "#ORD-7820",
    product: "Office Chair Pro",
    category: "Furniture",
    qty: 35,
    status: "In Transit",
    value: "$8,750",
  },
  {
    id: "#ORD-7819",
    product: "Standing Desk",
    category: "Furniture",
    qty: 18,
    status: "Processing",
    value: "$10,800",
  },
  {
    id: "#ORD-7818",
    product: "USB-C Hub 7-in-1",
    category: "Electronics",
    qty: 250,
    status: "Delivered",
    value: "$9,500",
  },
  {
    id: "#ORD-7817",
    product: "Ergonomic Keyboard",
    category: "Electronics",
    qty: 80,
    status: "Low Stock",
    value: "$6,400",
  },
];

const categories = [
  { name: "Electronics", units: "4,280 units", progress: 72, color: "#42a5f5" },
  { name: "Furniture", units: "1,950 units", progress: 55, color: "#64b5f6" },
  { name: "Clothing", units: "3,100 units", progress: 38, color: "#fb8c00" },
  { name: "Accessories", units: "2,640 units", progress: 89, color: "#42a5f5" },
  {
    name: "Food & Beverage",
    units: "870 units",
    progress: 20,
    color: "#ef5350",
  },
];

const quickActions = [
  {
    title: "Add New Product",
    icon: <AddRoundedIcon />,
    iconBg: "#e8f0fe",
    iconColor: "#1976d2",
  },
  {
    title: "Create Purchase Order",
    icon: <ShoppingCartRoundedIcon />,
    iconBg: "#e3f2fd",
    iconColor: "#0288d1",
  },
  {
    title: "Schedule Delivery",
    icon: <LocalShippingRoundedIcon />,
    iconBg: "#e8f5e9",
    iconColor: "#2e7d32",
  },
  {
    title: "Generate Report",
    icon: <BarChartRoundedIcon />,
    iconBg: "#f3e5f5",
    iconColor: "#8e24aa",
  },
];

const alerts = [
  {
    title: "Wireless Mouse X200",
    message: "Only 3 units left",
    bg: "#fdecee",
    border: "#f7c7cf",
    iconColor: "#e53935",
  },
  {
    title: "USB-C Cables (3m)",
    message: "Reorder point reached",
    bg: "#fff7e8",
    border: "#f3dfb6",
    iconColor: "#fb8c00",
  },
  {
    title: "Laptop Stand Pro",
    message: "Supplier delay expected",
    bg: "#fff7e8",
    border: "#f3dfb6",
    iconColor: "#fb8c00",
  },
  {
    title: "Gaming Monitor 27”",
    message: "Demand increased this week",
    bg: "#fdecee",
    border: "#f7c7cf",
    iconColor: "#e53935",
  },
];

const topProducts = [
  { rank: "#1", name: "AirPods Pro Max", sold: "482 sold", change: "+18%" },
  { rank: "#2", name: "MacBook Stand", sold: "371 sold", change: "+12%" },
  { rank: "#3", name: "Logitech MX Master", sold: "294 sold", change: "+9%" },
  { rank: "#4", name: "USB-C Hub 7-in-1", sold: "258 sold", change: "+5%" },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "Delivered":
      return {
        bg: "#e8f5e9",
        color: "#2e7d32",
      };
    case "In Transit":
      return {
        bg: "#e3f2fd",
        color: "#0288d1",
      };
    case "Processing":
      return {
        bg: "#fff3e0",
        color: "#ef6c00",
      };
    case "Low Stock":
      return {
        bg: "#ffebee",
        color: "#d32f2f",
      };
    default:
      return {
        bg: "#f3f4f6",
        color: "#475569",
      };
  }
};

const getRoleLabel = (role) => {
  if (role === "superadmin") return "Superadmin";
  if (role === "admin") return "Admin";
  return "User";
};

const softCardSx = {
  borderRadius: 4,
  border: "1px solid rgba(25, 118, 210, 0.08)",
  backgroundColor: "rgba(255,255,255,0.92)",
  boxShadow: "0 20px 50px rgba(17, 38, 146, 0.08)",
};

const Dashboard = () => {
  const { user, logout, canViewTeam } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleSidebarItems = useMemo(() => {
    return sidebarItems.filter((item) => {
      if (item.path === "/team" && !canViewTeam) return false;
      return true;
    });
  }, [canViewTeam]);

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user?.name]);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
           {visibleSidebarItems.map((item) => {
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 22,
                          borderRadius: 2,
                          backgroundColor: "primary.main",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.72rem",
                        }}
                      />
                    ) : null}
                  </Box>
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

              <Chip
                label={getRoleLabel(user?.role)}
                size="small"
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#eef4ff",
                  color: "primary.main",
                  fontWeight: 700,
                }}
              />

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
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "#14213d", mb: 0.5 }}
              >
                Dashboard
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {currentDate}
              </Typography>
              <Typography fontWeight={600} color="#334155">
                Welcome back, {user?.name || "User"}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <TextField
                placeholder="Search products..."
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 280 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(255,255,255,0.92)",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <IconButton
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.92)",
                  border: "1px solid rgba(25,118,210,0.08)",
                }}
              >
                <AddRoundedIcon color="primary" />
              </IconButton>

              <IconButton
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  backgroundColor: "#fff7ed",
                  border: "1px solid rgba(251,146,60,0.18)",
                }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsNoneRoundedIcon sx={{ color: "#fb923c" }} />
                </Badge>
              </IconButton>

              <Avatar sx={{ bgcolor: "primary.main", width: 42, height: 42 }}>
                {initials}
              </Avatar>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 2.5,
            }}
          >
            {stats.map((item) => (
              <Paper
                key={item.title}
                elevation={0}
                sx={{ ...softCardSx, p: 2.25 }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: item.iconBg,
                      color: item.iconColor,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Chip
                    label={item.subtitle}
                    size="small"
                    sx={{
                      borderRadius: 3,
                      fontWeight: 700,
                      backgroundColor:
                        item.subtitleTone === "error" ? "#ffebee" : "#e8f5e9",
                      color:
                        item.subtitleTone === "error" ? "#d32f2f" : "#2e7d32",
                    }}
                  />
                </Stack>

                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ mt: 2, color: "#14213d" }}
                >
                  {item.value}
                </Typography>
                <Typography color="text.secondary" fontWeight={500}>
                  {item.title}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 2fr) 320px" },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Paper elevation={0} sx={{ ...softCardSx, overflow: "hidden" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 2.25, py: 2 }}
              >
                <Typography fontWeight={800} color="#14213d">
                  Recent Orders
                </Typography>
                <Button
                  size="small"
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "#eef4ff",
                    px: 1.8,
                  }}
                >
                  View All
                </Button>
              </Stack>

              <Box sx={{ overflowX: "auto" }}>
                <Box sx={{ minWidth: 760 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1.1fr 1.6fr 1fr 0.6fr 1fr 0.8fr",
                      gap: 2,
                      px: 2.25,
                      py: 1.5,
                      bgcolor: "#f7faff",
                      borderTop: "1px solid rgba(25,118,210,0.06)",
                      borderBottom: "1px solid rgba(25,118,210,0.06)",
                    }}
                  >
                    {[
                      "ORDER ID",
                      "PRODUCT",
                      "CATEGORY",
                      "QTY",
                      "STATUS",
                      "VALUE",
                    ].map((head) => (
                      <Typography
                        key={head}
                        variant="caption"
                        sx={{
                          color: "#64748b",
                          fontWeight: 800,
                          letterSpacing: 0.4,
                        }}
                      >
                        {head}
                      </Typography>
                    ))}
                  </Box>

                  {orders.map((order, index) => {
                    const status = getStatusStyles(order.status);

                    return (
                      <Box
                        key={order.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "1.1fr 1.6fr 1fr 0.6fr 1fr 0.8fr",
                          gap: 2,
                          px: 2.25,
                          py: 1.75,
                          borderBottom:
                            index !== orders.length - 1
                              ? "1px solid rgba(25,118,210,0.06)"
                              : "none",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "primary.main",
                            fontWeight: 700,
                            fontSize: "0.92rem",
                          }}
                        >
                          {order.id}
                        </Typography>

                        <Typography fontWeight={600}>
                          {order.product}
                        </Typography>

                        <Chip
                          label={order.category}
                          size="small"
                          sx={{
                            width: "fit-content",
                            borderRadius: 2,
                            bgcolor: "#f1f5f9",
                            color: "#475569",
                            fontWeight: 600,
                          }}
                        />

                        <Typography fontWeight={600}>{order.qty}</Typography>

                        <Chip
                          label={order.status}
                          size="small"
                          sx={{
                            width: "fit-content",
                            borderRadius: 2,
                            bgcolor: status.bg,
                            color: status.color,
                            fontWeight: 700,
                          }}
                        />

                        <Typography fontWeight={700}>{order.value}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ ...softCardSx, p: 2.25 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography fontWeight={800} color="#14213d">
                  Stock by Category
                </Typography>
                <IconButton size="small">
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack spacing={2}>
                {categories.map((item) => (
                  <Box key={item.name}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.8 }}
                    >
                      <Typography fontWeight={700} fontSize="0.92rem">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.units} · {item.progress}%
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      sx={{
                        height: 7,
                        borderRadius: 999,
                        backgroundColor: "#edf2f7",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 999,
                          backgroundColor: item.color,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "1.15fr 1.2fr 1fr",
              },
              gap: 2,
            }}
          >
            <Paper elevation={0} sx={{ ...softCardSx, p: 2.25 }}>
              <Typography fontWeight={800} color="#14213d" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>

              <Stack spacing={1.4}>
                {quickActions.map((item) => (
                  <Button
                    key={item.title}
                    fullWidth
                    sx={{
                      justifyContent: "flex-start",
                      p: 1.4,
                      borderRadius: 3,
                      border: "1px solid rgba(25,118,210,0.08)",
                      backgroundColor: "#fff",
                      color: "#14213d",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        bgcolor: item.iconBg,
                        color: item.iconColor,
                        display: "grid",
                        placeItems: "center",
                        mr: 1.5,
                      }}
                    >
                      {item.icon}
                    </Box>
                    {item.title}
                  </Button>
                ))}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ ...softCardSx, p: 2.25 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography fontWeight={800} color="#14213d">
                  Stock Alerts
                </Typography>
                <Badge badgeContent={4} color="error">
                  <WarningAmberRoundedIcon sx={{ color: "#94a3b8" }} />
                </Badge>
              </Stack>

              <Stack spacing={1.25}>
                {alerts.map((alert) => (
                  <Box
                    key={alert.title}
                    sx={{
                      p: 1.6,
                      borderRadius: 3,
                      backgroundColor: alert.bg,
                      border: `1px solid ${alert.border}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.2}
                      alignItems="flex-start"
                    >
                      <WarningAmberRoundedIcon
                        sx={{ color: alert.iconColor, mt: 0.15, fontSize: 18 }}
                      />
                      <Box>
                        <Typography fontWeight={700} fontSize="0.95rem">
                          {alert.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {alert.message}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ ...softCardSx, p: 2.25 }}>
              <Typography fontWeight={800} color="#14213d" sx={{ mb: 2 }}>
                Top Products
              </Typography>

              <Stack spacing={1.4}>
                {topProducts.map((item, index) => (
                  <Box key={item.name}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1.3} alignItems="center">
                        <Box
                          sx={{
                            minWidth: 36,
                            height: 36,
                            px: 1,
                            borderRadius: 2.5,
                            backgroundColor:
                              index === 0 ? "#fff3e0" : "#eef2ff",
                            color: index === 0 ? "#ef6c00" : "#5b6b92",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: "0.85rem",
                          }}
                        >
                          {item.rank}
                        </Box>
                        <Box>
                          <Typography fontWeight={700}>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.sold}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography
                        fontWeight={800}
                        sx={{ color: "#2e7d32", fontSize: "0.92rem" }}
                      >
                        {item.change}
                      </Typography>
                    </Stack>

                    {index !== topProducts.length - 1 && (
                      <Divider sx={{ mt: 1.4 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
