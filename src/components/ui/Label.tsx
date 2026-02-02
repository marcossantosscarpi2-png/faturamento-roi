'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('block text-sm font-medium text-foreground', className)}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';
