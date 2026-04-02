import express from "express";
import {
  getStaffTypes,
  createStaffType,
  updateStaffType,
  deleteStaffType,
} from "../controllers/staffTypeController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// public for register page
router.get("/public", getStaffTypes);

// protected for team/staff type page
router.get("/", protect, authorizeRoles("superadmin", "admin"), getStaffTypes);
router.post("/", protect, authorizeRoles("superadmin", "admin"), createStaffType);
router.put("/:id", protect, authorizeRoles("superadmin", "admin"), updateStaffType);
router.delete("/:id", protect, authorizeRoles("superadmin", "admin"), deleteStaffType);

export default router;