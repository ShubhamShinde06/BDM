import mongoose from "mongoose";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const URGENCY_LEVELS = ["low", "medium", "high", "critical"];
const STATUSES = ["pending", "accepted", "rejected", "completed", "cancelled"];

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester is required"],
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital is required"],
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, "Blood group is required"],
    },
    units: {
      type: Number,
      min: [1, "At least 1 unit required"],
      max: [10, "Cannot request more than 10 units at once"],
      default: 1,
    },
    urgency: {
      type: String,
      enum: URGENCY_LEVELS,
      default: "medium",
    },
    status: {
      type: String,
      enum: STATUSES,
      default: "pending",
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, "Reason too long"],
    },
    patientName: {
      type: String,
      trim: true,
    },
    // Hospital response
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    // Donor assigned (if any)
    assignedDonor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Notification flags
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
bloodRequestSchema.index({ requester: 1, status: 1 });
bloodRequestSchema.index({ hospital: 1, status: 1 });
bloodRequestSchema.index({ bloodGroup: 1, status: 1 });
bloodRequestSchema.index({ urgency: 1, status: 1, createdAt: -1 });
bloodRequestSchema.index({ createdAt: -1 });

// ─── Virtual: response time ───────────────────────────────────────────────────
bloodRequestSchema.virtual("responseTime").get(function () {
  if (!this.respondedAt) return null;
  return Math.round((this.respondedAt - this.createdAt) / (1000 * 60)); // minutes
});

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);
export default BloodRequest;
