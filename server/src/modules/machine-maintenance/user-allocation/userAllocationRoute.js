import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createUserAllocation,
  deleteUserAllocation,
  getUserAllocationById,
  getUserAllocations,
  updateUserAllocation,
} from "./userAllocationController.js";

const router = express.Router();

router.get("/", protect, getUserAllocations);
router.get("/:id", protect, getUserAllocationById);
router.post("/", protect, createUserAllocation);
router.put("/:id", protect, updateUserAllocation);
router.delete("/:id", protect, deleteUserAllocation);

export default router;
