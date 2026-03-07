import BloodRequest from "../models/BloodRequest.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import DonationHistory from "../models/DonationHistory.js";
import { asyncHandler, ApiError } from "../middleware/error.js";
import { emitToUser, emitToRoom, broadcastToRole } from "../sockets/emitter.js";

// ─── @route  POST /api/requests ──────────────────────────────────────────────
// ─── @access Private (receiver)
export const createRequest = asyncHandler(async (req, res) => {
  const { hospital, bloodGroup, units = 1, urgency = "medium", reason, patientName } = req.body;

  // Verify hospital exists and is approved
  const hospitalDoc = await Hospital.findOne({ _id: hospital, status: "approved" });
  if (!hospitalDoc) throw new ApiError("Hospital not found or not approved", 404);

  // Check blood availability
  const available = hospitalDoc.getBloodUnits(bloodGroup);
  if (available < units) {
    throw new ApiError(
      `Insufficient ${bloodGroup} blood. Available: ${available} unit(s)`,
      400
    );
  }

  const request = await BloodRequest.create({
    requester: req.user._id,
    hospital,
    bloodGroup,
    units,
    urgency,
    reason,
    patientName,
  });

  const populated = await request.populate([
    { path: "requester", select: "name email bloodGroup location phone" },
    { path: "hospital", select: "name location contact" },
  ]);

  // Notify hospital in real-time
  const notif = await Notification.create({
    recipient: hospital,
    recipientModel: "Hospital",
    type: "request_new",
    title: `New ${urgency.toUpperCase()} Blood Request 🩸`,
    message: `${req.user.name} needs ${units} unit(s) of ${bloodGroup} blood.`,
    data: { requestId: request._id, bloodGroup, units, urgency, requesterName: req.user.name },
  });

  emitToUser(hospital.toString(), "new_blood_request", { request: populated, notification: notif });

  // For critical/high urgency — also notify matching donors nearby
  if (urgency === "critical" || urgency === "high") {
    const matchingDonors = await User.find({
      role: "donor",
      bloodGroup,
      availability: true,
      status: "active",
    }).select("_id name");

    for (const donor of matchingDonors) {
      const donorNotif = await Notification.create({
        recipient: donor._id,
        recipientModel: "User",
        type: "donor_needed",
        title: `Urgent: ${bloodGroup} Blood Needed`,
        message: `${hospitalDoc.name} urgently needs ${bloodGroup} blood. Can you help?`,
        data: { requestId: request._id, hospitalName: hospitalDoc.name, bloodGroup },
      });
      emitToUser(donor._id.toString(), "donor_needed", donorNotif);
    }
  }

  return res.status(201).json({
    success: true,
    message: "Blood request submitted successfully",
    data: populated,
  });
});

// ─── @route  GET /api/requests/my ────────────────────────────────────────────
// ─── @access Private (receiver)
export const getMyRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { requester: req.user._id };
  if (status) filter.status = status;

  const [requests, total] = await Promise.all([
    BloodRequest.find(filter)
      .populate("hospital", "name location contact")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    BloodRequest.countDocuments(filter),
  ]);

  return res.status(200).json({ success: true, total, data: requests });
});

// ─── @route  GET /api/requests/hospital ──────────────────────────────────────
// ─── @access Private (hospital_admin)
export const getHospitalRequests = asyncHandler(async (req, res) => {
  const { status, urgency, page = 1, limit = 20 } = req.query;
  const filter = { hospital: req.user._id };
  if (status) filter.status = status;
  if (urgency) filter.urgency = urgency;

  const [requests, total] = await Promise.all([
    BloodRequest.find(filter)
      .populate("requester", "name email phone bloodGroup location")
      .populate("committedDonor", "name phone bloodGroup location")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    BloodRequest.countDocuments(filter),
  ]);

  return res.status(200).json({ success: true, total, data: requests });
});

