/* Copied from candidate/settings/components/FormField.tsx */
'use client';

import React, { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  isRequired?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'password';
  error?: string;
  icon?: ReactNode;
  disabled?: boolean;
  width?: 'full' | 'sm' | 'md';
}

export function FormField({
  label,
  isRequired = false,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  icon,
  disabled = false,
  width = 'md',
}: FormFieldProps) {
  const widthClasses = {
    full: 'w-full',
    sm: 'w-64',
    md: 'w-64',
  };

  return (
    <div
      className={cn(
        'inline-flex flex-col items-start gap-2',
        widthClasses[width]
      )}
    >
      <Label
        className="text-base font-semibold leading-5"
        style={{
          fontFamily: 'var(--family-primary)',
          color: 'var(--text-primary)',
        }}
      >
        {label}
        {isRequired && (
          <span style={{ color: 'var(--destructive)' }} className="ml-1">
            *
          </span>
        )}
      </Label>
      <div className="relative w-full">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderColor: error ? 'var(--destructive)' : 'var(--border-primary)',
            fontFamily: 'var(--family-secondary)',
            fontSize: '1rem',
          }}
          className={cn(
            'placeholder:text-secondary',
            error && 'border-red-400',
            icon && 'pr-10'
          )}
        />
        {icon && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--icon-primary)' }}
          >
            {icon}
          </div>
        )}
      </div>
      {error && (
        <span
          style={{
            color: 'var(--destructive)',
            fontFamily: 'var(--family-secondary)',
          }}
          className="text-sm"
        >
          {error}
        </span>
      )}
    </div>
  );
}
