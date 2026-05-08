import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import {
  clearLogActivities,
  createLogActivity,
  deleteLogActivity,
  getLogActivities,
} from "./logActivityController.js";

const router = express.Router();

router.use(protect);

router.get("/", getLogActivities);
router.post("/", createLogActivity);
router.delete("/", clearLogActivities);
router.delete("/:id", deleteLogActivity);

export default router;
