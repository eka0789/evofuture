import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can access advanced analytics
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');
    const format = searchParams.get('format') as 'json' | 'csv' | null;

    if (format === 'csv') {
      const csv = await AnalyticsService.exportAnalytics('csv');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${Date.now()}.csv"`,
        },
      });
    }

    const data = await AnalyticsService.getComprehensiveAnalytics(days);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Advanced analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
