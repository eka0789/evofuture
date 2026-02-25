'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { LogOut, User } from 'lucide-react';

export function AppHeader({ user }: { user: any }) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <MobileNav userRole={user.role} />
        <h2 className="text-lg font-semibold hidden sm:block">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: '/' })}
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
