import { prisma } from '@/lib/prisma';

export class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'info'
  ) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  static async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  static async deleteNotification(notificationId: string) {
    return prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}
