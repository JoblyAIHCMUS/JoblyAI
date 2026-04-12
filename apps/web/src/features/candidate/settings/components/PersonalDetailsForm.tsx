'use client';

import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { type PersonalDetailsFormData } from '@/lib/validation';
import { GENDER_OPTIONS } from '../constants';

const FormField = ({
  label,
  error,
  required = false,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-start gap-2 flex-1 min-w-64 relative z-0">
    <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </Label>
    <div className="w-full">
      {children}
    </div>
    {error && (
      <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">
        {error}
      </span>
    )}
  </div>
);

export function PersonalDetailsForm() {
  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useFormContext<PersonalDetailsFormData>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dateOfBirth = watch('dateOfBirth');

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Format date in local timezone (YYYY-MM-DD) to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setValue('dateOfBirth', dateString);
      setIsDatePickerOpen(false);
    }
  };

  return (
    <>
      <div className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
        Personal Details
      </div>

      <div className="inline-flex flex-col justify-start items-start gap-6 flex-1">
        {/* Name Row */}
        <div className="inline-flex justify-start items-start gap-6 w-full">
          <FormField
            label="First Name"
            required
            error={errors.firstName?.message}
          >
            <Input
              type="text"
              {...register('firstName')}
              placeholder="Enter first name"
              disabled={isSubmitting}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                errors.firstName && 'border-red-400'
              )}
            />
          </FormField>

          <FormField
            label="Last Name"
            required
            error={errors.lastName?.message}
          >
            <Input
              type="text"
              {...register('lastName')}
              placeholder="Enter last name"
              disabled={isSubmitting}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                errors.lastName && 'border-red-400'
              )}
            />
          </FormField>
        </div>

        {/* Contact Row */}
        <div className="inline-flex justify-start items-start gap-6 w-full">
          <FormField label="Phone Number" error={errors.phoneNumber?.message}>
            <Input
              type="tel"
              {...register('phoneNumber')}
              placeholder="+44 1245 572 135"
              disabled={isSubmitting}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary placeholder:font-normal font-["Be_Vietnam_Pro"] text-base',
                errors.phoneNumber && 'border-red-400'
              )}
            />
          </FormField>

          <FormField label="Email">
            <div className="relative w-full">
              <Input
                type="email"
                {...register('email')}
                placeholder="Enter email"
                disabled={true}
                className={cn(
                  'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base cursor-not-allowed',
                  errors.email && 'border-red-400'
                )}
              />
              <p className="font-['Be_Vietnam_Pro'] text-xs text-secondary mt-1">
                Email cannot be changed. Contact support to update.
              </p>
            </div>
          </FormField>
        </div>

        {/* DOB and Gender Row */}
        <div className="inline-flex justify-start items-start gap-6 w-full">
          <FormField
            label="Date of Birth"
            required
            error={errors.dateOfBirth?.message}
          >
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <div className="relative w-full">
                <Input
                  type="date"
                  {...register('dateOfBirth')}
                  disabled={isSubmitting}
                  className={cn(
                    'bg-primary text-primary border-primary font-["Be_Vietnam_Pro"] text-base pr-10 w-full',
                    errors.dateOfBirth && 'border-red-400'
                  )}
                />
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-icon-primary hover:text-primary transition-colors cursor-pointer z-10"
                    onClick={() => setIsDatePickerOpen(true)}
                    aria-label="Open date picker"
                  >
                    <CalendarIcon className="size-5" />
                  </button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={
                    dateOfBirth ? new Date(dateOfBirth) : undefined
                  }
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date > new Date() || date < new Date('1900-01-01')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormField>

          <FormField label="Gender" required error={errors.gender?.message}>
            <SelectGenderField disabled={isSubmitting} />
          </FormField>
        </div>
      </div>
    </>
  );
}

function SelectGenderField({ disabled }: { disabled: boolean }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PersonalDetailsFormData>();

  return (
    <Controller
      name="gender"
      control={control}
      render={({ field }) => (
        <Select
          value={field.value || ''}
          onValueChange={field.onChange}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              'w-64 bg-primary text-primary border-primary font-["Be_Vietnam_Pro"] text-base',
              errors.gender && 'border-red-400'
            )}
          >
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {GENDER_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
