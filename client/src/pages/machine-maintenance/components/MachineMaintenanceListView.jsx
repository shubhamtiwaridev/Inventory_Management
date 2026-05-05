import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
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
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";

import {
  actionIconButtonSx,
  brand,
  filledActionButtonSx,
  getCellSx,
  outlinedActionButtonSx,
  searchFieldSx,
} from "./machineMaintenanceUi.jsx";
import { useAuth } from "../../../store/AuthContext.jsx";
import { hasActionPermission } from "../../../utils/permissions.js";

const getPlainValue = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);

  if (typeof value === "object") {
    if (value.displayName) return String(value.displayName);
    if (value.searchableText) return String(value.searchableText);
    if (value.label) return String(value.label);
  }

  return String(value);
};

const matchesSearch = (row, keyword) => {
  if (!keyword) return true;

  return Object.values(row).some((value) =>
    getPlainValue(value).toLowerCase().includes(keyword),
  );
};

const getStatusChipSx = (value) => {
  const lowered = String(value).toLowerCase();

  if (lowered === "critical" || lowered === "breakdown" || lowered === "high") {
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

const FilePreviewCell = ({ value }) => {
  if (
    !value ||
    value === "-" ||
    typeof value !== "object" ||
    value.kind !== "file"
  ) {
    return "-";
  }

  const isPdf = value.fileType === "pdf";
  const isImage = value.fileType === "image";

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="center"
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        mx: "auto",
      }}
    >
      <Link
        href={value.url}
        target="_blank"
        rel="noopener noreferrer"
        underline="none"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 1.5,
          border: `1px solid ${brand.border}`,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {isImage ? (
          <Box
            component="img"
            src={value.previewUrl}
            alt={value.displayName}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : isPdf ? (
          <PictureAsPdfRoundedIcon sx={{ fontSize: 18, color: "#C2410C" }} />
        ) : (
          <InsertDriveFileRoundedIcon
            sx={{ fontSize: 18, color: brand.textSoft }}
          />
        )}
      </Link>

      <Link
        href={value.url}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{
          maxWidth: "160px",
          color: brand.primaryDark,
          fontWeight: 600,
          fontSize: "0.92rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "inline-block",
          textAlign: "left",
        }}
      >
        {value.displayName}
      </Link>
    </Stack>
  );
};

const renderCellContent = (column, value) => {
  if (column.type === "status") {
    return (
      <Chip
        label={getPlainValue(value)}
        size="small"
        sx={getStatusChipSx(getPlainValue(value))}
      />
    );
  }

  if (
    column.type === "file" ||
    (typeof value === "object" && value?.kind === "file")
  ) {
    return <FilePreviewCell value={value} />;
  }

  return value ?? "-";
};

