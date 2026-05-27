import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import AudioFileRoundedIcon from "@mui/icons-material/AudioFileRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { buildServerUrl } from "../../../api/config.js";
import {
  actionIconButtonSx,
  brand,
  filledActionButtonSx,
  outlinedActionButtonSx,
  searchFieldSx,
} from "../../machine-maintenance/components/machineMaintenanceUi.jsx";
import { useAuth } from "../../../store/AuthContext.jsx";
import { hasActionPermission } from "../../../utils/permissions.js";
import {
  deleteUploadCenterFile,
  getUploadCenterFiles,
  updateUploadCenterFile,
  uploadFilesToUploadCenter,
} from "./inventoryUploadCenterApi.js";
import { logInventoryActivity } from "./inventoryActivityLogger.js";
import { inventorySidebarItems } from "../../../components/sidebars/inventorySidebarItems.jsx";

const pageCardSx = {
  p: 3,
  borderRadius: 4,
  border: `1px solid ${brand.border}`,
  boxShadow: brand.shadow,
};

const hideScrollbarSx = {
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
};

const blurActiveElement = () => {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
};

const formatFileSize = (value = 0) => {
  const size = Number(value || 0);
  if (size >= 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${size} B`;
};

const getFileIcon = (file) => {
  switch (file.fileKind) {
    case "image":
      return <ImageRoundedIcon sx={{ fontSize: 34, color: brand.primary }} />;
    case "pdf":
      return (
        <PictureAsPdfRoundedIcon sx={{ fontSize: 34, color: "#C2410C" }} />
      );
    case "video":
      return <MovieRoundedIcon sx={{ fontSize: 34, color: brand.primary }} />;
    case "audio":
      return (
        <AudioFileRoundedIcon sx={{ fontSize: 34, color: brand.primary }} />
      );
    default:
      return (
        <InsertDriveFileRoundedIcon
          sx={{ fontSize: 34, color: brand.primary }}
        />
      );
  }
};

const InventoryUploadCenterPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // { file, id }
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [moduleError, setModuleError] = useState("");
  const [editingFile, setEditingFile] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const fileInputRef = useRef(null);

  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");

  // Generate module options from inventory sidebar only
  const moduleOptions = useMemo(() => {
    const excludeLabels = ["Dashboard", "Upload Center", "Download Center"];
    return inventorySidebarItems
      .filter((item) => !excludeLabels.includes(item.label))
      .map((item) => ({
        value: item.label,
        label: item.label,
      }));
  }, []);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setSearch(String(rawSearch || "").trim()), 220);
    return () => clearTimeout(id);
  }, [rawSearch]);

  const fileMatchesQuery = (file, q) => {
    if (!q) return true;
    const raw = String(q).trim();
    if (!raw) return true;

    // Size query
    const sizeMatch = raw.match(
      /^\s*([<>]=?)?\s*([\d,.]+)\s*(b|kb|mb|gb)?\s*$/i,
    );
    if (sizeMatch) {
      const op = (sizeMatch[1] || "").trim();
      const num = Number(String(sizeMatch[2] || "").replace(/,/g, ""));
      if (!Number.isFinite(num)) return false;
      const unit = (sizeMatch[3] || "b").toLowerCase();
      const mul =
        unit === "kb"
          ? 1024
          : unit === "mb"
            ? 1024 * 1024
            : unit === "gb"
              ? 1024 * 1024 * 1024
              : 1;
      const threshold = Math.round(num * mul);
      const fileSize = Number(file.sizeBytes || file.size || 0);
      if (op === ">") return fileSize > threshold;
      if (op === ">=") return fileSize >= threshold;
      if (op === "<") return fileSize < threshold;
      if (op === "<=") return fileSize <= threshold;
      return fileSize >= threshold;
    }

    const lowerQ = raw.toLowerCase();
    // Date query
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) {
      const qDate = new Date(parsed);
      const qYMD = `${qDate.getFullYear()}-${String(qDate.getMonth() + 1).padStart(2, "0")}-${String(qDate.getDate()).padStart(2, "0")}`;
      const created =
        file.createdAt || file.uploadedAt || file.created_at || file.date || "";
      if (created) {
        const createdTs = Date.parse(created);
        if (!Number.isNaN(createdTs)) {
          const c = new Date(createdTs);
          const cYMD = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}-${String(c.getDate()).padStart(2, "0")}`;
          if (cYMD === qYMD) return true;
        }
        if (String(created).toLowerCase().includes(lowerQ)) return true;
      }
    }

    // Extension query
    const ext = lowerQ.replace(/^\./, "");
    if (/^[a-z0-9]{1,6}$/.test(ext)) {
      const name = String(file.originalName || "").toLowerCase();
      const url = String(file.url || "").toLowerCase();
      const kind = String(file.fileKind || "").toLowerCase();
      if (name.endsWith(`.${ext}`)) return true;
      if (url.endsWith(`.${ext}`) || url.includes(`.${ext}?`)) return true;
      if (kind === ext) return true;
      if (name.includes(`.${ext}`)) return true;
    }

    // Generic deep search
    const seen = new Set();
    const walk = (val) => {
      if (val === null || val === undefined) return false;
      if (
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean"
      ) {
        return String(val).toLowerCase().includes(lowerQ);
      }
      if (Array.isArray(val)) {
        for (const item of val) if (walk(item)) return true;
        return false;
      }
      if (typeof val === "object") {
        if (seen.has(val)) return false;
        seen.add(val);
        for (const k of Object.keys(val)) if (walk(val[k])) return true;
      }
      return false;
    };
    return walk(file);
  };

  const displayedFiles = useMemo(() => {
    const q = String(search || "").trim();
    if (!q) return files;
    return files.filter((f) => fileMatchesQuery(f, q));
  }, [files, search]);

  const liveCount = useMemo(() => {
    const q = String(rawSearch || "").trim();
    if (!q) return null;
    return files.filter((f) => fileMatchesQuery(f, q)).length;
  }, [files, rawSearch]);

  const totalFiles = useMemo(() => files.length, [files]);
  const canUpload = hasActionPermission(user, location.pathname, "create");
  const canEdit = hasActionPermission(user, location.pathname, "update");
  const canDelete = hasActionPermission(user, location.pathname, "delete");

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await getUploadCenterFiles();
      setFiles(rows);
      setFeedback((prev) =>
        prev.type === "error" ? { type: "", message: "" } : prev,
      );
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to load uploaded files",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (!feedback.message) return;
    const timer = setTimeout(
      () => setFeedback({ type: "", message: "" }),
      5000,
    );
    return () => clearTimeout(timer);
  }, [feedback]);

  // File queue helpers
  const addFiles = (newFiles) => {
    setSelectedFiles((prev) => {
      const existingKeys = new Set(
        prev.map((item) => `${item.file.name}|${item.file.size}`),
      );
      const uniqueNew = newFiles.filter(
        (file) => !existingKeys.has(`${file.name}|${file.size}`),
      );
      return [
        ...prev,
        ...uniqueNew.map((file) => ({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
        })),
      ];
    });
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const handleFileChange = (event) => {
    const incoming = Array.from(event.target.files || []);
    if (incoming.length) addFiles(incoming);
    event.target.value = "";
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) {
      setDescriptionError("Please add at least one file.");
      return;
    }
    if (!selectedModule) {
      setModuleError("Please select a module/category.");
      return;
    }
    try {
      setUploading(true);
      setDescriptionError("");
      setModuleError("");
      const actualFiles = selectedFiles.map((item) => item.file);
      const response = await uploadFilesToUploadCenter({
        files: actualFiles,
        description,
        module: selectedModule,
      });
      if (Array.isArray(response?.data) && response.data.length) {
        setFiles((prev) => [...response.data, ...prev]);
      } else {
        await loadFiles();
      }
      resetUploadDialog();
      setFeedback({
        type: "success",
        message: `${actualFiles.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to upload files",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUploadDialog = () => {
    blurActiveElement();
    setUploadDialogOpen(false);
    setSelectedFiles([]);
    setDescription("");
    setDescriptionError("");
    setSelectedModule("");
    setModuleError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (file) => {
    try {
      await deleteUploadCenterFile(file.id);
      setFiles((prev) => prev.filter((item) => item.id !== file.id));
      setFeedback({ type: "success", message: "File deleted successfully." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to delete file",
      });
    }
  };

  const handleOpenEditDialog = (file) => {
    blurActiveElement();
    setEditingFile(file);
    setEditingDescription(file.description || "");
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (savingEdit) return;
    blurActiveElement();
    setEditingFile(null);
    setEditingDescription("");
    setEditDialogOpen(false);
  };

  const handleSaveDescription = async () => {
    if (!editingFile?.id) return;
    try {
      setSavingEdit(true);
      const updatedFile = await updateUploadCenterFile(editingFile.id, {
        description: editingDescription,
      });
      if (updatedFile) {
        setFiles((prev) =>
          prev.map((f) => (f.id === editingFile.id ? updatedFile : f)),
        );
      }
      handleCloseEditDialog();
      setFeedback({ type: "success", message: "File description updated." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to update description",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenFile = (file, fileUrl) => {
    logInventoryActivity({
      action: "Opened",
      page: "Upload Center",
      resource: "File",
      targetName: file?.originalName || "Uploaded File",
      endpoint: file?.relativePath || fileUrl || location.pathname,
      details: {
        source: "upload-center",
        fileId: file?.id || "",
        fileKind: file?.fileKind || "",
        fileName: file?.originalName || "",
      },
    });
  };

  return (
    <Stack
      spacing={3}
      sx={{ height: "100%", minHeight: 0, overflow: "hidden" }}
    >
      {feedback.message && (
        <Alert
          severity={feedback.type === "success" ? "success" : "error"}
          onClose={() => setFeedback({ type: "", message: "" })}
          sx={{ borderRadius: 2.5, flexShrink: 0 }}
        >
          {feedback.message}
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFileChange}
      />

      <Paper elevation={0} sx={pageCardSx}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: brand.text }}
            >
              Upload Center
            </Typography>
            <Typography sx={{ color: brand.textSoft, mt: 0.5 }}>
              Total files stored: {totalFiles}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems="center"
          >
            <TextField
              size="small"
              placeholder="Search files"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 220 },
                flexShrink: 0,
                ...searchFieldSx,
              }}
              InputProps={{
                startAdornment: rawSearch.trim() ? (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <Typography
                      sx={{
                        color: brand.primaryDark,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        fontSize: "0.95rem",
                      }}
                    >
                      {liveCount ?? 0} Results
                    </Typography>
                  </InputAdornment>
                ) : null,
                endAdornment: (
                  <InputAdornment position="end">
                    {rawSearch ? (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setRawSearch("");
                          setSearch("");
                        }}
                      >
                        <CloseRoundedIcon sx={{ color: brand.textSoft }} />
                      </IconButton>
                    ) : (
                      <SearchRoundedIcon sx={{ color: brand.textSoft }} />
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => {
                setRawSearch("");
                setSearch("");
                loadFiles();
              }}
              disabled={loading || uploading}
              sx={outlinedActionButtonSx}
            >
              Refresh
            </Button>
            {canUpload && (
              <Button
                variant="contained"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => setUploadDialogOpen(true)}
                disabled={uploading}
                sx={filledActionButtonSx}
              >
                {uploading ? "Uploading..." : "Upload Files"}
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Scrollable card grid */}
      <Box
        sx={{
          flex: "1 1 0%",
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          pr: { xs: 0, sm: 0.5 },
          ...hideScrollbarSx,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "stretch",
            alignContent: "flex-start",
          }}
        >
          {displayedFiles.map((file) => {
            const fileUrl = buildServerUrl(file.relativePath || file.url || "");
            const isImage = file.fileKind === "image";
            const isAvailable = file.isAvailable !== false;
            return (
              <Paper
                key={file.id}
                elevation={0}
                sx={{
                  ...pageCardSx,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                  width: { xs: "100%", sm: 240 },
                  minHeight: 236,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      backgroundColor: brand.soft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {isImage && isAvailable ? (
                      <Box
                        component="img"
                        src={fileUrl}
                        alt={file.originalName}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    {canEdit && (
                      <IconButton
                        onClick={() => handleOpenEditDialog(file)}
                        sx={actionIconButtonSx}
                      >
                        <EditRoundedIcon
                          sx={{ fontSize: 18, color: brand.primaryDark }}
                        />
                      </IconButton>
                    )}
                    <IconButton
                      component={isAvailable ? "a" : "button"}
                      href={isAvailable ? fileUrl : undefined}
                      target={isAvailable ? "_blank" : undefined}
                      rel={isAvailable ? "noopener noreferrer" : undefined}
                      onClick={() => {
                        if (isAvailable) handleOpenFile(file, fileUrl);
                        else
                          setFeedback({
                            type: "error",
                            message: "File unavailable on server.",
                          });
                      }}
                      sx={actionIconButtonSx}
                    >
                      <OpenInNewRoundedIcon
                        sx={{ fontSize: 18, color: brand.primaryDark }}
                      />
                    </IconButton>
                    {canDelete && (
                      <IconButton
                        onClick={() => handleDelete(file)}
                        sx={actionIconButtonSx}
                      >
                        <DeleteOutlineRoundedIcon
                          sx={{ fontSize: 18, color: brand.danger }}
                        />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
                <Box sx={{ mt: 2, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: brand.text,
                      lineHeight: 1.35,
                      wordBreak: "break-word",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {file.originalName}
                  </Typography>
                  {file.description && (
                    <Typography
                      sx={{
                        mt: 1,
                        color: brand.textSoft,
                        fontSize: "0.92rem",
                        lineHeight: 1.45,
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {file.description}
                    </Typography>
                  )}
                  {file.module && (
                    <Typography
                      sx={{
                        mt: 0.5,
                        color: brand.primary,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      Module: {file.module}
                    </Typography>
                  )}
                  {!isAvailable && (
                    <Typography
                      sx={{ mt: 1, color: brand.danger, fontSize: "0.88rem" }}
                    >
                      File unavailable on server
                    </Typography>
                  )}
                </Box>
                <Stack spacing={0.65} sx={{ mt: "auto", pt: 2 }}>
                  <Typography
                    sx={{ color: brand.textSoft, fontSize: "0.9rem" }}
                  >
                    Size: {formatFileSize(file.sizeBytes)}
                  </Typography>
                  <Typography
                    sx={{ color: brand.textSoft, fontSize: "0.9rem" }}
                  >
                    Uploaded by: {file.createdBy || "System"}
                  </Typography>
                  <Typography
                    sx={{ color: brand.textSoft, fontSize: "0.9rem" }}
                  >
                    Uploaded at: {file.createdAt || "-"}
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
        </Box>
        {!loading && files.length === 0 && (
          <Paper elevation={0} sx={{ ...pageCardSx, mt: 0 }}>
            <Typography sx={{ color: brand.textSoft }}>
              No uploaded files found.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={resetUploadDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800, color: brand.text }}>
          Upload Files
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadRoundedIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={outlinedActionButtonSx}
            >
              Add Files
            </Button>
            {selectedFiles.length > 0 && (
              <Box
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${brand.border}`,
                  backgroundColor: brand.softAlt,
                  p: 1.5,
                  maxHeight: 240,
                  overflow: "auto",
                }}
              >
                <Stack spacing={1}>
                  {selectedFiles.map(({ file, id }) => (
                    <Stack
                      key={id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: brand.white,
                        border: `1px solid ${brand.border}`,
                      }}
                    >
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            wordBreak: "break-word",
                          }}
                        >
                          {file.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: brand.textSoft }}
                        >
                          {(file.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeFile(id)}
                        disabled={uploading}
                      >
                        <CloseRoundedIcon
                          sx={{ fontSize: 18, color: brand.danger }}
                        />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
                <Button
                  size="small"
                  onClick={clearAllFiles}
                  disabled={uploading}
                  sx={{ mt: 1, color: brand.danger }}
                >
                  Remove all
                </Button>
              </Box>
            )}
            <TextField
              select
              label="Upload For / Select Module"
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setModuleError("");
              }}
              fullWidth
              required
              error={Boolean(moduleError)}
              helperText={
                moduleError || "Choose which module this file belongs to"
              }
            >
              <MenuItem value="" disabled>
                Select Upload Category
              </MenuItem>
              {moduleOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionError("");
              }}
              placeholder="Write a short description for these file(s)"
              multiline
              minRows={3}
              fullWidth
              error={Boolean(descriptionError)}
              helperText={
                descriptionError ||
                "This description will be shown on the file card."
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={resetUploadDialog}
            variant="outlined"
            disabled={uploading}
            sx={outlinedActionButtonSx}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            disabled={uploading}
            sx={filledActionButtonSx}
          >
            {uploading
              ? "Uploading..."
              : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 800, color: brand.text }}>
          Edit File Description
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Stack spacing={2}>
            <Typography sx={{ color: brand.textSoft, fontSize: "0.92rem" }}>
              {editingFile?.originalName || ""}
            </Typography>
            <TextField
              label="Description"
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              multiline
              minRows={4}
              fullWidth
              placeholder="Write a short description"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseEditDialog}
            variant="outlined"
            disabled={savingEdit}
            sx={outlinedActionButtonSx}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDescription}
            variant="contained"
            disabled={savingEdit}
            sx={filledActionButtonSx}
          >
            {savingEdit ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default InventoryUploadCenterPage;
