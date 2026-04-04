import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'p-4 rounded-xl border border-gray-200 bg-white shadow-md',
        className
      )}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-8',
        month: 'space-y-4 w-full sm:w-72',
        caption: 'flex justify-between items-center mb-4 px-1',
        caption_label: 'text-sm font-semibold text-gray-800',
        nav: 'flex items-center gap-1 absolute right-3 top-4',
        nav_button: cn(
          'inline-flex items-center justify-center rounded-md h-8 w-8 text-gray-500',
          'hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 transition-all',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0'
        ),
        nav_button_previous: 'absolute left-0',
        nav_button_next: 'absolute right-0',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex gap-1 mb-3',
        head_cell:
          'text-xs font-medium text-gray-400 uppercase tracking-wider h-8 w-8 flex items-center justify-center',
        row: 'flex gap-1 mb-1',
        cell: cn(
          'relative h-8 w-8 p-0',
          '[&:has([aria-selected].day-range-start)]:bg-blue-100',
          '[&:has([aria-selected].day-range-end)]:bg-blue-100',
          '[&:has([aria-selected])]:rounded-none',
          'focus-within:relative focus-within:z-20'
        ),
        day: cn(
          'inline-flex items-center justify-center h-8 w-8 rounded-md font-medium text-sm text-gray-700',
          'hover:bg-blue-50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0',
          'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          'aria-selected:opacity-100'
        ),
        day_range_start:
          'bg-blue-600 text-white rounded-l-full hover:bg-blue-700 focus:ring-blue-600',
        day_range_end:
          'bg-blue-600 text-white rounded-r-full hover:bg-blue-700 focus:ring-blue-600',
        day_range_middle:
          'bg-blue-100 text-gray-900 hover:bg-blue-200 rounded-none',
        day_selected:
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 focus:ring-offset-0',
        day_today:
          'font-semibold text-blue-600 border border-blue-200 bg-blue-50',
        day_outside:
          'text-gray-300 aria-selected:text-gray-400 aria-selected:bg-gray-100 aria-selected:opacity-50',
        day_disabled: 'text-gray-200 cursor-not-allowed',
        day_hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
