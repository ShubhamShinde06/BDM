/**
 * Socket.io Emitter
 * Central module for emitting events from controllers/services
 * The `io` instance is injected at startup via init()
 */

let _io = null;

// Map of userId → Set of socketIds (one user can have multiple tabs)
const userSockets = new Map();

/**
 * Initialize emitter with the io instance
 * Called once in server.js
 */
export const init = (io) => {
  _io = io;
};

/**
 * Register a socket for a user
 */
export const registerSocket = (userId, socketId) => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socketId);
};

/**
 * Remove a socket (on disconnect)
 */
export const removeSocket = (userId, socketId) => {
  if (userSockets.has(userId)) {
    userSockets.get(userId).delete(socketId);
    if (userSockets.get(userId).size === 0) {
      userSockets.delete(userId);
    }
  }
};

/**
 * Check if a user is online
 */
export const isOnline = (userId) => {
  return userSockets.has(userId.toString()) && userSockets.get(userId.toString()).size > 0;
};

/**
 * Emit event to a specific user (all their connected sockets)
 */
export const emitToUser = (userId, event, data) => {
  if (!_io) return;
  const sockets = userSockets.get(userId.toString());
  if (sockets) {
    sockets.forEach((socketId) => {
      _io.to(socketId).emit(event, data);
    });
  }
};

/**
 * Emit event to a named room (e.g., "admin_room", "inventory_updates")
 */
export const emitToRoom = (room, event, data) => {
  if (!_io) return;
  _io.to(room).emit(event, data);
};

/**
 * Broadcast to all connected sockets
 */
export const broadcast = (event, data) => {
  if (!_io) return;
  _io.emit(event, data);
};

/**
 * Broadcast to all sockets in a role-based room
 * Roles join rooms named after their role on connection
 */
export const broadcastToRole = (role, event, data) => {
  if (!_io) return;
  _io.to(`role:${role}`).emit(event, data);
};

export const getOnlineCount = () => userSockets.size;
