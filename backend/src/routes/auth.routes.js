import { Router } from "express";
import {
  registerUser,
  registerHospital,
  login,
  refreshToken,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import {
  registerUserValidator,
  registerHospitalValidator,
  loginValidator,
} from "../validators/index.js";

const router = Router();

// POST /api/auth/register/user
router.post("/register/user", registerUserValidator, registerUser);

// POST /api/auth/register/hospital
router.post("/register/hospital", registerHospitalValidator, registerHospital);

// POST /api/auth/login  body: { email, password, loginAs: "user"|"hospital" }
router.post("/login", loginValidator, login);

// POST /api/auth/refresh  (uses httpOnly cookie or body.refreshToken)
router.post("/refresh", refreshToken);

// POST /api/auth/logout  (protected)
router.post("/logout", protect, logout);

// GET /api/auth/me
router.get("/me", protect, getMe);

export default router;
