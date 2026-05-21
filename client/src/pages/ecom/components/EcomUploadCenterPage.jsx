import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  IconButton,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
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
} from "./ecomUploadCenterApi.js";
import { logEcomActivity } from "./ecomActivityLogger.js";

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

  if (size >= 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  if (size >= 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }

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

const EcomUploadCenterPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [editingFile, setEditingFile] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const fileInputRef = useRef(null);

  const totalFiles = useMemo(() => files.length, [files]);

  // rawSearch: instant input value; search: debounced value used for filtering
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");

  // debounce the input so filtering is not too aggressive on large lists
  useEffect(() => {
    const id = window.setTimeout(
      () => setSearch(String(rawSearch || "").trim()),
      220,
    );
    return () => window.clearTimeout(id);
  }, [rawSearch]);

  const fileMatchesQuery = (file, q) => {
    if (!q) return true;
    const raw = String(q).trim();
    if (!raw) return true;

    // size query: e.g. '>10mb', '<= 256kb', '10mb' (treated as >=)
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
      // default when no operator provided: match files >= threshold
      return fileSize >= threshold;
    }

    const lowerQ = raw.toLowerCase();

    // date query: try to parse an explicit date (YYYY-MM-DD, DD/MM/YYYY, etc.)
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) {
      const qDate = new Date(parsed);
      const qY = qDate.getFullYear();
      const qM = String(qDate.getMonth() + 1).padStart(2, "0");
      const qD = String(qDate.getDate()).padStart(2, "0");
      const qYMD = `${qY}-${qM}-${qD}`;

      const created =
        file.createdAt || file.uploadedAt || file.created_at || file.date || "";
      if (created) {
        const createdTs = Date.parse(created);
        if (!Number.isNaN(createdTs)) {
          const c = new Date(createdTs);
          const cYMD = `${c.getFullYear()}-${String(c.getMonth() + 1).padStart(2, "0")}-${String(c.getDate()).padStart(2, "0")}`;
          if (cYMD === qYMD) return true;
        }
        // fallback: if created string contains the query
        if (String(created).toLowerCase().includes(lowerQ)) return true;
      }
      // also check other date-like fields in file
    }

    if (
      String(file.originalName || "")
        .toLowerCase()
        .includes(lowerQ)
    )
      return true;
    if (
      String(file.description || "")
        .toLowerCase()
        .includes(lowerQ)
    )
      return true;
    if (
      String(file.createdBy || "")
        .toLowerCase()
        .includes(lowerQ)
    )
      return true;
    if (
      String(file.sizeBytes || "")
        .toLowerCase()
        .includes(lowerQ)
    )
      return true;
    if (
      String(file.fileKind || "")
        .toLowerCase()
        .includes(lowerQ)
    )
      return true;

    return false;
  };

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const items = await getUploadCenterFiles();
      setFiles(Array.isArray(items) ? items : []);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to load files",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const displayedFiles = useMemo(() => {
    const list = Array.isArray(files) ? files : [];
    const q = String(search || "").trim();

    const filtered = list.filter((f) => fileMatchesQuery(f, q));

    return filtered;
  }, [files, search]);

  const liveCount = useMemo(() => {
    return displayedFiles.length;
  }, [displayedFiles]);

  const handleFileChange = (e) => {
    const nextSelectedFiles = Array.from(e.target.files || []);
    e.target.value = "";

    if (nextSelectedFiles.length === 0) return;

    setSelectedFiles(nextSelectedFiles);
  };

  const handleOpenPicker = () => {
    blurActiveElement();
    setFeedback({ type: "", message: "" });
    setUploadDialogOpen(true);
  };

  const handleOpenFileChooser = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const resetUploadDialog = () => {
    blurActiveElement();
    setUploadDialogOpen(false);
    setSelectedFiles([]);
    setDescription("");
    setDescriptionError("");
  };

  const handleStartUpload = async () => {
    try {
      if (selectedFiles.length === 0) {
        setDescriptionError("Please choose at least one file.");
        return;
      }

      setUploading(true);
      setDescriptionError("");
      setFeedback({ type: "", message: "" });
      const response = await uploadFilesToUploadCenter({
        files: selectedFiles,
        description,
      });

      if (Array.isArray(response?.data) && response.data.length > 0) {
        setFiles((prev) => [...response.data, ...prev]);
      } else {
        await loadFiles();
      }

      resetUploadDialog();
      setFeedback({
        type: "success",
        message: `${response?.summary?.uploadedCount || selectedFiles.length} file(s) uploaded successfully.`,
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

  const handleOpenEditDialog = (file) => {
    blurActiveElement();
    setEditingFile(file);
    setEditingDescription(file.description || "");
    setEditDialogOpen(true);
    setFeedback({ type: "", message: "" });
  };

  const handleCloseEditDialog = () => {
    if (savingEdit) return;
    blurActiveElement();
    setEditingFile(null);
    setEditingDescription("");
    setEditDialogOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;

    try {
      setSavingEdit(true);
      const updatedFile = await updateUploadCenterFile(editingFile.id, {
        description: editingDescription,
      });
      if (updatedFile) {
        setFiles((prev) =>
          prev.map((file) => (file.id === editingFile.id ? updatedFile : file)),
        );
      }
      blurActiveElement();
      setEditingFile(null);
      setEditingDescription("");
      setEditDialogOpen(false);
      setFeedback({
        type: "success",
        message: "File description updated successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to update file description",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (file) => {
    if (!file) return;

    try {
      await deleteUploadCenterFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      setFeedback({ type: "success", message: "File deleted successfully" });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to delete file",
      });
    }
  };

  const handleOpenFile = (file, fileUrl) => {
    logEcomActivity({
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
    <Stack spacing={3} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      {feedback.message ? (
        <Alert
          severity={feedback.type === "success" ? "success" : "error"}
          onClose={() => setFeedback({ type: "", message: "" })}
          sx={{ borderRadius: 2.5, flexShrink: 0 }}
        >
          {feedback.message}
        </Alert>
      ) : null}

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
                startAdornment: String(rawSearch || "").trim() ? (
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

            {hasActionPermission(user, "/ecom/upload-center", "create") ? (
              <Button
                variant="contained"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={handleOpenPicker}
                disabled={uploading}
                sx={filledActionButtonSx}
              >
                {uploading ? "Uploading..." : "Upload Files"}
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          flex: 1,
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
            const fileUrl = buildServerUrl(file.url || "");
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
                    {hasActionPermission(
                      user,
                      "/ecom/upload-center",
                      "update",
                    ) ? (
                      <IconButton
                        onClick={() => handleOpenEditDialog(file)}
                        sx={actionIconButtonSx}
                      >
                        <EditRoundedIcon
                          sx={{ fontSize: 18, color: brand.primaryDark }}
                        />
                      </IconButton>
                    ) : null}
                    <IconButton
                      component={isAvailable ? "a" : "button"}
                      href={isAvailable ? fileUrl : undefined}
                      target={isAvailable ? "_blank" : undefined}
                      rel={isAvailable ? "noopener noreferrer" : undefined}
                      onClick={() => {
                        if (isAvailable) {
                          handleOpenFile(file, fileUrl);
                          return;
                        }
                        setFeedback({
                          type: "error",
                          message:
                            "This file is no longer available on the server. Upload it again after a Render restart or redeploy.",
                        });
                      }}
                      sx={actionIconButtonSx}
                    >
                      <OpenInNewRoundedIcon
                        sx={{ fontSize: 18, color: brand.primaryDark }}
                      />
                    </IconButton>
                    {hasActionPermission(
                      user,
                      "/ecom/upload-center",
                      "delete",
                    ) ? (
                      <IconButton
                        onClick={() => handleDelete(file)}
                        sx={actionIconButtonSx}
                      >
                        <DeleteOutlineRoundedIcon
                          sx={{ fontSize: 18, color: brand.danger }}
                        />
                      </IconButton>
                    ) : null}
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
                  {file.description ? (
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
                  ) : null}
                  {!isAvailable ? (
                    <Typography
                      sx={{
                        mt: 1,
                        color: brand.danger,
                        fontSize: "0.88rem",
                        lineHeight: 1.4,
                      }}
                    >
                      File unavailable on server
                    </Typography>
                  ) : null}
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

        {!loading && files.length === 0 ? (
          <Paper elevation={0} sx={{ ...pageCardSx, mt: 0 }}>
            <Typography sx={{ color: brand.textSoft }}>
              No uploaded files found.
            </Typography>
          </Paper>
        ) : null}
      </Box>

      <Dialog
        open={uploadDialogOpen}
        onClose={() => {
          if (!uploading) {
            resetUploadDialog();
          }
        }}
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
              onClick={handleOpenFileChooser}
              disabled={uploading}
              sx={outlinedActionButtonSx}
            >
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected`
                : "Choose Files"}
            </Button>

            {selectedFiles.length > 0 ? (
              <Box
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${brand.border}`,
                  backgroundColor: brand.softAlt,
                  p: 1.5,
                }}
              >
                <Stack spacing={0.75}>
                  {selectedFiles.map((file) => (
                    <Typography
                      key={`${file.name}-${file.size}`}
                      sx={{ color: brand.textSoft, fontSize: "0.92rem" }}
                    >
                      {file.name}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ) : null}

            <TextField
              label="Description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
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
            onClick={handleStartUpload}
            variant="contained"
            disabled={uploading}
            sx={filledActionButtonSx}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

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
              onChange={(event) => setEditingDescription(event.target.value)}
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
            onClick={handleSaveEdit}
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

export default EcomUploadCenterPage;
