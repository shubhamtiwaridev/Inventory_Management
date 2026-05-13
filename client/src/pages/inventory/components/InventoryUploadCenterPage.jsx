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
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
import { buildServerUrl } from "../../../api/config.js";
import {
  actionIconButtonSx,
  brand,
  filledActionButtonSx,
  outlinedActionButtonSx,
} from "../../machine-maintenance/components/machineMaintenanceUi.jsx";
import {
  deleteUploadCenterFile,
  getUploadCenterFiles,
  updateUploadCenterFile,
  uploadFilesToUploadCenter,
} from "./inventoryUploadCenterApi.js";

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
      return <PictureAsPdfRoundedIcon sx={{ fontSize: 34, color: "#C2410C" }} />;
    case "video":
      return <MovieRoundedIcon sx={{ fontSize: 34, color: brand.primary }} />;
    case "audio":
      return <AudioFileRoundedIcon sx={{ fontSize: 34, color: brand.primary }} />;
    default:
      return (
        <InsertDriveFileRoundedIcon sx={{ fontSize: 34, color: brand.primary }} />
      );
  }
};

const InventoryUploadCenterPage = () => {
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
    if (!feedback.message) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setFeedback({ type: "", message: "" });
    }, 5000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [feedback]);

  const resetUploadDialog = () => {
    blurActiveElement();
    setUploadDialogOpen(false);
    setSelectedFiles([]);
    setDescription("");
    setDescriptionError("");
  };

  const handleOpenPicker = () => {
    blurActiveElement();
    setFeedback({ type: "", message: "" });
    setUploadDialogOpen(true);
  };

  const handleOpenFileChooser = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const nextSelectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (nextSelectedFiles.length === 0) return;

    setSelectedFiles(nextSelectedFiles);
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) {
      setDescriptionError("Please choose at least one file.");
      return;
    }

    try {
      setUploading(true);
      setDescriptionError("");
      setFeedback({ type: "", message: "" });
      const response = await uploadFilesToUploadCenter({
        files: selectedFiles,
        description,
      });
      await loadFiles();
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

  const handleDelete = async (file) => {
    try {
      await deleteUploadCenterFile(file.id);
      await loadFiles();
      setFeedback({
        type: "success",
        message: "File deleted successfully.",
      });
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
    setFeedback({ type: "", message: "" });
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
      await updateUploadCenterFile(editingFile.id, {
        description: editingDescription,
      });
      await loadFiles();
      handleCloseEditDialog();
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
            <Typography variant="h5" sx={{ fontWeight: 800, color: brand.text }}>
              Upload Center
            </Typography>
            <Typography sx={{ color: brand.textSoft, mt: 0.5 }}>
              Total files stored: {totalFiles}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={loadFiles}
              disabled={loading || uploading}
              sx={outlinedActionButtonSx}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadRoundedIcon />}
              onClick={handleOpenPicker}
              disabled={uploading}
              sx={filledActionButtonSx}
            >
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
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
          {files.map((file) => {
            const fileUrl = buildServerUrl(file.url || "");
            const isImage = file.fileKind === "image";

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
                    {isImage ? (
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
                    <IconButton
                      onClick={() => handleOpenEditDialog(file)}
                      sx={actionIconButtonSx}
                    >
                      <EditRoundedIcon
                        sx={{ fontSize: 18, color: brand.primaryDark }}
                      />
                    </IconButton>
                    <IconButton
                      component="a"
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={actionIconButtonSx}
                    >
                      <OpenInNewRoundedIcon
                        sx={{ fontSize: 18, color: brand.primaryDark }}
                      />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(file)}
                      sx={actionIconButtonSx}
                    >
                      <DeleteOutlineRoundedIcon
                        sx={{ fontSize: 18, color: brand.danger }}
                      />
                    </IconButton>
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
                </Box>

                <Stack spacing={0.65} sx={{ mt: "auto", pt: 2 }}>
                  <Typography sx={{ color: brand.textSoft, fontSize: "0.9rem" }}>
                    Size: {formatFileSize(file.sizeBytes)}
                  </Typography>
                  <Typography sx={{ color: brand.textSoft, fontSize: "0.9rem" }}>
                    Uploaded by: {file.createdBy || "System"}
                  </Typography>
                  <Typography sx={{ color: brand.textSoft, fontSize: "0.9rem" }}>
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
              helperText={descriptionError || "This description will be shown on the file card."}
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
