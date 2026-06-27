/* Copied from candidate/settings/components/FormField.tsx */
'use client';

import React, { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
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
  showPasswordToggle?: boolean;
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
  showPasswordToggle = false,
}: FormFieldProps) {
  const widthClasses = {
    full: 'w-full',
    sm: 'w-64',
    md: 'w-64',
  };

  return (
    <div
      className={cn(
        'inline-flex flex-col items-start gap-2 w-full',
        widthClasses[width]
      )}
    >
      <Label
        className="text-xs sm:text-sm md:text-base font-semibold leading-5"
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
        {type === 'password' && showPasswordToggle ? (
          <PasswordInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'placeholder:text-secondary text-xs sm:text-sm md:text-base',
              error && 'border-red-400'
            )}
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderColor: error
                ? 'var(--destructive)'
                : 'var(--border-primary)',
              fontFamily: 'var(--family-secondary)',
              fontSize: '0.875rem',
            }}
          />
        ) : (
          <>
            <Input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: error
                  ? 'var(--destructive)'
                  : 'var(--border-primary)',
                fontFamily: 'var(--family-secondary)',
                fontSize: '0.875rem',
              }}
              className={cn(
                'placeholder:text-secondary text-xs sm:text-sm md:text-base',
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
          </>
        )}
      </div>
      {error && (
        <span
          style={{
            color: 'var(--destructive)',
            fontFamily: 'var(--family-secondary)',
          }}
          className="text-xs sm:text-sm"
        >
          {error}
        </span>
      )}
    </div>
  );
}
