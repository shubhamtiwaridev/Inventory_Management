import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  createStockTransaction,
  deleteStockTransaction,
  getAvailableOutboundItems,
  getInventorySummary,
  getStockTransactions,
  updateStockTransaction,
} from "./stockTransactionController.js";

const createStockTransactionRouter = (transactionType) => {
  const router = express.Router();

  router.use(protect);
  router.use((req, res, next) => {
    req.inventoryTransactionType = transactionType;
    next();
  });

  if (transactionType === "outbound") {
    router.get("/available-items", getAvailableOutboundItems);
  }

  if (transactionType === "inbound") {
    router.get("/inventory-summary", getInventorySummary);
  }

  router.get("/", getStockTransactions);
  router.post("/", createStockTransaction);
  router.put("/:id", updateStockTransaction);
  router.delete("/:id", deleteStockTransaction);

  return router;
};

export default createStockTransactionRouter;
