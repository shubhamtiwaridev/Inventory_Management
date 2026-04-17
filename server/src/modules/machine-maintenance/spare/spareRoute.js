import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createSpare,
  deleteSpare,
  getSpareById,
  getSpares,
  updateSpare,
} from "./spareController.js";

const router = express.Router();

router.get("/", protect, getSpares);
router.get("/:id", protect, getSpareById);
router.post("/", protect, createSpare);
router.put("/:id", protect, updateSpare);
router.delete("/:id", protect, deleteSpare);

export default router;
