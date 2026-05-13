import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  deleteUploadCenterFile,
  getUploadCenterFiles,
  updateUploadCenterFile,
  uploadCenterFiles,
} from "./uploadCenterController.js";

const router = express.Router();

const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "inventory-upload-center",
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    const safeBaseName = String(file.originalname || "file")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    const extension = path.extname(file.originalname || "");
    callback(null, `${Date.now()}-${safeBaseName || "file"}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 20,
  },
});

router.use(protect);

router.get("/", getUploadCenterFiles);
router.post("/", upload.array("files", 20), uploadCenterFiles);
router.put("/:id", updateUploadCenterFile);
router.delete("/:id", deleteUploadCenterFile);

export default router;
