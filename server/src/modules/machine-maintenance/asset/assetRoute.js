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

router.get("/", protect, getAssets);
router.get("/:id", protect, getAssetById);
router.post(
  "/",
  protect,
  uploadMachineMaintenanceFiles.fields([
    { name: "operatingManual", maxCount: 1 },
    { name: "machineImage", maxCount: 1 },
  ]),
  createAsset,
);
router.put(
  "/:id",
  protect,
  uploadMachineMaintenanceFiles.fields([
    { name: "operatingManual", maxCount: 1 },
    { name: "machineImage", maxCount: 1 },
  ]),
  updateAsset,
);
router.delete("/:id", protect, deleteAsset);

export default router;
