// apps/web/src/components/ui/field-shell.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FieldShellProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  helper?: React.ReactNode;
  error?: string;
  maxLength?: number;
  currentLength?: number;
  children: React.ReactNode;
}

export function FieldShell({
  label,
  required,
  helper,
  error,
  maxLength,
  currentLength,
  className,
  children,
  ...props
}: FieldShellProps) {
  const overLimit =
    typeof maxLength === 'number' &&
    typeof currentLength === 'number' &&
    currentLength > maxLength;

  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-medium text-slate-600">
            {label}
            {required ? <span className="ml-0.5 text-red-500">*</span> : null}
          </label>
          {typeof maxLength === 'number' && typeof currentLength === 'number' ? (
            <span
              className={cn(
                'text-[11px] tabular-nums text-tertiary',
                overLimit && 'text-[var(--danger-accent)]'
              )}
            >
              {currentLength}/{maxLength}
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
