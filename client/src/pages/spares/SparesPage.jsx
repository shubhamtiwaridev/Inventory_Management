import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogContent,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { sparesSidebarItems } from "../../components/sidebars/sparesSidebarItems";
import { useAuth } from "../../store/AuthContext.jsx";
import {
  getFirstAccessibleSidebarPath,
  getVisibleSidebarItemsForUser,
  hasActionPermission,
  isSidebarFeatureVisible,
} from "../../utils/permissions.js";
import MachineMaintenanceFormView from "../machine-maintenance/components/MachineMaintenanceFormView";
import { pageFormData } from "../machine-maintenance/components/machineMaintenanceUi";
import {
  createSpareRecord,
  createSpareSupplier,
  getSpareRecords,
  getSpareSuppliers,
  updateSpareRecord,
} from "./sparesApi";

const brand = {
  primary: "#106C6B",
  primarySoft: "rgba(16, 108, 107, 0.1)",
  border: "rgba(15, 23, 42, 0.1)",
  pageBg: "#F7FAFA",
  text: "#143736",
  textSoft: "#617776",
  warning: "#B7791F",
  success: "#1F8A5B",
  danger: "#B42318",
  info: "#4A63B2",
  muted: "#6B7280",
};

const cardSx = {
  borderRadius: 1,
  border: `1px solid ${brand.border}`,
  backgroundColor: "#FFFFFF",
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
};

const pageMeta = {
  "/spares": {
    title: "Spares Overview",
    eyebrow: "Spares",
    description:
      "Live spare availability, reorder pressure, stock value, storage usage, and supplier coverage.",
    action: "Add Spare",
    actionType: "spare",
  },
  "/spares/items": {
    title: "Spare Items",
    eyebrow: "Catalog",
    description:
      "Registered spare catalog by status, category, machine linkage, and minimum stock condition.",
    action: "New Item",
    actionType: "spare",
  },
  "/spares/storage": {
    title: "Storage",
    eyebrow: "Locations",
    description:
      "Shelf and store utilization derived from spare locations, stock quantity, and max quantity.",
    action: "Add Location",
    actionType: "location",
  },
  "/spares/issue": {
    title: "Issue Spares",
    eyebrow: "Consumption",
    description:
      "Issue readiness based on active items, available stock, blocked stock, and low-stock risk.",
    action: "Issue Spare",
    actionType: "issue",
  },
  "/spares/re-orders": {
    title: "Re Orders",
    eyebrow: "Procurement",
    description:
      "Reorder needs calculated from current stock against minimum quantity and reorder levels.",
    action: "Raise Re-order",
    actionType: "reorder",
  },
  "/spares/suppliers": {
    title: "Suppliers",
    eyebrow: "Partners",
    description:
      "Supplier coverage across spare records, active vendors, lead-time pressure, and vendor usage.",
    action: "Add Supplier",
    actionType: "supplier",
  },
};

const getPageMeta = (pathname) => pageMeta[pathname] || pageMeta["/spares"];

const asList = (response) =>
  Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

const cleanText = (value, fallback = "-") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const toNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    toNumber(value),
  );

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(toNumber(value));

const isActive = (value) =>
  !/^inactive|disabled|closed$/i.test(cleanText(value, ""));

const getThreshold = (item) =>
  Math.max(toNumber(item?.minQty), toNumber(item?.reorderLevel));

const isLowStock = (item) => {
  const threshold = getThreshold(item);
  return threshold > 0 && toNumber(item?.currentStock) <= threshold;
};

const getStockState = (item) => {
  const stock = toNumber(item?.currentStock);
  if (stock <= 0) return "Blocked";
  if (isLowStock(item)) return "Low";
  return "Ready";
};

const groupByText = (items, fieldName, fallback = "Unassigned") => {
  const groups = new Map();

  items.forEach((item) => {
    const key = cleanText(item?.[fieldName], fallback);
    groups.set(key, [...(groups.get(key) || []), item]);
  });

  return Array.from(groups.entries()).map(([name, records]) => ({
    name,
    records,
  }));
};

