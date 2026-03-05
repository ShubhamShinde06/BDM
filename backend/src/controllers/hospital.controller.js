import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import DonationHistory from "../models/DonationHistory.js";
import Notification from "../models/Notification.js";
import { asyncHandler, ApiError } from "../middleware/error.js";
import { emitToRoom } from "../sockets/emitter.js";

// ─── @route  GET /api/hospital/profile ───────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.user._id).select("-password -refreshToken");
  return res.status(200).json({ success: true, data: hospital });
});

// ─── @route  PUT /api/hospital/profile ───────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "contact", "location"];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const hospital = await Hospital.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
    select: "-password -refreshToken",
  });

  return res.status(200).json({ success: true, data: hospital });
});

// ─── @route  GET /api/hospital/inventory ─────────────────────────────────────
export const getInventory = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.user._id).select("bloodInventory name");
  return res.status(200).json({ success: true, data: hospital.bloodInventory });
});

// ─── @route  PATCH /api/hospital/inventory ───────────────────────────────────
export const updateInventory = asyncHandler(async (req, res) => {
  const { bloodGroup, units } = req.body;

  const hospital = await Hospital.findById(req.user._id);

  const item = hospital.bloodInventory.find((b) => b.bloodGroup === bloodGroup);
  if (!item) throw new ApiError(`Blood group ${bloodGroup} not found`, 404);

  const previousUnits = item.units;
  item.units = units;
  item.lastUpdated = new Date();
  await hospital.save();

  // Emit real-time inventory update to the global room
  emitToRoom("inventory_updates", "inventory_changed", {
    hospitalId: hospital._id,
    hospitalName: hospital.name,
    bloodGroup,
    newUnits: units,
    delta: units - previousUnits,
  });

  // Low stock alert
  if (units <= 3 && previousUnits > 3) {
    const adminNotif = await Notification.create({
      recipient: hospital._id,
      recipientModel: "Hospital",
      type: "low_stock_alert",
      title: `⚠️ Low Stock: ${bloodGroup}`,
      message: `${bloodGroup} blood supply is critically low (${units} units remaining).`,
      data: { bloodGroup, units },
    });
    emitToRoom("admin_room", "low_stock_alert", adminNotif);
  }

  return res.status(200).json({
    success: true,
    message: `${bloodGroup} inventory updated to ${units} units`,
    data: { bloodGroup, units },
  });
});

// ─── @route  PATCH /api/hospital/inventory/bulk ──────────────────────────────
export const bulkUpdateInventory = asyncHandler(async (req, res) => {
  const { inventory } = req.body; // [{ bloodGroup, units }]
  if (!Array.isArray(inventory)) throw new ApiError("inventory must be an array", 400);

  const hospital = await Hospital.findById(req.user._id);

  inventory.forEach(({ bloodGroup, units }) => {
    const item = hospital.bloodInventory.find((b) => b.bloodGroup === bloodGroup);
    if (item) {
      item.units = Math.max(0, units);
      item.lastUpdated = new Date();
    }
  });

  await hospital.save();

  emitToRoom("inventory_updates", "inventory_bulk_updated", {
    hospitalId: hospital._id,
    hospitalName: hospital.name,
    inventory: hospital.bloodInventory,
  });

  return res.status(200).json({ success: true, data: hospital.bloodInventory });
});

// ─── @route  GET /api/hospital/donors ────────────────────────────────────────
export const getDonors = asyncHandler(async (req, res) => {
  const { bloodGroup, availability, city, page = 1, limit = 20 } = req.query;

  const filter = { role: "donor", status: "active" };
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (availability !== undefined) filter.availability = availability === "true";
  if (city) filter["location.city"] = new RegExp(city, "i");

  const [donors, total] = await Promise.all([
    User.find(filter)
      .select("name email bloodGroup location phone availability totalDonations lastDonation isOnline")
      .sort({ availability: -1, totalDonations: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return res.status(200).json({ success: true, total, data: donors });
});

// ─── @route  GET /api/hospital/stats ─────────────────────────────────────────
export const getHospitalStats = asyncHandler(async (req, res) => {
  const BloodRequest = (await import("../models/BloodRequest.js")).default;

  const [totalRequests, acceptedRequests, pendingRequests, totalDonations] = await Promise.all([
    BloodRequest.countDocuments({ hospital: req.user._id }),
    BloodRequest.countDocuments({ hospital: req.user._id, status: "accepted" }),
    BloodRequest.countDocuments({ hospital: req.user._id, status: "pending" }),
    DonationHistory.countDocuments({ hospital: req.user._id }),
  ]);

  const hospital = await Hospital.findById(req.user._id).select("bloodInventory");
  const totalUnits = hospital.bloodInventory.reduce((s, b) => s + b.units, 0);
  const criticalGroups = hospital.bloodInventory
    .filter((b) => b.units <= 3)
    .map((b) => b.bloodGroup);

  return res.status(200).json({
    success: true,
    data: { totalRequests, acceptedRequests, pendingRequests, totalDonations, totalUnits, criticalGroups },
  });
});

// ─── @route  GET /api/hospitals/search ───────────────────────────────────────
// ─── @access Public - search hospitals by blood group + city
export const searchHospitals = asyncHandler(async (req, res) => {
  const { bloodGroup, city, page = 1, limit = 10 } = req.query;
  if (!bloodGroup) throw new ApiError("bloodGroup is required", 400);

  const filter = {
    status: "approved",
    bloodInventory: {
      $elemMatch: {
        bloodGroup,
        units: { $gt: 0 },
      },
    },
  };

  if (city) filter["location.city"] = new RegExp(city, "i");

  const hospitals = await Hospital.find(filter)
    .select("name location contact bloodInventory")
    .sort({ "location.city": 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Project only requested blood group units for cleaner response
  const result = hospitals.map((h) => {
    const inventory = h.bloodInventory.find((b) => b.bloodGroup === bloodGroup);
    return {
      _id: h._id,
      name: h.name,
      location: h.location,
      contact: h.contact,
      bloodGroup,
      availableUnits: inventory ? inventory.units : 0,
    };
  });

  return res.status(200).json({ success: true, total: result.length, data: result });
});
