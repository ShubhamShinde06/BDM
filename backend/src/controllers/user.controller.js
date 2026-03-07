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

// ─── @route  PATCH /api/users/commit-donation/:requestId ─────────────────────
// ─── @access Private (donor only)
// Donor clicks "I'm Coming" — locks the request and notifies the hospital
export const commitToDonate = asyncHandler(async (req, res) => {
  const { estimatedArrival = 30, note = "" } = req.body;

  const request = await BloodRequest.findById(req.params.requestId)
    .populate("hospital", "name location contact")
    .populate("requester", "name");

  if (!request) throw new ApiError("Request not found", 404);
  if (request.bloodGroup !== req.user.bloodGroup)
    throw new ApiError("Your blood group does not match this request", 400);
  if (request.status !== "pending")
    throw new ApiError(`Request is already ${request.status} — no longer available`, 400);
  if (!req.user.isEligibleToDonate?.())
    throw new ApiError("You are not eligible to donate yet (56-day cooldown)", 400);

  // Lock the request to this donor
  request.status = "donor_committed";
  request.committedDonor = req.user._id;
  request.committedAt = new Date();
  request.estimatedArrival = estimatedArrival;
  request.commitNote = note;
  await request.save();

  // ── Notifications ──────────────────────────────────────────────────────────
  const { emitToUser, emitToRoom, broadcastToRole } = await import("../sockets/emitter.js");
  const Notification = (await import("../models/Notification.js")).default;
  const Hospital = (await import("../models/Hospital.js")).default;

  // 1. Notify the hospital
  const hospitalNotif = await Notification.create({
    recipient: request.hospital._id,
    recipientModel: "Hospital",
    type: "donor_coming",
    title: "Donor On The Way 🩸",
    message: `${req.user.name} (${req.user.bloodGroup}) committed to donate. ETA: ${estimatedArrival} min.`,
    data: { requestId: request._id, donorId: req.user._id, estimatedArrival },
  });
  emitToUser(request.hospital._id.toString(), "donor_committed", {
    notification: hospitalNotif,
    request: { _id: request._id, bloodGroup: request.bloodGroup, units: request.units },
    donor: { _id: req.user._id, name: req.user.name, bloodGroup: req.user.bloodGroup, phone: req.user.phone },
    estimatedArrival,
    note,
  });

  // 2. Notify the patient (requester)
  const patientNotif = await Notification.create({
    recipient: request.requester._id,
    recipientModel: "User",
    type: "donor_coming",
    title: "Donor is Coming! 🎉",
    message: `A donor with ${req.user.bloodGroup} blood is on their way. ETA: ${estimatedArrival} min.`,
    data: { requestId: request._id },
  });
  emitToUser(request.requester._id.toString(), "donor_committed", {
    notification: patientNotif,
    estimatedArrival,
  });

  // 3. Notify admins
  emitToRoom("admin_room", "donor_committed", {
    donorName: req.user.name,
    requestId: request._id,
    hospitalName: request.hospital.name,
  });

  return res.status(200).json({
    success: true,
    message: `Committed! Head to ${request.hospital.name}. They have been notified.`,
    data: {
      requestId: request._id,
      hospital: request.hospital,
      estimatedArrival,
    },
  });
});

// ─── @route  PATCH /api/users/cancel-commit/:requestId ───────────────────────
// ─── @access Private (donor only)
// Donor cancels their commitment — request goes back to pending
export const cancelCommit = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findOne({
    _id: req.params.requestId,
    committedDonor: req.user._id,
    status: "donor_committed",
  }).populate("hospital", "name").populate("requester", "name");

  if (!request) throw new ApiError("No active commitment found for this request", 404);

  // Revert to pending so other donors can step in
  request.status = "pending";
  request.committedDonor = null;
  request.committedAt = null;
  request.estimatedArrival = null;
  request.commitNote = null;
  request.commitCancelled = true;
  await request.save();

  const { emitToUser } = await import("../sockets/emitter.js");
  const Notification = (await import("../models/Notification.js")).default;

  // Notify hospital the donor cancelled
  const notif = await Notification.create({
    recipient: request.hospital._id,
    recipientModel: "Hospital",
    type: "donor_cancelled",
    title: "Donor Cancelled ⚠️",
    message: `${req.user.name} cancelled their commitment. Request is open again.`,
    data: { requestId: request._id },
  });
  emitToUser(request.hospital._id.toString(), "donor_cancel_commit", {
    notification: notif,
    requestId: request._id,
  });

  return res.status(200).json({
    success: true,
    message: "Commitment cancelled. The request is open again for other donors.",
  });
});

// ─── @route  GET /api/users/my-commits ───────────────────────────────────────
// ─── @access Private (donor only)
// Get donor's active commitments
export const getMyCommits = asyncHandler(async (req, res) => {
  const commits = await BloodRequest.find({
    committedDonor: req.user._id,
    status: "donor_committed",
  })
    .populate("hospital", "name location contact")
    .populate("requester", "name bloodGroup")
    .sort({ committedAt: -1 });

  return res.status(200).json({ success: true, data: commits });
});