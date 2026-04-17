import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.join(process.cwd(), "uploads", "machine-maintenance");

fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    cb(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "operatingManual") {
    const allowedDocuments = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedDocuments.includes(file.mimetype)) {
      return cb(new Error("Operating manual must be PDF, DOC or DOCX"));
    }
  }

  if (
    file.fieldname === "machineImage" &&
    !file.mimetype.startsWith("image/")
  ) {
    return cb(new Error("Machine image must be an image file"));
  }

  cb(null, true);
};

const uploadMachineMaintenanceFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default uploadMachineMaintenanceFiles;
