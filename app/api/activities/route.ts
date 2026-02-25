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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const activities = await prisma.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.activity.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ activities, total, limit, offset });
  } catch (error) {
    console.error('Activities fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, description, metadata } = await req.json();

    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        action,
        description,
        metadata,
      },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Activity creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