// ─── @route  PATCH /api/requests/:id/respond ─────────────────────────────────
// ─── @access Private (hospital_admin)
export const respondToRequest = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  const request = await BloodRequest.findById(req.params.id).populate(
    "requester",
    "name email"
  );

  if (!request) throw new ApiError("Request not found", 404);
  if (request.hospital.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized to respond to this request", 403);
  }
  if (request.status !== "pending" && request.status !== "donor_committed") {
    throw new ApiError(`Request already ${request.status}`, 400);
  }

  if (status === "accepted") {
    // Deduct blood units atomically
    const hospital = await Hospital.findById(req.user._id);
    try {
      hospital.updateBloodUnits(request.bloodGroup, -request.units);
      await hospital.save();
    } catch (err) {
      throw new ApiError(err.message, 400);
    }

    // Emit live inventory update to all connected clients
    emitToRoom("inventory_updates", "inventory_changed", {
      hospitalId: hospital._id,
      bloodGroup: request.bloodGroup,
      newUnits: hospital.getBloodUnits(request.bloodGroup),
    });
  }

  request.status = status;
  request.respondedBy = req.user._id;
  request.respondedAt = new Date();
  if (status === "rejected") request.rejectionReason = rejectionReason;
  await request.save();

  // Notify requester in real-time
  const notifType = status === "accepted" ? "request_accepted" : "request_rejected";
  const notif = await Notification.create({
    recipient: request.requester._id,
    recipientModel: "User",
    type: notifType,
    title: status === "accepted" ? "Request Accepted ✅" : "Request Rejected ❌",
    message:
      status === "accepted"
        ? `Your blood request for ${request.bloodGroup} has been accepted by ${req.user.name}.`
        : `Your blood request was rejected. Reason: ${rejectionReason || "Not specified"}`,
    data: { requestId: request._id, status, bloodGroup: request.bloodGroup },
  });

  emitToUser(request.requester._id.toString(), "request_status_update", {
    requestId: request._id,
    status,
    notification: notif,
  });

  return res.status(200).json({
    success: true,
    message: `Request ${status} successfully`,
    data: request,
  });
});

// ─── @route  PATCH /api/requests/:id/complete ────────────────────────────────
// ─── @access Private (hospital_admin)
export const completeRequest = asyncHandler(async (req, res) => {
  const { donorId } = req.body;

  const request = await BloodRequest.findById(req.params.id);
  if (!request) throw new ApiError("Request not found", 404);
  if (request.status !== "accepted") throw new ApiError("Request must be accepted first", 400);

  request.status = "completed";
  request.completedAt = new Date();
  if (donorId) request.assignedDonor = donorId;
  await request.save();

  // Log donation history
  const donationEntry = await DonationHistory.create({
    donor: donorId || null,
    hospital: req.user._id,
    request: request._id,
    bloodGroup: request.bloodGroup,
    units: request.units,
    donatedAt: new Date(),
  });

  // Update donor stats
  if (donorId) {
    await User.findByIdAndUpdate(donorId, {
      $inc: { totalDonations: 1 },
      lastDonation: new Date(),
      availability: false, // 56-day cooldown
    });

    const donorNotif = await Notification.create({
      recipient: donorId,
      recipientModel: "User",
      type: "donation_complete",
      title: "Donation Recorded 🏆",
      message: `Thank you! Your ${request.bloodGroup} donation at ${req.user.name} has been recorded.`,
      data: { donationId: donationEntry._id, certificateId: donationEntry.certificateId },
    });
    emitToUser(donorId.toString(), "donation_recorded", donorNotif);
  }

  // Notify requester
  emitToUser(request.requester.toString(), "request_status_update", {
    requestId: request._id,
    status: "completed",
  });

  return res.status(200).json({
    success: true,
    message: "Donation completed and recorded",
    data: { request, donation: donationEntry },
  });
});

// ─── @route  PATCH /api/requests/:id/cancel ──────────────────────────────────
// ─── @access Private (receiver - own request)
export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await BloodRequest.findOne({
    _id: req.params.id,
    requester: req.user._id,
  });

  if (!request) throw new ApiError("Request not found", 404);
  if (!["pending"].includes(request.status)) {
    throw new ApiError("Only pending requests can be cancelled", 400);
  }

  request.status = "cancelled";
  await request.save();

  return res.status(200).json({ success: true, message: "Request cancelled" });
});