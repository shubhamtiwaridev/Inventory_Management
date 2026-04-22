import jwt from "jsonwebtoken";
import User from "../modules/auth/authModel.js";

const isDevelopment = process.env.NODE_ENV !== "production";

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
  } catch (error) {
    if (isDevelopment) {
      console.error("AUTH TOKEN VERIFY FAILED:", error.message);
    }
    return null;
  }
};

export const protect = async (req, res, next) => {
  try {
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

      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};
