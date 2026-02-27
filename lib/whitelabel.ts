import { prisma } from './prisma';

export interface BrandingConfig {
  brandName?: string;
  brandLogo?: string;
  brandFavicon?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  brandFont?: string;
  customCss?: string;
  customJs?: string;
  hidePoweredBy?: boolean;
  emailFromName?: string;
  emailFromAddress?: string;
  emailLogo?: string;
  emailFooter?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  font: string;
  customCss?: string;
}

/**
 * Get organization branding configuration
 */
export async function getOrganizationBranding(
  organizationId: string
): Promise<BrandingConfig | null> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        brandName: true,
        brandLogo: true,
        brandFavicon: true,
        brandPrimaryColor: true,
        brandSecondaryColor: true,
        brandFont: true,
        customCss: true,
        customJs: true,
        hidePoweredBy: true,
        emailFromName: true,
        emailFromAddress: true,
        emailLogo: true,
        emailFooter: true,
        plan: true,
      },
    });

    if (!organization) {
      return null;
    }

    // White-label features only for ENTERPRISE plan
    if (organization.plan !== 'ENTERPRISE') {
      return {
        brandName: organization.brandName || undefined,
        brandLogo: organization.brandLogo || undefined,
        brandPrimaryColor: organization.brandPrimaryColor || '#3b82f6',
        brandSecondaryColor: organization.brandSecondaryColor || '#8b5cf6',
        brandFont: organization.brandFont || 'Inter',
        hidePoweredBy: false, // Always show for non-enterprise
      };
    }

    return {
      brandName: organization.brandName || undefined,
      brandLogo: organization.brandLogo || undefined,
      brandFavicon: organization.brandFavicon || undefined,
      brandPrimaryColor: organization.brandPrimaryColor || '#3b82f6',
      brandSecondaryColor: organization.brandSecondaryColor || '#8b5cf6',
      brandFont: organization.brandFont || 'Inter',
      customCss: organization.customCss || undefined,
      customJs: organization.customJs || undefined,
      hidePoweredBy: organization.hidePoweredBy || false,
      emailFromName: organization.emailFromName || undefined,
      emailFromAddress: organization.emailFromAddress || undefined,
      emailLogo: organization.emailLogo || undefined,
      emailFooter: organization.emailFooter || undefined,
    };
  } catch (error) {
    console.error('Get organization branding error:', error);
    return null;
  }
}

/**
 * Get organization branding by domain
 */
export async function getOrganizationBrandingByDomain(
  domain: string
): Promise<BrandingConfig | null> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { domain },
      select: {
        id: true,
        brandName: true,
        brandLogo: true,
        brandFavicon: true,
        brandPrimaryColor: true,
        brandSecondaryColor: true,
        brandFont: true,
        customCss: true,
        customJs: true,
        hidePoweredBy: true,
        plan: true,
      },
    });

    if (!organization) {
      return null;
    }

    return getOrganizationBranding(organization.id);
  } catch (error) {
    console.error('Get organization branding by domain error:', error);
    return null;
  }
}

/**
 * Update organization branding
 */
export async function updateOrganizationBranding(
  organizationId: string,
  branding: Partial<BrandingConfig>
): Promise<void> {
  try {
    // Check if organization has ENTERPRISE plan
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Restrict advanced features to ENTERPRISE
    const updateData: any = {};

    // Basic branding (all plans)
    if (branding.brandName !== undefined) updateData.brandName = branding.brandName;
    if (branding.brandLogo !== undefined) updateData.brandLogo = branding.brandLogo;
    if (branding.brandPrimaryColor !== undefined) updateData.brandPrimaryColor = branding.brandPrimaryColor;
    if (branding.brandSecondaryColor !== undefined) updateData.brandSecondaryColor = branding.brandSecondaryColor;
    if (branding.brandFont !== undefined) updateData.brandFont = branding.brandFont;

    // Advanced features (ENTERPRISE only)
    if (organization.plan === 'ENTERPRISE') {
      if (branding.brandFavicon !== undefined) updateData.brandFavicon = branding.brandFavicon;
      if (branding.customCss !== undefined) updateData.customCss = branding.customCss;
      if (branding.customJs !== undefined) updateData.customJs = branding.customJs;
      if (branding.hidePoweredBy !== undefined) updateData.hidePoweredBy = branding.hidePoweredBy;
      if (branding.emailFromName !== undefined) updateData.emailFromName = branding.emailFromName;
      if (branding.emailFromAddress !== undefined) updateData.emailFromAddress = branding.emailFromAddress;
      if (branding.emailLogo !== undefined) updateData.emailLogo = branding.emailLogo;
      if (branding.emailFooter !== undefined) updateData.emailFooter = branding.emailFooter;
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });
  } catch (error) {
    console.error('Update organization branding error:', error);
    throw error;
  }
}

/**
 * Generate theme CSS from branding config
 */
export function generateThemeCSS(branding: BrandingConfig): string {
  const primaryColor = branding.brandPrimaryColor || '#3b82f6';
  const secondaryColor = branding.brandSecondaryColor || '#8b5cf6';
  const font = branding.brandFont || 'Inter';

  return `
    :root {
      --primary-color: ${primaryColor};
      --secondary-color: ${secondaryColor};
      --font-family: ${font}, sans-serif;
    }

    body {
      font-family: var(--font-family);
    }

    .bg-primary {
      background-color: var(--primary-color) !important;
    }

    .text-primary {
      color: var(--primary-color) !important;
    }

    .border-primary {
      border-color: var(--primary-color) !important;
    }

    .bg-secondary {
      background-color: var(--secondary-color) !important;
    }

    .text-secondary {
      color: var(--secondary-color) !important;
    }

    button.primary, .btn-primary {
      background-color: var(--primary-color);
      color: white;
    }

    button.primary:hover, .btn-primary:hover {
      opacity: 0.9;
    }

    ${branding.customCss || ''}
  `.trim();
}

/**
 * Check if organization can use white-label features
 */
export async function canUseWhiteLabel(organizationId: string): Promise<boolean> {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    return organization?.plan === 'ENTERPRISE';
  } catch (error) {
    console.error('Check white-label permission error:', error);
    return false;
  }
}

/**
 * Get default branding
 */
export function getDefaultBranding(): BrandingConfig {
  return {
    brandName: 'Evolution Future',
    brandPrimaryColor: '#3b82f6',
    brandSecondaryColor: '#8b5cf6',
    brandFont: 'Inter',
    hidePoweredBy: false,
  };
}

/**
 * Validate custom CSS/JS for security
 */
export function validateCustomCode(code: string, type: 'css' | 'js'): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (type === 'js') {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\(/gi,
      /Function\(/gi,
      /setTimeout\(/gi,
      /setInterval\(/gi,
      /<script/gi,
      /document\.write/gi,
      /innerHTML/gi,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(`Dangerous pattern detected: ${pattern.source}`);
      }
    }
  }

  if (type === 'css') {
    // Check for dangerous CSS
    const dangerousPatterns = [
      /javascript:/gi,
      /expression\(/gi,
      /behavior:/gi,
      /@import/gi,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push(`Dangerous pattern detected: ${pattern.source}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
