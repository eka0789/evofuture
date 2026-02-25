import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ActivityService } from '@/services/activity.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        onboarded: true,
      },
    });

    await ActivityService.logActivity(
      session.user.id,
      'Onboarding Completed',
      'User completed the onboarding process'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
