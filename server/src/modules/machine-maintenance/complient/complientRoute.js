import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createComplient,
  deleteComplient,
  getComplientById,
  getComplients,
  updateComplient,
} from "./complientController.js";

const router = express.Router();

router.get("/", protect, getComplients);
router.get("/:id", protect, getComplientById);
router.post("/", protect, createComplient);
router.put("/:id", protect, updateComplient);
router.delete("/:id", protect, deleteComplient);

export default router;
