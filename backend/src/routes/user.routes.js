import { Router } from "express";
import {
  getProfile,
  updateProfile,
  toggleAvailability,
  getDonationHistory,
  getNearbyRequests,
  getUserStats,
  getNotifications,
  markNotificationRead,
  markAllRead,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { paginationValidator } from "../validators/index.js";

const router = Router();

router.use(protect);

// GET  /api/users/profile
router.get("/profile", getProfile);

// PUT  /api/users/profile
router.put("/profile", updateProfile);

// GET  /api/users/stats
router.get("/stats", getUserStats);

// PATCH /api/users/availability  body: { available: true|false }
router.patch("/availability", authorize("donor"), toggleAvailability);

// GET  /api/users/donations  — donor donation history
router.get("/donations", authorize("donor"), paginationValidator, getDonationHistory);

// GET  /api/users/nearby-requests  — donor sees pending requests matching their blood group
router.get("/nearby-requests", authorize("donor"), paginationValidator, getNearbyRequests);

// GET  /api/users/notifications?unreadOnly=true
router.get("/notifications", paginationValidator, getNotifications);

// PATCH /api/users/notifications/:id/read
router.patch("/notifications/:id/read", markNotificationRead);

// PATCH /api/users/notifications/read-all
router.patch("/notifications/read-all", markAllRead);

export default router;
