import express from "express";
import multer from "multer";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createGoodsItem,
  deleteGoodsItem,
  getGoodsItems,
  importGoodsItemsFromExcel,
  updateGoodsItem,
} from "./goodsListController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const lowerName = String(file.originalname || "").toLowerCase();

    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
      callback(new Error("Only .xlsx and .xls files are allowed"));
      return;
    }

    callback(null, true);
  },
});

router.get("/", protect, getGoodsItems);
router.post("/", protect, createGoodsItem);
router.put("/:id", protect, updateGoodsItem);
router.delete("/:id", protect, deleteGoodsItem);
router.post(
  "/import-excel",
  protect,
  upload.single("file"),
  importGoodsItemsFromExcel,
);

export default router;
