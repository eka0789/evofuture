import { prisma } from './prisma';
import { subDays, format } from 'date-fns';

export interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  activityTrend: { date: string; count: number }[];
  topActions: { action: string; count: number }[];
  userEngagement: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  conversionFunnel: {
    signups: number;
    onboarded: number;
    active: number;
    paid: number;
  };
  revenueMetrics: {
    mrr: number;
    arr: number;
    churnRate: number;
    ltv: number;
  };
}

export class AnalyticsService {
  static async getUserGrowth(days: number = 30): Promise<{ date: string; count: number }[]> {
    const startDate = subDays(new Date(), days);
    
    const users = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // Group by date
    const grouped = users.reduce((acc, user) => {
      const date = format(new Date(user.createdAt), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + user._count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  static async getActivityTrend(days: number = 30): Promise<{ date: string; count: number }[]> {
    const startDate = subDays(new Date(), days);
    
    const activities = await prisma.activity.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    const grouped = activities.reduce((acc, activity) => {
      const date = format(new Date(activity.createdAt), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + activity._count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  static async getTopActions(limit: number = 10): Promise<{ action: string; count: number }[]> {
    const actions = await prisma.activity.groupBy({
      by: ['action'],
      _count: true,
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
      take: limit,
    });

    return actions.map(a => ({
      action: a.action,
      count: a._count,
    }));
  }

  static async getUserEngagement() {
    const now = new Date();
    const oneDayAgo = subDays(now, 1);
    const oneWeekAgo = subDays(now, 7);
    const oneMonthAgo = subDays(now, 30);

    const [daily, weekly, monthly] = await Promise.all([
      prisma.user.count({
        where: {
          updatedAt: { gte: oneDayAgo },
        },
      }),
      prisma.user.count({
        where: {
          updatedAt: { gte: oneWeekAgo },
        },
      }),
      prisma.user.count({
        where: {
          updatedAt: { gte: oneMonthAgo },
        },
      }),
    ]);

    return { daily, weekly, monthly };
  }

  static async getConversionFunnel() {
    const [signups, onboarded, active, paid] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { onboarded: true } }),
      prisma.user.count({
        where: {
          updatedAt: { gte: subDays(new Date(), 30) },
        },
      }),
      prisma.user.count({
        where: {
          plan: { not: 'FREE' },
        },
      }),
    ]);

    return { signups, onboarded, active, paid };
  }

  static async getRevenueMetrics() {
    const paidUsers = await prisma.user.findMany({
      where: {
        plan: { not: 'FREE' },
        stripeCurrentPeriodEnd: { gte: new Date() },
      },
      select: {
        plan: true,
        createdAt: true,
      },
    });

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = paidUsers.reduce((sum, user) => {
      if (user.plan === 'PRO') return sum + 29;
      if (user.plan === 'ENTERPRISE') return sum + 99;
      return sum;
    }, 0);

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Calculate churn rate (simplified)
    const totalUsers = await prisma.user.count();
    const activeUsers = paidUsers.length;
    const churnRate = totalUsers > 0 ? ((totalUsers - activeUsers) / totalUsers) * 100 : 0;

    // Calculate LTV (Lifetime Value) - simplified
    const avgMonthlyRevenue = paidUsers.length > 0 ? mrr / paidUsers.length : 0;
    const avgLifetimeMonths = 12; // Assume 12 months average
    const ltv = avgMonthlyRevenue * avgLifetimeMonths;

    return {
      mrr,
      arr,
      churnRate: Math.round(churnRate * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
    };
  }

  static async getComprehensiveAnalytics(days: number = 30): Promise<AnalyticsData> {
    const [
      userGrowth,
      activityTrend,
      topActions,
      userEngagement,
      conversionFunnel,
      revenueMetrics,
    ] = await Promise.all([
      this.getUserGrowth(days),
      this.getActivityTrend(days),
      this.getTopActions(),
      this.getUserEngagement(),
      this.getConversionFunnel(),
      this.getRevenueMetrics(),
    ]);

    return {
      userGrowth,
      activityTrend,
      topActions,
      userEngagement,
      conversionFunnel,
      revenueMetrics,
    };
  }

  static async exportAnalytics(format: 'json' | 'csv' = 'json') {
    const data = await this.getComprehensiveAnalytics();

    if (format === 'csv') {
      // Convert to CSV format
      const csv = [
        'Metric,Value',
        `MRR,$${data.revenueMetrics.mrr}`,
        `ARR,$${data.revenueMetrics.arr}`,
        `Churn Rate,${data.revenueMetrics.churnRate}%`,
        `LTV,$${data.revenueMetrics.ltv}`,
        `Daily Active Users,${data.userEngagement.daily}`,
        `Weekly Active Users,${data.userEngagement.weekly}`,
        `Monthly Active Users,${data.userEngagement.monthly}`,
        `Total Signups,${data.conversionFunnel.signups}`,
        `Onboarded Users,${data.conversionFunnel.onboarded}`,
        `Active Users,${data.conversionFunnel.active}`,
        `Paid Users,${data.conversionFunnel.paid}`,
      ].join('\n');

      return csv;
    }

    return JSON.stringify(data, null, 2);
  }
}
