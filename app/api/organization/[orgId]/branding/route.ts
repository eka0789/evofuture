import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getOrganizationBranding,
  updateOrganizationBranding,
  canUseWhiteLabel,
  validateCustomCode,
} from '@/lib/whitelabel';

// GET - Get organization branding
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

    const branding = await getOrganizationBranding(params.orgId);

    if (!branding) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ branding });
  } catch (error) {
    console.error('Get branding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update organization branding
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
    const {
      brandName,
      brandLogo,
      brandFavicon,
      brandPrimaryColor,
      brandSecondaryColor,
      brandFont,
      customCss,
      customJs,
      hidePoweredBy,
      emailFromName,
      emailFromAddress,
      emailLogo,
      emailFooter,
    } = body;

    // Validate custom code if provided
    if (customCss) {
      const validation = validateCustomCode(customCss, 'css');
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid CSS', details: validation.errors },
          { status: 400 }
        );
      }
    }

    if (customJs) {
      const validation = validateCustomCode(customJs, 'js');
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid JavaScript', details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Check if advanced features require ENTERPRISE plan
    const hasAdvancedFeatures = customCss || customJs || hidePoweredBy || brandFavicon;
    if (hasAdvancedFeatures) {
      const canUse = await canUseWhiteLabel(params.orgId);
      if (!canUse) {
        return NextResponse.json(
          { error: 'White-label features require ENTERPRISE plan' },
          { status: 403 }
        );
      }
    }

    await updateOrganizationBranding(params.orgId, {
      brandName,
      brandLogo,
      brandFavicon,
      brandPrimaryColor,
      brandSecondaryColor,
      brandFont,
      customCss,
      customJs,
      hidePoweredBy,
      emailFromName,
      emailFromAddress,
      emailLogo,
      emailFooter,
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        organizationId: params.orgId,
        action: 'branding_updated',
        description: 'Updated organization branding',
      },
    });

    const updatedBranding = await getOrganizationBranding(params.orgId);

    return NextResponse.json({ branding: updatedBranding });
  } catch (error) {
    console.error('Update branding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
