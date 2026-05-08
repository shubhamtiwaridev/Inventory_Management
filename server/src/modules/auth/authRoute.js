import express from "express";
import {
  getAllUsers,
  getMe,
  getPublicStaffTypes,
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
router.get("/public-staff-types", getPublicStaffTypes);
router.post("/change-password", changePassword);
router.post("/forgot-password-notification", forgotPasswordNotification);
router.get("/me", getMe);
router.post("/logout", protect, logout);
router.get("/users", protect, getAllUsers);
router.delete("/users/:id", protect, deleteUser);

export default router;
