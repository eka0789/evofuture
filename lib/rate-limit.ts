// Advanced rate limiting with multiple strategies

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(identifier: string, endpoint: string): string {
    return `${identifier}:${endpoint}`;
  }

  check(
    identifier: string,
    endpoint: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(identifier, endpoint);
    const now = Date.now();
    const entry = this.store[key];

    if (!entry || entry.resetTime < now) {
      // Create new entry
      this.store[key] = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: this.store[key].resetTime,
      };
    }

    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(identifier: string, endpoint: string) {
    const key = this.getKey(identifier, endpoint);
    delete this.store[key];
  }
}

const rateLimiter = new RateLimiter();

// Preset configurations
export const rateLimitConfigs = {
  strict: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  standard: { maxRequests: 100, windowMs: 60000 }, // 100 per minute
  relaxed: { maxRequests: 1000, windowMs: 60000 }, // 1000 per minute
  auth: { maxRequests: 5, windowMs: 900000 }, // 5 per 15 minutes
  api: { maxRequests: 100, windowMs: 60000 }, // 100 per minute
};

export function getClientIdentifier(req: NextRequest): string {
  // Try to get user ID from session/token
  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
  return ip;
}

export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig = rateLimitConfigs.standard
) {
  return rateLimiter.check(identifier, endpoint, config);
}

export function resetRateLimit(identifier: string, endpoint: string) {
  rateLimiter.reset(identifier, endpoint);
}

// Middleware helper
export function rateLimitMiddleware(
  req: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.standard
) {
  const identifier = getClientIdentifier(req);
  const endpoint = req.nextUrl.pathname;
  
  const result = checkRateLimit(identifier, endpoint, config);
  
  return {
    ...result,
    headers: {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    },
  };
}
