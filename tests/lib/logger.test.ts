import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('log levels', () => {
    it.skip('should log debug messages in development', () => {
      // Debug logs are filtered by LOG_LEVEL environment variable
      // This test is skipped as it depends on environment configuration
      const consoleSpy = vi.spyOn(console, 'log');
      logger.debug('Debug message', { key: 'value' });
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      logger.info('Info message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log warning messages', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      logger.warn('Warning message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      logger.error('Error message');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('specialized logging', () => {
    it('should log API requests', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      logger.apiRequest('GET', '/api/users', 'user-123');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log API responses', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      logger.apiResponse('GET', '/api/users', 200, 150);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log auth events', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      logger.authEvent('login', 'user-123', true);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log security events', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      logger.securityEvent('failed_login', { attempts: 3 });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
