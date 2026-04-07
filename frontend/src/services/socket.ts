import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

let socket: Socket | null = null;

export function connect(token: string): Socket {
  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
}

export function disconnect(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function on(event: string, callback: (...args: any[]) => void): void {
  socket?.on(event, callback);
}

export function off(event: string): void {
  socket?.off(event);
}

export function emit(event: string, data?: unknown): void {
  socket?.emit(event, data);
}

export function getSocket(): Socket | null {
  return socket;
}
