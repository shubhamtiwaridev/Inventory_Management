import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserMenu from "../../components/UserMenu.jsx";
import {
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

import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import BuildCircleRoundedIcon from "@mui/icons-material/BuildCircleRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";

import logo from "../../assets/decostyle-logo.png";
import { useAuth } from "../../store/AuthContext.jsx";
import { getCards } from "../../pages/staffs/staffApi";
import { createLogActivity } from "../log-activity/logActivityApi.js";

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
  { name: "Electronics", units: "4,280 units", progress: 72, color: "#17A89F" },
  { name: "Furniture", units: "1,950 units", progress: 55, color: "#106C6B" },
  { name: "Clothing", units: "3,100 units", progress: 38, color: "#4FB8B0" },
  { name: "Accessories", units: "2,640 units", progress: 89, color: "#0C5A58" },
  {
    name: "Food & Beverage",
    units: "870 units",
    progress: 20,
    color: "#D97706",
  },
];

const quickActions = [
  {
    title: "Add New Product",
    icon: <AddRoundedIcon />,
    iconBg: "#F3F5F7",
    iconColor: "#106C6B",
  },
  {
    title: "Create Purchase Order",
    icon: <ShoppingCartRoundedIcon />,
    iconBg: "#F3F5F7",
    iconColor: "#12807B",
  },
  {
    title: "Schedule Delivery",
    icon: <LocalShippingRoundedIcon />,
    iconBg: "#F3F5F7",
    iconColor: "#0C5A58",
  },
  {
    title: "Generate Report",
    icon: <BarChartRoundedIcon />,
    iconBg: "#F3F5F7",
    iconColor: "#106C6B",
  },
];

const alerts = [
  {
    title: "Wireless Mouse X200",
    message: "Only 3 units left",
    bg: "#FFF3E8",
    border: "#F6D7B8",
    iconColor: "#D97706",
  },
  {
    title: "USB-C Cables (3m)",
    message: "Reorder point reached",
    bg: "#FFF8ED",
    border: "#F4E0BE",
    iconColor: "#D97706",
  },
  {
    title: "Laptop Stand Pro",
    message: "Supplier delay expected",
    bg: "#FFF8ED",
    border: "#F4E0BE",
    iconColor: "#D97706",
  },
  {
    title: "Gaming Monitor 27”",
    message: "Demand increased this week",
    bg: "#F8FAFC",
    border: "#E5EAF0",
    iconColor: "#106C6B",
  },
];

const topProducts = [
  { rank: "#1", name: "AirPods Pro Max", sold: "482 sold", change: "+18%" },
  { rank: "#2", name: "MacBook Stand", sold: "371 sold", change: "+12%" },
  { rank: "#3", name: "Logitech MX Master", sold: "294 sold", change: "+9%" },
  { rank: "#4", name: "USB-C Hub 7-in-1", sold: "258 sold", change: "+5%" },
];

const dashboardFallbackCards = [
  {
    name: "log-activity",
    title: "Log Activity",
    path: "/log-activity",
    icon: "AssignmentRoundedIcon",
    iconBg: "#F3F0FF",
    iconColor: "#5B21B6",
    subtitle: "Track system actions",
    subtitleTone: "info",
  },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "Delivered":
      return {
        bg: "#F4F6F8",
        color: "#0C5A58",
      };

    case "In Transit":
      return {
        bg: "#F5F7FA",
        color: "#12807B",
      };

    case "Processing":
      return {
        bg: "#FFF3E8",
        color: "#D97706",
      };

    case "Low Stock":
      return {
        bg: "#FFF1EE",
        color: "#C2410C",
      };

    default:
      return {
        bg: "#F3F5F7",
        color: "#556B6A",
      };
  }
};

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  boxShadow: brand.shadow,
};

const isSuperadminRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase() === "superadmin";

const getIconComponent = (iconName) => {
  const icons = {
    BuildCircleRoundedIcon: <BuildCircleRoundedIcon />,
    HandymanRoundedIcon: <HandymanRoundedIcon />,
    Inventory2RoundedIcon: <Inventory2RoundedIcon />,
    BadgeRoundedIcon: <BadgeRoundedIcon />,
    AssignmentRoundedIcon: <AssignmentRoundedIcon />,
  };

  return icons[iconName] || <BadgeRoundedIcon />;
};

