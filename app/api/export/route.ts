import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { format } = await req.json();

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        activities: true,
        notifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format data based on requested format
    let exportData;
    let contentType;
    let filename;

    switch (format) {
      case 'json':
        exportData = JSON.stringify(user, null, 2);
        contentType = 'application/json';
        filename = `export-${Date.now()}.json`;
        break;
      case 'csv':
        // Simple CSV export of activities
        const csvRows = [
          ['Date', 'Action', 'Description'],
          ...user.activities.map(a => [
            new Date(a.createdAt).toISOString(),
            a.action,
            a.description || '',
          ]),
        ];
        exportData = csvRows.map(row => row.join(',')).join('\n');
        contentType = 'text/csv';
        filename = `export-${Date.now()}.csv`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
