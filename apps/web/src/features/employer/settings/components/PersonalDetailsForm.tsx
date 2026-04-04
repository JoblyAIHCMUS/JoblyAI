/* Copied from candidate/settings/components/PersonalDetailsForm.tsx */
'use client';

import React from 'react';
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
import { Calendar, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type PersonalDetailsFormData } from '@/lib/validation';

export interface PersonalDetailsFormProps {
  disabled?: boolean;
}

const genderOptions = ['MALE', 'FEMALE', 'OTHER'];

export function PersonalDetailsForm({
  disabled = false,
}: Readonly<PersonalDetailsFormProps>) {
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = useFormContext<PersonalDetailsFormData>();
  const isFieldDisabled = disabled || isSubmitting;

  return (
    <>
      <div className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
        Personal Details
      </div>

      <div className="inline-flex flex-col justify-start items-start gap-6 flex-1">
        {/* Name Row */}
        <div className="inline-flex justify-start items-start gap-6 w-full">
          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              First Name <span className="text-red-400 ml-1">*</span>
            </Label>
            <Input
              type="text"
              {...register('firstName')}
              placeholder="Enter first name"
              disabled={isFieldDisabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                errors.firstName && 'border-red-400'
              )}
            />
            {errors.firstName?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">
                {errors.firstName.message.toString()}
              </span>
            )}
          </div>

          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Last Name <span className="text-red-400 ml-1">*</span>
            </Label>
            <Input
              type="text"
              {...register('lastName')}
              placeholder="Enter last name"
              disabled={isFieldDisabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                errors.lastName && 'border-red-400'
              )}
            />
            {errors.lastName?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">
                {errors.lastName.message.toString()}
              </span>
            )}
          </div>
        </div>

        {/* Contact Row */}
        <div className="inline-flex justify-start items-start gap-6 w-full">
          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Phone Number
            </Label>
            <Input
              type="tel"
              {...register('phoneNumber')}
              placeholder="+44 1245 572 135"
              disabled={isFieldDisabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary placeholder:font-normal font-["Be_Vietnam_Pro"] text-base',
                errors.phoneNumber && 'border-red-400'
              )}
            />
            {errors.phoneNumber?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">
                {errors.phoneNumber.message.toString()}
              </span>
            )}
          </div>

          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Email <span className="text-red-400 ml-1">*</span>
            </Label>
            <Input
              type="email"
              {...register('email')}
              placeholder="Enter email"
              disabled={isFieldDisabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                errors.email && 'border-red-400'
              )}
            />
            {errors.email?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">
                {errors.email.message.toString()}
              </span>
            )}
          </div>
        </div>

        {/* Date of Birth & Gender Row */}
        <div className="inline-flex justify-start items-start gap-6 w-full">
          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Date of Birth <span className="text-red-400 ml-1">*</span>
            </Label>
            <div className="relative w-full">
              <Input
                type="date"
                {...register('dateOfBirth')}
                placeholder="YYYY-MM-DD"
                disabled={isFieldDisabled}
                className={cn(
                  'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                  errors.dateOfBirth && 'border-red-400'
                )}
              />
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 text-icon-primary"
                size={20}
              />
            </div>
            {errors.dateOfBirth?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">
                {errors.dateOfBirth.message.toString()}
              </span>
            )}
          </div>

          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Gender <span className="text-red-400 ml-1">*</span>
            </Label>
            <div className="relative w-full">
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={isFieldDisabled}
                  >
                    <SelectTrigger
                      className={cn(
                        'bg-primary text-primary border-primary font-["Be_Vietnam_Pro"] text-base pr-10',
                        errors.gender && 'border-red-400'
                      )}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <User2 className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-icon-primary pointer-events-none" />
            </div>
            {errors.gender?.message && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">
                {errors.gender.message.toString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
