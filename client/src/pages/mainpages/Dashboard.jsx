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

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
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
import { getCards, getStaffUsers } from "../../pages/staffs/staffApi";
import {
  getVisibleDashboardCardsForUser,
  isSidebarFeatureVisible,
} from "../../utils/permissions.js";
import {
  getAssets,
  getComplients,
  getSpares,
} from "../machine-maintenance/components/machineMaintenanceApi.js";
import {
  createLogActivity,
  getLogActivityCount,
  getLogActivities,
} from "../log-activity/logActivityApi.js";
import { getGoodsListItems } from "../inventory/components/inventoryGoodsListApi.js";
import {
  getInventorySummary,
  getInventoryTransactions,
} from "../inventory/components/inventoryTransactionApi.js";
import { getWarehouses } from "../inventory/components/inventoryWarehouseApi.js";

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

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  boxShadow: brand.shadow,
};

const sectionLabelMap = {
  assets: "Assets",
  spare: "Spare",
  "task-master": "Task Master",
  "vendor-supplier": "Vendor/Supplier",
};

const categoryPalette = ["#17A89F", "#106C6B", "#4FB8B0", "#D97706"];

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

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getSubtitleTone = (kind) => {
  if (kind === "error") return "#FEF2F2";
  if (kind === "warning") return "#FFFBEB";
  if (kind === "success") return "#DCFCE7";
  return "#F3F4F6";
};

