import express from "express";
import {
  getAllUsers,
  updateUserCredentials,
  verifyUserAccount,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("superadmin", "admin"),
  getAllUsers
);

router.put(
  "/:id",
  protect,
  authorizeRoles("superadmin", "admin"),
  updateUserCredentials
);

router.patch(
  "/:id/verify",
  protect,
  authorizeRoles("superadmin", "admin"),
  verifyUserAccount
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("superadmin", "admin"),
  deleteUser
);

export default router;