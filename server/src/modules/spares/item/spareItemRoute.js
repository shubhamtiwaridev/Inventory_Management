import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createSpareItem,
  deleteSpareItem,
  getSpareItemById,
  getSpareItems,
  updateSpareItem,
} from "./spareItemController.js";

const router = express.Router();

router.get("/", protect, getSpareItems);
router.get("/:id", protect, getSpareItemById);
router.post("/", protect, createSpareItem);
router.put("/:id", protect, updateSpareItem);
router.delete("/:id", protect, deleteSpareItem);

export default router;