const sortNewest = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(b?.updatedAt || b?.createdAt || 0).getTime() -
      new Date(a?.updatedAt || a?.createdAt || 0).getTime(),
  );

const getAverage = (items, getter) => {
  if (!items.length) return 0;
  return items.reduce((sum, item) => sum + getter(item), 0) / items.length;
};

const makeCard = ({
  label,
  value,
  helper,
  icon,
  accent = brand.primary,
  progress,
}) => ({
  label,
  value,
  helper,
  icon,
  accent,
  progress,
});

const buildOverview = ({ spares, vendors }) => {
  const lowStock = spares.filter(isLowStock);
  const stockValue = spares.reduce(
    (sum, item) =>
      sum + toNumber(item?.currentStock) * toNumber(item?.costPerUnit),
    0,
  );

  return {
    cards: [
      makeCard({
        label: "Total spare items",
        value: formatNumber(spares.length),
        helper: `${formatNumber(spares.filter((item) => isActive(item?.status)).length)} active records`,
        icon: <BuildRoundedIcon />,
      }),
      makeCard({
        label: "Low stock",
        value: formatNumber(lowStock.length),
        helper: "At or below reorder limit",
        icon: <WarningAmberRoundedIcon />,
        accent: lowStock.length ? brand.warning : brand.success,
      }),
      makeCard({
        label: "Stock value",
        value: formatMoney(stockValue),
        helper: "Current stock x cost",
        icon: <Inventory2RoundedIcon />,
        accent: brand.info,
      }),
      makeCard({
        label: "Suppliers",
        value: formatNumber(vendors.length),
        helper: `${formatNumber(vendors.filter((item) => isActive(item?.status)).length)} active suppliers`,
        icon: <LocalShippingRoundedIcon />,
        accent: brand.success,
      }),
    ],
    rowsTitle: "Recently Updated Spares",
    emptyText: "No spare records found.",
    rows: sortNewest(spares).map((item) => [
      cleanText(item?.spareName || item?.spareCode),
      cleanText(item?.shelfLocation, "No location"),
      getStockState(item),
      `Stock ${formatNumber(item?.currentStock)} / Min ${formatNumber(getThreshold(item))}`,
    ]),
  };
};

const buildItems = ({ spares }) => {
  const activeItems = spares.filter((item) => isActive(item?.status));
  const inactiveItems = spares.length - activeItems.length;
  const categories = groupByText(spares, "partCategory", "No category");
  const linkedItems = spares.filter((item) =>
    cleanText(item?.linkedMachine, ""),
  ).length;

  return {
    cards: [
      makeCard({
        label: "Active items",
        value: formatNumber(activeItems.length),
        helper: "Available in spare catalog",
        icon: <Inventory2RoundedIcon />,
      }),
      makeCard({
        label: "Inactive items",
        value: formatNumber(inactiveItems),
        helper: "Not ready for issue",
        icon: <BuildRoundedIcon />,
        accent: inactiveItems ? brand.muted : brand.success,
      }),
      makeCard({
        label: "Categories",
        value: formatNumber(categories.length),
        helper: "From part category field",
        icon: <StorageRoundedIcon />,
        accent: brand.info,
      }),
      makeCard({
        label: "Linked machines",
        value: formatNumber(linkedItems),
        helper: "Items mapped to machines",
        icon: <SettingsSuggestRoundedIcon />,
        accent: brand.success,
      }),
    ],
    rowsTitle: "Spare Catalog",
    emptyText: "No spare items registered.",
    rows: sortNewest(spares).map((item) => [
      cleanText(item?.spareName || item?.spareCode),
      cleanText(item?.partNo, "No part no"),
      cleanText(item?.status, "Active"),
      cleanText(item?.partCategory, "No category"),
    ]),
  };
};

