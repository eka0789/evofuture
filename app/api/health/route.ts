import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'healthy',
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Memory check
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memory = process.memoryUsage();
    checks.memory = {
      status: 'healthy',
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
    };
  }

  // Overall status
  const isHealthy = Object.values(checks).every(
    (check: any) => check.status === 'healthy'
  );

  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'N/A',
    responseTime: Date.now() - startTime,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
  };

  return NextResponse.json(response, { status: isHealthy ? 200 : 503 });
}
