'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Activity,
  CreditCard,
  BarChart,
  User,
  Gift,
  Plug,
  Shield,
  Bot,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'AI Assistant', href: '/app/ai-assistant', icon: Bot },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart },
  { name: 'Activity', href: '/app/activity', icon: Activity },
  { name: 'Profile', href: '/app/profile', icon: User },
  { name: 'Team', href: '/app/team', icon: Users },
  { name: 'Referrals', href: '/app/referrals', icon: Gift },
  { name: 'Integrations', href: '/app/integrations', icon: Plug },
  { name: 'Notifications', href: '/app/notifications', icon: Bell },
  { name: 'Billing', href: '/app/billing', icon: CreditCard },
  { name: 'Settings', href: '/app/settings', icon: Settings },
  { name: 'Admin', href: '/app/admin', icon: Shield, adminOnly: true },
];

export function AppSidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r hidden md:block">
      <div className="h-full flex flex-col">
        <div className="p-6">
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
            <span className="font-bold text-lg">Evolution</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            if (item.adminOnly && userRole !== 'ADMIN') return null;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
