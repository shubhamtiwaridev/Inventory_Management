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
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import InputRoundedIcon from "@mui/icons-material/InputRounded";

import ModuleLayout from "../../components/layouts/ModuleLayout";

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
  danger: "#C2410C",
  dangerSoft: "#FFF1EE",
  fieldBg: "#F8FCFC",
  muted: "#5F6F73",
};

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

const getCellSx = ({ isLast = false, align = "center" } = {}) => ({
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

const INBOUND_TABS = [
  { key: "asn", label: "ASN", icon: <InputRoundedIcon /> },
  {
    key: "predeliverystock",
    label: "PREDELIVERY STOCK",
    icon: <LocalShippingRoundedIcon />,
  },
  {
    key: "preloadstock",
    label: "PRELOAD STOCK",
    icon: <MoveToInboxRoundedIcon />,
  },
  {
    key: "presortstock",
    label: "PRESORT STOCK",
    icon: <PlaylistAddCheckRoundedIcon />,
  },
  { key: "sortstock", label: "SORT STOCK", icon: <InventoryRoundedIcon /> },
  { key: "shortage", label: "SHORTAGE", icon: <ReportProblemRoundedIcon /> },
  { key: "more", label: "MORE", icon: <AddBoxRoundedIcon /> },
  { key: "asnfinish", label: "ASN FINISH", icon: <TaskAltRoundedIcon /> },
];

const parseInboundTab = (pathname) => {
  const base = "/inventory/inbound";
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : "";
  const segment = rest.split("/").filter(Boolean)[0] || "asn";
  return INBOUND_TABS.some((tab) => tab.key === segment) ? segment : "asn";
};

const buildInboundTabPath = (tabKey) => {
  return tabKey === "asn"
    ? "/inventory/inbound"
    : `/inventory/inbound/${tabKey}`;
};

const statusLabelMap = {
  1: "Predelivery Stock",
  2: "Preload Stock",
  3: "Presort Stock",
  4: "Sort Stock",
  5: "ASN Finish",
};

const asnColumns = [
  { key: "asnCode", label: "ASN Code", width: "14%" },
  { key: "statusLabel", label: "ASN Status", width: "14%" },
  { key: "totalWeight", label: "Total Weight", width: "10%" },
  { key: "totalVolume", label: "Total Volume", width: "10%" },
  { key: "totalCost", label: "Total Cost", width: "10%" },
  { key: "supplier", label: "Supplier", width: "14%" },
  { key: "createdBy", label: "Creater", width: "12%" },
  { key: "createdAt", label: "Create Time", width: "13%" },
  { key: "updatedAt", label: "Update Time", width: "13%" },
];

const itemColumnsMap = {
  predeliverystock: [
    { key: "asnCode", label: "ASN Code", width: "14%" },
    { key: "goodsCode", label: "Goods Code", width: "14%" },
    { key: "goodsDesc", label: "Goods Description", width: "18%" },
    { key: "goodsQty", label: "Goods Qty", width: "10%" },
    { key: "supplier", label: "Supplier", width: "14%" },
    { key: "createdBy", label: "Creater", width: "12%" },
    { key: "createdAt", label: "Create Time", width: "18%" },
  ],
  preloadstock: [
    { key: "asnCode", label: "ASN Code", width: "14%" },
    { key: "goodsCode", label: "Goods Code", width: "14%" },
    { key: "goodsDesc", label: "Goods Description", width: "18%" },
    { key: "goodsQty", label: "Goods Qty", width: "10%" },
    { key: "supplier", label: "Supplier", width: "14%" },
    { key: "createdBy", label: "Creater", width: "12%" },
    { key: "createdAt", label: "Create Time", width: "18%" },
  ],
  presortstock: [
    { key: "asnCode", label: "ASN Code", width: "14%" },
    { key: "goodsCode", label: "Goods Code", width: "14%" },
    { key: "goodsDesc", label: "Goods Description", width: "18%" },
    { key: "goodsQty", label: "Presort Qty", width: "10%" },
    { key: "supplier", label: "Supplier", width: "14%" },
    { key: "createdBy", label: "Creater", width: "12%" },
    { key: "createdAt", label: "Create Time", width: "18%" },
  ],
  sortstock: [
    { key: "asnCode", label: "ASN Code", width: "12%" },
    { key: "goodsCode", label: "Goods Code", width: "14%" },
    { key: "goodsDesc", label: "Goods Description", width: "18%" },
    { key: "goodsActualQty", label: "Actual Qty", width: "10%" },
    { key: "sortedQty", label: "Sorted Qty", width: "10%" },
    { key: "supplier", label: "Supplier", width: "12%" },
    { key: "createdBy", label: "Creater", width: "10%" },
    { key: "createdAt", label: "Create Time", width: "14%" },
  ],
  shortage: [
    { key: "asnCode", label: "ASN Code", width: "14%" },
    { key: "goodsCode", label: "Goods Code", width: "14%" },
    { key: "goodsDesc", label: "Goods Description", width: "18%" },
    { key: "goodsQty", label: "Planned Qty", width: "10%" },
    { key: "goodsActualQty", label: "Actual Qty", width: "10%" },
    { key: "goodsShortageQty", label: "Shortage Qty", width: "10%" },
    { key: "supplier", label: "Supplier", width: "12%" },
    { key: "createdAt", label: "Create Time", width: "12%" },
  ],
  more: [
    { key: "asnCode", label: "ASN Code", width: "14%" },
    { key: "goodsCode", label: "Goods Code", width: "14%" },
    { key: "goodsDesc", label: "Goods Description", width: "18%" },
    { key: "goodsQty", label: "Planned Qty", width: "10%" },
    { key: "goodsActualQty", label: "Actual Qty", width: "10%" },
    { key: "goodsMoreQty", label: "More Qty", width: "10%" },
    { key: "supplier", label: "Supplier", width: "12%" },
    { key: "createdAt", label: "Create Time", width: "12%" },
  ],
  asnfinish: [
    { key: "asnCode", label: "ASN Code", width: "12%" },
    { key: "goodsCode", label: "Goods Code", width: "12%" },
    { key: "goodsDesc", label: "Goods Description", width: "16%" },
    { key: "goodsQty", label: "Goods Qty", width: "10%" },
    { key: "goodsActualQty", label: "Actual Qty", width: "10%" },
    { key: "goodsShortageQty", label: "Shortage Qty", width: "10%" },
    { key: "goodsMoreQty", label: "More Qty", width: "10%" },
    { key: "goodsDamageQty", label: "Damage Qty", width: "10%" },
    { key: "supplier", label: "Supplier", width: "10%" },
  ],
};

const emptyOrderForm = {
  supplier: "",
  items: [{ goodsCode: "", goodsQty: 1 }],
};

const emptySortedForm = {
  orderId: "",
  asnCode: "",
  supplier: "",
  items: [],
};

const emptyPutawayForm = {
  itemId: "",
  goodsCode: "",
  binName: "",
  qty: "",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toCsv = (columns, rows) => {
  const header = columns.map((column) => column.label);
  const dataRows = rows.map((row) =>
    columns.map((column) => row[column.key] ?? ""),
  );

  return [header, ...dataRows]
    .map((line) =>
      line.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
};

const InboundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = useMemo(
    () => parseInboundTab(location.pathname),
    [location.pathname],
  );

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [goodsOptions, setGoodsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const [openOrderForm, setOpenOrderForm] = useState(false);
  const [orderFormError, setOrderFormError] = useState("");
  const [orderSaving, setOrderSaving] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState("");
  const [orderForm, setOrderForm] = useState(emptyOrderForm);

  const [viewOrder, setViewOrder] = useState(null);

  const [sortedDialog, setSortedDialog] = useState(false);
  const [sortedError, setSortedError] = useState("");
  const [sortedSaving, setSortedSaving] = useState(false);
  const [sortedForm, setSortedForm] = useState(emptySortedForm);

  const [putawayDialog, setPutawayDialog] = useState(false);
  const [putawaySaving, setPutawaySaving] = useState(false);
  const [putawayError, setPutawayError] = useState("");
  const [putawayForm, setPutawayForm] = useState(emptyPutawayForm);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSaving, setDeleteSaving] = useState(false);

  const showCreate = activeTab === "asn";
  const tableColumns =
    activeTab === "asn" ? asnColumns : itemColumnsMap[activeTab];

  const loadGoodsOptions = async () => {
    const response = await fetch(`${API_BASE_URL}/inventory/goods?search=`, {
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load goods.");
    }

    setGoodsOptions(Array.isArray(data.items) ? data.items : []);
  };

  const loadRows = async () => {
    setLoading(true);
    setPageError("");

    try {
      if (activeTab === "asn") {
        const response = await fetch(
          `${API_BASE_URL}/inbound/orders?search=${encodeURIComponent(search)}`,
          { credentials: "include" },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load ASN list.");
        }

        setRows(Array.isArray(data.items) ? data.items : []);
      } else {
        const response = await fetch(
          `${API_BASE_URL}/inbound/items?view=${activeTab}&search=${encodeURIComponent(search)}`,
          { credentials: "include" },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load inbound items.");
        }

        setRows(Array.isArray(data.items) ? data.items : []);
      }
    } catch (error) {
      setPageError(error.message || "Failed to load inbound data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [activeTab, search]);

  const handleRefresh = async () => {
    setSearch("");
    await loadRows();
  };

  const handleDownload = () => {
    const csv = toCsv(tableColumns, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inbound-${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const openCreateOrder = async () => {
    try {
      await loadGoodsOptions();
      setEditingOrderId("");
      setOrderForm(emptyOrderForm);
      setOrderFormError("");
      setOpenOrderForm(true);
    } catch (error) {
      setPageError(error.message || "Failed to load goods.");
    }
  };

  const addOrderRow = () => {
    setOrderForm((prev) => ({
      ...prev,
      items: [...prev.items, { goodsCode: "", goodsQty: 1 }],
    }));
  };

  const removeOrderRow = (index) => {
    setOrderForm((prev) => ({
      ...prev,
      items:
        prev.items.length === 1
          ? prev.items
          : prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const updateOrderRow = (index, field, value) => {
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const fetchOrderDetails = async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/inbound/orders/${orderId}`, {
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load ASN details.");
    }

    return data;
  };

  const handleViewOrder = async (orderId) => {
    try {
      const data = await fetchOrderDetails(orderId);
      setViewOrder(data);
    } catch (error) {
      setPageError(error.message || "Failed to load ASN details.");
    }
  };

  const handleEditOrder = async (orderId) => {
    try {
      await loadGoodsOptions();
      const data = await fetchOrderDetails(orderId);

      setEditingOrderId(orderId);
      setOrderFormError("");
      setOrderForm({
        supplier: data.order?.supplier || "",
        items: (data.items || []).map((item) => ({
          goodsCode: item.goodsCode || "",
          goodsQty: Number(item.goodsQty || 0),
        })),
      });
      setOpenOrderForm(true);
    } catch (error) {
      setPageError(error.message || "Failed to load ASN details.");
    }
  };

  const submitOrderForm = async (event) => {
    event.preventDefault();
    setOrderSaving(true);
    setOrderFormError("");

    try {
      const endpoint = editingOrderId
        ? `${API_BASE_URL}/inbound/orders/${editingOrderId}`
        : `${API_BASE_URL}/inbound/orders`;

      const response = await fetch(endpoint, {
        method: editingOrderId ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save ASN.");
      }

      setOpenOrderForm(false);
      setOrderForm(emptyOrderForm);
      setEditingOrderId("");
      await loadRows();
    } catch (error) {
      setOrderFormError(error.message || "Failed to save ASN.");
    } finally {
      setOrderSaving(false);
    }
  };

  const postOrderAction = async (orderId, action) => {
    const response = await fetch(
      `${API_BASE_URL}/inbound/orders/${orderId}/${action}`,
      {
        method: "POST",
        credentials: "include",
      },
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Action failed.");
    }

    return data;
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      await postOrderAction(orderId, "confirm-delivery");
      await loadRows();
    } catch (error) {
      setPageError(error.message || "Failed to confirm delivery.");
    }
  };

  const handleFinishLoading = async (orderId) => {
    try {
      await postOrderAction(orderId, "finish-loading");
      await loadRows();
    } catch (error) {
      setPageError(error.message || "Failed to finish loading.");
    }
  };

  const handleOpenSorted = async (orderId) => {
    try {
      const data = await fetchOrderDetails(orderId);

      setSortedForm({
        orderId,
        asnCode: data.order?.asnCode || "",
        supplier: data.order?.supplier || "",
        items: (data.items || []).map((item) => ({
          itemId: item._id,
          goodsCode: item.goodsCode,
          goodsDesc: item.goodsDesc,
          goodsQty: Number(item.goodsQty || 0),
          goodsActualQty: Number(item.goodsQty || 0),
          goodsDamageQty: 0,
        })),
      });
      setSortedError("");
      setSortedDialog(true);
    } catch (error) {
      setPageError(error.message || "Failed to load ASN sort data.");
    }
  };

  const updateSortedRow = (index, field, value) => {
    setSortedForm((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const submitSorted = async () => {
    try {
      setSortedSaving(true);
      setSortedError("");

      const response = await fetch(
        `${API_BASE_URL}/inbound/orders/${sortedForm.orderId}/confirm-sorted`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: sortedForm.items }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to confirm sorted.");
      }

      setSortedDialog(false);
      setSortedForm(emptySortedForm);
      await loadRows();
    } catch (error) {
      setSortedError(error.message || "Failed to confirm sorted.");
    } finally {
      setSortedSaving(false);
    }
  };

  const openPutaway = (row) => {
    setPutawayError("");
    setPutawayForm({
      itemId: row._id,
      goodsCode: row.goodsCode,
      binName: "",
      qty: row.sortedQty - row.putawayQty,
    });
    setPutawayDialog(true);
  };

  const submitPutaway = async () => {
    try {
      setPutawaySaving(true);
      setPutawayError("");

      const response = await fetch(
        `${API_BASE_URL}/inbound/items/${putawayForm.itemId}/putaway`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            binName: putawayForm.binName,
            qty: Number(putawayForm.qty || 0),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to move to bin.");
      }

      setPutawayDialog(false);
      setPutawayForm(emptyPutawayForm);
      await loadRows();
    } catch (error) {
      setPutawayError(error.message || "Failed to move to bin.");
    } finally {
      setPutawaySaving(false);
    }
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteSaving(true);
      setDeleteError("");

      const response = await fetch(
        `${API_BASE_URL}/inbound/orders/${deleteTarget._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete ASN.");
      }

      setDeleteTarget(null);
      await loadRows();
    } catch (error) {
      setDeleteError(error.message || "Failed to delete ASN.");
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <ModuleLayout sidebarItems={inventorySidebarItems}>
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
          {INBOUND_TABS.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <Button
                key={tab.key}
                onClick={() => navigate(buildInboundTabPath(tab.key))}
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
                onClick={openCreateOrder}
                disabled={!showCreate}
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

              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownload}
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
                Download
              </Button>
            </Stack>

            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
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

          {pageError ? (
            <Typography sx={{ color: brand.danger, mb: 2, fontWeight: 700 }}>
              {pageError}
            </Typography>
          ) : null}

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
                minWidth: activeTab === "asn" ? 1500 : 1200,
                backgroundColor: "#FFFFFF",
                tableLayout: "fixed",
                borderCollapse: "collapse",
              }}
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: brand.softAlt }}>
                  {tableColumns.map((column, index) => (
                    <TableCell
                      key={column.key}
                      sx={{
                        ...getCellSx({
                          isLast:
                            index === tableColumns.length - 1 &&
                            activeTab !== "asn" &&
                            activeTab !== "sortstock",
                          align: "center",
                        }),
                        fontWeight: 800,
                        color: brand.text,
                        width: column.width,
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}

                  {activeTab === "asn" || activeTab === "sortstock" ? (
                    <TableCell
                      align="center"
                      sx={{
                        ...getCellSx({ isLast: true, align: "center" }),
                        fontWeight: 800,
                        color: brand.text,
                        width: activeTab === "asn" ? "220px" : "90px",
                      }}
                    >
                      Action
                    </TableCell>
                  ) : null}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        tableColumns.length +
                        (activeTab === "asn" || activeTab === "sortstock"
                          ? 1
                          : 0)
                      }
                      align="center"
                      sx={getCellSx({ isLast: true, align: "center" })}
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        tableColumns.length +
                        (activeTab === "asn" || activeTab === "sortstock"
                          ? 1
                          : 0)
                      }
                      align="center"
                      sx={getCellSx({ isLast: true, align: "center" })}
                    >
                      No inbound data found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
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
                      {tableColumns.map((column, index) => {
                        const value =
                          column.key === "createdAt" ||
                          column.key === "updatedAt"
                            ? formatDateTime(row[column.key])
                            : (row[column.key] ?? "-");

                        const isLast =
                          index === tableColumns.length - 1 &&
                          activeTab !== "asn" &&
                          activeTab !== "sortstock";

                        if (column.key === "statusLabel") {
                          return (
                            <TableCell
                              key={column.key}
                              align="center"
                              sx={getCellSx({ isLast, align: "center" })}
                            >
                              <Chip
                                label={value}
                                size="small"
                                sx={{
                                  borderRadius: 2,
                                  backgroundColor:
                                    Number(row.asnStatus) === 5
                                      ? brand.soft
                                      : "#FFF8ED",
                                  color:
                                    Number(row.asnStatus) === 5
                                      ? brand.primaryDark
                                      : "#D97706",
                                  fontWeight: 700,
                                }}
                              />
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell
                            key={column.key}
                            sx={{
                              ...getCellSx({ isLast, align: "center" }),
                              color:
                                column.key === "asnCode" ||
                                column.key === "goodsCode" ||
                                column.key === "supplier"
                                  ? brand.text
                                  : brand.textSoft,
                              fontWeight:
                                column.key === "asnCode" ||
                                column.key === "goodsCode" ||
                                column.key === "goodsDesc"
                                  ? 600
                                  : 500,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {value}
                          </TableCell>
                        );
                      })}

                      {activeTab === "asn" ? (
                        <TableCell
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          <Stack
                            direction="row"
                            justifyContent="center"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <IconButton
                              sx={actionButtonSx}
                              onClick={() => handleViewOrder(row._id)}
                            >
                              <VisibilityRoundedIcon
                                sx={{ fontSize: 18, color: brand.primaryDark }}
                              />
                            </IconButton>

                            <IconButton
                              sx={actionButtonSx}
                              onClick={() => handleConfirmDelivery(row._id)}
                              disabled={Number(row.asnStatus) !== 1}
                            >
                              <LocalShippingRoundedIcon
                                sx={{ fontSize: 18, color: "#D97706" }}
                              />
                            </IconButton>

                            <IconButton
                              sx={actionButtonSx}
                              onClick={() => handleFinishLoading(row._id)}
                              disabled={Number(row.asnStatus) !== 2}
                            >
                              <MoveToInboxRoundedIcon
                                sx={{ fontSize: 18, color: "#12807B" }}
                              />
                            </IconButton>

                            <IconButton
                              sx={actionButtonSx}
                              onClick={() => handleOpenSorted(row._id)}
                              disabled={Number(row.asnStatus) !== 3}
                            >
                              <PlaylistAddCheckRoundedIcon
                                sx={{ fontSize: 18, color: "#0C5A58" }}
                              />
                            </IconButton>

                            <IconButton
                              sx={actionButtonSx}
                              onClick={() => handleEditOrder(row._id)}
                              disabled={Number(row.asnStatus) !== 1}
                            >
                              <EditRoundedIcon
                                sx={{ fontSize: 18, color: brand.primaryDark }}
                              />
                            </IconButton>

                            <IconButton
                              onClick={() => setDeleteTarget(row)}
                              sx={{
                                ...actionButtonSx,
                                "&:hover": {
                                  backgroundColor: brand.dangerSoft,
                                },
                              }}
                              disabled={Number(row.asnStatus) !== 1}
                            >
                              <DeleteOutlineRoundedIcon
                                sx={{ fontSize: 18, color: brand.danger }}
                              />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      ) : null}

                      {activeTab === "sortstock" ? (
                        <TableCell
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          <IconButton
                            sx={actionButtonSx}
                            onClick={() => openPutaway(row)}
                          >
                            <MoveToInboxRoundedIcon
                              sx={{ fontSize: 18, color: brand.primaryDark }}
                            />
                          </IconButton>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      <Dialog
        open={openOrderForm}
        onClose={() => setOpenOrderForm(false)}
        fullWidth
        maxWidth="md"
        disableRestoreFocus
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${brand.border}`,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: brand.text, pb: 1 }}>
          {editingOrderId ? "Update ASN" : "Add New ASN"}
        </DialogTitle>

        <Box component="form" onSubmit={submitOrderForm}>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2}>
              {orderFormError ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {orderFormError}
                </Alert>
              ) : null}

              <TextField
                fullWidth
                label="Supplier"
                value={orderForm.supplier}
                onChange={(e) =>
                  setOrderForm((prev) => ({
                    ...prev,
                    supplier: e.target.value,
                  }))
                }
                sx={textFieldStyles}
              />

              {orderForm.items.map((item, index) => {
                const goods = goodsOptions.find(
                  (row) => row.goodsCode === item.goodsCode,
                );

                return (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: `1px solid ${brand.border}`,
                    }}
                  >
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            md: "1fr 1fr 120px",
                          },
                          gap: 2,
                        }}
                      >
                        <TextField
                          select
                          label="Goods Code"
                          value={item.goodsCode}
                          onChange={(e) =>
                            updateOrderRow(index, "goodsCode", e.target.value)
                          }
                          fullWidth
                          sx={textFieldStyles}
                        >
                          {goodsOptions.map((option) => (
                            <MenuItem key={option._id} value={option.goodsCode}>
                              {option.goodsCode}
                            </MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          label="Goods Description"
                          value={goods?.goodsDesc || ""}
                          fullWidth
                          disabled
                          sx={textFieldStyles}
                        />

                        <TextField
                          label="Qty"
                          type="number"
                          value={item.goodsQty}
                          onChange={(e) =>
                            updateOrderRow(index, "goodsQty", e.target.value)
                          }
                          fullWidth
                          sx={textFieldStyles}
                        />
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          color="error"
                          onClick={() => removeOrderRow(index)}
                          disabled={orderForm.items.length === 1}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}

              <Button
                onClick={addOrderRow}
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                  fontWeight: 700,
                  color: brand.primaryDark,
                }}
              >
                + Add Goods Row
              </Button>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setOpenOrderForm(false)}
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
              disabled={orderSaving}
              sx={{
                minWidth: 140,
                borderRadius: 3,
                px: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 700,
                background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
              }}
            >
              {orderSaving ? "Saving..." : editingOrderId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={sortedDialog}
        onClose={() => setSortedDialog(false)}
        fullWidth
        maxWidth="md"
        disableRestoreFocus
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${brand.border}`,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: brand.text, pb: 1 }}>
          Confirm Sorted - {sortedForm.asnCode}
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            {sortedError ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {sortedError}
              </Alert>
            ) : null}

            {sortedForm.items.map((item, index) => (
              <Paper
                key={item.itemId}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${brand.border}`,
                }}
              >
                <Stack spacing={2}>
                  <Typography sx={{ fontWeight: 700, color: brand.text }}>
                    {item.goodsCode} - {item.goodsDesc}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Planned Qty"
                      value={item.goodsQty}
                      fullWidth
                      disabled
                      sx={textFieldStyles}
                    />

                    <TextField
                      label="Actual Qty"
                      type="number"
                      value={item.goodsActualQty}
                      onChange={(e) =>
                        updateSortedRow(index, "goodsActualQty", e.target.value)
                      }
                      fullWidth
                      sx={textFieldStyles}
                    />

                    <TextField
                      label="Damage Qty"
                      type="number"
                      value={item.goodsDamageQty}
                      onChange={(e) =>
                        updateSortedRow(index, "goodsDamageQty", e.target.value)
                      }
                      fullWidth
                      sx={textFieldStyles}
                    />
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setSortedDialog(false)}
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
            variant="contained"
            onClick={submitSorted}
            disabled={sortedSaving}
            sx={{
              minWidth: 140,
              borderRadius: 3,
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontWeight: 700,
              background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
            }}
          >
            {sortedSaving ? "Saving..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={putawayDialog}
        onClose={() => setPutawayDialog(false)}
        fullWidth
        maxWidth="xs"
        disableRestoreFocus
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${brand.border}`,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: brand.text, pb: 1 }}>
          Move To Bin - {putawayForm.goodsCode}
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            {putawayError ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {putawayError}
              </Alert>
            ) : null}

            <TextField
              label="Bin Name"
              value={putawayForm.binName}
              onChange={(e) =>
                setPutawayForm((prev) => ({
                  ...prev,
                  binName: e.target.value,
                }))
              }
              fullWidth
              sx={textFieldStyles}
            />

            <TextField
              label="Qty"
              type="number"
              value={putawayForm.qty}
              onChange={(e) =>
                setPutawayForm((prev) => ({
                  ...prev,
                  qty: e.target.value,
                }))
              }
              fullWidth
              sx={textFieldStyles}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setPutawayDialog(false)}
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
            variant="contained"
            onClick={submitPutaway}
            disabled={putawaySaving}
            sx={{
              minWidth: 140,
              borderRadius: 3,
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontWeight: 700,
              background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
            }}
          >
            {putawaySaving ? "Saving..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${brand.border}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: brand.text }}>
          Delete ASN
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: brand.textSoft }}>
            Are you sure you want to delete this ASN?
          </Typography>
          {deleteError ? (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {deleteError}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            sx={{
              minWidth: 100,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              color: brand.text,
              borderColor: brand.border,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitDelete}
            disabled={deleteSaving}
            sx={{
              minWidth: 100,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: brand.danger,
              "&:hover": {
                backgroundColor: brand.danger,
              },
            }}
          >
            {deleteSaving ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(viewOrder)}
        onClose={() => setViewOrder(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${brand.border}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: brand.text }}>
          ASN Details - {viewOrder?.order?.asnCode}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography sx={{ color: brand.textSoft }}>
              Supplier: {viewOrder?.order?.supplier || "-"}
            </Typography>

            <TableContainer
              sx={{
                borderRadius: 3,
                border: `1px solid ${brand.border}`,
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  minWidth: 900,
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: brand.softAlt }}>
                    <TableCell sx={{ ...getCellSx(), fontWeight: 800 }}>
                      Goods Code
                    </TableCell>
                    <TableCell sx={{ ...getCellSx(), fontWeight: 800 }}>
                      Goods Description
                    </TableCell>
                    <TableCell sx={{ ...getCellSx(), fontWeight: 800 }}>
                      Goods Qty
                    </TableCell>
                    <TableCell sx={{ ...getCellSx(), fontWeight: 800 }}>
                      Weight
                    </TableCell>
                    <TableCell sx={{ ...getCellSx(), fontWeight: 800 }}>
                      Volume
                    </TableCell>
                    <TableCell
                      sx={{ ...getCellSx({ isLast: true }), fontWeight: 800 }}
                    >
                      Cost
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(viewOrder?.items || []).map((item) => (
                    <TableRow key={item._id}>
                      <TableCell sx={getCellSx()}>{item.goodsCode}</TableCell>
                      <TableCell sx={getCellSx()}>{item.goodsDesc}</TableCell>
                      <TableCell sx={getCellSx()}>{item.goodsQty}</TableCell>
                      <TableCell sx={getCellSx()}>{item.goodsWeight}</TableCell>
                      <TableCell sx={getCellSx()}>{item.goodsVolume}</TableCell>
                      <TableCell sx={getCellSx({ isLast: true })}>
                        {item.goodsCost}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setViewOrder(null)}
            sx={{
              minWidth: 100,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              color: brand.text,
              borderColor: brand.border,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ModuleLayout>
  );
};

export default InboundPage;
