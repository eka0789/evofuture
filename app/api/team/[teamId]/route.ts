import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get team details
export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await prisma.team.findUnique({
      where: { id: params.teamId },
      include: {
        members: {
          include: {
            team: true,
          },
        },
        invitations: {
          where: {
            acceptedAt: null,
            expiresAt: { gte: new Date() },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is a member
    const isMember = team.members.some(m => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Team fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update team
export async function PATCH(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner or admin
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description } = body;

    const team = await prisma.team.update({
      where: { id: params.teamId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Team update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete team
export async function DELETE(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owner can delete team
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        role: 'OWNER',
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Only team owner can delete team' }, { status: 403 });
    }

    await prisma.team.delete({
      where: { id: params.teamId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
