import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get invitation details
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token: params.token },
      include: {
        team: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Invitation fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Accept invitation
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token: params.token },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    // Check if email matches
    if (invitation.email !== session.user.email) {
      return NextResponse.json({ error: 'Invitation email does not match' }, { status: 400 });
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: invitation.teamId,
        userId: session.user.id,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a team member' }, { status: 400 });
    }

    // Accept invitation
    await prisma.$transaction([
      prisma.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId: session.user.id,
          role: invitation.role,
        },
      }),
      prisma.teamInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invitation acceptance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
