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
import {
  getVisibleDashboardCardsForUser,
  isSidebarFeatureVisible,
} from "../../utils/permissions.js";
import { createLogActivity } from "../log-activity/logActivityApi.js";
import { getDashboardSummary } from "./dashboardApi.js";

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

const dashboardCardOrder = {
  "machine-maintenance": 1,
  inventory: 2,
  spares: 3,
  staff: 4,
  "log-activity": 5,
};

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

const createEmptyDashboardData = () => ({
  counts: {
    breakdownAssets: 0,
    lowStockSpares: 0,
    totalComplaints: 0,
    openComplaints: 0,
    totalStaffUsers: 0,
    activeStaffUsers: 0,
    pendingStaffUsers: 0,
    logActivities: 0,
    goodsItems: 0,
    warehouses: 0,
    inventoryItems: 0,
    inventoryCurrentQuantity: 0,
  },
  recentComplaints: [],
  complaintCategories: [],
  lowStockSpares: [],
  breakdownAssets: [],
  latestLogs: [],
});

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [availableCards, setAvailableCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [dashboardData, setDashboardData] = useState(createEmptyDashboardData);

  useEffect(() => {
    let isActive = true;

    const loadCards = async () => {
      try {
        const cardsResult = await getCards();

        if (!isActive) return;

        const cards = Array.isArray(cardsResult?.data) ? cardsResult.data : [];
        setAvailableCards(mergeCardsWithFallbacks(cards));
      } catch (error) {
        console.error("Failed to load dashboard cards:", error);

        if (!isActive) return;
        setAvailableCards(mergeCardsWithFallbacks([]));
      } finally {
        if (isActive) {
          setCardsLoading(false);
        }
      }
    };

    const loadDashboardMetrics = async () => {
      try {
        const summary = await getDashboardSummary();

        if (!isActive) return;
        setDashboardData(summary);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);

        if (!isActive) return;
        setDashboardData(createEmptyDashboardData());
      } finally {
        if (isActive) {
          setMetricsLoading(false);
        }
      }
    };

    loadCards();
    loadDashboardMetrics();

    return () => {
      isActive = false;
    };
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
    const counts = dashboardData.counts || {};
    const openComplaintsCount = Number(counts.openComplaints || 0);
    const breakdownAssetsCount = Number(counts.breakdownAssets || 0);
    const lowStockSparesCount = Number(counts.lowStockSpares || 0);
    const activeStaffCount = Number(counts.activeStaffUsers || 0);
    const pendingStaffCount = Number(counts.pendingStaffUsers || 0);
    const inventoryItemsCount = Number(counts.inventoryItems || 0);
    const inventoryValue = Number(counts.inventoryCurrentQuantity || 0);
    const goodsCount = Number(counts.goodsItems || 0);
    const warehouseCount = Number(counts.warehouses || 0);
    const logCount = Number(counts.logActivities || 0);

    return {
      "machine-maintenance": {
        value: String(openComplaintsCount),
        subtitle: `${breakdownAssetsCount} breakdown issues`,
        subtitleTone: openComplaintsCount > 0 ? "warning" : "success",
      },
      spares: {
        value: String(lowStockSparesCount),
        subtitle: "Minimum quantity alerts",
        subtitleTone: lowStockSparesCount > 0 ? "error" : "success",
      },
      inventory: {
        value: String(inventoryValue),
        subtitle:
          inventoryItemsCount > 0
            ? `${inventoryItemsCount} stock balances across ${warehouseCount} warehouses`
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
        value: String(logCount),
        subtitle:
          logCount > 0
            ? `${dashboardData.latestLogs.length} recent logs loaded`
            : "No activity logs found",
        subtitleTone: "info",
      },
    };
  }, [
    dashboardData.counts,
    dashboardData.latestLogs.length,
  ]);

  const visibleStats = useMemo(() => {
    return visibleDashboardCards
      .filter((card) =>
        matchesDashboardSearch(card.name, card.title, card.subtitle, card.path),
      )
      .sort((left, right) => {
        const leftOrder = dashboardCardOrder[left.name] || Number.MAX_SAFE_INTEGER;
        const rightOrder =
          dashboardCardOrder[right.name] || Number.MAX_SAFE_INTEGER;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return String(left.title || "").localeCompare(String(right.title || ""));
      })
      .map((card) => {
        const metrics = dashboardCardMetrics[card.name] || {};

        return {
          title: card.title,
          value: metricsLoading ? "--" : metrics.value || "0",
          subtitle: metrics.subtitle || card.subtitle,
          subtitleTone: metrics.subtitleTone || card.subtitleTone,
          icon: getIconComponent(card.icon),
          iconBg: card.iconBg,
          iconColor: card.iconColor,
          path: card.path,
          isLoading: metricsLoading,
        };
      });
  }, [
    dashboardCardMetrics,
    metricsLoading,
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
      (canViewComplaintSection ? dashboardData.recentComplaints : []).map((item) => ({
        id: item?.id,
        complaintCode: item?.complaintCode || "-",
        complaintTitle: item?.complaintTitle || "-",
        section: sectionLabelMap[item?.section] || item?.section || "-",
        priority: item?.priority || "-",
        issueDate: formatDateTime(item?.issueDate),
        createdBy: item?.createdBy || "-",
      })),
    [canViewComplaintSection, dashboardData.recentComplaints],
  );

  const complaintCategories = useMemo(() => {
    if (!canViewComplaintSection) return [];

    const total = Number(dashboardData.counts?.totalComplaints || 0) || 1;

    return dashboardData.complaintCategories.map((item, index) => ({
      name: sectionLabelMap[item?.section] || item?.section || "Other",
      units: `${Number(item?.count || 0)} complaints`,
      progress: Math.max(5, Math.round((Number(item?.count || 0) / total) * 100)),
      color: categoryPalette[index % categoryPalette.length],
    }));
  }, [
    canViewComplaintSection,
    dashboardData.complaintCategories,
    dashboardData.counts?.totalComplaints,
  ]);

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
      ? dashboardData.lowStockSpares.map((item) => ({
          title: item?.spareName || item?.spareCode || "Low Stock Spare",
          message: `Current stock ${item?.currentStock || 0} is at or below minimum ${Math.max(Number(item?.minQty || 0), Number(item?.reorderLevel || 0))}`,
          bg: "#FFF8ED",
          border: "#F4E0BE",
          iconColor: "#D97706",
        }))
      : [];

    const breakdownAlerts = canAccessFeature(
      "/machine-maintenance/consume/breakdown-list",
      "Breakdown List",
    )
      ? dashboardData.breakdownAssets.map((item) => ({
          title: item?.assetName || item?.assetCode || "Breakdown Machine",
          message: `${item?.department || "Department"} | ${item?.plant || "Plant"} is in breakdown`,
          bg: "#FFF1EE",
          border: "#F6D7D1",
          iconColor: "#C2410C",
        }))
      : [];

    return [...spareAlerts, ...breakdownAlerts].slice(0, 4);
  }, [canAccessFeature, dashboardData.breakdownAssets, dashboardData.lowStockSpares]);

  const latestUpdates = useMemo(
    () =>
      (canViewLogUpdatesSection ? dashboardData.latestLogs : []).map((item, index) => ({
        rank: `#${index + 1}`,
        name: item.targetName || item.page || "-",
        sold: `${item.action || "-"} | ${formatDateTime(item.createdAt)}`,
        change: item.userName || item.role || "-",
      })),
    [canViewLogUpdatesSection, dashboardData.latestLogs],
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
                lg: "repeat(5, minmax(0, 1fr))",
              },
              gap: 2,
              mb: 2.5,
            }}
          >
            {cardsLoading ? (
              Array.from({ length: dashboardFallbackCards.length }).map(
                (_, index) => (
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
                ),
              )
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

                      {item.isLoading ? (
                        <LinearProgress
                          sx={{
                            mt: 1,
                            height: 4,
                            borderRadius: 999,
                            backgroundColor: "#E9EEF2",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 999,
                              backgroundColor: brand.primaryLight,
                            },
                          }}
                        />
                      ) : null}
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
