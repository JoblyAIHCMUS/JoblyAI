// apps/web/src/components/ui/slider.tsx
'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  tone?: 'neutral' | 'ai';
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, tone = 'ai', ...props }, ref) => {
  const trackBg = tone === 'ai' ? 'bg-[var(--ai-accent)]' : 'bg-slate-900';
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200">
        <SliderPrimitive.Range className={cn('absolute h-full', trackBg)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          'block h-[18px] w-[18px] rounded-full border border-slate-300 bg-white shadow-sm outline-none transition-transform',
          'hover:scale-105',
          'focus-visible:ring-2 focus-visible:ring-[var(--ai-accent-soft)] focus-visible:ring-offset-2'
        )}
        aria-label="Value"
      />
    </SliderPrimitive.Root>
  );
});
Slider.displayName = 'Slider';

export { Slider as default };
