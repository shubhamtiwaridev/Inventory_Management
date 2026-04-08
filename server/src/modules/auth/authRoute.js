import express from "express";
import {
  getAllUsers,
  getMe,
  login,
  logout,
  register,
  deleteUser,
  changePassword,
  forgotPasswordNotification,
} from "./authController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/change-password", changePassword);
router.post("/forgot-password-notification", forgotPasswordNotification);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.get("/users", protect, getAllUsers);
router.delete("/users/:id", protect, deleteUser);

export default router;
