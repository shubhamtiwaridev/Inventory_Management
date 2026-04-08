import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  verifyStaffUser,
  clearPasswordRequest,
  deleteStaffUser,
} from "./staffPageController.js";

const router = express.Router();

router.get("/", protect, getStaffUsers);
router.post("/", protect, createStaffUser);
router.patch("/:id", protect, updateStaffUser);
router.patch("/:id/clear-password-request", protect, clearPasswordRequest);
router.patch("/:id/verify", protect, verifyStaffUser);
router.delete("/:id", protect, deleteStaffUser);

export default router;
