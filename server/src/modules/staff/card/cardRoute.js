import express from "express";
import {
  getCards,
  createCard,
  updateCard,
  deleteCard,
  activateCard,
} from "./cardController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCards);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);
router.put("/:id/activate", activateCard);

export default router;
