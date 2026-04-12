'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import { SubmitApplicationSchema } from '@/lib/validation';

type SubmitApplicationFormInput = z.input<typeof SubmitApplicationSchema>;

interface ApplicationFormProps {
  register: UseFormRegister<SubmitApplicationFormInput>;
  errors: FieldErrors<SubmitApplicationFormInput>;
  charCount: number;
}

export function ApplicationForm({
  register,
  errors,
  charCount,
}: ApplicationFormProps) {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-950">
          Current of previous job title
        </label>
        <input
          {...register('jobTitle')}
          type="text"
          placeholder="What's your current or previous job title?"
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.jobTitle && (
          <p className="mt-1 text-xs text-red-600">{errors.jobTitle.message}</p>
        )}
      </div>

      <div className="border-b border-slate-200" />

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-950">
          Additional information/Cover letter
        </label>
        <textarea
          {...register('coverLetter')}
          placeholder="Add a cover letter or anything else you want to share"
          maxLength={1000}
          rows={5}
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
          <span>Maximum 1000 characters</span>
          <span>{charCount} / 1000</span>
        </div>
        {errors.coverLetter && (
          <p className="mt-1 text-xs text-red-600">
            {errors.coverLetter.message}
          </p>
        )}
      </div>
    </>
  );
}