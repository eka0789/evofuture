import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTeamSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
});

// GET - List user's teams
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            team: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Team fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new team
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = createTeamSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, description } = validation.data;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Check if slug exists
    const existing = await prisma.team.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Team name already taken' },
        { status: 400 }
      );
    }

    // Create team with creator as owner
    const team = await prisma.team.create({
      data: {
        name,
        slug,
        description,
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

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
