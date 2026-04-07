import express from "express";
import {
  getAllUsers,
  getMe,
  login,
  logout,
  register,
  deleteUser,
} from "./authController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.get("/users", protect, getAllUsers);
router.delete("/users/:id", protect, deleteUser);

export default router;

