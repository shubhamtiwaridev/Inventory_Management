import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import OutboxRoundedIcon from "@mui/icons-material/OutboxRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import { brand, filledActionButtonSx, outlinedActionButtonSx } from "../../machine-maintenance/components/machineMaintenanceUi.jsx";
import { getGoodsListItems } from "./inventoryGoodsListApi.js";
import { getWarehouses } from "./inventoryWarehouseApi.js";
import {
  getInventorySummary,
  getInventoryTransactions,
} from "./inventoryTransactionApi.js";
import {
  exportRowsToCsv,
  exportRowsToExcel,
} from "./inventoryDownloadUtils.js";

const cardSx = {
  p: 3,
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  boxShadow: brand.shadow,
};

const downloadDefinitions = [
  {
    key: "goodsList",
    label: "Goods List",
    icon: <Inventory2RoundedIcon sx={{ color: brand.primary }} />,
    columns: [
      { key: "goodsCode", label: "Goods Code" },
      { key: "goodsDesc", label: "Goods Desc" },
      { key: "goodsSupplier", label: "Goods Supplier" },
      { key: "goodsUnit", label: "Goods Unit" },
      { key: "goodsClass", label: "Goods Class" },
      { key: "goodsBrand", label: "Goods Brand" },
      { key: "goodsColor", label: "Goods Color" },
      { key: "goodsSpecs", label: "Goods Specs" },
      { key: "goodsOrigin", label: "Goods Origin" },
      { key: "updatedAt", label: "Update Time" },
    ],
    baseName: "inventory-goods-list",
  },
  {
    key: "warehouses",
    label: "Warehouses",
    icon: <WarehouseRoundedIcon sx={{ color: brand.primary }} />,
    columns: [
      { key: "warehouseCode", label: "Warehouse Code" },
      { key: "warehouseName", label: "Warehouse Name" },
      { key: "location", label: "Location" },
      { key: "description", label: "Description" },
      { key: "updatedAt", label: "Update Time" },
    ],
    baseName: "inventory-warehouses",
  },
  {
    key: "inbound",
    label: "Inbound",
    icon: <MoveToInboxRoundedIcon sx={{ color: brand.primary }} />,
    columns: [
      { key: "entryNo", label: "Entry No" },
      { key: "goodsCode", label: "Goods Code" },
      { key: "goodsDesc", label: "Goods Desc" },
      { key: "warehouseName", label: "Warehouse" },
      { key: "partnerName", label: "Supplier" },
      { key: "quantity", label: "Quantity" },
      { key: "unit", label: "Unit" },
      { key: "transactionDate", label: "Received Date" },
      { key: "status", label: "Status" },
    ],
    baseName: "inventory-inbound",
  },
  {
    key: "outbound",
    label: "Outbound",
    icon: <OutboxRoundedIcon sx={{ color: brand.primary }} />,
    columns: [
      { key: "entryNo", label: "Entry No" },
      { key: "goodsCode", label: "Goods Code" },
      { key: "goodsDesc", label: "Goods Desc" },
      { key: "warehouseName", label: "Warehouse" },
      { key: "partnerName", label: "Issued To" },
      { key: "quantity", label: "Quantity" },
      { key: "unit", label: "Unit" },
      { key: "transactionDate", label: "Dispatch Date" },
      { key: "status", label: "Status" },
    ],
    baseName: "inventory-outbound",
  },
  {
    key: "inventorySummary",
    label: "Inventory Summary",
    icon: <AssessmentRoundedIcon sx={{ color: brand.primary }} />,
    columns: [
      { key: "goodsCode", label: "Goods Code" },
      { key: "goodsDesc", label: "Goods Desc" },
      { key: "warehouseName", label: "Warehouse" },
      { key: "unit", label: "Unit" },
      { key: "inboundQuantity", label: "Inbound Qty" },
      { key: "outboundQuantity", label: "Outbound Qty" },
      { key: "currentQuantity", label: "Current Qty" },
    ],
    baseName: "inventory-summary",
  },
];

const InventoryDownloadCenterPage = () => {
  const [datasets, setDatasets] = useState({
    goodsList: [],
    warehouses: [],
    inbound: [],
    outbound: [],
    inventorySummary: [],
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const datasetDefinitions = useMemo(
    () =>
      downloadDefinitions.map((definition) => ({
        ...definition,
        rows: datasets[definition.key] || [],
      })),
    [datasets],
  );

  const loadDatasets = useCallback(async () => {
    try {
      setLoading(true);
      const [goodsRows, warehouseRows, inboundRows, outboundRows, summary] =
        await Promise.all([
          getGoodsListItems(),
          getWarehouses(),
          getInventoryTransactions("inbound"),
          getInventoryTransactions("outbound"),
          getInventorySummary(),
        ]);

      setDatasets({
        goodsList: goodsRows,
        warehouses: warehouseRows,
        inbound: inboundRows,
        outbound: outboundRows,
        inventorySummary: Array.isArray(summary?.items) ? summary.items : [],
      });
      setFeedback((prev) =>
        prev.type === "error" ? { type: "", message: "" } : prev,
      );
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to load download center datasets",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  useEffect(() => {
    if (!feedback.message) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setFeedback({ type: "", message: "" });
    }, 10000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [feedback]);

  const handleExport = (definition, format) => {
    if (!definition.rows.length) {
      setFeedback({
        type: "error",
        message: `No ${definition.label} records available for download`,
      });
      return;
    }

    if (format === "excel") {
      exportRowsToExcel(definition.rows, definition.columns, definition.baseName);
    } else {
      exportRowsToCsv(definition.rows, definition.columns, definition.baseName);
    }

    setFeedback({
      type: "success",
      message: `${definition.label} exported successfully`,
    });
  };

  return (
    <Stack spacing={3} sx={{ flex: 1, minHeight: 0 }}>
      {feedback.message ? (
        <Alert
          severity={feedback.type === "success" ? "success" : "error"}
          onClose={() => setFeedback({ type: "", message: "" })}
          sx={{ borderRadius: 2.5, flexShrink: 0 }}
        >
          {feedback.message}
        </Alert>
      ) : null}

      <Paper elevation={0} sx={cardSx}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: brand.text }}>
              Download Center
            </Typography>
            <Typography sx={{ color: brand.textSoft, mt: 0.75 }}>
              Download live inventory data for goods, warehouses, inbound,
              outbound, and current stock summary.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={loadDatasets}
            disabled={loading}
            sx={outlinedActionButtonSx}
          >
            {loading ? "Refreshing..." : "Refresh Datasets"}
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {datasetDefinitions.map((definition) => (
          <Paper key={definition.key} elevation={0} sx={cardSx}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", lg: "center" }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                {definition.icon}
                <Box>
                  <Typography sx={{ fontWeight: 800, color: brand.text }}>
                    {definition.label}
                  </Typography>
                  <Typography sx={{ color: brand.textSoft, mt: 0.35 }}>
                    Live records available: {definition.rows.length}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <Chip
                  label={`Rows: ${definition.rows.length}`}
                  sx={{
                    borderRadius: 2.5,
                    backgroundColor: brand.soft,
                    color: brand.primaryDark,
                    fontWeight: 700,
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={() => handleExport(definition, "csv")}
                  disabled={loading || definition.rows.length === 0}
                  sx={outlinedActionButtonSx}
                >
                  Export CSV
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={() => handleExport(definition, "excel")}
                  disabled={loading || definition.rows.length === 0}
                  sx={filledActionButtonSx}
                >
                  Export Excel
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
};

export default InventoryDownloadCenterPage;
