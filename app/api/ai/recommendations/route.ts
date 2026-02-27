import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIService } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!AIService.isConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Fetch user context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        role: true,
        plan: true,
        onboarded: true,
        createdAt: true,
      },
    });

    const recentActivities = await prisma.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        action: true,
        description: true,
        createdAt: true,
      },
    });

    // Generate recommendations
    const recommendations = await AIService.getRecommendations({
      userProfile: user,
      recentActivity: recentActivities,
      goals: ['improve productivity', 'increase engagement', 'optimize workflow'],
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        action: 'ai_recommendations',
        description: 'Received AI recommendations',
      },
    });

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
