import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createShiftTiming,
  deleteShiftTiming,
  getShiftTimingById,
  getShiftTimings,
  updateShiftTiming,
} from "./shiftTimingController.js";

const router = express.Router();

router.get("/", protect, getShiftTimings);
router.get("/:id", protect, getShiftTimingById);
router.post("/", protect, createShiftTiming);
router.put("/:id", protect, updateShiftTiming);
router.delete("/:id", protect, deleteShiftTiming);

export default router;
