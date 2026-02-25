'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
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

export function MobileNav({ userRole }: { userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-muted"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b shadow-lg z-50">
          <nav className="p-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {navigation.map((item) => {
              if (item.adminOnly && userRole !== 'ADMIN') return null;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
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
      )}
    </div>
  );
}
