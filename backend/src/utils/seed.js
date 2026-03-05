/**
 * BloodLink Database Seeder
 * Run: npm run seed
 *
 * FIX: Use .create() for each document — insertMany() bypasses Mongoose
 * pre-save hooks so passwords are stored as plain text → bcrypt.compare()
 * always fails → "Invalid credentials"
 */

import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import BloodRequest from "../models/BloodRequest.js";
import DonationHistory from "../models/DonationHistory.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      BloodRequest.deleteMany({}),
      DonationHistory.deleteMany({}),
    ]);
    console.log("🗑️  Cleared all collections");

    // ── Main Admin ── (.create() triggers pre-save → bcrypt hashes password)
    const mainAdmin = await User.create({
      name: "Super Admin",
      email: "admin@bloodlink.pk",
      password: "Admin@123",
      role: "main_admin",
      bloodGroup: "O+",
      status: "active",
    });
    console.log("✅ Main admin:", mainAdmin.email);

    // ── Hospitals ── (individual .create() — NOT insertMany, which skips hooks)
    const h1 = await Hospital.create({
      name: "City General Hospital",
      email: "citygen@bloodlink.pk",
      password: "Hospital@123",
      licenseNumber: "LIC-CGH-2041",
      contact: { phone: "+92-21-34567890", website: "https://citygen.pk" },
      location: { address: "M.A. Jinnah Road", city: "Karachi", country: "Pakistan" },
      status: "approved",
      approvedBy: mainAdmin._id,
      approvedAt: new Date(),
      bloodInventory: [
        { bloodGroup: "A+", units: 12 }, { bloodGroup: "A-", units: 3 },
        { bloodGroup: "B+", units: 18 }, { bloodGroup: "B-", units: 2 },
        { bloodGroup: "O+", units: 25 }, { bloodGroup: "O-", units: 5 },
        { bloodGroup: "AB+", units: 8 }, { bloodGroup: "AB-", units: 1 },
      ],
    });

    const h2 = await Hospital.create({
      name: "Shifa International Hospital",
      email: "shifa@bloodlink.pk",
      password: "Hospital@123",
      licenseNumber: "LIC-SIH-3082",
      contact: { phone: "+92-51-8463000" },
      location: { address: "H-8/4 Pitras Bukhari Road", city: "Islamabad", country: "Pakistan" },
      status: "approved",
      approvedBy: mainAdmin._id,
      approvedAt: new Date(),
      bloodInventory: [
        { bloodGroup: "A+", units: 7 },  { bloodGroup: "A-", units: 1 },
        { bloodGroup: "B+", units: 14 }, { bloodGroup: "B-", units: 4 },
        { bloodGroup: "O+", units: 19 }, { bloodGroup: "O-", units: 2 },
        { bloodGroup: "AB+", units: 5 }, { bloodGroup: "AB-", units: 3 },
      ],
    });

    const h3 = await Hospital.create({
      name: "Aga Khan University Hospital",
      email: "akuh@bloodlink.pk",
      password: "Hospital@123",
      licenseNumber: "LIC-AKUH-5541",
      contact: { phone: "+92-21-34930051" },
      location: { address: "Stadium Road", city: "Karachi", country: "Pakistan" },
      status: "pending",
    });

    console.log("✅ 3 hospitals created");

    // ── Users ── (individual .create() — NOT insertMany)
    const ali = await User.create({
      name: "Ali Hassan", email: "ali@bloodlink.pk", password: "User@123",
      role: "donor", bloodGroup: "O+", phone: "+92-300-1234567",
      location: { city: "Karachi" }, availability: true,
      totalDonations: 3, lastDonation: new Date("2025-10-01"),
    });
    const sara = await User.create({
      name: "Sara Khan", email: "sara@bloodlink.pk", password: "User@123",
      role: "receiver", bloodGroup: "A+", phone: "+92-321-9876543",
      location: { city: "Karachi" },
    });
    const ahmed = await User.create({
      name: "Ahmed Raza", email: "ahmed@bloodlink.pk", password: "User@123",
      role: "donor", bloodGroup: "B-", phone: "+92-333-5554444",
      location: { city: "Islamabad" }, availability: true, totalDonations: 1,
    });
    const fatima = await User.create({
      name: "Fatima Malik", email: "fatima@bloodlink.pk", password: "User@123",
      role: "donor", bloodGroup: "AB+", location: { city: "Lahore" }, availability: false,
    });
    const zaid = await User.create({
      name: "Zaid Hussain", email: "zaid@bloodlink.pk", password: "User@123",
      role: "receiver", bloodGroup: "O-", phone: "+92-312-1112222",
      location: { city: "Islamabad" },
    });
    console.log("✅ 5 users created");

    // ── Blood Requests ── (no passwords, insertMany is fine)
    const requests = await BloodRequest.insertMany([
      { requester: sara._id, hospital: h1._id, bloodGroup: "A+", units: 1, urgency: "high", status: "pending", reason: "Surgery scheduled" },
      { requester: zaid._id, hospital: h2._id, bloodGroup: "O-", units: 2, urgency: "critical", status: "accepted", respondedBy: h2._id, respondedAt: new Date(), patientName: "Zaid Hussain" },
      { requester: sara._id, hospital: h1._id, bloodGroup: "A+", units: 1, urgency: "medium", status: "rejected", respondedBy: h1._id, respondedAt: new Date(Date.now() - 86400000), rejectionReason: "Insufficient stock at time of request" },
    ]);
    console.log(`✅ ${requests.length} blood requests created`);

    // ── Donation History ──
    await DonationHistory.insertMany([
      { donor: ali._id,   hospital: h1._id, bloodGroup: "O+", units: 1, donatedAt: new Date("2025-10-01") },
      { donor: ali._id,   hospital: h2._id, bloodGroup: "O+", units: 1, donatedAt: new Date("2025-06-15") },
      { donor: ahmed._id, hospital: h2._id, bloodGroup: "B-", units: 1, donatedAt: new Date("2025-09-20") },
    ]);
    console.log("✅ Donation history seeded");

    console.log("\n🌱 Seeded successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Credentials:");
    console.log("  admin@bloodlink.pk   | Admin@123    | loginAs: user     (main_admin)");
    console.log("  citygen@bloodlink.pk | Hospital@123 | loginAs: hospital (approved)");
    console.log("  shifa@bloodlink.pk   | Hospital@123 | loginAs: hospital (approved)");
    console.log("  akuh@bloodlink.pk    | Hospital@123 | loginAs: hospital (pending — blocked)");
    console.log("  ali@bloodlink.pk     | User@123     | loginAs: user     (donor)");
    console.log("  sara@bloodlink.pk    | User@123     | loginAs: user     (receiver)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seed();