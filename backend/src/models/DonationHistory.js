import mongoose from "mongoose";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const donationHistorySchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      default: null, // null = walk-in donation
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    units: {
      type: Number,
      default: 1,
      min: 1,
    },
    donatedAt: {
      type: Date,
      default: Date.now,
    },
    certificateId: {
      type: String,
      unique: true,
      default: () => `BL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

donationHistorySchema.index({ donor: 1, donatedAt: -1 });
donationHistorySchema.index({ hospital: 1, donatedAt: -1 });

const DonationHistory = mongoose.model("DonationHistory", donationHistorySchema);
export default DonationHistory;
