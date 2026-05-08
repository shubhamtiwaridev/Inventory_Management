import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  getStaffTypes,
  createStaffType,
  updateStaffType,
  deleteStaffType,
} from "./staffTypeController.js";

const router = express.Router();

router.get("/", getStaffTypes);
router.post("/", protect, createStaffType);
router.put("/:id", protect, updateStaffType);
router.delete("/:id", protect, deleteStaffType);

export default router;
