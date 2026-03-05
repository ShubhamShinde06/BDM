import { verifyAccessToken } from "../config/jwt.js";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";

/**
 * Protect route — verifies Bearer JWT from Authorization header
 * Attaches req.user (User or Hospital document) and req.userModel
 */
export const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Token expired. Please login again."
          : "Invalid token.";
      return res.status(401).json({ success: false, message });
    }

    // 3. Find user in correct collection based on role
    let currentUser = null;

    if (decoded.role === "hospital_admin") {
      currentUser = await Hospital.findById(decoded.id).select("-password -refreshToken");
      req.userModel = "Hospital";
    } else {
      currentUser = await User.findById(decoded.id).select("-password -refreshToken");
      req.userModel = "User";
    }

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // 4. Check if blocked/suspended
    if (currentUser.status === "blocked" || currentUser.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact support.",
      });
    }

    // 5. Hospital must be approved
    if (decoded.role === "hospital_admin" && currentUser.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Hospital account is pending admin approval.",
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ success: false, message: "Server error in auth" });
  }
};

/**
 * Role-based access control
 * Usage: authorize("main_admin") or authorize("main_admin", "hospital_admin")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

/**
 * Socket.io JWT authentication middlewa  re
 * Called once per socket connection handshake
 */
export const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token"));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next(new Error("Authentication error: Invalid token"));
    }

    let user = null;
    if (decoded.role === "hospital_admin") {
      user = await Hospital.findById(decoded.id).select("name email role status");
    } else {
      user = await User.findById(decoded.id).select("name email role status bloodGroup");
    }

    if (!user) return next(new Error("Authentication error: User not found"));

    socket.userId = user._id.toString();
    socket.userRole = decoded.role;
    socket.userModel = decoded.role === "hospital_admin" ? "Hospital" : "User";
    socket.userName = user.name;

    next();
  } catch (err) {
    next(new Error("Authentication error: " + err.message));
  }
};
