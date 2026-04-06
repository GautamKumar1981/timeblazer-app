import { io, Socket } from 'socket.io-client';

export const SOCKET_EVENTS = {
  TIMEBOX_UPDATED: 'timebox:updated',
  TIMEBOX_CREATED: 'timebox:created',
  TIMEBOX_DELETED: 'timebox:deleted',
  GOAL_CREATED: 'goal:created',
  GOAL_UPDATED: 'goal:updated',
  PRIORITY_CHANGED: 'priority:changed',
  TIMER_TICK: 'timer:tick',
} as const;

class SocketService {
  private socket: Socket | null = null;
  private readonly url = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(this.url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: unknown) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string): void {
    this.socket?.off(event);
  }

  emit(event: string, data?: unknown): void {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
