import { Router } from "express";
import {
  createRequest,
  getMyRequests,
  getHospitalRequests,
  respondToRequest,
  completeRequest,
  cancelRequest,
} from "../controllers/request.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  bloodRequestValidator,
  respondRequestValidator,
  paginationValidator,
} from "../validators/index.js";

const router = Router();

router.use(protect);

// POST /api/requests  — receiver creates a blood request
router.post("/", authorize("receiver"), bloodRequestValidator, createRequest);

// GET  /api/requests/my — receiver sees their own requests
router.get("/my", authorize("receiver"), paginationValidator, getMyRequests);

// PATCH /api/requests/:id/cancel — receiver cancels pending request
router.patch("/:id/cancel", authorize("receiver"), cancelRequest);

// GET  /api/requests/hospital — hospital sees incoming requests
router.get(
  "/hospital",
  authorize("hospital_admin"),
  paginationValidator,
  getHospitalRequests
);

// PATCH /api/requests/:id/respond — hospital accepts or rejects
router.patch(
  "/:id/respond",
  authorize("hospital_admin"),
  respondRequestValidator,
  respondToRequest
);

// PATCH /api/requests/:id/complete — hospital marks donation complete
router.patch("/:id/complete", authorize("hospital_admin"), completeRequest);

export default router;
