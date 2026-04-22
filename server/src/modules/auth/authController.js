import jwt from "jsonwebtoken";
import User from "./authModel.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  roles: user.roles,
  isVerified: user.isVerified,
  verifiedBy: user.verifiedBy,
  verifiedAt: user.verifiedAt,
  createdFrom: user.createdFrom,
  passwordChangeRequest: user.passwordChangeRequest,
  passwordChangeRequestAt: user.passwordChangeRequestAt,
  passwordChangeRequestMessage: user.passwordChangeRequestMessage,
});

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
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
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
    const user = await User.findById(decoded.id).select("-password");
    return user || null;
  } catch {
    return null;
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, roles, password } = req.body;

    if (!name || !email || !roles || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, roles and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

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
      password,
      isVerified: false,
      createdFrom: "public",
    });

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Password or email are not match",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password or email are not match",
      });
    }

    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: "Your ID are not verified",
      });
    }

    sendTokenResponse(user, 200, res, "Login successful");
  } catch (error) {
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
    const users = await User.find().select("-password").sort({ createdAt: -1 });

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
  res.clearCookie("token", authCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
