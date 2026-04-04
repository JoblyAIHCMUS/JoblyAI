import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateInputProps {
  value: string | null | undefined;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

export function DateInput({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  error,
  label,
  required = false,
}: DateInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    if (dateString) {
      const date = new Date(dateString);
      onChange(date);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="body-body-1-regular text-secondary">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <input
          type="date"
          value={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'text-tertiary break-words border rounded p-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-accent-primary',
            error && 'border-red-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-icon-primary pointer-events-none" />
      </div>
      {error && (
        <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
