'use client';

import { DatePickerInput } from '@mantine/dates';

interface DateInputProps {
  value: Date | string | null | undefined;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  inputClassNames?: string;
}

export function DateInput({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  error,
  label,
  required = false,
  inputClassNames = '',
}: DateInputProps) {
  // Convert string or Date value to Date for Mantine DatePickerInput
  let dateValue: Date | null = null;
  if (value instanceof Date) {
    dateValue = value;
  } else if (typeof value === 'string') {
    dateValue = new Date(value);
  }

  const handleDateChange = (date: Date | null | string) => {
    // Handle different input types
    if (date === null) {
      onChange(null);
    } else if (date instanceof Date) {
      onChange(date);
    } else if (typeof date === 'string') {
      // Mantine might return a string, convert to Date
      onChange(date ? new Date(date) : null);
    }
  };

  // Dynamically set text color based on whether a date is selected
  const inputClassName = `w-full ${
    dateValue ? 'text-primary' : 'text-tertiary'
  } text-base break-words border rounded p-2 focus:outline-none focus:ring-2 placeholder-gray-900 ${inputClassNames} ${
    error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:ring-accent-primary'
  }`;

  return (
    <DatePickerInput
      label={label}
      placeholder={placeholder}
      value={dateValue}
      onChange={handleDateChange}
      disabled={disabled}
      error={error}
      required={required}
      valueFormat="MMM DD, YYYY"
      maxDate={new Date()}
      styles={{
        input: {
          fontFamily: 'inherit',
          fontFeatureSettings: 'inherit',
          fontVariationSettings: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          lineHeight: 'inherit',
          letterSpacing: 'inherit',
        },
      }}
      classNames={{
        input: inputClassName,
        label: 'text-tertiary mb-1 block text-base',
      }}
    />
  );
}
