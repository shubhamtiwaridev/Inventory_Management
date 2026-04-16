import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
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

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

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
};

const tabs = [
  { label: "STAFF", icon: <BadgeRoundedIcon />, path: "/staff" },
  { label: "STAFF LIST", icon: <FactCheckOutlinedIcon />, path: "/staff-list" },
  {
    label: "STAFF TYPE",
    icon: <VerifiedUserOutlinedIcon />,
    path: "/staff-type",
  },
];

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

const pad = (value) => String(value).padStart(2, "0");

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const amPm = hours >= 12 ? "PM" : "AM";

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${hours12}:${pad(date.getMinutes())} ${amPm}`;
};

const StaffList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/staff-page`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch staff");
      }

      const users = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setStaffList(users);
    } catch (err) {
      setError(err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return staffList;

    return staffList.filter((row) => {
      const name = String(row.name || "").toLowerCase();
      const email = String(row.email || "").toLowerCase();
      const roles = String(row.roles || "").toLowerCase();
      const createdAt = formatDateTime(row.createdAt).toLowerCase();
      const updatedAt = formatDateTime(row.updatedAt).toLowerCase();
      const status = (
        row.isVerified === false ? "pending" : "active"
      ).toLowerCase();

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        roles.includes(keyword) ||
        createdAt.includes(keyword) ||
        updatedAt.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [search, staffList]);

  const handleRefresh = () => {
    setSearch("");
    fetchStaff();
  };

  const handleDownload = () => {
    const header = [
      "Name",
      "Email",
      "Role",
      "Create Time",
      "Update Time",
      "Status",
    ];

    const csvRows = filteredRows.map((row) => [
      row.name || "",
      row.email || "",
      row.roles || "",
      formatDateTime(row.createdAt),
      formatDateTime(row.updatedAt),
      row.isVerified === false ? "Pending" : "Active",
    ]);

    const csv = [header, ...csvRows]
      .map((line) =>
        line.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "staff-list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: brand.pageBg,
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
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
            {tabs.map((tab) => {
              const active = location.pathname === tab.path;

              return (
                <Button
                  key={tab.label}
                  onClick={() => navigate(tab.path)}
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
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Search name, email, role..."
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

            {error && (
              <Typography sx={{ color: "#C2410C", mb: 2, fontWeight: 600 }}>
                {error}
              </Typography>
            )}

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
                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "19%",
                      }}
                    >
                      Name
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "24%",
                      }}
                    >
                      Email
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "14%",
                      }}
                    >
                      Role
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "16%",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Create Time
                    </TableCell>

                    <TableCell
                      sx={{
                        ...getCellSx(),
                        fontWeight: 800,
                        color: brand.text,
                        width: "16%",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Update Time
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        ...getCellSx({ isLast: true, align: "center" }),
                        fontWeight: 800,
                        color: brand.text,
                        width: "11%",
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={getCellSx({ isLast: true, align: "center" })}
                      >
                        Loading staff...
                      </TableCell>
                    </TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={getCellSx({ isLast: true, align: "center" })}
                      >
                        No staff found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row) => (
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
                        <TableCell
                          sx={{
                            ...getCellSx(),
                            color: brand.text,
                            fontWeight: 600,
                          }}
                        >
                          {row.name || "-"}
                        </TableCell>

                        <TableCell
                          sx={{
                            ...getCellSx(),
                            color: brand.textSoft,
                            wordBreak: "break-word",
                          }}
                        >
                          {row.email || "-"}
                        </TableCell>

                        <TableCell sx={getCellSx()}>
                          <Chip
                            label={row.roles || "-"}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              backgroundColor: brand.soft,
                              color: brand.primaryDark,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            ...getCellSx(),
                            color: brand.textSoft,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDateTime(row.createdAt)}
                        </TableCell>

                        <TableCell
                          sx={{
                            ...getCellSx(),
                            color: brand.textSoft,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDateTime(row.updatedAt)}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          <Chip
                            label={
                              row.isVerified === false ? "Pending" : "Active"
                            }
                            size="small"
                            sx={{
                              borderRadius: 2,
                              fontWeight: 700,
                              backgroundColor:
                                row.isVerified === false
                                  ? "#FFF8ED"
                                  : brand.soft,
                              color:
                                row.isVerified === false
                                  ? "#D97706"
                                  : brand.primaryDark,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default StaffList;
