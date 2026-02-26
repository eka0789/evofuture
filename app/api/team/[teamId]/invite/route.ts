import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

// POST - Send invitation
export async function POST(
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
    const validation = inviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
    }

    // Check for existing pending invitation
    const existingInvite = await prisma.teamInvitation.findFirst({
      where: {
        teamId: params.teamId,
        email,
        acceptedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json({ error: 'Invitation already sent' }, { status: 400 });
    }

    // Create invitation
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId: params.teamId,
        email,
        role,
        token,
        expiresAt,
      },
      include: {
        team: true,
      },
    });

    // TODO: Send email with invitation link
    // const inviteUrl = `${process.env.NEXTAUTH_URL}/team/invite/${token}`;
    // await sendEmail(email, 'Team Invitation', inviteUrl);

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List pending invitations
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
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        teamId: params.teamId,
        acceptedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Invitations fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
