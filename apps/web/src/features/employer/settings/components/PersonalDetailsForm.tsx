'use client';

import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
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

export interface PersonalDetailsFormProps {
  disabled?: boolean;
}

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'] as const;

export function PersonalDetailsForm({
  disabled = false,
}: Readonly<PersonalDetailsFormProps>) {
  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useFormContext<PersonalDetailsFormData>();
  const isFieldDisabled = disabled || isSubmitting;
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
      <div className="font-['Lexend_Deca'] text-sm sm:text-base font-semibold leading-5 text-primary">
        Personal Details
      </div>

      <div className="flex flex-col justify-start items-start gap-4 sm:gap-5 md:gap-6 flex-1 w-full">
        {/* Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
          <div className="flex flex-col items-start gap-2 w-full">
            <Label className="font-['Lexend_Deca'] text-xs sm:text-sm md:text-base font-semibold leading-5 text-primary">
              First Name <span className="text-red-400 ml-1">*</span>
            </Label>
            <Input
              type="text"
              {...register('firstName')}
              placeholder="Enter first name"
              disabled={isFieldDisabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-xs sm:text-sm md:text-base w-full',
                errors.firstName && 'border-red-400'
              )}
            />
            {errors.firstName?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-xs sm:text-sm text-red-400">
                {errors.firstName.message.toString()}
              </span>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <Label className="font-['Lexend_Deca'] text-xs sm:text-sm md:text-base font-semibold leading-5 text-primary">
              Last Name <span className="text-red-400 ml-1">*</span>
            </Label>
            <Input
              type="text"
              {...register('lastName')}
              placeholder="Enter last name"
              disabled={isFieldDisabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-xs sm:text-sm md:text-base w-full',
                errors.lastName && 'border-red-400'
              )}
            />
            {errors.lastName?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-xs sm:text-sm text-red-400">
                {errors.lastName.message.toString()}
              </span>
            )}
          </div>
        </div>

        {/* Contact Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
          <div className="flex flex-col items-start gap-2 w-full">
            <Label className="font-['Lexend_Deca'] text-xs sm:text-sm md:text-base font-semibold leading-5 text-primary">
              Phone Number
            </Label>
            <Input
              type="tel"
              {...register('phoneNumber')}
              placeholder="+44 1245 572 135"
              disabled={isFieldDisabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary placeholder:font-normal font-["Be_Vietnam_Pro"] text-xs sm:text-sm md:text-base w-full',
                errors.phoneNumber && 'border-red-400'
              )}
            />
            {errors.phoneNumber?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-xs sm:text-sm text-red-400">
                {errors.phoneNumber.message.toString()}
              </span>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <Label className="font-['Lexend_Deca'] text-xs sm:text-sm md:text-base font-semibold leading-5 text-primary">
              Email
            </Label>
            <Input
              type="email"
              {...register('email')}
              placeholder="Enter email"
              disabled={true}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-xs sm:text-sm md:text-base w-full',
                errors.email && 'border-red-400'
              )}
            />
            <p className="font-['Be_Vietnam_Pro'] text-xs sm:text-sm text-secondary">
              Email cannot be changed. Contact support to update.
            </p>
          </div>
        </div>

        {/* Date of Birth & Gender Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
          <div className="flex flex-col items-start gap-2 w-full">
            <Label className="font-['Lexend_Deca'] text-xs sm:text-sm md:text-base font-semibold leading-5 text-primary">
              Date of Birth <span className="text-red-400 ml-1">*</span>
            </Label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <div className="relative w-full">
                <Input
                  type="date"
                  {...register('dateOfBirth')}
                  placeholder="YYYY-MM-DD"
                  disabled={isFieldDisabled}
                  className={cn(
                    'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-xs sm:text-sm md:text-base pr-10 w-full',
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
                    <CalendarIcon className="size-4 sm:size-5" />
                  </button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date > new Date() || date < new Date('1900-01-01')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.dateOfBirth?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">
                {errors.dateOfBirth.message.toString()}
              </span>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <Label className="font-['Lexend_Deca'] text-xs sm:text-sm md:text-base font-semibold leading-5 text-primary">
              Gender <span className="text-red-400 ml-1">*</span>
            </Label>
            <SelectGenderField disabled={isFieldDisabled} />
            {errors.gender?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-xs sm:text-sm text-red-400">
                {errors.gender.message.toString()}
              </span>
            )}
          </div>
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
              'w-full bg-primary text-primary border-primary font-["Be_Vietnam_Pro"] text-xs sm:text-sm md:text-base',
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
