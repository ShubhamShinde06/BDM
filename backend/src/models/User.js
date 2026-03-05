import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const ROLES = ["donor", "receiver", "main_admin"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
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
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ROLES,
      default: "donor",
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: function () {
        return this.role !== "main_admin";
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      city: { type: String, trim: true },
      country: { type: String, trim: true, default: "Pakistan" },
      // GeoJSON for future location-based queries
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },
    availability: {
      type: Boolean,
      default: true, // donors: available to donate
    },
    status: {
      type: String,
      enum: ["active", "blocked", "pending"],
      default: "active",
    },
    lastDonation: {
      type: Date,
      default: null,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    // Socket.io tracking
    socketId: {
      type: String,
      default: null,
    },
    isOnline: {
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

// ─── Index for geo-based search ───────────────────────────────────────────────
userSchema.index({ "location.coordinates": "2dsphere" });
userSchema.index({ bloodGroup: 1, "location.city": 1 });
userSchema.index({ role: 1, status: 1 });

// ─── Virtual: next eligible donation date (56 days after last) ───────────────
userSchema.virtual("nextEligibleDate").get(function () {
  if (!this.lastDonation) return null;
  const next = new Date(this.lastDonation);
  next.setDate(next.getDate() + 56);
  return next;
});

// ─── Pre-save: Hash password ─────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ─── Instance method: compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: is eligible to donate ──────────────────────────────────
userSchema.methods.isEligibleToDonate = function () {
  if (!this.lastDonation) return true;
  const daysSince = (Date.now() - new Date(this.lastDonation)) / (1000 * 60 * 60 * 24);
  return daysSince >= 56;
};

const User = mongoose.model("User", userSchema);
export default User;
