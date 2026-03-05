import { socketAuth } from "../middleware/auth.js";
import { registerSocket, removeSocket, emitToUser, emitToRoom } from "./emitter.js";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import Notification from "../models/Notification.js";

/**
 * Initialize all Socket.io event handlers
 * @param {import("socket.io").Server} io
 */
export const initSocketHandlers = (io) => {
  // ─── Authentication middleware (runs before any connection) ─────────────────
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    const role = socket.userRole;

    console.log(`🔌 Socket connected: ${socket.userName} [${role}] (${socket.id})`);

    // ─── Register socket mapping ──────────────────────────────────────────────
    registerSocket(userId, socket.id);

    // ─── Join rooms ───────────────────────────────────────────────────────────
    socket.join(userId);                    // Personal room
    socket.join(`role:${role}`);            // Role room
    socket.join("inventory_updates");       // All users get live inventory

    if (role === "main_admin") {
      socket.join("admin_room");            // Admin-only alerts
    }

    // ─── Mark user online ─────────────────────────────────────────────────────
    const Model = role === "hospital_admin" ? Hospital : User;
    await Model.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });

    // Notify admin room of new online user
    socket.to("admin_room").emit("user_online", {
      userId,
      role,
      name: socket.userName,
    });

    // Send unread notification count on connect
    try {
      const recipientModel = role === "hospital_admin" ? "Hospital" : "User";
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        recipientModel,
        isRead: false,
      });
      socket.emit("unread_count", { count: unreadCount });
    } catch (err) {
      console.error("Unread count error:", err.message);
    }

    // ─── CLIENT EVENTS ────────────────────────────────────────────────────────

    /**
     * join_hospital_room
     * Hospital admins join a specific room for their hospital
     */
    socket.on("join_hospital_room", (hospitalId) => {
      if (role === "hospital_admin" && hospitalId === userId) {
        socket.join(`hospital:${hospitalId}`);
        socket.emit("joined_room", { room: `hospital:${hospitalId}` });
      }
    });

    /**
     * typing_indicator (for future chat feature)
     */
    socket.on("typing", ({ to }) => {
      emitToUser(to, "user_typing", { from: userId, name: socket.userName });
    });

    /**
     * ping - heartbeat from client
     */
    socket.on("ping_server", () => {
      socket.emit("pong_server", { timestamp: Date.now() });
    });

    /**
     * mark_notification_read - client-side read event
     */
    socket.on("mark_notification_read", async ({ notificationId }) => {
      try {
        const notif = await Notification.findOne({
          _id: notificationId,
          recipient: userId,
        });
        if (notif) await notif.markRead();

        const unreadCount = await Notification.countDocuments({
          recipient: userId,
          isRead: false,
        });
        socket.emit("unread_count", { count: unreadCount });
      } catch (err) {
        socket.emit("error", { message: "Failed to mark notification" });
      }
    });

    /**
     * get_online_status - check if a specific user is online
     */
    socket.on("get_online_status", ({ targetUserId }) => {
      const { isOnline } = require("./emitter.js");
      socket.emit("online_status", {
        userId: targetUserId,
        isOnline: isOnline(targetUserId),
      });
    });

    /**
     * subscribe_blood_group - donors subscribe to alerts for their blood group
     */
    socket.on("subscribe_blood_group", ({ bloodGroup }) => {
      socket.join(`blood:${bloodGroup}`);
    });

    // ─── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on("disconnect", async (reason) => {
      console.log(`❌ Socket disconnected: ${socket.userName} [${role}] — ${reason}`);

      removeSocket(userId, socket.id);

      // Only mark offline if no more sockets for this user
      const { isOnline } = await import("./emitter.js");
      if (!isOnline(userId)) {
        await Model.findByIdAndUpdate(userId, {
          isOnline: false,
          socketId: null,
          lastSeen: new Date(),
        });

        socket.to("admin_room").emit("user_offline", {
          userId,
          role,
          name: socket.userName,
        });
      }
    });

    // ─── Error handler ────────────────────────────────────────────────────────
    socket.on("error", (err) => {
      console.error(`Socket error [${socket.userName}]:`, err.message);
    });
  });
};
