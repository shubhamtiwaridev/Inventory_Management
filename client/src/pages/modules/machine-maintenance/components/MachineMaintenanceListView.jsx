import { useMemo, useState } from "react";
import {
  Button,
  Chip,
  IconButton,
  InputAdornment,
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
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import {
  actionIconButtonSx,
  brand,
  filledActionButtonSx,
  getCellSx,
  outlinedActionButtonSx,
  searchFieldSx,
} from "./machineMaintenanceUi.jsx";

const matchesSearch = (row, keyword) => {
  if (!keyword) return true;

  return Object.values(row).some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(keyword),
  );
};

const getStatusChipSx = (value) => {
  const lowered = String(value).toLowerCase();

  if (lowered === "critical" || lowered === "breakdown") {
    return {
      borderRadius: 2,
      fontWeight: 700,
      backgroundColor: "#FFF1EE",
      color: "#C2410C",
    };
  }

  if (lowered === "under maintenance" || lowered === "pending") {
    return {
      borderRadius: 2,
      fontWeight: 700,
      backgroundColor: "#FFF8ED",
      color: "#D97706",
    };
  }

  return {
    borderRadius: 2,
    fontWeight: 700,
    backgroundColor: brand.soft,
    color: brand.primaryDark,
  };
};

const MachineMaintenanceListView = ({
  title,
  columns = [],
  rows = [],
  primaryButtonLabel = "New",
  onPrimaryAction,
  showPrimaryAction = true,
}) => {
  const [search, setSearch] = useState("");
  const keyword = search.trim().toLowerCase();

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesSearch(row, keyword)),
    [rows, keyword],
  );

  const handleRefresh = () => {
    setSearch("");
  };

  const handleDownload = () => {
    const header = columns.map((column) => column.label);
    const csvRows = filteredRows.map((row) =>
      columns.map((column) => row[column.key] || ""),
    );

    const csv = [header, ...csvRows]
      .map((line) =>
        line.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={2.25}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 0.5 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          flexWrap="wrap"
          useFlexGap
        >
          {showPrimaryAction ? (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={filledActionButtonSx}
              onClick={onPrimaryAction}
            >
              {primaryButtonLabel}
            </Button>
          ) : null}

          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={handleRefresh}
            sx={outlinedActionButtonSx}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownload}
            sx={outlinedActionButtonSx}
          >
            Download
          </Button>
        </Stack>

        <TextField
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder={`Search ${title.toLowerCase()}...`}
          size="small"
          sx={searchFieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchRoundedIcon sx={{ color: brand.textSoft }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center">
        <Typography
          sx={{ color: brand.text, fontWeight: 800, fontSize: "1.05rem" }}
        >
          {title}
        </Typography>
      </Stack>

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
            minWidth: 980,
            backgroundColor: "#FFFFFF",
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: brand.softAlt,
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{
                    ...getCellSx({ isLast: false }),
                    fontWeight: 800,
                    color: brand.text,
                    width: column.width || "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {column.label}
                </TableCell>
              ))}

              <TableCell
                align="center"
                sx={{
                  ...getCellSx({ isLast: true, align: "center" }),
                  fontWeight: 800,
                  color: brand.text,
                  width: "12%",
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  align="center"
                  sx={getCellSx({ isLast: true, align: "center" })}
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    backgroundColor: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#FAFBFC",
                    },
                  }}
                >
                  {columns.map((column, index) => {
                    const value = row[column.key] || "-";
                    const isStatus = column.type === "status";

                    return (
                      <TableCell
                        key={column.key}
                        sx={{
                          ...getCellSx({ isLast: false }),
                          color: isStatus ? brand.text : brand.textSoft,
                          fontWeight: index === 0 ? 700 : 500,
                          wordBreak: "break-word",
                          whiteSpace: column.nowrap ? "nowrap" : "normal",
                        }}
                      >
                        {isStatus ? (
                          <Chip
                            label={value}
                            size="small"
                            sx={getStatusChipSx(value)}
                          />
                        ) : (
                          value
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell
                    align="center"
                    sx={getCellSx({ isLast: true, align: "center" })}
                  >
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton sx={actionIconButtonSx}>
                        <EditRoundedIcon
                          sx={{ fontSize: 18, color: brand.text }}
                        />
                      </IconButton>
                      <IconButton sx={actionIconButtonSx}>
                        <DeleteOutlineRoundedIcon
                          sx={{ fontSize: 18, color: brand.danger }}
                        />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default MachineMaintenanceListView;