const MachineMaintenanceListView = ({
  title,
  columns = [],
  rows = [],
  primaryButtonLabel = "New",
  onPrimaryAction,
  showPrimaryAction = true,
  showActions = true,
  onEdit,
  onDelete,
  onRefresh,
  loading = false,
  error = "",
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const [search, setSearch] = useState("");

  const canCreate = hasActionPermission(user, location.pathname, "create");
  const canUpdate = hasActionPermission(user, location.pathname, "update");
  const canDelete = hasActionPermission(user, location.pathname, "delete");

  const canShowActionColumn = showActions && (canUpdate || canDelete);
  const keyword = search.trim().toLowerCase();

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesSearch(row, keyword)),
    [rows, keyword],
  );

  const tableMinWidth = Math.max(
    980,
    (columns.length + (canShowActionColumn ? 1 : 0)) * 180,
  );

  const handleRefresh = () => {
    setSearch("");
    onRefresh?.();
  };

  const handleDownload = () => {
    const header = columns.map((column) => column.label);
    const csvRows = filteredRows.map((row) =>
      columns.map((column) => getPlainValue(row[column.key] ?? "")),
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

  const handlePrimaryAction = () => {
    if (!canCreate) return;
    onPrimaryAction?.();
  };

  const handleEdit = (row) => {
    if (!canUpdate) return;
    onEdit?.(row);
  };

  const handleDelete = (row) => {
    if (!canDelete) return;
    onDelete?.(row);
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${brand.border}`,
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.5, sm: 2 },
            borderBottom: `1px solid ${brand.border}`,
            backgroundColor: "#FFFFFF",
            flexShrink: 0,
            zIndex: 5,
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              flexWrap="wrap"
              useFlexGap
            >
              {showPrimaryAction && canCreate ? (
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  sx={filledActionButtonSx}
                  onClick={handlePrimaryAction}
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
                disabled={loading || filteredRows.length === 0}
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
              sx={{
                width: { xs: "100%", lg: 320 },
                ...searchFieldSx,
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
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mx: 2, mt: 2, flexShrink: 0 }}>
            {error}
          </Alert>
        ) : null}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
          }}
        >
          <TableContainer
            sx={{
              height: "100%",
              maxHeight: "100%",
              overflowY: "auto",
              overflowX: "auto",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Table
              stickyHeader
              sx={{
                width: "100%",
                minWidth: tableMinWidth,
                backgroundColor: "#FFFFFF",
                tableLayout: "auto",
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: brand.softAlt,
                  }}
                >
                  {columns.map((column, index) => (
                    <TableCell
                      key={column.key}
                      sx={{
                        ...getCellSx({
                          isLast:
                            !canShowActionColumn &&
                            index === columns.length - 1,
                        }),
                        fontWeight: 800,
                        color: brand.text,
                        minWidth: column.width || "180px",
                        whiteSpace: "nowrap",
                        backgroundColor: brand.softAlt,
                        position: "sticky",
                        top: 0,
                        zIndex: 3,
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}

                  {canShowActionColumn ? (
                    <TableCell
                      align="center"
                      sx={{
                        ...getCellSx({ isLast: true, align: "center" }),
                        fontWeight: 800,
                        color: brand.text,
                        minWidth: "150px",
                        whiteSpace: "nowrap",
                        backgroundColor: brand.softAlt,
                        position: "sticky",
                        top: 0,
                        zIndex: 3,
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
                      colSpan={columns.length + (canShowActionColumn ? 1 : 0)}
                      align="center"
                      sx={getCellSx({ isLast: true, align: "center" })}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <CircularProgress size={18} />
                        <Typography sx={{ color: brand.textSoft }}>
                          Loading records...
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (canShowActionColumn ? 1 : 0)}
                      align="center"
                      sx={getCellSx({ isLast: true, align: "center" })}
                    >
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow
                      key={row.id || row._id}
                      hover
                      sx={{
                        backgroundColor: "#FFFFFF",
                        "&:hover": {
                          backgroundColor: "#FAFBFC",
                        },
                      }}
                    >
                      {columns.map((column, index) => {
                        const value = row[column.key] ?? "-";
                        const isStatus = column.type === "status";

                        return (
                          <TableCell
                            key={column.key}
                            sx={{
                              ...getCellSx({
                                isLast:
                                  !canShowActionColumn &&
                                  index === columns.length - 1,
                              }),
                              color: isStatus ? brand.text : brand.textSoft,
                              fontWeight: index === 0 ? 700 : 500,
                              wordBreak: "break-word",
                              whiteSpace:
                                column.type === "file"
                                  ? "normal"
                                  : column.nowrap
                                    ? "nowrap"
                                    : "normal",
                              minWidth: column.width || "180px",
                            }}
                          >
                            {renderCellContent(column, value)}
                          </TableCell>
                        );
                      })}

                      {canShowActionColumn ? (
                        <TableCell
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            {canUpdate ? (
                              <IconButton
                                sx={actionIconButtonSx}
                                onClick={() => handleEdit(row)}
                                disabled={!onEdit}
                              >
                                <EditRoundedIcon
                                  sx={{ fontSize: 18, color: brand.text }}
                                />
                              </IconButton>
                            ) : null}

                            {canDelete ? (
                              <IconButton
                                sx={actionIconButtonSx}
                                onClick={() => handleDelete(row)}
                                disabled={!onDelete}
                              >
                                <DeleteOutlineRoundedIcon
                                  sx={{ fontSize: 18, color: brand.danger }}
                                />
                              </IconButton>
                            ) : null}
                          </Stack>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default MachineMaintenanceListView;
