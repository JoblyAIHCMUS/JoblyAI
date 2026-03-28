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
  type?: 'text' | 'email' | 'tel' | 'date';
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
    <div className={cn('inline-flex flex-col items-start gap-2', widthClasses[width])}>
      <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
        {label}
        {isRequired && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <div className="relative w-full">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
            error && 'border-red-400',
            icon && 'pr-10'
          )}
        />
        {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-icon-primary flex-shrink-0">{icon}</div>}
      </div>
      {error && <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">{error}</span>}
    </div>
  );
}
