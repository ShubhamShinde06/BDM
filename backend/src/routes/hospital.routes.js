import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getInventory,
  updateInventory,
  bulkUpdateInventory,
  getDonors,
  getHospitalStats,
  searchHospitals,
} from "../controllers/hospital.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { updateInventoryValidator, paginationValidator } from "../validators/index.js";

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────
// GET /api/hospitals/search?bloodGroup=O+&city=Karachi
router.get("/search", searchHospitals);

// ─── Protected hospital_admin routes ─────────────────────────────────────────
router.use(protect, authorize("hospital_admin"));

// GET  /api/hospitals/profile
router.get("/profile", getProfile);

// PUT  /api/hospitals/profile
router.put("/profile", updateProfile);

// GET  /api/hospitals/inventory
router.get("/inventory", getInventory);

// PATCH /api/hospitals/inventory  body: { bloodGroup, units }
router.patch("/inventory", updateInventoryValidator, updateInventory);

// PATCH /api/hospitals/inventory/bulk  body: { inventory: [{bloodGroup, units}] }
router.patch("/inventory/bulk", bulkUpdateInventory);

// GET  /api/hospitals/donors?bloodGroup=O+&availability=true&city=Karachi
router.get("/donors", paginationValidator, getDonors);

// GET  /api/hospitals/stats
router.get("/stats", getHospitalStats);

export default router;
