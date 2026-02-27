import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get organization details
export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: params.orgId, status: 'ACTIVE' },
      include: {
        members: true,
        teams: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
        _count: {
          select: {
            members: true,
            teams: true,
            activities: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if user is a member
    const isMember = organization.members.some(m => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Organization fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update organization
export async function PATCH(
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
    const { name, description, domain, logo, settings, maxUsers, maxStorage, maxApiCalls } = body;

    const organization = await prisma.organization.update({
      where: { id: params.orgId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(domain !== undefined && { domain }),
        ...(logo !== undefined && { logo }),
        ...(settings !== undefined && { settings }),
        ...(maxUsers !== undefined && { maxUsers }),
        ...(maxStorage !== undefined && { maxStorage }),
        ...(maxApiCalls !== undefined && { maxApiCalls }),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        organizationId: params.orgId,
        action: 'organization_updated',
        description: 'Updated organization settings',
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Organization update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete organization
export async function DELETE(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owner can delete organization
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.orgId,
        userId: session.user.id,
        role: 'OWNER',
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Only organization owner can delete' }, { status: 403 });
    }

    // Soft delete
    await prisma.organization.update({
      where: { id: params.orgId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        organizationId: params.orgId,
        action: 'organization_deleted',
        description: 'Deleted organization',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Organization deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
