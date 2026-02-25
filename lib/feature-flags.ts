// Feature flag system for gradual rollout and A/B testing

export type FeatureFlag = 
  | 'referral_system'
  | 'onboarding_wizard'
  | 'team_collaboration'
  | 'advanced_analytics'
  | 'ai_assistant'
  | 'white_label'
  | 'api_access'
  | 'custom_domain'
  | 'sso'
  | 'audit_logs';

interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage?: number;
  allowedRoles?: string[];
  allowedUsers?: string[];
}

const featureFlags: Record<FeatureFlag, FeatureFlagConfig> = {
  referral_system: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_REFERRAL === 'true',
    rolloutPercentage: 100,
  },
  onboarding_wizard: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_ONBOARDING === 'true',
    rolloutPercentage: 100,
  },
  team_collaboration: {
    enabled: false,
    rolloutPercentage: 0,
    allowedRoles: ['ADMIN'],
  },
  advanced_analytics: {
    enabled: true,
    rolloutPercentage: 100,
  },
  ai_assistant: {
    enabled: false,
    rolloutPercentage: 0,
    allowedRoles: ['ADMIN'],
  },
  white_label: {
    enabled: false,
    allowedRoles: ['ADMIN'],
  },
  api_access: {
    enabled: true,
    rolloutPercentage: 100,
  },
  custom_domain: {
    enabled: false,
    allowedRoles: ['ADMIN'],
  },
  sso: {
    enabled: false,
    allowedRoles: ['ADMIN'],
  },
  audit_logs: {
    enabled: true,
    rolloutPercentage: 100,
  },
};

export function isFeatureEnabled(
  flag: FeatureFlag,
  userId?: string,
  userRole?: string
): boolean {
  const config = featureFlags[flag];
  
  if (!config.enabled) {
    return false;
  }

  // Check role-based access
  if (config.allowedRoles && userRole) {
    if (!config.allowedRoles.includes(userRole)) {
      return false;
    }
  }

  // Check user-specific access
  if (config.allowedUsers && userId) {
    if (!config.allowedUsers.includes(userId)) {
      return false;
    }
  }

  // Check rollout percentage
  if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
    if (!userId) return false;
    
    // Deterministic rollout based on user ID
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const percentage = Math.abs(hash % 100);
    return percentage < config.rolloutPercentage;
  }

  return true;
}

export function getEnabledFeatures(userId?: string, userRole?: string): FeatureFlag[] {
  return (Object.keys(featureFlags) as FeatureFlag[]).filter(flag =>
    isFeatureEnabled(flag, userId, userRole)
  );
}