const getSubtitleColor = (kind) => {
  if (kind === "error") return "#DC2626";
  if (kind === "warning") return "#D97706";
  if (kind === "success") return "#166534";
  return "#374151";
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [availableCards, setAvailableCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [dashboardData, setDashboardData] = useState({
    assets: [],
    spares: [],
    complaints: [],
    staffUsers: [],
    logs: [],
    logCount: 0,
    goodsItems: [],
    warehouses: [],
    inboundTransactions: [],
    outboundTransactions: [],
    inventorySummary: {
      totals: {
        inboundQuantity: 0,
        outboundQuantity: 0,
        currentQuantity: 0,
      },
      items: [],
    },
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          cardsResult,
          assetsResult,
          sparesResult,
          complaintsResult,
          staffResult,
          logCountResult,
          logsResult,
          goodsItemsResult,
          warehousesResult,
          inboundResult,
          outboundResult,
          inventorySummaryResult,
        ] = await Promise.allSettled([
          getCards(),
          getAssets({ skipCache: true }),
          getSpares(),
          getComplients(),
          getStaffUsers(),
          getLogActivityCount(),
          getLogActivities({ limit: 20 }),
          getGoodsListItems(),
          getWarehouses(),
          getInventoryTransactions("inbound"),
          getInventoryTransactions("outbound"),
          getInventorySummary(),
        ]);

        const cards =
          cardsResult.status === "fulfilled" &&
          Array.isArray(cardsResult.value?.data)
            ? cardsResult.value.data
            : [];
        const assets =
          assetsResult.status === "fulfilled" &&
          Array.isArray(assetsResult.value?.data)
            ? assetsResult.value.data
            : [];
        const spares =
          sparesResult.status === "fulfilled" &&
          Array.isArray(sparesResult.value?.data)
            ? sparesResult.value.data
            : [];
        const complaints =
          complaintsResult.status === "fulfilled" &&
          Array.isArray(complaintsResult.value?.data)
            ? complaintsResult.value.data
            : [];
        const staffUsers =
          staffResult.status === "fulfilled" &&
          Array.isArray(staffResult.value?.users)
            ? staffResult.value.users
            : [];
        const logs =
          logsResult.status === "fulfilled" && Array.isArray(logsResult.value)
            ? logsResult.value
            : [];
        const logCount =
          logCountResult.status === "fulfilled"
            ? Number(logCountResult.value || 0)
            : 0;
        const goodsItems =
          goodsItemsResult.status === "fulfilled" &&
          Array.isArray(goodsItemsResult.value)
            ? goodsItemsResult.value
            : [];
        const warehouses =
          warehousesResult.status === "fulfilled" &&
          Array.isArray(warehousesResult.value)
            ? warehousesResult.value
            : [];
        const inboundTransactions =
          inboundResult.status === "fulfilled" &&
          Array.isArray(inboundResult.value)
            ? inboundResult.value
            : [];
        const outboundTransactions =
          outboundResult.status === "fulfilled" &&
          Array.isArray(outboundResult.value)
            ? outboundResult.value
            : [];
        const inventorySummary =
          inventorySummaryResult.status === "fulfilled"
            ? {
                totals: inventorySummaryResult.value?.totals || {
                  inboundQuantity: 0,
                  outboundQuantity: 0,
                  currentQuantity: 0,
                },
                items: Array.isArray(inventorySummaryResult.value?.items)
                  ? inventorySummaryResult.value.items
                  : [],
              }
            : {
                totals: {
                  inboundQuantity: 0,
                  outboundQuantity: 0,
                  currentQuantity: 0,
                },
                items: [],
              };

        setAvailableCards(mergeCardsWithFallbacks(cards));
        setDashboardData({
          assets,
          spares,
          complaints,
          staffUsers,
          logs,
          logCount,
          goodsItems,
          warehouses,
          inboundTransactions,
          outboundTransactions,
          inventorySummary,
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setAvailableCards(mergeCardsWithFallbacks([]));
        setDashboardData({
          assets: [],
          spares: [],
          complaints: [],
          staffUsers: [],
          logs: [],
          logCount: 0,
          goodsItems: [],
          warehouses: [],
          inboundTransactions: [],
          outboundTransactions: [],
          inventorySummary: {
            totals: {
              inboundQuantity: 0,
              outboundQuantity: 0,
              currentQuantity: 0,
            },
            items: [],
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
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

  const breakdownAssets = useMemo(
    () =>
      dashboardData.assets.filter(
        (item) =>
          String(item?.status || "")
            .trim()
            .toLowerCase() === "breakdown",
      ),
    [dashboardData.assets],
  );

  const lowStockSpares = useMemo(
    () =>
      dashboardData.spares.filter((item) => {
        const currentStock = Number(item?.currentStock || 0);
        const minQty = Number(item?.minQty || 0);
        const reorderLevel = Number(item?.reorderLevel || 0);
        const threshold = Math.max(minQty, reorderLevel);
        return threshold > 0 && currentStock <= threshold;
      }),
    [dashboardData.spares],
  );

  const openComplaints = useMemo(
    () =>
      dashboardData.complaints.filter((item) => {
        const status = String(item?.status || "")
          .trim()
          .toLowerCase();
        return status !== "closed" && status !== "resolved";
      }),
    [dashboardData.complaints],
  );

  const visibleDashboardCards = useMemo(
    () => getVisibleDashboardCardsForUser(availableCards, user),
    [availableCards, user],
  );

  const canAccessFeature = useCallback(
    (path, label = "") => {
      if (isSuperadmin) return true;
      return isSidebarFeatureVisible(user, path, label);
    },
    [isSuperadmin, user],
  );

  const dashboardCardMetrics = useMemo(() => {
    const activeStaffCount = dashboardData.staffUsers.filter(
      (item) => item?.isVerified !== false,
    ).length;
    const pendingStaffCount = dashboardData.staffUsers.length - activeStaffCount;
    const inventoryTotals = dashboardData.inventorySummary?.totals || {
      inboundQuantity: 0,
      outboundQuantity: 0,
      currentQuantity: 0,
    };
    const inventoryItemsCount = Array.isArray(dashboardData.inventorySummary?.items)
      ? dashboardData.inventorySummary.items.length
      : 0;
    const inventoryValue = Number(inventoryTotals.currentQuantity || 0);
    const goodsCount = dashboardData.goodsItems.length;
    const warehouseCount = dashboardData.warehouses.length;
    const inboundCount = dashboardData.inboundTransactions.length;
    const outboundCount = dashboardData.outboundTransactions.length;

    return {
      "machine-maintenance": {
        value: String(openComplaints.length),
        subtitle: `${breakdownAssets.length} breakdown issues`,
        subtitleTone: openComplaints.length > 0 ? "warning" : "success",
      },
      spares: {
        value: String(lowStockSpares.length),
        subtitle: "Minimum quantity alerts",
        subtitleTone: lowStockSpares.length > 0 ? "error" : "success",
      },
      inventory: {
        value: String(inventoryValue),
        subtitle:
          inventoryItemsCount > 0
            ? `${inboundCount} inbound, ${outboundCount} outbound, ${warehouseCount} warehouses`
            : `${goodsCount} goods items available`,
        subtitleTone: "success",
      },
      staff: {
        value: String(activeStaffCount),
        subtitle:
          pendingStaffCount > 0
            ? `${pendingStaffCount} pending verification`
            : "Verified team members",
        subtitleTone: pendingStaffCount > 0 ? "warning" : "success",
      },
      "log-activity": {
        value: String(dashboardData.logCount),
        subtitle:
          dashboardData.logCount > 0
            ? `${dashboardData.logs.length} recent logs loaded`
            : "No activity logs found",
        subtitleTone: "info",
      },
    };
  }, [
    dashboardData.logCount,
    dashboardData.logs.length,
    dashboardData.goodsItems.length,
    dashboardData.inboundTransactions.length,
    dashboardData.inventorySummary,
    dashboardData.outboundTransactions.length,
    dashboardData.staffUsers,
    dashboardData.warehouses.length,
    openComplaints.length,
    breakdownAssets.length,
    lowStockSpares.length,
  ]);

  const visibleStats = useMemo(() => {
    return visibleDashboardCards
      .filter((card) =>
        matchesDashboardSearch(card.name, card.title, card.subtitle, card.path),
      )
      .map((card) => {
        const metrics = dashboardCardMetrics[card.name] || {};

        return {
          title: card.title,
          value: metrics.value || "0",
          subtitle: metrics.subtitle || card.subtitle,
          subtitleTone: metrics.subtitleTone || card.subtitleTone,
          icon: getIconComponent(card.icon),
          iconBg: card.iconBg,
          iconColor: card.iconColor,
          path: card.path,
        };
      });
  }, [
    dashboardCardMetrics,
    matchesDashboardSearch,
    visibleDashboardCards,
  ]);

  const canViewComplaintSection = useMemo(
    () =>
      [
        ["Assets", "/machine-maintenance/complient/assets"],
        ["Spare", "/machine-maintenance/complient/spare"],
        ["Task Master", "/machine-maintenance/complient/task-master"],
        ["Vendor/Supplier", "/machine-maintenance/complient/vendor-supplier"],
      ].some(([label, path]) => canAccessFeature(path, label)),
    [canAccessFeature],
  );

  const canViewAlertsSection = useMemo(
    () =>
      canAccessFeature(
        "/machine-maintenance/spare-master/list",
        "List of Spares",
      ) ||
      canAccessFeature(
        "/machine-maintenance/consume/breakdown-list",
        "Breakdown List",
      ),
    [canAccessFeature],
  );

  const canViewLogUpdatesSection = useMemo(
    () =>
      visibleDashboardCards.some(
        (card) =>
          String(card?.name || "")
            .trim()
            .toLowerCase() === "log-activity" ||
          String(card?.path || "")
            .trim()
            .toLowerCase() === "/log-activity",
      ),
    [visibleDashboardCards],
  );

  const complaintRows = useMemo(
    () =>
      (canViewComplaintSection ? dashboardData.complaints : []).slice(0, 5).map((item) => ({
        id: item?._id,
        complaintCode: item?.complaintCode || "-",
        complaintTitle: item?.complaintTitle || "-",
        section: sectionLabelMap[item?.section] || item?.section || "-",
        priority: item?.priority || "-",
        issueDate: formatDateTime(item?.issueDate),
        createdBy: item?.createdBy || "-",
      })),
    [canViewComplaintSection, dashboardData.complaints],
  );

  const complaintCategories = useMemo(() => {
    if (!canViewComplaintSection) return [];

    const total = dashboardData.complaints.length || 1;
    const counts = dashboardData.complaints.reduce((acc, item) => {
      const key = sectionLabelMap[item?.section] || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, count], index) => ({
      name,
      units: `${count} complaints`,
      progress: Math.max(5, Math.round((count / total) * 100)),
      color: categoryPalette[index % categoryPalette.length],
    }));
  }, [canViewComplaintSection, dashboardData.complaints]);

  const quickActions = useMemo(
    () => [
      {
        title: "Register Machine",
        path: "/machine-maintenance/assets/register",
        permissionLabel: "Machine Registration",
        icon: <AddRoundedIcon />,
        iconBg: "#F3F5F7",
        iconColor: "#106C6B",
      },
      {
        title: "Register Spare",
        path: "/machine-maintenance/spare-master/register",
        permissionLabel: "Spare Registration",
        icon: <HandymanRoundedIcon />,
        iconBg: "#F3F5F7",
        iconColor: "#12807B",
      },
      {
        title: "View Breakdown",
        path: "/machine-maintenance/consume/breakdown-list",
        permissionLabel: "Breakdown List",
        icon: <WarningAmberRoundedIcon />,
        iconBg: "#FFF8ED",
        iconColor: "#D97706",
      },
      {
        title: "Create Complaint",
        path: "/machine-maintenance/complient/assets",
        permissionLabel: "Assets",
        icon: <AssignmentRoundedIcon />,
        iconBg: "#F3F5F7",
        iconColor: "#106C6B",
      },
    ],
    [],
  );

  const alerts = useMemo(() => {
    const spareAlerts = canAccessFeature(
      "/machine-maintenance/spare-master/list",
      "List of Spares",
    )
      ? lowStockSpares.slice(0, 3).map((item) => ({
          title: item?.spareName || item?.spareCode || "Low Stock Spare",
          message: `Current stock ${item?.currentStock || 0} is at or below minimum ${item?.minQty || 0}`,
          bg: "#FFF8ED",
          border: "#F4E0BE",
          iconColor: "#D97706",
        }))
      : [];

    const breakdownAlerts = canAccessFeature(
      "/machine-maintenance/consume/breakdown-list",
      "Breakdown List",
    )
      ? breakdownAssets.slice(0, 2).map((item) => ({
      title: item?.assetName || item?.assetCode || "Breakdown Machine",
      message: `${item?.department || "Department"} | ${item?.plant || "Plant"} is in breakdown`,
      bg: "#FFF1EE",
      border: "#F6D7D1",
      iconColor: "#C2410C",
        }))
      : [];

    return [...spareAlerts, ...breakdownAlerts].slice(0, 4);
  }, [breakdownAssets, canAccessFeature, lowStockSpares]);

  const latestUpdates = useMemo(
    () =>
      (canViewLogUpdatesSection ? dashboardData.logs : []).slice(0, 4).map((item, index) => ({
        rank: `#${index + 1}`,
        name: item.targetName !== "-" ? item.targetName : item.page,
        sold: `${item.action} | ${item.time}`,
        change: item.userName !== "-" ? item.userName : item.role,
      })),
    [canViewLogUpdatesSection, dashboardData.logs],
  );

  const filteredOrders = useMemo(() => {
    return complaintRows.filter((row) =>
      matchesDashboardSearch(
        row.complaintCode,
        row.complaintTitle,
        row.section,
        row.priority,
        row.issueDate,
        row.createdBy,
      ),
    );
  }, [matchesDashboardSearch, complaintRows]);

  const filteredCategories = useMemo(() => {
    return complaintCategories.filter((category) =>
      matchesDashboardSearch(category.name, category.units, category.progress),
    );
  }, [matchesDashboardSearch, complaintCategories]);

  const visibleQuickActions = useMemo(() => {
    return quickActions.filter((action) =>
      canAccessFeature(action.path, action.permissionLabel || action.title),
    );
  }, [canAccessFeature, quickActions]);

  const filteredQuickActions = useMemo(() => {
    return visibleQuickActions.filter((action) =>
      matchesDashboardSearch(action.title),
    );
  }, [matchesDashboardSearch, visibleQuickActions]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) =>
      matchesDashboardSearch(alert.title, alert.message),
    );
  }, [matchesDashboardSearch, alerts]);

  const filteredTopProducts = useMemo(() => {
    return latestUpdates.filter((item) =>
      matchesDashboardSearch(item.rank, item.name, item.sold, item.change),
    );
  }, [matchesDashboardSearch, latestUpdates]);

  const hasDashboardSearchResults =
    visibleStats.length > 0 ||
    filteredOrders.length > 0 ||
    filteredCategories.length > 0 ||
    filteredQuickActions.length > 0 ||
    filteredAlerts.length > 0 ||
    filteredTopProducts.length > 0;

  const firstQuickAction = visibleQuickActions[0] || null;

  const initials = useMemo(() => {
    const name = user?.name ? user.name.trim() : "";

    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

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
      <Box sx={{ minHeight: "100vh" }}>
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

              {firstQuickAction ? (
                <IconButton
                  onClick={() => navigate(firstQuickAction.path)}
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
              ) : null}

              {canViewAlertsSection ? (
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
                  <Badge badgeContent={filteredAlerts.length} color="error">
                    <NotificationsNoneRoundedIcon sx={{ color: "#D97706" }} />
                  </Badge>
                </IconButton>
              ) : null}

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
                Try searching module, complaint, spare alert, breakdown, or update.
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
                    ? "Try searching another module, complaint, breakdown, or alert."
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
                          backgroundColor: getSubtitleTone(item.subtitleTone),
                          color: getSubtitleColor(item.subtitleTone),
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              ))
            )}
          </Box>

          {canViewComplaintSection ? (
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
                  Recent Complaints
                </Typography>

                <Button
                  size="small"
                  onClick={() => navigate("/machine-maintenance/complient/assets")}
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
                      gridTemplateColumns: "1.1fr 1.6fr 1fr 0.8fr 1fr 0.9fr",
                      gap: 2,
                      px: 2.25,
                      py: 1.5,
                      bgcolor: "#FFFFFF",
                      borderTop: `1px solid ${brand.border}`,
                      borderBottom: `1px solid ${brand.border}`,
                    }}
                  >
                    {[
                      "COMPLAINT ID",
                      "TITLE",
                      "SECTION",
                      "PRIORITY",
                      "ISSUE DATE",
                      "CREATED BY",
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
                        No complaints found
                      </Typography>
                    </Box>
                  ) : (
                    filteredOrders.map((row, index) => (
                      <Box
                        key={row.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "1.1fr 1.6fr 1fr 0.8fr 1fr 0.9fr",
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
                          {row.complaintCode}
                        </Typography>

                        <Typography fontWeight={600} sx={{ color: brand.text }}>
                          {row.complaintTitle}
                        </Typography>

                        <Chip
                          label={row.section}
                          size="small"
                          sx={{
                            width: "fit-content",
                            borderRadius: 2,
                            bgcolor: "#F4F6F8",
                            color: brand.textSoft,
                            fontWeight: 600,
                          }}
                        />

                        <Typography fontWeight={600} sx={{ color: brand.text }}>
                          {row.priority}
                        </Typography>

                        <Typography
                          fontWeight={600}
                          sx={{ color: brand.textSoft }}
                        >
                          {row.issueDate}
                        </Typography>

                        <Typography fontWeight={700} sx={{ color: brand.text }}>
                          {row.createdBy}
                        </Typography>
                      </Box>
                    ))
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
                  Complaint by Section
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
                    No complaint categories found
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
                          {item.units} | {item.progress}%
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
          ) : null}

          {visibleQuickActions.length > 0 ||
          canViewAlertsSection ||
          canViewLogUpdatesSection ? (
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
            {visibleQuickActions.length > 0 ? (
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
                      onClick={() => navigate(item.path)}
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
            ) : null}

            {canViewAlertsSection ? (
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
                  Critical Alerts
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
            ) : null}

            {canViewLogUpdatesSection ? (
              <Paper
              elevation={0}
              sx={{ ...softCardSx, p: 2.25, boxShadow: brand.shadowStrong }}
            >
              <Typography fontWeight={800} sx={{ color: brand.text, mb: 2 }}>
                Latest Updates
              </Typography>

              <Stack spacing={1.4}>
                {filteredTopProducts.length === 0 ? (
                  <Typography sx={{ color: brand.textSoft, fontWeight: 700 }}>
                    No updates found
                  </Typography>
                ) : (
                  filteredTopProducts.map((item, index) => (
                    <Box key={`${item.rank}-${item.name}`}>
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
            ) : null}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
