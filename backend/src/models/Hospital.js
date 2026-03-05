import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// ─── Embedded blood inventory sub-schema ─────────────────────────────────────
const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    units: {
      type: Number,
      min: [0, "Units cannot be negative"],
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ─── Hospital schema ──────────────────────────────────────────────────────────
const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      maxlength: [150, "Name too long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Minimum 6 characters"],
      select: false,
    },
    role: {
      type: String,
      default: "hospital_admin",
      immutable: true,
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      trim: true,
    },
    contact: {
      phone: { type: String, trim: true },
      website: { type: String, trim: true },
    },
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, trim: true, default: "Pakistan" },
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    // Embedded blood inventory - no separate collection needed
    bloodInventory: {
      type: [bloodInventorySchema],
      default: () =>
        BLOOD_GROUPS.map((bg) => ({ bloodGroup: bg, units: 0 })),
    },
    // Socket tracking
    socketId: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
hospitalSchema.index({ "location.coordinates": "2dsphere" });
hospitalSchema.index({ status: 1 });
hospitalSchema.index({ "bloodInventory.bloodGroup": 1, "bloodInventory.units": 1 });

// ─── Virtual: total units ─────────────────────────────────────────────────────
hospitalSchema.virtual("totalUnits").get(function () {
  return this.bloodInventory.reduce((sum, item) => sum + item.units, 0);
});

// ─── Pre-save: Hash password ──────────────────────────────────────────────────
hospitalSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ─── Instance: compare password ──────────────────────────────────────────────
hospitalSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance: get units for specific blood group ────────────────────────────
hospitalSchema.methods.getBloodUnits = function (bloodGroup) {
  const item = this.bloodInventory.find((b) => b.bloodGroup === bloodGroup);
  return item ? item.units : 0;
};

// ─── Instance: update blood units ────────────────────────────────────────────
hospitalSchema.methods.updateBloodUnits = function (bloodGroup, delta) {
  const item = this.bloodInventory.find((b) => b.bloodGroup === bloodGroup);
  if (!item) throw new Error(`Blood group ${bloodGroup} not found`);
  if (item.units + delta < 0) throw new Error(`Insufficient ${bloodGroup} units`);
  item.units += delta;
  item.lastUpdated = new Date();
};

const Hospital = mongoose.model("Hospital", hospitalSchema);
export default Hospital;
