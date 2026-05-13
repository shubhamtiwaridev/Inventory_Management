import { useCallback, useEffect, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import MachineMaintenanceListView from "../machine-maintenance/components/MachineMaintenanceListView.jsx";
import { brand } from "../machine-maintenance/components/machineMaintenanceUi.jsx";
import {
  ACTIVITY_LOG_CREATED_EVENT,
  deleteLogActivity,
  getLogActivities,
} from "./logActivityApi.js";

const logActivityColumns = [
  { key: "userEmail", label: "User Email", width: "240px" },
  { key: "userName", label: "User Name", width: "200px" },
  { key: "role", label: "Role", width: "160px" },
  { key: "action", label: "Action", width: "220px" },
  { key: "page", label: "Page", width: "240px" },
  { key: "targetName", label: "Record", width: "240px" },
  { key: "assignedCards", label: "Assigned Cards", width: "280px" },
  { key: "time", label: "Time", width: "220px", nowrap: true },
];

const getExportFileName = (extension) => {
  const date = new Date().toISOString().slice(0, 10);
  return `log-activity-${date}.${extension}`;
};

const normalizeExportValue = (value) => {
  const text =
    value === undefined || value === null || value === "" ? "-" : String(value);

  // Prevent Excel formula injection
  if (/^[=+\-@]/.test(text)) {
    return `'${text}`;
  }

  return text;
};

const escapeCsvValue = (value) => {
  const text = normalizeExportValue(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const escapeHtmlValue = (value) =>
  normalizeExportValue(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const exportRowsToCsv = (rows, columns) => {
  const header = columns
    .map((column) => escapeCsvValue(column.label))
    .join(",");

  const body = rows
    .map((row) =>
      columns.map((column) => escapeCsvValue(row[column.key])).join(","),
    )
    .join("\n");

  downloadFile(
    `\ufeff${header}\n${body}`,
    getExportFileName("csv"),
    "text/csv;charset=utf-8;",
  );
};

const exportRowsToExcel = (rows, columns) => {
  const tableHeader = columns
    .map((column) => `<th>${escapeHtmlValue(column.label)}</th>`)
    .join("");

  const tableBody = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtmlValue(row[column.key])}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>${tableHeader}</tr>
          </thead>
          <tbody>
            ${tableBody}
          </tbody>
        </table>
      </body>
    </html>
  `;

  downloadFile(
    html,
    getExportFileName("xls"),
    "application/vnd.ms-excel;charset=utf-8;",
  );
};

const LogActivityPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const logs = await getLogActivities();
      setRows(logs);
    } catch (fetchError) {
      setError(fetchError.message || "Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    const handleActivityLogCreated = () => {
      fetchRows();
    };

    window.addEventListener(
      ACTIVITY_LOG_CREATED_EVENT,
      handleActivityLogCreated,
    );

    return () => {
      window.removeEventListener(
        ACTIVITY_LOG_CREATED_EVENT,
        handleActivityLogCreated,
      );
    };
  }, [fetchRows]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const handleDelete = async (row) => {
    if (!row?.id) return;

    const previousRows = rows;

    setRows((prev) => prev.filter((item) => item.id !== row.id));
    setError("");

    try {
      await deleteLogActivity(row.id);
    } catch (deleteError) {
      setRows(previousRows);
      setError(deleteError.message || "Failed to delete activity log");
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv(rows, logActivityColumns);
  };

  const handleExportExcel = () => {
    exportRowsToExcel(rows, logActivityColumns);
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        minHeight: "100dvh",
        maxHeight: "100dvh",
        background: brand.pageBg,
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <MachineMaintenanceListView
        title="Log Activity"
        columns={logActivityColumns}
        rows={rows}
        actionColumnLabel="Delete"
        showPrimaryAction={false}
        showActions
        showDownloadButton={false}
        toolbarActions={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              variant="outlined"
              onClick={handleExportCsv}
              disabled={loading || rows.length === 0}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                color: brand.primary,
                borderColor: brand.primary,
                backgroundColor: "#FFFFFF",
                "&:hover": {
                  borderColor: brand.primaryDark || brand.primary,
                  backgroundColor: "#F4F6F8",
                },
              }}
            >
              Export CSV
            </Button>

            <Button
              variant="contained"
              onClick={handleExportExcel}
              disabled={loading || rows.length === 0}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: brand.primary,
                "&:hover": {
                  backgroundColor: brand.primaryDark || brand.primary,
                },
              }}
            >
              Export Excel
            </Button>
          </Stack>
        }
        onDelete={handleDelete}
        onRefresh={fetchRows}
        loading={loading}
        error={error}
      />
    </Box>
  );
};

export default LogActivityPage;
