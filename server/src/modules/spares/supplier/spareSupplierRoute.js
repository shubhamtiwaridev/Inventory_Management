import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createSpareSupplier,
  deleteSpareSupplier,
  getSpareSupplierById,
  getSpareSuppliers,
  updateSpareSupplier,
} from "./spareSupplierController.js";

const router = express.Router();

router.get("/", protect, getSpareSuppliers);
router.get("/:id", protect, getSpareSupplierById);
router.post("/", protect, createSpareSupplier);
router.put("/:id", protect, updateSpareSupplier);
router.delete("/:id", protect, deleteSpareSupplier);

export default router;
