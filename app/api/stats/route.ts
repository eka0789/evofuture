import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalActivities,
      unreadNotifications,
      recentActivities,
    ] = await Promise.all([
      prisma.activity.count({
        where: { userId: session.user.id },
      }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
      prisma.activity.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalActivities,
      unreadNotifications,
      recentActivities,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
