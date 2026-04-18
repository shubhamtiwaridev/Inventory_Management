import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getDepartments,
  updateDepartment,
} from "./departmentController.js";

const router = express.Router();

router.get("/", protect, getDepartments);
router.get("/:id", protect, getDepartmentById);
router.post("/", protect, createDepartment);
router.put("/:id", protect, updateDepartment);
router.delete("/:id", protect, deleteDepartment);

export default router;
