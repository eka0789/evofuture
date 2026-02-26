'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket, useNotifications } from '@/hooks/use-socket';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

export function RealtimeNotifications() {
  const { data: session } = useSession();
  const { isConnected } = useSocket(session?.user?.id);
  const { toast } = useToast();

  useNotifications((notification) => {
    toast({
      title: notification.title,
      description: notification.message,
      icon: <Bell className="h-4 w-4" />,
    });

    // Play notification sound (optional)
    if (typeof Audio !== 'undefined') {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Ignore if audio fails to play
      });
    }
  });

  useEffect(() => {
    if (isConnected && session?.user?.id) {
      console.log('✅ Real-time notifications connected');
    }
  }, [isConnected, session]);

  return null; // This is a headless component
}
