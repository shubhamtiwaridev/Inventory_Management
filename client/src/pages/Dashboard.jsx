import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import PlaylistAddCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCircleOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

const brand = {
  primary: "#139B98",
  primaryDark: "#0D6766",
  pageBg: "#F4F7FB",
  panel: "#FFFFFF",
  border: "#E5ECF3",
  text: "#102A43",
  muted: "#6B7A90",
  softBlue: "#EAF3FF",
  softGreen: "#EAF8EF",
  softOrange: "#FFF4E5",
  softRed: "#FDECEC",
  softPurple: "#F4ECFF",
};

const menuItems = [
  { label: "Dashboard", icon: DashboardRoundedIcon, active: true },
  { label: "Inventory", icon: Inventory2OutlinedIcon },
  { label: "Orders", icon: ReceiptLongOutlinedIcon, badge: 24 },
  { label: "Suppliers", icon: LocalShippingOutlinedIcon },
  { label: "Warehouses", icon: WarehouseOutlinedIcon },
  { label: "Categories", icon: CategoryOutlinedIcon },
  { label: "Reports", icon: BarChartRoundedIcon },
  { label: "Team", icon: Groups2OutlinedIcon },
];

const statCards = [
  {
    title: "Total Products",
    value: "12,847",
    change: "+8.2%",
    icon: Inventory2OutlinedIcon,
    iconBg: brand.softBlue,
    changeBg: brand.softGreen,
    changeColor: "#2E7D32",
  },
  {
    title: "Low Stock Items",
    value: "142",
    change: "+12 today",
    icon: WarningAmberRoundedIcon,
    iconBg: brand.softOrange,
    changeBg: "#FDECEC",
    changeColor: "#D32F2F",
  },
  {
    title: "Total Stock Value",
    value: "$2.4M",
    change: "+3.5%",
    icon: TrendingUpRoundedIcon,
    iconBg: brand.softGreen,
    changeBg: brand.softGreen,
    changeColor: "#2E7D32",
  },
  {
    title: "Orders Pending",
    value: "384",
    change: "24 new",
    icon: ShoppingCartOutlinedIcon,
    iconBg: brand.softBlue,
    changeBg: brand.softGreen,
    changeColor: "#2E7D32",
  },
];

