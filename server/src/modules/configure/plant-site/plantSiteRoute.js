import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createPlantSite,
  deletePlantSite,
  getPlantSiteById,
  getPlantSites,
  updatePlantSite,
} from "./plantSiteController.js";

const router = express.Router();

router.get("/", protect, getPlantSites);
router.get("/:id", protect, getPlantSiteById);
router.post("/", protect, createPlantSite);
router.put("/:id", protect, updatePlantSite);
router.delete("/:id", protect, deletePlantSite);

export default router;
