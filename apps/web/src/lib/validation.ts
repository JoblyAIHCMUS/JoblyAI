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
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
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
