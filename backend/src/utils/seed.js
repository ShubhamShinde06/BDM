/**
 * BloodLink Database Seeder (India Version)
 * Run: npm run seed
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
    console.log("🗑️ Cleared all collections");

    // ── Main Admin ──
    // .create() triggers pre-save hook → bcrypt hashes password ✓
    const mainAdmin = await User.create({
      name: "Super Admin",
      email: "admin@bloodlink.in",
      password: "Admin@123",
      role: "main_admin",
      bloodGroup: "O+",
      status: "active",
    });
    console.log("✅ Main admin:", mainAdmin.email);

    // ── Hospitals ──
    // MUST use individual .create() — insertMany() skips pre-save hooks
    // so passwords would be stored as plain text → "Invalid credentials"
    const h1 = await Hospital.create({
      name: "Apollo Hospital",
      email: "apollo@bloodlink.in",
      password: "Hospital@123",
      licenseNumber: "LIC-APOLLO-2041",
      contact: { phone: "+91-22-34567890", website: "https://www.apollohospitals.com" },
      location: { address: "Parel", city: "Mumbai", country: "India" },
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
      name: "AIIMS Delhi",
      email: "aiims@bloodlink.in",
      password: "Hospital@123",
      licenseNumber: "LIC-AIIMS-3082",
      contact: { phone: "+91-11-26588500" },
      location: { address: "Ansari Nagar", city: "Delhi", country: "India" },
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
      name: "Ruby Hall Clinic",
      email: "rubyhall@bloodlink.in",
      password: "Hospital@123",
      licenseNumber: "LIC-RUBY-5541",
      contact: { phone: "+91-20-26123391" },
      location: { address: "Dhole Patil Road", city: "Pune", country: "India" },
      status: "pending",
    });

    console.log("✅ 3 hospitals created");

    // ── Users ──
    // MUST use individual .create() — same reason as hospitals above
    const rahul = await User.create({
      name: "Rahul Sharma",
      email: "rahul@bloodlink.in",
      password: "User@123",
      role: "donor",
      bloodGroup: "O+",
      phone: "+91-9876543210",
      location: { city: "Mumbai" },
      availability: true,
      totalDonations: 3,
      lastDonation: new Date("2025-10-01"),
    });

    const priya = await User.create({
      name: "Priya Verma",
      email: "priya@bloodlink.in",
      password: "User@123",
      role: "receiver",
      bloodGroup: "A+",
      phone: "+91-9876543211",
      location: { city: "Mumbai" },
    });

    const arjun = await User.create({
      name: "Arjun Patel",
      email: "arjun@bloodlink.in",
      password: "User@123",
      role: "donor",
      bloodGroup: "B-",
      phone: "+91-9876543212",
      location: { city: "Delhi" },
      availability: true,
      totalDonations: 1,
    });

    const neha = await User.create({
      name: "Neha Singh",
      email: "neha@bloodlink.in",
      password: "User@123",
      role: "donor",
      bloodGroup: "AB+",
      location: { city: "Pune" },
      availability: false,
    });

    const vikram = await User.create({
      name: "Vikram Joshi",
      email: "vikram@bloodlink.in",
      password: "User@123",
      role: "receiver",
      bloodGroup: "O-",
      phone: "+91-9876543213",
      location: { city: "Delhi" },
    });

    console.log("✅ 5 users created");

    // ── Blood Requests ──
    // BloodRequest has no password field so insertMany is safe here
    const requests = await BloodRequest.insertMany([
      {
        requester: priya._id,
        hospital: h1._id,
        bloodGroup: "A+",
        units: 1,
        urgency: "high",
        status: "pending",
        reason: "Emergency surgery",
      },
      {
        requester: vikram._id,
        hospital: h2._id,
        bloodGroup: "O-",
        units: 2,
        urgency: "critical",
        status: "accepted",
        respondedBy: h2._id,
        respondedAt: new Date(),
        patientName: "Vikram Joshi",
      },
      {
        requester: priya._id,
        hospital: h1._id,
        bloodGroup: "A+",
        units: 1,
        urgency: "medium",
        status: "rejected",
        respondedBy: h1._id,
        respondedAt: new Date(Date.now() - 86400000),
        rejectionReason: "Stock unavailable",
      },
    ]);
    console.log(`✅ ${requests.length} blood requests created`);

    // ── Donation History ──
    await DonationHistory.insertMany([
      { donor: rahul._id, hospital: h1._id, bloodGroup: "O+", units: 1, donatedAt: new Date("2025-10-01") },
      { donor: rahul._id, hospital: h2._id, bloodGroup: "O+", units: 1, donatedAt: new Date("2025-06-15") },
      { donor: arjun._id, hospital: h2._id, bloodGroup: "B-", units: 1, donatedAt: new Date("2025-09-20") },
    ]);
    console.log("✅ Donation history seeded");

    console.log("\n🌱 Seeded successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Credentials:");
    console.log("  admin@bloodlink.in    | Admin@123    | loginAs: user     (main_admin)");
    console.log("  apollo@bloodlink.in   | Hospital@123 | loginAs: hospital (approved)");
    console.log("  aiims@bloodlink.in    | Hospital@123 | loginAs: hospital (approved)");
    console.log("  rubyhall@bloodlink.in | Hospital@123 | loginAs: hospital (pending — blocked)");
    console.log("  rahul@bloodlink.in    | User@123     | loginAs: user     (donor O+)");
    console.log("  priya@bloodlink.in    | User@123     | loginAs: user     (receiver A+)");
    console.log("  arjun@bloodlink.in    | User@123     | loginAs: user     (donor B-)");
    console.log("  vikram@bloodlink.in   | User@123     | loginAs: user     (receiver O-)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seed();