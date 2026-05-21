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
import { useLocation } from "react-router-dom";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import {
  brand,
  filledActionButtonSx,
  outlinedActionButtonSx,
} from "../../machine-maintenance/components/machineMaintenanceUi.jsx";
import { useAuth } from "../../../store/AuthContext.jsx";
import { hasActionPermission } from "../../../utils/permissions.js";
import { getEcomProducts } from "./ecomProductsApi.js";
import {
  exportRowsToCsv,
  exportRowsToExcel,
} from "../../inventory/components/inventoryDownloadUtils.js";
import { ecomProductsConfig } from "./ecomProductsConfig.js";
import { logEcomActivity } from "./ecomActivityLogger.js";

const cardSx = {
  p: 3,
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  boxShadow: brand.shadow,
};

const defaultDatasets = {
  products: [],
};

const defaultDatasetMeta = {
  products: { loading: false, loaded: false },
};

const datasetLoaders = {
  products: ({ skipCache = false } = {}) => getEcomProducts({ skipCache }),
};

const EcomDownloadCenterPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [datasets, setDatasets] = useState(defaultDatasets);
  const [datasetMeta, setDatasetMeta] = useState(defaultDatasetMeta);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const canExportCsv = hasActionPermission(user, location.pathname, "create");
  const canExportExcel = hasActionPermission(user, location.pathname, "update");

  const downloadDefinitions = useMemo(() => {
    // Build columns from ecomProductsConfig if available
    const productColumns = Array.isArray(ecomProductsConfig?.columns)
      ? ecomProductsConfig.columns.map((c) => ({ key: c.key, label: c.label }))
      : [];

    return [
      {
        key: "products",
        label: "Products",
        icon: <ShoppingCartRoundedIcon sx={{ color: brand.primary }} />,
        columns: productColumns,
        baseName: "ecom-products",
      },
    ];
  }, []);

  const datasetDefinitions = useMemo(
    () =>
      downloadDefinitions.map((definition) => ({
        ...definition,
        rows: datasets[definition.key] || [],
        loading: datasetMeta[definition.key]?.loading || false,
        loaded: datasetMeta[definition.key]?.loaded || false,
      })),
    [datasetMeta, datasets, downloadDefinitions],
  );

  const isAnyDatasetLoading = useMemo(
    () => Object.values(datasetMeta).some((meta) => meta?.loading),
    [datasetMeta],
  );

  const loadDataset = useCallback(async (key, { skipCache = false } = {}) => {
    const loader = datasetLoaders[key];

    if (!loader) return [];

    try {
      setDatasetMeta((prev) => ({
        ...prev,
        [key]: { ...(prev[key] || {}), loading: true },
      }));

      const rows = await loader({ skipCache });

      setDatasets((prev) => ({
        ...prev,
        [key]: Array.isArray(rows) ? rows : [],
      }));
      setDatasetMeta((prev) => ({
        ...prev,
        [key]: { loading: false, loaded: true },
      }));
      setFeedback((prev) =>
        prev.type === "error" ? { type: "", message: "" } : prev,
      );

      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      setDatasetMeta((prev) => ({
        ...(prev || {}),
        [key]: { ...(prev[key] || {}), loading: false },
      }));
      setFeedback({
        type: "error",
        message: error.message || `Failed to load ${key} dataset`,
      });

      return [];
    }
  }, []);

  const loadDatasets = useCallback(async () => {
    const loadedKeys = downloadDefinitions
      .map((d) => d.key)
      .filter((k) => datasetMeta[k]?.loaded);
    const keysToRefresh =
      loadedKeys.length > 0
        ? loadedKeys
        : downloadDefinitions.map((d) => d.key);

    await Promise.allSettled(
      keysToRefresh.map((key) => loadDataset(key, { skipCache: true })),
    );
  }, [datasetMeta, downloadDefinitions, loadDataset]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadDatasets();
    })();
    return () => {
      mounted = false;
    };
  }, [loadDatasets]);

  useEffect(() => {
    if (!feedback.message) return undefined;
    const timerId = window.setTimeout(
      () => setFeedback({ type: "", message: "" }),
      10000,
    );
    return () => window.clearTimeout(timerId);
  }, [feedback]);

  const handleExport = async (definition, format) => {
    const rows = definition.loaded
      ? definition.rows
      : await loadDataset(definition.key);

    if (!rows.length) {
      setFeedback({
        type: "error",
        message: `No ${definition.label} records available for download`,
      });
      return;
    }

    if (format === "excel") {
      exportRowsToExcel(rows, definition.columns, definition.baseName);
    } else {
      exportRowsToCsv(rows, definition.columns, definition.baseName);
    }

    logEcomActivity({
      action: "Downloaded",
      page: "Download Center",
      resource: "Download",
      targetName:
        `${definition.label} ${String(format || "").toUpperCase()}`.trim(),
      endpoint: location.pathname,
      details: {
        source: "download-center",
        datasetKey: definition.key,
        datasetLabel: definition.label,
        format: String(format || "").toLowerCase(),
        rowCount: rows.length,
      },
    });

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
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: brand.text }}
            >
              Download Center
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={loadDatasets}
            disabled={isAnyDatasetLoading}
            sx={outlinedActionButtonSx}
          >
            {isAnyDatasetLoading ? "Refreshing..." : "Refresh Datasets"}
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
                </Box>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <Chip
                  label={
                    definition.loading
                      ? "Loading..."
                      : definition.loaded
                        ? `Rows: ${definition.rows.length}`
                        : "Rows: --"
                  }
                  sx={{
                    borderRadius: 2.5,
                    backgroundColor: brand.soft,
                    color: brand.primaryDark,
                    fontWeight: 700,
                  }}
                />
                {canExportCsv ? (
                  <Button
                    variant="outlined"
                    startIcon={<DownloadRoundedIcon />}
                    onClick={() => handleExport(definition, "csv")}
                    disabled={definition.loading}
                    sx={outlinedActionButtonSx}
                  >
                    Export CSV
                  </Button>
                ) : null}
                {canExportExcel ? (
                  <Button
                    variant="contained"
                    startIcon={<DownloadRoundedIcon />}
                    onClick={() => handleExport(definition, "excel")}
                    disabled={definition.loading}
                    sx={filledActionButtonSx}
                  >
                    Export Excel
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
};

export default EcomDownloadCenterPage;
