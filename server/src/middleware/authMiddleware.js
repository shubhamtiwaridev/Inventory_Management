import jwt from "jsonwebtoken";
import User from "../modules/auth/authModel.js";
import { createRequestScopedLogActivity } from "../modules/log-activity/logActivityService.js";
export { protect } from "../modules/auth/authMiddleware.js";

const isDevelopment = process.env.NODE_ENV !== "production";

const isPublicRequest = (req) => {
  const method = String(req.method || "").toUpperCase();
  const path = String(req.originalUrl || req.url || "").split("?")[0];

  return method === "GET" && path === "/api/staff-types";
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
    const user = await User.findById(decoded.id).select("-password").lean();
    return user || null;
  } catch (error) {
    if (isDevelopment) {
      console.error("AUTH TOKEN VERIFY FAILED:", error.message);
    }
    return null;
  }
};

const logLogoutFailure = async (req, statusCode, message) => {
  try {
    await createRequestScopedLogActivity({
      req,
      action: "Logout Failed",
      module: "Authentication",
      page: "Logout",
      resource: "Logout",
      targetName: "Logout Request",
      method: String(req.method || "").toUpperCase(),
      endpoint: req.originalUrl || req.url || "/api/auth/logout",
      statusCode,
      details: {
        message,
        page: "Logout",
      },
    });
  } catch (error) {
    if (isDevelopment) {
      console.error("LOGOUT FAILURE LOG ERROR:", error.message);
    }
  }
};

export const protect = async (req, res, next) => {
  try {
    if (isPublicRequest(req)) {
      next();
      return;
    }

    const { bearerToken, cookieToken } = getTokensFromRequest(req);

    const user =
      (await getUserFromToken(bearerToken)) ||
      (await getUserFromToken(cookieToken));

    if (!user) {
      if (isDevelopment) {
        console.error("AUTH REQUEST REJECTED:", {
          hasBearerToken: Boolean(bearerToken),
          hasCookieToken: Boolean(cookieToken),
          path: req.originalUrl,
          method: req.method,
        });
      }

      if ((req.originalUrl || req.url || "").startsWith("/api/auth/logout")) {
        await logLogoutFailure(req, 401, "Not authorized, invalid token");
      }

      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }

    req.user = user;
    next();
  } catch {
    if ((req.originalUrl || req.url || "").startsWith("/api/auth/logout")) {
      await logLogoutFailure(req, 401, "Not authorized, invalid token");
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};
