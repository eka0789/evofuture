import { prisma } from '@/lib/prisma';

export class ActivityService {
  static async logActivity(
    userId: string,
    action: string,
    description?: string,
    metadata?: any
  ) {
    return prisma.activity.create({
      data: {
        userId,
        action,
        description,
        metadata,
      },
    });
  }

  static async getUserActivities(userId: string, limit = 10) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
