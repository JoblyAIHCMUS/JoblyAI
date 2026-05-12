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
  /** Show loading state */
  isLoading?: boolean;
  /** Show error state */
  error?: string;
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
      isLoading = false,
      error,
    },
    ref
  ) => {
    const displayCount = error ? '—' : count;
    const displayLabel = error ? error : label;

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group flex items-center justify-between gap-2 sm:gap-4 shadow rounded-xl px-4 sm:px-5 md:px-6 py-4 sm:py-5 transition-colors',
          bgColor,
          hoverBgColor ?? `hover:${bgColor}/90`,
          textColor,
          error && 'opacity-60',
          isLoading && 'opacity-75',
          className
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-3xl sm:text-4xl md:text-5xl heading-h2-bold leading-none">
            {isLoading ? '...' : displayCount}
          </span>
          <span className="text-xs sm:text-sm md:text-base body-body-1-medium leading-tight sm:heading-h6-medium line-clamp-2">
            {displayLabel}
          </span>
        </div>
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 opacity-80 transition-opacity group-hover:opacity-100" />
      </Link>
    );
  }
);

DashboardBigButton.displayName = 'DashboardBigButton';

export { DashboardBigButton };
