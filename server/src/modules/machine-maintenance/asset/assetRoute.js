import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import uploadMachineMaintenanceFiles from "../../../middleware/uploadMachineMaintenanceFiles.js";
import {
  createAsset,
  deleteAsset,
  getAssetById,
  getAssets,
  updateAsset,
} from "./assetController.js";

const router = express.Router();

const assetUpload = (req, res, next) => {
  uploadMachineMaintenanceFiles.fields([
    { name: "operatingManual", maxCount: 1 },
    { name: "machineImage", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    next();
  });
};

router.get("/", protect, getAssets);
router.get("/:id", protect, getAssetById);
router.post("/", protect, assetUpload, createAsset);
router.put("/:id", protect, assetUpload, updateAsset);
router.delete("/:id", protect, deleteAsset);

export default router;