import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Can be User OR Hospital ObjectId
    },
    recipientModel: {
      type: String,
      enum: ["User", "Hospital"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "request_new",        // Hospital: new blood request received
        "request_accepted",   // User: their request was accepted
        "request_rejected",   // User: their request was rejected
        "hospital_approved",  // Hospital: admin approved their registration
        "hospital_rejected",  // Hospital: admin rejected their registration
        "donor_needed",       // Donor: blood type needed nearby
        "donation_complete",  // Donor: donation recorded
        "low_stock_alert",    // Hospital: blood stock running low
        "system",             // Generic system notification
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Extra payload (requestId, etc.)
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Instance: mark as read
notificationSchema.methods.markRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
