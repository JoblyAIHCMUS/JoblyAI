import { z } from 'zod';

/**
 * Zod schema for personal details form validation
 */
export const PersonalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  phoneNumber: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || /^\+?\d+$/.test(val),
      'Phone number must contain only digits or start with + followed by digits'
    ),
  email: z.string().optional(), // Email is read-only, not editable
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
});

export type PersonalDetailsFormData = z.infer<typeof PersonalDetailsSchema>;

/**
 * Format a date to YYYY-MM-DD string format
 * Safe handling for Date objects and strings
 */
export function formatDateToYYYYMMDD(
  date: Date | string | null | undefined
): string {
  if (!date) return '';

  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date:', date);
      return '';
    }
    return parsedDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(
  dateString: string | null | undefined
): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

/**
 * Zod schema for education form validation with real-time validation
 */
export const EducationSchema = z.object({
  school: z.string().min(1, 'School name is required').trim(),
  degree: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.length >= 2,
      'Degree must be at least 2 characters'
    ),
  fieldOfStudy: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.length >= 2,
      'Field of study must be at least 2 characters'
    ),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .refine(
      (data) => data.from !== undefined && (!data.to || data.from <= data.to),
      {
        message: 'Start date must be before end date',
        path: ['dateRange'],
      }
    ),
  grade: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || /^([0-4](\.\d{1,2})?|4(\.0{1,2})?)$/.test(val),
      'Grade must be between 0 and 4 (GPA format)'
    ),
  description: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.length <= 500,
      'Description must not exceed 500 characters'
    ),
});

export type EducationFormData = z.infer<typeof EducationSchema>;

/**
 * Zod schema for experience form validation with real-time validation
 */
export const ExperienceSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').trim(),
  companyName: z.string().min(1, 'Company name is required').trim(),
  type: z.string().min(1, 'Employment type is required'),
  location: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.length >= 2,
      'Location must be at least 2 characters'
    ),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .refine(
      (data) => data.from !== undefined && (!data.to || data.from <= data.to),
      {
        message: 'Start date is required and end date must be after start date',
        path: ['dateRange', 'from'],
      }
    ),
  description: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.length <= 500,
      'Description must not exceed 500 characters'
    ),
});

export type ExperienceFormData = z.infer<typeof ExperienceSchema>;
