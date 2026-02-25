import { useQuery } from '@tanstack/react-query';

interface AnalyticsData {
  period: string;
  activities: number;
  notifications: number;
  startDate: string;
  endDate: string;
}

export function useAnalytics(period: string = '30d') {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });
}
