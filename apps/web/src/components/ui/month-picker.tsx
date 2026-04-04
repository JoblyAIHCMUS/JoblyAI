'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthPickerProps {
  value?: { from?: Date; to?: Date };
  onSelect: (range: { from?: Date; to?: Date }) => void;
  disabled?: boolean;
  isCurrentlyWorking?: boolean;
  onIsCurrentlyWorkingChange?: (value: boolean) => void;
}

export function MonthPicker({
  value,
  onSelect,
  disabled = false,
  isCurrentlyWorking = false,
  onIsCurrentlyWorkingChange,
}: MonthPickerProps) {
  // Year selector (current year + range)
  const currentYear = new Date().getFullYear();
  const [displayYear, setDisplayYear] = useState(
    value?.from?.getFullYear() || currentYear
  );

  // Get today's date (first of current month for month-level comparison)
  const today = new Date();
  const currentMonth = today.getMonth();

  // Check if a month is in the future
  const isFutureMonth = (year: number, month: number) => {
    if (year > currentYear) return true;
    if (year === currentYear && month > currentMonth) return true;
    return false;
  };

  // Check if a month is in the range
  const isInRange = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    if (!value?.from) return false;
    if (!value?.to) return date.getTime() === value.from.getTime();
    return date >= value.from && date <= value.to;
  };

  // Month abbreviations
  const monthLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Check if month is start or end of range
  const isRangeStart = (year: number, month: number) => {
    if (!value?.from) return false;
    return year === value.from.getFullYear() && month === value.from.getMonth();
  };

  const isRangeEnd = (year: number, month: number) => {
    if (!value?.to) return false;
    return year === value.to.getFullYear() && month === value.to.getMonth();
  };

  // Handle month selection
  const handleMonthSelect = (month: number) => {
    // Prevent selecting future months
    if (isFutureMonth(displayYear, month)) {
      return;
    }

    const selectedDate = new Date(displayYear, month, 1);

    if (!value?.from) {
      // First selection
      onSelect({ from: selectedDate, to: undefined });
    } else if (selectedDate < value.from) {
      // Selecting before start - swap
      onSelect({ from: selectedDate, to: value.from });
    } else {
      // Second selection or after start
      const newRange = { from: value.from, to: selectedDate };
      onSelect(newRange);

      // Auto-uncheck "currently working" if user selects a non-current month
      if (isCurrentlyWorking) {
        const isCurrentMonth =
          displayYear === currentYear && month === currentMonth;
        if (!isCurrentMonth) {
          onIsCurrentlyWorkingChange?.(false);
        }
      }
    }
  };

  return (
    <div className="w-80 space-y-4 p-4">
      {/* Year Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setDisplayYear(displayYear - 1)}
          disabled={disabled}
          className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous year"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 w-24 text-center">
          {displayYear}
        </h2>
        <button
          onClick={() => setDisplayYear(displayYear + 1)}
          disabled={disabled}
          className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next year"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Month Grid (3x4) */}
      <div className="grid grid-cols-3 gap-2.5">
        {monthLabels.map((label, monthIdx) => {
          const isStart = isRangeStart(displayYear, monthIdx);
          const isEnd = isRangeEnd(displayYear, monthIdx);
          const inRange = isInRange(displayYear, monthIdx);
          const isFuture = isFutureMonth(displayYear, monthIdx);

          return (
            <button
              key={label}
              onClick={() => handleMonthSelect(monthIdx)}
              disabled={disabled || isFuture}
              className={cn(
                'py-2.5 px-2 text-sm font-medium rounded-lg transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500',

                // Future months - disabled state
                isFuture &&
                  'opacity-40 cursor-not-allowed text-gray-400 border border-gray-200',

                // Regular enabled state
                !isFuture && 'hover:bg-blue-50 cursor-pointer',

                // Range styling
                isStart &&
                  'bg-blue-600 text-white rounded-l-full hover:bg-blue-700',
                isEnd &&
                  'bg-blue-600 text-white rounded-r-full hover:bg-blue-700',
                inRange &&
                  !isStart &&
                  !isEnd &&
                  'bg-blue-100 text-gray-900 hover:bg-blue-200',

                // Non-selected state
                !isStart &&
                  !isEnd &&
                  !inRange &&
                  !isFuture &&
                  'border border-gray-200 text-gray-700 hover:border-blue-300'
              )}
              title={
                isFuture
                  ? `${label} ${displayYear} - Future month`
                  : `${label} ${displayYear} - Click to ${
                      !value?.from
                        ? 'select start'
                        : !value?.to
                        ? 'select end'
                        : 'select'
                    }`
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Info text */}
      {value?.from && (
        <div className="text-xs text-gray-600 text-center pt-2">
          {new Date(
            value.from.getFullYear(),
            value.from.getMonth(),
            1
          ).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })}
          {isCurrentlyWorking
            ? ' – Present'
            : value?.to &&
              ` – ${new Date(
                value.to.getFullYear(),
                value.to.getMonth(),
                1
              ).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}`}
        </div>
      )}
    </div>
  );
}
