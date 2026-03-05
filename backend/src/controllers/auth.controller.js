import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import { sendTokenResponse, verifyRefreshToken, generateTokens } from "../config/jwt.js";
import { asyncHandler, ApiError } from "../middleware/error.js";

// ─── @route  POST /api/auth/register/user ────────────────────────────────────
// ─── @access Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, bloodGroup, phone, location } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError("Email already registered", 409);

  const user = await User.create({
    name,
    email,
    password,
    role,
    bloodGroup,
    phone,
    location,
  });

  sendTokenResponse(res, user, 201);
});

// ─── @route  POST /api/auth/register/hospital ────────────────────────────────
// ─── @access Public
export const registerHospital = asyncHandler(async (req, res) => {
  const { name, email, password, licenseNumber, contact, location } = req.body;

  const exists = await Hospital.findOne({ $or: [{ email }, { licenseNumber }] });
  if (exists) {
    throw new ApiError(
      exists.email === email ? "Email already registered" : "License number already registered",
      409
    );
  }

  const hospital = await Hospital.create({
    name,
    email,
    password,
    licenseNumber,
    contact,
    location,
    status: "pending",
  });

  const hospitalObj = hospital.toObject();
  delete hospitalObj.password;

  return res.status(201).json({
    success: true,
    message: "Hospital registration submitted. Awaiting admin approval.",
    hospital: hospitalObj,
  });
});

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
// ─── @access Public  body: { email, password, role: "user"|"hospital" }
export const login = asyncHandler(async (req, res) => {
  const { email, password, loginAs } = req.body;

  let entity;

  if (loginAs === "hospital") {
    entity = await Hospital.findOne({ email }).select("+password");
    if (!entity) throw new ApiError("Invalid credentials", 401);
    if (entity.status === "pending")
      throw new ApiError("Hospital account is pending approval", 403);
    if (entity.status === "rejected")
      throw new ApiError("Hospital registration was rejected", 403);
    if (entity.status === "suspended")
      throw new ApiError("Hospital account is suspended", 403);
  } else {
    entity = await User.findOne({ email }).select("+password");
    if (!entity) throw new ApiError("Invalid credentials", 401);
    if (entity.status === "blocked")
      throw new ApiError("Account blocked. Contact support.", 403);
  }

  const isMatch = await entity.comparePassword(password);
  if (!isMatch) throw new ApiError("Invalid credentials", 401);

  // Store refresh token hash in DB for rotation
  const payload = { id: entity._id, role: entity.role };
  const { accessToken, refreshToken } = generateTokens(payload);

  entity.refreshToken = refreshToken;
  entity.isOnline = true;
  await entity.save({ validateBeforeSave: false });

  const entityObj = entity.toObject();
  delete entityObj.password;
  delete entityObj.refreshToken;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res.status(200).json({
    success: true,
    accessToken,
    user: entityObj,
  });
});

// ─── @route  POST /api/auth/refresh ──────────────────────────────────────────
// ─── @access Public (uses refresh token cookie or body)
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new ApiError("No refresh token", 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError("Invalid or expired refresh token", 401);
  }

  let entity;
  if (decoded.role === "hospital_admin") {
    entity = await Hospital.findById(decoded.id).select("+refreshToken");
  } else {
    entity = await User.findById(decoded.id).select("+refreshToken");
  }

  if (!entity || entity.refreshToken !== token) {
    throw new ApiError("Refresh token reuse detected. Please login again.", 401);
  }

  const payload = { id: entity._id, role: entity.role };
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);

  // Rotate refresh token
  entity.refreshToken = newRefreshToken;
  await entity.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  return res.status(200).json({ success: true, accessToken });
});

// ─── @route  POST /api/auth/logout ───────────────────────────────────────────
// ─── @access Private
export const logout = asyncHandler(async (req, res) => {
  const user = req.user;
  user.refreshToken = null;
  user.isOnline = false;
  user.socketId = null;
  await user.save({ validateBeforeSave: false });

  res.clearCookie("refreshToken");

  return res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private
export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
});
