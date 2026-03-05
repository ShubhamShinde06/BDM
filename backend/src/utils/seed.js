/**
 * BloodLink Database Seeder
 * Run: npm run seed
 * Clears existing data and seeds fresh test data
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

    // ─── Clear all collections ──────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      BloodRequest.deleteMany({}),
      DonationHistory.deleteMany({}),
    ]);
    console.log("🗑️  Cleared all collections");

    // ─── Main Admin ─────────────────────────────────────────────────────────
    const mainAdmin = await User.create({
      name: "Super Admin",
      email: "admin@bloodlink.pk",
      password: "Admin@123",
      role: "main_admin",
      bloodGroup: "O+",
      status: "active",
    });
    console.log("✅ Main admin created:", mainAdmin.email);

    // ─── Hospitals ──────────────────────────────────────────────────────────
    const hospitals = await Hospital.insertMany([
      {
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
          { bloodGroup: "A+", units: 12 },
          { bloodGroup: "A-", units: 3 },
          { bloodGroup: "B+", units: 18 },
          { bloodGroup: "B-", units: 2 },
          { bloodGroup: "O+", units: 25 },
          { bloodGroup: "O-", units: 5 },
          { bloodGroup: "AB+", units: 8 },
          { bloodGroup: "AB-", units: 1 },
        ],
      },
      {
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
          { bloodGroup: "A+", units: 7 },
          { bloodGroup: "A-", units: 1 },
          { bloodGroup: "B+", units: 14 },
          { bloodGroup: "B-", units: 4 },
          { bloodGroup: "O+", units: 19 },
          { bloodGroup: "O-", units: 2 },
          { bloodGroup: "AB+", units: 5 },
          { bloodGroup: "AB-", units: 3 },
        ],
      },
      {
        name: "Aga Khan University Hospital",
        email: "akuh@bloodlink.pk",
        password: "Hospital@123",
        licenseNumber: "LIC-AKUH-5541",
        contact: { phone: "+92-21-34930051" },
        location: { address: "Stadium Road", city: "Karachi", country: "Pakistan" },
        status: "pending", // Awaiting approval
      },
    ]);
    console.log(`✅ ${hospitals.length} hospitals created`);

    // ─── Users ───────────────────────────────────────────────────────────────
    const users = await User.insertMany([
      {
        name: "Ali Hassan",
        email: "ali@bloodlink.pk",
        password: "User@123",
        role: "donor",
        bloodGroup: "O+",
        phone: "+92-300-1234567",
        location: { city: "Karachi" },
        availability: true,
        totalDonations: 3,
        lastDonation: new Date("2025-10-01"),
      },
      {
        name: "Sara Khan",
        email: "sara@bloodlink.pk",
        password: "User@123",
        role: "receiver",
        bloodGroup: "A+",
        phone: "+92-321-9876543",
        location: { city: "Karachi" },
      },
      {
        name: "Ahmed Raza",
        email: "ahmed@bloodlink.pk",
        password: "User@123",
        role: "donor",
        bloodGroup: "B-",
        phone: "+92-333-5554444",
        location: { city: "Islamabad" },
        availability: true,
        totalDonations: 1,
      },
      {
        name: "Fatima Malik",
        email: "fatima@bloodlink.pk",
        password: "User@123",
        role: "donor",
        bloodGroup: "AB+",
        location: { city: "Lahore" },
        availability: false,
        status: "active",
      },
      {
        name: "Zaid Hussain",
        email: "zaid@bloodlink.pk",
        password: "User@123",
        role: "receiver",
        bloodGroup: "O-",
        phone: "+92-312-1112222",
        location: { city: "Islamabad" },
      },
    ]);
    console.log(`✅ ${users.length} users created`);

    // ─── Blood Requests ───────────────────────────────────────────────────────
    const sara = users.find((u) => u.name === "Sara Khan");
    const zaid = users.find((u) => u.name === "Zaid Hussain");
    const hospital1 = hospitals[0];
    const hospital2 = hospitals[1];

    const requests = await BloodRequest.insertMany([
      {
        requester: sara._id,
        hospital: hospital1._id,
        bloodGroup: "A+",
        units: 1,
        urgency: "high",
        status: "pending",
        reason: "Surgery scheduled",
      },
      {
        requester: zaid._id,
        hospital: hospital2._id,
        bloodGroup: "O-",
        units: 2,
        urgency: "critical",
        status: "accepted",
        respondedBy: hospital2._id,
        respondedAt: new Date(),
        patientName: "Zaid Hussain",
      },
      {
        requester: sara._id,
        hospital: hospital1._id,
        bloodGroup: "A+",
        units: 1,
        urgency: "medium",
        status: "rejected",
        respondedBy: hospital1._id,
        respondedAt: new Date(Date.now() - 86400000),
        rejectionReason: "Insufficient stock at time of request",
      },
    ]);
    console.log(`✅ ${requests.length} blood requests created`);

    // ─── Donation History ─────────────────────────────────────────────────────
    const ali = users.find((u) => u.name === "Ali Hassan");
    const ahmed = users.find((u) => u.name === "Ahmed Raza");

    await DonationHistory.insertMany([
      {
        donor: ali._id,
        hospital: hospital1._id,
        bloodGroup: "O+",
        units: 1,
        donatedAt: new Date("2025-10-01"),
      },
      {
        donor: ali._id,
        hospital: hospital2._id,
        bloodGroup: "O+",
        units: 1,
        donatedAt: new Date("2025-06-15"),
      },
      {
        donor: ahmed._id,
        hospital: hospital2._id,
        bloodGroup: "B-",
        units: 1,
        donatedAt: new Date("2025-09-20"),
      },
    ]);
    console.log("✅ Donation history seeded");

    console.log("\n🌱 Database seeded successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Test credentials:");
    console.log("  Main Admin:    admin@bloodlink.pk  / Admin@123");
    console.log("  Hospital 1:    citygen@bloodlink.pk / Hospital@123  (approved)");
    console.log("  Hospital 2:    shifa@bloodlink.pk   / Hospital@123  (approved)");
    console.log("  Hospital 3:    akuh@bloodlink.pk    / Hospital@123  (pending)");
    console.log("  Donor:         ali@bloodlink.pk     / User@123");
    console.log("  Receiver:      sara@bloodlink.pk    / User@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
