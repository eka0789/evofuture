import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - List team members
export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member
    const isMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
      },
    });

    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const members = await prisma.teamMember.findMany({
      where: { teamId: params.teamId },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Members fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update member role
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
    const requester = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!requester) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { memberId, role } = body;

    if (!['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Can't change owner role unless you're the owner
    const targetMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (targetMember?.role === 'OWNER' && requester.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owner can change owner role' }, { status: 403 });
    }

    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error('Member update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove member
export async function DELETE(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    // Check if user is owner or admin
    const requester = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!requester) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can't remove owner
    const targetMember = await prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (targetMember?.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 });
    }

    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Member removal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
