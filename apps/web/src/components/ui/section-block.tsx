// apps/web/src/components/ui/section-block.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

type SectionBlockTone = 'neutral' | 'ai' | 'success' | 'warning' | 'danger';

const toneStyles: Record<SectionBlockTone, string> = {
  neutral:
    'bg-[var(--slate-50)] border-l-[var(--slate-300)] text-[var(--text-primary)]',
  ai: 'bg-[var(--ai-surface)] border-l-[var(--ai-accent)] text-[var(--text-primary)]',
  success:
    'bg-[var(--success-surface)] border-l-[var(--success-accent)] text-[var(--text-primary)]',
  warning:
    'bg-[var(--warning-surface)] border-l-[var(--warning-accent)] text-[var(--text-primary)]',
  danger:
    'bg-[var(--danger-surface)] border-l-[var(--danger-accent)] text-[var(--text-primary)]',
};

const labelColorStyles: Record<SectionBlockTone, string> = {
  neutral: 'text-tertiary',
  ai: 'text-[var(--ai-accent)]',
  success: 'text-[var(--success-accent)]',
  warning: 'text-[var(--warning-accent)]',
  danger: 'text-[var(--danger-accent)]',
};

export interface SectionBlockProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  tone?: SectionBlockTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionBlock({
  label,
  tone = 'neutral',
  icon,
  className,
  children,
  ...props
}: SectionBlockProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-l-4 border border-[var(--border-primary)] p-3',
        toneStyles[tone],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider',
          labelColorStyles[tone]
        )}
      >
        {icon ? <span className="inline-flex shrink-0">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-sm text-slate-700 min-w-0 break-words">
        {children}
      </div>
    </div>
  );
}