const buildStorage = ({ spares }) => {
  const locations = groupByText(spares, "shelfLocation", "Unassigned");
  const assigned = spares.filter((item) =>
    cleanText(item?.shelfLocation, ""),
  ).length;
  const unassigned = spares.length - assigned;
  const utilization = Math.round(
    getAverage(
      spares.filter((item) => toNumber(item?.maxQty) > 0),
      (item) =>
        Math.min(
          (toNumber(item?.currentStock) / toNumber(item?.maxQty)) * 100,
          100,
        ),
    ),
  );

  return {
    cards: [
      makeCard({
        label: "Storage locations",
        value: formatNumber(locations.length),
        helper: "Unique shelf locations",
        icon: <StorageRoundedIcon />,
      }),
      makeCard({
        label: "Assigned items",
        value: formatNumber(assigned),
        helper: "Items with shelf location",
        icon: <Inventory2RoundedIcon />,
        accent: brand.success,
      }),
      makeCard({
        label: "Unassigned",
        value: formatNumber(unassigned),
        helper: "Need a shelf location",
        icon: <WarningAmberRoundedIcon />,
        accent: unassigned ? brand.warning : brand.success,
      }),
      makeCard({
        label: "Avg utilization",
        value: `${formatNumber(utilization)}%`,
        helper: "Current stock vs max qty",
        icon: <AutorenewRoundedIcon />,
        accent: utilization >= 90 ? brand.warning : brand.info,
        progress: utilization,
      }),
    ],
    rowsTitle: "Location Summary",
    emptyText: "No storage locations available.",
    rows: locations
      .sort((a, b) => b.records.length - a.records.length)
      .map(({ name, records }) => {
        const currentStock = records.reduce(
          (sum, item) => sum + toNumber(item?.currentStock),
          0,
        );
        const maxQty = records.reduce(
          (sum, item) => sum + toNumber(item?.maxQty),
          0,
        );
        const percent = maxQty ? Math.round((currentStock / maxQty) * 100) : 0;

        return [
          name,
          `${formatNumber(records.length)} items`,
          percent >= 90
            ? "Near full"
            : name === "Unassigned"
              ? "Review"
              : "Healthy",
          `Stock ${formatNumber(currentStock)} / Max ${formatNumber(maxQty)}`,
        ];
      }),
  };
};

const buildIssue = ({ spares }) => {
  const activeItems = spares.filter((item) => isActive(item?.status));
  const ready = activeItems.filter((item) => getStockState(item) === "Ready");
  const low = activeItems.filter((item) => getStockState(item) === "Low");
  const blocked = activeItems.filter(
    (item) => getStockState(item) === "Blocked",
  );
  const totalStock = activeItems.reduce(
    (sum, item) => sum + toNumber(item?.currentStock),
    0,
  );

  return {
    cards: [
      makeCard({
        label: "Ready to issue",
        value: formatNumber(ready.length),
        helper: "Active items above reorder limit",
        icon: <SettingsSuggestRoundedIcon />,
        accent: brand.success,
      }),
      makeCard({
        label: "Low stock risk",
        value: formatNumber(low.length),
        helper: "Issue with caution",
        icon: <WarningAmberRoundedIcon />,
        accent: low.length ? brand.warning : brand.success,
      }),
      makeCard({
        label: "Blocked",
        value: formatNumber(blocked.length),
        helper: "No stock available",
        icon: <AutorenewRoundedIcon />,
        accent: blocked.length ? brand.danger : brand.success,
      }),
      makeCard({
        label: "Available stock",
        value: formatNumber(totalStock),
        helper: "Total active quantity",
        icon: <Inventory2RoundedIcon />,
        accent: brand.info,
      }),
    ],
    rowsTitle: "Issue Readiness",
    emptyText: "No active spare items available for issue.",
    rows: [...ready, ...low, ...blocked].map((item) => [
      cleanText(item?.spareName || item?.spareCode),
      cleanText(item?.shelfLocation, "No location"),
      getStockState(item),
      `Stock ${formatNumber(item?.currentStock)} ${cleanText(item?.unit, "")}`,
    ]),
  };
};

