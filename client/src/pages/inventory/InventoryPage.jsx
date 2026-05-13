import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { inventorySidebarItems } from "../../components/sidebars/inventorySidebarItems";
import {
  preloadRouteModules,
  useAppNavigate,
} from "../../hooks/useAppNavigate.jsx";
import { useAuth } from "../../store/AuthContext.jsx";
import { getVisibleSidebarItemsForUser } from "../../utils/permissions.js";
import MachineMaintenanceListView from "../machine-maintenance/components/MachineMaintenanceListView.jsx";
import { getInventorySummary } from "./components/inventoryTransactionApi.js";

const matchesPath = (pathname, targetPath) =>
  pathname === targetPath || pathname.startsWith(`${targetPath}/`);

const findCurrentParent = (pathname, sidebarItems = []) => {
  const childMatchedParent = sidebarItems.find((item) =>
    item.children?.some((child) => matchesPath(pathname, child.path)),
  );

  if (childMatchedParent) return childMatchedParent;

  return (
    sidebarItems.find((item) => {
      if (item.path === "/dashboard") return false;
      return matchesPath(pathname, item.path);
    }) || sidebarItems[1]
  );
};

const tabButtonSx = (active) => ({
  borderRadius: 0,
  px: 2.25,
  py: 1.2,
  minWidth: 120,
  minHeight: 74,
  color: active ? "#111111" : "#444444",
  fontWeight: active ? 800 : 700,
  textTransform: "none",
  borderBottom: active ? "3px solid #111111" : "3px solid transparent",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.55,
  flexShrink: 0,
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
    textAlign: "center",
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: "#111111",
  },
});

const hideScrollbarSx = {
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
};

const InventoryOverview = () => {
  const [summary, setSummary] = useState({
    totals: {
      inboundQuantity: 0,
      outboundQuantity: 0,
      currentQuantity: 0,
    },
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async ({ skipCache = false } = {}) => {
    try {
      setLoading(true);
      setError("");
      const response = await getInventorySummary({ skipCache });
      setSummary({
        totals: response?.totals || {
          inboundQuantity: 0,
          outboundQuantity: 0,
          currentQuantity: 0,
        },
        items: Array.isArray(response?.items) ? response.items : [],
      });
    } catch (loadError) {
      setError(loadError.message || "Failed to load inventory summary");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const summaryCards = [
    {
      label: "Total Inbound",
      value: Number(summary.totals?.inboundQuantity || 0),
      color: "#106C6B",
      bg: "#E8F7F6",
    },
    {
      label: "Total Outbound",
      value: Number(summary.totals?.outboundQuantity || 0),
      color: "#C2410C",
      bg: "#FFF1EE",
    },
    {
      label: "Current Stock",
      value: Number(summary.totals?.currentQuantity || 0),
      color: "#1D4ED8",
      bg: "#EEF4FF",
    },
  ];

  const columns = [
    { key: "goodsCode", label: "Goods Code", width: 150, nowrap: true },
    { key: "goodsDesc", label: "Goods Desc", width: 240 },
    { key: "warehouseName", label: "Warehouse", width: 180 },
    {
      key: "inboundQuantity",
      label: "Inbound Qty",
      width: 140,
      nowrap: true,
    },
    {
      key: "outboundQuantity",
      label: "Outbound Qty",
      width: 140,
      nowrap: true,
    },
    {
      key: "currentQuantity",
      label: "Current Qty",
      width: 140,
      nowrap: true,
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#143736" }}>
        Inventory
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {summaryCards.map((card) => (
          <Paper
            key={card.label}
            elevation={0}
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: 4,
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow:
                "0 0 0 1px rgba(15, 23, 42, 0.03), 0 12px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <Typography sx={{ color: "#617776", fontWeight: 700, mb: 1 }}>
              {card.label}
            </Typography>
            <Chip
              label={String(card.value)}
              sx={{
                borderRadius: 2.5,
                backgroundColor: card.bg,
                color: card.color,
                fontWeight: 800,
                fontSize: "1rem",
              }}
            />
          </Paper>
        ))}
      </Stack>

      <MachineMaintenanceListView
        title="Current Inventory"
        columns={columns}
        rows={summary.items}
        loading={loading}
        error={error}
        onRefresh={() => loadSummary({ skipCache: true })}
        showPrimaryAction={false}
        showActions={false}
        showDownloadButton={false}
      />
    </Stack>
  );
};

const InventoryPage = ({ children }) => {
  const location = useLocation();
  const navigate = useAppNavigate();
  const { user } = useAuth();

  const allowedSidebarItems = useMemo(
    () => getVisibleSidebarItemsForUser(inventorySidebarItems, user),
    [user],
  );

  const currentParent = findCurrentParent(
    location.pathname,
    allowedSidebarItems,
  );
  const headerActions = currentParent?.children || [];
  const isInventoryRootRoute = location.pathname === "/inventory";
  const content =
    children ?? (isInventoryRootRoute ? <InventoryOverview /> : <Outlet />);

  const shouldLockPageScroll = true;

  if (location.pathname === "/inventory/goodslist") {
    return <Navigate to="/inventory/goodslist/list" replace />;
  }

  return (
    <ModuleLayout
      sidebarItems={allowedSidebarItems}
      lockPageScroll={shouldLockPageScroll}
    >
      <Stack
        spacing={0}
        sx={
          shouldLockPageScroll
            ? {
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
              }
            : undefined
        }
      >
        {headerActions.length > 0 && (
          <Box
            sx={{
              mb: 2,
              px: { xs: 1, sm: 2 },
              pt: 0.5,
              backgroundColor: "#FFFFFF",
              overflowX: "auto",
              overflowY: "hidden",
              flexShrink: 0,
              ...hideScrollbarSx,
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
              {headerActions.map((action) => {
                const active = matchesPath(location.pathname, action.path);

                return (
                  <Button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    onMouseEnter={() => preloadRouteModules(action.path)}
                    onFocus={() => preloadRouteModules(action.path)}
                    onTouchStart={() => preloadRouteModules(action.path)}
                    sx={tabButtonSx(active)}
                  >
                    <Box className="tab-icon">{action.icon}</Box>
                    <Box component="span" className="tab-label">
                      {action.label}
                    </Box>
                  </Button>
                );
              })}
            </Stack>
          </Box>
        )}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            backgroundColor: "#FFFFFF",
            boxShadow: "none",
            minHeight: 320,
            overflow: shouldLockPageScroll ? "hidden" : "visible",
            ...(shouldLockPageScroll
              ? {
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                }
              : {}),
          }}
        >
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              overflow: shouldLockPageScroll ? "hidden" : "visible",
              ...(shouldLockPageScroll
                ? {
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  }
                : {}),
            }}
          >
            {content}
          </Box>
        </Paper>
      </Stack>
    </ModuleLayout>
  );
};

export default InventoryPage;
