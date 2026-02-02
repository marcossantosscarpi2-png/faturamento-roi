'use client';

import { forwardRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, ...props }, ref) => {
    const [touched, setTouched] = useState(false);
    const showError = touched && error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1" htmlFor={props.id}>
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border px-4 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              showError && 'border-destructive focus:ring-destructive',
              className
            )}
            onBlur={(e) => {
              setTouched(true);
              props.onBlur?.(e);
            }}
            {...props}
            aria-invalid={showError}
            aria-describedby={showError ? `${props.id}-error` : undefined}
          />
          {showError && (
            <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive pointer-events-none" />
          )}
        </div>
        {showError && (
          <p id={`${props.id}-error`} className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
