import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize socket connection
    if (!socket) {
      socket = io({
        path: '/api/socket',
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        setIsConnected(true);
        setTransport(socket!.io.engine.transport.name);

        socket!.io.engine.on('upgrade', (transport) => {
          setTransport(transport.name);
        });

        // Join user room if userId is provided
        if (userId) {
          socket!.emit('join', userId);
        }
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, [userId]);

  return {
    socket,
    isConnected,
    transport,
  };
}

export function useSocketEvent<T = any>(
  event: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket?.off(event, callback);
    };
  }, [event, callback]);
}

export function emitSocketEvent(event: string, data: any) {
  if (!socket) return;
  socket.emit(event, data);
}

// Specific hooks for common events
export function useNotifications(callback: (notification: any) => void) {
  useSocketEvent('notification', callback);
}

export function useActivityUpdates(callback: (activity: any) => void) {
  useSocketEvent('activity', callback);
}

export function useTeamUpdates(callback: (update: any) => void) {
  useSocketEvent('team-update', callback);
}

export function useUserPresence(callback: (presence: any) => void) {
  useSocketEvent('user-presence', callback);
}

export function useTypingIndicator(callback: (data: { userId: string; isTyping: boolean }) => void) {
  useSocketEvent('user-typing', callback);
}
