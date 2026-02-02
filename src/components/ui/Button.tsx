'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0',
          size === 'sm' && 'px-2 py-1 text-sm sm:min-h-[36px] sm:min-w-[36px]',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
          variant === 'secondary' && 'border bg-background hover:bg-muted',
          variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          variant === 'ghost' && 'hover:bg-muted',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