const buildReOrders = ({ spares }) => {
  const reorderItems = spares.filter(isLowStock);
  const zeroStock = reorderItems.filter(
    (item) => toNumber(item?.currentStock) <= 0,
  );
  const reorderQty = reorderItems.reduce(
    (sum, item) =>
      sum + Math.max(toNumber(item?.maxQty) - toNumber(item?.currentStock), 0),
    0,
  );
  const avgLeadTime = Math.round(
    getAverage(reorderItems, (item) => toNumber(item?.leadTime)),
  );

  return {
    cards: [
      makeCard({
        label: "Re-order needed",
        value: formatNumber(reorderItems.length),
        helper: "Below min/reorder level",
        icon: <AutorenewRoundedIcon />,
        accent: reorderItems.length ? brand.warning : brand.success,
      }),
      makeCard({
        label: "Zero stock",
        value: formatNumber(zeroStock.length),
        helper: "Highest priority items",
        icon: <WarningAmberRoundedIcon />,
        accent: zeroStock.length ? brand.danger : brand.success,
      }),
      makeCard({
        label: "Suggested quantity",
        value: formatNumber(reorderQty),
        helper: "To refill up to max qty",
        icon: <Inventory2RoundedIcon />,
        accent: brand.info,
      }),
      makeCard({
        label: "Avg lead time",
        value: `${formatNumber(avgLeadTime)} days`,
        helper: "From reorder items",
        icon: <LocalShippingRoundedIcon />,
        accent: avgLeadTime > 14 ? brand.warning : brand.success,
      }),
    ],
    rowsTitle: "Re-order Items",
    emptyText: "No spares currently need re-order.",
    rows: reorderItems.map((item) => {
      const suggestedQty = Math.max(
        toNumber(item?.maxQty) - toNumber(item?.currentStock),
        0,
      );

      return [
        cleanText(item?.spareName || item?.spareCode),
        cleanText(item?.vendor, "No supplier"),
        getStockState(item) === "Blocked" ? "Critical" : "Low",
        `Order ${formatNumber(suggestedQty)} ${cleanText(item?.unit, "")}`,
      ];
    }),
  };
};

const buildSuppliers = ({ spares, vendors }) => {
  const activeVendors = vendors.filter((item) => isActive(item?.status));
  const spareSupplierGroups = groupByText(spares, "vendor", "No supplier");
  const supplierNamesInUse = new Set(
    spares.map((item) => cleanText(item?.vendor, "")).filter(Boolean),
  );
  const longLeadItems = spares.filter((item) => toNumber(item?.leadTime) > 14);

  return {
    cards: [
      makeCard({
        label: "Registered suppliers",
        value: formatNumber(vendors.length),
        helper: "Vendor master records",
        icon: <LocalShippingRoundedIcon />,
      }),
      makeCard({
        label: "Active suppliers",
        value: formatNumber(activeVendors.length),
        helper: "Available for orders",
        icon: <BuildRoundedIcon />,
        accent: brand.success,
      }),
      makeCard({
        label: "Used in spares",
        value: formatNumber(supplierNamesInUse.size),
        helper: "Referenced by spare items",
        icon: <Inventory2RoundedIcon />,
        accent: brand.info,
      }),
      makeCard({
        label: "Long lead items",
        value: formatNumber(longLeadItems.length),
        helper: "Lead time above 14 days",
        icon: <WarningAmberRoundedIcon />,
        accent: longLeadItems.length ? brand.warning : brand.success,
      }),
    ],
    rowsTitle: "Supplier Coverage",
    emptyText: "No suppliers found.",
    rows: spareSupplierGroups
      .sort((a, b) => b.records.length - a.records.length)
      .map(({ name, records }) => {
        const avgLeadTime = Math.round(
          getAverage(records, (item) => toNumber(item?.leadTime)),
        );

        return [
          name,
          `${formatNumber(records.length)} spares`,
          avgLeadTime > 14 ? "Review" : "Active",
          `${formatNumber(avgLeadTime)} day avg lead time`,
        ];
      }),
  };
};

