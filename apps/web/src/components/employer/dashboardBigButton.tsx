import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DashboardBigButtonProps {
  /** The large number displayed on the left */
  count: number;
  /** Descriptive label next to the number */
  label: string;
  /** Navigation target */
  href: string;
  /** Background color (Tailwind class or CSS variable) */
  bgColor?: string;
  /** Hover background color (Tailwind class or CSS variable) */
  hoverBgColor?: string;
  /** Text color (Tailwind class) */
  textColor?: string;
  /** Additional class names */
  className?: string;
}

const DashboardBigButton = React.forwardRef<
  HTMLAnchorElement,
  DashboardBigButtonProps
>(
  (
    {
      count,
      label,
      href,
      bgColor = 'bg-primary',
      hoverBgColor,
      textColor = 'text-white',
      className,
    },
    ref
  ) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group flex items-center justify-between shadow rounded-xl px-6 py-5 transition-colors',
          bgColor,
          hoverBgColor ?? `hover:${bgColor}/90`,
          textColor,
          className
        )}
      >
        <div className="flex items-center gap-3">
          <span className="heading-h2-bold leading-none">{count}</span>
          <span className="body-body-1-medium leading-tight sm:heading-h6-medium">
            {label}
          </span>
        </div>
        <ChevronRight className="h-6 w-6 shrink-0 opacity-80 transition-opacity group-hover:opacity-100" />
      </Link>
    );
  }
);

DashboardBigButton.displayName = 'DashboardBigButton';

export { DashboardBigButton };
