import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createVendor,
  deleteVendor,
  getVendorById,
  getVendors,
  updateVendor,
} from "./vendorController.js";

const router = express.Router();

router.get("/", protect, getVendors);
router.get("/:id", protect, getVendorById);
router.post("/", protect, createVendor);
router.put("/:id", protect, updateVendor);
router.delete("/:id", protect, deleteVendor);

export default router;
