import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      activities: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      notifications: {
        where: { read: false },
        take: 5,
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your account today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value="$45,231"
          change="+20.1%"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KPICard
          title="Active Users"
          value="2,350"
          change="+15.3%"
          icon={<Users className="h-4 w-4" />}
        />
        <KPICard
          title="Conversion Rate"
          value="3.24%"
          change="+2.5%"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KPICard
          title="Activities"
          value={user?.activities.length.toString() || '0'}
          change="Last 24h"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        {user?.activities && user.activities.length > 0 ? (
          <div className="space-y-3">
            {user.activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No recent activity</p>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value, change, icon }: { title: string; value: string; change: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-green-600 mt-1">{change}</p>
      </div>
    </div>
  );
}
