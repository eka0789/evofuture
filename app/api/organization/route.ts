import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  domain: z.string().optional(),
});

// GET - List user's organizations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
        status: 'ACTIVE',
      },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
        },
        _count: {
          select: {
            members: true,
            teams: true,
          },
        },
      },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Organization fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new organization
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createOrgSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, description, domain } = validation.data;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Check if slug exists
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Organization name already taken' },
        { status: 400 }
      );
    }

    // Check domain uniqueness if provided
    if (domain) {
      const existingDomain = await prisma.organization.findUnique({
        where: { domain },
      });

      if (existingDomain) {
        return NextResponse.json(
          { error: 'Domain already in use' },
          { status: 400 }
        );
      }
    }

    // Create organization with creator as owner
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        description,
        domain,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        organizationId: organization.id,
        action: 'organization_created',
        description: `Created organization: ${name}`,
      },
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    console.error('Organization creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
