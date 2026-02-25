// Application constants and configuration

export const APP_NAME = 'Evolution Future';
export const APP_DESCRIPTION = 'Modern SaaS Platform for Digital Transformation';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Rate Limiting
export const RATE_LIMIT = {
  STANDARD: { maxRequests: 100, windowMs: 60000 }, // 100 per minute
  STRICT: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  AUTH: { maxRequests: 5, windowMs: 900000 }, // 5 per 15 minutes
};

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Session
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Activity Types
export const ACTIVITY_TYPES = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  PROFILE_UPDATE: 'Profile Updated',
  PASSWORD_CHANGE: 'Password Changed',
  SETTINGS_UPDATE: 'Settings Updated',
  DATA_EXPORT: 'Data Exported',
  ONBOARDING_COMPLETE: 'Onboarding Completed',
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

// Feature Flags
export const FEATURES = {
  REFERRAL_SYSTEM: process.env.NEXT_PUBLIC_ENABLE_REFERRAL === 'true',
  ONBOARDING: process.env.NEXT_PUBLIC_ENABLE_ONBOARDING === 'true',
  TEAM_COLLABORATION: false,
  ADVANCED_ANALYTICS: true,
  API_ACCESS: true,
} as const;

// API Response Messages
export const API_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  SUCCESS: 'Operation successful',
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#6366f1',
  PURPLE: '#a855f7',
} as const;

// Social Links (customize for your brand)
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/evolutionfuture',
  GITHUB: 'https://github.com/evolutionfuture',
  LINKEDIN: 'https://linkedin.com/company/evolutionfuture',
  DISCORD: 'https://discord.gg/evolutionfuture',
} as const;

// Support
export const SUPPORT_EMAIL = 'support@evolutionfuture.com';
export const SALES_EMAIL = 'sales@evolutionfuture.com';

// Pricing Plans (example)
export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '5 team members',
      '10 GB storage',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      '25 team members',
      '100 GB storage',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited team members',
      'Unlimited storage',
      'Advanced analytics',
      '24/7 support',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated account manager',
    ],
  },
] as const;