const recentOrders = [
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

const stockByCategory = [
  { name: "Electronics", units: 4280, percent: 72, color: "#3B82F6" },
  { name: "Furniture", units: 1950, percent: 55, color: "#3B82F6" },
  { name: "Clothing", units: 3100, percent: 38, color: "#F59E0B" },
  { name: "Accessories", units: 2640, percent: 89, color: "#3B82F6" },
  { name: "Food & Beverage", units: 870, percent: 20, color: "#EF4444" },
];

const quickActions = [
  { label: "Add New Product", icon: AddBoxOutlinedIcon, bg: brand.softBlue },
  {
    label: "Create Purchase Order",
    icon: PlaylistAddCircleOutlinedIcon,
    bg: "#EAF7FF",
  },
  {
    label: "Schedule Delivery",
    icon: EventAvailableOutlinedIcon,
    bg: brand.softGreen,
  },
  { label: "Generate Report", icon: AssessmentOutlinedIcon, bg: brand.softPurple },
];

const stockAlerts = [
  {
    title: "Wireless Mouse X200",
    subtitle: "Only 3 units left",
    tone: "error",
  },
  {
    title: "USB-C Cables (3m)",
    subtitle: "Reorder point reached",
    tone: "warning",
  },
  {
    title: "Laptop Stand Pro",
    subtitle: "Stock below minimum",
    tone: "warning",
  },
  {
    title: 'Monitor 27" 4K',
    subtitle: "Out of stock",
    tone: "error",
  },
];

const topProducts = [
  { rank: 1, name: "AirPods Pro Max", sold: 482, growth: "+18%" },
  { rank: 2, name: "MacBook Stand", sold: 371, growth: "+12%" },
  { rank: 3, name: "Logitech MX Master", sold: 294, growth: "+9%" },
  { rank: 4, name: "USB-C Hub 7-in-1", sold: 258, growth: "+5%" },
];

const statusTone = {
  Delivered: { bg: "#E8F5E9", color: "#2E7D32" },
  "In Transit": { bg: "#E3F2FD", color: "#1976D2" },
  Processing: { bg: "#FFF3E0", color: "#EF6C00" },
  "Low Stock": { bg: "#FDECEC", color: "#D32F2F" },
};

const alertTone = {
  error: {
    bg: "#FDECEC",
    iconColor: "#E53935",
  },
  warning: {
    bg: "#FFF7E8",
    iconColor: "#FB8C00",
  },
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return "JD";

    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user?.name]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: brand.pageBg,
      }}
    >
      <Box
        sx={{
          width: { xs: 88, md: 260 },
          bgcolor: "#fff",
          borderRight: `1px solid ${brand.border}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          height: "100vh",
          p: 2,
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4, px: 0.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: brand.primary,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Inventory2OutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Typography sx={{ fontWeight: 800, color: brand.text, lineHeight: 1.1 }}>
                StockSense
              </Typography>
              <Typography sx={{ color: brand.muted, fontSize: "0.82rem" }}>
                Inventory Suite
              </Typography>
            </Box>
          </Stack>

          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: brand.muted,
              letterSpacing: 1,
              px: 1,
              mb: 1.2,
              display: { xs: "none", md: "block" },
            }}
          >
            MAIN MENU
          </Typography>

          <Stack spacing={0.8}>
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Button
                  key={item.label}
                  startIcon={<Icon />}
                  endIcon={
                    item.badge ? (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 22,
                          borderRadius: 999,
                          fontWeight: 700,
                          bgcolor: "#E8F1FF",
                          color: "#1D4ED8",
                          display: { xs: "none", md: "inline-flex" },
                        }}
                      />
                    ) : null
                  }
                  sx={{
                    justifyContent: { xs: "center", md: "space-between" },
                    px: { xs: 1, md: 1.5 },
                    py: 1.4,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                    color: item.active ? "#1976D2" : brand.text,
                    bgcolor: item.active ? "#EEF5FF" : "transparent",
                    border: item.active ? "1px solid #DCEAFF" : "1px solid transparent",
                    minHeight: 50,
                    "& .MuiButton-startIcon": {
                      mr: { xs: 0, md: 1.2 },
                    },
                    "& .MuiButton-endIcon": {
                      ml: 1,
                    },
                    "&:hover": {
                      bgcolor: item.active ? "#EEF5FF" : "#F8FAFC",
                    },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                    {item.label}
                  </Box>
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Box>
          <Button
            startIcon={<SettingsOutlinedIcon />}
            sx={{
              justifyContent: { xs: "center", md: "flex-start" },
              width: "100%",
              mb: 2,
              borderRadius: 2.5,
              py: 1.2,
              textTransform: "none",
              fontWeight: 700,
              color: brand.text,
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
              Settings
            </Box>
          </Button>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 3,
              border: `1px solid ${brand.border}`,
              bgcolor: "#F8FBFF",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Avatar sx={{ bgcolor: "#1976D2", width: 42, height: 42 }}>
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0, display: { xs: "none", md: "block" } }}>
                <Typography sx={{ fontWeight: 800, color: brand.text }} noWrap>
                  {user?.name || "John Doe"}
                </Typography>
                <Typography sx={{ color: brand.muted, fontSize: "0.88rem" }} noWrap>
                  {user?.email || "Admin"}
                </Typography>
              </Box>
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} sx={{ ml: "auto" }}>
                  <LogoutRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            bgcolor: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(8px)",
            borderBottom: `1px solid ${brand.border}`,
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, color: brand.text, fontSize: "1.8rem" }}>
                Dashboard
              </Typography>
              <Typography sx={{ color: brand.muted, mt: 0.5 }}>{today}</Typography>
            </Box>

            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ width: { xs: "100%", lg: "auto" } }}>
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1.1,
                  minWidth: { xs: "100%", sm: 290 },
                  borderRadius: 3,
                  border: `1px solid ${brand.border}`,
                  bgcolor: "#F8FBFF",
                }}
              >
                <SearchRoundedIcon sx={{ color: brand.muted }} />
                <Typography sx={{ color: "#97A6BA", fontSize: "0.95rem" }}>
                  Search products...
                </Typography>
              </Paper>

              <IconButton
                sx={{
                  width: 46,
                  height: 46,
                  bgcolor: "#fff",
                  border: `1px solid ${brand.border}`,
                  borderRadius: 3,
                }}
              >
                <AddRoundedIcon />
              </IconButton>

              <Box sx={{ position: "relative" }}>
                <IconButton
                  sx={{
                    width: 46,
                    height: 46,
                    bgcolor: "#fff",
                    border: `1px solid ${brand.border}`,
                    borderRadius: 3,
                  }}
                >
                  <NotificationsNoneRoundedIcon />
                </IconButton>
                <Box
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#E53935",
                    border: "2px solid #fff",
                  }}
                />
              </Box>

              <Avatar sx={{ bgcolor: "#1976D2", width: 46, height: 46 }}>{initials}</Avatar>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2.5,
              mb: 2.5,
            }}
          >
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <Paper
                  key={card.title}
                  elevation={0}
                  sx={{
                    p: 2.25,
                    borderRadius: 4,
                    border: `1px solid ${brand.border}`,
                    height: "100%",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 3,
                        bgcolor: card.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ color: brand.text }} />
                    </Box>

                    <Chip
                      label={card.change}
                      size="small"
                      sx={{
                        bgcolor: card.changeBg,
                        color: card.changeColor,
                        fontWeight: 700,
                        borderRadius: 999,
                      }}
                    />
                  </Stack>

                  <Typography sx={{ mt: 3, fontSize: "2rem", fontWeight: 900, color: brand.text }}>
                    {card.value}
                  </Typography>
                  <Typography sx={{ color: brand.muted, fontWeight: 600 }}>{card.title}</Typography>
                </Paper>
              );
            })}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "2.3fr 1fr" },
              gap: 2.5,
              mb: 2.5,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                border: `1px solid ${brand.border}`,
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2.2, pb: 1.4 }}
              >
                <Typography sx={{ fontWeight: 800, color: brand.text }}>Recent Orders</Typography>
                <Button
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#EEF5FF",
                    color: "#1976D2",
                    borderRadius: 999,
                    px: 1.4,
                  }}
                >
                  View All
                </Button>
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {[
                        "Order ID",
                        "Product",
                        "Category",
                        "Qty",
                        "Status",
                        "Value",
                      ].map((head) => (
                        <TableCell
                          key={head}
                          sx={{
                            color: brand.muted,
                            fontWeight: 800,
                            fontSize: "0.78rem",
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                            borderBottom: `1px solid ${brand.border}`,
                            bgcolor: "#F8FBFF",
                          }}
                        >
                          {head}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ color: "#1976D2", fontWeight: 700 }}>{row.id}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: brand.text }}>{row.product}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.category}
                            size="small"
                            sx={{
                              bgcolor: "#F2F6FB",
                              color: brand.text,
                              fontWeight: 700,
                              borderRadius: 999,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: brand.text }}>{row.qty}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            sx={{
                              bgcolor: statusTone[row.status].bg,
                              color: statusTone[row.status].color,
                              fontWeight: 800,
                              borderRadius: 2,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: brand.text }}>{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.2, borderRadius: 4, border: `1px solid ${brand.border}` }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 800, color: brand.text }}>Stock by Category</Typography>
                <IconButton size="small">
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack spacing={2}>
                {stockByCategory.map((item) => (
                  <Box key={item.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                      <Typography sx={{ fontWeight: 700, color: brand.text, fontSize: "0.95rem" }}>
                        {item.name}
                      </Typography>
                      <Typography sx={{ color: brand.muted, fontSize: "0.9rem" }}>
                        {item.units.toLocaleString()} units · {item.percent}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={item.percent}
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: "#E9EFF7",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: item.color,
                          borderRadius: 999,
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
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
              gap: 2.5,
            }}
          >
            <Paper elevation={0} sx={{ p: 2.2, borderRadius: 4, border: `1px solid ${brand.border}`, height: "100%" }}>
              <Typography sx={{ fontWeight: 800, color: brand.text, mb: 2 }}>Quick Actions</Typography>
              <Stack spacing={1.2}>
                {quickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.label}
                      startIcon={
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 2.5,
                            bgcolor: item.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon sx={{ fontSize: 19, color: brand.text }} />
                        </Box>
                      }
                      sx={{
                        justifyContent: "flex-start",
                        px: 1.2,
                        py: 1.5,
                        borderRadius: 3,
                        border: `1px solid ${brand.border}`,
                        textTransform: "none",
                        fontWeight: 700,
                        color: brand.text,
                        bgcolor: "#fff",
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.2, borderRadius: 4, border: `1px solid ${brand.border}`, height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 800, color: brand.text }}>Stock Alerts</Typography>
                <Box sx={{ position: "relative", pr: 1 }}>
                  <WarningAmberRoundedIcon sx={{ color: brand.muted }} />
                  <Box
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -6,
                      minWidth: 20,
                      height: 20,
                      px: 0.5,
                      borderRadius: 999,
                      bgcolor: "#E53935",
                      color: "#fff",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    4
                  </Box>
                </Box>
              </Stack>

              <Stack spacing={1.2}>
                {stockAlerts.map((alert) => (
                  <Box
                    key={alert.title}
                    sx={{
                      p: 1.8,
                      borderRadius: 3,
                      bgcolor: alertTone[alert.tone].bg,
                      display: "flex",
                      gap: 1.4,
                    }}
                  >
                    <Box sx={{ pt: 0.15 }}>
                      <CircleRoundedIcon sx={{ fontSize: 12, color: alertTone[alert.tone].iconColor }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: brand.text }}>{alert.title}</Typography>
                      <Typography sx={{ color: brand.muted, fontSize: "0.92rem", mt: 0.35 }}>
                        {alert.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 2.2, borderRadius: 4, border: `1px solid ${brand.border}`, height: "100%" }}>
              <Typography sx={{ fontWeight: 800, color: brand.text, mb: 2 }}>Top Products</Typography>
              <Stack divider={<Divider flexItem sx={{ borderColor: "#EEF2F7" }} />}>
                {topProducts.map((item) => (
                  <Stack
                    key={item.rank}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ py: 1.6 }}
                  >
                    <Stack direction="row" spacing={1.4} alignItems="center">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          bgcolor: item.rank === 1 ? "#FFF4E5" : "#F2F6FB",
                          color: item.rank === 1 ? "#F59E0B" : brand.muted,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.92rem",
                        }}
                      >
                        #{item.rank}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: brand.text }}>{item.name}</Typography>
                        <Typography sx={{ color: brand.muted, fontSize: "0.92rem" }}>
                          {item.sold} sold
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography sx={{ color: "#2E7D32", fontWeight: 800 }}>{item.growth}</Typography>
                  </Stack>
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