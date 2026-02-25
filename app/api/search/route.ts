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

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, activities, notifications
    const limit = parseInt(searchParams.get('limit') || '10');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any = {};

    // Build date filter
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);

    // Search activities
    if (type === 'all' || type === 'activities') {
      const activities = await prisma.activity.findMany({
        where: {
          userId: session.user.id,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
          OR: [
            { action: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      results.activities = activities;
    }

    // Search notifications
    if (type === 'all' || type === 'notifications') {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: session.user.id,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { message: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      results.notifications = notifications;
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce(
      (sum: number, arr: any) => sum + (arr?.length || 0),
      0
    );

    return NextResponse.json({
      query,
      totalResults,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