const pageBuilders = {
  "/spares": buildOverview,
  "/spares/items": buildItems,
  "/spares/storage": buildStorage,
  "/spares/issue": buildIssue,
  "/spares/re-orders": buildReOrders,
  "/spares/suppliers": buildSuppliers,
};

const buildPageData = (pathname, source) =>
  (pageBuilders[pathname] || pageBuilders["/spares"])(source);

const StatusChip = ({ value }) => {
  const normalized = String(value || "").toLowerCase();
  const color =
    normalized.includes("critical") ||
    normalized.includes("blocked") ||
    normalized.includes("zero") ||
    normalized.includes("inactive")
      ? brand.danger
      : normalized.includes("low") ||
          normalized.includes("review") ||
          normalized.includes("near")
        ? brand.warning
        : brand.success;

  return (
    <Chip
      label={value}
      size="small"
      sx={{
        height: 24,
        borderRadius: 1,
        color,
        backgroundColor: `${color}18`,
        fontWeight: 700,
      }}
    />
  );
};

const MetricCard = ({ card, loading }) => (
  <Paper elevation={0} sx={{ ...cardSx, p: 2, minHeight: 138 }}>
    <Stack spacing={1.25} sx={{ height: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            color: card.accent,
            backgroundColor: `${card.accent}14`,
            "& svg": { fontSize: 23 },
          }}
        >
          {card.icon}
        </Box>
        <Typography sx={{ color: brand.textSoft, fontSize: "0.78rem" }}>
          {card.label}
        </Typography>
      </Stack>

      <Typography
        sx={{ color: brand.text, fontSize: "1.75rem", fontWeight: 800 }}
      >
        {loading ? "-" : card.value}
      </Typography>

      {typeof card.progress === "number" ? (
        <LinearProgress
          variant="determinate"
          value={loading ? 0 : card.progress}
          sx={{
            height: 7,
            borderRadius: 1,
            backgroundColor: brand.primarySoft,
            "& .MuiLinearProgress-bar": {
              borderRadius: 1,
              backgroundColor: card.accent,
            },
          }}
        />
      ) : null}

      <Typography sx={{ color: brand.textSoft, fontSize: "0.86rem" }}>
        {loading ? "Loading live data" : card.helper}
      </Typography>
    </Stack>
  </Paper>
);

const getRecordId = (item) => item?._id || item?.id || "";

const buildSpareUpdatePayload = (item, updates = {}) => ({
  spareCode: cleanText(item?.spareCode, ""),
  spareName: cleanText(item?.spareName, ""),
  description: cleanText(item?.description, ""),
  linkedMachine: cleanText(item?.linkedMachine, ""),
  partCategory: cleanText(item?.partCategory, ""),
  vendor: cleanText(item?.vendor, ""),
  partNo: cleanText(item?.partNo, ""),
  unit: cleanText(item?.unit, ""),
  reorderLevel: toNumber(item?.reorderLevel),
  minQty: toNumber(item?.minQty),
  maxQty: toNumber(item?.maxQty),
  currentStock: toNumber(item?.currentStock),
  leadTime: toNumber(item?.leadTime),
  costPerUnit: toNumber(item?.costPerUnit),
  alternatePart: cleanText(item?.alternatePart, ""),
  shelfLocation: cleanText(item?.shelfLocation, ""),
  batchNo: cleanText(item?.batchNo, ""),
  status: cleanText(item?.status, "Active"),
  ...updates,
});

const actionCopy = {
  spare: {
    title: "Add Spare",
    submitLabel: "Save Spare",
  },
  location: {
    title: "Add Location",
    submitLabel: "Save Location",
  },
  issue: {
    title: "Issue Spare",
    submitLabel: "Issue Stock",
  },
  reorder: {
    title: "Raise Re-order",
    submitLabel: "Update Stock",
  },
  supplier: {
    title: "Vendor Registration",
    submitLabel: "Save Supplier",
  },
};

