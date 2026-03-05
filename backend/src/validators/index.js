import { body, param, query, validationResult } from "express-validator";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

/**
 * Run validation and return 422 if errors exist
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth validators ──────────────────────────────────────────────────────────
export const registerUserValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 100 }),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["donor", "receiver"]).withMessage("Role must be donor or receiver"),
  body("bloodGroup").isIn(BLOOD_GROUPS).withMessage("Invalid blood group"),
  body("phone").optional().trim(),
  body("location.city").optional().trim(),
  validate,
];

export const registerHospitalValidator = [
  body("name").trim().notEmpty().withMessage("Hospital name required").isLength({ max: 150 }),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("licenseNumber").trim().notEmpty().withMessage("License number required"),
  body("contact.phone").optional().trim(),
  body("location.city").optional().trim(),
  body("location.address").optional().trim(),
  validate,
];

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password required"),
  validate,
];

// ─── Blood request validators ─────────────────────────────────────────────────
export const bloodRequestValidator = [
  body("hospital").isMongoId().withMessage("Valid hospital ID required"),
  body("bloodGroup").isIn(BLOOD_GROUPS).withMessage("Invalid blood group"),
  body("units").optional().isInt({ min: 1, max: 10 }).withMessage("Units must be 1-10"),
  body("urgency").optional().isIn(["low", "medium", "high", "critical"]),
  body("reason").optional().trim().isLength({ max: 500 }),
  body("patientName").optional().trim(),
  validate,
];

export const respondRequestValidator = [
  param("id").isMongoId().withMessage("Valid request ID required"),
  body("status").isIn(["accepted", "rejected"]).withMessage("Status must be accepted or rejected"),
  body("rejectionReason").optional().trim().isLength({ max: 300 }),
  validate,
];

// ─── Inventory validator ──────────────────────────────────────────────────────
export const updateInventoryValidator = [
  body("bloodGroup").isIn(BLOOD_GROUPS).withMessage("Invalid blood group"),
  body("units").isInt({ min: 0 }).withMessage("Units must be 0 or greater"),
  validate,
];

// ─── Hospital status validator ────────────────────────────────────────────────
export const hospitalStatusValidator = [
  param("id").isMongoId().withMessage("Valid hospital ID required"),
  body("status").isIn(["approved", "rejected", "suspended"]).withMessage("Invalid status"),
  validate,
];

// ─── Pagination ───────────────────────────────────────────────────────────────
export const paginationValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  validate,
];
