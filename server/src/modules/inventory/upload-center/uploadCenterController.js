import fs from "fs/promises";
import path from "path";
import UploadCenterFile from "./uploadCenterModel.js";

const UPLOAD_CENTER_SELECT_FIELDS =
  "originalName storedName mimeType sizeBytes extension description relativePath createdBy createdAt updatedAt";

const pad = (value) => String(value).padStart(2, "0");

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const amPm = hours >= 12 ? "PM" : "AM";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hours12}:${pad(date.getMinutes())} ${amPm}`;
};

const getUserName = (req) =>
  req.user?.name || req.user?.username || req.user?.email || "System";

const getFileKind = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  return "file";
};

const mapUploadCenterFile = (item) => ({
  id: String(item._id),
  originalName: item.originalName || "",
  storedName: item.storedName || "",
  mimeType: item.mimeType || "application/octet-stream",
  sizeBytes: Number(item.sizeBytes || 0),
  extension: item.extension || "",
  description: item.description || "",
  relativePath: item.relativePath || "",
  url: item.relativePath || "",
  fileKind: getFileKind(item.mimeType || ""),
  createdBy: item.createdBy || "System",
  createdAt: formatDateTime(item.createdAt),
  updatedAt: formatDateTime(item.updatedAt),
});

export const getUploadCenterFiles = async (req, res) => {
  try {
    const items = await UploadCenterFile.find({})
      .select(UPLOAD_CENTER_SELECT_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: items.map(mapUploadCenterFile),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch uploaded files",
    });
  }
};

export const uploadCenterFiles = async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const description = String(req.body?.description || "").trim();

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one file is required",
      });
    }

    const rowsToInsert = files.map((file) => ({
      originalName: file.originalname || file.filename || "file",
      storedName: file.filename || "",
      mimeType: file.mimetype || "application/octet-stream",
      sizeBytes: Number(file.size || 0),
      extension: path.extname(file.originalname || file.filename || ""),
      description,
      relativePath: `/uploads/inventory-upload-center/${file.filename}`,
      createdBy: getUserName(req),
      updatedBy: getUserName(req),
    }));

    await UploadCenterFile.insertMany(rowsToInsert, { ordered: false });

    const items = await UploadCenterFile.find({})
      .select(UPLOAD_CENTER_SELECT_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully",
      data: items.map(mapUploadCenterFile),
      summary: {
        uploadedCount: rowsToInsert.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload files",
    });
  }
};

export const updateUploadCenterFile = async (req, res) => {
  try {
    const description = String(req.body?.description || "").trim();

    const item = await UploadCenterFile.findByIdAndUpdate(
      req.params.id,
      {
        description,
        updatedBy: getUserName(req),
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Uploaded file not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Uploaded file updated successfully",
      data: mapUploadCenterFile(item),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update uploaded file",
    });
  }
};

export const deleteUploadCenterFile = async (req, res) => {
  try {
    const item = await UploadCenterFile.findByIdAndDelete(req.params.id).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Uploaded file not found",
      });
    }

    const normalizedRelativePath = String(item.relativePath || "").replace(
      /^\/+/,
      "",
    );
    const absolutePath = path.resolve(process.cwd(), normalizedRelativePath);

    await fs.unlink(absolutePath).catch(() => null);

    return res.status(200).json({
      success: true,
      message: "Uploaded file deleted successfully",
      data: mapUploadCenterFile(item),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete uploaded file",
    });
  }
};
