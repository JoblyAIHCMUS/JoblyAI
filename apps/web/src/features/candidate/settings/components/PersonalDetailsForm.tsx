'use client';

import React from 'react';
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
import { Calendar } from 'lucide-react';
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
  <div className="w-64 inline-flex flex-col items-start gap-2">
    <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </Label>
    {children}
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
  } = useFormContext<PersonalDetailsFormData>();

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
            <div className="relative w-full">
              <Input
                type="date"
                {...register('dateOfBirth')}
                disabled={isSubmitting}
                className={cn(
                  'bg-primary text-primary border-primary font-["Be_Vietnam_Pro"] text-base pr-10',
                  errors.dateOfBirth && 'border-red-400'
                )}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-icon-primary pointer-events-none" />
            </div>
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
