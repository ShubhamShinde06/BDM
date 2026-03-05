import { Router } from "express";
import {
  getDashboard,
  getAllHospitals,
  updateHospitalStatus,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  getAllRequests,
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  hospitalStatusValidator,
  paginationValidator,
} from "../validators/index.js";

const router = Router();

// All admin routes require main_admin role
router.use(protect, authorize("main_admin"));

// GET  /api/admin/dashboard
router.get("/dashboard", getDashboard);

// GET  /api/admin/hospitals?status=pending&page=1&limit=20
router.get("/hospitals", paginationValidator, getAllHospitals);

// PATCH /api/admin/hospitals/:id/status  body: { status: "approved"|"rejected" }
router.patch("/hospitals/:id/status", hospitalStatusValidator, updateHospitalStatus);

// GET  /api/admin/users?role=donor&status=active&bloodGroup=O+
router.get("/users", paginationValidator, getAllUsers);

// PATCH /api/admin/users/:id/block
router.patch("/users/:id/block", toggleBlockUser);

// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUser);

// GET  /api/admin/requests
router.get("/requests", paginationValidator, getAllRequests);

export default router;
