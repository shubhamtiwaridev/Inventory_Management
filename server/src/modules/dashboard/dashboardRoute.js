import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { getDashboardSummary } from "./dashboardController.js";

const router = express.Router();

router.use(protect);
router.get("/summary", getDashboardSummary);

export default router;
