// apps/web/src/components/ui/ai-badge.tsx
import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type AiBadgeVariant = 'ai' | 'success' | 'warning' | 'danger';

const variantStyles: Record<AiBadgeVariant, string> = {
  ai: 'bg-[var(--ai-accent-soft)] text-[var(--ai-accent)] border-[var(--ai-surface-border)]',
  success:
    'bg-[var(--success-surface)] text-[var(--success-accent)] border-[var(--success-border)]',
  warning:
    'bg-[var(--warning-surface)] text-[var(--warning-accent)] border-[var(--warning-border)]',
  danger:
    'bg-[var(--danger-surface)] text-[var(--danger-accent)] border-[var(--danger-border)]',
};

const defaultLabels: Record<AiBadgeVariant, string> = {
  ai: 'AI',
  success: 'Strong',
  warning: 'Maybe',
  danger: 'No',
};

export interface AiBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AiBadgeVariant;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function AiBadge({
  variant = 'ai',
  showIcon,
  children,
  className,
  ...props
}: AiBadgeProps) {
  const shouldShowIcon = showIcon ?? variant === 'ai';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {shouldShowIcon ? <Sparkles className="h-2.5 w-2.5" aria-hidden="true" /> : null}
      {children ?? defaultLabels[variant]}
    </span>
  );
}

export { AiBadge as default };
