import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
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
import { useAuth } from "../../store/AuthContext.jsx";
import SideBar from "../SideBar.jsx";
// import {
//   actionButtonSx,
//   brand,
//   formatDateTime,
//   getCellSx,
//   getInitials,
//   goodsTabs,
//   request,
//   softCardSx,
//   tabButtonSx,
//   textFieldStyles,
// } from "./common/goodsShared";

const initialFormState = {
  goodsCode: "",
  goodsDesc: "",
  supplierName: "",
  goodsWeight: 0,
  goodsW: 0,
  goodsD: 0,
  goodsH: 0,
  goodsUnit: "",
  goodsClass: "",
  goodsBrand: "",
  goodsColor: "",
  goodsShape: "",
  goodsSpecs: "",
  goodsOrigin: "",
  safetyStock: 0,
  goodsCost: 0,
  goodsPrice: 0,
  barCode: "",
  createdBy: "",
};

const GoodsList = () => {
  const { user, logout, canViewTeam } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [metadata, setMetadata] = useState({
    units: [],
    classes: [],
    brands: [],
    colors: [],
    shapes: [],
    specs: [],
    origins: [],
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState(initialFormState);

  const initials = useMemo(() => getInitials(user?.name), [user?.name]);

  const loadGoods = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await request(
        `/goods/goodslist?search=${encodeURIComponent(search.trim())}`,
      );
      setRows(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load goods list");
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const response = await request("/goods/goodslist/metadata");
      setMetadata({
        units: response?.units || [],
        classes: response?.classes || [],
        brands: response?.brands || [],
        colors: response?.colors || [],
        shapes: response?.shapes || [],
        specs: response?.specs || [],
        origins: response?.origins || [],
      });
    } catch (error) {
      setErrorMessage(error.message || "Failed to load goods metadata");
    }
  };

  useEffect(() => {
    loadGoods();
  }, [search]);

  useEffect(() => {
    loadMetadata();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((row) =>
      [
        row.goodsCode,
        row.goodsDesc,
        row.supplierName,
        row.goodsUnit,
        row.goodsClass,
        row.goodsBrand,
        row.goodsColor,
        row.goodsShape,
        row.goodsSpecs,
        row.goodsOrigin,
        row.createdBy,
        row.barCode,
        formatDateTime(row.createdAt),
        formatDateTime(row.updatedAt),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [rows, search]);

  const resetForm = () => {
    setFormData({ ...initialFormState, createdBy: user?.name || "" });
    setEditingId("");
    setShowForm(false);
    setFormError("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenCreate = () => {
    setFormData({ ...initialFormState, createdBy: user?.name || "" });
    setEditingId("");
    setFormError("");
    setShowForm(true);
  };

  const handleEdit = (row) => {
    setFormData({
      goodsCode: row.goodsCode || "",
      goodsDesc: row.goodsDesc || "",
      supplierName: row.supplierName || "",
      goodsWeight: row.goodsWeight || 0,
      goodsW: row.goodsW || 0,
      goodsD: row.goodsD || 0,
      goodsH: row.goodsH || 0,
      goodsUnit: row.goodsUnit || "",
      goodsClass: row.goodsClass || "",
      goodsBrand: row.goodsBrand || "",
      goodsColor: row.goodsColor || "",
      goodsShape: row.goodsShape || "",
      goodsSpecs: row.goodsSpecs || "",
      goodsOrigin: row.goodsOrigin || "",
      safetyStock: row.safetyStock || 0,
      goodsCost: row.goodsCost || 0,
      goodsPrice: row.goodsPrice || 0,
      barCode: row.barCode || row.goodsCode || "",
      createdBy: row.createdBy || user?.name || "",
    });
    setEditingId(row._id);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!formData.goodsCode.trim()) return setFormError("Goods code is required");
    if (!formData.goodsDesc.trim()) {
      return setFormError("Goods description is required");
    }
    if (!formData.goodsUnit) return setFormError("Goods unit is required");
    if (!formData.goodsClass) return setFormError("Goods class is required");
    if (!formData.goodsBrand) return setFormError("Goods brand is required");
    if (!formData.goodsColor) return setFormError("Goods color is required");
    if (!formData.goodsShape) return setFormError("Goods shape is required");
    if (!formData.goodsSpecs) return setFormError("Goods specs is required");
    if (!formData.goodsOrigin) return setFormError("Goods origin is required");

    try {
      setSaving(true);

      const payload = {
        ...formData,
        goodsWeight: Number(formData.goodsWeight || 0),
        goodsW: Number(formData.goodsW || 0),
        goodsD: Number(formData.goodsD || 0),
        goodsH: Number(formData.goodsH || 0),
        safetyStock: Number(formData.safetyStock || 0),
        goodsCost: Number(formData.goodsCost || 0),
        goodsPrice: Number(formData.goodsPrice || 0),
        createdBy: String(formData.createdBy || user?.name || "").trim(),
      };

      if (editingId) {
        const response = await request(`/goods/goodslist/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        const updatedRow = response?.data;
        setRows((prev) =>
          prev.map((item) => (item._id === editingId ? updatedRow : item)),
        );
      } else {
        const response = await request("/goods/goodslist", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const newRow = response?.data;
        setRows((prev) => [newRow, ...prev]);
      }

      resetForm();
    } catch (error) {
      setFormError(error.message || "Failed to save goods item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${row.goodsCode}"?`,
    );
    if (!confirmed) return;

    try {
      await request(`/goods/goodslist/${row._id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((item) => item._id !== row._id));
    } catch (error) {
      setErrorMessage(error.message || "Failed to delete goods item");
    }
  };

  const handleDownload = () => {
    const header = [
      "Goods Code",
      "Description",
      "Supplier",
      "Unit",
      "Class",
      "Brand",
      "Color",
      "Shape",
      "Specs",
      "Origin",
      "Weight",
      "W",
      "D",
      "H",
      "Unit Volume",
      "Safety Stock",
      "Cost",
      "Price",
      "Barcode",
      "Created By",
      "Created Time",
      "Updated Time",
    ];

    const csvRows = filteredRows.map((row) => [
      row.goodsCode || "",
      row.goodsDesc || "",
      row.supplierName || "",
      row.goodsUnit || "",
      row.goodsClass || "",
      row.goodsBrand || "",
      row.goodsColor || "",
      row.goodsShape || "",
      row.goodsSpecs || "",
      row.goodsOrigin || "",
      row.goodsWeight || 0,
      row.goodsW || 0,
      row.goodsD || 0,
      row.goodsH || 0,
      row.unitVolume || 0,
      row.safetyStock || 0,
      row.goodsCost || 0,
      row.goodsPrice || 0,
      row.barCode || "",
      row.createdBy || "",
      formatDateTime(row.createdAt),
      formatDateTime(row.updatedAt),
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
    link.setAttribute("download", "goods-list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const selectOptions = (items) => items.map((item) => item.name);

  return (
    <Box sx={{ minHeight: "100vh", background: brand.pageBg }}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <SideBar
          user={user}
          initials={initials}
          canViewTeam={canViewTeam}
          location={location}
          navigate={navigate}
          handleLogout={handleLogout}
        />

        <Box
          sx={{
            flex: 1,
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
              sx={{ minWidth: "max-content", alignItems: "flex-end" }}
            >
              {goodsTabs.map((tab) => {
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
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleOpenCreate}
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
                    onClick={loadGoods}
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
                  placeholder="Search code, description, brand..."
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

              <Dialog
                open={showForm}
                onClose={resetForm}
                fullWidth
                maxWidth="md"
                disableRestoreFocus
                PaperProps={{
                  sx: {
                    borderRadius: 4,
                    border: `1px solid ${brand.border}`,
                    boxShadow: brand.shadowStrong,
                    overflow: "hidden",
                  },
                }}
              >
                <DialogTitle
                  sx={{ fontWeight: 800, color: brand.text, pb: 1 }}
                >
                  {editingId ? "Update Goods Item" : "Add New Goods Item"}
                </DialogTitle>

                <Box component="form" onSubmit={handleSubmit}>
                  <DialogContent sx={{ pt: 1 }}>
                    <Stack spacing={2}>
                      {formError ? (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                          {formError}
                        </Alert>
                      ) : null}

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Goods Code"
                          value={formData.goodsCode}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsCode: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Description"
                          value={formData.goodsDesc}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsDesc: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Supplier"
                          value={formData.supplierName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              supplierName: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Barcode"
                          value={formData.barCode}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              barCode: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Weight"
                          type="number"
                          value={formData.goodsWeight}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsWeight: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Safety Stock"
                          type="number"
                          value={formData.safetyStock}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              safetyStock: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Width (W)"
                          type="number"
                          value={formData.goodsW}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsW: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Depth (D)"
                          type="number"
                          value={formData.goodsD}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsD: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Height (H)"
                          type="number"
                          value={formData.goodsH}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsH: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Created By"
                          value={formData.createdBy}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              createdBy: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Cost"
                          type="number"
                          value={formData.goodsCost}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsCost: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          label="Price"
                          type="number"
                          value={formData.goodsPrice}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsPrice: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        />
                        <TextField
                          select
                          label="Unit"
                          value={formData.goodsUnit}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsUnit: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        >
                          <MenuItem value="">Select unit</MenuItem>
                          {selectOptions(metadata.units).map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          label="Class"
                          value={formData.goodsClass}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsClass: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        >
                          <MenuItem value="">Select class</MenuItem>
                          {selectOptions(metadata.classes).map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          label="Brand"
                          value={formData.goodsBrand}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsBrand: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        >
                          <MenuItem value="">Select brand</MenuItem>
                          {selectOptions(metadata.brands).map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          label="Color"
                          value={formData.goodsColor}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsColor: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        >
                          <MenuItem value="">Select color</MenuItem>
                          {selectOptions(metadata.colors).map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          label="Shape"
                          value={formData.goodsShape}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsShape: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        >
                          <MenuItem value="">Select shape</MenuItem>
                          {selectOptions(metadata.shapes).map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          label="Specs"
                          value={formData.goodsSpecs}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsSpecs: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        >
                          <MenuItem value="">Select specs</MenuItem>
                          {selectOptions(metadata.specs).map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          label="Origin"
                          value={formData.goodsOrigin}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              goodsOrigin: e.target.value,
                            }))
                          }
                          sx={textFieldStyles}
                          fullWidth
                        >
                          <MenuItem value="">Select origin</MenuItem>
                          {selectOptions(metadata.origins).map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Stack>
                  </DialogContent>

                  <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={resetForm}
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
                      disabled={saving}
                      sx={{
                        minWidth: 140,
                        borderRadius: 3,
                        px: 3,
                        py: 1.2,
                        textTransform: "none",
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.primaryDark} 100%)`,
                        boxShadow: "0 12px 24px rgba(16, 108, 107, 0.20)",
                        "&:hover": {
                          background: `linear-gradient(135deg, ${brand.primaryDark} 0%, ${brand.primaryDark} 100%)`,
                        },
                      }}
                    >
                      {saving ? "Saving..." : editingId ? "Update" : "Create"}
                    </Button>
                  </DialogActions>
                </Box>
              </Dialog>

              {errorMessage ? (
                <Typography sx={{ color: brand.danger, mb: 2, fontWeight: 600 }}>
                  {errorMessage}
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
                    minWidth: 1700,
                    backgroundColor: "#FFFFFF",
                    tableLayout: "fixed",
                    borderCollapse: "collapse",
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: brand.softAlt }}>
                      {[
                        ["Goods Code", "10%"],
                        ["Description", "14%"],
                        ["Supplier", "10%"],
                        ["Weight", "7%"],
                        ["W", "6%"],
                        ["D", "6%"],
                        ["H", "6%"],
                        ["Volume", "7%"],
                        ["Unit", "8%"],
                        ["Class", "8%"],
                        ["Brand", "8%"],
                        ["Color", "8%"],
                        ["Shape", "8%"],
                        ["Specs", "8%"],
                        ["Origin", "8%"],
                        ["Cost", "7%"],
                        ["Price", "7%"],
                        ["Action", "8%"],
                      ].map(([label, width], index, arr) => (
                        <TableCell
                          key={label}
                          align={label === "Action" ? "center" : "center"}
                          sx={{
                            ...getCellSx({
                              isLast: index === arr.length - 1,
                              align: "center",
                            }),
                            fontWeight: 800,
                            color: brand.text,
                            width,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={18}
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          Loading goods...
                        </TableCell>
                      </TableRow>
                    ) : filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={18}
                          align="center"
                          sx={getCellSx({ isLast: true, align: "center" })}
                        >
                          No goods found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRows.map((row) => (
                        <TableRow
                          key={row._id}
                          hover
                          sx={{
                            backgroundColor: "#FFFFFF",
                            "&:hover": { backgroundColor: "#FAFBFC" },
                          }}
                        >
                          <TableCell
                            sx={{
                              ...getCellSx(),
                              color: brand.text,
                              fontWeight: 700,
                            }}
                          >
                            {row.goodsCode || "-"}
                          </TableCell>
                          <TableCell sx={{ ...getCellSx(), color: brand.text }}>
                            {row.goodsDesc || "-"}
                          </TableCell>
                          <TableCell
                            sx={{ ...getCellSx(), color: brand.textSoft }}
                          >
                            {row.supplierName || "-"}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsWeight ?? 0}
                          </TableCell>
                          <TableCell sx={getCellSx()}>{row.goodsW ?? 0}</TableCell>
                          <TableCell sx={getCellSx()}>{row.goodsD ?? 0}</TableCell>
                          <TableCell sx={getCellSx()}>{row.goodsH ?? 0}</TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.unitVolume ?? 0}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsUnit || "-"}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsClass || "-"}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsBrand || "-"}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsColor || "-"}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsShape || "-"}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsSpecs || "-"}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsOrigin || "-"}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsCost ?? 0}
                          </TableCell>
                          <TableCell sx={getCellSx()}>
                            {row.goodsPrice ?? 0}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={getCellSx({ isLast: true, align: "center" })}
                          >
                            <Stack
                              direction="row"
                              justifyContent="center"
                              spacing={1}
                            >
                              <IconButton
                                onClick={() => handleEdit(row)}
                                sx={actionButtonSx}
                              >
                                <EditRoundedIcon
                                  sx={{
                                    fontSize: 18,
                                    color: brand.primaryDark,
                                  }}
                                />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDelete(row)}
                                sx={{
                                  ...actionButtonSx,
                                  "&:hover": {
                                    backgroundColor: brand.dangerSoft,
                                  },
                                }}
                              >
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
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default GoodsList;