const mergeCardsWithFallbacks = (cards = []) => {
  const cardMap = new Map();

  cards.forEach((card) => {
    if (!card?.name) return;
    cardMap.set(card.name, card);
  });

  dashboardFallbackCards.forEach((card) => {
    if (!cardMap.has(card.name)) {
      cardMap.set(card.name, card);
    }
  });

  return Array.from(cardMap.values());
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [availableCards, setAvailableCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardSearch, setDashboardSearch] = useState("");

  useEffect(() => {
    const loadCards = async () => {
      try {
        const response = await getCards();
        const cards = Array.isArray(response?.data) ? response.data : [];

        setAvailableCards(mergeCardsWithFallbacks(cards));
      } catch (error) {
        console.error("Failed to load cards:", error);
        setAvailableCards(mergeCardsWithFallbacks([]));
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, []);

  const isSuperadmin = useMemo(
    () => isSuperadminRole(user?.roles),
    [user?.roles],
  );

  const searchKeyword = useMemo(
    () => dashboardSearch.trim().toLowerCase(),
    [dashboardSearch],
  );

  const matchesDashboardSearch = useCallback(
    (...values) => {
      if (!searchKeyword) return true;

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchKeyword),
      );
    },
    [searchKeyword],
  );

  const userAssignedCards = useMemo(() => {
    if (isSuperadmin) {
      return availableCards.map((card) => card.name);
    }

    if (!user?.staffType?.assignedCards) return [];

    return user.staffType.assignedCards.map((card) => card.name);
  }, [availableCards, isSuperadmin, user?.staffType?.assignedCards]);

  const visibleStats = useMemo(() => {
    return availableCards
      .filter((card) => isSuperadmin || userAssignedCards.includes(card.name))
      .filter((card) =>
        matchesDashboardSearch(card.name, card.title, card.subtitle, card.path),
      )
      .map((card) => ({
        title: card.title,
        value: "12",
        subtitle: card.subtitle,
        subtitleTone: card.subtitleTone,
        icon: getIconComponent(card.icon),
        iconBg: card.iconBg,
        iconColor: card.iconColor,
        path: card.path,
      }));
  }, [availableCards, isSuperadmin, userAssignedCards, matchesDashboardSearch]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      matchesDashboardSearch(
        order.id,
        order.product,
        order.category,
        order.qty,
        order.status,
        order.value,
      ),
    );
  }, [matchesDashboardSearch]);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      matchesDashboardSearch(category.name, category.units, category.progress),
    );
  }, [matchesDashboardSearch]);

  const filteredQuickActions = useMemo(() => {
    return quickActions.filter((action) =>
      matchesDashboardSearch(action.title),
    );
  }, [matchesDashboardSearch]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) =>
      matchesDashboardSearch(alert.title, alert.message),
    );
  }, [matchesDashboardSearch]);

  const filteredTopProducts = useMemo(() => {
    return topProducts.filter((product) =>
      matchesDashboardSearch(
        product.rank,
        product.name,
        product.sold,
        product.change,
      ),
    );
  }, [matchesDashboardSearch]);

  const hasDashboardSearchResults =
    visibleStats.length > 0 ||
    filteredOrders.length > 0 ||
    filteredCategories.length > 0 ||
    filteredQuickActions.length > 0 ||
    filteredAlerts.length > 0 ||
    filteredTopProducts.length > 0;

  const initials = useMemo(() => {
    const name = user && user.name ? user.name.trim() : "";

    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

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

  const handleOpenCard = (item) => {
    createLogActivity({
      action: "Opened",
      module: "Dashboard",
      page: item.title,
      resource: "Card",
      targetName: "Dashboard Card",
      endpoint: item.path,
      details: {
        source: "dashboard",
        cardTitle: item.title,
      },
    }).catch(() => {});

    navigate(item.path);
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
          minHeight: "100vh",
        }}
      >
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
              <Box
                component="img"
                src={logo}
                alt="Decostyle"
                sx={{
                  width: { xs: 170, sm: 210 },
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  mb: 1,
                }}
              />

              <Typography sx={{ color: brand.textSoft }}>
                {currentDate}
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
                value={dashboardSearch}
                onChange={(event) => setDashboardSearch(event.target.value)}
                placeholder="Search dashboard..."
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 280 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: brand.primary }} />
                    </InputAdornment>
                  ),
                }}
              />

              <IconButton
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${brand.border}`,
                  boxShadow: brand.shadow,
                  "&:hover": {
                    backgroundColor: "#F7F9FB",
                  },
                }}
              >
                <AddRoundedIcon sx={{ color: brand.primary }} />
              </IconButton>

              <IconButton
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  backgroundColor: "#FFF8ED",
                  border: "1px solid rgba(217, 119, 6, 0.18)",
                  boxShadow: brand.shadow,
                }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsNoneRoundedIcon sx={{ color: "#D97706" }} />
                </Badge>
              </IconButton>

              <UserMenu
                user={user}
                initials={initials}
                onLogout={handleLogout}
              />
            </Stack>
          </Stack>

          {searchKeyword && !hasDashboardSearchResults ? (
            <Paper
              elevation={0}
              sx={{
                ...softCardSx,
                p: 2.25,
                mb: 2.5,
                boxShadow: brand.shadowStrong,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontWeight: 800, color: brand.text }}>
                No results found
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: brand.textSoft, mt: 0.5 }}
              >
                Try searching card name, order id, product, category, alert, or
                action.
              </Typography>
            </Paper>
          ) : null}

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
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    ...softCardSx,
                    p: 2.25,
                    boxShadow: brand.shadowStrong,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 120,
                  }}
                >
                  <LinearProgress sx={{ width: "60%" }} />
                </Paper>
              ))
            ) : visibleStats.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  ...softCardSx,
                  p: 2.25,
                  boxShadow: brand.shadowStrong,
                  gridColumn: "1 / -1",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {searchKeyword
                    ? "No matching cards found"
                    : "No cards assigned to your staff type"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {searchKeyword
                    ? "Try searching another module, card, order, product, or alert."
                    : "Please contact your administrator"}
                </Typography>
              </Paper>
            ) : (
              visibleStats.map((item) => (
                <Paper
                  key={item.title}
                  elevation={0}
                  onClick={() => handleOpenCard(item)}
                  sx={{
                    ...softCardSx,
                    p: 2.25,
                    boxShadow: brand.shadowStrong,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow:
                        "0 0 0 1px rgba(15, 23, 42, 0.04), 0 18px 44px rgba(15, 23, 42, 0.12)",
                    },
                  }}
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
                        borderRadius: 2.5,
                        backgroundColor: item.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ color: item.iconColor, fontSize: 24 }}>
                        {item.icon}
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1, ml: 1.5 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          color: brand.text,
                          fontWeight: 700,
                          lineHeight: 1.2,
                          mb: 0.5,
                        }}
                      >
                        {item.value}
                      </Typography>

                      <Typography
                        sx={{ color: brand.textSoft, fontWeight: 500 }}
                      >
                        {item.title}
                      </Typography>

                      <Chip
                        label={item.subtitle}
                        size="small"
                        sx={{
                          mt: 0.75,
                          height: 20,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          backgroundColor:
                            item.subtitleTone === "success"
                              ? "#DCFCE7"
                              : item.subtitleTone === "error"
                                ? "#FEF2F2"
                                : item.subtitleTone === "warning"
                                  ? "#FFFBEB"
                                  : "#F3F4F6",
                          color:
                            item.subtitleTone === "success"
                              ? "#166534"
                              : item.subtitleTone === "error"
                                ? "#DC2626"
                                : item.subtitleTone === "warning"
                                  ? "#D97706"
                                  : "#374151",
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              ))
            )}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 2fr) 320px" },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                ...softCardSx,
                overflow: "hidden",
                boxShadow: brand.shadowStrong,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 2.25, py: 2 }}
              >
                <Typography fontWeight={800} sx={{ color: brand.text }}>
                  Recent Orders
                </Typography>

                <Button
                  size="small"
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "#F4F6F8",
                    color: brand.primary,
                    px: 1.8,
                    "&:hover": {
                      backgroundColor: "#ECEFF3",
                    },
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
                      bgcolor: "#FFFFFF",
                      borderTop: `1px solid ${brand.border}`,
                      borderBottom: `1px solid ${brand.border}`,
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
                          color: brand.textSoft,
                          fontWeight: 800,
                          letterSpacing: 0.4,
                        }}
                      >
                        {head}
                      </Typography>
                    ))}
                  </Box>

                  {filteredOrders.length === 0 ? (
                    <Box
                      sx={{
                        px: 2.25,
                        py: 3,
                        textAlign: "center",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <Typography
                        sx={{ color: brand.textSoft, fontWeight: 700 }}
                      >
                        No orders found
                      </Typography>
                    </Box>
                  ) : (
                    filteredOrders.map((order, index) => {
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
                              index !== filteredOrders.length - 1
                                ? `1px solid ${brand.border}`
                                : "none",
                            alignItems: "center",
                            backgroundColor: "#FFFFFF",
                            "&:hover": {
                              backgroundColor: "#FAFBFC",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              color: brand.primary,
                              fontWeight: 700,
                              fontSize: "0.92rem",
                            }}
                          >
                            {order.id}
                          </Typography>

                          <Typography
                            fontWeight={600}
                            sx={{ color: brand.text }}
                          >
                            {order.product}
                          </Typography>

                          <Chip
                            label={order.category}
                            size="small"
                            sx={{
                              width: "fit-content",
                              borderRadius: 2,
                              bgcolor: "#F4F6F8",
                              color: brand.textSoft,
                              fontWeight: 600,
                            }}
                          />

                          <Typography
                            fontWeight={600}
                            sx={{ color: brand.text }}
                          >
                            {order.qty}
                          </Typography>

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

                          <Typography
                            fontWeight={700}
                            sx={{ color: brand.text }}
                          >
                            {order.value}
                          </Typography>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{ ...softCardSx, p: 2.25, boxShadow: brand.shadowStrong }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography fontWeight={800} sx={{ color: brand.text }}>
                  Stock by Category
                </Typography>

                <IconButton
                  size="small"
                  sx={{
                    color: brand.textSoft,
                    backgroundColor: "#FFFFFF",
                    boxShadow: brand.shadow,
                  }}
                >
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack spacing={2}>
                {filteredCategories.length === 0 ? (
                  <Typography sx={{ color: brand.textSoft, fontWeight: 700 }}>
                    No categories found
                  </Typography>
                ) : (
                  filteredCategories.map((item) => (
                    <Box key={item.name}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 0.8 }}
                      >
                        <Typography
                          fontWeight={700}
                          fontSize="0.92rem"
                          sx={{ color: brand.text }}
                        >
                          {item.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ color: brand.textSoft }}
                        >
                          {item.units} · {item.progress}%
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{
                          height: 7,
                          borderRadius: 999,
                          backgroundColor: "#E9EEF2",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            backgroundColor: item.color,
                          },
                        }}
                      />
                    </Box>
                  ))
                )}
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
            <Paper
              elevation={0}
              sx={{ ...softCardSx, p: 2.25, boxShadow: brand.shadowStrong }}
            >
              <Typography fontWeight={800} sx={{ color: brand.text, mb: 2 }}>
                Quick Actions
              </Typography>

              <Stack spacing={1.4}>
                {filteredQuickActions.length === 0 ? (
                  <Typography sx={{ color: brand.textSoft, fontWeight: 700 }}>
                    No actions found
                  </Typography>
                ) : (
                  filteredQuickActions.map((item) => (
                    <Button
                      key={item.title}
                      fullWidth
                      sx={{
                        justifyContent: "flex-start",
                        p: 1.4,
                        borderRadius: 3,
                        border: `1px solid ${brand.border}`,
                        backgroundColor: "#FFFFFF",
                        color: brand.text,
                        textTransform: "none",
                        fontWeight: 700,
                        boxShadow: brand.shadow,
                        "&:hover": {
                          backgroundColor: "#F8FAFC",
                        },
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
                  ))
                )}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{ ...softCardSx, p: 2.25, boxShadow: brand.shadowStrong }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography fontWeight={800} sx={{ color: brand.text }}>
                  Stock Alerts
                </Typography>

                <Badge badgeContent={filteredAlerts.length} color="error">
                  <WarningAmberRoundedIcon sx={{ color: brand.textSoft }} />
                </Badge>
              </Stack>

              <Stack spacing={1.25}>
                {filteredAlerts.length === 0 ? (
                  <Typography sx={{ color: brand.textSoft, fontWeight: 700 }}>
                    No alerts found
                  </Typography>
                ) : (
                  filteredAlerts.map((alert) => (
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
                          sx={{
                            color: alert.iconColor,
                            mt: 0.15,
                            fontSize: 18,
                          }}
                        />

                        <Box>
                          <Typography
                            fontWeight={700}
                            fontSize="0.95rem"
                            sx={{ color: brand.text }}
                          >
                            {alert.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{ color: brand.textSoft }}
                          >
                            {alert.message}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{ ...softCardSx, p: 2.25, boxShadow: brand.shadowStrong }}
            >
              <Typography fontWeight={800} sx={{ color: brand.text, mb: 2 }}>
                Top Products
              </Typography>

              <Stack spacing={1.4}>
                {filteredTopProducts.length === 0 ? (
                  <Typography sx={{ color: brand.textSoft, fontWeight: 700 }}>
                    No products found
                  </Typography>
                ) : (
                  filteredTopProducts.map((item, index) => (
                    <Box key={item.name}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Stack
                          direction="row"
                          spacing={1.3}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              minWidth: 36,
                              height: 36,
                              px: 1,
                              borderRadius: 2.5,
                              backgroundColor:
                                index === 0 ? "#FFF3E8" : "#F4F6F8",
                              color: index === 0 ? "#D97706" : brand.primary,
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                            }}
                          >
                            {item.rank}
                          </Box>

                          <Box>
                            <Typography
                              fontWeight={700}
                              sx={{ color: brand.text }}
                            >
                              {item.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ color: brand.textSoft }}
                            >
                              {item.sold}
                            </Typography>
                          </Box>
                        </Stack>

                        <Typography
                          fontWeight={800}
                          sx={{ color: brand.primary, fontSize: "0.92rem" }}
                        >
                          {item.change}
                        </Typography>
                      </Stack>

                      {index !== filteredTopProducts.length - 1 ? (
                        <Divider sx={{ mt: 1.4, borderColor: brand.border }} />
                      ) : null}
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
