'use client';

import React, { useState } from 'react';
import { MonthPicker } from '@/components/ui/month-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange: (range: { from?: Date; to?: Date } | undefined) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  label?: string;
  isCurrentlyWorking?: boolean;
  onIsCurrentlyWorkingChange?: (value: boolean) => void;
  checkboxLabel?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = '',
  error,
  disabled = false,
  label,
  isCurrentlyWorking = false,
  onIsCurrentlyWorkingChange,
  checkboxLabel = 'I am currently working here',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  // Format as month/year (perfect for CV)
  const fromText = value?.from ? format(value.from, 'MMM yyyy') : null;
  const toText = value?.to && !isCurrentlyWorking ? format(value.to, 'MMM yyyy') : null;

  const displayText =
    fromText && toText
      ? `${fromText} – ${toText}`
      : fromText
        ? isCurrentlyWorking
          ? `${fromText} – Present`
          : fromText
        : placeholder;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(undefined);
    onIsCurrentlyWorkingChange?.(false);
  };

  const handleCurrentlyWorkingChange = () => {
    const newValue = !isCurrentlyWorking;
    onIsCurrentlyWorkingChange?.(newValue);
    
    // When enabling "currently working", set end date to today
    if (newValue && value?.from) {
      const today = new Date();
      today.setDate(1); // Set to first of current month
      onChange({
        from: value.from,
        to: today,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'w-full inline-flex items-center justify-between px-3.5 py-2.5 text-sm font-medium',
              'border rounded-lg transition-all duration-200',
              'hover:border-gray-400 focus:outline-none',
              'focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              error
                ? 'border-red-400 bg-red-50 text-red-900'
                : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
              disabled && 'opacity-50 cursor-not-allowed hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <span className="flex items-center gap-2.5 truncate min-w-0">
              <CalendarIcon
                size={18}
                className={cn(
                  'flex-shrink-0',
                  value?.from ? 'text-blue-600' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'truncate',
                  value?.from ? 'text-gray-900' : 'text-gray-500'
                )}
              >
                {displayText}
              </span>
            </span>
            {value?.from && (
              <X
                size={16}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 ml-2"
                onClick={handleClear}
              />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="space-y-4 p-4">
            <MonthPicker
              value={value}
              onSelect={(range) => {
                onChange(range);
                if (range?.from && range?.to) {
                  setOpen(false);
                }
              }}
              disabled={disabled}
              isCurrentlyWorking={isCurrentlyWorking}
              onIsCurrentlyWorkingChange={onIsCurrentlyWorkingChange}
            />

            {/* Currently Working Checkbox */}
            <div className="pt-4 border-t border-gray-200 flex items-center gap-2.5 px-1">
              <input
                type="checkbox"
                id="currently-working"
                checked={isCurrentlyWorking}
                onChange={handleCurrentlyWorkingChange}
                disabled={!value?.from || disabled}
                className="w-4 h-4 rounded cursor-pointer accent-blue-600"
              />
              <label
                htmlFor="currently-working"
                className={cn(
                  'text-sm font-medium cursor-pointer select-none',
                  isCurrentlyWorking && value?.from
                    ? 'text-gray-900'
                    : 'text-gray-600',
                  (!value?.from || disabled) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {checkboxLabel}
              </label>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Error message */}
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
