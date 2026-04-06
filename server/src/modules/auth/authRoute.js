import express from "express";
import { getMe, login, logout, register } from "./authController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);

export default router;