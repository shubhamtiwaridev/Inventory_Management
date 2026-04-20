import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.join(process.cwd(), "uploads", "machine-maintenance");

fs.mkdirSync(uploadRoot, { recursive: true });

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",

  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/webm",
  "video/x-flv",
  "video/3gpp",
  "video/3gpp2",
  "video/ogg",
  "video/mp2t",
  "video/x-matroska",

  "application/octet-stream",
];

const allowedExtensions = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",

  ".mp4",
  ".mpeg",
  ".mpg",
  ".mov",
  ".avi",
  ".wmv",
  ".webm",
  ".flv",
  ".3gp",
  ".3g2",
  ".ogv",
  ".ts",
  ".m2ts",
  ".mts",
  ".mkv",
  ".m4v",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeBaseName = path
      .basename(file.originalname || "file", extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    cb(null, `${Date.now()}-${safeBaseName}${extension}`);
  },
});

const isAllowedFile = (file) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const mimeType = String(file.mimetype || "").toLowerCase();

  const extensionAllowed = allowedExtensions.includes(extension);
  const mimeAllowed =
    allowedMimeTypes.includes(mimeType) ||
    mimeType === "" ||
    mimeType === "application/octet-stream";

  return extensionAllowed && mimeAllowed;
};

const fileFilter = (req, file, cb) => {
  if (
    file.fieldname !== "operatingManual" &&
    file.fieldname !== "machineImage"
  ) {
    return cb(new Error("Unsupported upload field"));
  }

  if (!isAllowedFile(file)) {
    return cb(
      new Error("Only PDF, JPG, JPEG, PNG and video files are allowed"),
    );
  }

  cb(null, true);
};

const uploadMachineMaintenanceFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export default uploadMachineMaintenanceFiles;
