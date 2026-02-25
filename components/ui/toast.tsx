'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  onClose: () => void;
}

export function Toast({ id, title, description, variant = 'default', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border',
    success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg shadow-lg p-4',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && <p className="font-semibold">{title}</p>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
