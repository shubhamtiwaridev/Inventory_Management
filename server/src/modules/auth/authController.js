import jwt from "jsonwebtoken";
import User from "./authModel.js";
import StaffType from "../staff/stafftype/staffTypeModel.js";
import { createRequestScopedLogActivity } from "../log-activity/logActivityService.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  roles: user.roles,
  staffType: user.staffType || null,
  assignedCards: user.staffType?.assignedCards || [],
  permissions: user.permissions || {},
  isVerified: user.isVerified,
  verifiedBy: user.verifiedBy,
  verifiedAt: user.verifiedAt,
  createdFrom: user.createdFrom,
  passwordChangeRequest: user.passwordChangeRequest,
  passwordChangeRequestAt: user.passwordChangeRequestAt,
  passwordChangeRequestMessage: user.passwordChangeRequestMessage,
});

const isSuperadminRole = (roles = "") =>
  String(roles).trim().toLowerCase() === "superadmin";

const staffTypePopulateOptions = {
  path: "staffType",
  populate: {
    path: "assignedCards",
    select: "name title path icon iconBg iconColor subtitle subtitleTone",
  },
};

const validateStaffTypeForRole = async (roles, staffType) => {
  if (isSuperadminRole(roles)) {
    return null;
  }

  if (!staffType) {
    throw new Error("Staff type is required");
  }

  const existingStaffType = await StaffType.findById(staffType)
    .select("_id assignedCards")
    .lean();

  if (!existingStaffType) {
    throw new Error("Selected staff type does not exist");
  }

  if (
    !Array.isArray(existingStaffType.assignedCards) ||
    existingStaffType.assignedCards.length === 0
  ) {
    throw new Error("Selected staff type has no assigned cards");
  }

  return staffType;
};

const isProduction = process.env.NODE_ENV === "production";

const parseOrigin = (value = "") => {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
};

const configuredClientOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => parseOrigin(origin.trim()))
  .filter(Boolean);

const shouldUseCrossSiteCookies = configuredClientOrigins.some(
  (origin) => origin && origin !== parseOrigin(process.env.SERVER_URL || ""),
);

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction && shouldUseCrossSiteCookies ? "none" : "lax",
  path: "/",
};

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  res.cookie("token", token, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: buildUserResponse(user),
  });
};

const getTokensFromRequest = (req) => {
  const cookieToken = req.cookies?.token || null;

  const authHeader = req.headers.authorization || req.headers.Authorization;
  const bearerToken =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  return {
    bearerToken,
    cookieToken,
  };
};

const getUserFromToken = async (token) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate(staffTypePopulateOptions)
      .lean();

    return user || null;
  } catch {
    return null;
  }
};

const logLoginFailure = async (req, statusCode, message) => {
  try {
    await createRequestScopedLogActivity({
      req,
      action: "Login Failed",
      module: "Authentication",
      page: "Login",
      resource: "Login",
      targetName: String(req.body?.email || "")
        .trim()
        .toLowerCase(),
      method: "POST",
      endpoint: req.originalUrl || req.url || "/api/auth/login",
      statusCode,
      details: {
        message,
        page: "Login",
      },
      fallbackActor: {
        userEmail: req.body?.email,
        userName: String(req.body?.email || "")
          .trim()
          .toLowerCase() || "Guest",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("LOGIN FAILURE LOG ERROR:", error.message);
    }
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, roles, staffType, password } = req.body;

    if (!name || !email || !roles || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, roles and password are required",
      });
    }

    let finalStaffType = null;

    try {
      finalStaffType = await validateStaffTypeForRole(roles, staffType);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail })
      .select("_id")
      .lean();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      roles: roles.trim(),
      staffType: finalStaffType,
      password,
      isVerified: false,
      createdFrom: "public",
    });

    await user.populate(staffTypePopulateOptions);

    res.status(201).json({
      success: true,
      message:
        "Registration completed successfully. Your account is pending verification by superadmin.",
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

export const getPublicStaffTypes = async (req, res) => {
  try {
    const staffTypes = await StaffType.find({
      name: { $not: /^superadmin$/i },
    })
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: staffTypes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load staff types",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      await logLoginFailure(req, 400, "Email and password are required");
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    })
      .select("+password")
      .populate(staffTypePopulateOptions);

    if (!user) {
      await logLoginFailure(req, 401, "Password or email are not match");
      return res.status(401).json({
        success: false,
        message: "Password or email are not match",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await logLoginFailure(req, 401, "Password or email are not match");
      return res.status(401).json({
        success: false,
        message: "Password or email are not match",
      });
    }

    if (user.isVerified === false) {
      await logLoginFailure(req, 403, "Your ID are not verified");
      return res.status(403).json({
        success: false,
        message: "Your ID are not verified",
      });
    }

    sendTokenResponse(user, 200, res, "Login successful");
  } catch (error) {
    await logLoginFailure(req, 500, error.message || "Login failed");
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, old password and new password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password not match",
      });
    }

    user.password = newPassword;
    user.passwordChangeRequest = false;
    user.passwordChangeRequestAt = null;
    user.passwordChangeRequestMessage = "";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update password",
    });
  }
};

export const forgotPasswordNotification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.passwordChangeRequest = true;
    user.passwordChangeRequestAt = new Date();
    user.passwordChangeRequestMessage = "Password change request pending";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password change notification sent successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send notification",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });

    const { bearerToken, cookieToken } = getTokensFromRequest(req);

    const user =
      (await getUserFromToken(bearerToken)) ||
      (await getUserFromToken(cookieToken));

    if (!user) {
      res.clearCookie("token", authCookieOptions);

      return res.status(200).json({
        success: true,
        user: null,
      });
    }

    return res.status(200).json({
      success: true,
      user: buildUserResponse(user),
    });
  } catch {
    res.clearCookie("token", authCookieOptions);

    return res.status(200).json({
      success: true,
      user: null,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Delete failed",
    });
  }
};

export const logout = async (req, res) => {
  const loggedOutUser = req.user ? buildUserResponse(req.user) : null;

  try {
    if (loggedOutUser) {
      await createRequestScopedLogActivity({
        req,
        user: req.user,
        action: "Logged Out",
        module: "Authentication",
        page: "Logout",
        resource: "Logout",
        targetName: loggedOutUser.name || loggedOutUser.email || "Logout",
        resourceId: loggedOutUser._id ? String(loggedOutUser._id) : "",
        method: "POST",
        endpoint: req.originalUrl || req.url || "/api/auth/logout",
        statusCode: 200,
        details: {
          message: "Logged out successfully",
          page: "Logout",
          targetName: loggedOutUser.name || loggedOutUser.email || "Logout",
        },
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("LOGOUT SUCCESS LOG ERROR:", error.message);
    }
  }

  res.clearCookie("token", authCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
    user: loggedOutUser,
  });
};
