import User from "../models/User.js";
import DonationHistory from "../models/DonationHistory.js";
import Notification from "../models/Notification.js";
import BloodRequest from "../models/BloodRequest.js";
import { asyncHandler, ApiError } from "../middleware/error.js";

// ─── @route  GET /api/users/profile ──────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  return res.status(200).json({ success: true, data: user });
});

// ─── @route  PUT /api/users/profile ──────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "location"];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
    select: "-password -refreshToken",
  });

  return res.status(200).json({ success: true, data: user });
});

// ─── @route  PATCH /api/users/availability ───────────────────────────────────
export const toggleAvailability = asyncHandler(async (req, res) => {
  if (req.user.role !== "donor") throw new ApiError("Only donors can update availability", 403);

  // Cannot be available if donated within 56 days
  if (!req.user.isEligibleToDonate() && req.body.available === true) {
    throw new ApiError(
      `Not eligible to donate yet. Next eligible date: ${req.user.nextEligibleDate?.toDateString()}`,
      400
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { availability: req.body.available !== undefined ? req.body.available : !req.user.availability },
    { new: true, select: "availability name" }
  );

  return res.status(200).json({
    success: true,
    message: `You are now ${user.availability ? "available" : "unavailable"} to donate`,
    data: { availability: user.availability },
  });
});

// ─── @route  GET /api/users/donation-history ─────────────────────────────────
export const getDonationHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const [history, total] = await Promise.all([
    DonationHistory.find({ donor: req.user._id })
      .populate("hospital", "name location")
      .sort({ donatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    DonationHistory.countDocuments({ donor: req.user._id }),
  ]);

  return res.status(200).json({ success: true, total, data: history });
});

// ─── @route  GET /api/users/nearby-requests ──────────────────────────────────
// ─── @access Private (donor) - see pending requests matching their blood group
export const getNearbyRequests = asyncHandler(async (req, res) => {
  const { city, page = 1, limit = 10 } = req.query;

  const filter = {
    bloodGroup: req.user.bloodGroup,
    status: "pending",
  };

  const requests = await BloodRequest.find(filter)
    .populate({
      path: "hospital",
      select: "name location contact",
      match: city ? { "location.city": new RegExp(city, "i") } : {},
    })
    .sort({ urgency: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const filtered = requests.filter((r) => r.hospital !== null);

  return res.status(200).json({ success: true, total: filtered.length, data: filtered });
});

// ─── @route  GET /api/users/stats ────────────────────────────────────────────
export const getUserStats = asyncHandler(async (req, res) => {
  const [totalDonations, pendingRequests, completedRequests] = await Promise.all([
    DonationHistory.countDocuments({ donor: req.user._id }),
    BloodRequest.countDocuments({ requester: req.user._id, status: "pending" }),
    BloodRequest.countDocuments({ requester: req.user._id, status: "completed" }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      totalDonations,
      pendingRequests,
      completedRequests,
      isEligible: req.user.isEligibleToDonate?.() ?? true,
      nextEligibleDate: req.user.nextEligibleDate,
      lastDonation: req.user.lastDonation,
    },
  });
});

// ─── @route  GET /api/users/notifications ────────────────────────────────────
export const getNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, page = 1, limit = 20 } = req.query;
  const filter = { recipient: req.user._id, recipientModel: "User" };
  if (unreadOnly === "true") filter.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    Notification.countDocuments({ recipient: req.user._id, recipientModel: "User", isRead: false }),
  ]);

  return res.status(200).json({ success: true, unreadCount, data: notifications });
});

// ─── @route  PATCH /api/users/notifications/:id/read ────────────────────────
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });
  if (!notif) throw new ApiError("Notification not found", 404);

  await notif.markRead();
  return res.status(200).json({ success: true, message: "Marked as read" });
});

// ─── @route  PATCH /api/users/notifications/read-all ────────────────────────
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return res.status(200).json({ success: true, message: "All notifications marked as read" });
});
