import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";

const createMasterRoute = ({
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
}) => {
  const router = express.Router();

  router.get("/", protect, getItems);
  router.get("/:id", protect, getItemById);
  router.post("/", protect, createItem);
  router.put("/:id", protect, updateItem);
  router.delete("/:id", protect, deleteItem);

  return router;
};

export default createMasterRoute;
