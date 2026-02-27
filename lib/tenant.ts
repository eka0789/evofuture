import { prisma } from './prisma';

export interface TenantContext {
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    maxUsers: number;
    maxStorage: number;
    maxApiCalls: number;
    status: string;
  };
  userRole: string;
}

/**
 * Get tenant context for a user
 */
export async function getTenantContext(
  userId: string,
  organizationId?: string
): Promise<TenantContext | null> {
  try {
    // If organizationId is provided, use it
    if (organizationId) {
      const member = await prisma.organizationMember.findFirst({
        where: {
          organizationId,
          userId,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              plan: true,
              maxUsers: true,
              maxStorage: true,
              maxApiCalls: true,
              status: true,
            },
          },
        },
      });

      if (!member || member.organization.status !== 'ACTIVE') {
        return null;
      }

      return {
        organizationId: member.organizationId,
        organization: member.organization,
        userRole: member.role,
      };
    }

    // Otherwise, get user's first organization
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId,
        organization: {
          status: 'ACTIVE',
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            maxUsers: true,
            maxStorage: true,
            maxApiCalls: true,
            status: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    if (!member) {
      return null;
    }

    return {
      organizationId: member.organizationId,
      organization: member.organization,
      userRole: member.role,
    };
  } catch (error) {
    console.error('Get tenant context error:', error);
    return null;
  }
}

/**
 * Check if user has permission in organization
 */
export async function hasOrganizationPermission(
  userId: string,
  organizationId: string,
  requiredRoles: string[]
): Promise<boolean> {
  try {
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        role: { in: requiredRoles },
      },
    });

    return !!member;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Check resource limits for organization
 */
export async function checkResourceLimits(
  organizationId: string
): Promise<{
  canAddUser: boolean;
  canUseStorage: boolean;
  canMakeApiCall: boolean;
  currentUsers: number;
  currentStorage: number;
  currentApiCalls: number;
}> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get current month's API calls
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const apiCalls = await prisma.activity.count({
      where: {
        organizationId,
        action: { startsWith: 'api_' },
        createdAt: { gte: startOfMonth },
      },
    });

    return {
      canAddUser: organization._count.members < organization.maxUsers,
      canUseStorage: true, // TODO: Implement storage tracking
      canMakeApiCall: apiCalls < organization.maxApiCalls,
      currentUsers: organization._count.members,
      currentStorage: 0, // TODO: Implement storage tracking
      currentApiCalls: apiCalls,
    };
  } catch (error) {
    console.error('Resource limits check error:', error);
    throw error;
  }
}

/**
 * Get organization settings
 */
export async function getOrganizationSettings(
  organizationId: string
): Promise<Record<string, any>> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    if (!organization || !organization.settings) {
      return {};
    }

    return JSON.parse(organization.settings);
  } catch (error) {
    console.error('Get organization settings error:', error);
    return {};
  }
}

/**
 * Update organization settings
 */
export async function updateOrganizationSettings(
  organizationId: string,
  settings: Record<string, any>
): Promise<void> {
  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        settings: JSON.stringify(settings),
      },
    });
  } catch (error) {
    console.error('Update organization settings error:', error);
    throw error;
  }
}
