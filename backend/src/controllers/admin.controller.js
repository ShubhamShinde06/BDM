import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import BloodRequest from "../models/BloodRequest.js";
import DonationHistory from "../models/DonationHistory.js";
import Notification from "../models/Notification.js";
import { asyncHandler, ApiError } from "../middleware/error.js";
import { emitToUser } from "../sockets/emitter.js";

// ─── @route  GET /api/admin/dashboard ────────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalHospitals,
    pendingHospitals,
    totalRequests,
    pendingRequests,
    totalDonations,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: "main_admin" } }),
    Hospital.countDocuments(),
    Hospital.countDocuments({ status: "pending" }),
    BloodRequest.countDocuments(),
    BloodRequest.countDocuments({ status: "pending" }),
    DonationHistory.countDocuments(),
  ]);

  // Blood units across all approved hospitals
  const inventoryAgg = await Hospital.aggregate([
    { $match: { status: "approved" } },
    { $unwind: "$bloodInventory" },
    {
      $group: {
        _id: "$bloodInventory.bloodGroup",
        totalUnits: { $sum: "$bloodInventory.units" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const availableUnits = inventoryAgg.reduce((sum, b) => sum + b.totalUnits, 0);
  const bloodAvailability = inventoryAgg.reduce((acc, b) => {
    acc[b._id] = b.totalUnits;
    return acc;
  }, {});

  // Monthly stats (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyDonations = await DonationHistory.aggregate([
    { $match: { donatedAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$donatedAt" }, month: { $month: "$donatedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthlyRequests = await BloodRequest.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return res.status(200).json({
    success: true,
    data: {
      stats: { totalUsers, totalHospitals, pendingHospitals, totalRequests, pendingRequests, totalDonations, availableUnits },
      bloodAvailability,
      monthlyDonations,
      monthlyRequests,
    },
  });
});

// ─── @route  GET /api/admin/hospitals ────────────────────────────────────────
export const getAllHospitals = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};

  const [hospitals, total] = await Promise.all([
    Hospital.find(filter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    Hospital.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: hospitals,
  });
});

// ─── @route  PATCH /api/admin/hospitals/:id/status ───────────────────────────
export const updateHospitalStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const hospital = await Hospital.findById(id);
  if (!hospital) throw new ApiError("Hospital not found", 404);

  hospital.status = status;
  if (status === "approved") {
    hospital.approvedBy = req.user._id;
    hospital.approvedAt = new Date();
  }
  await hospital.save({ validateBeforeSave: false });

  // Notify hospital via socket + DB
  const notifType = status === "approved" ? "hospital_approved" : "hospital_rejected";
  const notif = await Notification.create({
    recipient: hospital._id,
    recipientModel: "Hospital",
    type: notifType,
    title: status === "approved" ? "Registration Approved! 🎉" : "Registration Rejected",
    message:
      status === "approved"
        ? "Your hospital has been approved. You can now manage blood inventory and respond to requests."
        : "Your hospital registration was rejected. Please contact support.",
    data: { hospitalId: id, status },
  });

  // Real-time socket notification
  emitToUser(hospital._id.toString(), "notification", notif);

  return res.status(200).json({
    success: true,
    message: `Hospital ${status} successfully`,
    data: hospital,
  });
});

// ─── @route  GET /api/admin/users ────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, bloodGroup, page = 1, limit = 20 } = req.query;

  const filter = { role: { $ne: "main_admin" } };
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (bloodGroup) filter.bloodGroup = bloodGroup;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: users,
  });
});

// ─── @route  PATCH /api/admin/users/:id/block ────────────────────────────────
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError("User not found", 404);
  if (user.role === "main_admin") throw new ApiError("Cannot block admin", 403);

  user.status = user.status === "blocked" ? "active" : "blocked";
  await user.save({ validateBeforeSave: false });

  // Disconnect their socket if blocked
  if (user.status === "blocked") {
    emitToUser(user._id.toString(), "force_logout", { reason: "Account blocked by admin" });
  }

  return res.status(200).json({
    success: true,
    message: `User ${user.status === "blocked" ? "blocked" : "unblocked"}`,
    data: { id: user._id, status: user.status },
  });
});

// ─── @route  DELETE /api/admin/users/:id ─────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError("User not found", 404);
  if (user.role === "main_admin") throw new ApiError("Cannot delete admin", 403);

  await User.findByIdAndDelete(req.params.id);

  return res.status(200).json({ success: true, message: "User deleted" });
});

// ─── @route  GET /api/admin/requests ─────────────────────────────────────────
export const getAllRequests = asyncHandler(async (req, res) => {
  const { status, bloodGroup, urgency, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (urgency) filter.urgency = urgency;

  const [requests, total] = await Promise.all([
    BloodRequest.find(filter)
      .populate("requester", "name email bloodGroup location")
      .populate("hospital", "name location contact")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    BloodRequest.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: requests,
  });
});
