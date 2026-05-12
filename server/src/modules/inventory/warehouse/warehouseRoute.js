import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
} from "./warehouseController.js";

const router = express.Router();

router.use(protect);

router.get("/", getWarehouses);
router.post("/", createWarehouse);
router.put("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

export default router;
