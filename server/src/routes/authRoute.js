


import express from "express";
import {
  registerUser,
  loginUser,
  changePassword,
  requestForgotPassword,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-password", changePassword);
router.post("/forgot-password-request", requestForgotPassword);
router.get("/me", protect, getMe);

export default router;