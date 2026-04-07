import { io, Socket } from 'socket.io-client';
import { getToken } from './storage';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

export const onTimeboxUpdate = (callback: (data: unknown) => void): void => {
  socket?.on('timebox:updated', callback);
};

export const onTimeboxCreate = (callback: (data: unknown) => void): void => {
  socket?.on('timebox:created', callback);
};

export const onTimeboxDelete = (callback: (data: unknown) => void): void => {
  socket?.on('timebox:deleted', callback);
};

export const offTimeboxEvents = (): void => {
  socket?.off('timebox:updated');
  socket?.off('timebox:created');
  socket?.off('timebox:deleted');
};
