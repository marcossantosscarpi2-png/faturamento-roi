'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary',
            className
          )}
          {...props}
        />
        {label && <span className="text-sm">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
