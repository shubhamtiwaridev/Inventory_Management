import express from "express";
import multer from "multer";
import { protect } from "../../middleware/authMiddleware.js";
import {
  createEcomProduct,
  deleteEcomProduct,
  getEcomProducts,
  importEcomProductsFromExcel,
  updateEcomProduct,
} from "./ecomController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/", protect, getEcomProducts);
router.post("/", protect, createEcomProduct);
router.put("/:id", protect, updateEcomProduct);
router.delete("/:id", protect, deleteEcomProduct);
router.post(
  "/import-excel",
  protect,
  upload.single("file"),
  importEcomProductsFromExcel,
);

export default router;
