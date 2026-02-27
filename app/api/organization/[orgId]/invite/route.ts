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
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner or admin
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.orgId,
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
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.orgId,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    // Check for existing pending invitation
    const existingInvite = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId: params.orgId,
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

    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId: params.orgId,
        email,
        role,
        token,
        expiresAt,
      },
      include: {
        organization: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        organizationId: params.orgId,
        action: 'member_invited',
        description: `Invited ${email} to organization`,
      },
    });

    // TODO: Send email with invitation link
    // const inviteUrl = `${process.env.NEXTAUTH_URL}/organization/invite/${token}`;

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - List pending invitations
export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.orgId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId: params.orgId,
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
