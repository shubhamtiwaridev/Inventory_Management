import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "./taskController.js";

const router = express.Router();

router.get("/", protect, getTasks);
router.get("/:id", protect, getTaskById);
router.post("/", protect, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;