const SparesPage = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const page = getPageMeta(pathname);
  const allowedSidebarItems = useMemo(
    () => getVisibleSidebarItemsForUser(sparesSidebarItems, user),
    [user],
  );
  const canViewCurrentPage = isSidebarFeatureVisible(user, pathname, page.title);
  const canUsePrimaryAction =
    hasActionPermission(user, pathname, "create") ||
    hasActionPermission(user, pathname, "update");
  const [spares, setSpares] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllRows, setShowAllRows] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [sparesResponse, vendorsResponse] = await Promise.all([
        getSpareRecords(),
        getSpareSuppliers(),
      ]);

      setSpares(asList(sparesResponse));
      setVendors(asList(vendorsResponse));
    } catch (requestError) {
      setError(requestError.message || "Failed to load spares data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setShowAllRows(false);
    setDialogOpen(false);
  }, [page.actionType, pathname]);

  const pageData = useMemo(
    () => buildPageData(pathname, { spares, vendors }),
    [pathname, spares, vendors],
  );

  const visibleRows = showAllRows ? pageData.rows : pageData.rows.slice(0, 8);
  const actionDetails = actionCopy[page.actionType] || actionCopy.spare;
  const activeSpares = spares.filter((item) => isActive(item?.status));
  const issueOptions = activeSpares.filter(
    (item) => toNumber(item?.currentStock) > 0,
  );
  const reorderOptions = spares.filter(isLowStock);
  const selectableSpares =
    page.actionType === "issue"
      ? issueOptions
      : page.actionType === "reorder"
        ? reorderOptions
        : spares;

  const formConfig = useMemo(() => {
    const spareOptions = selectableSpares.map((item) => ({
      label: `${cleanText(item?.spareName || item?.spareCode)} - Stock ${formatNumber(item?.currentStock)}`,
      value: getRecordId(item),
    }));

    if (page.actionType === "spare") {
      return {
        ...pageFormData.spareRegister,
        title: actionDetails.title,
        primaryActionLabel: actionDetails.submitLabel,
        successMessage: "Spare saved successfully.",
        fields: pageFormData.spareRegister.fields.map((field) => {
          if (field.name === "unit") {
            return {
              ...field,
              options: ["Nos", "Kg", "Ltr", "Mtr", "Set", "Box"],
            };
          }

          if (field.name === "status") {
            return {
              ...field,
              options: ["Active", "Inactive"],
            };
          }

          return field;
        }),
      };
    }

    if (page.actionType === "supplier") {
      return {
        ...pageFormData.vendorRegister,
        title: actionDetails.title,
        primaryActionLabel: actionDetails.submitLabel,
        successMessage: "Supplier saved successfully.",
        fields: pageFormData.vendorRegister.fields.map((field) => {
          if (field.name === "contractType") {
            return {
              ...field,
              options: ["Standard", "AMC", "Warranty", "Emergency"],
            };
          }

          if (field.name === "status") {
            return {
              ...field,
              options: ["Active", "Inactive"],
            };
          }

          return field;
        }),
      };
    }

    if (page.actionType === "location") {
      return {
        title: actionDetails.title,
        primaryActionLabel: actionDetails.submitLabel,
        secondaryActionLabel: "Reset",
        successMessage: "Location updated successfully.",
        fields: [
          {
            name: "spareId",
            label: "Spare",
            required: true,
            select: true,
            options: spareOptions,
          },
          {
            name: "shelfLocation",
            label: "Shelf / Bin Location",
            required: true,
          },
        ],
      };
    }

    if (page.actionType === "issue") {
      return {
        title: actionDetails.title,
        primaryActionLabel: actionDetails.submitLabel,
        secondaryActionLabel: "Reset",
        successMessage: "Spare issued successfully.",
        fields: [
          {
            name: "spareId",
            label: "Spare",
            required: true,
            select: true,
            options: spareOptions,
          },
          {
            name: "issueQty",
            label: "Issue Quantity",
            type: "number",
            required: true,
          },
        ],
      };
    }

    return {
      title: actionDetails.title,
      primaryActionLabel: actionDetails.submitLabel,
      secondaryActionLabel: "Reset",
      successMessage: "Re-order stock updated successfully.",
      fields: [
        {
          name: "spareId",
          label: "Spare",
          required: true,
          select: true,
          options: spareOptions,
        },
        {
          name: "orderQty",
          label: "Quantity Received",
          type: "number",
          required: true,
        },
      ],
    };
  }, [actionDetails, page.actionType, selectableSpares]);

  const openActionDialog = () => {
    if (!canUsePrimaryAction) return;

    setError("");
    setDialogOpen(true);
  };

  const closeActionDialog = () => {
    setDialogOpen(false);
  };

  const saveAction = async (values) => {
    setError("");

    try {
      if (page.actionType === "supplier") {
        await createSpareSupplier(values);
        setNotice("Supplier saved successfully.");
      } else if (page.actionType === "spare") {
        await createSpareRecord({
          ...values,
          currentStock: toNumber(values.currentStock),
          minQty: toNumber(values.minQty),
          maxQty: toNumber(values.maxQty),
          reorderLevel: toNumber(values.reorderLevel),
          leadTime: toNumber(values.leadTime),
          costPerUnit: toNumber(values.costPerUnit),
        });
        setNotice("Spare saved successfully.");
      } else {
        const selectedSpare = spares.find(
          (item) => getRecordId(item) === values.spareId,
        );

        if (!selectedSpare) {
          throw new Error("Select a spare to continue");
        }

        const selectedId = getRecordId(selectedSpare);

        if (page.actionType === "location") {
          await updateSpareRecord(
            selectedId,
            buildSpareUpdatePayload(selectedSpare, {
              shelfLocation: cleanText(values.shelfLocation, ""),
            }),
          );
          setNotice("Location updated successfully.");
        }

        if (page.actionType === "issue") {
          if (
            toNumber(values.issueQty) <= 0 ||
            toNumber(values.issueQty) > toNumber(selectedSpare.currentStock)
          ) {
            throw new Error("Issue quantity must be within available stock");
          }

          const nextStock = Math.max(
            toNumber(selectedSpare.currentStock) - toNumber(values.issueQty),
            0,
          );
          await updateSpareRecord(
            selectedId,
            buildSpareUpdatePayload(selectedSpare, { currentStock: nextStock }),
          );
          setNotice("Spare issued successfully.");
        }

        if (page.actionType === "reorder") {
          if (toNumber(values.orderQty) <= 0) {
            throw new Error("Quantity received must be greater than zero");
          }

          const nextStock =
            toNumber(selectedSpare.currentStock) + toNumber(values.orderQty);
          await updateSpareRecord(
            selectedId,
            buildSpareUpdatePayload(selectedSpare, { currentStock: nextStock }),
          );
          setNotice("Re-order stock updated successfully.");
        }
      }

      setDialogOpen(false);
      await loadData();
    } catch (saveError) {
      setError(saveError.message || "Failed to save action");
      throw saveError;
    }
  };

  if (!canViewCurrentPage) {
    return (
      <Navigate
        to={getFirstAccessibleSidebarPath(sparesSidebarItems, user)}
        replace
      />
    );
  }

  return (
    <ModuleLayout sidebarItems={allowedSidebarItems} lockPageScroll>
      <Stack
        spacing={2.5}
        sx={{
          height: "100%",
          minHeight: 0,
          overflow: "auto",
          backgroundColor: brand.pageBg,
          mx: { xs: -2, md: -3 },
          my: { xs: -2, md: -3 },
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack spacing={0.5}>
            <Typography
              sx={{
                color: brand.primary,
                fontSize: "0.78rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0,
              }}
            >
              {page.eyebrow}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: brand.text }}
            >
              {page.title}
            </Typography>
            <Typography sx={{ color: brand.textSoft, maxWidth: 760 }}>
              {page.description}
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={
                loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshRoundedIcon />
                )
              }
              onClick={loadData}
              disabled={loading}
              sx={{
                borderRadius: 1,
                minHeight: 42,
                px: 2,
                borderColor: brand.border,
                color: brand.primary,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              Refresh
            </Button>
            {canUsePrimaryAction ? (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openActionDialog}
                sx={{
                  borderRadius: 1,
                  minHeight: 42,
                  px: 2,
                  backgroundColor: brand.primary,
                  boxShadow: "none",
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    backgroundColor: "#0B5C5B",
                    boxShadow: "none",
                  },
                }}
              >
                {page.action}
              </Button>
            ) : null}
          </Stack>
        </Stack>

        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadData}>
                Retry
              </Button>
            }
            sx={{ borderRadius: 1 }}
          >
            {error}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {pageData.cards.map((card) => (
            <MetricCard key={card.label} card={card} loading={loading} />
          ))}
        </Box>

        <Paper
          elevation={0}
          sx={{
            ...cardSx,
            flex: 1,
            minHeight: 280,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Typography sx={{ color: brand.text, fontWeight: 800 }}>
              {pageData.rowsTitle}
            </Typography>
            <Button
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => setShowAllRows((current) => !current)}
              disabled={!pageData.rows.length}
              sx={{
                color: brand.primary,
                borderRadius: 1,
                fontWeight: 800,
                textTransform: "none",
              }}
            >
              {showAllRows ? "View less" : "View all"}
            </Button>
          </Stack>
          <Divider />

          <Stack sx={{ overflow: "auto", minHeight: 0, flex: 1 }}>
            {loading ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ flex: 1, minHeight: 180, color: brand.textSoft }}
              >
                <CircularProgress size={28} sx={{ color: brand.primary }} />
                <Typography>Loading spares data</Typography>
              </Stack>
            ) : visibleRows.length ? (
              visibleRows.map((row) => (
                <Box
                  key={row.join("-")}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1.2fr 0.9fr",
                      md: "1.4fr 1fr 0.8fr 1fr",
                    },
                    gap: 1.5,
                    alignItems: "center",
                    px: 2,
                    py: 1.5,
                    borderBottom: `1px solid ${brand.border}`,
                    "&:last-of-type": { borderBottom: 0 },
                  }}
                >
                  <Typography sx={{ color: brand.text, fontWeight: 800 }}>
                    {row[0]}
                  </Typography>
                  <Typography sx={{ color: brand.textSoft }}>
                    {row[1]}
                  </Typography>
                  <StatusChip value={row[2]} />
                  <Typography
                    sx={{
                      color: brand.textSoft,
                      display: { xs: "none", md: "block" },
                    }}
                  >
                    {row[3]}
                  </Typography>
                </Box>
              ))
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ flex: 1, minHeight: 180, color: brand.textSoft, px: 2 }}
              >
                <Typography>{pageData.emptyText}</Typography>
              </Stack>
            )}
          </Stack>
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={closeActionDialog}
          fullWidth
          maxWidth="sm"
          scroll="paper"
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: "hidden",
              width: "100%",
              maxWidth: { xs: "calc(100% - 24px)", sm: "496px" },
              height: { xs: "92vh", sm: "86vh" },
              maxHeight: { xs: "92vh", sm: "86vh" },
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <DialogContent
            dividers={false}
            sx={{
              p: 0,
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <MachineMaintenanceFormView
              {...formConfig}
              submitHandler={saveAction}
              onSuccess={closeActionDialog}
              onCancel={closeActionDialog}
            />
          </DialogContent>
        </Dialog>

        <Snackbar
          open={Boolean(notice)}
          autoHideDuration={2600}
          onClose={() => setNotice("")}
          message={notice}
        />
      </Stack>
    </ModuleLayout>
  );
};

export default SparesPage;
