import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

let socket = null;

/**
 * Initialize Socket.IO connection
 */
export const initSocket = () => {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error);
  });

  return socket;
};

/**
 * Get existing socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Listen for lottery draw updates
 * @param {Function} callback - Function to call when update received
 */
export const onLotteryUpdate = (callback) => {
  if (!socket) {
    console.warn('⚠️ Socket not initialized. Call initSocket() first.');
    return;
  }

  console.log('👂 Listening for lottery:update events...');
  socket.on('lottery:update', callback);
};

/**
 * Stop listening for lottery draw updates
 * @param {Function} callback - Function to remove
 */
export const offLotteryUpdate = (callback) => {
  if (!socket) return;

  if (callback) {
    socket.off('lottery:update', callback);
  } else {
    socket.off('lottery:update');
  }
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  onLotteryUpdate,
  offLotteryUpdate
};
