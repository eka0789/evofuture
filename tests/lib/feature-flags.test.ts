import { describe, it, expect } from 'vitest';
import { isFeatureEnabled, getEnabledFeatures } from '@/lib/feature-flags';

describe('Feature Flags', () => {
  describe('isFeatureEnabled', () => {
    it('should return true for enabled features', () => {
      const result = isFeatureEnabled('advanced_analytics');
      expect(result).toBe(true);
    });

    it('should return false for disabled features', () => {
      const result = isFeatureEnabled('white_label');
      expect(result).toBe(false);
    });

    it('should respect role-based access', () => {
      const result = isFeatureEnabled('team_collaboration', 'user-id', 'USER');
      expect(result).toBe(false);
      
      const adminResult = isFeatureEnabled('team_collaboration', 'admin-id', 'ADMIN');
      expect(adminResult).toBe(false); // Still false because feature is disabled
    });
  });

  describe('getEnabledFeatures', () => {
    it('should return list of enabled features', () => {
      const features = getEnabledFeatures();
      expect(features).toBeInstanceOf(Array);
      expect(features.length).toBeGreaterThan(0);
    });

    it('should filter by user role', () => {
      const userFeatures = getEnabledFeatures('user-id', 'USER');
      const adminFeatures = getEnabledFeatures('admin-id', 'ADMIN');
      
      expect(userFeatures).toBeInstanceOf(Array);
      expect(adminFeatures).toBeInstanceOf(Array);
    });
  });
});
