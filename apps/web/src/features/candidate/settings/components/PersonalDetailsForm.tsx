'use client';

import React from 'react';
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

export interface PersonalDetailsFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
}

export interface PersonalDetailsFormProps {
  data: PersonalDetailsFormData;
  onChange: (data: PersonalDetailsFormData) => void;
  errors?: Partial<Record<keyof PersonalDetailsFormData, string>>;
  disabled?: boolean;
}

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

export function PersonalDetailsForm({
  data,
  onChange,
  errors,
  disabled = false,
}: PersonalDetailsFormProps) {
  const handleChange = (field: keyof PersonalDetailsFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

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
              First Name
              <span className="text-red-400 ml-1">*</span>
            </Label>
            <Input
              type="text"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter first name"
              disabled={disabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                errors?.firstName && 'border-red-400'
              )}
            />
            {errors?.firstName && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">{errors.firstName}</span>
            )}
          </div>

          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Last Name
              <span className="text-red-400 ml-1">*</span>
            </Label>
            <Input
              type="text"
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Enter last name"
              disabled={disabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                errors?.lastName && 'border-red-400'
              )}
            />
            {errors?.lastName && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">{errors.lastName}</span>
            )}
          </div>
        </div>

        {/* Contact Row */}
        <div className="inline-flex justify-start items-start gap-6 w-full">
          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Phone Number
              <span className="text-red-400 ml-1">*</span>
            </Label>
            <Input
              type="tel"
              value={data.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="+44 1245 572 135"
              disabled={disabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                errors?.phoneNumber && 'border-red-400'
              )}
            />
            {errors?.phoneNumber && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">{errors.phoneNumber}</span>
            )}
          </div>

          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Email
              <span className="text-red-400 ml-1">*</span>
            </Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email"
              disabled={disabled}
              className={cn(
                'bg-primary text-primary border-primary placeholder:text-secondary font-["Be_Vietnam_Pro"] text-base',
                errors?.email && 'border-red-400'
              )}
            />
            {errors?.email && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">{errors.email}</span>
            )}
          </div>
        </div>

        {/* DOB and Gender Row */}
        <div className="inline-flex justify-start items-start gap-6 w-full">
          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Date of Birth
              <span className="text-red-400 ml-1">*</span>
            </Label>
            <div className="relative w-full">
              <Input
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                disabled={disabled}
                className={cn(
                  'bg-primary text-primary border-primary font-["Be_Vietnam_Pro"] text-base pr-10',
                  errors?.dateOfBirth && 'border-red-400'
                )}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-icon-primary pointer-events-none" />
            </div>
            {errors?.dateOfBirth && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">{errors.dateOfBirth}</span>
            )}
          </div>

          <div className="w-64 inline-flex flex-col items-start gap-2">
            <Label className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
              Gender
              <span className="text-red-400 ml-1">*</span>
            </Label>
            <Select value={data.gender} onValueChange={(val) => handleChange('gender', val)} disabled={disabled}>
              <SelectTrigger
                className={cn(
                  'bg-primary text-primary border-primary font-["Be_Vietnam_Pro"] text-base',
                  errors?.gender && 'border-red-400'
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
            {errors?.gender && (
              <span className="font-['Be_Vietnam_Pro'] text-sm text-red-400">{errors.gender}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
