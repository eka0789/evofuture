import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from './prisma';

export type SocketServer = SocketIOServer;

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join team room
    socket.on('join-team', (teamId: string) => {
      socket.join(`team:${teamId}`);
      console.log(`Socket ${socket.id} joined team:${teamId}`);
    });

    // Handle typing indicators
    socket.on('typing', (data: { userId: string; teamId: string; isTyping: boolean }) => {
      socket.to(`team:${data.teamId}`).emit('user-typing', {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    // Handle presence
    socket.on('presence', async (userId: string) => {
      // Update user's last seen
      await prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      });

      // Broadcast to all connected clients
      io?.emit('user-presence', {
        userId,
        status: 'online',
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Helper functions to emit events
export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToTeam(teamId: string, event: string, data: any) {
  if (!io) return;
  io.to(`team:${teamId}`).emit(event, data);
}

export function emitToAll(event: string, data: any) {
  if (!io) return;
  io.emit(event, data);
}

// Notification events
export function sendNotification(userId: string, notification: any) {
  emitToUser(userId, 'notification', notification);
}

export function sendActivityUpdate(userId: string, activity: any) {
  emitToUser(userId, 'activity', activity);
}

export function sendTeamUpdate(teamId: string, update: any) {
  emitToTeam(teamId, 'team-update', update);
}
