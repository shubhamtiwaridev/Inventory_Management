import express from "express";
import {
  getStaffTypes,
  createStaffType,
  updateStaffType,
  deleteStaffType,
} from "./staffTypeController.js";

const router = express.Router();

router.get("/", getStaffTypes);
router.post("/", createStaffType);
router.put("/:id", updateStaffType);
router.delete("/:id", deleteStaffType);

export default router;